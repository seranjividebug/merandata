# Meridanta Website – AI Search Discoverability: Status Report

**Date:** 18 November 2026 &nbsp;|&nbsp; **Prepared for:** Srivatsan (Sri) &nbsp;|&nbsp; **Website:** https://meridanta.com

## Executive summary

- **The problem:** until now the website's words were invisible to AI assistants (ChatGPT, Perplexity, Claude, Gemini) and to most search engines. Each page arrived empty and only filled in when a browser ran code, so there was nothing for them to read, quote or recommend.
- **What is now in place:** every page carries its full text in the page itself (4 services, 7 Qlik capabilities, 5 accelerators, all 20 case studies), plus its own title, description, share image and company data for search engines. A sitemap, a crawler-access file and two plain-text summaries (`llms.txt`, `llms-full.txt`) tell AI systems where to look. Pages load roughly 2 to 3 times faster, and the footer now shows the registered office and email.
- **The contact form** is built to email your inbox (srivatsans@meridanta.com) through Resend, with spam protection. It cannot send until the one-time setup is done, and until then it shows a "write to us by email" message instead of pretending to send.
- **What is left:** your decisions on content (section 4), the contact-form setup and the upload to Hostinger (Dev), a final check of the live site, and testing in Firefox, Safari and on real phones.

## 1. Claims verified against the code and a fresh build

Verified on 18 Nov 2026 with a clean production build, scripts in the repository (`npm run verify`, `check:html`, `qa:*`) and Lighthouse. ✅ verified · 🟡 partly · ❌ not true.

| # | Claim | Result | Evidence | Fixed now? |
|---|---|---|---|---|
| 1 | Every page has its full content in the HTML, not only the active slide or tab | ✅ | Home: 3/3 hero slides, 4/4 services, 24/24 service items, 2/2 industries. `/qlik/`: 7/7 capabilities (21/21 bullets), 4/4 offerings, 5/5 accelerators (all challenge, solution and benefit text), 20/20 case studies (165/165 story bullets). 4 inactive accelerator panels and 19 case studies are in the HTML as hidden text. Both industry pages contain their challenges, opportunities and capabilities text. | No change needed |
| 2 | Unique title, description, canonical, Open Graph and Twitter tags with an og:image | ✅ | 4 pages, titles 53 to 60 characters, descriptions 144 to 152, all unique; canonical `https://meridanta.com/` plus path; `og:image` = `https://meridanta.com/og-image.png` (file present, 1200×630); `twitter:card` = `summary_large_image`. The 404 page is `noindex`. | No change needed |
| 3 | sitemap.xml, robots.txt (search and AI crawlers allowed), llms.txt and llms-full.txt | ✅ | `sitemap.xml`: 4 URLs, all return 200. `robots.txt`: 4 search crawlers and 10 AI crawlers named and allowed, 0 "Disallow: /" lines, `Sitemap:` line present. `llms.txt` (3.9 KB) and `llms-full.txt` (31 KB, includes all 20 case studies); all 13 links in `llms.txt` return 200. | No change needed |
| 4 | JSON-LD: Organization, WebSite, Service, BreadcrumbList on the right pages | ✅ | All blocks parse as valid JSON. Home: Organization, WebSite, WebPage, 4 Services. `/qlik/`: adds BreadcrumbList, 4 Qlik Services and an ItemList of 20 case studies. Industry pages: Organization, WebSite, WebPage, BreadcrumbList. No BreadcrumbList on the home page. This is a structural check; no external schema validator was run. | **Yes:** the verification found a bug (the Qlik service URL read `/qlik//`); fixed, and the checker now rejects double slashes |
| 5 | One h1 per page, logical heading order, alt text, a proper 404 page, the 301 redirects, direct link and refresh on every route | 🟡 | One `<h1>` per page and 0 heading-level jumps on all 4 pages. 36 images: 24 with descriptive alt text, 12 decorative (`alt=""`), 0 missing. `404.html` is "Page not found" and returns a real 404 on the test host. Direct access and refresh pass on all routes (32 checks). The 301 rules (`/services`, `/about`, `/products`, `/industries`, `/qlik/*`, http to https, www to non-www) are in `public/.htaccess`; the same list returned 301 on the Cloudflare asset handler. **The `.htaccess` itself could not be run here (no Apache), so the redirects and the real 404 status on Hostinger are confirmed only after upload.** | No: needs the upload check (`docs/DEPLOY_HOSTINGER.md`) |
| 6 | Performance optimizations applied; Lighthouse mobile score per route | ✅ | AVIF and WebP images (hero 157 KB to 27–66 KB), `loading="lazy"` on below-the-fold images (5 on home, 12 on `/qlik/`), self-hosted font preloaded with `font-display: swap`, no Google Fonts requests, route code splitting (Qlik page 30 KB loaded only on its own page), critical CSS inlined. Scores in section 2. | **Yes:** below-the-fold home sections now render only when near the screen (home score about 90 to about 97) |
| 7 | Registered office and email in the footer and in the Organization JSON-LD | ✅ after the fix | Footer on all 4 pages: "Registered Office: 262 Chapman Rd, Ste 240, Newark, DE 19702, USA" and a `mailto:srivatsans@meridanta.com` link. Organization JSON-LD: `email`, `address` (PostalAddress) and `location` named "Registered Office". Also in `llms.txt`. | **Yes: this was not true before today.** The data was missing from the code (empty placeholders); added from your details |
| 8 | Contact form: posts to `/api/contact.php` with honeypot, Turnstile and server-side validation; sends to srivatsans@meridanta.com via Resend once configured; shows the mailto fallback (no fake success) while not configured; "Preview build" note gone | 🟡 | Code complete: `public/api/contact.php` has the honeypot, Turnstile check, validation (name, email, company, area, message 10–4000 characters), 5-per-hour rate limit, Resend call (to srivatsans@meridanta.com, reply-to the visitor) and returns 503 until `../meridanta-config.php` exists. Front end tested with mocked answers (9/9): 200 shows thank-you; 503, 403, network failure, a host that does not run PHP, and a 200 with the wrong body all show the error message with the `mailto:srivatsans@meridanta.com` link; 429 and 422 show their own messages; sending state disables the button. No "Preview build" text anywhere. **Not verified: the PHP has never been executed (no PHP here), and this build has no Turnstile site key, so the verification box is not shown and the server would refuse every enquiry.** | No: needs the keys and setup (`docs/CONTACT_SETUP.md`), then a build with the site key |

