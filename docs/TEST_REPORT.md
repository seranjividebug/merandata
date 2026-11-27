# Meridanta website: test, quality and security report

**Date:** 27 November 2026 (audit started 26 November) | **Build tested:** the production build of the current code | **Browser:** Microsoft Edge (Chromium) through Playwright, against the production build served locally

## 1. Summary

- **Verdict:** ready to upload. No Critical or High problem is open in code we own, every automated check passes, and every
  page scans clean for accessibility. The remaining items (section 6) are accepted risks or things that can only be checked on the live server.
- **39 issues were found** (9 in the security review, 22 in the code and accessibility review, 8 by running the site).
  **36 are fixed, 2 are partly fixed, 1 is accepted by design.** None is open without a decision.
- **Not tested here** (section 7): the live Hostinger server, the contact endpoint end to end (the form is switched off), Firefox,
  Safari, real phones, screen readers. Do not read this report as a statement about those.
- This application has no login, user data, database or create/read/update/delete screens. Authentication, access control,
  SQL/NoSQL injection, session and file-upload checks therefore do not apply; the one server-side piece (the PHP contact
  endpoint) was reviewed instead.

## 2. Test results (final build)

| Check | Result |
|---|---|
| `npm run build` | passes |
| `npm run verify` (content and structure claims) | 178 checks passed, 0 failed |
| `npm run check:html` (structure, links, JSON-LD) | 0 errors, 0 warnings; 365 links on 10 pages, none broken |
| `npm run qa:a11y` (axe, all rules, 9 pages at 412, 820 and 1440 px) | 27 of 27 clean |
| `npm run qa:interactions` (hover, keyboard, touch sheet, search, menus, XSS probes) | 24 passed, 0 failed |
| `npm run qa:anchors` (Industries, Solutions, About clicked in random order, 10 times, at 1920, 1440 and 390 px) | 6 of 6 passed: every click landed 0 to 1 px below the header, no late scroll, floating button changed at most once, layout shift 0 |
| `npm run qa:routes` | 31 passed, 0 failed |
| `npm run qa:console` | 18 passed; 0 console messages in total |
| `npm run qa:contact` | 27 passed |
| `npm run qa:form` | skipped: this build shows the email contact card, the form is off |
| `npm run qa:resilience` (no JavaScript, no idle callback, reduced motion, touch) | 22 passed (after correcting the check, see below) |
| `npm run qa:crawler` (raw HTML as a crawler sees it) | 14 passed |
| `npm run qa:layout` (overlap, clipping, sideways scroll, console errors) | 45 page and width combinations, 0 problems |
| `npm run qa:links` | 88 passed, 0 failed |
| Lighthouse accessibility | home 100, Qlik 100, Data Engineering 100, Consulting 100, AI Solutions 100 |
| Lighthouse best practices | 100 on all five |
| Lighthouse SEO | 100 (home, Qlik, Data Engineering); 69 on Consulting and AI Solutions on purpose: they are `noindex` drafts |
| Lighthouse layout shift (CLS) | 0 on all five |
| Lighthouse performance | home 87, Qlik 92, Data Engineering 96, Consulting 95, AI Solutions 98 (one run each, on a computer that was also busy with other work; scores vary by 10 or more between runs, see section 6) |

Pages and workflows covered: home (hero banners, Services, Industries, Solutions, About, footer), the three service pages,
the Qlik page (capability deck, offerings, accelerators, case studies), the Healthcare industry page, contact, privacy and the
404 page; header menus (desktop and mobile), search, floating buttons, section links, browser back and forward, deep links,
with JavaScript off, with reduced motion and with touch input.

Some runs were not clean on the first attempt and are not hidden: a timing problem in a new check (the preview was measured while it was still sliding in; the check now waits), a resilience check that expected a visible h1 (it now accepts the visible banner heading on the home page; re-run: 22 passed), one real nesting problem (T6, fixed) and one unexplained scroll overshoot (T8).

