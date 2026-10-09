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
      <section className="max-w-[1120px] w-[92%] mx-auto">
        <div className="flex gap-2 flex-wrap my-[30px] border-b-2 border-blue pb-2.5" role="tablist">
          {tabs.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={`border-0 px-[18px] py-[9px] rounded-full font-semibold text-[0.95rem] text-ink cursor-pointer transition-colors ${tab === t ? "bg-orange" : "bg-blue-light hover:bg-blue"}`} onClick={() => setTab(t)}>{t}</button>)}
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
    <div className="grid gap-10 grid-cols-1 md:grid-cols-2 py-10">
      <div>
        <h2 className="text-2xl mb-3">Projects you back</h2>
        {voted.length === 0 && <p className="text-muted">You have not voted yet. <Link to="/projects" className="text-orange-dark hover:underline">Browse projects</Link></p>}
        <ul className="list-none p-0 mb-5 grid gap-3.5">{voted.map((p) => <li key={p.id} className="flex justify-between items-center gap-2.5 flex-wrap py-3 border-b border-blue"><Link to={`/projects/${p.id}`} className="text-orange-dark hover:underline">{p.title}</Link><Pill status={p.status} /></li>)}</ul>
      </div>
      <div>
        <h2 className="text-2xl mb-3">Your feedback</h2>
        {mine.length === 0 && <p className="text-muted">Nothing submitted. <Link to="/participate" className="text-orange-dark hover:underline">Share feedback</Link></p>}
        <ul className="list-none p-0 mb-5 grid gap-3.5">{mine.map((f) => <li key={f.id} className="py-3 border-b border-blue"><div className="flex justify-between items-center gap-2.5 flex-wrap"><strong>{f.ward}</strong><Pill status={f.status} /></div><p className="mt-1">{f.text}</p></li>)}</ul>
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
      <label className="flex items-center gap-2.5 flex-wrap mb-4">Show<select className="w-auto m-0 px-3 py-[11px] text-ink border-2 border-ink rounded-[10px] bg-white" value={flt} onChange={(e) => setFlt(e.target.value)}><option value="">All</option>{FB_STATES.map((s) => <option key={s}>{s}</option>)}</select></label>
      <ul className="list-none p-0 mb-5 grid gap-3.5">
        {list.map((f) => (
          <li key={f.id} className="bg-white border-2 border-blue border-t-[5px] border-t-orange rounded-[14px] p-[18px] shadow-[0_10px_30px_rgba(15,42,58,0.10)]">
            <div className="flex justify-between items-center gap-2.5 flex-wrap"><strong>{f.ward}</strong><small className="text-muted">{f.date}</small></div>
            <p className="my-2">{f.text}</p>
            <label className="flex items-center gap-2.5 flex-wrap">Status<select className="w-auto m-0 px-3 py-[11px] text-ink border-2 border-ink rounded-[10px] bg-white" value={f.status} onChange={(e) => dispatch({ type: "fbStatus", id: f.id, status: e.target.value })}>{FB_STATES.map((s) => <option key={s}>{s}</option>)}</select></label>
          </li>
        ))}
      </ul>
      {!list.length && <p className="text-center p-10 text-muted">No feedback in this view.</p>}
    </>
  );
}

function Progress() {
  const { state, dispatch } = useApp();
  return (
    <ul className="list-none p-0 mb-5 grid gap-3.5">
      {state.projects.map((p) => (
        <li key={p.id} className="bg-white border-2 border-blue border-t-[5px] border-t-orange rounded-[14px] p-[18px] shadow-[0_10px_30px_rgba(15,42,58,0.10)]">
          <div className="flex justify-between items-center gap-2.5 flex-wrap"><strong>{p.title}</strong><Pill status={p.status} /></div>
          <Bar value={p.progress} />
          <label className="flex items-center gap-2.5 flex-wrap">Progress {p.progress}%
            <input className="p-0 border-0 flex-[1_1_200px] accent-orange" type="range" min="0" max="100" step="1" value={p.progress} onChange={(e) => dispatch({ type: "progress", id: p.id, progress: e.target.value })} />
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 my-5">{tiles.map(([v, l]) => <div key={l} className="bg-white rounded-[14px] shadow-[0_10px_30px_rgba(15,42,58,0.10)] px-5 py-[18px] border-b-4 border-orange"><strong className="block text-2xl">{v}</strong><span className="text-muted text-sm">{l}</span></div>)}</div>
      <h2 className="text-2xl mb-4">Votes by ward</h2>
      <div className="flex gap-4 items-end h-[250px] py-2.5 border-b-2 border-ink">
        {byWard.map(({ w, v }) => (
          <div className="flex-1 flex flex-col items-center justify-end gap-1" key={w}><span className="text-sm font-semibold">{v}</span><i className="w-[70%] bg-gradient-to-b from-orange-light to-orange rounded-t-lg transition-[height] duration-500" style={{ height: Math.max(4, (v / max) * 180) + "px" }} /><small className="text-xs text-muted">{w}</small></div>
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
    <form className="max-w-[520px]" onSubmit={submit} noValidate>
      <label className="block font-semibold mb-3.5">Title<input className="block w-full mt-1.5 px-3 py-[11px] text-ink border-2 border-ink rounded-[10px] bg-white" maxLength={90} value={f.title} onChange={set("title")} /></label>
      <label className="block font-semibold mb-3.5">Ward<select className="block w-full mt-1.5 px-3 py-[11px] text-ink border-2 border-ink rounded-[10px] bg-white" value={f.ward} onChange={set("ward")}><option value="">Choose</option>{WARDS.map((w) => <option key={w}>{w}</option>)}</select></label>
      <label className="block font-semibold mb-3.5">Sector<input className="block w-full mt-1.5 px-3 py-[11px] text-ink border-2 border-ink rounded-[10px] bg-white" maxLength={40} value={f.sector} onChange={set("sector")} /></label>
      <label className="block font-semibold mb-3.5">Budget (KES)<input className="block w-full mt-1.5 px-3 py-[11px] text-ink border-2 border-ink rounded-[10px] bg-white" type="number" min="0" value={f.budget} onChange={set("budget")} /></label>
      <label className="block font-semibold mb-3.5">Description<textarea className="block w-full mt-1.5 px-3 py-[11px] text-ink border-2 border-ink rounded-[10px] bg-white" rows="4" maxLength={400} value={f.desc} onChange={set("desc")} /></label>
      <button className="inline-flex items-center gap-2 bg-orange text-ink font-bold px-6 py-3 rounded-full cursor-pointer shadow-[0_6px_16px_rgba(242,106,27,0.35)] hover:-translate-y-0.5 hover:bg-orange-light transition-all" type="submit">Add project</button>
      {msg && <p className="font-semibold mt-3 text-[#0a5d2c]" role="status">{msg}</p>}
    </form>
  );
}

function Users() {
  const { state } = useApp();
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead><tr><th className="text-left p-3 border-b border-blue bg-blue-light">Name</th><th className="text-left p-3 border-b border-blue bg-blue-light">Email</th><th className="text-left p-3 border-b border-blue bg-blue-light">Role</th></tr></thead>
        <tbody>{state.users.map((u) => <tr key={u.id}><td className="p-3 border-b border-blue"><Icon n="user" size={16} /> {u.name}</td><td className="p-3 border-b border-blue">{u.email}</td><td className="p-3 border-b border-blue">{u.role}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
