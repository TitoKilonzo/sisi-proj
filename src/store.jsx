import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const KEY = "sisi_v3";
export const WARDS = ["Kilimani", "Kawangware", "Kileleshwa", "Gatina", "Kabiria"];
export const STATUSES = ["Planned", "Ongoing", "Completed"];
export const FB_STATES = ["New", "In review", "Resolved"];

export const clean = (v, max = 500) => String(v ?? "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max);
export const kes = (n) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
// Client side demo hashing (PBKDF2 via WebCrypto). A real backend must hash passwords server side.
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
export async function hashPw(pw, salt = hex(crypto.getRandomValues(new Uint8Array(16)))) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 150000 }, key, 256);
  return { salt, hash: hex(bits) };
}
const statusFor = (p) => (p >= 100 ? "Completed" : p > 0 ? "Ongoing" : "Planned");

const P = (id, title, ward, sector, progress, budget, votes, desc) => ({
  id, title, ward, sector, progress, budget, votes, desc, status: statusFor(progress), comments: []
});

// Sample data. Replace with API calls when a backend exists.
const seed = () => ({
  users: [
    { id: 1, name: "Amina Wanjiru", email: "amina.wanjiru@sisi.local", role: "resident", pw: {"salt": "c6bb072de5b34a6f48f2c3272a5af1be", "hash": "e6415ffc7ce5cd598e8ac19aa2b2dede1aa4e1694c6f7651ead4a87ff17e3259"} },
    { id: 2, name: "James Otieno", email: "james.otieno@sisi.local", role: "officer", pw: {"salt": "410d92840bd28bbec82ff94924d37ca8", "hash": "4e9d8859eecf6f1bb7abf846574cf0fd85e2350c65bee386cdabe502c343e5b8"} },
    { id: 3, name: "Grace Mutua", email: "grace.mutua@sisi.local", role: "admin", pw: {"salt": "239f85fb4d8364114167789b4d5a493c", "hash": "4b96129d849873f4f6b068b4397b135b6655683f96a6e001957a15a2446edd0c"} }
  ],
  projects: [
    P(1, "Kilimani drainage rehabilitation", "Kilimani", "Roads and drainage", 64, 42000000, 128, "Desilting and reconstruction of storm drains along the main estate roads to end seasonal flooding."),
    P(2, "Kawangware market stalls upgrade", "Kawangware", "Trade", 0, 18500000, 212, "Modern, covered stalls with water points and waste handling for more than 300 traders."),
    P(3, "Kileleshwa street lighting", "Kileleshwa", "Energy", 100, 9600000, 87, "Solar assisted LED lighting on 14 streets to improve evening safety."),
    P(4, "Gatina sewer line extension", "Gatina", "Water and sanitation", 41, 27300000, 96, "Extension of the trunk sewer to connect 1,200 households."),
    P(5, "Kabiria dispensary expansion", "Kabiria", "Health", 0, 31000000, 175, "A maternity wing, a lab and a pharmacy at the Kabiria dispensary."),
    P(6, "Kawangware water kiosks", "Kawangware", "Water and sanitation", 100, 7200000, 143, "Eight metered water kiosks serving informal settlements."),
    P(7, "Kilimani footpaths and cycle lanes", "Kilimani", "Roads and drainage", 22, 15800000, 64, "Safe walking and cycling routes linking schools and transport stops."),
    P(8, "Gatina primary school classrooms", "Gatina", "Education", 78, 12400000, 59, "Eight new classrooms and a science lab.")
  ],
  feedback: [
    { id: 1, userId: 1, ward: "Kilimani", text: "The drain on Argwings Kodhek Road overflows after every heavy rain.", status: "In review", date: "2026-09-28" }
  ],
  voted: {},
  session: null
});

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.projects) && Array.isArray(s.users) && Array.isArray(s.feedback)) return s;
  } catch (e) { /* fall through to seed */ }
  return seed();
}

const roleOf = (s) => s.users.find((u) => u.id === s.session)?.role;
const staff = (s) => ["officer", "admin"].includes(roleOf(s));

function reducer(s, a) {
  switch (a.type) {
    case "login": return { ...s, session: a.id };
    case "logout": return { ...s, session: null };
    case "register": return { ...s, users: [...s.users, a.user], session: a.user.id };
    case "vote": {
      if (!s.session) return s;
      const mine = s.voted[s.session] || [];
      if (mine.includes(a.id)) return s;
      return {
        ...s,
        voted: { ...s.voted, [s.session]: [...mine, a.id] },
        projects: s.projects.map((p) => (p.id === a.id ? { ...p, votes: p.votes + 1 } : p))
      };
    }
    case "comment": {
      if (!s.session) return s;
      const text = clean(a.text, 400);
      if (!text) return s;
      const c = { id: Date.now(), userId: s.session, text, date: new Date().toISOString().slice(0, 10) };
      return { ...s, projects: s.projects.map((p) => (p.id === a.id ? { ...p, comments: [...p.comments, c] } : p)) };
    }
    case "feedback": {
      const text = clean(a.text, 1000);
      if (!text || !WARDS.includes(a.ward)) return s;
      const f = { id: Date.now(), userId: s.session, ward: a.ward, text, status: "New", date: new Date().toISOString().slice(0, 10) };
      return { ...s, feedback: [f, ...s.feedback] };
    }
    case "fbStatus":
      if (!staff(s) || !FB_STATES.includes(a.status)) return s;
      return { ...s, feedback: s.feedback.map((f) => (f.id === a.id ? { ...f, status: a.status } : f)) };
    case "progress": {
      if (!staff(s)) return s;
      const pr = Math.max(0, Math.min(100, Number(a.progress) || 0));
      return { ...s, projects: s.projects.map((p) => (p.id === a.id ? { ...p, progress: pr, status: statusFor(pr) } : p)) };
    }
    case "addProject": {
      if (roleOf(s) !== "admin" || !WARDS.includes(a.ward)) return s;
      const title = clean(a.title, 90);
      if (!title) return s;
      const p = P(Date.now(), title, a.ward, clean(a.sector, 40) || "General", 0, Math.max(0, Number(a.budget) || 0), 0, clean(a.desc, 400));
      return { ...s, projects: [p, ...s.projects] };
    }
    case "setRole": {
      if (roleOf(s) !== "admin" || a.id === s.session || !["resident", "officer", "admin"].includes(a.role)) return s;
      return { ...s, users: s.users.map((u) => (u.id === a.id ? { ...u, role: a.role } : u)) };
    }
    case "setPw":
      if (!s.session || !a.pw?.salt || !a.pw?.hash) return s;
      return { ...s, users: s.users.map((u) => (u.id === s.session ? { ...u, pw: a.pw } : u)) };
    default: return s;
  }
}

const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }, [state]);
  const user = useMemo(() => state.users.find((u) => u.id === state.session) || null, [state]);
  return <Ctx.Provider value={{ state, dispatch, user }}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
