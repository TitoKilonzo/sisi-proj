import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useApp, WARDS, STATUSES, clean, kes } from "./store.jsx";
import { Icon, Hero, Pill, Bar, ProjectCard } from "./ui.jsx";

export function Home() {
  const { state } = useApp();
  const ps = state.projects;
  const done = ps.filter((p) => p.status === "Completed").length;
  const budget = ps.reduce((n, p) => n + p.budget, 0);
  const votes = ps.reduce((n, p) => n + p.votes, 0);
  const top = [...ps].sort((a, b) => b.votes - a.votes).slice(0, 3);
  const stats = [[ps.length, "Projects tracked"], [done, "Completed"], [kes(budget), "Total budget"], [votes, "Resident votes"]];
  const feats = [["chart", "Track projects", "Live status and progress for every county project."], ["vote", "Vote on priorities", "Back the projects that matter in your ward."], ["chat", "Give feedback", "Report issues and follow them to resolution."], ["shield", "Role based portals", "Residents, ward officers and admins each get the tools they need."]];
  return (
    <>
      <Hero title="Your ward. Your projects. Your say." text="See what the county is building in Kilimani and Dagoretti North, vote on priorities and follow every shilling.">
        <p className="flex gap-3 flex-wrap mt-4">
          <Link className="inline-flex items-center gap-2 bg-orange text-ink font-bold px-6 py-3 rounded-full no-underline shadow-[0_6px_16px_rgba(242,106,27,0.35)] hover:-translate-y-0.5 hover:bg-orange-light transition-all" to="/projects">View projects <Icon n="arrow" size={18} /></Link>
          <Link className="inline-flex items-center gap-2 bg-blue text-ink font-bold px-6 py-3 rounded-full no-underline shadow-[0_6px_16px_rgba(142,214,240,0.5)] hover:-translate-y-0.5 transition-all" to="/participate">Take part</Link>
        </p>
      </Hero>
      <section className="max-w-[1120px] w-[92%] mx-auto grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 -mt-[60px] relative">
        {stats.map(([v, l]) => <div key={l} className="bg-white rounded-[14px] shadow-[0_10px_30px_rgba(15,42,58,0.10)] px-5 py-[18px] border-b-4 border-orange"><strong className="block text-2xl">{v}</strong><span className="text-muted text-sm">{l}</span></div>)}
      </section>
      <section className="max-w-[1120px] w-[92%] mx-auto grid gap-5 grid-cols-[repeat(auto-fit,minmax(260px,1fr))] py-9">
        {feats.map(([i, t, d]) => <article className="bg-white border-2 border-blue border-t-[5px] border-t-orange rounded-[14px] p-[22px] shadow-[0_10px_30px_rgba(15,42,58,0.10)] transition-transform duration-200 hover:-translate-y-1" key={t}><span className="text-orange-dark"><Icon n={i} size={30} /></span><h3 className="mt-2 mb-1">{t}</h3><p className="text-muted">{d}</p></article>)}
      </section>
      <section className="bg-gradient-to-b from-blue-light to-white py-[30px] pb-2.5">
        <div className="max-w-[1120px] w-[92%] mx-auto">
          <h2 className="text-2xl mb-4">Most backed projects</h2>
          <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(260px,1fr))] py-4">{top.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
        </div>
      </section>
    </>
  );
}

export function Projects() {
  const { state } = useApp();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("votes");
  const ward = sp.get("ward") || "";
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return state.projects
      .filter((p) => (!ward || p.ward === ward) && (!status || p.status === status) && (!t || (p.title + p.sector).toLowerCase().includes(t)))
      .sort((a, b) => (sort === "votes" ? b.votes - a.votes : sort === "progress" ? b.progress - a.progress : b.budget - a.budget));
  }, [state.projects, q, status, ward, sort]);
  return (
    <>
      <Hero title="Projects" text="Search, filter and open any project to vote and comment." />
      <section className="max-w-[1120px] w-[92%] mx-auto">
        <div className="flex gap-3 flex-wrap pt-[34px]">
          <label className="relative flex-[1_1_220px] m-0">
            <span className="absolute left-3 top-[15px] text-muted"><Icon n="search" size={18} /></span>
            <input className="block w-full px-3 py-[11px] pl-[38px] m-0 text-ink border-2 border-ink rounded-[10px] bg-white" value={q} onChange={(e) => setQ(e.target.value.slice(0, 60))} placeholder="Search projects" aria-label="Search projects" />
          </label>
          <select className="w-auto m-0 px-3 py-[11px] text-ink border-2 border-ink rounded-[10px] bg-white" aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          <select className="w-auto m-0 px-3 py-[11px] text-ink border-2 border-ink rounded-[10px] bg-white" aria-label="Ward" value={ward} onChange={(e) => setSp(e.target.value ? { ward: e.target.value } : {})}><option value="">All wards</option>{WARDS.map((w) => <option key={w}>{w}</option>)}</select>
          <select className="w-auto m-0 px-3 py-[11px] text-ink border-2 border-ink rounded-[10px] bg-white" aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}><option value="votes">Most votes</option><option value="progress">Most progress</option><option value="budget">Highest budget</option></select>
        </div>
        <p className="text-muted mt-4" role="status">{list.length} project{list.length === 1 ? "" : "s"}</p>
        <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(260px,1fr))] py-4">{list.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
        {!list.length && <p className="text-center p-10 text-muted">No projects match your filters.</p>}
      </section>
    </>
  );
}

