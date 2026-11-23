// Builds docs/CONTENT_REVIEW.md for the content owner (Sri) from the data files and the built HTML in dist/.
//   npm run build && node scripts/build-content-review.mjs
// Facts (copy, meta tags, JSON-LD, brand mentions, metrics) are read from the site itself, so the pack is
// always current. The commentary sections are written in this file; edit them here, not in the output.
import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "vite";
import { JSDOM } from "jsdom";

const server = await createServer({ configFile: false, appType: "custom", logLevel: "silent", server: { middlewareMode: true } });
const load = (p) => server.ssrLoadModule(p);
const [data, qlik, cases, accs, seo, company, stack] = await Promise.all(
  ["/src/data.js", "/src/qlikData.js", "/src/caseStudies.js", "/src/accelerators.js", "/src/seo.js", "/src/company.js", "/src/acceleratorStack.js"].map(load),
);
await server.close();

const PAGES = { "/": "dist/index.html", "/qlik/": "dist/qlik/index.html", "/industries/healthcare/": "dist/industries/healthcare/index.html", "/industries/communications-media-entertainment/": "dist/industries/communications-media-entertainment/index.html" };
const dom = Object.fromEntries(Object.entries(PAGES).map(([u, f]) => [u, new JSDOM(readFileSync(f, "utf8")).window.document]));
const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const cell = (s) => clean(s).replace(/\|/g, "\\|");
const q = (d, sel) => clean(d.querySelector(sel)?.textContent);
const meta = (d, name) => d.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ?? "";
const bullets = (items) => items.map((t) => `- ${t}`).join("\n");
const jsonLd = (d) => JSON.parse(d.querySelector('script[type="application/ld+json"]').textContent)["@graph"];
const published = cases.caseStudies.filter((c) => c.published);

// ---------- page by page ----------
function ldSummary(d) {
  const g = jsonLd(d);
  const org = g.find((n) => n["@type"] === "Organization");
  const lines = [
    `- Types: ${g.map((n) => n["@type"]).join(", ")}`,
    `- Organization: name "${org.name}", slogan "${org.slogan}", areaServed ${org.areaServed.map((a) => a.name).join(" and ")}, ${org.knowsAbout.length} knowsAbout topics, sameAs ${org.sameAs ? org.sameAs.length : 0} profiles; no legal name, email, phone, address or founding date yet`,
  ];
  const services = g.filter((n) => n["@type"] === "Service").map((n) => n.name);
  if (services.length) lines.push(`- Services: ${services.join("; ")}`);
  const list = g.find((n) => n["@type"] === "ItemList");
  if (list) lines.push(`- Case study ItemList: ${list.numberOfItems} items`);
  const crumbs = g.find((n) => n["@type"] === "BreadcrumbList");
  if (crumbs) lines.push(`- Breadcrumb: ${crumbs.itemListElement.map((i) => i.name).join(" > ")}`);
  return lines.join("\n");
}
const pageHead = (url, label) => {
  const d = dom[url];
  return [`### ${label} (\`${url}\`)`, "", "| Item | Current value | Approve | Edit | Remove |", "|---|---|---|---|---|",
    `| Meta title (${clean(d.querySelector("title")?.textContent).length} chars) | ${cell(d.querySelector("title")?.textContent)} | | | |`,
    `| Meta description (${meta(d, "description").length} chars) | ${cell(meta(d, "description"))} | | | |`,
    `| H1 | ${cell(q(d, "h1"))} | | | |`].join("\n");
};
const sectionRow = (d, id, label) => {
  const s = d.getElementById(id);
  if (!s) return "";
  const h = clean((s.querySelector("h2") ?? s.querySelector("h3"))?.textContent);
  const intro = clean(s.querySelector(".head p, .lede, .lead")?.textContent);
  return `| ${label} | ${cell(h)} | ${cell(intro)} | | | |`;
};

