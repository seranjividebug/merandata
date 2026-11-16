# Meridanta website: architecture audit (Phase 1)

Date: 2026-11-16. Scope: audit only, no application code was changed.
Evidence was collected with `npm run build`, `vite preview`, `curl`, and `npm view`.

## 1. Summary

| # | Finding | Impact |
|---|---|---|
| 1 | Every built HTML file is the same 1,307-byte empty shell (`<div id="root"></div>`). Same title and description on every route. | AI crawlers and most search bots see no content at all. |
| 2 | Unknown paths return **HTTP 200 with the home-page shell** on preview, on the Cloudflare Worker and on meridanta.com. `/robots.txt`, `/sitemap.xml` and `/llms.txt` also return that HTML with 200. | Soft 404s. Crawlers that request robots.txt get HTML. |
| 3 | `meridanta.com` is served by **Hostinger (Apache/hcdn)**, not Cloudflare. Only `merandatav3.siranjeevi9597536779.workers.dev` is on Cloudflare Workers. | Cloudflare-only features (404 status handling, `_redirects`, Cloudflare AI crawler settings) do not apply to meridanta.com unless DNS or hosting moves. See section 7. |
| 4 | Several components render only the *active* item (case studies, accelerators, case-study detail tabs). | Most case studies and accelerator details are not in the DOM. Phase 2 must render all of them. |
| 5 | Two hydration hazards: `useState` initialised from `matchMedia`, and `useLayoutEffect` during render. | Hydration warnings or mismatches until fixed. |
| 6 | Recommended approach: **vite-react-ssg 0.8.9**. Keeps React 18.3, React Router 6.30, Vite 5.4 and our components. No headless browser. | See section 9. |

## 2. Stack and versions

| Item | Version / value |
|---|---|
| Node (local) | 24.21.0 (npm 11.19.0) |
| React / React DOM | 18.3.1 |
| Router | react-router-dom **6.30.1**, `BrowserRouter` (client-side only) |
| Bundler | Vite 5.4.11, @vitejs/plugin-react 4.3.4 |
| Other runtime dependency | simple-icons 16.36.0 (named imports in `src/logoMap.js`) |
| Language | JavaScript (JSX), no TypeScript, no tests, no linter |
| Styling | Plain CSS (`styles.css` plus per-feature CSS files) |
| Hosting config | `wrangler.jsonc`: Workers static assets, `directory: ./dist`, `not_found_handling: single-page-application` |
| Build script | `vite build` with a small custom plugin in `vite.config.js` that copies `index.html` into `dist/qlik/` and `dist/industries/<slug>/` |
| Git remotes | `origin` (merandata), `v3` (merandatav3, deploys the Worker) |

## 3. Public routes and anchors

Routes defined in `src/App.jsx`:

| URL | Component | Notes |
|---|---|---|
| `/` | `Home` | Hero, Services, Industries, Products, About, Contact |
| `/qlik` | `QlikOverview` | Hero, capabilities, service journey, accelerators, case studies |
| `/qlik/*` | redirect to `/qlik#capabilities` | client-side `<Navigate>` |
| `/industries/healthcare` | `IndustryPage` | generated from `INDUSTRIES` |
| `/industries/communications-media-entertainment` | `IndustryPage` | generated from `INDUSTRIES` |
| `*` | `NotFound` | rendered with HTTP 200 today |

There are no `/services`, `/about`, `/products` or `/industries` pages. Those are sections of `/`.

Anchors on `/`: `#home`, `#services`, `#industries`, `#solutions`, `#about`, `#contact`.
Anchors on `/qlik`: `#capabilities`, `#qlik-services`, `#accelerators`, `#case-studies`.
Deep links handled in code: `#case-<id>` (case studies) and `#accelerator-<id>` (accelerators).
Navigation links are real `<a href>` elements (nav items link to `/#id`).

## 4. Data files (content source of truth)

| File | Content |
|---|---|
| `src/data.js` | NAV, HIGHLIGHTS, HERO_SLIDES (3), SERVICES, INDUSTRIES (2), PILLARS, INTERESTS and other copy |
| `src/qlikData.js` | QLIK_OVERVIEW, QLIK_OFFERINGS (4), QLIK_JOURNEY, QLIK_CAPABILITIES (7), trademark text |
| `src/accelerators.js`, `src/acceleratorStack.js` | 5 accelerators |
| `src/caseStudies.js` | 20 published case studies (1 unpublished), categories, impact, featured ids |
| `src/searchIndex.js` | site search entries |
| `src/social.js` | social links (placeholders) |
| `src/logoMap.js` | brand logos |

