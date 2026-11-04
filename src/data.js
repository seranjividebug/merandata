// All website copy lives here so it can be edited without touching layout code.

export const NAV = [
  { id: "home", label: "Home" },
  { id: "services", label: "Services" },
  { id: "industries", label: "Industries" },
  { id: "solutions", label: "Products & Solutions" },
  { id: "about", label: "About Us" },
];

export const HIGHLIGHTS = [
  { icon: "bi", title: "Qlik", suffix: "Center of Excellence", href: "/qlik", desc: "Deliver greater value with our Qlik-focused expertise across a complete portfolio of modern Data Integration, Data Fabric, Agentic Architecture, AI and Analytics platform" },
  { icon: "ai", title: "AI", tag: "AI-Driven Solutions & Services", desc: "Build intelligent business solutions using AI, machine learning, automation and advanced AI-powered technologies." },
  { icon: "health", title: "Healthcare", tag: "Healthcare Solutions", desc: "Enable healthcare organizations with intelligent digital solutions, data analytics and technology-driven operational improvements." },
];

// Home hero slider. Give a slide `to` for a route, or `section` for a home-page section id; change them here later.
export const HERO_SLIDES = [
  { key: "qlik", title: "Qlik Center of Excellence", titleLines: ["Qlik", "Center of Excellence"], logo: true, to: "/qlik", alt: "Qlik data, analytics and AI platform connecting data integration, quality, governance, dashboards, reporting and automation",
    desc: "Deliver greater value with our Qlik-focused expertise across a complete portfolio of modern Data Integration, Data Fabric, Agentic Architecture, AI and Analytics." },
  { key: "ai", eyebrow: "AI-DRIVEN SOLUTIONS & SERVICES", title: "AI-Driven Solutions & Services", section: "services", alt: "AI chip connected to machine learning, generative AI, NLP, agentic AI, intelligent automation and predictive insights",
    desc: "Build intelligent business solutions using AI, machine learning, automation and advanced AI-powered technologies." },
  { key: "healthcare", eyebrow: "HEALTHCARE SOLUTIONS", title: "Healthcare Solutions", section: "industries", alt: "Heart with medical cross connected to patient 360, pharmacy insights, clinical analytics, remote monitoring, dashboards and compliance",
    desc: "Enable healthcare organizations with intelligent digital solutions, data analytics and technology-driven operational improvements." },
];

export const SERVICES = [
  { icon: "compass", title: "Consulting & Delivery", short: "From strategy to end-to-end implementation, with outcome-based delivery.", desc: "Outcome-based, data-driven, and AI-first consulting that takes solutions from strategy through end-to-end implementation.",
    items: ["Technology consulting: strategy & roadmap", "Solution architecture", "Business adoption, use cases & ROI", "Technology evaluation, maturity assessment & selection", "Outcome-based project delivery", "Managed services, platform support & intelligent automation"] },
  { icon: "spark", title: "AI Solutions & Services", short: "AI-enabled solutions and intelligent automation for real business challenges.", desc: "AI-enabled business solutions and intelligent automation, applied to real-world business challenges.",
    items: ["AI strategy & roadmap", "Technology evaluation, maturity assessment & selection", "Business adoption & ROI", "Data science, NLP, ML & deep learning", "Agentic & generative AI", "AI Custom Solutions Lab"] },
  { icon: "db", title: "Data Engineering & Analytics", short: "Modern data foundations that power better decisions.", desc: "Building data foundations and enabling data-driven solutions that support better decisions.",
    items: ["Data strategy & roadmap", "Technology evaluation, maturity assessment & selection", "Data modernization & cloud migration", "Data fabric, integration, governance, MDM & quality", "Data security & data privacy", "Advanced analytics & business intelligence"] },
  { icon: "chart", title: "Qlik Center of Excellence", short: "Expert consultants and accelerators across the Qlik and Talend portfolio.", href: "/qlik", desc: "Expert consultants, solutions, and accelerators across Qlik Replicate, Compose, Catalog, QlikView, Qlik Sense, and Talend.",
    items: ["Architecture consulting & roadmap", "Proofs of concept & benchmarking", "Performance improvement & infrastructure recommendations", "Estimation techniques & templates", "Accelerators: server performance monitors, governance dashboards & meta scanner", "Outcome-based managed platform support"] },
];

