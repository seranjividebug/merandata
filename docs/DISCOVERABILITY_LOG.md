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

## Phase 3: SEO foundations and crawler access (2026-11-16)

**Done**
- `src/seo.js` (new): one place for site constants, per-page title and description **[SRI]**, canonical URL policy, crawler lists and the training-crawler switch. Industry pages are generated from `INDUSTRIES`; a new industry without a hand-written entry gets an automatic title/description and a build warning if it is outside the length targets.
- `src/components/PageMeta.jsx` writes into every prerendered page: title, description, canonical, Open Graph (type, site name, locale, title, description, url, image, width, height, alt) and Twitter Card (summary_large_image). The 404 page gets `noindex` and no canonical.
- **Canonical policy:** `https://meridanta.com` + path, **trailing slash on every page except the root** (`/qlik/`, `/industries/healthcare/`). This matches the `dist/<route>/index.html` output and what Hostinger and Cloudflare already redirect to.
- Titles are 53 to 60 characters and descriptions 144 to 152 characters on all four pages (target 50-60 and 140-160). The build prints `[seo]` warnings if a future page falls outside the range or duplicates another.
- `public/og-image.png` (1200x630, brand navy, logo, "Outcome-driven AI, Data & Cloud Solutions"). Favicon set from the existing logo: `favicon.ico` (16/32/48), `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `site.webmanifest`, plus `theme-color` `#0C1230` and `html lang="en"` (already present).
- **Generated at build time** from the data files by `src/seoFiles.js` and `src/llmsText.js` (called from `vite.config.js`):
  - `sitemap.xml`: one entry per page in `PAGES`, with `lastmod` = date of the last git commit that touched that page's source files (falls back to the build date if git history is unavailable).
  - `robots.txt`: `User-agent: *` allow, explicit allow groups for Googlebot, Bingbot, DuckDuckBot, Applebot, OAI-SearchBot, PerplexityBot, Claude-SearchBot, ChatGPT-User, Perplexity-User, Claude-User, Amazonbot and the training crawlers GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, plus the `Sitemap:` line.
  - `llms.txt` (3.8 KB overview with links to each page and to featured case studies) and `llms-full.txt` (31 KB, the full text of services, industries, Qlik offerings and capabilities, accelerators, all 20 case studies and the trademark notice).
- Future-proofing: adding an industry to `src/data.js`, an accelerator to `src/accelerators.js` or a case study to `src/caseStudies.js` updates the HTML pages, sitemap, `llms.txt` and `llms-full.txt` on the next build. Adding a new top-level page needs one entry in `PAGES` (`src/seo.js`) and one in `src/routes.jsx`.

**[DECISION] pending: AI training crawlers**
`ALLOW_AI_TRAINING = true` in `src/seo.js` (default until decided). If the answer is "no", set it to `false`: GPTBot, ClaudeBot, Google-Extended, Applebot-Extended and CCBot then get `Disallow: /`, while search, AI search and user-triggered fetchers stay allowed.