This is a good base for the "generated from data" requirement: routes, sections and case studies are already data-driven.

## 5. What crawlers see now

Built with `npm run build`. Every route's file is byte-identical to `dist/index.html`
(`dist/qlik/index.html` and `dist/industries/*/index.html` were verified identical).

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Meridanta | Outcome-driven AI, Data & Cloud Solutions</title>
    <meta name="description" content="Meridanta helps organizations solve practical business problems with AI, data and analytics, cloud, and Qlik expertise, delivered with an AI-first, outcome-driven approach." />
    <meta property="og:title" content="Meridanta | Outcome-driven AI, Data & Cloud Solutions" />
    <meta property="og:description" content="AI, Data & Analytics, and Cloud solutions with an AI-first, outcome-driven approach." />
    <meta property="og:type" content="website" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <script type="module" crossorigin src="/assets/index-Di2M2kKM.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-BYmQ9jtO.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

Missing: h1/headings, any body text, canonical, JSON-LD, Twitter tags, og:image, og:url, per-route title/description,
`robots.txt`, `sitemap.xml`, `llms.txt`. The page title is set later in the browser by `usePageTitle()` (an effect), which crawlers that do not run JS never see.

## 6. Direct access, refresh and status codes

Status code returned (and `<title>` of the response) for each URL. All three targets were tested with `curl` on 2026-11-16.

| URL | `vite preview` | Cloudflare Worker (merandatav3) | meridanta.com (Hostinger) |
|---|---|---|---|
| `/` | 200 | 200 | 200 |
| `/qlik` | 200 | 200 | **301** to `/qlik/` (then 200) |
| `/qlik/` | 200 | 200 | 200 |
| `/qlik?x=1` | 200 | 200 | 301 to `/qlik/?x=1` |
| `/industries/healthcare` | 200 | 200 | 301 to trailing slash, then 200 |
| `/industries/communications-media-entertainment` | 200 | 200 | 301 to trailing slash, then 200 |
| `/industries` (no such page) | 200 | 200 | 301 then 200 (home shell) |
| `/services`, `/about`, `/products` (no such pages) | 200 | 200 | 200 (home shell) |
| `/nonexistent` | **200** | **200** | **200** (home shell) |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt` | 200 (HTML) | 200 (HTML) | 200 (HTML) |

Findings:
- All real routes load on direct access and refresh in every environment (the route-folder step added earlier makes this work even without rewrite rules).
- Unknown paths are soft 404s everywhere: status 200 with the home-page shell. The React `NotFound` page appears for some of them but the HTTP status is still 200.
- `robots.txt`, `sitemap.xml` and `llms.txt` do not exist, so the SPA fallback answers with HTML.
- On Hostinger, folder routes are canonicalised **with** a trailing slash by a 301. Cloudflare serves both forms with 200. A single trailing-slash policy is needed in Phase 3 (recommendation: trailing slash, matching the folder output and Hostinger).

## 7. Hosting reality (important for Phase 2)

- `https://meridanta.com` responds with `Server: hcdn`, `platform: hostinger`. It is **not** behind Cloudflare today.
- `https://merandatav3.siranjeevi9597536779.workers.dev` responds with `Server: cloudflare` and is built by Cloudflare Workers Builds from the `v3` remote.
- The brief asks for Cloudflare behaviours (real 404 status, 301 redirects, Cloudflare AI crawler settings). Those only take effect on meridanta.com if its DNS/hosting moves to Cloudflare.
- Plan: build one output that works on both. For Cloudflare: `wrangler.jsonc` (`not_found_handling: "404-page"`), `public/_redirects`, `public/_headers`. For Hostinger: `public/.htaccess` (`ErrorDocument 404 /404.html`, `Redirect 301` rules).
- **Question for the owner:** is meridanta.com going to be moved to Cloudflare, or will it stay on Hostinger? This decides which dashboard settings in the final checklist apply.

## 8. SSR / prerender blockers

Browser APIs used at module level or during render, and non-SSR-safe patterns:

| Location | Problem | Fix in Phase 2 |
|---|---|---|
| `src/components/CaseStudies.jsx:36-46` (`useMedia`) | `useState(() => window.matchMedia(query).matches)`. Server renders `false`, a phone's first client render is `true`, so hydration mismatch (`vertical` changes the diagram). | Start from `false`, read `matchMedia` in an effect. |
| `src/components/SpotlightCard.jsx:11` | Same `matchMedia` initial state pattern. | Same fix. |
| `src/components/CaseStudies.jsx:88,101`, `src/components/AcceleratorsCard.jsx:92,101` | `useLayoutEffect` warns during server rendering in React 18. | Use an isomorphic layout effect (`useEffect` on the server). |
| `src/components/Hero.jsx:16` | Module-level DOM side effect (injects a preload `<link>`), guarded by `typeof document`. Does nothing on the server, so the LCP preload is missing from prerendered HTML. | Replace with a `<link rel="preload">` in the page head. |
| `src/utils.js:1` (`REDUCED`) | Module-level `matchMedia`, guarded. Server value `false`. It is used only in effects and handlers, except `arc`/`barFill` in `ServiceJourney.jsx:76-77` which are computed during render (small mismatch only for reduced-motion users). | Keep for handlers, derive render-time values from state set in an effect. |
| `src/nav.js` `usePageTitle` | Sets `document.title` and meta description in an effect. Not visible to crawlers. | Replace with a head component from the SSG tool, fed by `src/seo.js`. |
| `src/components/Footer.jsx:32` | `new Date().getFullYear()` evaluated at render. Prerendered year can differ from the client's year around New Year. | Use a build-time constant. |
| `src/components/Industries.jsx:10`, `Services.jsx:7` | `canHover()` reads `window.matchMedia` but is called only from event handlers. | No change needed (already guarded). |
| `Hero.jsx` (`fetchpriority`, `inert=""`) | Lowercase `fetchpriority` and string `inert` are accepted by React 18, but need a check for hydration warnings. | Verify in Phase 2. |
| All other `window`/`document` uses (`Header`, `Search`, `Footer` dialog, `FloatingActions`, `CapabilityStack`, `ServiceJourney`, `AcceleratorsCard`, `ScrollManager`, `go()`) | Inside effects or handlers. | Safe. |
| `src/logoMap.js` (simple-icons named imports) | ESM package imported from the server bundle. | Check it resolves in the SSG build; add `ssr.noExternal` if needed. |
| Asset imports (`.webp`, `.png`, `.svg`), per-component `.css` imports | Handled by Vite in SSR builds. | Verify that `assetsInlineLimit` still behaves. |

No `localStorage`, `sessionStorage`, `Math.random` or `Date.now` is used during render.

### Content hidden from the DOM today (must be always rendered in Phase 2)

| Component | What is rendered now | What the HTML must contain |
|---|---|---|
| `CaseStudies.jsx` / `CasePanel.jsx` | One case at a time; the other 19 appear only as strip pills (title and headline number). Within a case only one of Challenge / Solution / Outcome / Result is in the DOM. | All 20 published cases as `<article>`, each with all four sections. Show or hide with CSS and JS. |
| `AcceleratorsCard.jsx` | Tab bar for all 5, but detail for only the active accelerator. | All 5 accelerator details. |
| `ServiceJourney.jsx` | Not fully verified; the centre disc shows one step at a time. | Confirm all four offerings' text is in the HTML. |
| `Hero.jsx` | All 3 slides are rendered (inactive ones are `inert` and `aria-hidden`). | Already fine. One `<h1>` is used for slide 1 and `<h2>` for slides 2 and 3. |
| `Industries.jsx`, `Services.jsx`, `CapabilityStack.jsx` | All cards and details are in the DOM. | Already fine. |
| `Contact.jsx` | Form only; submit is simulated. No visible address, email or phone. | Company details block (Phase 4, with TODO placeholders). |

## 9. Options compared

Requirements: keep our React code, run on Cloudflare Workers Builds with no headless Chrome/Puppeteer, one full HTML file per route, scale to new pages and case studies automatically.

Versions below were read from the npm registry on 2026-11-16.

