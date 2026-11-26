# Full test, quality and security audit (26 Nov 2026)

Scope: the whole site (React + Vite static site, prerendered) and its one backend piece, the PHP contact endpoint
(`public/api/contact.php`). There is no login, user data, database or CRUD in this application, so authentication,
authorization, access control, SQL/NoSQL injection, session and file-upload checks do not apply; they were reviewed
only to confirm there is nothing of that kind (there is none).

Tested in Microsoft Edge (Chromium) through Playwright against the production build served locally (`npm run qa:serve`).

## 1. Issues found: 31

| Source | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| Security review (code, Apache config, dependencies, secrets) | 0 | 0 | 3 | 6 | 9 |
| Code and accessibility review of `src/` | 0 | 0 | 9 | 13 | 22 |

Second pass (same day): three more items came from running the site, all fixed:
- Lighthouse scored the home page 96 for accessibility (two contrast hits on the Industries headings). Cause found with the
  axe engine: the stacked home sections are much taller on phones and tablets than the 700px placeholder size used by
  `content-visibility`, so a section measured wrong while off screen. Placeholder sizes are now 1250px (tablet) and 1450px (phone).
  Home accessibility is now 100.
- A full axe scan found the floating "Talk to an Expert" button outside any page landmark (now an `aside` labelled
  "Quick actions") and two regions with the same name on the Consulting and AI pages (the capability list is now named
  "<heading> cards").
- The Cloudflare preview host sent no security headers and was open to search engines. `public/_headers` now sets the same
  headers as `.htaccess` and a `noindex` rule for `*.workers.dev` only (comment in the file explains why it names the host).
  Takes effect on the next preview deploy; not yet verified live.

The `npm audit` "high" rating is a dependency advisory and is listed under security.

## 2. Fixed (19 of the 31, plus the three second-pass items above)

| Severity | Issue | Fix |
|---|---|---|
| Medium | Security headers missing (HSTS, Permissions-Policy) | Added to `public/.htaccess` (partial: no CSP, see 4) |
| Medium | Rate limit could be bypassed by a forged first `X-Forwarded-For` value | `contact.php` now uses the last entry; `config.sample.php` comment updated |
| Medium | Dependencies with advisories: `react-router-dom` 6.30.1 (open redirect, XSS) and `vite` 5.4.11 | Updated to 6.30.6 and 5.4.21 (partial: see 4) |
| Medium | Hero reads the reduced-motion setting at render time (hydration mismatch for those visitors) | Uses the hook value |
| Medium | Industries: hidden links of a collapsed card stayed in the keyboard tab order | `visibility:hidden` with a delayed transition (verified in the browser) |
| Medium | About diagram: focusable "button" that does nothing | Plain heading |
| Medium | Hover preview of a capability card could not be dismissed with Esc | Esc closes it from anywhere (verified) |
| Medium | Back to top dropped keyboard focus | Focus moves to the page start |
| Medium | Search panel stayed open after Tab-away; combobox ARIA hard-coded | Closes on Tab-away; `aria-expanded` follows the list (verified) |
| Medium | Contact form: thank-you message not announced, focus lost | Focus moves to the message (code only: the form is switched off in this build) |
| Low | `?interest=__proto__` could break the contact form | Own-property check |
| Low | `page` field accepted `https://meridanta.com.evil.com/` | Must equal the site address or start with it plus `/` |
| Low | Dead placement code, hover timer not cleared on unmount, dead CSS selector in the capability cards | Removed / cleaned up |
| Low | Open preview could not be closed by activating its arrow | Arrow toggles it (verified) |
| Low | Page header stayed above the open bottom sheet | Header lowered while a sheet is open (not visually tested) |
| Low | `console.warn` shipped in production (Qlik capability images) | Only in development |
| Low | Mobile menu Esc did not return focus | Focus returns to the menu button (verified) |

## 3. Security results

- **No Critical or High vulnerabilities in code we own.** No hardcoded keys or secrets in the repository, `dist/` or the
  latest release zip (regex scan; no value printed). `.gitignore` covers `.env`, `meridanta-config.php`, data folders and zips.
- Contact endpoint (read, not run against a live server): POST only, JSON only, 16 KB limit, server-side Turnstile check
  that fails closed, allow-listed fields, CR/LF stripped, HTML-escaped email body, Resend JSON API (no raw headers),
  no CORS headers, generic error codes, config outside the web root, per-IP rate limit and honeypot.
- No `dangerouslySetInnerHTML`, `innerHTML`, `document.write`; JSON-LD is escaped; the one `target="_blank"` link has
  `rel="noopener noreferrer"`. Reflected-XSS probes on four URL patterns (script and `onerror` payloads in `?interest=`
  and in the path) produced no dialog and no injected markup.
