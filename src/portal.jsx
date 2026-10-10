import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp, WARDS, FB_STATES, clean, kes, hashPw } from "./store.jsx";
import { Icon, Pill, Bar } from "./ui.jsx";
import { INPUT, LABEL, BTN, BTN_SM, BTN_GHOST } from "./cls.js";

const NAV = {
  resident: [["/portal", "Overview", "chart"], ["/portal/votes", "My votes", "vote"], ["/portal/feedback", "My feedback", "chat"], ["/portal/profile", "Profile", "user"]],
  officer: [["/portal", "Overview", "chart"], ["/portal/feedback", "Feedback queue", "chat"], ["/portal/progress", "Project progress", "trend"], ["/portal/profile", "Profile", "user"]],
  admin: [["/portal", "Overview", "chart"], ["/portal/feedback", "Feedback queue", "chat"], ["/portal/progress", "Project progress", "trend"], ["/portal/new", "Add project", "plus"], ["/portal/users", "Users", "users"], ["/portal/profile", "Profile", "user"]]
};
const ROLE_LABEL = { resident: "Resident", officer: "Ward officer", admin: "Administrator" };
const initials = (n) => n.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();

export function PortalShell() {
  const { user, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const items = NAV[user.role];
  const title = (items.find(([to]) => to === loc.pathname) || items[0])[1];
  useEffect(() => {
    const k = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  const link = ({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold no-underline transition-colors ${isActive ? "bg-orange text-ink" : "text-white/80 hover:bg-white/10 hover:text-white"}`;
  return (
    <div className="min-h-screen bg-[#f3f8fb] md:grid md:grid-cols-[264px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-30 w-[264px] flex flex-col bg-ink text-white p-4 transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`} aria-label="Portal navigation">
        <Link to="/portal" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-2 py-3 font-extrabold text-xl text-white no-underline"><img src="./favicon.svg" alt="" width="34" height="34" />Sisi</Link>
        <div className="mx-2 mb-4 mt-1 px-3 py-2 rounded-xl bg-white/10 text-sm"><span className="text-white/60">Signed in as</span><br /><strong>{ROLE_LABEL[user.role]}</strong></div>
        <nav className="flex-1 grid content-start gap-1">
          {items.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === "/portal"} className={link} onClick={() => setOpen(false)}><Icon n={icon} size={20} />{label}</NavLink>
          ))}
        </nav>
        <div className="grid gap-1 border-t border-white/15 pt-3">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-white/80 no-underline hover:bg-white/10 hover:text-white"><Icon n="home" size={20} />Back to website</Link>
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-white/80 bg-transparent border-0 cursor-pointer text-left hover:bg-white/10 hover:text-white" onClick={() => { dispatch({ type: "logout" }); nav("/"); }}><Icon n="logout" size={20} />Sign out</button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-20 bg-ink/50 md:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      <div className="min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 h-16 flex items-center justify-between gap-3 px-4 md:px-8 bg-white/90 backdrop-blur border-b border-blue">
          <div className="flex items-center gap-3">
            <button className="md:hidden border-2 border-ink rounded-[10px] p-1.5 bg-transparent cursor-pointer text-ink" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><Icon n="menu" /></button>
            <h1 className="text-xl font-extrabold m-0">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className={BTN_GHOST + " hidden sm:inline-flex no-underline"}><Icon n="home" size={16} />Website</Link>
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-orange text-ink font-extrabold" aria-hidden="true">{initials(user.name)}</span>
              <span className="hidden sm:block leading-tight"><strong className="block text-sm">{user.name}</strong><small className="text-muted">{user.email}</small></span>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8 animate-fade-in motion-reduce:animate-none max-w-[1180px] w-full"><Outlet /></main>
      </div>
    </div>
  );
}

