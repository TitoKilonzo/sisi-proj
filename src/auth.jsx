import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useApp, clean, hashPw } from "./store.jsx";
import { Icon } from "./ui.jsx";
import { INPUT, LABEL, BTN, EMAIL_RX } from "./cls.js";

export function Auth() {
  const { state, dispatch, user } = useApp();
  const nav = useNavigate();
  const [tab, setTab] = useState("in");
  const [log, setLog] = useState({ email: "", pw: "" });
  const [reg, setReg] = useState({ name: "", email: "", pw: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/portal" replace />;

  const switchTab = (t) => { setTab(t); setErr(""); };
  const fail = (m) => { setErr(m); setBusy(false); };

  const signIn = async (e) => {
    e.preventDefault();
    const email = clean(log.email, 120).toLowerCase();
    if (!EMAIL_RX.test(email) || !log.pw) return fail("Enter your email and password.");
    setBusy(true); setErr("");
    const u = state.users.find((x) => x.email === email);
    let ok = false;
    if (u && u.pw) { const { hash } = await hashPw(log.pw, u.pw.salt); ok = hash === u.pw.hash; }
    if (!ok) return fail("Incorrect email or password.");
    dispatch({ type: "login", id: u.id });
    nav("/portal");
  };

  const register = async (e) => {
    e.preventDefault();
    const email = clean(reg.email, 120).toLowerCase();
    if (clean(reg.name, 60).length < 2) return fail("Enter your name.");
    if (!EMAIL_RX.test(email)) return fail("Enter a valid email.");
    if (reg.pw.length < 10) return fail("Use a password of at least 10 characters.");
    if (state.users.some((u) => u.email === email)) return fail("That email is already registered.");
    setBusy(true); setErr("");
    const pw = await hashPw(reg.pw);
    dispatch({ type: "register", user: { id: Date.now(), name: clean(reg.name, 60), email, role: "resident", pw } });
    nav("/portal");
  };

  const tabCls = (t) => `flex-1 py-2.5 rounded-full font-bold cursor-pointer transition-colors ${tab === t ? "bg-orange text-ink" : "bg-blue-light text-ink hover:bg-blue/60"}`;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr] bg-white">
      <aside className="hidden lg:flex flex-col justify-between relative overflow-hidden p-12 text-white bg-gradient-to-br from-ink via-[#14425b] to-[#1d6f93]">
        <div className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-orange-light to-orange opacity-90" aria-hidden="true" />
        <div className="absolute -left-20 -bottom-28 w-[340px] h-[340px] rounded-full bg-blue/30" aria-hidden="true" />
        <Link to="/" className="relative flex items-center gap-2.5 font-extrabold text-2xl text-white no-underline"><img src="./favicon.svg" alt="" width="38" height="38" />Sisi</Link>
        <div className="relative max-w-md">
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight mb-4">Your ward. Your say.</h1>
          <p className="text-lg text-white/85">Sign in to vote on county projects, follow your feedback to resolution and manage ward work from one portal.</p>
        </div>
        <p className="relative text-sm text-white/70">Kilimani Ward, Dagoretti North, Nairobi</p>
      </aside>

      <div className="flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-ink no-underline px-4 py-2 rounded-full border-2 border-ink hover:bg-blue-light transition-colors"><Icon n="home" size={18} /> Home</Link>
          <Link to="/" className="lg:hidden flex items-center gap-2 font-extrabold text-xl text-ink no-underline"><img src="./favicon.svg" alt="" width="30" height="30" />Sisi</Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-[440px]">
            <h2 className="text-3xl font-extrabold mb-1">{tab === "in" ? "Welcome back" : "Create your account"}</h2>
            <p className="text-muted mb-6">{tab === "in" ? "Sign in to continue to your portal." : "Register as a resident to vote and send feedback."}</p>
            <div className="flex gap-2 mb-6" role="tablist">
              <button role="tab" aria-selected={tab === "in"} className={tabCls("in")} onClick={() => switchTab("in")}>Sign in</button>
              <button role="tab" aria-selected={tab === "up"} className={tabCls("up")} onClick={() => switchTab("up")}>Register</button>
            </div>
            {tab === "in" ? (
              <form onSubmit={signIn} noValidate>
                <label className={LABEL}>Email<input className={INPUT} type="email" autoComplete="username" maxLength={120} value={log.email} onChange={(e) => setLog({ ...log, email: e.target.value })} /></label>
                <label className={LABEL}>Password<input className={INPUT} type="password" autoComplete="current-password" value={log.pw} onChange={(e) => setLog({ ...log, pw: e.target.value })} /></label>
                <button className={BTN + " w-full"} type="submit" disabled={busy}>{busy ? "Signing in" : "Sign in"}</button>
              </form>
            ) : (
              <form onSubmit={register} noValidate>
                <label className={LABEL}>Full name<input className={INPUT} autoComplete="name" maxLength={60} value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} /></label>
                <label className={LABEL}>Email<input className={INPUT} type="email" autoComplete="email" maxLength={120} value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} /></label>
                <label className={LABEL}>Password (10 characters or more)<input className={INPUT} type="password" autoComplete="new-password" value={reg.pw} onChange={(e) => setReg({ ...reg, pw: e.target.value })} /></label>
                <button className={BTN + " w-full"} type="submit" disabled={busy}>{busy ? "Creating account" : "Create account"}</button>
              </form>
            )}
            {err && <p className="font-semibold mt-4 text-[#aa1111]" role="alert">{err}</p>}
            <p className="text-xs text-muted mt-6">Accounts and password hashes are stored in this browser only. Real authentication needs a server.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