export function ProjectDetail() {
  const { id } = useParams();
  const { state, dispatch, user } = useApp();
  const [text, setText] = useState("");
  const p = state.projects.find((x) => String(x.id) === id);
  if (!p) return <Navigate to="/projects" replace />;
  const voted = user && (state.voted[user.id] || []).includes(p.id);
  const name = (uid) => state.users.find((u) => u.id === uid)?.name || "Resident";
  return (
    <>
      <Hero title={p.title} text={p.desc}><p className="mt-2"><Pill status={p.status} /> <span className="text-muted">{p.ward} &middot; {p.sector}</span></p></Hero>
      <section className="max-w-[1120px] w-[92%] mx-auto grid gap-10 grid-cols-1 md:grid-cols-2 py-10">
        <div>
          <h2 className="text-2xl mb-3">Progress</h2>
          <Bar value={p.progress} />
          <p>{p.progress}% complete. Budget {kes(p.budget)}.</p>
          <p><strong>{p.votes}</strong> residents back this project.</p>
          {user ? <button className="inline-flex items-center gap-2 bg-orange text-ink font-bold px-6 py-3 rounded-full cursor-pointer shadow-[0_6px_16px_rgba(242,106,27,0.35)] hover:-translate-y-0.5 hover:bg-orange-light transition-all disabled:opacity-60 disabled:cursor-default disabled:transform-none" disabled={voted} onClick={() => dispatch({ type: "vote", id: p.id })}>{voted ? "You voted" : "Vote for this project"}</button>
            : <Link className="inline-flex items-center gap-2 bg-orange text-ink font-bold px-6 py-3 rounded-full no-underline shadow-[0_6px_16px_rgba(242,106,27,0.35)] hover:-translate-y-0.5 hover:bg-orange-light transition-all" to="/signin">Sign in to vote</Link>}
        </div>
        <div>
          <h2 className="text-2xl mb-3">Comments</h2>
          {p.comments.length === 0 && <p className="text-muted">No comments yet.</p>}
          <ul className="list-none p-0 mb-5 grid gap-3.5">{p.comments.map((c) => <li key={c.id} className="bg-blue-light rounded-[10px] px-3.5 py-3"><strong>{name(c.userId)}</strong> <small className="text-muted">{c.date}</small><p className="mt-1 mb-0">{c.text}</p></li>)}</ul>
          {user ? (
            <form onSubmit={(e) => { e.preventDefault(); dispatch({ type: "comment", id: p.id, text }); setText(""); }}>
              <label className="block font-semibold mb-3.5">Add a comment<textarea className="block w-full mt-1.5 px-3 py-[11px] text-ink border-2 border-ink rounded-[10px] bg-white" rows="3" maxLength={400} value={text} onChange={(e) => setText(e.target.value)} required /></label>
              <button className="inline-flex items-center gap-2 bg-orange text-ink font-bold px-[18px] py-2 text-sm rounded-full cursor-pointer shadow-[0_6px_16px_rgba(242,106,27,0.35)] hover:-translate-y-0.5 hover:bg-orange-light transition-all" type="submit">Post</button>
            </form>
          ) : <p className="text-muted">Sign in to comment.</p>}
        </div>
      </section>
    </>
  );
}

