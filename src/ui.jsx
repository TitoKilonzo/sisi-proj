import { Link } from "react-router-dom";
import { kes } from "./store.jsx";

const PATHS = {
  home: "M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6", logout: "M10 4H5v16h5M16 8l4 4-4 4M20 12H9", plus: "M12 5v14M5 12h14",
  trend: "M3 17l6-6 4 4 8-8M15 7h6v6", lock: "M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4",
  menu: "M4 7h16M4 12h16M4 17h16", x: "M6 6l12 12M18 6L6 18",
  map: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  vote: "M4 13l4 4L20 6", chat: "M4 5h16v11H9l-5 4z", chart: "M4 20V4M4 20h16M8 16v-5M13 16V8M18 16v-9",
  doc: "M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6", user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5", shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  mail: "M3 6h18v12H3zM3 7l9 7 9-7", phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z",
  arrow: "M5 12h14M13 6l6 6-6 6", users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20a7 7 0 0 1 14 0M17 5a3 3 0 0 1 0 6M19 20a6 6 0 0 0-3-5"
};

export const Icon = ({ n, size = 22 }) => (
  <svg className="fill-none stroke-current align-middle flex-none" style={{ strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d={PATHS[n]} /></svg>
);

const pillColors = {
  planned: "bg-blue-light border-blue text-ink",
  ongoing: "bg-orange text-ink border-orange",
  completed: "bg-ink text-white border-ink",
  new: "bg-blue-light border-blue text-ink",
  "in review": "bg-orange text-ink border-orange",
  resolved: "bg-ink text-white border-ink"
};

export const Pill = ({ status }) => (
  <span className={`inline-block text-xs font-bold px-3 py-0.5 rounded-full border ${pillColors[status.toLowerCase()] || "bg-blue-light border-blue text-ink"}`}>{status}</span>
);

export const Bar = ({ value }) => (
  <div className="h-2.5 bg-blue-light rounded-md overflow-hidden my-2.5 mb-1.5" role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">
    <i className="block h-full bg-gradient-to-r from-orange to-orange-light transition-[width] duration-500" style={{ width: value + "%" }} />
  </div>
);

export const Hero = ({ title, text, children }) => (
  <section className="relative overflow-hidden py-20 pb-[130px] bg-blue-light">
    <Skyline />
    <div className="max-w-[1120px] w-[92%] mx-auto relative">
      <div>
        <h1 className="text-[clamp(2.1rem,6vw,3.8rem)] max-w-[16ch] tracking-tight mb-2">{title}</h1>
        {text && <p className="text-lg max-w-[48ch]">{text}</p>}
        {children}
      </div>
    </div>
  </section>
);

export function Skyline() {
  const b = [[10, 70, 130], [90, 50, 210], [150, 80, 160], [240, 55, 270], [305, 90, 180], [405, 50, 240], [465, 75, 150], [550, 60, 220], [620, 95, 170], [725, 55, 260], [790, 75, 140], [875, 65, 200], [950, 85, 160], [1050, 55, 250], [1115, 80, 180]];
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 380" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ed6f0" /><stop offset="1" stopColor="#eaf8fd" /></linearGradient>
        <radialGradient id="sun"><stop offset="0" stopColor="#ff9a55" /><stop offset="1" stopColor="#f26a1b" /></radialGradient>
      </defs>
      <rect width="1200" height="380" fill="url(#sk)" />
      <circle cx="960" cy="120" r="78" fill="url(#sun)" />
      {b.map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={380 - h} width={w} height={h} fill="#0f2a3a" opacity={0.14 + (i % 3) * 0.05} />
          {Array.from({ length: Math.floor(h / 44) }, (_, r) => (
            <rect key={r} x={x + 10} y={380 - h + 14 + r * 40} width={w - 20} height="8" fill="#fff" opacity=".35" />
          ))}
        </g>
      ))}
    </svg>
  );
}

export function ProjectCard({ p }) {
  return (
    <article className="bg-white border-2 border-blue border-t-[5px] border-t-orange rounded-[14px] p-[22px] shadow-[0_10px_30px_rgba(15,42,58,0.10)] transition-transform duration-200 hover:-translate-y-1">
      <div className="flex justify-between items-center gap-2.5 flex-wrap"><Pill status={p.status} /><span className="text-muted">{p.sector}</span></div>
      <h3 className="my-2"><Link to={`/projects/${p.id}`} className="text-ink no-underline hover:text-orange-dark">{p.title}</Link></h3>
      <p className="text-muted text-sm"><Icon n="map" size={16} /> {p.ward} &middot; {kes(p.budget)}</p>
      <Bar value={p.progress} />
      <div className="flex justify-between items-center gap-2.5 flex-wrap"><small>{p.progress}% complete</small><small>{p.votes} votes</small></div>
    </article>
  );
}