## 2. Lighthouse mobile scores (final build, median of 3 runs)

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | Blocking time |
|---|---|---|---|---|---|---|---|
| `/` | 97 | 100 | 100 | 100 | 2.4 s | 0 | 79 ms |
| `/qlik/` | 100 | 100 | 100 | 100 | 1.8 s | 0 | 14 ms |
| `/industries/healthcare/` | 100 | 100 | 100 | 100 | 1.3 s | 0 | 0 ms |
| `/industries/communications-media-entertainment/` | 100 | 100 | 100 | 100 | 1.3 s | 0 | 0 ms |

Before the work (same method): performance 70 to 84, LCP 3.5 to 5.5 s, page weight 465 to 991 KB; now 187 to 401 KB. **Note:** the home-page performance score varies between runs (this session it ranged from about 75, while other programs were using the computer, to 97) because of when the page's scripts start. Confirm with https://pagespeed.web.dev after the upload.

## 3. Checklist status

> **Important:** the 33-item checklist wording was not available when this report was prepared, so the table below groups the work by the item **numbers used in the project brief** and describes each group in my own words. Please replace the "Item" column with Sri's original wording before this is treated as the final checklist report. Item **32** did not appear in the brief and is shown as pending.

✅ Done · 🟡 Partly done · ⏳ Pending · 🔒 Blocked

