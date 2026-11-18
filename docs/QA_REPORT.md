# QA report (Phase 7)

Date: 2026-11-18. Build tested: the production build of commit "Phase 7" (`npm run build`, no Turnstile key), served by a local test server that behaves like the live static host (real files and folder index files, gzip, real `404.html` with status 404, no rewrite rules). Browser: Microsoft Edge (Chromium engine) driven by Playwright; Lighthouse 12.8.2 for scores.

All automated suites are in `scripts/qa/` and can be repeated:
```
npm run build
npm run qa:serve            # in one terminal: serves dist on http://localhost:8090
npm run qa:routes           # routes, refresh, back/forward, 404, anchors
npm run qa:links            # navigation, footer, call-to-action and control clicks
npm run qa:layout           # 5 widths x 4 pages
npm run qa:crawler          # raw HTML per route, robots, sitemap, llms files
npm run qa:resilience       # JavaScript off, no requestIdleCallback, reduced motion, touch
npm run check:html          # built-HTML structure, links, JSON-LD, calls to action, canonical host
```
(`BROWSER_PATH` sets another Chromium-based browser; `BASE` sets another address.)

## Result in one table

| Area | Checks | Result |
|---|---|---|
| Routes: direct access, refresh, query strings, no-slash variants | 7 URLs x (status, title, h1, console, refresh) | **All pass** |
| Unknown paths | 5 URLs | **Real 404 status** and the "Page not found" page |
| Back / forward / client-side navigation | 6 | **All pass** |
| Anchors and deep links | 9 section anchors, 2 deep links (a case study, an accelerator), 1 cross-page section link | **All pass** (the section lands under the header) |
| Navigation, footer, call-to-action and control clicks | 63 (header, footer and breadcrumb links on 3 pages, 17 call-to-action buttons and cards, back-to-top, privacy dialog, search, mobile menu) | **All pass** |
| Layouts at 390, 768, 1024, 1440, 1920 px | 20 page/width combinations | **No horizontal scroll, no off-screen or overlapping text, no console messages** |
| Console errors and hydration warnings | 4 routes + unknown URL at 390 and 1440, in React development mode (shows every warning) and in the production build | **Zero** |
| Raw HTML (no JavaScript) | 4 routes + the 404 page | h1, key text, canonical, JSON-LD present; `/qlik/` has all 20 case studies |
| robots.txt, sitemap.xml, llms.txt, llms-full.txt | 4 files | Reachable and valid; every sitemap URL and every `llms.txt` link returns 200 |
| JavaScript off, no `requestIdleCallback` (Safari), slow script, reduced motion, touch | 12 | **All pass** |
| `npm run check:html` | all built pages | **0 errors** (25 warnings: the social links that still point to `#`) |

## Problems found and fixed in this phase

1. **Internal links pointed at non-canonical URLs.** Cards and buttons linked to `/qlik` and `/industries/healthcare` (no trailing slash) while the canonical URL, the sitemap and the files are `/qlik/` and `/industries/healthcare/`. Every such click went through a redirect on Hostinger and landed on a URL that differed from the canonical one. Fixed in `src/data.js`, `Products.jsx`, `Industries.jsx`, `NotFound.jsx`, `routes.jsx` and `searchIndex.js`. `npm run check:html` now fails if any internal link to a page lacks the trailing slash.
2. **Double scroll offset on "Proven Outcomes".** `/qlik/#case-studies` stopped 144 px from the top instead of 72 px because the block had its own `scroll-margin` on top of the page-wide `scroll-padding`. Fixed in `src/caseStudies.css`.
3. **Smooth scrolls could end in the wrong place.** The long Capabilities section skips rendering until it is near the screen (`content-visibility`, added for speed), so its size changes while a long smooth scroll passes it. A new helper `scrollToEl()` in `src/utils.js` checks the position at the end of the scroll and corrects it once. Used for section links, the router's scroll after a link click, and the deep links for case studies and accelerators.
4. **Crawler text of the home hero heading had a double space** ("Qlik  Center of Excellence"). Fixed in `Hero.jsx`.
5. **Search did not recognise "same page" with a trailing slash**, so choosing a result for the page you were on navigated instead of scrolling. Fixed in `Search.jsx`.