- `npm audit`: before 5 findings (4 high, 1 moderate); after **5 findings (4 moderate, 1 high), all remaining ones in
  dev tooling or with no fix on the 6.x router line**:
  - `vite` (high): dev-server path traversal and `esbuild` (moderate): dev-server request leak. Dev server only, not part of
    the shipped site. Fix needs Vite 8 (major upgrade, not compatible with `vite-react-ssg` 0.8.9 without testing).
  - `react-router` / `react-router-dom` / `vite-react-ssg` (moderate): open redirect via backslash in `<Link>`/`useNavigate`.
    No fix exists for the 6.x line. The site never passes user-supplied values to links or navigate calls.

## 4. Remaining issues and risks (12 not fixed, plus deployment items)

| Severity | Item | Why not fixed |
|---|---|---|
| Low | Qlik page, "Service offerings" journey: the steps that are not the active one are shown at 35% opacity (axe: contrast 2.2:1 for their text, desktop only; Lighthouse does not flag it) | Deliberate design (spotlight on the active step). Fixing it means replacing the fade with a different de-emphasis, a design decision. |
| Medium | No Content-Security-Policy | Needs testing on the real server with Turnstile switched on; a wrong policy would break the site. Suggested policy is in the security review notes (script-src self + inline + challenges.cloudflare.com). |
| Medium | `CapabilityRail.jsx` is about 200 lines with several concerns; `FloatingActions.jsx` has four near-identical observers | Refactor only, no defect; risk of regressions |
| Low | Rate limit counts invalid submissions and allows requests if its data folder is unwritable (Turnstile still applies) | Documented design |
| Low | Email check allows quoted local parts; error log keeps 300 bytes of Resend's reply | Minor |
| Low | Hero: the h1 is hidden from assistive technology while slides 2 and 3 show | Needs a design decision (persistent hidden h1) |
| Low | Dead CSS rules (old card styles, about layout, unused dark theme), unused assets (`hl-bg.svg`, `logo.png`, `logo-white.png`), unused `chev` icon and `ICON_CYCLE` | Cleanup only; deleting without browser checks of every page risks breaking live styles |
| Low | Duplicated click-guard and `canHover` helpers; ContactForm edge cases (unhighlighted server errors, reset clears the preselected service) | Minor |
| Low | Closed capability previews read verbosely to screen readers | Intentional so search engines see the bullets |
| Info | A stale `dist.zip` (Nov 12, only an `.htaccess`) sits in the project root | Not deleted: it is your file. Delete it so it is never uploaded by mistake. |

## 5. Pages and workflows tested

Home (hero slides, Services, Industries, Solutions, About, footer), the three service pages, Qlik page (capability deck,
offerings, accelerators, case studies), the Healthcare industry page, contact page, privacy page, 404, header menus
(desktop dropdown and mobile menu), search, floating buttons, deep links, browser back and forward, anchor links between
pages, with JavaScript disabled, without `requestIdleCallback`, with reduced motion and with touch.

## 6. Test results (final build, second pass)

| Suite | Result |
|---|---|
| `npm run build` | passes |
| `npm run verify` (content and structure claims) | 178 checks passed, 0 failed |
| `npm run check:html` | 0 errors, 0 warnings |
| axe accessibility scan (all rules) on 9 pages (home, Qlik, contact, privacy, 3 service pages, Healthcare, 404) at 412, 820 and 1440 px | 26 of 27 clean; 1 finding, see section 4 |
| `qa:routes` | 31 passed, 0 failed |
| `qa:console` | 18 passed, 0 console messages |
| `qa:contact` | 27 passed |
| `qa:form` | skipped: this build shows the email contact card (the form is switched off) |
| `qa:resilience` | 22 passed |
| `qa:crawler` | 14 passed |
| `qa:layout` | 45 page and width combinations, 0 problems |
| `qa:links` | 88 passed, 0 failed (the check now waits for smooth scrolling to finish; earlier two failures were that timing) |
| Lighthouse accessibility | home 100, Qlik 100, Data Engineering 100 (Consulting and AI 100 earlier) |
| Lighthouse best practices / SEO | 100 / 100 (Consulting is 69 for SEO on purpose: it is a `noindex` draft) |
| Lighthouse CLS | 0 on every page measured |
| Lighthouse performance | Data Engineering 93, home 82, Qlik 73 with other programs running on the machine; 97-98 earlier on a quiet machine. Re-measure on an idle machine or on the live host. |

## 7. Not tested (cannot be tested here)

- The live Hostinger server: headers actually sent, file permissions, that `/meridanta-config.php`, `/.env`, `/api/` are blocked.
- The contact form end to end (Turnstile, Resend, rate limit) and the PHP file itself: no PHP runtime was run; the form is off in this build.
- Firefox, Safari and real phones or tablets (touch was emulated in Edge). No screen-reader run.
- Performance scores on a quiet machine: Lighthouse numbers taken while other programs were busy swing between 64 and 98.
- Dependency fixes that need a major Vite upgrade.

## 8. Build and deployment readiness

The production build completes, all automated checks pass, and no Critical or High findings remain in code we own. Before
the next upload: rebuild the zip (the last one, v7, is older than many changes), upload it, then on the live site check
that config and dot files return 404 or 403, that headers include the new HSTS and Permissions-Policy lines, and that the
contact path works once Resend and Turnstile are set up.