**Files changed**
`src/seo.js`, `src/seoFiles.js`, `src/llmsText.js`, `src/components/PageMeta.jsx`, `src/pages/{Home,QlikOverview,IndustryPage,NotFound}.jsx`, `vite.config.js`, `index.html`, `public/og-image.png`, `public/favicon.ico`, `public/favicon-16x16.png`, `public/favicon-32x32.png`, `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `public/site.webmanifest`.

**Evidence**
- Head tags checked in the built HTML for all five pages (title/description lengths, exactly one canonical on indexable pages, `noindex` on 404, OG and Twitter present).
- Served through the real Cloudflare asset handler (`wrangler dev`): `/robots.txt` 200 `text/plain`, `/sitemap.xml` 200 `application/xml`, `/llms.txt` and `/llms-full.txt` 200 `text/plain`, `/og-image.png` 200 `image/png`, `/favicon.ico`, `/apple-touch-icon.png`, `/site.webmanifest` 200, unknown path 404.
- Zero console errors or hydration warnings on all routes at 1440px and 390px.

**Open TODOs**
- `SITE.twitterSite` (X handle) is empty; `twitter:site` is omitted until it is set.
- The `og-image.png` and favicons are generated from the current logo files. Replace `public/og-image.png` if the brand team has a designed version (keep 1200x630).
- `llms.txt` contact section only links to the website contact form. Email, phone and address will be added from `src/company.js` in Phase 4.
- `lastmod` uses git history; on a shallow clone every page gets the date of the latest commit.

### Manual checklist for the owner: Cloudflare AI crawler settings
Cloudflare dashboard setting names change over time; look for these features under the zone's Security / Bots / AI sections. These only affect meridanta.com once the domain is proxied through Cloudflare (today it is on Hostinger; the workers.dev address is not affected by zone settings).
1. **Block AI bots / "AI Scrapers and Crawlers":** set to *allow* (or leave off) if you want AI search and assistants to read the site. If it is on, Cloudflare blocks the AI crawlers before they ever reach `robots.txt`.
2. **Managed robots.txt (Content Signals Policy):** if enabled, Cloudflare adds its own rules to the top of `/robots.txt`. Either turn it off or check that it does not contradict `src/seo.js`.
3. **AI Crawl Control (formerly AI Audit):** review the list of crawlers and set the ones from `CRAWLERS` in `src/seo.js` to *allow*. Set GPTBot, ClaudeBot, Google-Extended, Applebot-Extended and CCBot to match your training decision.
4. **Bot Fight Mode / Super Bot Fight Mode / WAF rules:** confirm they do not challenge or block Googlebot, Bingbot and the AI crawlers.
5. **After deploying:** open `https://meridanta.com/robots.txt` in a private window and confirm it matches the generated file (no extra `Disallow` or `Content-Signal` lines you did not choose).
6. **Verify** with `curl -A "GPTBot" -I https://meridanta.com/`, `curl -A "ClaudeBot" -I https://meridanta.com/` and `curl -A "PerplexityBot" -I https://meridanta.com/`: each should return `200`, not `403`.

## Phase 4: structured data and semantics (2026-11-16)

**Done**
- `src/company.js` (new): single source of truth for company facts **[SRI]**: name, legal name, URL, logo, description, slogan, email, phone, address, founding date, `areaServed` (United States, India), `knowsAbout` (built from the services, Qlik capabilities, industries and product names in the site content) and `sameAs` (only real social URLs). Unconfirmed fields are empty strings, are not shown on the page and are left out of the JSON-LD. It is reused by the footer (legal name in the copyright line, contact details), the contact section, the About section copy, the JSON-LD (`src/schema.js`) and `llms.txt` / `llms-full.txt`.
- `src/schema.js` (new): JSON-LD built from `company.js`, `seo.js` and the content data, written into each prerendered page by `PageMeta` (one `@graph` per page, `<` escaped for safety):
  - **Organization + WebSite + WebPage** on every page.
  - **Service** (provider = Organization): the 4 services on `/` and the 4 Qlik COE offerings on `/qlik/`.
  - **BreadcrumbList** on `/qlik/` and both industry pages. The same trail data (`PAGES[].trail` in `src/seo.js`) drives the visible breadcrumb, so the two cannot differ.
  - **ItemList** of the 20 published case studies on `/qlik/` (same order as the page, featured first), each linking to `/qlik/#case-<id>`.
  - **FAQPage**: the generator exists (`faqPage()`, used when a page lists `faqs`), but no page has visible FAQs, so none is emitted. The checker fails the build if a FAQPage appears without a visible `[data-faq]` block.