## Lighthouse (mobile, median of 3 runs, this build)

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 92 | 100 | 100 | 100 | 2.4 s | 0.002 | 272 ms |
| `/qlik/` | 99 | 100 | 100 | 100 | 1.8 s | 0 | 58 ms |
| `/industries/healthcare/` | 99 | 100 | 100 | 100 | 2.0 s | 0 | 12 ms |
| `/industries/communications-media-entertainment/` | 99 | 100 | 100 | 100 | 2.0 s | 0 | 17 ms |

**Honest note on the home page:** its performance score moves between **89 and 99** from run to run (median-of-3 results over this phase and the last: 98, 99, 98, 89, 92). The cause is timing: the app starts after the first paint, and whether that work falls inside Lighthouse's blocking-time window changes between runs; this workstation was also busy with other programs (about 33% CPU load before the tests), which adds noise. The other three pages stay at 99-100. The average meets the targets, but on the home page it is not guaranteed on every run. Re-measure on https://pagespeed.web.dev after the upload for the real, network-based figures.

## What was NOT tested (and why)

- **Firefox and Safari/WebKit.** Playwright's Firefox and WebKit builds are not installed on this computer and cannot be downloaded here, and Firefox/Safari themselves cannot be driven by this tool. Only Chromium (Edge) was run. The compatibility notes below come from browser documentation, not from running the site.
- **Real devices** (iPhone, Android), touch scrolling feel and the iOS address-bar behaviour.
- **The contact form against a live server** (PHP and Resend were not run here; see `docs/CONTACT_SETUP.md`), and **the Apache `.htaccess` rules** (redirects, 404 status, caching headers).
- Screen readers (NVDA, VoiceOver). Lighthouse accessibility scored 100 and keyboard operation of the menu, dialog and search was exercised, but a human screen-reader pass was not done.

### Browser compatibility notes (not tested)

| Feature used | Support | If missing |
|---|---|---|
| AVIF images (hero, Qlik picture) | Chrome, Edge, Firefox 93+, Safari 16.4+ | WebP version is used (`<picture>` fallback) |
| `content-visibility` (Capabilities section) | Chrome/Edge 85+, Firefox 125+, Safari 18+ | Ignored; the section renders normally (slightly slower first paint) |
| `requestIdleCallback` (starts the app) | Not in Safari | Fallback timer; emulated and tested here |
| `inert` attribute (inactive hero slides) | Chrome 102+, Firefox 112+, Safari 15.5+ | Slides are also `aria-hidden` and visually hidden |
| `fetchpriority` | Chrome 101+, Safari 17.2+, Firefox 132+ | Ignored |
| `@property` (animated card border) | Chrome 85+, Safari 16.4+, Firefox 128+ | Static border |
| `overflow-x: clip`, `svh`, `:focus-visible` | Safari 16 / 15.4 / 15.4 and newer | Minor layout/focus-ring differences on older versions |
| Position `sticky` stacked cards | All current browsers | Cards stack normally |

## Manual checks for you (please do before launch)

1. **Safari on a Mac and on an iPhone**: home hero (swipe, pause button), the stacked capability cards on `/qlik/` (scroll slowly), the case-study tabs, the mobile menu, the contact form with Turnstile, fonts and images.
2. **Firefox on desktop**: the same list, plus hover cards on the home page.
3. **Android Chrome**: the same list.
4. **Real contact enquiry** and the other tests in `docs/CONTACT_SETUP.md` section e.
5. **After uploading to Hostinger**: the 15 checks in `docs/DEPLOY_HOSTINGER.md` (especially `/qlik` redirecting to `/qlik/`, a random URL giving a real 404, and `/.htaccess` giving the 404 page).
6. **PageSpeed Insights** for the four URLs, and Google Search Console and Bing Webmaster Tools (verification and sitemap submission).
7. Share a link on LinkedIn or Slack and check the preview image and title.

## Known limitations (not defects)

- On the home page, section links (Services, Industries, and so on) scroll without changing the address bar; the URL stays `/`. That is the existing design; links to sections of other pages do change the URL.
- Long jumps (for example from the home page to `/qlik/#accelerators`) can end 30-70 px above or below the ideal position because images load while the page scrolls; the section heading is always visible.
- On the test server, `/qlik/unknown-page` returns status 404 and then shows the Qlik page, because the browser redirects the old `/qlik/*` addresses after loading. On Hostinger `.htaccess` redirects these addresses (301) before the page loads, so visitors never see the 404 page there.
- The five social icons still link to `#` (25 checker warnings) until the real profile URLs are added in `src/social.js`.
