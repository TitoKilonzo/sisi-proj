import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp, WARDS, FB_STATES, clean, kes } from "./store.jsx";
import { Hero, Pill, Bar, Icon } from "./ui.jsx";

const TABS = {
  resident: ["My activity"],
  officer: ["Feedback queue", "Project progress"],
  admin: ["Overview", "Feedback queue", "Project progress", "Add project", "Users"]
};

export function Portal() {
  const { user } = useApp();
  const tabs = TABS[user.role];
  const [tab, setTab] = useState(tabs[0]);
  const views = { "My activity": Resident, "Feedback queue": Queue, "Project progress": Progress, Overview, "Add project": AddProject, Users };
  const View = views[tab];
  return (
    <>
      <Hero title={`Welcome, ${user.name.split(" ")[0]}`} text={`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} portal`} />
      <section className="wrap">
        <div className="tabs" role="tablist">
          {tabs.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}
        </div>
        <View />
      </section>
    </>
  );
}

function Resident() {
  const { state, user } = useApp();
  const voted = state.projects.filter((p) => (state.voted[user.id] || []).includes(p.id));
  const mine = state.feedback.filter((f) => f.userId === user.id);
  return (
    <div className="two">
      <div>
        <h2>Projects you back</h2>
        {voted.length === 0 && <p className="muted">You have not voted yet. <Link to="/projects">Browse projects</Link></p>}
        <ul className="plain">{voted.map((p) => <li key={p.id} className="row line"><Link to={`/projects/${p.id}`}>{p.title}</Link><Pill status={p.status} /></li>)}</ul>
      </div>
      <div>
        <h2>Your feedback</h2>
        {mine.length === 0 && <p className="muted">Nothing submitted. <Link to="/participate">Share feedback</Link></p>}
        <ul className="plain">{mine.map((f) => <li key={f.id} className="line"><div className="row"><strong>{f.ward}</strong><Pill status={f.status} /></div><p>{f.text}</p></li>)}</ul>
      </div>
    </div>
  );
}

function Queue() {
  const { state, dispatch } = useApp();
  const [flt, setFlt] = useState("");
  const list = state.feedback.filter((f) => !flt || f.status === flt);
  return (
    <>
      <label className="inline">Show<select value={flt} onChange={(e) => setFlt(e.target.value)}><option value="">All</option>{FB_STATES.map((s) => <option key={s}>{s}</option>)}</select></label>
      <ul className="plain">
        {list.map((f) => (
          <li key={f.id} className="card line">
            <div className="row"><strong>{f.ward}</strong><small className="muted">{f.date}</small></div>
            <p>{f.text}</p>
            <label className="inline">Status<select value={f.status} onChange={(e) => dispatch({ type: "fbStatus", id: f.id, status: e.target.value })}>{FB_STATES.map((s) => <option key={s}>{s}</option>)}</select></label>
          </li>
        ))}
      </ul>
      {!list.length && <p className="empty">No feedback in this view.</p>}
    </>
  );
}

function Progress() {
  const { state, dispatch } = useApp();
  return (
    <ul className="plain">
      {state.projects.map((p) => (
        <li key={p.id} className="card line">
          <div className="row"><strong>{p.title}</strong><Pill status={p.status} /></div>
          <Bar value={p.progress} />
          <label className="inline">Progress {p.progress}%
            <input type="range" min="0" max="100" step="1" value={p.progress} onChange={(e) => dispatch({ type: "progress", id: p.id, progress: e.target.value })} />
          </label>
        </li>
      ))}
    </ul>
  );
}

function Overview() {
  const { state } = useApp();
  const byWard = WARDS.map((w) => ({ w, v: state.projects.filter((p) => p.ward === w).reduce((n, p) => n + p.votes, 0) }));
  const max = Math.max(1, ...byWard.map((x) => x.v));
  const open = state.feedback.filter((f) => f.status !== "Resolved").length;
  const tiles = [[state.users.length, "Users"], [state.projects.length, "Projects"], [open, "Open feedback"], [kes(state.projects.reduce((n, p) => n + p.budget, 0)), "Budget"]];
  return (
    <>
      <div className="stats flat">{tiles.map(([v, l]) => <div key={l}><strong>{v}</strong><span>{l}</span></div>)}</div>
      <h2>Votes by ward</h2>
      <div className="chart">
        {byWard.map(({ w, v }) => (
          <div className="col" key={w}><span>{v}</span><i style={{ height: Math.max(4, (v / max) * 180) + "px" }} /><small>{w}</small></div>
        ))}
      </div>
    </>
  );
}

function AddProject() {
  const { dispatch } = useApp();
  const empty = { title: "", ward: "", sector: "", budget: "", desc: "" };
  const [f, setF] = useState(empty);
  const [msg, setMsg] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    if (clean(f.title, 90).length < 4 || !WARDS.includes(f.ward)) return setMsg("Add a title and choose a ward.");
    dispatch({ type: "addProject", ...f });
    setF(empty); setMsg("Project added.");
  };
  return (
    <form className="narrow-l" onSubmit={submit} noValidate>
      <label>Title<input maxLength={90} value={f.title} onChange={set("title")} /></label>
      <label>Ward<select value={f.ward} onChange={set("ward")}><option value="">Choose</option>{WARDS.map((w) => <option key={w}>{w}</option>)}</select></label>
      <label>Sector<input maxLength={40} value={f.sector} onChange={set("sector")} /></label>
      <label>Budget (KES)<input type="number" min="0" value={f.budget} onChange={set("budget")} /></label>
      <label>Description<textarea rows="4" maxLength={400} value={f.desc} onChange={set("desc")} /></label>
      <button className="btn" type="submit">Add project</button>
      {msg && <p className="msg ok" role="status">{msg}</p>}
    </form>
  );
}

function Users() {
  const { state } = useApp();
  return (
    <div className="scroll">
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>{state.users.map((u) => <tr key={u.id}><td><Icon n="user" size={16} /> {u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