| | (a) vite-react-ssg | (b) React Router framework mode (prerender) | (c1) Custom `renderToString` script | (c2) Vike | (c3) Astro / Next.js static export |
|---|---|---|---|---|---|
| Keeps current stack | **Yes.** 0.8.9 supports Vite 2-7 and react-router-dom ^6.14; React 17-19. No upgrades needed. | Partly. `@react-router/dev` 7.18.5 supports Vite 5.1+ and Node 20+, but needs `react-router` 7, a route config, `root` and entry files. 8.x needs React 19.2.7 and Node 22.22. | Yes | Needs Vite 7.1+ and replaces react-router with its own file routing. | No. Replaces the app shell and routing. |
| Code change size | Small: `main.jsx`, `App.jsx` to a route array, head component | Medium: new file conventions and app restructure | Medium: own entry-server, routes loader, head handling | Large | Very large |
| Headless browser | No | No | No | No | No |
| Page per route | Yes (`nested` writes `route/index.html`) | Yes (`prerender`) | Yes (we write it) | Yes | Yes |
| New pages and case studies automatic | Yes, via `getStaticPaths` / route list built from the data files | Yes, via the `prerender()` function | Yes, if we build it | Yes | Yes |
| Head and meta management | Built-in `<Head>` (react-helmet-async) | Built-in `meta()` exports | We must build it | Built-in | Built-in |
| Maintenance risk | Single maintainer, but small, active (last release 2026-07). The fallback is (c1) with the same architecture. | Official, well supported | We own all of it | Active, smaller ecosystem | Large ecosystem |
| Risk on our time target (Wednesday) | **Low** | Medium | Medium | High | High |

### Decision: (a) vite-react-ssg 0.8.9

Why:
1. It is the only option that lets us keep **React 18.3, React Router 6.30 and Vite 5.4** unchanged. 0.9.x needs Vite 6.4+, which we do not need now, so we pin 0.8.9.
2. The change is mostly mechanical: convert `<Routes>` in `App.jsx` into a route array, add a `getStaticPaths` for the industry pages from `INDUSTRIES`, and swap `usePageTitle` for `<Head>`. Components stay as they are, apart from the SSR fixes in section 8.
3. Output is plain static files at build time, so it runs in Cloudflare Workers Builds (`npm run build`) with no browser. It also works unchanged on Hostinger.
4. New pages are picked up automatically when they are added to the route list built from the data files.

Risks and mitigations:
- *0.8.9 is not the newest release.* Pin the exact version. If we later move to Vite 6.4+, 0.9.x is a minor upgrade.
- *It renders with `react-dom/server` and uses jsdom for HTML post-processing. Globals may exist during rendering.* Phase 2 starts with a spike on `/qlik` to confirm that no hydration warnings appear.
- *Single maintainer.* The fallback is a ~100-line custom script (c1) with the same route and head conventions, so the migration cost stays low.
- *404 status.* The static build gives a `404.html` page. The 404 status itself must be configured in the host: Cloudflare (`not_found_handling: "404-page"`) or Hostinger (`ErrorDocument`).

Why not (b): the framework restructure is bigger than the problem, and the newest version also forces React 19 and Node 22.22+. Moving to React 19 is not needed for this goal and adds risk close to the deadline.

## 10. Phase 2 plan (for reference)

1. Add `vite-react-ssg@0.8.9`; change the build script to `vite-react-ssg build`; keep `vite` for dev.
2. Convert `main.jsx` and `App.jsx` to the route-array format. Routes come from one `src/routes.jsx` list built from `INDUSTRIES`, so a new industry or page adds its own HTML automatically.
3. Apply the SSR fixes in section 8. Render all content from the "hidden content" table.
4. Remove the custom `route-shells` plugin in `vite.config.js`. The SSG output replaces it.
5. Add `404.html`, `public/_redirects`, `wrangler.jsonc` `404-page` handling, and the matching `.htaccess` rules.
6. Evidence: first 80 lines of built `/` and `/qlik` HTML; zero hydration warnings.

## 11. Open questions

1. Will meridanta.com stay on Hostinger or move to Cloudflare? (section 7)
2. Trailing-slash policy: proposing trailing slash (`/qlik/`) as canonical. Confirm in Phase 3.
3. Cloudflare Workers Builds Node version: not verified from here. Add a `.nvmrc`/`NODE_VERSION` in Phase 2 and check the build log.
