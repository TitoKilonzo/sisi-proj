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
        <p className="actions"><Link className="btn" to="/projects">View projects <Icon n="arrow" size={18} /></Link> <Link className="btn alt" to="/participate">Take part</Link></p>
      </Hero>
      <section className="wrap stats">{stats.map(([v, l]) => <div key={l}><strong>{v}</strong><span>{l}</span></div>)}</section>
      <section className="wrap grid">{feats.map(([i, t, d]) => <article className="card" key={t}><Icon n={i} size={30} /><h3>{t}</h3><p>{d}</p></article>)}</section>
      <section className="band"><div className="wrap"><h2>Most backed projects</h2><div className="grid">{top.map((p) => <ProjectCard key={p.id} p={p} />)}</div></div></section>
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
      <section className="wrap">
        <div className="filters">
          <label className="search"><Icon n="search" size={18} /><input value={q} onChange={(e) => setQ(e.target.value.slice(0, 60))} placeholder="Search projects" aria-label="Search projects" /></label>
          <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          <select aria-label="Ward" value={ward} onChange={(e) => setSp(e.target.value ? { ward: e.target.value } : {})}><option value="">All wards</option>{WARDS.map((w) => <option key={w}>{w}</option>)}</select>
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}><option value="votes">Most votes</option><option value="progress">Most progress</option><option value="budget">Highest budget</option></select>
        </div>
        <p className="muted" role="status">{list.length} project{list.length === 1 ? "" : "s"}</p>
        <div className="grid">{list.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
        {!list.length && <p className="empty">No projects match your filters.</p>}
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
      <Hero title={p.title} text={p.desc}><p><Pill status={p.status} /> <span className="muted">{p.ward} &middot; {p.sector}</span></p></Hero>
      <section className="wrap two">
        <div>
          <h2>Progress</h2><Bar value={p.progress} /><p>{p.progress}% complete. Budget {kes(p.budget)}.</p>
          <p><strong>{p.votes}</strong> residents back this project.</p>
          {user ? <button className="btn" disabled={voted} onClick={() => dispatch({ type: "vote", id: p.id })}>{voted ? "You voted" : "Vote for this project"}</button>
            : <Link className="btn" to="/signin">Sign in to vote</Link>}
        </div>
        <div>
          <h2>Comments</h2>
          {p.comments.length === 0 && <p className="muted">No comments yet.</p>}
          <ul className="plain">{p.comments.map((c) => <li key={c.id} className="comment"><strong>{name(c.userId)}</strong> <small className="muted">{c.date}</small><p>{c.text}</p></li>)}</ul>
          {user ? (
            <form onSubmit={(e) => { e.preventDefault(); dispatch({ type: "comment", id: p.id, text }); setText(""); }}>
              <label>Add a comment<textarea rows="3" maxLength={400} value={text} onChange={(e) => setText(e.target.value)} required /></label>
              <button className="btn sm" type="submit">Post</button>
            </form>
          ) : <p className="muted">Sign in to comment.</p>}
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
      <section className="wrap grid">
        {WARDS.map((w) => {
          const ps = state.projects.filter((p) => p.ward === w);
          const fb = state.feedback.filter((f) => f.ward === w).length;
          return (
            <article className="card" key={w}>
              <Icon n="map" size={30} /><h3>{w}</h3><p>{info[w]}</p>
              <p className="muted">{ps.length} projects &middot; {fb} feedback items</p>
              <Link className="btn sm alt" to={`/projects?ward=${w}`}>View projects</Link>
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
      <section className="wrap narrow">
        <form onSubmit={submit} noValidate>
          <label>Ward<select value={ward} onChange={(e) => setWard(e.target.value)} required><option value="">Choose a ward</option>{WARDS.map((w) => <option key={w}>{w}</option>)}</select></label>
          <label>Your message<textarea rows="6" maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} required /></label>
          <input className="hp" tabIndex="-1" autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} />
          <button className="btn" type="submit">Send feedback</button>
          {msg && <p className={"msg " + (msg.ok ? "ok" : "err")} role="status">{msg.t}</p>}
          {!user && <p className="muted">You are not signed in. <Link to="/signin">Sign in</Link> to track your feedback.</p>}
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
      <section className="wrap grid">{items.map(([t, d]) => <article className="card" key={t}><Icon n="doc" size={30} /><h3>{t}</h3><p>{d}</p></article>)}</section>
    </>
  );
}

export function Auth() {
  const { state, dispatch, user } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", pw: "" });
  const [err, setErr] = useState("");
  if (user) return <Navigate to="/portal" replace />;
  const demo = (role) => { dispatch({ type: "login", id: state.users.find((u) => u.role === role).id }); nav("/portal"); };
  const register = (e) => {
    e.preventDefault();
    const email = clean(f.email, 120).toLowerCase();
    if (clean(f.name, 60).length < 2) return setErr("Enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setErr("Enter a valid email.");
    if (f.pw.length < 10) return setErr("Use a password of at least 10 characters.");
    if (state.users.some((u) => u.email === email)) return setErr("That email is already registered.");
    dispatch({ type: "register", user: { id: Date.now(), name: clean(f.name, 60), email, role: "resident" } });
    nav("/portal");
  };
  const roles = [["resident", "Resident", "Vote, comment and track your feedback.", "user"], ["officer", "Ward officer", "Review feedback and update project progress.", "shield"], ["admin", "Administrator", "Manage projects, users and see ward analytics.", "chart"]];
  return (
    <>
      <Hero title="Sign in" text="Explore the three portals with a demo account, or register as a resident." />
      <section className="wrap grid">
        {roles.map(([r, t, d, i]) => (
          <article className="card" key={r}><Icon n={i} size={30} /><h3>{t}</h3><p>{d}</p><button className="btn sm" onClick={() => demo(r)}>Continue as {t.toLowerCase()}</button></article>
        ))}
      </section>
      <section className="wrap narrow">
        <form onSubmit={register} noValidate>
          <h2>Register as a resident</h2>
          <label>Full name<input autoComplete="name" maxLength={60} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
          <label>Email<input type="email" autoComplete="email" maxLength={120} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
          <label>Password<input type="password" autoComplete="new-password" value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} /></label>
          <button className="btn" type="submit">Create account</button>
          {err && <p className="msg err" role="alert">{err}</p>}
          <p className="small">Demo mode: accounts live in this browser only. Real authentication needs a server.</p>
        </form>
      </section>
    </>
  );
}
