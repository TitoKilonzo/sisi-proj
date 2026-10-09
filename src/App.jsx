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
      <a className="skip" href="#main">Skip to content</a>
      <header className="top">
        <Link className="brand" to="/" onClick={close}><img src="./favicon.svg" alt="" width="34" height="34" /><span>Sisi</span></Link>
        <button className="burger" aria-expanded={open} aria-controls="nav" aria-label="Menu" onClick={() => setOpen(!open)}>
          <Icon n={open ? "x" : "menu"} />
        </button>
        <nav id="nav" className={open ? "open" : ""}>
          <ul>
            {NAV.map(([to, label]) => (
              <li key={to}><NavLink to={to} end={to === "/"} onClick={close}>{label}</NavLink></li>
            ))}
            {user ? (
              <>
                <li><NavLink to="/portal" onClick={close}>Portal</NavLink></li>
                <li><button className="btn sm ghost" onClick={() => { dispatch({ type: "logout" }); close(); }}>Sign out</button></li>
              </>
            ) : (
              <li><Link className="btn sm" to="/signin" onClick={close}>Sign in</Link></li>
            )}
          </ul>
        </nav>
      </header>
      <main id="main" key={loc.pathname}><Outlet /></main>
      <footer>
        <div className="wrap cols">
          <div><strong>Sisi</strong><p>Public participation for Kilimani Ward and Dagoretti North, Nairobi.</p></div>
          <ul>{NAV.map(([to, label]) => <li key={to}><Link to={to}>{label}</Link></li>)}</ul>
        </div>
        <p className="wrap small">Sample data shown for demonstration.</p>
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
