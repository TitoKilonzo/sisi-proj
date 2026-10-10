# Sisi

Sisi is a public participation platform for Kilimani Ward in Dagoretti North, Nairobi County. It lets residents follow county projects, vote on priorities, comment, and send feedback, while ward officers and administrators manage the response from their own portals.

Built with React 18, React Router 6 and Vite. JavaScript only. Styled with Tailwind CSS 4. No other runtime dependencies.

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
| Resident | Register on the Sign in page | Vote once per project, comment, submit and track feedback |
| Ward officer | README credentials | Review the feedback queue and change status, update project progress with sliders |
| Administrator | README credentials | Overview with totals and a votes by ward chart, add projects, view users, plus all officer tools |

### Pages

- Home: live statistics, feature summaries and the most backed projects
- Projects: search, filter by status and ward, sort by votes, progress or budget
- Project detail: progress, budget, vote button and comments
- Wards: five wards (Kilimani, Kawangware, Kileleshwa, Gatina, Kabiria) with links to their projects
- Participate: feedback form with a spam trap field
- About: CIDP, CADP and CBEF explained
- Sign in: standalone page with sign in and register tabs and a Home button back to the website
- Portal: a dashboard with a sidebar and top bar. Back to website and Sign out are always in the sidebar.
  - Resident: Overview, My votes, My feedback (with a form to send new feedback), Profile
  - Ward officer: Overview, Feedback queue, Project progress, Profile
  - Administrator: all of the above plus Add project and Users (role management)

### Source map

    src/main.jsx      entry, providers, router
    src/App.jsx       layout, navigation, routes, route guards
    src/store.jsx     state, reducer, role checks, input cleaning, localStorage persistence
    src/ui.jsx        icons, skyline art, project card, progress bar
    src/pages.jsx     public pages and sign in
    src/portal.jsx    portal shell (sidebar, top bar) and every portal view
    src/auth.jsx      standalone sign in and register page
    src/cls.js        shared Tailwind class strings
    scripts/hash-password.mjs   generates password hashes for seed accounts
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

## Demo accounts (private)

The website does not show or hint at these accounts. Use them on the Sign in page.

| Role | Email | Password |
| --- | --- | --- |
| Resident | amina.wanjiru@sisi.local | YznTzLvLS3zoi7qp |
| Ward officer | james.otieno@sisi.local | 25g3D0sRJp5VaxgB |
| Administrator | grace.mutua@sisi.local | 5kNCvv-zVdythj0L |

Keep this README private: deploy only the contents of dist/ and never publish this file with the site. Passwords are stored as salted PBKDF2 hashes, so they cannot be read from the built files. Because the whole app runs in the browser, this is still a demonstration: anyone using DevTools on their own copy can change their own local data. Real protection needs a server.

To change a demo password, run:

    node scripts/hash-password.mjs "new password of 10 or more characters"

and paste the printed salt and hash into the matching user in the seed data in src/store.jsx. After changing seed data, bump the storage key (sisi_v3) in src/store.jsx so existing browsers load the new data. Signed in users can also change their own password under Portal, Profile.

Real resident accounts: register on the Sign in page, then sign in again later with the same email and password. Registered accounts are always residents. Administrators can change roles under Portal, Users.

Available scripts (running npm run with no name only lists them): dev, start (same as dev), build, preview.

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
- Sign in is demo only: hashing and accounts are client side
- Replace all sample projects, ward figures and contact details with real county data
- Possible additions: SMS or email notifications, maps, exports, multilingual support (English and Kiswahili)