| # | Item (area, in project wording) | Status | Evidence / where to check | Owner | Next step |
|---|---|---|---|---|---|
| 1, 3, 4 | Audit: stack, routes, what crawlers see, tool choice | ✅ | `docs/AUDIT.md` | Dev | None |
| 2, 15 | Full HTML for every route, all tabs and slides present | ✅ | Claim 1 above; `docs/PHASE2_EVIDENCE.md` | Dev | None |
| 28 | Real 404, 301 redirects, direct link and refresh | 🟡 | Claim 5 above; `docs/QA_REPORT.md` | Dev | Upload, then run the 15 checks in `docs/DEPLOY_HOSTINGER.md` |
| 5 | Page titles and descriptions | 🟡 | Written, unique and in range; `src/seo.js`, claim 2 | Sri | Approve or edit the wording |
| 6, 7, 8, 9 | Canonical URLs, social tags and share image, sitemap, robots.txt, llms.txt, favicons | ✅ | Claims 2 and 3 | Dev | Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools after launch |
| 27 | Crawler-access settings in the Cloudflare dashboard | 🔒 | `docs/DISCOVERABILITY_LOG.md` (Phase 3). The live domain is on Hostinger, so these settings do not apply unless DNS moves to Cloudflare | Dev | Confirm hosting plan; Sri to decide whether AI training crawlers (GPTBot, ClaudeBot and similar) may read the site (currently allowed) |
| 12 | Company facts in one place (name, address, contact) | 🟡 | `src/company.js`; claim 7. Email and registered office are set | Sri | Supply the legal entity name, public phone number and founding date |
| 13, 14, 16, 17, 31 | Structured data, headings, alt text, link checks | ✅ | Claims 4 and 5; `docs/JSONLD_EXAMPLES.md`, `docs/IMAGE_ALT.md`, `docs/LINK_INVENTORY.md`. No FAQ block exists yet, so no FAQ markup is published | Dev | Add FAQs only after Sri approves the draft questions in the review pack |
| 10, 11, 18, 19, 20, 33 | Content review: copy, search wording, Qlik branding, unverified claims | ⏳ | `docs/CONTENT_REVIEW.md` (ready to send) | Sri | Mark Approve / Edit / Remove on each row, starting with the section 4 items below |
| 21 | Speed: images, fonts, code splitting, Lighthouse | ✅ | Claim 6 and section 2; `docs/PERFORMANCE.md` | Dev | Re-check on PageSpeed Insights after upload |
| 26 | Contact form that really delivers enquiries | 🟡 | Claim 8; `docs/CONTACT_SETUP.md` | Dev | Create the Resend domain and Turnstile widget, create the server config file, rebuild with the site key, upload and run the tests |
| 29 | Every call to action leads to the contact form; service of interest | ✅ | `npm run check:html` enforces it; Qlik and Healthcare pages pre-select the service | Dev | None |
| 22, 23, 24, 25, 30 | Testing: routes, links, layouts, console, crawler view, browsers | 🟡 | `docs/QA_REPORT.md`: 32 route, 63 link, 20 layout, 9 crawler, 12 resilience and 9 form checks pass in Chromium | Dev | Test Firefox, Safari (Mac and iPhone) and Android Chrome by hand |
| 32 | Not listed in the brief | ⏳ | — | Sri | Provide the wording |

## 4. Decisions needed from Sri

1. **Case studies:** all 20 case studies and the 5 accelerators came from a deck carrying another company's branding. Which can Meridanta claim and keep published?
2. **Partner status and certifications:** the site claims none. Anything that may be said about Qlik or Talend partner status, or "Certification programs" in the Training offering?
3. **"Qlik Center of Excellence":** may Meridanta use this name?
4. **Company details still missing:** legal entity name, public phone, founding year. Real social-media profile URLs (the five icons currently link nowhere).
5. **AI training crawlers:** allowed for now; confirm or block.
6. **Metrics:** confirm figures such as "~40% faster response time", "under 5 seconds" latency and "$1M–$2M cost saving".

## 5. Open items for Dev

1. Contact form: Resend account and domain `send.meridanta.com` with its DNS records, Cloudflare Turnstile widget, `meridanta-config.php` one level above `public_html`, `.env` with the Turnstile site key, rebuild, upload, test (`docs/CONTACT_SETUP.md`).
2. Upload to Hostinger and run the 15 post-deploy checks, including the `.htaccess` redirects, the real 404 status and the caching headers (`docs/DEPLOY_HOSTINGER.md`).
3. Search Console and Bing Webmaster Tools: verify the domain and submit the sitemap.
4. Firefox, Safari and real-device testing.

## 6. How to repeat the checks

```
npm run build
node scripts/verify-claims.mjs   # claims 1, 2, 3, 4 and 7
npm run check:html               # structure, links, JSON-LD, calls to action
npm run qa:serve                 # in a second terminal, then:
npm run qa:routes  npm run qa:links  npm run qa:crawler  npm run qa:layout  npm run qa:resilience  npm run qa:form
```