- Semantics fixes: footer column titles are now `<h2>` (they were `<h4>`, which skipped levels); the hidden case-study text blocks no longer use unnamed `<section>` elements; the home hero `<h1>` now contains the word "Qlik" as text (the logo image is decorative and hidden from assistive tech, so there is no duplicate announcement).
- `scripts/check-html.mjs` (new, `npm run check:html`; `npm run check:html:write` also writes the inventories): reads the built HTML without running JavaScript and checks one `<h1>` per page, heading order, landmarks (`header`, `nav`, `main`, `footer`), section names, duplicate ids, `lang`, image alt text, every link (page exists, `#anchor` exists, `#case-*` / `#accelerator-*` deep links resolve, `rel="noopener noreferrer"` on external links), canonical, title/description length, and JSON-LD (valid JSON, required fields, `@id` references resolve, no empty values). Exits 1 on errors.

**Files changed**
`src/company.js`, `src/schema.js`, `src/components/ContactDetails.jsx` (new), `src/components/{PageMeta,Footer,Contact,About,Hero,QlikLogo,CasePanel}.jsx`, `src/pages/{QlikOverview,IndustryPage}.jsx`, `src/seo.js`, `src/llmsText.js`, `src/styles.css`, `scripts/check-html.mjs`, `package.json` (scripts, `jsdom` dev dependency), `docs/IMAGE_ALT.md`, `docs/LINK_INVENTORY.md`, `docs/JSONLD_EXAMPLES.md`.

**Evidence**
- `docs/JSONLD_EXAMPLES.md`: full JSON-LD for `/` (Organization, WebSite, WebPage, 4 Services) and `/qlik/` (adds BreadcrumbList, 4 Services, ItemList of 20 cases).
- `docs/IMAGE_ALT.md`: all 36 images and meaningful inline SVG graphics with their alt text (24 with descriptive alt, 12 decorative with `alt=""`, 0 missing).
- `docs/LINK_INVENTORY.md`: all 163 links across 5 pages. Result: **0 errors**; every internal page, anchor and deep link resolves; the only warnings are the 5 social links that still point to `#` on each page (25 in total).
- `npm run check:html`: 0 errors, 25 warnings (all the placeholder social links). Zero hydration or console errors on all routes at 1440px and 390px.

**Open TODOs**
- **Social links:** `src/social.js` still points to `#`. They are not published in `sameAs`. Add the real profile URLs before launch (or hide the icons until then).
- Fill in `src/company.js`: legal name, email, phone, address, founding date **[SRI]**. They then appear in the footer and contact section, in the JSON-LD, and in `llms.txt`.
- The checker warns on `href="#"`. It is expected to report 0 warnings once the social URLs are real.
- No external links exist yet besides the social placeholders, so the `rel` rule is verified only on the social icons (they have `rel="noopener noreferrer"`).
- FAQs: none exist. Phase 5 suggests candidate questions for Sri; if approved, add `faqs` to the page in `src/seo.js` and render them with `data-faq`.

## Phase 5: content review pack (2026-11-16)

**Done**
- `docs/CONTENT_REVIEW.md` (new, 440 lines) for Sri, with Approve / Edit / Remove columns:
  1. The eight decisions that matter most.
  2. Page by page (Home with all its sections, Qlik, Healthcare, Communications/Media/Entertainment): current headline, description, key copy, meta title and description, and the JSON-LD values.
  3. Discoverability suggestions: "who / what / for whom / proof" statements, entity-rich phrasing (Snowflake, Databricks, Azure, AWS are absent from the home and Qlik introductions), 13 draft FAQ questions, content gaps.
  4. Wording to check (not changed).
  5. Qlik and third-party branding check: mention counts per brand and page, trademark notices today, logo usage table, and a search for partner, certified or endorsement wording.
  6. All TODOs and unverified claims in tables: 15 company/site items, 20 case studies with their numbers, 5 accelerators, content in the code that is not shown.
- `scripts/build-content-review.mjs` (new) generates the pack from the data files and the built HTML, so it can be regenerated after Sri's changes: `npm run build && node scripts/build-content-review.mjs`.
- One obvious typo fixed in unpublished data: "ADLF Integration" to "ADLS Integration" in `QLIK_ACCELERATORS` (`src/data.js`). No visible website wording was changed.

