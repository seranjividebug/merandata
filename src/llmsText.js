// Plain-text and Markdown summaries of the public site for AI systems (llms.txt, llms-full.txt).
// Everything here is read from the same data files that render the pages, so new services,
// industries, accelerators and case studies appear automatically. Nothing is written by hand.
import { HERO_SLIDES, INDUSTRIES, PILLARS, QLIK_BENEFITS, SERVICES, TALEND, PLATFORM } from "./data";
import { accelerators } from "./accelerators";
import { ACCELERATOR_STACK } from "./acceleratorStack";
import { caseStudies, FEATURED_CASE_IDS } from "./caseStudies";
import { QLIK_CAPABILITIES, QLIK_JOURNEY, QLIK_OFFERINGS, QLIK_OVERVIEW, QLIK_TM } from "./qlikData";
import { ABOUT, COMPANY, addressLine } from "./company";
import { SITE, absoluteUrl } from "./seo";
import { PRIVACY_UPDATED, privacyText } from "./privacyData";

const TAGLINE = COMPANY.slogan;
const PUBLISHED = caseStudies.filter((c) => c.published);

const bullets = (items) => items.map((t) => `- ${t}`).join("\n");
const link = (label, path, note) => `- [${label}](${absoluteUrl(path)})${note ? `: ${note}` : ""}`;
const caseUrl = (c) => `/qlik/#case-${c.id}`;
const stack = (id) => (ACCELERATOR_STACK[id] ?? []).map((s) => s.label).join(", ");

/** Email, phone and address, only the ones that are confirmed in src/company.js. */
const contactLines = () => [
  COMPANY.email && `- Email: ${COMPANY.email}`,
  COMPANY.phone && `- Phone: ${COMPANY.phone}`,
  addressLine() && `- ${COMPANY.addressLabel}: ${addressLine()}`,
].filter(Boolean);

/** Concise overview with links (https://llmstxt.org format). */
export function buildLlmsTxt() {
  const featured = FEATURED_CASE_IDS.map((id) => PUBLISHED.find((c) => c.id === id)).filter(Boolean);
  return [
    `# ${SITE.name}`,
    "",
    `> ${ABOUT[0]}`,
    "",
    `${TAGLINE} ${ABOUT[1]}`,
    "",
    "## Services",
    bullets(SERVICES.map((s) => `${s.title}: ${s.short}`)),
    "",
    "## Qlik Center of Excellence",
    link(QLIK_OVERVIEW.h1, "/qlik/", QLIK_OVERVIEW.description),
    `- Offerings: ${QLIK_OFFERINGS.map((o) => o.title).join(", ")}.`,
    `- Capabilities: ${QLIK_CAPABILITIES.map((c) => c.title).join("; ")}.`,
    link("Qlik Accelerators", "/qlik/#accelerators", accelerators.map((a) => a.title).join("; ")),
    "",
    "## Industries",
    ...INDUSTRIES.map((d) => link(d.tab, `/industries/${d.slug}/`, d.cardDesc)),
    "",
    `## Case study highlights (${PUBLISHED.length} published on the Qlik page)`,
    ...featured.map((c) => link(c.title, caseUrl(c), `${c.summary} (${c.highlight.value} ${c.highlight.label})`)),
    "",
    "## Contact",
    link("Contact form and consultation requests", "/#contact", "Tell us about your business challenge or technology initiative."),
    ...contactLines(),
    "",
    "## Optional",
    link("Privacy Policy", "/privacy/", "what personal details we collect through the website and why"),
    link("Full site text for AI systems", "/llms-full.txt"),
    link("Sitemap", "/sitemap.xml"),
    "",
    `Trademarks: ${QLIK_TM}`,
    "",
  ].join("\n");
}

const section = (title, body) => `\n## ${title}\n\n${body}\n`;

function servicesText() {
  return SERVICES.map((s) => `### ${s.title}\n\n${s.desc}\n\n${bullets(s.items)}`).join("\n\n");
}

function industriesText() {
  return INDUSTRIES.map((d) => [
    `### ${d.tab} (${absoluteUrl(`/industries/${d.slug}/`)})`, "", `${d.tagline}`, "", d.cardDesc, "",
    `**Industry challenges.** ${d.ch}`, "", `**Technology opportunities.** ${d.op}`, "", `**Our capabilities.** ${d.ca}`,
  ].join("\n")).join("\n\n");
}

function qlikText() {
  const offerings = QLIK_OFFERINGS.map((o, i) => `### ${o.title}\n\n${QLIK_JOURNEY[i].description} Outcome: ${QLIK_JOURNEY[i].outcome}\n\n${bullets(o.items)}`).join("\n\n");
  const caps = QLIK_CAPABILITIES.map((c) => `### ${c.title}\n\n${c.intro}\n\n${bullets(c.bullets)}`).join("\n\n");
  return [QLIK_OVERVIEW.intro, "", "### Offerings", "", offerings, "", "### Capabilities", "", caps].join("\n");
}

function acceleratorsText() {
  const items = accelerators.map((a) => [
    `### ${a.title}`, "", a.tagline, "", `Built with: ${stack(a.id)}`, "", `**Business challenge.** ${a.challenge}`, "",
    "**Solution**", bullets(a.solution), "", "**Key features**", bullets(a.features), "", "**Benefits**", bullets(a.benefits),
  ].join("\n")).join("\n\n");
  return `${bullets(QLIK_BENEFITS.map(([t, d]) => `${t}: ${d}`))}\n\n${items}`;
}

function casesText() {
  return PUBLISHED.map((c) => [
    `### ${c.title}`, "", `${c.category}. ${c.audience}. ${absoluteUrl(caseUrl(c))}`, "", c.summary, "",
    `Key numbers: ${c.stats.map((s) => `${s.value} ${s.label}`).join("; ")}`, "",
    "**Challenge**", bullets(c.challenge), "", "**Solution**", bullets(c.solution), "", "**Outcome**", bullets(c.outcome), "", "**Result**", bullets(c.result),
  ].join("\n")).join("\n\n");
}

/** Full plain text of every public section. */
export function buildLlmsFullTxt() {
  const slides = HERO_SLIDES.map((s) => `- ${s.title}: ${s.desc}`).join("\n");
  const platform = `Technology solutions and implementation capabilities that help organizations build, modernize, and operate data and analytics environments.\n\nCapabilities:\n${bullets(PLATFORM)}\n\nTalend frameworks:\n${bullets(TALEND)}`;
  return [
    `# ${SITE.name}: full site text`,
    "",
    `Source: ${SITE.url}. This file repeats the public content of the website as plain text for AI systems. Short version: ${absoluteUrl("/llms.txt")}`,
    section("About Meridanta", `${TAGLINE}\n\n${ABOUT.join("\n\n")}\n\n${bullets(PILLARS.map(([, t, d]) => `${t}: ${d}`))}`),
    section("Highlights", slides),
    section("Services", servicesText()),
    section("Industries", industriesText()),
    section(`Qlik Center of Excellence (${absoluteUrl("/qlik/")})`, qlikText()),
    section("Qlik Accelerators", acceleratorsText()),
    section("Data Platforms & Cloud Solutions", platform),
    section(`Case studies (${PUBLISHED.length})`, casesText()),
    section("Contact", `Use the contact form at ${absoluteUrl("/#contact")} to describe your business challenge or technology initiative.${contactLines().length ? "\n\n" + contactLines().join("\n") : ""}`),
    section(`Privacy Policy (${absoluteUrl("/privacy/")}, last updated ${PRIVACY_UPDATED})`, privacyText()),
    section("Trademarks", QLIK_TM),
  ].join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}