export function Wards() {
  const { state } = useApp();
  const info = { Kilimani: "Dense residential and commercial ward under drainage and road pressure.", Kawangware: "The largest population in the sub county, led by water and market upgrades.", Kileleshwa: "A green suburb prioritising footpaths, lighting and waste collection.", Gatina: "Mixed settlement with sewer extension and school access works.", Kabiria: "A fast growing ward focused on roads and community health." };
  return (
    <>
      <Hero title="Wards" text="Dagoretti North has five wards. Open a ward to see its projects." />
      <section className="max-w-[1120px] w-[92%] mx-auto grid gap-5 grid-cols-[repeat(auto-fit,minmax(260px,1fr))] py-9">
        {WARDS.map((w) => {
          const ps = state.projects.filter((p) => p.ward === w);
          const fb = state.feedback.filter((f) => f.ward === w).length;
          return (
            <article className="bg-white border-2 border-blue border-t-[5px] border-t-orange rounded-[14px] p-[22px] shadow-[0_10px_30px_rgba(15,42,58,0.10)] transition-transform duration-200 hover:-translate-y-1" key={w}>
              <span className="text-orange-dark"><Icon n="map" size={30} /></span>
              <h3 className="mt-2 mb-1">{w}</h3>
              <p>{info[w]}</p>
              <p className="text-muted text-sm">{ps.length} projects &middot; {fb} feedback items</p>
              <Link className="inline-flex items-center gap-2 bg-blue text-ink font-bold px-[18px] py-2 text-sm rounded-full no-underline shadow-[0_6px_16px_rgba(142,214,240,0.5)] hover:-translate-y-0.5 transition-all" to={`/projects?ward=${w}`}>View projects</Link>
            </article>
          );
        })}
      </section>
    </>
  );
}

export function Participate() {
  const { dispatch, user } = useApp();
  const [ward, setWard] = useState("");
  const [text, setText] = useState("");
  const [hp, setHp] = useState("");
  const [msg, setMsg] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    if (hp) return setMsg({ ok: true, t: "Thank you." });
    if (!WARDS.includes(ward) || clean(text, 1000).length < 10) return setMsg({ ok: false, t: "Choose a ward and write at least 10 characters." });
    dispatch({ type: "feedback", ward, text });
    setText(""); setWard("");
    setMsg({ ok: true, t: "Feedback received. Track it from your portal." });
  };
  return (
    <>
      <Hero title="Participate" text="Report an issue or share an idea. Ward officers review every submission." />
      <section className="max-w-[520px] w-[92%] mx-auto py-10">
        <form onSubmit={submit} noValidate>
          <label className="block font-semibold mb-3.5">Ward<select className="block w-full mt-1.5 px-3 py-[11px] text-ink border-2 border-ink rounded-[10px] bg-white" value={ward} onChange={(e) => setWard(e.target.value)} required><option value="">Choose a ward</option>{WARDS.map((w) => <option key={w}>{w}</option>)}</select></label>
          <label className="block font-semibold mb-3.5">Your message<textarea className="block w-full mt-1.5 px-3 py-[11px] text-ink border-2 border-ink rounded-[10px] bg-white" rows="6" maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} required /></label>
          <input className="absolute -left-[9999px]" tabIndex="-1" autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} />
          <button className="inline-flex items-center gap-2 bg-orange text-ink font-bold px-6 py-3 rounded-full cursor-pointer shadow-[0_6px_16px_rgba(242,106,27,0.35)] hover:-translate-y-0.5 hover:bg-orange-light transition-all" type="submit">Send feedback</button>
          {msg && <p className={`font-semibold mt-3 ${msg.ok ? "text-[#0a5d2c]" : "text-[#aa1111]"}`} role="status">{msg.t}</p>}
          {!user && <p className="text-muted mt-3">You are not signed in. <Link to="/signin" className="text-orange-dark hover:underline">Sign in</Link> to track your feedback.</p>}
        </form>
      </section>
    </>
  );
}

export function About() {
  const items = [["CIDP", "The County Integrated Development Plan sets five year priorities for the county."], ["CADP", "The County Annual Development Plan turns those priorities into yearly funded projects."], ["CBEF", "The County Budget and Economic Forum gives residents a voice in budget decisions."]];
  return (
    <>
      <Hero title="About Sisi" text="A civic platform that makes county work visible and participation simple." />
      <section className="max-w-[1120px] w-[92%] mx-auto grid gap-5 grid-cols-[repeat(auto-fit,minmax(260px,1fr))] py-9">
        {items.map(([t, d]) => <article className="bg-white border-2 border-blue border-t-[5px] border-t-orange rounded-[14px] p-[22px] shadow-[0_10px_30px_rgba(15,42,58,0.10)] transition-transform duration-200 hover:-translate-y-1" key={t}><span className="text-orange-dark"><Icon n="doc" size={30} /></span><h3 className="mt-2 mb-1">{t}</h3><p className="text-muted">{d}</p></article>)}
      </section>
    </>
  );
}
