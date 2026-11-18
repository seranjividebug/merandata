# Contact form: real delivery options

Status: **decided and implemented.** Option A was chosen, but with a PHP endpoint on Hostinger instead of a Worker (meridanta.com is served by Hostinger, not Cloudflare): `public/api/contact.php` validates the request, checks Cloudflare Turnstile, rate-limits per IP, and sends the email with the Resend API. Setup steps are in `docs/CONTACT_SETUP.md` and the deploy checklist in `docs/DEPLOY_HOSTINGER.md`. The text below is the original comparison and is kept for reference; the Worker-specific parts (wrangler `run_worker_first`, `wrangler secret put`) do **not** apply.

Goal: every enquiry reaches a Microsoft 365 mailbox reliably, spam is blocked, and no secret is ever committed to git.

## Facts that shape the choice

- `meridanta.com` is served by **Hostinger** today. The site on `merandatav3.siranjeevi9597536779.workers.dev` runs on **Cloudflare Workers**. A Worker can serve the form API in both cases:
  - If the site moves to Cloudflare: the API lives at `/api/contact` on the same origin (simplest).
  - If the site stays on Hostinger: the Worker is deployed on its own subdomain (for example `forms.meridanta.com`, a DNS record pointing at Cloudflare) and the form posts to it cross-origin. The Worker then allows only `https://meridanta.com` in its CORS headers.
- Every option below uses the same front part, so only the "send" step differs.

## Common design (all options)

**Request.** `POST /api/contact` with JSON: `name`, `email`, `company` (optional), `interest` (one of the service options in `INTERESTS`), `message`, `website` (the honeypot, must be empty), `turnstileToken`.

**Protection, in this order, all on the server:**
1. **Cloudflare Turnstile** (free, no CAPTCHA puzzles for most people). The page shows the widget with the public **site key**; the Worker verifies `turnstileToken` by calling `https://challenges.cloudflare.com/turnstile/v0/siteverify` with the secret key. Reject if it fails.
2. **Honeypot.** The form already has a hidden `website` field. If it is filled in, return a normal-looking success and send nothing.
3. **Server-side validation** (never trust the browser): required fields, email format, length limits (for example name 100, company 150, message 5,000), `interest` must match the allowed list, request body size cap (for example 16 KB), JSON only. Strip line breaks from anything that goes into an email header (prevents header injection) and HTML-escape everything that goes into an HTML email body.
4. **Rate limit.** A Cloudflare rate-limiting rule on `/api/contact` (for example 5 requests per minute per IP), plus Turnstile. Optional: store the last submission time per IP hash in Workers KV.
5. **Same-origin or locked CORS**, `POST` only, no cookies.

**Responses.** `200 { ok: true }`, `400 { ok: false, errors: { field: "message" } }`, `429`, `502` if the mail provider fails. The form keeps its current success and error screens; the "Preview build" note is removed.

**Safety net (recommended).** Write each valid submission to a Cloudflare D1 table or KV key before sending the email, so nothing is lost if the mail provider is down. It is free at this volume. Do not log message bodies in Worker logs.

**Secrets.** Stored with `wrangler secret put NAME` (or the Cloudflare dashboard) and never written to the repository, `wrangler.jsonc` or `.env` files committed to git. Public values (the Turnstile site key) can live in the config. The repo's `.gitignore` already excludes `.dev.vars` and `.env*`.

**Wrangler change (same for all options).**
```jsonc
{
  "name": "merandatav3",
  "main": "worker/index.js",
  "compatibility_date": "2025-01-01",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page",
    "run_worker_first": ["/api/*"]
  }
}
```
Only `/api/*` runs the Worker; everything else is still served as static files.

**Front-end work (all options).** Add the Turnstile widget, post to `/api/contact`, show field errors returned by the server, remove the "Preview build" note, and read the service of interest from the link that brought the visitor (see "Service of interest" below).

## Option A: Worker + Resend (recommended for speed)

How it works: the Worker validates, then sends one HTTPS request to the Resend email API. The email goes to your Microsoft 365 mailbox, with `Reply-To` set to the visitor.

- **Setup**
  1. Create a Resend account and add the domain `meridanta.com`. Resend gives you DNS records (SPF and DKIM; DMARC is recommended) to add where the domain's DNS is managed (Hostinger today).
  2. Create an API key limited to sending.
  3. `wrangler secret put RESEND_API_KEY`, `TURNSTILE_SECRET`, and set `CONTACT_TO` (the Microsoft 365 mailbox, for example sales@meridanta.com) as a plain variable.
  4. Send from `Meridanta Website <forms@meridanta.com>`, `reply_to` = visitor email.
  5. In Microsoft 365, add `forms@meridanta.com` to the safe senders list or a mail-flow rule so the messages never land in Junk.