## 3. Security results

- **No Critical or High vulnerability in code we own.** No hardcoded keys, passwords or tokens in the repository, `dist/` or the
  latest release zip (pattern scan; no value was printed). `.gitignore` covers `.env`, `meridanta-config.php`, data folders and zips.
- **Contact endpoint** (`public/api/contact.php`), reviewed by reading it and syntax-checked (no PHP is installed here, so it was
  never run): POST only, JSON only, 16 KB limit, server-side Turnstile check that fails closed, allow-listed and length-limited
  fields, CR/LF stripped, HTML-escaped email body, Resend JSON API (no raw mail headers), no CORS headers, generic error codes,
  settings file outside the web root, per-IP rate limit, honeypot.
- **Front end:** no `dangerouslySetInnerHTML`, `innerHTML` or `document.write`; JSON-LD is escaped; the one `target="_blank"` link
  has `rel="noopener noreferrer"`. Four reflected-XSS probes (script and `onerror` payloads in `?interest=`, in the path and in a
  query) produced no dialog and no injected markup.
- **Headers:** `.htaccess` (Hostinger) sets `nosniff`, `Referrer-Policy`, `X-Frame-Options`, HSTS and `Permissions-Policy`, and a
  Content-Security-Policy in report-only mode. `public/_headers` (Cloudflare preview) sets the same, plus `noindex` for `*.workers.dev` only.
- **Dependencies:** `react-router-dom` 6.30.1 to 6.30.6 and `vite` 5.4.11 to 5.4.21. `npm audit` still reports 5 findings
  (4 moderate, 1 high), all in development tooling or with no fix on the router 6.x line (details in section 6).

## 4. Issue register (39)

Severity: M = Medium, L = Low. Status: **Fixed** · Partly · Accepted.

### 4a. Security review (9)

| ID | Sev | Finding | Status | How it was handled or verified |
|---|---|---|---|---|
| S1 | M | No HSTS, Permissions-Policy or Content-Security-Policy; `_headers` is ignored on Hostinger | **Fixed** | HSTS and Permissions-Policy added to `.htaccess`; CSP added in report-only mode (enforcing it needs a test on the live server with Turnstile on) |
| S2 | M | Rate limit could be bypassed with a forged first `X-Forwarded-For` value | **Fixed** | The last value is used; `config.sample.php` comment updated; PHP syntax-checked |
| S3 | M | Dependencies with advisories (`react-router-dom`, `vite`) | Partly | Both updated; the rest cannot be fixed here (section 6) |
| S4 | L | `?interest=__proto__` could break the contact form | **Fixed** | Own-property lookup; probe tested |
| S5 | L | `page` field accepted `https://meridanta.com.evil.com/` | **Fixed** | Must equal the site address or start with it plus `/` |
| S6 | L | Rate limit counts invalid submissions and lets requests through if its data folder is unwritable | Accepted | Deliberate: counting early protects against abuse, Turnstile still applies; documented |
| S7 | L | Email check accepted quoted addresses | **Fixed** | Quotes rejected |
| S8 | L | Error log kept 300 bytes of Resend's reply (can repeat the visitor's address) | **Fixed** | Only the status and the error name are logged |
| S9 | L | Stale `dist.zip` (12 Nov) in the project folder | **Fixed** | Moved to `release/OLD-dist-2026-11-12-do-not-upload.zip` |

### 4b. Code and accessibility review (22)

