# Meridanta Website – AI Search Discoverability: Status Report

**Date:** 23 November 2026 &nbsp;|&nbsp; **Prepared for:** Srivatsan (Sri) &nbsp;|&nbsp; **Website:** https://meridanta.com

## Executive summary

- **The problem:** until now the website's words were invisible to AI assistants (ChatGPT, Perplexity, Claude, Gemini) and to most search engines. Each page arrived empty and only filled in when a browser ran code, so there was nothing for them to read, quote or recommend.
- **What is now in place:** every page carries its full text in the page itself (4 services, 7 Qlik capabilities, 5 accelerators, all 20 case studies), plus its own title, description, share image and company data for search engines. A sitemap, a crawler-access file and two plain-text summaries (`llms.txt`, `llms-full.txt`) tell AI systems where to look. Pages load roughly 2 to 3 times faster, and the footer shows the registered office and email.
- **The contact section** currently shows a clean email card ("Email us at srivatsans@meridanta.com", a "Send us an email" button and the registered office), because the enquiry form's server setup is not done yet. The form is built and can be switched on with one setting once that setup is finished, so visitors never meet a form that cannot send.
- **What is left:** your content decisions (section 4), the one-time contact-form setup and the upload to Hostinger, a check of the live site (redirects, 404 status), submitting the sitemap to Google and Bing, and testing in Firefox, Safari and on real phones.

## 1. Claims verified against the code and a fresh build

Verified on 23 Nov 2026 with a clean production build, scripts in the repository (`npm run verify`, `check:html`, `qa:*`) and Lighthouse. ✅ verified · 🟡 partly · ❌ not true.

