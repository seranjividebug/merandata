# Discoverability log

Running record of the discoverability / AI-search upgrade. One section per phase.

## Phase 1: architecture audit (2026-11-16)

**Done**
- Audited stack, routes, anchors, data files, crawler view, access and status behaviour, SSR blockers.
- Compared vite-react-ssg, React Router framework mode, custom script, Vike, Astro/Next.
- Chose **vite-react-ssg 0.8.9** (keeps React 18 / React Router 6 / Vite 5).

**Files changed**
- `docs/AUDIT.md` (new)
- `docs/DISCOVERABILITY_LOG.md` (new)

No application code was changed.

**Evidence**
- Raw built HTML is the same 1,307-byte shell on every route (`docs/AUDIT.md` section 5).
- Status-code matrix for preview, the Cloudflare Worker and meridanta.com (section 6).
- Unknown paths and `robots.txt`/`sitemap.xml`/`llms.txt` return HTML with 200 everywhere.

**Open TODOs**
- Is meridanta.com staying on Hostinger or moving to Cloudflare? It decides which 404/redirect and AI-crawler settings apply.
- Confirm trailing-slash policy in Phase 3.
- Verify the Cloudflare Workers Builds Node version in Phase 2.

## Phase 2: prerendering / static generation (2026-11-16)

**Done**
- Added **vite-react-ssg 0.8.9** (dev dependency, pinned). `npm run build` is now `vite-react-ssg build`; `npm run dev` is still plain Vite.
- `src/App.jsx` became `src/Layout.jsx` (header, `<Outlet />`, footer, floating buttons) plus `src/routes.jsx` (the route list). `src/main.jsx` uses `ViteReactSSG({ routes })`.
- One route entry, `industries/:slug`, builds a page per `INDUSTRIES` item through `getStaticPaths`. Adding an industry to `src/data.js` adds its HTML page automatically.
- Build output: `/`, `/qlik/`, `/industries/healthcare/`, `/industries/communications-media-entertainment/` each as its own full HTML file, plus `dist/404.html`.
- Per-page `<title>`, meta description and basic Open Graph tags are now written into each HTML file by `src/components/PageMeta.jsx` (replaces `usePageTitle`). The duplicate default title/description in `index.html` was removed. Phase 3 extends this with `src/seo.js`.
- **Content that used to be rendered only when selected is now always in the HTML** (hidden with the `hidden` attribute and CSS, shown by the existing tabs and sliders):
  - 20 published case studies. The active one is the full panel; the other 19 are text-only `<article>` blocks inside `.ck-archive`. Within the panel all four tabs (Challenge, Solution, Outcome, Result) are present.
  - All 5 accelerator panels (image, tools, features, challenge, solution, benefits).
  - Already complete before: 3 hero slides, services, industries, 7 capabilities, 4 Qlik offerings.
- SSR and hydration fixes: `useMedia`/`useReducedMotion` start `false` and update in an effect (`src/utils.js`); `useIsoLayoutEffect` replaces `useLayoutEffect`; the Hero image preload moved into `<Head>`; the footer year is a build-time constant (`__BUILD_YEAR__`).
- Hosting:
  - **Cloudflare:** `wrangler.jsonc` now uses `not_found_handling: "404-page"`; `public/_redirects` holds 301s.
  - **Hostinger/Apache:** `public/.htaccess` no longer has a catch-all rewrite to `index.html`. It sets `ErrorDocument 404 /404.html` and the same 301s.
  - `.nvmrc` (Node 22) for the Workers Builds environment.
- Old custom `route-shells` build plugin removed (replaced by the real prerender).

**Files changed**
`package.json`, `package-lock.json`, `vite.config.js`, `index.html`, `wrangler.jsonc`, `public/.htaccess`, `public/_redirects` (new), `.nvmrc` (new), `src/main.jsx`, `src/routes.jsx` (new), `src/Layout.jsx` (new, replaces `src/App.jsx`), `src/utils.js`, `src/nav.js`, `src/components/PageMeta.jsx` (new), `Hero.jsx`, `CaseStudies.jsx`, `CasePanel.jsx`, `CaseDiagram.jsx`, `AcceleratorsCard.jsx`, `ServiceJourney.jsx`, `SpotlightCard.jsx`, `Footer.jsx`, `pages/Home.jsx`, `pages/QlikOverview.jsx`, `pages/IndustryPage.jsx`, `pages/NotFound.jsx`, `docs/PHASE2_EVIDENCE.md` (new).

**Evidence**
- `docs/PHASE2_EVIDENCE.md`: first 80 lines of the built HTML for `/` and `/qlik`.
- Content check against the data files: 3/3 hero slides, 4/4 services and 24/24 service items, 2/2 industries; 7/7 capabilities with 21/21 bullets, 4/4 offerings, 5/5 accelerators, 20/20 case studies with all 165 challenge/solution/outcome/result bullets. All found in the built HTML.
- Hydration: zero console errors or warnings on all 4 routes plus an unknown URL, at 1440px and 390px, both in dev SSR mode (full React warnings) and on the production build.
- Real Cloudflare asset handler (`wrangler dev`) results: `/qlik/`, `/industries/healthcare/` 200 with their own titles; `/nonexistent` and `/no/such/page` **404** with the "Page not found" page; `/services`, `/about`, `/products`, `/industries` **301** to the matching home section; `/qlik/capabilities` **301** to `/qlik/`.
- Interactive behaviour re-tested in the browser: case tabs, Next/Previous case, accelerator tabs and stepper. Panel height unchanged (411px at 1440).

**Open TODOs / notes**
- Cloudflare answers `/qlik` with a 307 to `/qlik/` (nested folders). Trailing-slash policy and canonicals are decided in Phase 3.
- `public/_redirects` and `.htaccess` redirects for `/services`, `/about`, `/products`, `/industries` are my addition so those guessable URLs stop returning the 404 page. Review them.
- The Apache `.htaccess` rules (404 page, redirects) are written but could not be run here. Verify on Hostinger after upload (`/nonexistent` must show the 404 page with status 404).
- meridanta.com is still on Hostinger; Cloudflare behaviour applies to the workers.dev address until DNS moves.
- No FAQ content and no visible company email/phone/address exists yet (Phase 4/5).
- The Hero `<h1>` text is "Center of Excellence" plus the Qlik logo image (aria-label "Qlik"). Plain-text crawlers do not see "Qlik" in the h1. Fix in Phase 4 with hidden text.