| ID | Sev | Finding | Status | How it was handled or verified |
|---|---|---|---|---|
| C1 | M | Hero read the reduced-motion setting while rendering (mismatch with the prerendered HTML) | **Fixed** | Uses the hook value |
| C2 | M | Industries: links of a collapsed card stayed in the tab order | **Fixed** | `qa:interactions` |
| C3 | M | About diagram had a focusable button that does nothing | **Fixed** | Plain heading |
| C4 | M | Hover preview of a capability card could not be closed with Esc | **Fixed** | `qa:interactions` |
| C5 | M | "Back to top" dropped keyboard focus | **Fixed** | `qa:interactions` |
| C6 | M | `CapabilityRail.jsx` mixed too many concerns (198 lines) | **Fixed** | Split into `RailCard` plus four hooks in `railHooks.js`; behaviour re-tested |
| C7 | M | Four near-identical observers in the floating buttons | **Fixed** | Reduced to two |
| C8 | M | Search panel stayed open after Tab-away; combobox state hard-coded | **Fixed** | `qa:interactions` |
| C9 | M | Contact form: thank-you message not announced, focus lost | **Fixed** | Focus moves to the message (code only: the form is off in this build) |
| C10 | L | Dead placement code in the capability cards | **Fixed** | Removed |
| C11 | L | Hover timer not cleared on unmount | **Fixed** | Cleanup added |
| C12 | L | Dead CSS selector in `rail.css` | **Fixed** | Removed |
| C13 | L | Closed capability previews read verbosely to screen readers | **Fixed** | Role and label only while open; duplicate title hidden from the accessibility tree; text stays in the HTML |
| C14 | L | Activating the arrow of an open preview did not close it | **Fixed** | `qa:interactions` |
| C15 | L | Page header stayed above the open bottom sheet | **Fixed** | Checked by computed style in `qa:interactions` |
| C16 | L | Hero: the h1 was hidden from screen readers on banners 2 and 3 | **Fixed** | One hidden h1 with banner 1's words; banner titles are h2; `verify` and `qa:interactions` |
| C17 | L | Dead CSS: about 50 rules and 2 selectors (old service cards, old products grid, old About, old hero link card, unused flow animation, unused button styles) | **Fixed** | Each class name was searched for in the source first; layout and accessibility suites re-run |
| C18 | L | Dead JS and assets: `chev` icon, card icon data, three image files | **Fixed** | Removed; the build and `verify` pass |
| C19 | L | `console.warn` shipped in production | **Fixed** | Development only |
| C20 | L | Duplicated click guard in three places | Partly | One shared `isPlainClick`; two hover helpers kept on purpose because their media queries differ |
| C21 | L | Contact form: unhighlighted server errors counted as fields; reset dropped the preselected service | **Fixed** | Only name, email and message errors are counted; reset keeps the service |
| C22 | L | Mobile menu: Esc did not return focus | **Fixed** | `qa:interactions` |

### 4c. Found by running the site (8)

| ID | Sev | Finding | Status | How it was handled or verified |
|---|---|---|---|---|
| T1 | M | Home accessibility 96 in Lighthouse (contrast hits on Industries headings) | **Fixed** | Cause: placeholder heights of lazily rendered sections were smaller than the real ones, so the axe engine measured the wrong place. Those sections now render in full. Lighthouse 100 |
| T2 | L | Floating "Talk to an Expert" button outside any page landmark | **Fixed** | Now an `aside` named "Quick actions" |
| T3 | L | Two regions with the same name on Consulting and AI pages | **Fixed** | Capability list renamed "<heading> cards" |
| T4 | M | Cloudflare preview host sent no security headers and could be indexed | **Fixed** | `public/_headers` (not yet verified on the live preview host; takes effect on its next deploy) |
| T5 | L | Qlik "Service offerings": inactive steps at 35% opacity (contrast 2.2:1 for their text) | **Fixed** | Inactive steps now grey with muted headings at full text contrast (a small visual change; say if you want the old fade back) |
| T6 | L | Contact page: the Qlik picture was an `aside` inside `main` | **Fixed** | Now a plain `div`; `qa:a11y` |
| T7 | M | Reported by you: links to Industries, Solutions and About sometimes landed in the wrong place, jumped, and the floating button flickered | **Fixed** | Sections render in full, one smooth scroll, menu highlight set at the end, button holds its state during the scroll. `qa:anchors`: the old build failed it (the button changed state 2 to 3 times per click), the new build passes |
| T8 | L | In one of about ten runs of `qa:anchors` the first click ended 857 px too far (not reproduced in later runs: 3 further full runs and 12 single first-click loads, some with the processor kept busy) | **Fixed** (hardened) | A smooth scroll that starts late on a busy device could be judged "finished" too early; the scroll now waits up to 1.5 s for it to start. The cause could not be proved |

