# Deploying to Hostinger (manual checklist)

meridanta.com is served by Hostinger. You upload the **contents of `dist`** into `public_html`. `.htaccess` (inside `dist`) is the single source of truth for redirects, the 404 page, caching and blocked files. The contact form needs the one-time setup in `docs/CONTACT_SETUP.md` first (Resend, Turnstile, the private config file).

## Before you build

- [ ] The code you want live is on `main` (`git pull`).
- [ ] `.env` exists in the project folder with `VITE_TURNSTILE_SITE_KEY=...` (copy `.env.example`). The build prints a `[contact]` warning if it is missing.
- [ ] `npm ci` (first time or after dependency changes).
- [ ] `npm run build` finishes with `Build finished` and no error.
- [ ] `npm run check:html` ends with `0 errors` (the "placeholder link #" warnings for the social icons are expected until the real URLs are added).

## Package and upload

1. **Back up first.** In hPanel File Manager, select everything inside `public_html`, compress it to a zip (`backup-YYYY-MM-DD.zip`) and download it. This is your rollback.
2. Make one zip of the **contents** of `dist` (not the folder itself). In a terminal in the project folder: `tar -a -cf dist.zip -C dist .` (the zip then has `index.html` at the top).
3. In File Manager open **Settings** and tick **Show hidden files**. Without it you will not see `.htaccess`.
4. Inside `public_html`, delete the old site files: `assets/`, `index.html`, `404.html`, `qlik/`, `industries/`, `api/`, the old `.htaccess` and the loose files. **Keep** the `.well-known` folder if it exists (it is used for the SSL certificate) and keep `public_html/.htaccess` only if you have to; the new one replaces it.
5. Upload `dist.zip` into `public_html` and **Extract** it there. Delete the zip afterwards.
6. Check that `public_html` now contains: `.htaccess`, `index.html`, `404.html`, `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `site.webmanifest`, the icon files, `og-image.png`, `assets/`, `qlik/`, `industries/`, **`api/contact.php`**.
7. The private file `meridanta-config.php` is **not** part of the upload. It lives one level above `public_html` and stays where it is (see `CONTACT_SETUP.md`, step c).
8. If you use the Hostinger CDN / cache, purge it (hPanel → Performance → Cache or CDN → Purge).

## Verify after every deploy

Use a private window and Ctrl+F5. Commands use `curl` (in any terminal); `-I` shows only the headers.

| # | Check | Expected |
|---|---|---|
| 1 | https://meridanta.com/ | Home page with the hero, no broken images. |
| 2 | `curl -I https://meridanta.com/qlik` | `301` to `/qlik/`; https://meridanta.com/qlik/ shows the Qlik page; refresh (F5) keeps it. |
| 3 | https://meridanta.com/industries/healthcare/ | Healthcare page loads and survives a refresh. |
| 4 | https://meridanta.com/this-page-does-not-exist | The "Page not found" page **and** `curl -I` shows `404` (not 200). |
| 5 | https://meridanta.com/robots.txt | Plain text starting `# robots.txt for https://meridanta.com`, with the `Sitemap:` line. |
| 6 | https://meridanta.com/sitemap.xml | XML with 4 URLs, all starting `https://meridanta.com/`. |
| 7 | https://meridanta.com/llms.txt and /llms-full.txt | Plain text about Meridanta. |
| 8 | `curl -I http://meridanta.com/` | `301` to `https://meridanta.com/`. |
| 9 | `curl -I https://www.meridanta.com/` | `301` to `https://meridanta.com/` (one redirect). |
| 10 | https://meridanta.com/.htaccess , /_headers , /_redirects | All answer the 404 page (never the file content). |
| 11 | https://meridanta.com/api/contact.php (browser) | `{"ok":false,"error":"method_not_allowed"}` (the PHP runs; it is not the home page). |
| 12 | `curl -I https://meridanta.com/assets/<any .js file>` | `cache-control: public, max-age=31536000, immutable`. |
| 13 | `curl -I https://meridanta.com/` | `cache-control: no-cache`. |
| 14 | Contact form | Run the tests in `CONTACT_SETUP.md` section e (at least the real enquiry). |
| 15 | Social preview | Paste the home URL into a LinkedIn or Slack message: title, description and the 1200x630 image appear. |

If a check fails, restore the backup zip (upload, extract over `public_html`) and tell me which row failed.

## Which files matter on Hostinger

| File | On Hostinger |
|---|---|
| `.htaccess` | **Essential.** All rewrites, redirects, the 404 status, HTTPS/www, caching and blocked files. Hidden file: do not forget it. |
| `404.html` | Essential: the page shown for unknown URLs. |
| `api/contact.php` | Essential: the contact endpoint. |
| `_headers`, `_redirects` | **Cloudflare-only.** Hostinger ignores them. They are in `dist` because the Cloudflare preview (`merandatav3`) needs them; `.htaccess` blocks them from being downloaded. You can delete them from `public_html` after uploading; nothing depends on them. |
| `.assetsignore` | Cloudflare-only (hidden file, blocked). Safe to delete. |
| `wrangler.jsonc`, `.nvmrc` | Cloudflare/Node build files in the repository; never part of `dist`. Ignored by Hostinger. |
| `config.sample.php`, `.env.example` | Repository only, never deployed. |
| `meridanta-config.php` | The real secrets file, one level above `public_html`, uploaded once by hand. |
| `meridanta-data/` | Created by PHP next to `public_html` (log and rate-limit files). Nothing to upload. |

## Rollback

Upload the backup zip from step 1 into `public_html` and extract it over the current files, then purge the cache.