| # | Claim | Result | Evidence | Fixed now? |
|---|---|---|---|---|
| 1 | Every page has its full content in the HTML, not only the active slide or tab | ✅ | Home: 3/3 hero slides, 4/4 services, 24/24 service items, 2/2 industries. `/qlik/`: 7/7 capabilities (21/21 bullets), 4/4 offerings, 5/5 accelerators (all challenge, solution and benefit text), 20/20 case studies (165/165 story bullets). Inactive accelerator panels, inactive case-study tabs and the 19 other case studies are in the HTML and are hidden only with a CSS class (not the `hidden` attribute), so text readers that skip hidden elements still see them. A strict-reader check (`npm run verify`) confirms each of the 20 case studies is one complete article with its own title, audience, summary, stats and all four blocks (challenge, solution, outcome, result) exactly once. Both industry pages contain their challenges, opportunities and capabilities text. | No change needed |
| 2 | Unique title, description, canonical, Open Graph and Twitter tags with an og:image | ✅ | 9 pages (7 indexable, 2 noindex drafts), titles 51 to 60 characters, descriptions 144 to 152, all unique; canonical `https://meridanta.com/` plus path; `og:image` = `https://meridanta.com/og-image.png` (file present, 1200×630); `twitter:card` = `summary_large_image`. The 404 page is `noindex`. | No change needed |
| 3 | sitemap.xml, robots.txt (search and AI crawlers allowed), llms.txt and llms-full.txt | ✅ | `sitemap.xml`: 7 URLs (the 2 noindex drafts are not listed), all return 200. `robots.txt`: 4 search crawlers and 10 AI crawlers named and allowed, 0 "Disallow: /" lines, `Sitemap:` line present. `llms.txt` (3.9 KB) and `llms-full.txt` (31 KB, includes all 20 case studies); all links in `llms.txt` return 200 (now including `/privacy/`). | No change needed |
| 4 | JSON-LD: Organization, WebSite, Service, BreadcrumbList on the right pages | ✅ | All blocks parse as valid JSON. Home: Organization, WebSite, WebPage, 4 Services. `/qlik/`: adds BreadcrumbList, 4 Qlik Services and an ItemList of 20 case studies. Industry pages: Organization, WebSite, WebPage, BreadcrumbList. No BreadcrumbList on the home page. This is a structural check; no external schema validator was run. | **Yes:** the verification found a bug (the Qlik service URL read `/qlik//`); fixed, and the checker now rejects double slashes |
| 5 | One h1 per page, logical heading order, alt text, a proper 404 page, the 301 redirects, direct link and refresh on every route | 🟡 | One `<h1>` per page and 0 heading-level jumps on all 9 pages. 45 images: 23 with descriptive alt text, 22 decorative (`alt=""`), 0 missing. `404.html` is "Page not found" and returns a real 404 on the test host. Direct access and refresh pass on all routes (32 checks). The 301 rules (`/services`, `/about`, `/products`, `/industries`, `/qlik/*`, http to https, www to non-www) are in `public/.htaccess`; the same list returned 301 on the Cloudflare asset handler. **The `.htaccess` itself could not be run here (no Apache), so the redirects and the real 404 status on Hostinger are confirmed only after upload.** | No: verify after upload (`docs/DEPLOY_HOSTINGER.md`) |
| 6 | Performance optimizations applied; Lighthouse mobile score per route | ✅ | AVIF and WebP images (hero 157 KB to 27–66 KB), `loading="lazy"` on below-the-fold images, self-hosted font preloaded with `font-display: swap`, no Google Fonts requests, route code splitting (Qlik page 30 KB loaded only on its own page), critical CSS inlined, below-the-fold home sections render only when near the screen. Scores in section 2. | **Yes:** below-the-fold home sections now render only when near the screen |
| 7 | Registered office and email in the footer and in the Organization JSON-LD | ✅ after the fix | Footer on all 9 pages: "Registered Office: 262 Chapman Rd, Ste 240, Newark, DE 19702, USA" and a `mailto:srivatsans@meridanta.com` link. Organization JSON-LD: `email`, `address` (PostalAddress) and `location` named "Registered Office". Also in `llms.txt` and in the contact card. | **Yes: this was not true before today.** The data was missing from the code (empty placeholders); added from your details |
| 8 | Contact form: posts to `/api/contact.php` with honeypot, Turnstile and server-side validation; sends to srivatsans@meridanta.com via Resend once configured; mailto fallback (no fake success) while not configured; "Preview build" note gone | 🟡 | The form and `public/api/contact.php` are complete (honeypot, Turnstile check, validation, 5-per-hour rate limit, Resend call, 503 until `../meridanta-config.php` exists). A **feature flag** (`VITE_CONTACT_FORM_ENABLED`, default `false`) now keeps the form off until setup is done; the site then shows the email card. All three build modes were tested: off shows the card; on with a Turnstile key shows the form (9/9 mocked-server tests: 200 shows thank-you; 503, 403, network failure, a host without PHP and a wrong response body show the error with the `mailto:` link; 429 and 422 have their own messages); on without a key prints a warning and falls back to the card. No "Preview build" text anywhere. **Not verified: the PHP has never been executed (no PHP here), so email delivery is untested.** | **Yes:** feature flag and email card added. Verify the live form after setup and upload |

## 1a. Fixes after the live check (19 Nov 2026)

A check of the live https://meridanta.com/qlik/ found four problems. All are fixed in the v4 package.

| # | Problem found live | Fix | How it is guarded |
|---|---|---|---|
| 1 | All 5 footer social icons linked to `#` | Every URL in `src/social.js` is empty again; only icons with a real `https://` address are drawn, and the whole block disappears while all are empty. | `npm run verify` fails if any built page contains `href="#"` or a social URL that is neither empty nor `https://` |
| 2 | Case-study text looked mixed up to a crawler (case 1 showed only Challenge; case 2 lost its title, summary and stats) | Inactive tabs, panels and the archive are hidden with a CSS class, not the `hidden` attribute that some readers drop. Every case is one complete `<article>`. | `npm run verify` reads the page like a strict reader and checks all 20 cases: own title, audience, summary, stats and each bullet of the four blocks exactly once, under the right title |
| 3 | Stat read "5 days business days" | Label changed to "to complete" (value "5 days"); one more repeated label ("read once, write many") also reworded | `npm run verify` fails if a stat label repeats its value |
| 4 | "Privacy Policy" in the footer was plain text | New `/privacy/` page (prerendered, in the sitemap, `llms.txt`, `llms-full.txt`), linked from the footer and the contact section | `npm run verify` checks the page, the sitemap and llms entries and the footer link. **DRAFT: Sri to review** (see `docs/CONTENT_REVIEW.md`) |