**Files changed**
`docs/CONTENT_REVIEW.md`, `scripts/build-content-review.mjs`, `src/data.js` (typo), `docs/DISCOVERABILITY_LOG.md`.

**Evidence**
- Brand mentions are counted from the built HTML: /qlik/ has 114 Qlik, 25 QlikView, 20 Qlik Replicate, 12 NPrinting, 7 Talend and 4 Power BI mentions; the home page has 11, 0, 0, 0, 3 and 2; the industry pages have none.
- The only text matching partner / certified / official / endorse is "Certification programs" in the Training offering.

**Open TODOs (all need Sri)**
- Case studies and accelerators came from a deck carrying another company's branding; the code asks that anything Meridanta cannot claim be unpublished.
- Qlik / Talend partner status, certification wording, and the "Qlik Center of Excellence" name.
- Company facts, social URLs, the public "Preview build" note on the contact form.
- The unused impact data says "40 hrs typical Qlik migration" while a published case says a QlikView to Qlik Cloud migration took "2 months": confirm which is true.

## Phase 6: performance and conversion (2026-11-16)

**Done** (details and the before/after table are in `docs/PERFORMANCE.md`)
- Lighthouse mobile, median of 3: **performance 98-100, accessibility 100, best practices 100, SEO 100 on all four routes** (before: 70-84, 96-100, 100, 92-100). LCP 5.1 / 5.5 / 3.5 / 3.5 s to 2.2 / 1.8 / 1.3 / 1.3 s, CLS 0.002 / 0.025 to 0, TBT 0-95 ms. Page weight 991 to 399 KB (home) and 905 to 363 KB (`/qlik/`).
- Self-hosted font with preload; responsive AVIF/WebP images with a preloaded LCP image; smaller logos; lazy below-the-fold images; route-level code splitting; inlined critical CSS; hydration after first paint; `content-visibility` on the Capabilities section; one-year immutable caching for `/assets/*`.
- Conversion: contact links from the Qlik and Healthcare pages pre-select the service of interest in the form; `npm run check:html` fails if any call-to-action does not lead to the contact form.
- `docs/CONTACT_FORM.md`: three real-delivery options (Worker + Resend, Microsoft Graph, Power Automate) with Turnstile, honeypot, server-side validation, cost, setup steps and acceptance tests.

**[DECISION] pending: contact form delivery.** Not implemented. Choose A, B or C in `docs/CONTACT_FORM.md` and say whether meridanta.com stays on Hostinger. The form still only simulates sending and still shows the public "Preview build" note.

**Files changed**
`vite.config.js`, `index.html`, `package.json`, `package-lock.json`, `src/main.jsx`, `src/Layout.jsx`, `src/routes.jsx`, `src/nav.js`, `src/data.js`, `src/styles.css`, `src/fonts.css` (new), `src/images.js` (new), `src/components/Picture.jsx` (new), `src/pages/IndustryRoute.jsx` (new), `src/components/{Hero,Header,Footer,Contact,AcceleratorsCard,SpotlightCard,Industries}.jsx`, `src/pages/QlikOverview.jsx`, `scripts/make-responsive-images.py` (new), `scripts/check-html.mjs`, `public/_headers` (new), `public/.htaccess`, new image files in `src/assets`, `docs/PERFORMANCE.md`, `docs/CONTACT_FORM.md`.

**Open TODOs**
- Check the `.htaccess` caching rule on Hostinger after upload (`curl -I https://meridanta.com/assets/<file>.js` should show the one-year `Cache-Control`).
- INP needs field data after launch.
- Deferred hydration means JavaScript-only controls wake up about a second after load. If that is not acceptable, remove `deferHydration` in `vite.config.js` (the home LCP goes back to about 3 s on this test).
