// Feature flag for the contact form.
//
// The form needs server-side setup (Resend, Cloudflare Turnstile, ../meridanta-config.php). Until that is done the
// site shows an email contact card instead, so visitors never meet a form that cannot send.
//
//   VITE_CONTACT_FORM_ENABLED=true  and  VITE_TURNSTILE_SITE_KEY=<site key>   ->  the enquiry form
//   anything else (the default)                                               ->  the email contact card
//
// "Enabled but no site key" also falls back to the card (the build prints a warning, see vite.config.js).
// Both values are read when the site is built, so change them in .env and run `npm run build` again.
const wanted = import.meta.env.VITE_CONTACT_FORM_ENABLED === "true";
const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

export const CONTACT_FORM_ENABLED = wanted && siteKey !== "";
