import { COMPANY } from "./company";

/**
 * Short highlights for the About page and the home teaser. Each is a fact already on the site: the "AI-first" wording
 * (seo.js description), the Qlik Center of Excellence service, the About copy, and COMPANY.areaServed.
 * Each entry is [icon key from Icons.jsx, text].
 */
export const ABOUT_HIGHLIGHTS = [
  ["ai", "AI-first approach"],
  ["bi", "Qlik Center of Excellence"],
  ["db", "Data, Analytics & Cloud"],
  ["compass", `Serving the ${COMPANY.areaServed.join(" & ")}`],
];