const Panel = ({ title, action, children, className = "" }) => (
  <section className={`bg-white rounded-2xl border border-blue/70 shadow-[0_4px_18px_rgba(15,42,58,0.06)] p-5 ${className}`}>
    {(title || action) && <div className="flex items-center justify-between gap-3 mb-4"><h2 className="text-lg font-extrabold m-0">{title}</h2>{action}</div>}
    {children}
  </section>
);
const Kpi = ({ icon, label, value }) => (
  <div className="bg-white rounded-2xl border border-blue/70 shadow-[0_4px_18px_rgba(15,42,58,0.06)] p-5 flex items-center gap-4">
    <span className="grid place-items-center w-12 h-12 rounded-xl bg-blue-light text-orange-dark"><Icon n={icon} size={24} /></span>
    <div><div className="text-2xl font-extrabold leading-tight">{value}</div><div className="text-sm text-muted">{label}</div></div>
  </div>
);
const Empty = ({ children }) => <p className="text-muted py-6 text-center">{children}</p>;
const Msg = ({ m }) => m ? <p className={`font-semibold mt-3 ${m.ok ? "text-[#0a5d2c]" : "text-[#aa1111]"}`} role="status">{m.t}</p> : null;
const Link2 = ({ to, children }) => <Link to={to} className="text-orange-dark font-bold no-underline hover:underline">{children}</Link>;

