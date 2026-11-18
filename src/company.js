// Single source of truth for company facts. Used by the footer, the contact section, the JSON-LD
// (src/schema.js), llms.txt and llms-full.txt, so the same details appear everywhere.
//
// [SRI] Review every value. Never invent facts: leave a field empty ("") until it is confirmed.
// Empty fields are not shown on the page and are left out of the structured data.
//
// TODO (needs confirmation before launch):
//   legalName          registered legal entity name
//   phone              public business phone, with country code
//   foundingDate       year or date the company was founded (YYYY or YYYY-MM-DD)
import { INDUSTRIES, SERVICES } from "./data";
import { QLIK_CAPABILITIES } from "./qlikData";
import { SITE } from "./seo";
import { SOCIAL_LINKS } from "./social";

/** About copy shown in the About section and reused for descriptions. */
export const ABOUT = [
  "Meridanta focuses on AI, Data & Analytics, and Cloud solutions that help organizations address business challenges through practical technology and disciplined delivery.",
  "Our approach brings together business understanding, engineering expertise, and outcome-oriented execution to help customers turn technology opportunities into meaningful results.",
];

export const COMPANY = {
  name: SITE.name,
  legalName: "", // TODO: registered legal entity name
  url: SITE.url,
  logo: "/icon-512.png",
  logoSize: 512,
  description: ABOUT[0],
  slogan: "Technology Expertise. Business Outcomes.",
  email: "srivatsans@meridanta.com", // public business email (supplied by the owner)
  phone: "", // TODO: public business phone, with country code
  // Registered office (supplied by the owner). addressCountry is the ISO code used by search engines; the page shows "USA".
  address: { streetAddress: "262 Chapman Rd, Ste 240", addressLocality: "Newark", addressRegion: "DE", postalCode: "19702", addressCountry: "US" },
  addressLabel: "Registered Office",
  foundingDate: "", // TODO: confirm
  areaServed: ["United States", "India"],
  // Product names that appear in the site copy (Qlik offerings and capabilities).
  products: ["Qlik Replicate", "Qlik Compose", "Qlik Catalog", "QlikView", "Qlik Sense", "Talend"],
};

/**
 * Mailbox that receives website enquiries. It is shown to a visitor only when the contact form cannot send
 * ("email us directly"). It is deliberately not part of COMPANY.email, so it is not published in the footer,
 * the structured data or llms.txt.
 */
export const ENQUIRY_EMAIL = "srivatsans@meridanta.com";

/** Social profiles that are real (placeholder "#" links are not published as structured data). */
export const socialProfiles = () => SOCIAL_LINKS.filter((s) => /^https?:\/\//.test(s.url));

/** Topics Meridanta covers, taken from the site content rather than written by hand. */
export const knowsAbout = () => [
  ...new Set([
    ...SERVICES.map((s) => s.title),
    ...QLIK_CAPABILITIES.map((c) => c.title),
    ...INDUSTRIES.map((d) => d.tab),
    ...COMPANY.products,
  ]),
];

const hasAddress = () => Object.values(COMPANY.address).some(Boolean);
/** One-line postal address as shown on the page ("262 Chapman Rd, Ste 240, Newark, DE 19702, USA"), or "" when not set. */
export const addressLine = () => {
  const a = COMPANY.address;
  return [a.streetAddress, a.addressLocality, [a.addressRegion, a.postalCode].filter(Boolean).join(" "), a.addressCountry === "US" ? "USA" : a.addressCountry].filter(Boolean).join(", ");
};
export const hasContactDetails = () => Boolean(COMPANY.email || COMPANY.phone || hasAddress());
