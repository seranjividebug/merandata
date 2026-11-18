<?php
/**
 * SAMPLE ONLY. This file is NOT deployed (it lives outside the public/ folder) and contains no real secrets.
 *
 * What to do:
 *   1. Copy this file to the server as   meridanta-config.php
 *      in the folder ONE LEVEL ABOVE public_html (so it is not reachable from the web).
 *   2. Replace the two placeholder values with the real keys (see docs/CONTACT_SETUP.md).
 *   3. Set the file permissions to 640 (or 600).
 *
 * Never commit the real file. Never put it inside public_html or the dist folder.
 */
return [
    // Required. From the Resend dashboard: API Keys -> Create API Key (permission "Sending access" is enough).
    'RESEND_API_KEY' => 'PASTE_YOUR_RESEND_API_KEY_HERE',

    // Required. From the Cloudflare Turnstile widget settings: the SECRET key (the site key is public and is
    // built into the website through VITE_TURNSTILE_SITE_KEY).
    'TURNSTILE_SECRET_KEY' => 'PASTE_YOUR_TURNSTILE_SECRET_KEY_HERE',

    // ---- Optional settings. Remove the // to change a default. ----

    // Where enquiries are delivered (default shown).
    // 'mail_to' => 'srivatsans@meridanta.com',

    // Sender. The domain must be verified in Resend (default shown).
    // 'mail_from' => 'Meridanta Website <noreply@send.meridanta.com>',

    // Folder for the rate-limit files and the log. Must be OUTSIDE public_html and writable by PHP.
    // Default: a folder called meridanta-data next to public_html.
    // 'data_dir' => '/home/USER/domains/meridanta.com/meridanta-data',

    // Which server variable holds the visitor's IP address for the rate limit. The default REMOTE_ADDR is
    // right on most servers. If every visitor shows the same IP in the log (ip=... is always the same id),
    // the site is behind a proxy: try 'HTTP_X_FORWARDED_FOR' or 'HTTP_X_REAL_IP'.
    // 'ip_header' => 'REMOTE_ADDR',

    // Testing only: point these at a local mock server. Leave them out in production.
    // 'resend_api_url' => 'https://api.resend.com/emails',
    // 'turnstile_verify_url' => 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
];
