# Sisi

Sisi is a public participation platform for Kilimani Ward in Dagoretti North, Nairobi County. It lets residents follow county projects, vote on priorities, comment, and send feedback, while ward officers and administrators manage the response from their own portals.

Built with React 18, React Router 6 and Vite. JavaScript only. No other runtime dependencies.

## Contents of this zip

    README.md           this file
    dist/               production build, ready to upload to a static host
    index.html          Vite entry page (source)
    package.json        scripts and pinned dependencies
    package-lock.json   exact dependency versions
    vite.config.js      build config and Content Security Policy injection
    public/             favicon.svg and _headers (copied into dist/)
    src/                application source

## About the system

### Roles and portals

| Role | How to reach it | What it can do |
| --- | --- | --- |
| Visitor | No sign in | Browse projects, wards and about pages, submit feedback |
| Resident | Register, or use the demo button | Vote once per project, comment, submit and track feedback |
| Ward officer | Demo button | Review the feedback queue and change status, update project progress with sliders |
| Administrator | Demo button | Overview with totals and a votes by ward chart, add projects, view users, plus all officer tools |

### Pages

- Home: live statistics, feature summaries and the most backed projects
- Projects: search, filter by status and ward, sort by votes, progress or budget
- Project detail: progress, budget, vote button and comments
- Wards: five wards (Kilimani, Kawangware, Kileleshwa, Gatina, Kabiria) with links to their projects
- Participate: feedback form with a spam trap field
- About: CIDP, CADP and CBEF explained
- Sign in: demo accounts and resident registration
- Portal: role specific tools (requires sign in)

### Source map

    src/main.jsx      entry, providers, router
    src/App.jsx       layout, navigation, routes, route guards
    src/store.jsx     state, reducer, role checks, input cleaning, localStorage persistence
    src/ui.jsx        icons, skyline art, project card, progress bar
    src/pages.jsx     public pages and sign in
    src/portal.jsx    resident, officer and admin views
    src/styles.css    Atomic Orange and Ice Cream Blue theme

### Design

Atomic Orange (#F26A1B) and Ice Cream Blue (#8ED6F0) on white, with dark ink (#0F2A3A) for text. Orange buttons use dark text for readable contrast. Layout is responsive with a mobile menu, keyboard focus styles, a skip link and reduced motion support. All visuals are inline SVG and the favicon is public/favicon.svg.

### Data and persistence

All data is sample data held in the browser (localStorage key sisi_v2). Clearing site data resets the app. Accounts, votes and feedback are not shared between visitors or devices. This is a front end demonstration ready to be connected to a backend.

## Set up

Requirements: Node.js 18 or newer and npm.

    npm install
    npm run dev

Open the address printed in the terminal (usually http://localhost:5173).

Other commands:

    npm run build      create the production build in dist/
    npm run preview    serve the production build locally

Demo access: open Sign in and press Continue as resident, ward officer or administrator.

## Deploy to production

The dist/ folder in this zip is already built.

1. Unzip.
2. Upload the contents of dist/ to any static host: Netlify, Cloudflare Pages, GitHub Pages, Vercel, or a plain web server.
3. Make sure _headers is at the site root. Netlify and Cloudflare Pages apply it automatically. On other hosts, set the same headers in the host configuration.
4. Use HTTPS only.

Routing uses hash URLs, so no rewrite rules are needed. To rebuild after changes, run npm run build and upload the new dist/.

## Security

- React escapes all output and the code never injects raw HTML.
- The production build carries a Content Security Policy: scripts, styles, images and connections from the same origin only, no plugins, no base tag changes.
- _headers adds frame blocking, nosniff, no-referrer, a restrictive Permissions-Policy and HSTS.
- No third party scripts, fonts or trackers.
- Input is trimmed, stripped of control characters and angle brackets, and length limited. Forms include a honeypot field.
- Role checks in the reducer and route guards only shape the interface. Because everything runs in the browser, they are not real access control.

Before real use, a backend must provide: real authentication with hashed passwords (Argon2 or bcrypt), server side authorisation and validation, rate limiting and bot protection, CSRF protection, secure cookies, and audit logging.

## Known limits and next steps

- No real photographs yet: add images under src/assets/ and import them
- No backend: replace the reducer actions in src/store.jsx with API calls, backed by a database (Turso is a good fit)
- Sign in is demo only
- Replace all sample projects, ward figures and contact details with real county data
- Possible additions: SMS or email notifications, maps, exports, multilingual support (English and Kiswahili)