// Add Insurance, Banking & Financial Services and Enterprise Technology here when content is approved.
export const INDUSTRIES = [
  { key: "health", slug: "healthcare", tab: "Healthcare", eyebrow: "HEALTHCARE", cardTitle: "Enabling Better Healthcare Outcomes",
    cardDesc: "AI and data solutions that help providers, payers and pharma improve affordability, patient outcomes and operational efficiency.",
    miniDesc: "AI and data solutions for providers, payers and pharma.",
    points: [["Challenges", "Rising costs, regulatory pressure and complex clinical data."], ["Opportunities", "Connected devices, remote monitoring and integrated patient insights."], ["Our capabilities", "Clinical data analysis, healthcare dashboards and pharma analytics."]], tagline: "Enabling Better Healthcare Outcomes Through AI and Data",
    ch: "Healthcare organizations face increasing pressure to improve affordability, enhance patient outcomes, meet evolving regulatory requirements, and demonstrate measurable value to patients, providers, and payers. Complex clinical data, rising research and development costs, and the need for more efficient care delivery create opportunities for technology-led transformation.",
    op: "AI and data-driven innovations are helping healthcare organizations turn these challenges into opportunities. Connected medical devices, remote health monitoring, integrated patient and provider insights, intelligent data platforms, personalized patient engagement, and advanced healthcare analytics enable more informed decisions and more effective care delivery.",
    ca: "Meridanta brings a holistic approach to healthcare technology, combining consulting expertise with implementation across data management, clinical data analysis, healthcare dashboards, provider efficiency, healthcare marketing analytics, and pharmaceutical data analytics. We help organizations translate complex data into actionable insights and support better business and healthcare decisions." },
  { key: "cme", slug: "communications-media-entertainment", tab: "Communications, Media & Entertainment", eyebrow: "COMMUNICATIONS, MEDIA & ENTERTAINMENT", cardTitle: "Connecting People, Powering Experiences",
    cardDesc: "Data, AI and cloud solutions that optimize networks, personalize engagement and unlock new revenue streams.",
    miniDesc: "Data, AI and cloud solutions for networks, engagement and revenue.",
    points: [["Challenges", "Shifting viewer habits, rising delivery costs and digital-first competition."], ["Opportunities", "Real-time data, cloud-native platforms and advertising analytics."], ["Our capabilities", "Streaming, network and viewership analytics, NPS and data monetization."]], tagline: "Connecting People, Powering Experiences, Enabling Growth.",
    ch: "Communications, media, and entertainment companies face rapidly evolving customer expectations, rising network and content delivery costs, and intensifying competition from digital-first businesses. Subscription fatigue, changing consumption patterns, and fragmented advertising markets challenge traditional revenue models, while infrastructure, service quality, and personalized experiences must keep improving.",
    op: "AI, data analytics, cloud-native platforms, and software-defined networking create new ways to transform service delivery, optimize network performance, and unlock new revenue streams. Real-time data intelligence, connected homes, emerging wireless technologies, advertising analytics, and unified customer insights help personalize engagement and monetize content and data more effectively.",
    ca: "Meridanta supports data management, service delivery optimization, real-time streaming analytics, network and marketing analytics, cost optimization, predictive customer-contact analytics, advertising-led data monetization, omnichannel sales, NPS, customer and employee experience, and viewership analytics, delivered with Agile and CI/CD practices that accelerate time to market." },
];

export const HC_FEATURES = [
  ["Enterprise Data Hub", "Clinical, pharmacy, dental, HR, and finance data integrated into a single trusted platform."],
  ["Unified Patient Analytics", "A complete patient view across systems for better care and operational decisions."],
  ["Automated Regulatory Reporting", "Streamlined 340B, FPAR, NACHC, and public health data submissions."],
  ["Pharmacy & Medication Insights", "Consolidated visibility across siloed pharmacy locations and the Medi Tracker platform."],
  ["Executive Dashboards", "Self-service Power BI analytics for leadership."],
];
export const QLIK_ACCELERATORS = ["Prometheus Integration", "NPrinting Task Trigger", "PDF Dashboard Export", "Log Scraping", "ADLF Integration"];
export const QLIK_BENEFITS = [
  ["Reusable analytics components", "Proven building blocks for integration, scheduling, exports, and monitoring."],
  ["Faster development", "Prebuilt components shorten the path from requirement to working app."],
  ["Standardized patterns", "Consistent implementations that are easier to support and scale."],
  ["Consistent delivery", "The same quality bar across every analytics engagement."],
];
export const TALEND = ["Context Management Framework", "Cryptographic Security Utility", "Reusable Plug-and-Play Components", "SAP Onboarding Framework"];
export const PLATFORM = ["Data modernization & cloud migration", "Data integration & fabric", "Governance, MDM & data quality", "Analytics & BI platforms", "Managed platform support"];

export const PILLARS = [
  ["people", "Business understanding", "We start from the decision or process you want to improve."],
  ["gear", "Engineering expertise", "Hands-on depth across data, analytics, AI, and cloud platforms."],
  ["target", "Outcome-oriented execution", "Delivery measured by results, not by recommendations alone."],
];

export const INTERESTS = ["AI Solutions & Services", "Data Engineering & Analytics", "Qlik Solutions & Accelerators", "Healthcare Insights", "Cloud & Modernisation", "Consulting & Delivery", "Other"];
