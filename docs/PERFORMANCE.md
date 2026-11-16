# Performance report (Phase 6)

Measured 2026-11-16 with Lighthouse 12.8.2, Microsoft Edge (headless), **mobile** profile (412x823 screen, Lighthouse's default simulated slow-4G and 4x CPU slowdown). Each cell is the **median of 3 runs**. The pages were served by a small local static server that mimics a real host (gzip for text, folder index files, `404.html`), so the numbers show the build, not the network of Hostinger or Cloudflare. Before = the Phase 5 build; after = this build.

## Results (before → after)

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | FCP | Page weight |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 72 → **98** | 96 → **100** | 100 → **100** | 92 → **100** | 5.1 s → **2.2 s** | 0.002 → **0** | 2 → **95** ms | 4.0 s → 0.9 s | 991 → 399 KB |
| `/qlik/` | 70 → **99** | 100 → **100** | 100 → **100** | 100 → **100** | 5.5 s → **1.8 s** | 0.025 → **0** | 11 → **7** ms | 4.1 s → 1.1 s | 905 → 363 KB |
| `/industries/healthcare/` | 84 → **100** | 100 → **100** | 100 → **100** | 100 → **100** | 3.5 s → **1.3 s** | 0.001 → **0** | 0 → **0** ms | 3.5 s → 0.8 s | 465 → 186 KB |
| `/industries/communications-media-entertainment/` | 84 → **100** | 100 → **100** | 100 → **100** | 100 → **100** | 3.5 s → **1.3 s** | 0 → **0** | 0 → **0** ms | 3.5 s → 0.8 s | 465 → 186 KB |

Targets: every score at least 90 (met on all four routes, at 98-100), LCP under 2.5 s (met: 1.3-2.2 s), CLS under 0.1 (met: 0). INP is not available in a lab run; **total blocking time (TBT) is the lab stand-in** (0-95 ms, target under 200 ms). Real INP needs field data after launch (the Search Console "Core Web Vitals" report or the Chrome UX Report).

## What was changed

**Fonts.** Plus Jakarta Sans is now self-hosted (Latin and Latin Extended only, variable weights 200-800, `font-display: swap`) from `@fontsource-variable/plus-jakarta-sans` (SIL Open Font License). The Latin file is preloaded. The two Google Fonts requests that blocked rendering are gone (`src/fonts.css`, `src/Layout.jsx`, `index.html`).

**Images.**
- The hero images and the Qlik platform picture now have AVIF and WebP versions at several widths (`scripts/make-responsive-images.py`, `src/images.js`, `src/components/Picture.jsx`). Sizes: hero 157 KB → 27-68 KB, platform picture 211 KB → 23-96 KB depending on the screen.
- Explicit `width` and `height` everywhere (no layout shift) and `loading="lazy"` on everything below the fold, including the first accelerator picture and the contact picture.
- The LCP image of the home page and of `/qlik/` is preloaded with `fetchpriority="high"`. The viewport meta tag is now first in `<head>`: without that, phones resolved the preload's `sizes` as a 980 px screen and downloaded the wrong file in addition to the right one.
- The header and footer logos were 300 px wide files shown at 56 px; they are now 112 and 118 px WebP files (5 KB and 2 KB instead of 30 KB and 11 KB). Images under 4 KB are inlined; larger ones are cacheable files instead of base64 inside every HTML page (home HTML 234 KB → 98 KB).

**JavaScript and CSS.**
- Route-level code splitting: the Qlik page and the industry pages are separate chunks, so the home page no longer ships the Qlik page code and its 540-line case-study data. Home JS went from 371 KB to 124 KB gzipped.
- Critical CSS is inlined in each page by `beasties`, and the full stylesheet loads without blocking.
- **Hydration starts after the first paint.** The HTML is already complete, so the app script now starts when the browser is idle after load, or at the first pointer, touch, key or scroll event. This took the home LCP from 3.1 s to 2.2 s. Trade-off: for roughly the first second after load, controls that need JavaScript (mobile menu, tabs, slider arrows) are not active yet; ordinary links work immediately. The first sign of interaction starts loading at once, so in practice the delay is shorter.
- `content-visibility: auto` on the Capabilities section of `/qlik/` (the long stacked deck), so it is laid out only when it is near the screen. Applying it to the other Qlik sections cut load time a little more but made Lighthouse's contrast check misread the case-study text, so it is deliberately limited to that one section.
- Unused dependencies: none found (`simple-icons` is tree-shaken to the 10 icons used). New build-time-only dev dependencies: `beasties`, `jsdom`, `@fontsource-variable/plus-jakarta-sans`.

**Accessibility and SEO issues Lighthouse found, now fixed.** Hero slide dots have a 24 px hit area (same look); the two product cards no longer carry an `aria-label` that differed from their visible text; the generic "Learn More" links now say what they are about for screen readers and search engines ("Learn More about Healthcare", visually unchanged).

**Caching.** Files in `/assets/` have a content hash in their name, so they are served with `Cache-Control: public, max-age=31536000, immutable` (`public/_headers` for Cloudflare, `public/.htaccess` for Hostinger). Verified on the Cloudflare asset handler; the `.htaccess` rule needs a check on Hostinger after upload (the response headers of `/assets/*.js`).

## Remaining Lighthouse notes (informational)
- "Unused JavaScript", about 70 KB on the home page (React Router and shared components that are needed after hydration).
- "DOM size" on `/qlik/`: 1,884 elements, mostly the case-study text and accelerator panels that are kept in the HTML for search engines and AI crawlers.
- "Serve images in next-gen formats" and "responsive images" now only mention the small capability and accelerator pictures (13-23 KB each).

## How to repeat the measurement
```
npm run build
node scripts/check-html.mjs        # structure, links, JSON-LD, calls to action
npx lighthouse http://localhost:<port>/qlik/ --form-factor=mobile
```
Serve `dist` with any static server that supports gzip; the numbers above came from a small custom one.

## Conversion changes (same phase)
- Every call-to-action leads to the contact form: `npm run check:html` now fails if a "Talk to...", "Get in Touch", "Discuss..." or "consultation" link points anywhere else.
- Contact links on the Qlik and Healthcare pages (hero buttons, floating button, header, accelerator buttons) now pass the service: `/?interest=qlik#contact` and `/?interest=healthcare#contact`. The form's **Area of interest** list pre-selects "Qlik Solutions & Accelerators" or "Healthcare Insights", and the visitor can change it. The Communications/Media page and the home page pre-select nothing (no matching option). The keys are defined in `INTEREST_KEYS` in `src/data.js`.
- Real delivery of the form is **waiting for your decision**: see `docs/CONTACT_FORM.md`.
