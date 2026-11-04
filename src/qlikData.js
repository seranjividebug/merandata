// Copy and structure for the /qlik pages. Add a capability card by adding one object to QLIK_CAPABILITIES
// (and a matching image in src/assets/capabilities). All text is original Meridanta copy.
//
// TODO(content) list, so nothing unverified ships by accident:
//  1. Nataraj (Qlik lead) to review every product statement below for technical accuracy.
//  2. Confirm whether Meridanta may state a Qlik / Talend partner status or certifications. None are claimed here.
//  3. Add real client examples or case studies per capability (none are invented here).
//  4. Confirm the supported source/target list to quote in the CDC FAQ.
//  5. Confirm which certification programs the Training offering covers.
//  6. Confirm a dedicated email/phone for "Talk to a Qlik Expert" (it currently goes to the home contact form).
//  7. Confirm the Talend reusable frameworks to describe beyond the four already named on the home page.
//  8. Approve the page titles and meta descriptions.

export const QLIK_TM = "Qlik, Qlik Sense, QlikView, Qlik Replicate and Talend are trademarks of their respective owners.";

export const QLIK_OVERVIEW = {
  title: "Qlik Center of Excellence | Meridanta",
  description: "Meridanta's Qlik Center of Excellence: data integration, analytics and AI on Qlik, from consulting and delivery to managed support and training.",
  eyebrow: "Qlik Center of Excellence",
  h1: "Qlik: Data Integration, Analytics and AI Platform",
  intro: "Qlik brings data integration, data quality, analytics and automation together. Meridanta's Qlik Center of Excellence helps you choose, design, deliver and support the right solution, so your data becomes insight people can act on.",
};

export const QLIK_OFFERINGS = [
  { icon: "compass", title: "Consulting",
    items: ["Proofs of concept", "Benchmarking using beta testing", "Qlik Replicate, Compose, Catalog, QlikView and Qlik Sense product guidance", "Architecture solutions for data integration", "Packaged solutions with QlikView and Qlik Sense", "Point solutions and accelerators (server performance monitors, governance dashboards, meta scanner)"] },
  { icon: "gear", title: "Delivery & Execution",
    items: ["Architecture review and development", "Delivery methodology and approach", "Estimation techniques and templates", "Maintenance and support methodology", "Standards, best practices and guidelines", "Migration best practices and approaches"] },
  { icon: "people", title: "Managed Support",
    items: ["Architecture review and development", "Performance improvement", "Physical design and infrastructure recommendations", "Migration best practices", "Portfolio analysis", "Technology rationalization"] },
  { icon: "target", title: "Training",
    items: ["Project-based customized Qlik Replicate, Compose and QlikView training", "QlikView and Qlik Sense best practices and standards", "Certification programs", // TODO(content): confirm which certification programs
      "Knowledge sharing sessions"] },
];

// One scroll-stacking card per capability on /qlik. `image` is the file name in src/assets/capabilities.
export const QLIK_CAPABILITIES = [
  {
    slug: "data-replication", image: "cap-data-replication", eyebrow: "DATA INTEGRATION", title: "Data Replication (CDC)",
    intro: "Real-time data movement with change data capture.",
    alt: "Diagram of change data capture streaming updates from source databases to cloud targets",
    bullets: [
      "Captures changes from databases, SAP, mainframe and SaaS as they happen.",
      "Delivers to warehouses, lakes and cloud with minimal impact on source systems.",
      "Keeps every target continuously in sync for analytics and AI.",
    ],
  },
  {
    slug: "talend-etl", image: "cap-talend-etl", eyebrow: "DATA INTEGRATION", title: "Talend ETL",
    intro: "Reliable pipelines that turn raw data into ready data.",
    alt: "Talend ETL pipeline moving raw data through transformation into ready data",
    bullets: [
      "Designs robust extract, transform and load workflows with Talend.",
      "Reusable Meridanta frameworks speed up development.",
      "Built-in monitoring and error handling for production workloads.",
    ],
  },
  {
    slug: "data-quality", image: "cap-data-quality", eyebrow: "DATA INTEGRATION", title: "Data Quality & Governance",
    intro: "Data the business can trust.",
    alt: "Data quality and governance view showing profiling, lineage and rules",
    bullets: [
      "Profiles, cleanses and standardizes data at the source.",
      "Catalogs data assets and tracks lineage end to end.",
      "Applies governance rules for security and compliance.",
    ],
  },
  {
    slug: "open-lakehouse", image: "cap-open-lakehouse", eyebrow: "DATA INTEGRATION", title: "Open Lakehouse",
    intro: "Open, scalable storage for analytics and AI.",
    alt: "Open lakehouse architecture on open table formats with separate storage and compute",
    bullets: [
      "Built on open table formats such as Apache Iceberg.",
      "Scales storage and compute independently.",
      "Avoids vendor lock-in while keeping costs low.",
    ],
  },
  {
    slug: "visualization", image: "cap-visualization", eyebrow: "ANALYTICS", title: "Visualization & Dashboards",
    intro: "Explore data freely and see the full picture.",
    alt: "Interactive Qlik Sense dashboard with linked charts and filters",
    bullets: [
      "Interactive, self-service Qlik Sense dashboards.",
      "Associative exploration reveals insights that queries miss.",
      "Works seamlessly across desktop and mobile.",
    ],
  },
  {
    slug: "enterprise-reporting", image: "cap-enterprise-reporting", eyebrow: "ANALYTICS", title: "Enterprise Reporting",
    intro: "The right report, to the right people, on time.",
    alt: "Formatted enterprise report built on Qlik data, ready for scheduled distribution",
    bullets: [
      "Pixel-perfect, formatted reports built on Qlik data.",
      "Scheduled and distributed automatically by email.",
      "Consistent, governed numbers for every stakeholder.",
    ],
  },
  {
    slug: "automation", image: "cap-automation", eyebrow: "ANALYTICS", title: "Automation",
    intro: "Turn insights into action, automatically.",
    alt: "Automation workflow triggering alerts and business app actions from data events",
    bullets: [
      "Triggers workflows and alerts from data events.",
      "Connects Qlik with business apps without custom code.",
      "Frees teams from repetitive manual work.",
    ],
  },
];