## 5. Changes made to the application during the audit

Security headers and endpoint hardening (`public/.htaccess`, `public/_headers`, `public/api/contact.php`), two dependency
updates, accessibility and keyboard fixes in the header, search, hero, Industries, About, floating buttons and contact form,
the capability-card component split, removal of dead CSS, JS and images, a calmer inactive state for the Qlik journey steps, and
a stable section scroll (`src/utils.js`, `src/Layout.jsx`, `src/components/FloatingActions.jsx`). New repeatable checks:
`qa:anchors`, `qa:interactions`, `qa:a11y` (and `axe-core` as a development dependency).

## 6. Remaining items and risks

| Item | Why it remains | What to do |
|---|---|---|
| `npm audit`: 5 findings (4 moderate, 1 high) | `vite` (high) and `esbuild` (moderate) affect the development server only, not the shipped site; the fix needs Vite 8, a major upgrade that `vite-react-ssg` 0.8.9 may not support. `react-router` (moderate, open redirect with backslashes) has no fix on the 6.x line; the site never passes user input to links or navigation | Re-check when `vite-react-ssg` supports Vite 8 |
| Content-Security-Policy is report-only | A wrong policy would break the site and it could not be tested on the real server | After a week of normal use on Hostinger (and a test with the contact form on), change the header name from `Content-Security-Policy-Report-Only` to `Content-Security-Policy` in `public/.htaccess` |
| Lighthouse performance varies | Scores of 87 to 98 here were measured on a computer doing other work; earlier quiet runs gave 97 to 99 | Re-measure on PageSpeed Insights after the upload |
| Removing lazy rendering of whole sections | Needed for stable section links; the home page is slightly heavier to render at first load | Watch the live performance score |
| Hero: the hidden h1 repeats banner 1's words | Keeps one h1 available to screen readers | None |
| Design change T5 | Inactive Qlik journey steps are grey instead of faded | Sri to confirm |

## 7. Not tested (could not be tested here)

- The live Hostinger server: the headers it actually sends, file permissions, that `/meridanta-config.php`, `/.env`, `/api/` are blocked, and the 301 redirect rules.
- The contact form end to end (Turnstile, Resend, rate limit). The form is switched off in this build and no PHP is installed here, so the PHP file was syntax-checked and read, never run.
- The Cloudflare preview host headers (T4): not redeployed.
- Firefox, Safari, real phones and tablets (touch was emulated in Edge), and screen readers.

## 8. Readiness and next steps

1. The production build passes and all automated checks pass (section 2).
2. **Rebuild the zip before uploading:** the newest zip (`release/meridanta-dist-2026-11-25-v7.zip`) is older than most of the changes above. Keep the rules: contents of `dist` including `.htaccess` and `api/`, no `_headers`, `_redirects`, `.assetsignore`, no source maps or secrets.
3. After the upload, check on the live site: the headers (HSTS, Permissions-Policy, the CSP report-only line), that config and dot files return 404 or 403, the redirects, and the contact path once Resend and Turnstile are set up (`docs/CONTACT_SETUP.md`, `docs/DEPLOY_HOSTINGER.md`).
4. Repeat the checks any time with `npm run build`, `npm run verify`, `npm run check:html`, and with the server running (`npm run qa:serve`): `qa:routes`, `qa:links`, `qa:crawler`, `qa:layout`, `qa:resilience`, `qa:contact`, `qa:console`, `qa:anchors`, `qa:interactions`, `qa:a11y`.