const home = () => [
  pageHead("/", "Home"),
  "", "JSON-LD values:", ldSummary(dom["/"]), "",
  "#### Hero banners (3): DRAFT – Sri to review", "", "| Headline | Tagline | Description | Button and link | Approve | Edit | Remove |", "|---|---|---|---|---|---|---|",
  ...data.HERO_SLIDES.map((s) => `| ${cell(s.title)} | ${cell(s.tagline)} | ${cell(s.desc)} | ${cell(s.cta)} → ${cell(s.to ?? "/#" + s.section)} | | | |`), "",
  "#### Sections", "", "| Section | Headline | Intro | Approve | Edit | Remove |", "|---|---|---|---|---|---|",
  sectionRow(dom["/"], "services", "Services"), sectionRow(dom["/"], "industries", "Industries"), sectionRow(dom["/"], "solutions", "Products & Solutions"),
  `| About | ${cell(q(dom["/"], "#about-h"))} | ${cell(company.ABOUT.join(" "))} | | | |`, "",
  "#### What We Do: DRAFT – Sri to review", "", `**${data.SERVICES_INTRO.tagline}** (h2)`, "", ...data.SERVICES_INTRO.lines.map((l) => l + "  "), "",
  ...data.SERVICES.map((s) => `**${s.n} · ${s.title}: ${s.tagline}.** ${s.desc}\n${bullets(s.items)}\nExplore link: ${s.href ?? "not shown yet (planned page " + s.future + ")"}\n`),
  "#### Industries We Serve (home cards)", "",
  ...data.INDUSTRIES.map((d) => `**${d.tab}: ${d.cardTitle}.** ${d.cardDesc}\n${bullets(d.points.map(([a, b]) => `${a}: ${b}`))}\n`),
  "#### Products & Solutions", "",
  "- Qlik Accelerators card: \"Ready-made components that speed up Qlik monitoring, reporting and operations.\" Chips: 5 accelerators, Qlik Sense & Replicate, Monitoring, reporting, logs.",
  "- HCInsights card: \"A turnkey healthcare insights solution that unifies clinical, operational and financial data.\" Chips: 5 modules, Clinical + financial data, Power BI dashboards. (Links to the Healthcare page; there is no HCInsights page.)",
  `- Data Platforms & Cloud Solutions: capabilities ${data.PLATFORM.join("; ")}. Talend frameworks: ${data.TALEND.join("; ")}.`, "",
  "#### About", "", `Tagline: ${company.COMPANY.slogan}`, "", ...company.ABOUT, "", bullets(data.PILLARS.map(([, t, d]) => `${t}: ${d}`)), "",
  "#### Contact", "", "Form fields: name, business email, company (optional), area of interest (optional), message. Interest options: " + data.INTERESTS.join("; ") + ".", "",
].join("\n");

const qlikPage = () => {
  const d = dom["/qlik/"];
  return [
    pageHead("/qlik/", "Qlik Center of Excellence"), "", "JSON-LD values:", ldSummary(d), "",
    `Eyebrow: ${qlik.QLIK_OVERVIEW.eyebrow}. Intro: ${qlik.QLIK_OVERVIEW.intro}`, "",
    "| Section | Headline | Intro | Approve | Edit | Remove |", "|---|---|---|---|---|---|",
    sectionRow(d, "capabilities", "Capabilities"), sectionRow(d, "qlik-services", "Service offerings"), sectionRow(d, "accelerators", "Accelerators"),
    `| Case studies | ${cell(q(d, "#case-studies-h"))} | ${cell(q(d, ".cases-top .head p"))} | | | |`, "",
    "#### Capabilities (7)", "", ...qlik.QLIK_CAPABILITIES.map((c) => `**${c.title}.** ${c.intro}\n${bullets(c.bullets)}\n`),
    "#### Service offerings (4)", "", ...qlik.QLIK_OFFERINGS.map((o, i) => `**${o.title}.** ${qlik.QLIK_JOURNEY[i].description} Outcome: ${qlik.QLIK_JOURNEY[i].outcome}\n${bullets(o.items)}\n`),
  ].join("\n");
};

const industryPage = (slug) => {
  const i = data.INDUSTRIES.find((x) => x.slug === slug);
  const url = `/industries/${slug}/`;
  return [pageHead(url, i.tab), "", "JSON-LD values:", ldSummary(dom[url]), "", `Eyebrow: ${i.eyebrow}. Lede: ${i.cardDesc}`, "",
    `**Industry challenges.** ${i.ch}\n\n**Technology opportunities.** ${i.op}\n\n**Our capabilities.** ${i.ca}\n`].join("\n");
};

