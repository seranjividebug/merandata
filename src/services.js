// Service detail pages (/services/<slug>/), all rendered by one template (src/pages/ServicePage.jsx).
// To add a page, or to add Sri's later sections, edit the entries below: nothing else needs touching. The menu, the
// routes, the sitemap, llms.txt and the JSON-LD are all built from SERVICE_PAGES.
//
// DRAFT – Sri to review all wording (see docs/CONTENT_REVIEW.md).
//  - data-engineering-analytics: Sri's content (hero and section 2). More sections will be added to `sections`.
//  - consulting-delivery and ai-solutions: built from the "What We Do" card text until Sri's full content arrives.
//    They are `noindex` (and left out of the sitemap and llms.txt) until `noindex` is removed.
import { SERVICES } from "./data";

/** Icons for capability cards that do not name their own (keys of the icon set in components/Icons.jsx). */
const ICON_CYCLE = ["compass", "gear", "target", "capability", "automation", "report"];

/** Illustration for each capability card (keys of the scenes in components/railArt.jsx), by service interest. */
const ART = {
  consulting: ["roadmap", "architecture", "platform", "poc", "delivery", "support"],
  ai: ["roadmap", "aichip", "neural", "nlp", "automation", "poc"],
};

const card = (n, icon, title, desc, bullets, art) => ({ n, icon, title, desc, bullets, art });

const DATA_ENGINEERING = {
  slug: "data-engineering-analytics",
  title: "Data Engineering & Analytics",
  interest: "data-engineering",
  icon: "db",
  // Hero background (src/assets/hero/hero-data.*, made by scripts/make-responsive-images.py).
  heroImage: { compact: true, base: "hero/hero-data", widths: [1024], full: 2033, height: 774, alt: "A glowing database stack surrounded by icons for analytics, security, integration, automation and AI above a flowing wave of data points" },
  seo: {
    title: "Enterprise Data Engineering & Analytics Services | Meridanta",
    description: "Meridanta builds modern, secure and scalable data platforms: data strategy, engineering, integration, governance, business intelligence and analytics.",
  },
  hero: {
    eyebrow: "Data Engineering & Analytics",
    h1: "Engineering Data. Enabling Intelligence. Driving Outcomes.",
    support: "Modern Data Platforms | Data Engineering | Integration | Governance | Business Intelligence & Analytics",
    paragraphs: [
      "Meridanta helps enterprises build modern, secure and scalable data ecosystems that connect information across business systems, improve data quality and accessibility, and enable trusted, insight-driven decisions.",
      "From data strategy and architecture to engineering, integration, governance and advanced analytics, we help organizations turn fragmented data environments into reliable foundations for business intelligence and AI.",
    ],
    cta: "Discuss Your Data Initiatives",
  },
  // More sections from Sri are added here later; each renders in order after the hero.
  sections: [
    {
      id: "capabilities",
      title: "Core Data Engineering & Analytics Capabilities",
      cards: [
        card("01", "compass", "Data Strategy & Architecture",
          "Establishing the right data foundation through practical strategies and architectures aligned with business objectives, technology environments and future growth.",
          ["Enterprise data strategy and roadmap", "Data architecture and platform assessment", "Modern data platform design", "Cloud and hybrid data architecture", "Data warehouse and data lake architecture"], "architecture"),
        card("02", "lakehouse", "Data Engineering & Platform Modernization",
          "Building scalable and reliable data platforms that enable organizations to manage growing data volumes, improve performance and support evolving business needs.",
          ["Modern data engineering and pipeline development", "Data warehouse and data lake modernization", "Lakehouse architecture and implementation", "Cloud data platform migration and modernization", "Data processing and workflow orchestration"], "pipeline"),
        card("03", "etl", "Data Integration & Management",
          "Connecting data across enterprise applications and systems to create consistent, accessible and trusted information across the organization.",
          ["Enterprise data integration and ETL/ELT", "Application, database and API integration", "Real-time and near-real-time data pipelines", "Data replication and change data capture (CDC)", "Master data management and data consolidation"], "integration"),
        card("04", "quality", "Data Governance, Quality & Security",
          "Improving confidence in enterprise data through governance frameworks, quality controls, security practices and responsible data management.",
          ["Data governance frameworks and implementation", "Data quality assessment, monitoring and remediation", "Metadata management and data cataloging", "Data lineage and lifecycle management", "Data access controls, privacy and regulatory alignment"], "governance"),
        card("05", "dashboard", "Business Intelligence & Advanced Analytics",
          "Transforming enterprise data into actionable insights through intuitive reporting, analytics platforms and advanced analytical capabilities.",
          ["Business intelligence strategy and implementation", "Interactive dashboards and enterprise reporting", "Self-service analytics and data visualization", "Advanced and predictive analytics", "KPI frameworks and performance measurement"], "analytics"),
        card("06", "automation", "Data Platform Operations & Optimization",
          "Helping organizations maintain, optimize and continuously improve their data platforms to ensure reliability, performance and operational efficiency.",
          ["Data platform administration and support", "Pipeline monitoring and performance optimization", "Platform reliability and operational management", "Cost and resource optimization", "Ongoing enhancements and managed services"], "support"),
      ],
    },
  ],
  cta: { title: "Let’s Talk About Your Data Initiatives.", text: "Tell us what you want to achieve with your data. A Meridanta expert will help you find the right next step.", button: "Talk to Our Team" },
};