- **Cost:** Resend has a free tier that is enough for a corporate contact form, and paid plans above it. Turnstile and Workers are free at this volume. Check current limits when you sign up.
- **Pros:** about half a day of work; one secret; clear delivery logs and bounce handling; nothing to renew.
- **Cons:** a third-party service sees the enquiry text; requires DNS records for sender authentication; the mailbox only receives, it does not "send as" itself.

## Option B: Worker + Microsoft Graph `sendMail` (stays inside Microsoft 365)

How it works: the Worker gets an access token from Microsoft Entra ID with the client-credentials flow, then calls `POST https://graph.microsoft.com/v1.0/users/{sender}/sendMail`.

- **Setup**
  1. In Entra ID, register an app ("Meridanta website forms"). Add the **application** permission `Mail.Send` and have a tenant admin grant consent.
  2. Limit the app to one mailbox with an Exchange Online **application access policy** (or the newer RBAC for applications), so a leaked secret cannot send as anyone else.
  3. Create a client secret (note its expiry; it must be rotated, maximum 24 months).
  4. `wrangler secret put AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `TURNSTILE_SECRET`; plain variables `CONTACT_FROM` and `CONTACT_TO`.
  5. Cache the token inside the Worker for its lifetime (about one hour) to avoid a token call per submission.
- **Cost:** no extra fee beyond the Microsoft 365 licence of the sending mailbox (a shared mailbox can be used for this; check your licence terms).
- **Pros:** no third party; mail appears in Sent Items; sender is a real domain mailbox, so no SPF/DKIM work.
- **Cons:** needs a Microsoft 365 admin for consent and the access policy; one to two days of work; a secret that expires and must be renewed (put a reminder on the calendar); Graph errors are more verbose.

## Option C: Worker + Power Automate HTTP trigger

How it works: a Power Automate flow starts from "When an HTTP request is received". The Worker posts the validated JSON to the flow URL; the flow sends an Outlook email and can also add a row to a SharePoint list or notify a Teams channel.

- **Setup**
  1. Create the flow with the HTTP trigger and a JSON schema for the fields; add "Send an email (V2)" (and optionally "Create item" in a SharePoint list for a lead log).
  2. Copy the flow URL (it contains a signature, so treat it as a secret).
  3. `wrangler secret put POWER_AUTOMATE_URL`, `TURNSTILE_SECRET`.
- **Cost:** the HTTP trigger is a **premium** connector, so it needs a Power Automate Premium licence (or a per-flow plan) for the flow owner.
- **Pros:** business users can change routing (to sales, to a CRM list, to Teams) without code; no app registration.
- **Cons:** premium licence; the flow URL cannot be restricted by IP and must be rotated if leaked; flows can be throttled or turned off if the owner leaves, so use a service account.

## Comparison

| | A: Resend | B: Microsoft Graph | C: Power Automate |
|---|---|---|---|
| Effort | about 0.5 day | 1-2 days | about 0.5-1 day |
| Needs M365 admin | no (needs DNS access) | yes | no (needs a Premium licence) |
| Extra cost | free tier, paid above | none beyond mailbox licence | Power Automate Premium |
| Third party sees data | yes (Resend) | no | no (stays in Microsoft) |
| Secret to maintain | API key | client secret (expires) | flow URL |
| Best when | you want it live fast | policy says no third-party email service | sales wants routing and a lead list |

**Recommendation:** Option A to launch quickly, with the D1/KV safety net. Choose B if Meridanta's IT or procurement does not allow a third-party email processor. Choose C only if the sales team needs a lead list or routing rules in the first version.

## Service of interest

The form already has an optional **Area of interest** list (`INTERESTS` in `src/data.js`: AI Solutions & Services, Data Engineering & Analytics, Qlik Solutions & Accelerators, Healthcare Insights, Cloud & Modernisation, Consulting & Delivery, Other). Phase 6 makes it useful without changing the design:
- Every primary call-to-action links to the contact form (`/#contact`), and the ones on a specific page pass the matching service, for example the Qlik page sends `?interest=qlik`, the healthcare page `?interest=healthcare`.
- The form reads that value on load and pre-selects the matching option; the visitor can still change it.
- The chosen service is included in the email subject, for example `Website enquiry: Qlik Solutions & Accelerators`.

## Acceptance tests (to run once an option is chosen)
1. A valid submission arrives in the mailbox within a minute, with `Reply-To` set to the visitor, the service in the subject, and no HTML injected from the message text.
2. A submission with the honeypot filled in sends nothing.
3. A missing or invalid Turnstile token is rejected.
4. Oversized, malformed or non-JSON bodies are rejected with `400`.
5. A header-injection attempt (`name` containing `\r\nBcc: x@y.com`) produces no extra header.
6. Six requests in a minute from one IP are rate limited.
7. The repository contains no secret (`git grep` for the key names returns only the variable names).

## What I need from you
Pick **A**, **B** or **C** (and say whether meridanta.com stays on Hostinger or moves to Cloudflare), plus the destination mailbox address. I will not implement the real send until you choose.