export function Overview() {
  const { state, user } = useApp();
  const ps = state.projects;
  const myVotes = state.voted[user.id] || [];
  const myFb = state.feedback.filter((f) => f.userId === user.id);
  const open = state.feedback.filter((f) => f.status !== "Resolved");
  const hr = new Date().getHours();
  const greet = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const staff = user.role !== "resident";
  const kpis = user.role === "resident"
    ? [["vote", "Votes cast", myVotes.length], ["chat", "Feedback sent", myFb.length], ["shield", "Resolved", myFb.filter((f) => f.status === "Resolved").length], ["trend", "Projects ongoing", ps.filter((p) => p.status === "Ongoing").length]]
    : user.role === "officer"
      ? [["chat", "Open feedback", open.length], ["trend", "Ongoing projects", ps.filter((p) => p.status === "Ongoing").length], ["chart", "Average progress", Math.round(ps.reduce((n, p) => n + p.progress, 0) / Math.max(1, ps.length)) + "%"], ["vote", "Total votes", ps.reduce((n, p) => n + p.votes, 0)]]
      : [["users", "Users", state.users.length], ["doc", "Projects", ps.length], ["chat", "Open feedback", open.length], ["chart", "Total budget", kes(ps.reduce((n, p) => n + p.budget, 0))]];
  const byWard = WARDS.map((w) => ({ w, v: ps.filter((p) => p.ward === w).reduce((n, p) => n + p.votes, 0) }));
  const max = Math.max(1, ...byWard.map((x) => x.v));
  const counts = ["Planned", "Ongoing", "Completed"].map((s) => [s, ps.filter((p) => p.status === s).length]);
  const toBack = [...ps].filter((p) => !myVotes.includes(p.id) && p.status !== "Completed").sort((a, b) => b.votes - a.votes).slice(0, 4);
  const who = (id) => state.users.find((u) => u.id === id)?.name || "Visitor";
  return (
    <div className="grid gap-6">
      <div><h2 className="text-2xl font-extrabold m-0">{greet}, {user.name.split(" ")[0]}</h2><p className="text-muted m-0">{new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div>
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">{kpis.map(([i, l, v]) => <Kpi key={l} icon={i} label={l} value={v} />)}</div>
      <div className="grid gap-6 lg:grid-cols-2">
        {staff ? (
          <>
            <Panel title="Votes by ward">
              <div className="grid gap-3">{byWard.map(({ w, v }) => (
                <div key={w}><div className="flex justify-between text-sm font-semibold"><span>{w}</span><span>{v}</span></div><Bar value={Math.round((v / max) * 100)} /></div>
              ))}</div>
            </Panel>
            <Panel title="Project status">
              <div className="flex h-4 rounded-full overflow-hidden mb-4 bg-blue-light">
                {counts.map(([s, n], i) => <i key={s} className={["bg-blue", "bg-orange", "bg-ink"][i]} style={{ width: (n / Math.max(1, ps.length)) * 100 + "%" }} />)}
              </div>
              <ul className="grid gap-2 list-none p-0 m-0">{counts.map(([s, n], i) => (
                <li key={s} className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${["bg-blue", "bg-orange", "bg-ink"][i]}`} />{s}<strong className="ml-auto">{n}</strong></li>
              ))}</ul>
            </Panel>
            <Panel title="Awaiting action" action={<Link2 to="/portal/feedback">Open queue</Link2>} className="lg:col-span-2">
              {open.length === 0 ? <Empty>All feedback is resolved.</Empty> : (
                <ul className="grid gap-3 list-none p-0 m-0">{open.slice(0, 4).map((f) => (
                  <li key={f.id} className="flex items-start justify-between gap-3 border-b border-blue/60 pb-3"><div><strong>{f.ward}</strong> <small className="text-muted">by {who(f.userId)}, {f.date}</small><p className="m-0 text-sm">{f.text}</p></div><Pill status={f.status} /></li>
                ))}</ul>
              )}
            </Panel>
          </>
        ) : (
          <>
            <Panel title="Projects to back" action={<Link2 to="/projects">Browse all</Link2>}>
              {toBack.length === 0 ? <Empty>You have backed every active project.</Empty> : (
                <ul className="grid gap-3 list-none p-0 m-0">{toBack.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3"><div><Link to={`/projects/${p.id}`} className="font-bold text-ink no-underline hover:text-orange-dark">{p.title}</Link><div className="text-sm text-muted">{p.ward} &middot; {p.votes} votes</div></div><Pill status={p.status} /></li>
                ))}</ul>
              )}
            </Panel>
            <Panel title="Recent feedback" action={<Link2 to="/portal/feedback">Send feedback</Link2>}>
              {myFb.length === 0 ? <Empty>You have not sent any feedback yet.</Empty> : (
                <ul className="grid gap-3 list-none p-0 m-0">{myFb.slice(0, 3).map((f) => (
                  <li key={f.id} className="flex items-start justify-between gap-3"><div><strong>{f.ward}</strong><p className="m-0 text-sm">{f.text}</p></div><Pill status={f.status} /></li>
                ))}</ul>
              )}
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}

export function Votes() {
  const { state, user } = useApp();
  const list = state.projects.filter((p) => (state.voted[user.id] || []).includes(p.id));
  return (
    <Panel title="Projects you back">
      {list.length === 0 ? <Empty>You have not voted yet. <Link2 to="/projects">Browse projects</Link2></Empty> : (
        <ul className="grid gap-4 list-none p-0 m-0">{list.map((p) => (
          <li key={p.id} className="border-b border-blue/60 pb-4"><div className="flex items-center justify-between gap-3"><Link to={`/projects/${p.id}`} className="font-bold text-ink no-underline hover:text-orange-dark">{p.title}</Link><Pill status={p.status} /></div><Bar value={p.progress} /><small className="text-muted">{p.ward} &middot; {p.progress}% complete &middot; {p.votes} votes</small></li>
        ))}</ul>
      )}
    </Panel>
  );
}

export function Feedback() {
  const { state, dispatch, user } = useApp();
  const staff = user.role !== "resident";
  const [flt, setFlt] = useState("");
  const [ward, setWard] = useState("");
  const [text, setText] = useState("");
  const [msg, setMsg] = useState(null);
  const who = (id) => state.users.find((u) => u.id === id)?.name || "Visitor";
  const list = state.feedback.filter((f) => (staff || f.userId === user.id) && (!flt || f.status === flt));
  const send = (e) => {
    e.preventDefault();
    if (!WARDS.includes(ward) || clean(text, 1000).length < 10) return setMsg({ ok: false, t: "Choose a ward and write at least 10 characters." });
    dispatch({ type: "feedback", ward, text });
    setWard(""); setText(""); setMsg({ ok: true, t: "Feedback sent." });
  };
  return (
    <div className="grid gap-6">
      {!staff && (
        <Panel title="Send new feedback">
          <form onSubmit={send} noValidate className="max-w-xl">
            <label className={LABEL}>Ward<select className={INPUT} value={ward} onChange={(e) => setWard(e.target.value)}><option value="">Choose a ward</option>{WARDS.map((w) => <option key={w}>{w}</option>)}</select></label>
            <label className={LABEL}>Message<textarea className={INPUT} rows="4" maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} /></label>
            <button className={BTN_SM} type="submit">Send feedback</button>
            <Msg m={msg} />
          </form>
        </Panel>
      )}
      <Panel title={staff ? "Feedback queue" : "Your feedback"} action={
        <div className="flex gap-1.5 flex-wrap">{["", ...FB_STATES].map((s) => (
          <button key={s || "all"} onClick={() => setFlt(s)} className={`px-3 py-1 rounded-full text-sm font-semibold cursor-pointer border-0 ${flt === s ? "bg-orange text-ink" : "bg-blue-light text-ink hover:bg-blue/60"}`}>{s || "All"}</button>
        ))}</div>}>
        {list.length === 0 ? <Empty>No feedback in this view.</Empty> : (
          <ul className="grid gap-4 list-none p-0 m-0">{list.map((f) => (
            <li key={f.id} className="border border-blue/70 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap"><div><strong>{f.ward}</strong> <small className="text-muted">{staff ? `by ${who(f.userId)}, ` : ""}{f.date}</small></div><Pill status={f.status} /></div>
              <p className="my-2">{f.text}</p>
              {staff && <label className="flex items-center gap-2 text-sm font-semibold">Set status
                <select className="border-2 border-ink/80 rounded-lg px-2 py-1 bg-white" value={f.status} onChange={(e) => dispatch({ type: "fbStatus", id: f.id, status: e.target.value })}>{FB_STATES.map((s) => <option key={s}>{s}</option>)}</select></label>}
            </li>
          ))}</ul>
        )}
      </Panel>
    </div>
  );
}

export function Progress() {
  const { state, dispatch } = useApp();
  const [q, setQ] = useState("");
  const list = state.projects.filter((p) => !q || (p.title + p.ward).toLowerCase().includes(q.toLowerCase()));
  return (
    <Panel title="Update project progress" action={<input className="border-2 border-ink/80 rounded-full px-4 py-1.5 text-sm bg-white" placeholder="Search" aria-label="Search projects" maxLength={60} value={q} onChange={(e) => setQ(e.target.value)} />}>
      {list.length === 0 ? <Empty>No projects match.</Empty> : (
        <ul className="grid gap-4 list-none p-0 m-0">{list.map((p) => (
          <li key={p.id} className="border border-blue/70 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap"><div><strong>{p.title}</strong><div className="text-sm text-muted">{p.ward} &middot; {kes(p.budget)}</div></div><Pill status={p.status} /></div>
            <Bar value={p.progress} />
            <label className="flex items-center gap-3 text-sm font-semibold">{p.progress}%
              <input className="flex-1 accent-orange" type="range" min="0" max="100" step="1" value={p.progress} aria-label={`Progress for ${p.title}`} onChange={(e) => dispatch({ type: "progress", id: p.id, progress: e.target.value })} />
            </label>
          </li>
        ))}</ul>
      )}
    </Panel>
  );
}

export function NewProject() {
  const { dispatch } = useApp();
  const empty = { title: "", ward: "", sector: "", budget: "", desc: "" };
  const [f, setF] = useState(empty);
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    if (clean(f.title, 90).length < 4 || !WARDS.includes(f.ward)) return setMsg({ ok: false, t: "Add a title of 4 or more characters and choose a ward." });
    dispatch({ type: "addProject", ...f });
    setF(empty); setMsg({ ok: true, t: "Project added. It is now visible on the website." });
  };
  return (
    <Panel title="Add a project">
      <form onSubmit={submit} noValidate className="grid gap-x-6 md:grid-cols-2 max-w-3xl">
        <label className={LABEL + " md:col-span-2"}>Title<input className={INPUT} maxLength={90} value={f.title} onChange={set("title")} /></label>
        <label className={LABEL}>Ward<select className={INPUT} value={f.ward} onChange={set("ward")}><option value="">Choose</option>{WARDS.map((w) => <option key={w}>{w}</option>)}</select></label>
        <label className={LABEL}>Sector<input className={INPUT} maxLength={40} value={f.sector} onChange={set("sector")} /></label>
        <label className={LABEL}>Budget (KES)<input className={INPUT} type="number" min="0" value={f.budget} onChange={set("budget")} /></label>
        <label className={LABEL + " md:col-span-2"}>Description<textarea className={INPUT} rows="4" maxLength={400} value={f.desc} onChange={set("desc")} /></label>
        <div className="md:col-span-2"><button className={BTN} type="submit">Add project</button><Msg m={msg} /></div>
      </form>
    </Panel>
  );
}

export function Users() {
  const { state, dispatch, user } = useApp();
  return (
    <Panel title={`Users (${state.users.length})`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead><tr className="bg-blue-light"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th></tr></thead>
          <tbody>{state.users.map((u) => (
            <tr key={u.id} className="border-b border-blue/60">
              <td className="p-3 font-semibold">{u.name}</td><td className="p-3 text-muted">{u.email}</td>
              <td className="p-3">{u.id === user.id ? <span>{ROLE_LABEL[u.role]} (you)</span> : (
                <select className="border-2 border-ink/80 rounded-lg px-2 py-1 bg-white" aria-label={`Role for ${u.name}`} value={u.role} onChange={(e) => dispatch({ type: "setRole", id: u.id, role: e.target.value })}>
                  {Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Panel>
  );
}

export function Profile() {
  const { user, dispatch } = useApp();
  const [f, setF] = useState({ cur: "", next: "" });
  const [msg, setMsg] = useState(null);
  const change = async (e) => {
    e.preventDefault();
    if (f.next.length < 10) return setMsg({ ok: false, t: "Use a new password of at least 10 characters." });
    const { hash } = await hashPw(f.cur, user.pw.salt);
    if (hash !== user.pw.hash) return setMsg({ ok: false, t: "Your current password is incorrect." });
    dispatch({ type: "setPw", pw: await hashPw(f.next) });
    setF({ cur: "", next: "" }); setMsg({ ok: true, t: "Password updated." });
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Your details">
        <dl className="grid grid-cols-[110px_1fr] gap-y-3 m-0">
          <dt className="text-muted">Name</dt><dd className="m-0 font-semibold">{user.name}</dd>
          <dt className="text-muted">Email</dt><dd className="m-0 font-semibold break-all">{user.email}</dd>
          <dt className="text-muted">Role</dt><dd className="m-0 font-semibold">{ROLE_LABEL[user.role]}</dd>
        </dl>
      </Panel>
      <Panel title="Change password">
        <form onSubmit={change} noValidate>
          <label className={LABEL}>Current password<input className={INPUT} type="password" autoComplete="current-password" value={f.cur} onChange={(e) => setF({ ...f, cur: e.target.value })} /></label>
          <label className={LABEL}>New password (10 characters or more)<input className={INPUT} type="password" autoComplete="new-password" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} /></label>
          <button className={BTN_SM} type="submit">Update password</button>
          <Msg m={msg} />
        </form>
      </Panel>
    </div>
  );
}
