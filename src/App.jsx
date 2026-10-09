import { useState } from "react";
import { NavLink, Link, Navigate, Route, Routes, Outlet, useLocation } from "react-router-dom";
import { useApp } from "./store.jsx";
import { Icon } from "./ui.jsx";
import { Home, Projects, ProjectDetail, Wards, Participate, About, Auth } from "./pages.jsx";
import { Portal } from "./portal.jsx";

const NAV = [["/", "Home"], ["/projects", "Projects"], ["/wards", "Wards"], ["/participate", "Participate"], ["/about", "About"]];

function Layout() {
  const { user, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const close = () => setOpen(false);
  return (
    <>
      <a className="absolute -left-[999px] focus:left-2 focus:top-2 focus:bg-white focus:p-2 focus:z-20 focus:rounded" href="#main">Skip to content</a>
      <header className="sticky top-0 z-10 flex items-center justify-between px-[4%] py-2.5 bg-white/88 backdrop-blur-[10px] border-b-2 border-blue">
        <Link className="flex items-center gap-2.5 font-extrabold text-xl text-ink no-underline" to="/" onClick={close}><img src="./favicon.svg" alt="" width="34" height="34" /><span>Sisi</span></Link>
        <button className="md:hidden bg-transparent border-2 border-ink rounded-[10px] p-1.5 cursor-pointer text-ink" aria-expanded={open} aria-controls="nav" aria-label="Menu" onClick={() => setOpen(!open)}>
          <Icon n={open ? "x" : "menu"} />
        </button>
        <nav id="nav" className={`${open ? "block" : "hidden"} absolute left-0 right-0 top-full bg-white border-b-2 border-blue shadow-[0_10px_30px_rgba(15,42,58,0.10)] md:block md:static md:bg-transparent md:border-0 md:shadow-none`}>
          <ul className="flex flex-col md:flex-row gap-1 list-none m-0 px-[4%] py-4 md:p-0 items-stretch md:items-center">
            {NAV.map(([to, label]) => (
              <li key={to}><NavLink to={to} end={to === "/"} onClick={close} className={({ isActive }) => `block px-3.5 py-2 text-ink no-underline rounded-full font-semibold transition-colors ${isActive ? "bg-orange" : "hover:bg-blue-light"}`}>{label}</NavLink></li>
            ))}
            {user ? (
              <>
                <li><NavLink to="/portal" onClick={close} className={({ isActive }) => `block px-3.5 py-2 text-ink no-underline rounded-full font-semibold transition-colors ${isActive ? "bg-orange" : "hover:bg-blue-light"}`}>Portal</NavLink></li>
                <li><button className="bg-transparent border-2 border-ink rounded-full px-[18px] py-2 text-sm font-bold cursor-pointer shadow-none hover:-translate-y-0.5 transition-transform" onClick={() => { dispatch({ type: "logout" }); close(); }}>Sign out</button></li>
              </>
            ) : (
              <li><Link className="inline-flex items-center gap-2 bg-orange text-ink font-bold text-sm px-[18px] py-2 border-0 rounded-full no-underline cursor-pointer shadow-[0_6px_16px_rgba(242,106,27,0.35)] hover:-translate-y-0.5 hover:bg-orange-light transition-all" to="/signin" onClick={close}>Sign in</Link></li>
            )}
          </ul>
        </nav>
      </header>
      <main id="main" key={loc.pathname} className="animate-fade-in motion-reduce:animate-none"><Outlet /></main>
      <footer className="bg-ink text-white py-9 mt-[50px]">
        <div className="max-w-[1120px] w-[92%] mx-auto flex justify-between gap-5 flex-wrap">
          <div><strong className="text-lg">Sisi</strong><p className="mt-1">Public participation for Kilimani Ward and Dagoretti North, Nairobi.</p></div>
          <ul className="list-none p-0 columns-2 gap-x-8">{NAV.map(([to, label]) => <li key={to} className="mb-1"><Link to={to} className="text-blue hover:text-blue-light no-underline">{label}</Link></li>)}</ul>
        </div>
        <p className="max-w-[1120px] w-[92%] mx-auto text-sm text-[#b8cbd6] mt-4">Sample data shown for demonstration.</p>
      </footer>
    </>
  );
}

function Guard({ roles, children }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/signin" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/portal" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="wards" element={<Wards />} />
        <Route path="participate" element={<Participate />} />
        <Route path="about" element={<About />} />
        <Route path="signin" element={<Auth />} />
        <Route path="portal" element={<Guard><Portal /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