/** A draft page built from a "What We Do" card: tagline as the h1, description, the six bullets as capability items. */
function fromCard(slug, interest, seo) {
  const s = SERVICES.find((x) => x.title === seo.name);
  return {
    slug,
    title: s.title,
    interest,
    icon: s.icon,
    noindex: true, // DRAFT – full content pending from Sri; remove this line once approved
    seo: { title: seo.title, description: seo.description },
    hero: { eyebrow: `${s.n} · ${s.title}`, h1: s.tagline, paragraphs: [s.desc], cta: "Talk to Our Team" },
    sections: [{ id: "capabilities", title: "Key capabilities", cards: s.items.map((t, i) => card(String(i + 1).padStart(2, "0"), ICON_CYCLE[i % ICON_CYCLE.length], t, "", [], ART[interest]?.[i])) }],
    cta: { title: `Let’s Talk About ${s.title}.`, text: "Tell us what you want to achieve. A Meridanta expert will help you find the right next step.", button: "Talk to Our Team" },
  };
}

export const SERVICE_PAGES = [
  {
    ...fromCard("consulting-delivery", "consulting", {
      name: "Consulting & Delivery",
      title: "Technology Consulting & Delivery Services | Meridanta",
      description: "Meridanta turns business priorities into technology strategies, architectures and delivered solutions, from roadmap and selection to implementation and support.",
    }),
    // Hero background (src/assets/hero/hero-consulting.*, made by scripts/make-responsive-images.py).
    heroImage: { base: "hero/hero-consulting", widths: [1024], full: 2172, height: 724, alt: "A laptop with a project plan and a ring of six steps around a growth chart: Strategy & Advisory, Solution Design, Implementation & Delivery, Testing & Quality, Operations & Support, Roadmap & Execution" },
  },
  fromCard("ai-solutions", "ai", {
    name: "AI Solutions & Services",
    title: "AI Solutions & Services for Enterprises | Meridanta",
    description: "Meridanta designs and implements AI solutions that combine enterprise data, generative and agentic AI, machine learning and automation to improve decisions.",
  }),
  DATA_ENGINEERING,
];

export const servicePath = (p) => `/services/${p.slug}/`;
export const servicePageBySlug = (slug) => SERVICE_PAGES.find((p) => p.slug === slug) ?? null;
/** The contact-link key for a /services/<slug> pathname (null elsewhere). */
export const interestForServicePath = (pathname) => {
  const m = /^\/services\/([^/]+)/.exec(pathname);
  return (m && servicePageBySlug(m[1])?.interest) || null;
};

/** Header "Services" dropdown: the three service pages, then the Qlik Center of Excellence. */
export const SERVICE_MENU = [
  ...["consulting-delivery", "ai-solutions", "data-engineering-analytics"].map((slug) => ({ label: servicePageBySlug(slug).title, to: servicePath(servicePageBySlug(slug)) })),
  { label: "Qlik Center of Excellence", to: "/qlik/" },
];
