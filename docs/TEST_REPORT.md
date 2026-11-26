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

One more item came from running the site: Lighthouse scores the home page 96 for accessibility because of two
contrast hits on the Industries card headings (text colour #1b1d2b measured over #0c1230). It is **not resolved**:
in a real browser at 412px and 1440px the cards are white with dark text (computed colours checked), so it looks like a
measurement artefact of the `content-visibility` sections, and `color:inherit` on those headings (added) did not change
the score. The `npm audit` "high" rating is a dependency advisory and is listed under security.

## 2. Fixed (19 of the 31)

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

## 6. Test results (final build)

| Suite | Result |
|---|---|
| `npm run build` | passes |
| `npm run verify` (content and structure claims) | 178 checks passed, 0 failed |
| `npm run check:html` | 0 errors, 0 warnings |
| `qa:routes` | 31 checks; first run had 1 timing failure under load, 0 failures on the next two runs |
| `qa:console` | 18 passed, 0 console messages in total |
| `qa:contact` | 27 passed |
| `qa:form` | skipped: this build shows the email contact card (the form is switched off) |
| `qa:resilience` | 22 passed |
| `qa:crawler` | 14 passed |
| `qa:layout` | 45 page and width combinations, 0 problems (no overlap, clipping, horizontal scroll or console errors) |
| `qa:links` | 86 passed, 2 failed: both are "scroll to a section on the home page" checks that read the position before the smooth scroll had finished; re-measured by hand in 8 trials, every one settled at 80px under the header |
| Extra browser checks for the fixes | 11 of 12 passed; the one failing check was a wrong test expectation (after Esc a card reopens only when the pointer re-enters), not a defect |
| Lighthouse accessibility | Data Engineering 100, Consulting 100, AI Solutions 100, home **96** (see section 1, unresolved) |
| Lighthouse CLS | 0 on every page measured |
| Lighthouse performance | 97-98 on a quiet machine (Data Engineering, Consulting, AI); 32-68 in runs taken while other programs were busy (not a reliable figure; re-measure on an idle machine) |

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