// ---------- brand check ----------
const BRANDS = [["Qlik Sense", /qlik sense/gi], ["QlikView", /qlikview/gi], ["Qlik Replicate", /qlik replicate/gi], ["Qlik Cloud", /qlik cloud/gi], ["Qlik (any)", /qlik/gi], ["Talend", /talend/gi], ["Power BI", /power ?bi/gi], ["NPrinting", /nprinting/gi]];
const textOf = (d) => { const c = d.body.cloneNode(true); c.querySelectorAll("script,style,svg").forEach((e) => e.remove()); return clean(c.textContent); };
const counts = BRANDS.map(([b, re]) => `| ${b} | ${Object.keys(dom).map((u) => (textOf(dom[u]).match(re) || []).length).join(" | ")} |`);
const RELATION = /\b(partner|certified|certification|authorized|authorised|official|endorse|approved|accredited|alliance)\b/i;
const relationRows = [];
const seenRel = new Set();
for (const [u, d] of Object.entries(dom)) {
  for (const el of d.querySelectorAll("p,li,h1,h2,h3,h4,h5,span")) {
    if (el.children.length > 3) continue;
    const t = clean(el.textContent);
    if (t.length < 400 && RELATION.test(t) && !seenRel.has(t)) { seenRel.add(t); relationRows.push(`| ${u} | ${cell(t)} | | | |`); }
  }
}
const coe = ["Center of Excellence", "Qlik expert", "Qlik Expert"].map((p) => `| "${p}" | ${Object.keys(dom).map((u) => (textOf(dom[u]).match(new RegExp(p, "g")) || []).length).join(" | ")} |`);

// ---------- claims ----------
const caseRows = published.map((c) => `| Case study | \`${c.id}\` | ${cell(c.title)} | ${cell(c.audience)} | ${cell(`${c.highlight.value} ${c.highlight.label}; ` + c.stats.map((s) => `${s.value} ${s.label}`).join("; "))} | | | |`);
const accRows = accs.accelerators.map((a) => `| Accelerator | \`${a.id}\` | ${cell(a.title)} | Built with ${cell((stack.ACCELERATOR_STACK[a.id] ?? []).map((s) => s.label).join(", "))} | "Home-grown" claim; features and benefits as written | | | |`);

