# Contact form setup (PHP + Resend on Hostinger)

How it works: the form on the website sends the enquiry to `/api/contact.php` on your Hostinger hosting. That PHP file checks the data, asks Cloudflare Turnstile whether the visitor is human, and then asks Resend to email the enquiry to **srivatsans@meridanta.com** (with the visitor's address as Reply-To). Nothing is stored except a small log and rate-limit files, both kept **outside** `public_html`.

You need to do four things once: set up Resend (a), set up Turnstile (b), create one private config file on the server (c), then build and upload (d). After that, run the tests in (e).

Keys must never go into the code, the repository, the `dist` folder or `public_html`.

---

## a. Resend: the sending service

1. Create an account at https://resend.com (free plan is enough).
2. In Resend open **Domains → Add Domain**, type exactly `send.meridanta.com` and pick a region (the one closest to your visitors).
3. Resend now shows a list of DNS records for this subdomain. There are normally three: an **MX** record and an **SPF (TXT)** record for the host `send`, and a **DKIM (TXT)** record for the host `resend._domainkey.send`. **Copy them exactly as Resend shows them**; the values differ per account.
4. Add them at the company that hosts the DNS of `meridanta.com` (the "DNS provider"). If you do not know who that is: it is where the domain's nameservers point. Run `nslookup -type=ns meridanta.com` in a terminal, or look at the domain's nameserver settings in the registrar. It is often the registrar, Hostinger (hPanel → Domains → DNS / Nameservers) or Cloudflare.
   - In the DNS screen use "Add record". Many screens add `.meridanta.com` automatically, so the host is just `send` or `resend._domainkey.send`.
   - **Add only these records. Do not edit, replace or delete any existing record of the root domain.** Your Microsoft 365 records (MX `...mail.protection.outlook.com`, SPF `v=spf1 include:spf.protection.outlook.com ...`, `autodiscover`, `selector1` / `selector2` DKIM CNAMEs) must stay exactly as they are. The Resend records live on the separate name `send`, so they cannot clash.
5. Back in Resend click **Verify**. It can take a few minutes up to a few hours. The status must become **Verified**.
6. Resend → **API Keys → Create API Key**. Name: `meridanta-website`. Permission: **Sending access**. Domain: `send.meridanta.com`. Click create and **copy the key now** (starts with `re_`). Resend shows it only once. Keep it for step (c).

## b. Cloudflare Turnstile: the "are you human" check

1. Create a free account at https://dash.cloudflare.com (the domain does **not** need to be on Cloudflare).
2. In the left menu open **Turnstile → Add widget**.
3. Widget name: `meridanta.com contact form`. Hostnames: add `meridanta.com`. (Optional: also add `localhost` if you want to test on your own computer.) Widget mode: **Managed**. Create.
4. Cloudflare shows two keys:
   - **Site key**: public. It goes into the website build (step d).
   - **Secret key**: private. It goes only into the config file on the server (step c).

## c. The private config file on the server

1. Log in to hPanel → **Websites → meridanta.com → File Manager**.
2. Find the folder that **contains** `public_html` (the folder one level above it; on Hostinger it is usually named like `domains/meridanta.com`). The file must **not** be inside `public_html`.
3. In that folder create a new file named exactly `meridanta-config.php`, open it for editing and paste this, replacing the two placeholders with your real keys:

```php
<?php
return [
    'RESEND_API_KEY' => 're_PASTE_THE_RESEND_KEY_HERE',
    'TURNSTILE_SECRET_KEY' => '0xPASTE_THE_TURNSTILE_SECRET_KEY_HERE',
];
```

4. Save. Right-click the file → **Permissions** and set `640` (or `600`).
5. Optional settings (destination mailbox, sender, IP header) are described in `config.sample.php` in the repository. The defaults already match your choices: to `srivatsans@meridanta.com`, from `Meridanta Website <noreply@send.meridanta.com>`.

Until this file exists the form shows the error message with the email fallback link; it never pretends to send.

## d. Build and upload

1. On your computer, copy `.env.example` to a new file called `.env` in the project folder and put the **site key** after the equals sign:
   `VITE_TURNSTILE_SITE_KEY=0xYourSiteKey`
   (`.env` is ignored by git, it is not committed.)
2. Run `npm run build`. The build warns if the key is missing.
3. Upload **all** contents of the `dist` folder into `public_html`, replacing the old files. Follow `docs/DEPLOY_HOSTINGER.md` step by step. In File Manager, open **Settings** and turn on **Show hidden files**, because `.htaccess` is a hidden file and the `api` folder must be included too.

## e. Test procedure

Do these after the first upload. Use a private browser window.

**1. A real enquiry.** Open https://meridanta.com, scroll to the form, fill it in, tick the Turnstile box, press **Send inquiry**. Expected: a "Thank you" message. Within a minute an email arrives at srivatsans@meridanta.com (check Junk the first time), subject like `New website enquiry: Qlik Solutions & Accelerators – Acme`, and **Reply** goes to the address you typed. The server log (File Manager → `meridanta-data/contact.log`, next to `public_html`) has a line ending in `sent`.

**2. Invalid email.** On the website, type `abc` in the email box: the form stops you before sending. To test the server itself, open a terminal and run:
```
curl -s -X POST https://meridanta.com/api/contact.php -H "Content-Type: application/json" -d "{\"name\":\"T\",\"email\":\"abc\",\"message\":\"short\"}"
```
Expected: `422` and `{"ok":false,"error":"validation","errors":{"email":"...","message":"..."}}`.

**3. Honeypot.** Run:
```
curl -s -X POST https://meridanta.com/api/contact.php -H "Content-Type: application/json" -d "{\"name\":\"Bot\",\"email\":\"bot@example.com\",\"message\":\"I am a bot message\",\"website\":\"http://spam.example\"}"
```
Expected: `{"ok":true}` (the bot is told it worked) but **no email arrives**, and the log has a `honeypot` line.

**4. Turnstile is enforced.** Run the same command with a valid name, email and message of 10+ characters and `"turnstileToken":"fake"`. Expected: `403` `{"ok":false,"error":"verification_failed"}` and no email.

**5. Rate limit (5 requests per hour per visitor).** Run the command from test 2 six times quickly. Expected: the first five answer `422`, the sixth answers `429` `{"ok":false,"error":"rate_limited"}` with a `Retry-After` header. On the website the same case shows "You have sent several requests recently...". Your IP stays blocked for up to an hour; to clear it at once delete the files in `meridanta-data/ratelimit/` (File Manager).

**6. Wrong method.** Open https://meridanta.com/api/contact.php in the browser (a GET). Expected: `{"ok":false,"error":"method_not_allowed"}`.

**7. (Optional) Missing config.** Rename `meridanta-config.php` for a minute and send a real enquiry. Expected: the red message with the `mailto:srivatsans@meridanta.com` link, never a success message. Rename it back.

## If something goes wrong

Every refusal is explained in `meridanta-data/contact.log`; the visitor never sees internal details.

| What you see | Likely cause and fix |
|---|---|
| Form shows the error message, log says `config_missing_or_incomplete` | `meridanta-config.php` is missing, in the wrong folder (it must be next to `public_html`, not inside it) or still has the `PASTE_` placeholders. |
| `resend_failed` with status 401 or 403 | Wrong API key, or the domain `send.meridanta.com` is not **Verified** in Resend yet. |
| `turnstile_refused` | Secret key does not belong to the site key used in the build, or the hostname is not listed in the Turnstile widget. Rebuild with the right site key. |
| `turnstile_unreachable` | Cloudflare could not be reached from the server. Check that Hostinger allows outgoing connections (curl); contact support if it persists. |
| Emails go to Junk | Check the Resend domain shows Verified and keep the three DNS records. Add `noreply@send.meridanta.com` to the safe senders of the mailbox. |
| Everybody gets "several requests recently" | The server shows the same IP for all visitors (a proxy). In the config file set `'ip_header' => 'HTTP_X_FORWARDED_FOR'` (see `config.sample.php`). |
| The form shows no verification box | The site key was not in `.env` when you built. Add it and build again. |
| `500` / `ratelimit_*unwritable` in the log | PHP cannot write next to `public_html`. Create a folder `meridanta-data` there yourself and set its permissions to `755` or `700`. |
