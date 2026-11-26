// All website copy lives here so it can be edited without touching layout code.

/**
 * Main menu: Home, Services (dropdown), Industries, Solutions, About. "Solutions" and "About" are short labels set at Sri's request
 * (design doc v3.0 had "Products & Solutions" and "About Us"). Industries, Solutions and About scroll to /#industries, /#solutions and /#about.
 * The footer "Explore" list uses the same items.
 */
export const NAV = [
  { id: "home", label: "Home" },
  { id: "services", label: "Services" },
  { id: "industries", label: "Industries" },
  { id: "solutions", label: "Solutions" },
  { id: "about", label: "About" },
];
export const HEADER_NAV = NAV;

export const HIGHLIGHTS = [
  { icon: "bi", title: "Qlik", suffix: "Center of Excellence", href: "/qlik/", desc: "Deliver greater value with our Qlik-focused expertise across a complete portfolio of modern Data Integration, Data Fabric, Agentic Architecture, AI and Analytics platform" },
  { icon: "ai", title: "AI", tag: "AI-Driven Solutions & Services", desc: "Build intelligent business solutions using AI, machine learning, automation and advanced AI-powered technologies." },
  { icon: "health", title: "Healthcare", tag: "Healthcare Solutions", desc: "Enable healthcare organizations with intelligent digital solutions, data analytics and technology-driven operational improvements." },
];

// Home hero slider (DRAFT – Sri to review the wording, see docs/CONTENT_REVIEW.md). One headline, one tagline, one short
// description and one call to action per banner. Give a banner `to` for a route, or `section` for a home-page section id.
export const HERO_SLIDES = [
  { key: "ai", title: "Turning Data into Intelligence. Intelligence into Impact.", tagline: "AI | Data Engineering | Analytics | Cloud", section: "services", cta: "Explore Our Services",
    alt: "AI chip connected to machine learning, generative AI, NLP, agentic AI, intelligent automation and predictive insights",
    desc: "We help enterprises modernize data ecosystems, harness AI and build intelligent solutions that drive measurable business outcomes." },
  { key: "healthcare", title: "Enabling Smarter, More Connected Healthcare.", tagline: "Healthcare Data | Analytics | AI-driven Insights", to: "/industries/healthcare/", cta: "Explore Healthcare Solutions",
    alt: "Heart with medical cross connected to patient 360, pharmacy insights, clinical analytics, remote monitoring, dashboards and compliance",
    desc: "Unifying complex healthcare data to support better insights, operational efficiency, informed decisions and improved care delivery." },
  { key: "qlik", logo: true, title: "Accelerating Enterprise Analytics with Qlik.", tagline: "Qlik Consulting | Implementation | Center of Excellence", to: "/qlik/", cta: "Explore Qlik Capabilities",
    alt: "Qlik data, analytics and AI platform connecting data integration, quality, governance, dashboards, reporting and automation",
    desc: "Specialized professional services, data integration expertise and reusable accelerators that help enterprises maximize their Qlik investments." },
];

export const BRAND_TAGLINE = "AI. Data. Cloud. Transforming Business.";

/** "What We Do" intro (DRAFT – Sri to review): an h2 tagline and two lines. */
export const SERVICES_INTRO = {
  eyebrow: "What We Do",
  tagline: "Technology Expertise. Practical Execution. Measurable Outcomes.",
  lines: [
    "We combine business understanding, deep technology expertise and disciplined delivery to help enterprises modernize their data ecosystems, apply AI and build scalable digital solutions.",
    "From strategic consulting and architecture to implementation and managed services, we turn complex technology initiatives into measurable business outcomes.",
  ],
};

/**
 * The four pillars (DRAFT – Sri to review). `href` is the page the "Explore" link opens (the service pages are in src/services.js).
 */
export const SERVICES = [
  { icon: "compass", n: "01", title: "Consulting & Delivery", tagline: "From Strategy to Successful Execution", href: "/services/consulting-delivery/",
    short: "We help organizations translate business priorities into practical technology strategies, architectures and successfully delivered solutions.",
    desc: "We help organizations translate business priorities into practical technology strategies, architectures and successfully delivered solutions.",
    items: ["Technology strategy, assessment & roadmap", "Enterprise and solution architecture", "Platform evaluation and technology selection", "Proof of concepts and solution validation", "End-to-end implementation and project delivery", "Managed services, platform support and optimization"] },
  { icon: "spark", n: "02", title: "AI Solutions & Services", tagline: "Applying AI to Real Business Challenges", href: "/services/ai-solutions/",
    short: "We design and implement intelligent solutions that combine enterprise data, AI technologies and automation to improve business processes and decision-making.",
    desc: "We design and implement intelligent solutions that combine enterprise data, AI technologies and automation to improve business processes and decision-making.",
    items: ["AI strategy, readiness assessment & roadmap", "Generative AI and agentic AI solutions", "Machine learning, deep learning and predictive analytics", "Natural language processing (NLP)", "Intelligent automation and AI integration", "Custom AI solutions, prototyping and development"] },
  { icon: "db", n: "03", title: "Data Engineering & Analytics", tagline: "Building the Foundation for Intelligent Decisions", href: "/services/data-engineering-analytics/",
    short: "We engineer modern, secure and scalable data ecosystems that connect enterprise information, enable trusted insights and power advanced analytics.",
    desc: "We engineer modern, secure and scalable data ecosystems that connect enterprise information, enable trusted insights and power advanced analytics.",
    items: ["Data strategy, architecture & modernization", "Data engineering and cloud data migration", "Data integration, data fabric and ETL/ELT", "Data governance, master data management (MDM) & quality", "Data security, privacy and regulatory alignment", "Business intelligence, reporting and advanced analytics"] },
  { icon: "chart", n: "04", title: "Qlik Center of Excellence", tagline: "Maximizing the Value of Your Qlik Ecosystem", href: "/qlik/",
    short: "We provide specialized Qlik and Talend professional services, helping enterprises design, implement, optimize and manage their data integration and analytics platforms.",
    desc: "We provide specialized Qlik and Talend professional services, helping enterprises design, implement, optimize and manage their data integration and analytics platforms.",
    items: ["Qlik architecture, consulting & implementation", "Qlik Replicate, Compose and Talend data integration", "Qlik Sense, QlikView and analytics modernization", "Performance optimization and platform engineering", "Custom accelerators, reusable frameworks and automation", "Managed platform support and Center of Excellence services"] },
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
export const QLIK_ACCELERATORS = ["Prometheus Integration", "NPrinting Task Trigger", "PDF Dashboard Export", "Log Scraping", "ADLS Integration"];
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

/** Short keys used in links (/?interest=qlik#contact) mapped to the options of INTERESTS below. */
export const INTEREST_KEYS = {
  ai: "AI Solutions & Services",
  data: "Data Engineering & Analytics",
  qlik: "Qlik Solutions & Accelerators",
  healthcare: "Healthcare Insights",
  cloud: "Cloud & Modernisation",
  consulting: "Consulting & Delivery",
  "data-engineering": "Data Engineering & Analytics",
};
export const INTERESTS = ["AI Solutions & Services", "Data Engineering & Analytics", "Qlik Solutions & Accelerators", "Healthcare Insights", "Cloud & Modernisation", "Consulting & Delivery", "Other"];
