import { HC_FEATURES, INDUSTRIES, NAV, PLATFORM, QLIK_ACCELERATORS, SERVICES, TALEND } from "./data";
import { QLIK_CAPABILITIES, QLIK_OFFERINGS } from "./qlikData";
import { accelerators } from "./accelerators";

/**
 * Everything the header search can find. Built from the site data, so new services, industries and
 * Qlik capabilities show up without touching this file.
 * Each entry: { title, group, path, hash?, keywords }. `hash` is an element id on `path`.
 */
const section = (id, title, keywords = "") => ({ title, group: "Page section", path: "/", hash: id, keywords });

export const SEARCH_INDEX = [
  ...NAV.filter((n) => n.id !== "home").map((n) => section(n.id, n.label)),
  section("contact", "Contact Us", "get in touch talk email form united states india"),
  ...SERVICES.map((s) => ({ title: s.title, group: "Services", path: "/", hash: "services", keywords: [s.short, ...s.items].join(" ") })),
  ...INDUSTRIES.map((d) => ({ title: d.tab, group: "Industries", path: "/industries/" + d.slug, keywords: [d.cardTitle, d.cardDesc, d.tagline].filter(Boolean).join(" ") })),
  { title: "Qlik Center of Excellence", group: "Qlik", path: "/qlik", keywords: "qlik sense talend data integration analytics ai platform" },
  ...QLIK_CAPABILITIES.map((c) => ({ title: c.title, group: "Qlik capabilities", path: "/qlik", hash: "capabilities", keywords: [c.intro, ...c.bullets].join(" ") })),
  ...QLIK_OFFERINGS.map((o) => ({ title: "Qlik " + o.title, group: "Qlik services", path: "/qlik", hash: "qlik-services", keywords: o.items.join(" ") })),
  { title: "Case Studies", group: "Qlik", path: "/qlik", hash: "case-studies", keywords: "qlik migration replication modernization upgrade snowflake databricks kafka outcomes results" },
  { title: "HCInsights", group: "Products & Solutions", path: "/", hash: "solutions", keywords: HC_FEATURES.map(([t]) => t).join(" ") + " healthcare insights" },
  { title: "Qlik Accelerators", group: "Products & Solutions", path: "/", hash: "solutions", keywords: accelerators.map((a) => a.tab + " " + a.tagline).join(" ") },
  { title: "Talend Frameworks", group: "Products & Solutions", path: "/", hash: "solutions", keywords: TALEND.join(" ") },
  { title: "Data Platform Solutions", group: "Products & Solutions", path: "/", hash: "solutions", keywords: PLATFORM.join(" ") },
];

const norm = (s) => s.toLowerCase();

/** Entries matching every word of `query`, best title matches first. */
export function searchSite(query, limit = 8) {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return SEARCH_INDEX
    .map((e) => {
      const title = norm(e.title);
      const haystack = `${title} ${norm(e.group)} ${norm(e.keywords)}`;
      if (!words.every((w) => haystack.includes(w))) return null;
      const score = words.reduce((n, w) => n + (title.startsWith(w) ? 3 : title.includes(w) ? 2 : 1), 0);
      return { entry: e, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.entry);
}
