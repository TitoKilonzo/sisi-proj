import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const KEY = "sisi_v2";
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
    { id: 1, name: "Amina Wanjiru", email: "resident@sisi.demo", role: "resident" },
    { id: 2, name: "James Otieno", email: "officer@sisi.demo", role: "officer" },
    { id: 3, name: "Grace Mutua", email: "admin@sisi.demo", role: "admin" }
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