Still needed from you: the real social profile URLs (or leave them hidden), and Sri's review of the privacy text.

## 1b. New header, hero banners, /contact page and Qlik word (23 Nov 2026)

DRAFT: the wording of the banners, the page title and description of `/contact/` and the Services menu targets need Sri's review (`docs/CONTENT_REVIEW.md`, decision 10).

| Area | What changed | Guarded by |
|---|---|---|
| Header | Full-width bar (32 px side padding), logo and name with the small tagline "AI. DATA. CLOUD. TRANSFORMING BUSINESS." under them, nav group right-aligned (Home, Services, Industries, Products & Solutions, About Us), "Let's Talk" button (the words "get in touch" are in the button's accessible name). | `npm run verify` (nav, tagline and button on all 9 pages) |
| Services dropdown | Opens on hover, click and keyboard (aria-expanded), closes on Escape or when focus leaves; on phones it is an expandable group. Items: Consulting & Delivery, AI Solutions & Services, Data Engineering & Analytics, Qlik Center of Excellence (`/qlik/`). The three service pages do not exist yet, so those items go to the home page's Services section; the intended URLs are stored in `src/data.js` (`SERVICE_MENU`, field `future`). | `npm run qa:links` (hover, click, Tab, Enter, Escape, mobile) |
| Hero banners | Three new banners (headline, tagline, short description, button). Only banner 1's headline is the `<h1>`; the others are `<h2>`. All text is in the HTML. The whole banner is one link (one overlay `<a>`), the button is its visible label. 520 to 540 px tall at 1440 px, sizes to its content on phones, 700 ms crossfade, 7 s autoplay, pauses on hover and focus, arrows, dots, reduced motion respected. | `npm run verify`, `qa:links`, `qa:resilience` (swipe, dots, reduced motion) |
| /contact/ | New prerendered page (h1, intro, email card or form by the existing `VITE_CONTACT_FORM_ENABLED` flag, registered office, privacy link), `ContactPage` JSON-LD, in the sitemap, `llms.txt` and `llms-full.txt`. Home keeps a short call-to-action band. Every "Get in Touch / Talk to ... / Discuss ..." button goes to `/contact/`; `?interest=` is kept. The old `/#contact` address redirects to `/contact/` in the browser. | `npm run verify`, `check:html`, `qa:links`, `qa:contact`, `qa:crawler` |
| Qlik logo | Removed everywhere on 25 Nov 2026 (Sri's instruction): Qlik is the plain word on the cards, tiles, diagrams, hero and contact page. `npm run verify` (CLAIM G) fails if a Qlik logo file or icon is used. | `npm run verify` |

## 1c. Service pages (23 Nov 2026)

DRAFT: all wording is for Sri to review (`docs/CONTENT_REVIEW.md`, decision 12).

| Page | Status | Notes |
|---|---|---|
| `/services/data-engineering-analytics/` | Built with Sri's content (hero and section 2: six capability cards with five bullets each, closing call-to-action band). Indexable. | In the sitemap, `llms.txt`, `llms-full.txt`, the Services dropdown and the "What We Do" card. Service and BreadcrumbList JSON-LD. More sections will be added in `src/services.js`. |
| `/services/consulting-delivery/` and `/services/ai-solutions/` | **DRAFT – full content pending from Sri.** Built from the "What We Do" card text (tagline as the h1, description, the six bullets as capability items). | `noindex`, so they are left out of the sitemap, `llms.txt` and the JSON-LD service URL until approved; they are in the dropdown and linked from their cards. To publish one, remove `noindex: true` in `src/services.js`. |

All three use one template (`src/pages/ServicePage.jsx`) driven by `src/services.js`. Every contact button on them goes to `/contact/?interest=...` for that service. Checked by `npm run verify` (CLAIM F), `check:html`, `qa:links`, `qa:crawler`, `qa:layout`.

## 1d. Compact home page, menu labels and Qlik word (25 Nov 2026)

Everything stays on the home page (no new pages). Heights at 1440 px, before and after:

| Section | Before | After |
|---|---|---|
| About | 1053 px | 561 px |
| Industries We Serve | 902 px | 654 px |
| Products & Solutions | 1259 px | 701 px |
| Whole home page | 5623 px | 4265 px |

Section padding is 64 px (40 px on phones) and the heading block margin is 28 px. About is now two columns (statement, copy and "Let's Talk" on the left, the three principles as a short list on the right). Products & Solutions is one row of three compact cards (the Talend frameworks are behind "+ more"). The Industries cards are about 370 px tall and the text is in the page once. The menu is Home, Services, Industries, Products & Solutions, About Us (header, mobile menu and footer) and scrolls to `/#industries`, `/#solutions` and `/#about`. The Qlik logo is removed everywhere: Qlik is the plain word, and `npm run verify` (CLAIM G) fails if a Qlik logo file or icon is used. DRAFT: Sri to review.

## 2. Lighthouse mobile scores (final build, median of 3 runs)

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | Blocking time |
|---|---|---|---|---|---|---|---|
| `/` | 99 | 100 | 100 | 100 | 2.0 s | 0 | 9 ms |
| `/qlik/` | 99 | 100 | 100 | 100 | 1.8 s | 0 | 16 ms |
| `/industries/healthcare/` | 100 | 100 | 100 | 100 | 1.3 s | 0 | 19 ms |
| `/industries/communications-media-entertainment/` | 100 | 100 | 100 | 100 | 1.4 s | 0 | 0 ms |

Before the work (same method): performance 70 to 84, LCP 3.5 to 5.5 s, page weight 465 to 991 KB; now 187 to 401 KB. **Note:** the home-page performance score varies between runs (earlier today it ranged from about 75, while other programs were using the computer, to 97) because of when the page's scripts start. Confirm with https://pagespeed.web.dev after the upload.

## 3. Checklist status (Sri's 33 items)

✅ Done · 🟡 Partly done · ⏳ Pending · 🔒 Blocked. Owner: **Dev** · **Sri (content)** · **Seranjivi (manual)** · **Decision**. "Verify after upload" means it can only be confirmed on the live Hostinger site.

| # | Item | Status | Evidence / where to check | Owner | Next step |
|---|---|---|---|---|---|
| 1 | Audit current React architecture. | ✅ | `docs/AUDIT.md` (stack, routes, what crawlers saw, tool comparison) | Dev | None |
| 2 | Implement prerendering or static-site generation for critical routes. | ✅ | vite-react-ssg; 9 pages plus `404.html` built as full HTML (`docs/PHASE2_EVIDENCE.md`) | Dev | None |
| 3 | Verify initial HTML content availability. | ✅ | Claim 1: all services, 7 capabilities, 5 accelerators, 20 case studies in the raw HTML (`npm run verify`) | Dev | None |
| 4 | Verify direct URL access and refresh behaviour. | 🟡 | Passes on the test host (32 route checks, `docs/QA_REPORT.md`). Folder-per-route files are what Hostinger serves | Seranjivi (manual) | Verify after upload: open each route directly and press F5 (`docs/DEPLOY_HOSTINGER.md` rows 2 to 4) |
| 5 | Configure page titles and meta descriptions. | ✅ | Claim 2: unique, in range (`src/seo.js`). Wording is also in the review pack | Dev | None |
| 6 | Configure canonical URLs. | ✅ | Claim 2: `https://meridanta.com` plus path, trailing slash, one per page | Dev | None |
| 7 | Implement XML sitemap. | ✅ | Claim 3: `sitemap.xml`, 7 URLs, generated from the page list | Dev | None |
| 8 | Configure robots.txt. | ✅ | Claim 3: search and AI crawlers named and allowed, sitemap line | Dev | None |
| 9 | Review crawler access. | 🟡 | `robots.txt` allows search and AI crawlers. AI training crawlers (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot) are allowed by default | Decision | Sri: confirm or block AI training crawlers. After upload check the live `robots.txt` |
| 10 | Validate homepage and Qlik page. | 🟡 | Technical validation done (claims 1 to 5, `docs/QA_REPORT.md`). Content review pending | Sri (content) | Review `docs/CONTENT_REVIEW.md`, Home and Qlik sections, and give feedback |
| 11 | Begin homepage and Qlik content refinement. | ⏳ | `docs/CONTENT_REVIEW.md` section 3 has draft "who, what, for whom, proof" statements, entity wording and FAQ questions | Sri (content) | Approve, edit or reject the suggestions |
| 12 | Implement Organization and WebSite structured data. | 🟡 | Claim 4 and `docs/JSONLD_EXAMPLES.md`. Email and registered office are included; legal name, phone and founding date are not yet known | Sri (content) | Review the values; supply legal name, phone and founding date |
| 13 | Implement relevant Service structured data. | 🟡 | Claim 4: 4 services on the home page, 4 Qlik offerings on `/qlik/`, built from the site copy | Sri (content) | Confirm the service descriptions are the wording you want search engines to use |
| 14 | Correct semantic heading hierarchy. | 🟡 | One `<h1>` per page and 0 heading jumps on all 9 pages; header, nav, main, footer landmarks | Sri (content) | Review heading wording in the content pack (for example the home page's first heading is "Qlik Center of Excellence") |
| 15 | Review content for crawlability. | ✅ | Claim 1 and `scripts/qa/crawler.mjs`: all content readable without JavaScript | Dev | None |
| 16 | Verify image alt text. | ✅ | 45 images: 23 described, 22 decorative, 0 missing (`docs/IMAGE_ALT.md`) | Dev | None |
| 17 | Review internal navigation and links. | ✅ | 346 links checked, none broken, all internal links use the canonical form (`docs/LINK_INVENTORY.md`). Every contact call to action goes to `/contact/`. The social icons are hidden until Sri supplies the profile URLs | Dev | Add the real social URLs when available |
| 18 | Refine homepage and Qlik service descriptions. | ⏳ | Current wording and suggestions in `docs/CONTENT_REVIEW.md` | Sri (content) | Provide the agreed wording |
| 19 | Review About, Services, Industries, Products and Contact content. | ⏳ | `docs/CONTENT_REVIEW.md` section 2 (page by page) | Sri (content) | Review and mark Approve / Edit / Remove |
| 20 | Review Qlik branding and product references. | ⏳ | `docs/CONTENT_REVIEW.md` section 5 (mentions, trademark notices, logos, partnership wording) | Sri (content) | Decide on partner status, the "Qlik Center of Excellence" name and logo use |
| 21 | Implement basic performance optimizations. | ✅ | Claim 6 and `docs/PERFORMANCE.md` | Dev | None |
| 22 | Validate mobile and desktop layouts. | ✅ | 45 layout checks (9 pages at 390, 768, 1024, 1440, 1920 px) and a 320 px width check (no horizontal scroll) | Dev | None |
| 23 | Test Chrome, Edge, Firefox and Safari. | 🟡 | Edge (the same engine as Chrome) fully tested. Firefox and Safari could not be installed here (`docs/QA_REPORT.md`) | Seranjivi (manual) | Test Firefox and Safari (Mac and iPhone) with the checklist in the QA report |
| 24 | Test desktop, tablet and mobile. | 🟡 | Desktop, tablet (768 px) and phone (390 px) widths, touch input and reduced motion tested in an emulated browser | Seranjivi (manual) | Test on a real iPhone, iPad and Android phone |
| 25 | Test all navigation links and CTAs. | ✅ | 63 click tests (header, footer, breadcrumbs, call-to-action buttons, search, mobile menu) and 27 contact-card checks all pass | Dev | None |
| 26 | Test contact forms and email delivery. | 🟡 | The form and its server code are built and tested with mocked answers; the site currently shows the email card. Email delivery was never run (no PHP here) | Seranjivi (manual) | Verify after upload: do the Resend, Turnstile and config-file setup, switch the form on, send a real enquiry (`docs/CONTACT_SETUP.md`) |
| 27 | Test sitemap and robots.txt. | ✅ | Claim 3: valid XML, every URL returns 200; robots lists all crawlers | Dev | None |
| 28 | Test direct access and refresh of all public routes. | 🟡 | Same evidence as item 4 (all 8 routes, with and without trailing slash, with query strings) | Seranjivi (manual) | Verify after upload |
| 29 | Test Core Web Vitals and page performance. | ✅ | Section 2 (lab scores on all routes: LCP 1.4 to 2.2 s, CLS 0). INP needs real-visitor data | Dev | Re-check on PageSpeed Insights after upload |
| 30 | Check browser console for critical errors. | ✅ | 0 console messages on all pages at 1440 and 390 px, in development and production mode | Dev | None |
| 31 | Validate structured data. | 🟡 | Structure and required fields checked in the build; no external validator was run | Seranjivi (manual) | Run Google's Rich Results Test and validator.schema.org on `/` and `/qlik/` after upload |
| 32 | Submit sitemap to Google Search Console and Bing Webmaster Tools, if access is available. | ⏳ | `sitemap.xml` is ready | Seranjivi (manual) | After upload: verify the domain in both tools and submit `https://meridanta.com/sitemap.xml` |
| 33 | Complete agreed content refinements. | ⏳ | Depends on items 10, 11, 18, 19, 20 | Sri (content) | After Sri's feedback the wording is changed in one pass and the site rebuilt |

## 4. Decisions needed from Sri

1. **Case studies:** all 20 case studies and the 5 accelerators came from a deck carrying another company's branding. Which can Meridanta claim and keep published?
2. **Partner status and certifications:** the site claims none. Anything that may be said about Qlik or Talend partner status, or "Certification programs" in the Training offering?
3. **"Qlik Center of Excellence":** may Meridanta use this name?
4. **Company details still missing:** legal entity name, public phone, founding year. Real social-media profile URLs (the five icons currently link nowhere).
5. **AI training crawlers:** allowed for now; confirm or block.
6. **Metrics:** confirm figures such as "~40% faster response time", "under 5 seconds" latency and "$1M–$2M cost saving".

## 5. Open items by owner

**Seranjivi (manual):** (1) upload the package to Hostinger and run the checks in `docs/DEPLOY_HOSTINGER.md`; (2) contact form: Resend account and domain `send.meridanta.com` with its DNS records, Cloudflare Turnstile widget, `meridanta-config.php` one level above `public_html`, then set `VITE_CONTACT_FORM_ENABLED=true` with the site key in `.env`, rebuild, upload and test (`docs/CONTACT_SETUP.md`); (3) Google Search Console and Bing Webmaster Tools; (4) Firefox, Safari and real-device testing; (5) structured-data validators and PageSpeed Insights on the live site.

**Dev:** add the social URLs and company details when Sri supplies them; apply Sri's content feedback in one pass.

## 6. How to repeat the checks

```
npm run build
node scripts/verify-claims.mjs   # claims 1, 2, 3, 4, 7 and the contact section
npm run check:html               # structure, links, JSON-LD, calls to action
npm run qa:serve                 # in a second terminal, then:
npm run qa:routes  npm run qa:links  npm run qa:crawler  npm run qa:layout  npm run qa:resilience  npm run qa:contact
```