const doc = `# Content review pack for Sri

Prepared 2026-11-16 (Phase 5). **Nothing in the website wording was changed for this pack**, apart from one obvious typo in unpublished data (see section 6). Everything below is read from the live site data and the built HTML, so it matches what visitors and crawlers see. Regenerate with \`npm run build && node scripts/build-content-review.mjs\`.

How to use it: for each row, mark **Approve**, **Edit** (write the new wording in the row) or **Remove**. Items marked [SRI] in the code are covered here. Send the marked-up copy back and the changes can be made in one pass.

## 1. Decisions that matter most

| # | Item | Why it matters |
|---|---|---|
| 1 | **All 20 case studies came from a deck that carries another company's branding.** The data file says: "confirm with Srivatsan before publishing ... Set \`published: false\` on any case Meridanta cannot claim." All 20 are currently published, with named outcomes and numbers (for example "$1M-$2M cost saving"). The 5 accelerators come from the "Qlik competency deck" as well. | Publishing results Meridanta cannot claim is a legal and reputational risk, and these pages are what AI search will quote. Section 6 lists every case with its numbers. |
| 2 | **Partner status and certifications.** No Qlik or Talend partner status or certification is claimed anywhere. The Training offering says "Certification programs" (flagged in code as unconfirmed). | Confirm what Meridanta may say. If a partner status exists, it is a strong trust signal; if not, "Certification programs" should be reworded. |
| 3 | **"Qlik Center of Excellence" naming.** The name appears in the hero, navigation cards, page titles and structured data. | It can read as an official Qlik programme. Confirm Meridanta may use the name, or consider "Meridanta Qlik Center of Excellence" everywhere (it already is in the meta description). |
| 4 | **Company facts still missing**: legal name, phone, founding date (\`src/company.js\`). The email and the registered office are set. | Needed for vendor due diligence and for Organization structured data. Nothing is invented; fields stay blank until you confirm them. |
| 5 | **Contact form delivery (done in Phase 6).** The form now sends through a PHP endpoint and Resend to srivatsans@meridanta.com, and the public "Preview build" note is gone. It needs the one-time setup in \`docs/CONTACT_SETUP.md\` (Resend domain, Turnstile keys, private config file) before it can send. Until then visitors see an error message with an email link, never a fake success. | Confirm the setup is finished and test with a real enquiry. |
| 6 | **Third-party logos in diagrams** (AWS, Microsoft Azure services, Oracle, IBM Db2, Power BI, plus brands from the open-source icon set). | Each owner has brand-usage rules. See section 5. |
| 7 | **Metrics shown as headline numbers** (shown: for example "~40% faster response time" and "Under 5 seconds" replication latency; in the code but not shown: "40 hrs typical Qlik migration"). | Each is a quantified claim a prospect or AI assistant may repeat. Section 6 lists them. |
| 8 | **Social profile links.** None are set, so the footer shows no social icons. | Send the real URLs (LinkedIn, X, Facebook, Instagram, YouTube) and the icons appear; they also feed the structured data. |
| 9 | **Privacy Policy page (DRAFT – Sri to review).** A basic policy now lives at \`/privacy/\` and is linked from the footer and the contact section. | Wording, retention period and the statement about trackers need your confirmation (see "Privacy Policy page" in section 2). |
| 11 | **What We Do copy (DRAFT – Sri to review).** New section tagline and two intro lines, and new tagline, description and six bullets for each of the four pillars. | **Qlik pillar: walkthrough with Nataraj pending (old vs new content).** Old Qlik card: "Expert consultants, solutions, and accelerators across Qlik Replicate, Compose, Catalog, QlikView, Qlik Sense, and Talend." with bullets on architecture consulting and roadmap, proofs of concept and benchmarking, performance and infrastructure recommendations, estimation templates, accelerators (server performance monitors, governance dashboards, meta scanner) and managed platform support. The "Explore" links for the first three pillars are hidden until their pages (/services/consulting-delivery, /services/ai-solutions, /services/data-engineering-analytics) exist. |
| 10 | **Header, hero banners and /contact page (DRAFT – Sri to review).** New header (brand tagline "AI. Data. Cloud. Transforming Business.", Services dropdown, "Let’s Talk" button), three new hero banners, and a /contact page that replaces the home page’s contact section. | Confirm the banner wording, the title and description of /contact/, and the URLs for the three service pages in the Services menu (/services/consulting-delivery, /services/ai-solutions, /services/data-engineering-analytics). They are not built yet, so those three menu items go to the home page’s Services section for now. Also confirm whether the Healthcare banner should go to /industries/healthcare/ or /healthcare. |

## 2. Page by page

${home()}

${qlikPage()}

${industryPage("healthcare")}

${industryPage("communications-media-entertainment")}

### Privacy Policy page (\`/privacy/\`): **DRAFT – Sri to review**

A basic policy, written from how the site works today and linked from the footer and the contact section. It says: Meridanta collects the name, business email, company (optional), area of interest (optional) and message that you choose to send; uses them only to respond to enquiries; does not sell the information or share it for others' marketing; keeps it as long as needed to handle the request and for ordinary business records; uses no advertising or analytics trackers; and that you can ask to see, correct or delete your information by writing to srivatsans@meridanta.com. When the form is in use it names the email delivery service (Resend) and the human check (Cloudflare Turnstile).

| Point for Sri to confirm | Approve | Edit | Remove |
|---|---|---|---|
| Overall wording and tone (this is a basic policy, not legal advice) | | | |
| Retention: "as long as we need it to handle your request and for ordinary business records" (no fixed period is stated) | | | |
| "This website does not use advertising or analytics trackers" | | | |
| Naming Resend and Cloudflare Turnstile when the form is in use | | | |
| "We do not sell your personal information" | | | |
| Contact for privacy requests: srivatsans@meridanta.com and the registered office | | | |
| Any legal wording required for the United States and India (governing law, data-protection rights, a named privacy contact) | | | |

## 3. Suggestions for AI and search discoverability

These are proposals only. Anything in square brackets needs a fact from Sri. Nothing here has been added to the site.

### 3.1 Clear "who / what / for whom / proof" statements

AI systems answer "who is Meridanta and what do they do?" from the first clear sentences they find. The site has the "what" but not the "who", "for whom" or "proof" in one place.

| Page | Suggested statement (needs approval) |
|---|---|
| Home (under the hero or in About) | "Meridanta is a [country/city] AI, data and cloud solutions company. We help [enterprises in healthcare, communications, media and entertainment, and other data-driven industries] in the United States and India turn data into business outcomes, with [n] enterprise case studies delivered across Qlik, Talend and cloud data platforms." |
| Qlik | "Meridanta's Qlik Center of Excellence helps enterprises migrate, replicate, integrate and analyze data with Qlik Replicate, Qlik Sense, QlikView and Talend, on cloud platforms such as Snowflake, Databricks, Azure and AWS. Services: consulting, delivery, managed support and training." |
| Healthcare | "Meridanta builds AI and data solutions for healthcare providers, payers and pharma: [n] projects, including [approved example]." |
| Communications, Media & Entertainment | "Meridanta helps communications, media and entertainment companies optimize networks and personalize engagement with data, AI and cloud: [approved proof point]." |
| About | Add: founding year, headquarters and delivery locations, team size or leadership, the industries and technologies served, and any partner status. All [SRI]. |

### 3.2 Entity-rich phrasing

Entities already present on the site: Qlik, Qlik Sense, QlikView, Qlik Replicate, Qlik Compose, Qlik Catalog, Talend, Snowflake, Databricks, Power BI, Azure Synapse, ADLS, Kafka, SAP, Oracle, SQL Server, PostgreSQL, MySQL, Db2, Prometheus, Grafana, AWS (S3, RDS, Redshift) and Azure Event Hubs.
- Most of them appear only deep inside case-study diagrams and bullets. The **home and Qlik introductions mention none of the cloud platforms**. Naming Snowflake, Databricks, Azure and AWS in the first paragraphs of the Qlik page and in the home "Data Engineering & Analytics" service would help match searches such as "Qlik Replicate to Snowflake" or "Talend migration partner".
- Services use generic terms ("Data modernization & cloud migration"). Add the platforms in the bullets where they are true (for example "Qlik to Qlik Cloud migration", "SQL Server to Azure Synapse replication").

### 3.3 Question-style headings and FAQs

People and AI assistants ask questions. The site has **no FAQs today**. If approved, FAQs would be shown on the page and marked up as FAQPage structured data (the generator is ready; Phase 4 emits it only for visible FAQs). Draft questions, with answers that reuse existing site content:

| Page | Question | Draft answer source |
|---|---|---|
| Home | What does Meridanta do? | About copy |
| Home | Which industries does Meridanta serve? | Healthcare; Communications, Media & Entertainment (the only two published) |
| Home | Where does Meridanta work? | [SRI: confirm "United States and India" wording] |
| Home | How do I start a project with Meridanta? | Contact form: describe your challenge, the team reviews it and replies |
| Qlik | What is the Qlik Center of Excellence at Meridanta? | Overview text |
| Qlik | What is change data capture (CDC) and when should I use it? | Capability: "Captures changes from databases, SAP, mainframe and SaaS as they happen" [Nataraj to confirm the supported source and target list] |
| Qlik | How long does a QlikView to Qlik Cloud migration take? | Case study "QlikView to Qlik Cloud Migration" says "Completed in 2 months"; the unused impact data says "40 hrs typical Qlik migration" [conflict: confirm which is true] |
| Qlik | Can you upgrade an old Qlik server? | Case study: Qlik servers older than 12.xx upgraded in 5 business days |
| Qlik | What are Meridanta's Qlik accelerators? | Accelerators section (5) |
| Qlik | Does Meridanta offer Qlik training? | Training offering [confirm certification programmes] |
| Qlik | Is Meridanta a Qlik or Talend partner? | **Do not publish an answer until partner status is confirmed** |
| Healthcare | How can AI and data help providers, payers and pharma? | Industry challenges, opportunities and capabilities text |
| Communications, Media & Entertainment | How can data and AI help communications and media companies? | Industry text |

Question-style heading ideas (optional): "What We Do" -> "What does Meridanta do?"; "Industries We Serve" -> "Which industries does Meridanta serve?"; "Proven Outcomes" -> "What results has Meridanta delivered with Qlik?".

### 3.4 Content gaps that hurt due diligence and AI answers

- No visible company details (legal name, address, email, phone) or team/leadership information.
- No mention of delivery model, engagement sizes, or locations beyond the structured-data \`areaServed\`.
- Only 2 of the planned industries are published (the code comment lists Insurance, Banking & Financial Services and Enterprise Technology as waiting for approved content).
- Case studies are anonymous ("For complex enterprise customers"); nothing says whether clients have approved being named.
- There is no dedicated page for HCInsights, even though the home page promotes it as a product.

## 4. Wording to check (not changed)

- "Cloud & Modernisation" in the contact form's area-of-interest list uses the British spelling; the rest of the site uses American spelling ("modernization", "Modernization"). The selected value is sent with the inquiry, so change it consistently if you decide to.
- "Home-grown solution" badge on the accelerators card and "independently developed" in the trademark line: confirm Meridanta owns these assets outright.
- "Qlik Analytics and Integration" is used as the title of an image with a long description: check it is not read as a Qlik product name.

## 5. Qlik and third-party branding check

### 5.1 Mentions per page (visible text, including text hidden behind tabs)

| Brand | ${Object.keys(dom).join(" | ")} |
|---|${Object.keys(dom).map(() => "---|").join("")}
${counts.join("\n")}

Related phrases:

| Phrase | ${Object.keys(dom).join(" | ")} |
|---|${Object.keys(dom).map(() => "---|").join("")}
${coe.join("\n")}

### 5.2 Trademark notices today

- **/qlik/**: "${qlik.QLIK_TM}" (small print under the page).
- **Home, Products & Solutions section**: "Qlik, Talend, and Power BI are trademarks of their respective owners. Meridanta accelerators are independently developed and do not imply endorsement."
- **Industry pages and footer**: no trademark notice. The footer is on every page, including pages that show Qlik, Talend and Power BI names.
- Suggestion: one site-wide line in the footer, for example "Qlik, Qlik Sense, QlikView, Qlik Replicate, Talend, Power BI, Snowflake, Databricks, AWS, Microsoft Azure, Oracle, IBM Db2, SAP and Apache Kafka are trademarks of their respective owners. Meridanta is not affiliated with or endorsed by these companies [unless partner status is confirmed]." [SRI]

### 5.3 Logo usage

| Where | What is shown | Source file | Question for Sri |
|---|---|---|---|
| Everywhere (hero, accelerator "Built with" tiles, case-study diagram engine node and tiles) | **The Qlik logo is no longer shown.** It is replaced by the plain word "Qlik" in the site's own font and colours. | The logo files are kept, unused, in \`src/assets/unused/\` | Ask Qlik for written permission before the logo goes back. |
| /qlik/ case-study diagrams and accelerator tiles | Snowflake, Databricks, Kafka, SAP, PostgreSQL, MySQL, Prometheus, Grafana, Talend (from the open-source simple-icons set) | simple-icons 16.36.0 | The icon set is open source, but the brands are still trademarks. |
| /qlik/ case-study diagrams | Official AWS and Microsoft Azure architecture icons, Oracle, IBM Db2, Power BI | \`src/assets/logos/\` (14 files) | Each vendor's brand and icon usage terms should be checked. |
| Home and /qlik/ images | Platform and capability illustrations with brand names in the alt text (Qlik, AWS, Databricks) | \`qlik-platform.webp\` (shows AWS, Databricks, Google, Iceberg, Microsoft and Snowflake marks inside the picture), \`cap-*.webp\`. The contact-page picture \`loc-qlik.webp\` (Qlik mark and text drawn into the image) was removed. | Confirm who created them and that any brand marks inside are cleared. |

### 5.4 Statements that could imply an official partnership, certification or endorsement

Search of all visible text for: partner, certified, certification, authorized, official, endorse, approved, accredited, alliance.

| Page | Text | Approve | Edit | Remove |
|---|---|---|---|---|
${relationRows.join("\n") || "| (none found) | | | | |"}

Also relevant: the name "Qlik Center of Excellence", the button "Talk to a Qlik Expert" (it appears on the floating button on the /qlik pages and in the /qlik hero). No page states a partner level.

## 6. TODOs and unverified claims

Tick one column per row. Items from the code comments are quoted.

### 6.1 Company and site facts

| Type | ID | Item | Detail | Approve | Edit | Remove |
|---|---|---|---|---|---|---|
| Fact | legalName | Registered legal entity name | empty in \`src/company.js\` | | | |
| Fact | email | Public business email | set to srivatsans@meridanta.com (footer, contact section, Organization data, llms.txt) | | | |
| Fact | phone | Public phone | empty | | | |
| Fact | address | Registered Office | set to 262 Chapman Rd, Ste 240, Newark, DE 19702, USA (footer, contact section, Organization data, llms.txt) | | | |
| Fact | foundingDate | Founding date | empty | | | |
| Fact | areaServed | "United States and India" | from the project brief, used in structured data | | | |
| Link | social | LinkedIn, X, Facebook, Instagram, YouTube | all empty in \`src/social.js\`; no icons are shown until real URLs are added | | | |
| Page | privacy | Privacy Policy page \`/privacy/\` | DRAFT – Sri to review (source: \`src/privacyData.js\`) | | | |
| Link | twitterSite | X handle for Twitter cards | empty in \`src/seo.js\` | | | |
| Text | form-note | Public "Preview build" note on the contact form | removed in Phase 6 | | | |
| Product | HCInsights | "A turnkey healthcare insights solution that unifies clinical, operational and financial data"; "5 modules"; "Power BI dashboards" | card links to the Healthcare page; no HCInsights page exists | | | |
| Product | qlik-coe | Qlik / Talend partner status | none claimed; \`qlikData.js\` asks to confirm | | | |
| Offering | training | "Certification programs" in the Training offering | flagged in code as unconfirmed | | | |
| Content | qlik-review | Every Qlik product statement | code note: "Nataraj (Qlik lead) to review every product statement for technical accuracy" | | | |
| Content | talend | Talend frameworks beyond the four named (Context Management Framework, Cryptographic Security Utility, Reusable Plug-and-Play Components, SAP Onboarding Framework) | code note | | | |
| SEO | titles | Page titles and descriptions in \`src/seo.js\` | [SRI] | | | |

### 6.2 Case studies (20 published) with their numbers

| Type | ID | Title | Client descriptor | Headline and key numbers | Approve | Edit | Remove |
|---|---|---|---|---|---|---|---|
${caseRows.join("\n")}

### 6.3 Qlik accelerators (5)

| Type | ID | Title | Tools shown | Claim | Approve | Edit | Remove |
|---|---|---|---|---|---|---|---|
${accRows.join("\n")}

### 6.4 Content in the code that is not shown on the site

These are not published today, but they are in the data files and could be reused. Review them before anyone does.

| Item | Where | Note |
|---|---|---|
| Impact strip: "20 enterprise case studies", "$1M-$2M highest cost saving", "< 5s replication latency", "40 hrs typical Qlik migration" | \`caseImpact\` in \`src/caseStudies.js\` | Marked "TODO: confirm". Not displayed. |
| Healthcare feature list: Enterprise Data Hub, Unified Patient Analytics, Automated Regulatory Reporting ("340B, FPAR, NACHC"), Pharmacy & Medication Insights ("Medi Tracker platform"), Executive Dashboards | \`HC_FEATURES\` in \`src/data.js\` | Specific compliance and platform names; not displayed. |
| Case-study "outcomes" tags (Cost saving, Sales increase, Customer satisfaction) | \`outcomes\` field | No longer displayed. Cases tagged "Customer satisfaction" show no supporting evidence in their text. |
| Highlights list | \`HIGHLIGHTS\` in \`src/data.js\` | Not displayed. |
| 1 unpublished case study | \`published: false\` | Not displayed. |

### 6.5 Typos

- Fixed: "ADLF Integration" in the unused \`QLIK_ACCELERATORS\` list in \`src/data.js\` is now "ADLS Integration" (it is not shown on the site).
- No other obvious typos, doubled words or stray punctuation were found in the visible text of the four pages.
`;

writeFileSync("docs/CONTENT_REVIEW.md", doc);
console.log(`Wrote docs/CONTENT_REVIEW.md (${doc.split("\n").length} lines, ${relationRows.length} relationship statements, ${caseRows.length} cases, ${accRows.length} accelerators)`);
