// Single source for page-level SEO: titles, descriptions, canonical URLs, crawler rules.
// Used by <PageMeta> (head tags in every prerendered page) and by the build-time generators in
// src/seoFiles.js (sitemap.xml, robots.txt, llms.txt, llms-full.txt), so they can never disagree.
import { INDUSTRIES } from "./data";
import { QLIK_OVERVIEW } from "./qlikData";

export const SITE = {
  url: "https://meridanta.com",
  name: "Meridanta",
  language: "en",
  locale: "en_US",
  themeColor: "#0C1230",
  ogImage: "/og-image.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: "Meridanta: outcome-driven AI, data and cloud solutions",
  // TODO: add the X/Twitter handle (e.g. "@meridanta") once the profile exists; it enables twitter:site.
  twitterSite: "",
};

// Targets for the length checks below (characters).
export const TITLE_RANGE = [50, 60];
export const DESCRIPTION_RANGE = [140, 160];

/**
 * [DECISION] Should AI *training* crawlers be allowed? Defaults to true until the owner decides.
 * Setting this to false adds a "Disallow: /" group for them in robots.txt; search and answer
 * crawlers (and user-triggered fetchers) stay allowed.
 */
export const ALLOW_AI_TRAINING = true;

export const CRAWLERS = [
  { group: "Search engines", agents: ["Googlebot", "Bingbot", "DuckDuckBot", "Applebot"], training: false },
  { group: "AI search and answer engines", agents: ["OAI-SearchBot", "PerplexityBot", "Claude-SearchBot"], training: false },
  { group: "AI assistants fetching a page for a user", agents: ["ChatGPT-User", "Perplexity-User", "Claude-User"], training: false },
  { group: "Other crawlers", agents: ["Amazonbot"], training: false },
  { group: "AI model training", agents: ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot"], training: true },
];

/** [SRI] Titles and descriptions for the pages below; edit here. Industry pages are keyed by slug. */
const HOME = {
  title: "Meridanta | Outcome-driven AI, Data & Cloud Solutions",
  description: "Meridanta helps organizations solve business problems with AI, data and analytics, cloud and Qlik expertise, using an AI-first, outcome-driven approach.",
};
const QLIK = {
  title: "Qlik Center of Excellence | Data, Analytics & AI | Meridanta",
  description: QLIK_OVERVIEW.description,
};
const INDUSTRY_SEO = {
  healthcare: {
    title: "Healthcare Data, AI & Analytics Solutions | Meridanta",
    description: "AI and data solutions that help providers, payers and pharma improve affordability, patient outcomes and operational efficiency. Delivered by Meridanta.",
  },
  "communications-media-entertainment": {
    title: "Communications, Media & Entertainment Solutions | Meridanta",
    description: "Data, AI and cloud solutions that optimize networks, personalize engagement and unlock new revenue streams for communications, media and entertainment.",
  },
};

/** Fallback for an industry added to INDUSTRIES without an entry above (the build warns if it is out of range). */
const industryFallback = (d) => ({
  title: `${d.tab} AI, Data & Cloud Solutions | ${SITE.name}`,
  description: `${d.cardDesc} Delivered by ${SITE.name}.`,
});

/**
 * Every indexable page. `sources` are the files whose last change decides the sitemap lastmod.
 * Adding an industry to src/data.js adds its page here (and so to the sitemap, llms.txt and the head tags).
 */
export const PAGES = [
  { path: "/", ...HOME, sources: ["src/pages/Home.jsx", "src/data.js", "src/components"] },
  { path: "/qlik/", ...QLIK, trail: [{ label: "Qlik" }], sources: ["src/pages/QlikOverview.jsx", "src/qlikData.js", "src/accelerators.js", "src/caseStudies.js"] },
  ...INDUSTRIES.map((d) => ({
    path: `/industries/${d.slug}/`,
    ...(INDUSTRY_SEO[d.slug] ?? industryFallback(d)),
    trail: [{ label: "Industries", to: "/#industries" }, { label: d.tab }],
    sources: ["src/pages/IndustryPage.jsx", "src/data.js"],
  })),
];

export const NOT_FOUND_SEO = {
  title: "Page not found | Meridanta",
  description: "The page you are looking for could not be found. Explore Meridanta's AI, data and cloud solutions or the Qlik Center of Excellence.",
};

/** Canonical URL policy: absolute, https, non-root paths end with a slash (matches the nested HTML files). */
export const canonicalUrl = (path) => SITE.url + path;
export const absoluteUrl = (path) => (path.startsWith("http") ? path : SITE.url + path);

export const seoFor = (path) => PAGES.find((p) => p.path === path) ?? null;

/** Human-readable warnings for titles/descriptions outside the target ranges or duplicated. */
export function seoWarnings() {
  const out = [];
  const seen = new Map();
  for (const p of PAGES) {
    if (p.title.length < TITLE_RANGE[0] || p.title.length > TITLE_RANGE[1]) out.push(`${p.path}: title is ${p.title.length} chars (target ${TITLE_RANGE.join("-")})`);
    if (p.description.length < DESCRIPTION_RANGE[0] || p.description.length > DESCRIPTION_RANGE[1]) out.push(`${p.path}: description is ${p.description.length} chars (target ${DESCRIPTION_RANGE.join("-")})`);
    for (const k of ["title", "description"]) {
      const key = k + ":" + p[k];
      if (seen.has(key)) out.push(`${p.path}: ${k} duplicates ${seen.get(key)}`);
      else seen.set(key, p.path);
    }
  }
  return out;
}
