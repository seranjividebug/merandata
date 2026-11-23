# Content review pack for Sri

Prepared 2026-11-16 (Phase 5). **Nothing in the website wording was changed for this pack**, apart from one obvious typo in unpublished data (see section 6). Everything below is read from the live site data and the built HTML, so it matches what visitors and crawlers see. Regenerate with `npm run build && node scripts/build-content-review.mjs`.

How to use it: for each row, mark **Approve**, **Edit** (write the new wording in the row) or **Remove**. Items marked [SRI] in the code are covered here. Send the marked-up copy back and the changes can be made in one pass.

## 1. Decisions that matter most

| # | Item | Why it matters |
|---|---|---|
| 1 | **All 20 case studies came from a deck that carries another company's branding.** The data file says: "confirm with Srivatsan before publishing ... Set `published: false` on any case Meridanta cannot claim." All 20 are currently published, with named outcomes and numbers (for example "$1M-$2M cost saving"). The 5 accelerators come from the "Qlik competency deck" as well. | Publishing results Meridanta cannot claim is a legal and reputational risk, and these pages are what AI search will quote. Section 6 lists every case with its numbers. |
| 2 | **Partner status and certifications.** No Qlik or Talend partner status or certification is claimed anywhere. The Training offering says "Certification programs" (flagged in code as unconfirmed). | Confirm what Meridanta may say. If a partner status exists, it is a strong trust signal; if not, "Certification programs" should be reworded. |
| 3 | **"Qlik Center of Excellence" naming.** The name appears in the hero, navigation cards, page titles and structured data. | It can read as an official Qlik programme. Confirm Meridanta may use the name, or consider "Meridanta Qlik Center of Excellence" everywhere (it already is in the meta description). |
| 4 | **Company facts still missing**: legal name, phone, founding date (`src/company.js`). The email and the registered office are set. | Needed for vendor due diligence and for Organization structured data. Nothing is invented; fields stay blank until you confirm them. |
| 5 | **Contact form delivery (done in Phase 6).** The form now sends through a PHP endpoint and Resend to srivatsans@meridanta.com, and the public "Preview build" note is gone. It needs the one-time setup in `docs/CONTACT_SETUP.md` (Resend domain, Turnstile keys, private config file) before it can send. Until then visitors see an error message with an email link, never a fake success. | Confirm the setup is finished and test with a real enquiry. |
| 6 | **Third-party logos in diagrams** (AWS, Microsoft Azure services, Oracle, IBM Db2, Power BI, plus brands from the open-source icon set). | Each owner has brand-usage rules. See section 5. |
| 7 | **Metrics shown as headline numbers** (shown: for example "~40% faster response time" and "Under 5 seconds" replication latency; in the code but not shown: "40 hrs typical Qlik migration"). | Each is a quantified claim a prospect or AI assistant may repeat. Section 6 lists them. |
| 8 | **Social profile links.** None are set, so the footer shows no social icons. | Send the real URLs (LinkedIn, X, Facebook, Instagram, YouTube) and the icons appear; they also feed the structured data. |
| 9 | **Privacy Policy page (DRAFT – Sri to review).** A basic policy now lives at `/privacy/` and is linked from the footer and the contact section. | Wording, retention period and the statement about trackers need your confirmation (see "Privacy Policy page" in section 2). |
| 11 | **What We Do copy (DRAFT – Sri to review).** New section tagline and two intro lines, and new tagline, description and six bullets for each of the four pillars. | **Qlik pillar: walkthrough with Nataraj pending (old vs new content).** Old Qlik card: "Expert consultants, solutions, and accelerators across Qlik Replicate, Compose, Catalog, QlikView, Qlik Sense, and Talend." with bullets on architecture consulting and roadmap, proofs of concept and benchmarking, performance and infrastructure recommendations, estimation templates, accelerators (server performance monitors, governance dashboards, meta scanner) and managed platform support. The "Explore" links for the first three pillars are hidden until their pages (/services/consulting-delivery, /services/ai-solutions, /services/data-engineering-analytics) exist. |
| 10 | **Header, hero banners and /contact page (DRAFT – Sri to review).** New header (brand tagline "AI. Data. Cloud. Transforming Business.", Services dropdown, "Let’s Talk" button), three new hero banners, and a /contact page that replaces the home page’s contact section. | Confirm the banner wording, the title and description of /contact/, and the URLs for the three service pages in the Services menu (/services/consulting-delivery, /services/ai-solutions, /services/data-engineering-analytics). They are not built yet, so those three menu items go to the home page’s Services section for now. Also confirm whether the Healthcare banner should go to /industries/healthcare/ or /healthcare. |

## 2. Page by page

### Home (`/`)

| Item | Current value | Approve | Edit | Remove |
|---|---|---|---|---|
| Meta title (53 chars) | Meridanta \| Outcome-driven AI, Data & Cloud Solutions | | | |
| Meta description (152 chars) | Meridanta helps organizations solve business problems with AI, data and analytics, cloud and Qlik expertise, using an AI-first, outcome-driven approach. | | | |
| H1 | Turning Data into Intelligence. Intelligence into Impact. | | | |

JSON-LD values:
- Types: Organization, WebSite, WebPage, Service, Service, Service, Service
- Organization: name "Meridanta", slogan "Technology Expertise. Business Outcomes.", areaServed United States and India, 19 knowsAbout topics, sameAs 0 profiles; no legal name, email, phone, address or founding date yet
- Services: Consulting & Delivery; AI Solutions & Services; Data Engineering & Analytics; Qlik Center of Excellence

#### Hero banners (3): DRAFT – Sri to review

| Headline | Tagline | Description | Button and link | Approve | Edit | Remove |
|---|---|---|---|---|---|---|
| Turning Data into Intelligence. Intelligence into Impact. | AI \| Data Engineering \| Analytics \| Cloud | We help enterprises modernize data ecosystems, harness AI and build intelligent solutions that drive measurable business outcomes. | Explore Our Services → /#services | | | |
| Enabling Smarter, More Connected Healthcare. | Healthcare Data \| Analytics \| AI-driven Insights | Unifying complex healthcare data to support better insights, operational efficiency, informed decisions and improved care delivery. | Explore Healthcare Solutions → /industries/healthcare/ | | | |
| Accelerating Enterprise Analytics with Qlik. | Qlik Consulting \| Implementation \| Center of Excellence | Specialized professional services, data integration expertise and reusable accelerators that help enterprises maximize their Qlik investments. | Explore Qlik Capabilities → /qlik/ | | | |

#### Sections

| Section | Headline | Intro | Approve | Edit | Remove |
|---|---|---|---|---|---|
| Services | Technology Expertise. Practical Execution. Measurable Outcomes. | What We Do | | | |
| Industries | Industries We Serve | We apply AI, data, analytics, and modern technology capabilities to the needs of complex, data-driven industries. | | | |
| Products & Solutions | Products & Solutions | Explore Meridanta’s solutions for turning complex data into useful insight and accelerating the delivery of business intelligence. | | | |
| About | About Meridanta | Meridanta focuses on AI, Data & Analytics, and Cloud solutions that help organizations address business challenges through practical technology and disciplined delivery. Our approach brings together business understanding, engineering expertise, and outcome-oriented execution to help customers turn technology opportunities into meaningful results. | | | |

#### What We Do: DRAFT – Sri to review

**Technology Expertise. Practical Execution. Measurable Outcomes.** (h2)

We combine business understanding, deep technology expertise and disciplined delivery to help enterprises modernize their data ecosystems, apply AI and build scalable digital solutions.  
From strategic consulting and architecture to implementation and managed services, we turn complex technology initiatives into measurable business outcomes.  

**01 · Consulting & Delivery: From Strategy to Successful Execution.** We help organizations translate business priorities into practical technology strategies, architectures and successfully delivered solutions.
- Technology strategy, assessment & roadmap
- Enterprise and solution architecture
- Platform evaluation and technology selection
- Proof of concepts and solution validation
- End-to-end implementation and project delivery
- Managed services, platform support and optimization
Explore link: not shown yet (planned page /services/consulting-delivery)

**02 · AI Solutions & Services: Applying AI to Real Business Challenges.** We design and implement intelligent solutions that combine enterprise data, AI technologies and automation to improve business processes and decision-making.
- AI strategy, readiness assessment & roadmap
- Generative AI and agentic AI solutions
- Machine learning, deep learning and predictive analytics
- Natural language processing (NLP)
- Intelligent automation and AI integration
- Custom AI solutions, prototyping and development
Explore link: not shown yet (planned page /services/ai-solutions)

**03 · Data Engineering & Analytics: Building the Foundation for Intelligent Decisions.** We engineer modern, secure and scalable data ecosystems that connect enterprise information, enable trusted insights and power advanced analytics.
- Data strategy, architecture & modernization
- Data engineering and cloud data migration
- Data integration, data fabric and ETL/ELT
- Data governance, master data management (MDM) & quality
- Data security, privacy and regulatory alignment
- Business intelligence, reporting and advanced analytics
Explore link: not shown yet (planned page /services/data-engineering-analytics)

**04 · Qlik Center of Excellence: Maximizing the Value of Your Qlik Ecosystem.** We provide specialized Qlik and Talend professional services, helping enterprises design, implement, optimize and manage their data integration and analytics platforms.
- Qlik architecture, consulting & implementation
- Qlik Replicate, Compose and Talend data integration
- Qlik Sense, QlikView and analytics modernization
- Performance optimization and platform engineering
- Custom accelerators, reusable frameworks and automation
- Managed platform support and Center of Excellence services
Explore link: /qlik/

#### Industries We Serve (home cards)

**Healthcare: Enabling Better Healthcare Outcomes.** AI and data solutions that help providers, payers and pharma improve affordability, patient outcomes and operational efficiency.
- Challenges: Rising costs, regulatory pressure and complex clinical data.
- Opportunities: Connected devices, remote monitoring and integrated patient insights.
- Our capabilities: Clinical data analysis, healthcare dashboards and pharma analytics.

**Communications, Media & Entertainment: Connecting People, Powering Experiences.** Data, AI and cloud solutions that optimize networks, personalize engagement and unlock new revenue streams.
- Challenges: Shifting viewer habits, rising delivery costs and digital-first competition.
- Opportunities: Real-time data, cloud-native platforms and advertising analytics.
- Our capabilities: Streaming, network and viewership analytics, NPS and data monetization.

#### Products & Solutions

- Qlik Accelerators card: "Ready-made components that speed up Qlik monitoring, reporting and operations." Chips: 5 accelerators, Qlik Sense & Replicate, Monitoring, reporting, logs.
- HCInsights card: "A turnkey healthcare insights solution that unifies clinical, operational and financial data." Chips: 5 modules, Clinical + financial data, Power BI dashboards. (Links to the Healthcare page; there is no HCInsights page.)
- Data Platforms & Cloud Solutions: capabilities Data modernization & cloud migration; Data integration & fabric; Governance, MDM & data quality; Analytics & BI platforms; Managed platform support. Talend frameworks: Context Management Framework; Cryptographic Security Utility; Reusable Plug-and-Play Components; SAP Onboarding Framework.

#### About

Tagline: Technology Expertise. Business Outcomes.

Meridanta focuses on AI, Data & Analytics, and Cloud solutions that help organizations address business challenges through practical technology and disciplined delivery.
Our approach brings together business understanding, engineering expertise, and outcome-oriented execution to help customers turn technology opportunities into meaningful results.

- Business understanding: We start from the decision or process you want to improve.
- Engineering expertise: Hands-on depth across data, analytics, AI, and cloud platforms.
- Outcome-oriented execution: Delivery measured by results, not by recommendations alone.

#### Contact

Form fields: name, business email, company (optional), area of interest (optional), message. Interest options: AI Solutions & Services; Data Engineering & Analytics; Qlik Solutions & Accelerators; Healthcare Insights; Cloud & Modernisation; Consulting & Delivery; Other.


### Qlik Center of Excellence (`/qlik/`)

| Item | Current value | Approve | Edit | Remove |
|---|---|---|---|---|
| Meta title (60 chars) | Qlik Center of Excellence \| Data, Analytics & AI \| Meridanta | | | |
| Meta description (144 chars) | Meridanta's Qlik Center of Excellence: data integration, analytics and AI on Qlik, from consulting and delivery to managed support and training. | | | |
| H1 | Qlik: Data Integration, Analytics and AI Platform | | | |

JSON-LD values:
- Types: Organization, WebSite, WebPage, BreadcrumbList, Service, Service, Service, Service, ItemList
- Organization: name "Meridanta", slogan "Technology Expertise. Business Outcomes.", areaServed United States and India, 19 knowsAbout topics, sameAs 0 profiles; no legal name, email, phone, address or founding date yet
- Services: Qlik Center of Excellence: Consulting; Qlik Center of Excellence: Delivery & Execution; Qlik Center of Excellence: Managed Support; Qlik Center of Excellence: Training
- Case study ItemList: 20 items
- Breadcrumb: Home > Qlik

Eyebrow: Qlik Center of Excellence. Intro: Qlik brings data integration, data quality, analytics and automation together. Meridanta's Qlik Center of Excellence helps you choose, design, deliver and support the right solution, so your data becomes insight people can act on.

| Section | Headline | Intro | Approve | Edit | Remove |
|---|---|---|---|---|---|
| Capabilities | Qlik Capabilities | From moving and trusting data to exploring it and acting on it, here is how we help across the Qlik platform. | | | |
| Service offerings | Qlik COE Service Offerings | Our Center of Excellence supports you at every stage, from first proof of concept to day-to-day operations and skills. | | | |
| Accelerators | Qlik Accelerators | Reusable, Meridanta-built components that speed up Qlik development, standardize implementation patterns, and improve consistency across analytics delivery. | | | |
| Case studies | Proven Outcomes | Real results from Qlik migrations, real-time replication and data modernization. | | | |

#### Capabilities (7)

**Data Replication (CDC).** Real-time data movement with change data capture.
- Captures changes from databases, SAP, mainframe and SaaS as they happen.
- Delivers to warehouses, lakes and cloud with minimal impact on source systems.
- Keeps every target continuously in sync for analytics and AI.

**Talend ETL.** Reliable pipelines that turn raw data into ready data.
- Designs robust extract, transform and load workflows with Talend.
- Reusable Meridanta frameworks speed up development.
- Built-in monitoring and error handling for production workloads.

**Data Quality & Governance.** Data the business can trust.
- Profiles, cleanses and standardizes data at the source.
- Catalogs data assets and tracks lineage end to end.
- Applies governance rules for security and compliance.

**Open Lakehouse.** Open, scalable storage for analytics and AI.
- Built on open table formats such as Apache Iceberg.
- Scales storage and compute independently.
- Avoids vendor lock-in while keeping costs low.

**Visualization & Dashboards.** Explore data freely and see the full picture.
- Interactive, self-service Qlik Sense dashboards.
- Associative exploration reveals insights that queries miss.
- Works seamlessly across desktop and mobile.

**Enterprise Reporting.** The right report, to the right people, on time.
- Pixel-perfect, formatted reports built on Qlik data.
- Scheduled and distributed automatically by email.
- Consistent, governed numbers for every stakeholder.

**Automation.** Turn insights into action, automatically.
- Triggers workflows and alerts from data events.
- Connects Qlik with business apps without custom code.
- Frees teams from repetitive manual work.

#### Service offerings (4)

**Consulting.** Shape the right Qlik architecture and prove value before you scale. Outcome: A validated roadmap and architecture you can build on.
- Proofs of concept
- Benchmarking using beta testing
- Qlik Replicate, Compose, Catalog, QlikView and Qlik Sense product guidance
- Architecture solutions for data integration
- Packaged solutions with QlikView and Qlik Sense
- Point solutions and accelerators (server performance monitors, governance dashboards, meta scanner)

**Delivery & Execution.** Build and roll out Qlik solutions with proven methods and standards. Outcome: Predictable delivery, on time and to standard.
- Architecture review and development
- Delivery methodology and approach
- Estimation techniques and templates
- Maintenance and support methodology
- Standards, best practices and guidelines
- Migration best practices and approaches

**Managed Support.** Keep your Qlik platform healthy, fast and cost-efficient. Outcome: A stable, optimized platform with fewer incidents.
- Architecture review and development
- Performance improvement
- Physical design and infrastructure recommendations
- Migration best practices
- Portfolio analysis
- Technology rationalization

**Training.** Grow in-house Qlik skills with project-focused programs. Outcome: Confident teams who can own and extend the platform.
- Project-based customized Qlik Replicate, Compose and QlikView training
- QlikView and Qlik Sense best practices and standards
- Certification programs
- Knowledge sharing sessions


### Healthcare (`/industries/healthcare/`)

| Item | Current value | Approve | Edit | Remove |
|---|---|---|---|---|
| Meta title (53 chars) | Healthcare Data, AI & Analytics Solutions \| Meridanta | | | |
| Meta description (152 chars) | AI and data solutions that help providers, payers and pharma improve affordability, patient outcomes and operational efficiency. Delivered by Meridanta. | | | |
| H1 | Enabling Better Healthcare Outcomes Through AI and Data | | | |

JSON-LD values:
- Types: Organization, WebSite, WebPage, BreadcrumbList
- Organization: name "Meridanta", slogan "Technology Expertise. Business Outcomes.", areaServed United States and India, 19 knowsAbout topics, sameAs 0 profiles; no legal name, email, phone, address or founding date yet
- Breadcrumb: Home > Industries > Healthcare

Eyebrow: HEALTHCARE. Lede: AI and data solutions that help providers, payers and pharma improve affordability, patient outcomes and operational efficiency.

**Industry challenges.** Healthcare organizations face increasing pressure to improve affordability, enhance patient outcomes, meet evolving regulatory requirements, and demonstrate measurable value to patients, providers, and payers. Complex clinical data, rising research and development costs, and the need for more efficient care delivery create opportunities for technology-led transformation.

**Technology opportunities.** AI and data-driven innovations are helping healthcare organizations turn these challenges into opportunities. Connected medical devices, remote health monitoring, integrated patient and provider insights, intelligent data platforms, personalized patient engagement, and advanced healthcare analytics enable more informed decisions and more effective care delivery.

**Our capabilities.** Meridanta brings a holistic approach to healthcare technology, combining consulting expertise with implementation across data management, clinical data analysis, healthcare dashboards, provider efficiency, healthcare marketing analytics, and pharmaceutical data analytics. We help organizations translate complex data into actionable insights and support better business and healthcare decisions.


### Communications, Media & Entertainment (`/industries/communications-media-entertainment/`)

| Item | Current value | Approve | Edit | Remove |
|---|---|---|---|---|
| Meta title (59 chars) | Communications, Media & Entertainment Solutions \| Meridanta | | | |
| Meta description (151 chars) | Data, AI and cloud solutions that optimize networks, personalize engagement and unlock new revenue streams for communications, media and entertainment. | | | |
| H1 | Connecting People, Powering Experiences, Enabling Growth. | | | |

JSON-LD values:
- Types: Organization, WebSite, WebPage, BreadcrumbList
- Organization: name "Meridanta", slogan "Technology Expertise. Business Outcomes.", areaServed United States and India, 19 knowsAbout topics, sameAs 0 profiles; no legal name, email, phone, address or founding date yet
- Breadcrumb: Home > Industries > Communications, Media & Entertainment

Eyebrow: COMMUNICATIONS, MEDIA & ENTERTAINMENT. Lede: Data, AI and cloud solutions that optimize networks, personalize engagement and unlock new revenue streams.

**Industry challenges.** Communications, media, and entertainment companies face rapidly evolving customer expectations, rising network and content delivery costs, and intensifying competition from digital-first businesses. Subscription fatigue, changing consumption patterns, and fragmented advertising markets challenge traditional revenue models, while infrastructure, service quality, and personalized experiences must keep improving.

**Technology opportunities.** AI, data analytics, cloud-native platforms, and software-defined networking create new ways to transform service delivery, optimize network performance, and unlock new revenue streams. Real-time data intelligence, connected homes, emerging wireless technologies, advertising analytics, and unified customer insights help personalize engagement and monetize content and data more effectively.

**Our capabilities.** Meridanta supports data management, service delivery optimization, real-time streaming analytics, network and marketing analytics, cost optimization, predictive customer-contact analytics, advertising-led data monetization, omnichannel sales, NPS, customer and employee experience, and viewership analytics, delivered with Agile and CI/CD practices that accelerate time to market.


### Privacy Policy page (`/privacy/`): **DRAFT – Sri to review**

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
- No mention of delivery model, engagement sizes, or locations beyond the structured-data `areaServed`.
- Only 2 of the planned industries are published (the code comment lists Insurance, Banking & Financial Services and Enterprise Technology as waiting for approved content).
- Case studies are anonymous ("For complex enterprise customers"); nothing says whether clients have approved being named.
- There is no dedicated page for HCInsights, even though the home page promotes it as a product.

## 4. Wording to check (not changed)

- "Cloud & Modernisation" in the contact form's area-of-interest list uses the British spelling; the rest of the site uses American spelling ("modernization", "Modernization"). The selected value is sent with the inquiry, so change it consistently if you decide to.
- "Home-grown solution" badge on the accelerators card and "independently developed" in the trademark line: confirm Meridanta owns these assets outright.
- "Qlik Analytics and Integration" is used as the title of an image with a long description: check it is not read as a Qlik product name.

## 5. Qlik and third-party branding check

### 5.1 Mentions per page (visible text, including text hidden behind tabs)

| Brand | / | /qlik/ | /industries/healthcare/ | /industries/communications-media-entertainment/ |
|---|---|---|---|---|
| Qlik Sense | 2 | 28 | 0 | 0 |
| QlikView | 1 | 25 | 0 | 0 |
| Qlik Replicate | 1 | 20 | 0 | 0 |
| Qlik Cloud | 0 | 5 | 0 | 0 |
| Qlik (any) | 19 | 126 | 2 | 2 |
| Talend | 4 | 7 | 0 | 0 |
| Power BI | 2 | 4 | 0 | 0 |
| NPrinting | 0 | 12 | 0 | 0 |

Related phrases:

| Phrase | / | /qlik/ | /industries/healthcare/ | /industries/communications-media-entertainment/ |
|---|---|---|---|---|
| "Center of Excellence" | 6 | 5 | 2 | 2 |
| "Qlik expert" | 0 | 0 | 0 | 0 |
| "Qlik Expert" | 0 | 2 | 0 | 0 |

### 5.2 Trademark notices today

- **/qlik/**: "Qlik, Qlik Sense, QlikView, Qlik Replicate and Talend are trademarks of their respective owners." (small print under the page).
- **Home, Products & Solutions section**: "Qlik, Talend, and Power BI are trademarks of their respective owners. Meridanta accelerators are independently developed and do not imply endorsement."
- **Industry pages and footer**: no trademark notice. The footer is on every page, including pages that show Qlik, Talend and Power BI names.
- Suggestion: one site-wide line in the footer, for example "Qlik, Qlik Sense, QlikView, Qlik Replicate, Talend, Power BI, Snowflake, Databricks, AWS, Microsoft Azure, Oracle, IBM Db2, SAP and Apache Kafka are trademarks of their respective owners. Meridanta is not affiliated with or endorsed by these companies [unless partner status is confirmed]." [SRI]

### 5.3 Logo usage

| Where | What is shown | Source file | Question for Sri |
|---|---|---|---|
| Everywhere (hero, accelerator "Built with" tiles, case-study diagram engine node and tiles) | **The Qlik logo is no longer shown.** It is replaced by the plain word "Qlik" in the site's own font and colours. | The logo files are kept, unused, in `src/assets/unused/` | Ask Qlik for written permission before the logo goes back. |
| /qlik/ case-study diagrams and accelerator tiles | Snowflake, Databricks, Kafka, SAP, PostgreSQL, MySQL, Prometheus, Grafana, Talend (from the open-source simple-icons set) | simple-icons 16.36.0 | The icon set is open source, but the brands are still trademarks. |
| /qlik/ case-study diagrams | Official AWS and Microsoft Azure architecture icons, Oracle, IBM Db2, Power BI | `src/assets/logos/` (14 files) | Each vendor's brand and icon usage terms should be checked. |
| Home and /qlik/ images | Platform and capability illustrations with brand names in the alt text (Qlik, AWS, Databricks) | `qlik-platform.webp` (shows AWS, Databricks, Google, Iceberg, Microsoft and Snowflake marks inside the picture), `cap-*.webp`. The contact-page picture `loc-qlik.webp` (Qlik mark and text drawn into the image) was removed. | Confirm who created them and that any brand marks inside are cleared. |

### 5.4 Statements that could imply an official partnership, certification or endorsement

Search of all visible text for: partner, certified, certification, authorized, official, endorse, approved, accredited, alliance.

| Page | Text | Approve | Edit | Remove |
|---|---|---|---|---|
| /qlik/ | Certification programs | | | |

Also relevant: the name "Qlik Center of Excellence", the button "Talk to a Qlik Expert" (it appears on the floating button on the /qlik pages and in the /qlik hero). No page states a partner level.

## 6. TODOs and unverified claims

Tick one column per row. Items from the code comments are quoted.

### 6.1 Company and site facts

| Type | ID | Item | Detail | Approve | Edit | Remove |
|---|---|---|---|---|---|---|
| Fact | legalName | Registered legal entity name | empty in `src/company.js` | | | |
| Fact | email | Public business email | set to srivatsans@meridanta.com (footer, contact section, Organization data, llms.txt) | | | |
| Fact | phone | Public phone | empty | | | |
| Fact | address | Registered Office | set to 262 Chapman Rd, Ste 240, Newark, DE 19702, USA (footer, contact section, Organization data, llms.txt) | | | |
| Fact | foundingDate | Founding date | empty | | | |
| Fact | areaServed | "United States and India" | from the project brief, used in structured data | | | |
| Link | social | LinkedIn, X, Facebook, Instagram, YouTube | all empty in `src/social.js`; no icons are shown until real URLs are added | | | |
| Page | privacy | Privacy Policy page `/privacy/` | DRAFT – Sri to review (source: `src/privacyData.js`) | | | |
| Link | twitterSite | X handle for Twitter cards | empty in `src/seo.js` | | | |
| Text | form-note | Public "Preview build" note on the contact form | removed in Phase 6 | | | |
| Product | HCInsights | "A turnkey healthcare insights solution that unifies clinical, operational and financial data"; "5 modules"; "Power BI dashboards" | card links to the Healthcare page; no HCInsights page exists | | | |
| Product | qlik-coe | Qlik / Talend partner status | none claimed; `qlikData.js` asks to confirm | | | |
| Offering | training | "Certification programs" in the Training offering | flagged in code as unconfirmed | | | |
| Content | qlik-review | Every Qlik product statement | code note: "Nataraj (Qlik lead) to review every product statement for technical accuracy" | | | |
| Content | talend | Talend frameworks beyond the four named (Context Management Framework, Cryptographic Security Utility, Reusable Plug-and-Play Components, SAP Onboarding Framework) | code note | | | |
| SEO | titles | Page titles and descriptions in `src/seo.js` | [SRI] | | | |

### 6.2 Case studies (20 published) with their numbers

| Type | ID | Title | Client descriptor | Headline and key numbers | Approve | Edit | Remove |
|---|---|---|---|---|---|---|---|
| Case study | `qlik-server-upgrade` | Qlik Server Upgrade to the Latest Release | For complex enterprise customers | 5 days to complete; < 12.xx starting version; Latest release delivered; 5 days to complete | | | |
| Case study | `qlikview-to-qliksense` | QlikView to Qlik Sense Migration | For multiple customers | 40 hrs upgrade & migration; 3 servers migrated; 40 hrs end to end; 1 week hypercare support | | | |
| Case study | `qliksense-upgrade-domain` | Qlik Sense Server Upgrade & Domain Migration | For multiple customers | 40 hrs upgrade & migration; 3 servers; 40 hrs end to end; 0 issues reported | | | |
| Case study | `qlikview-domain-migration` | QlikView Domain Migration | For multiple customers | 40 hrs migration; 3 servers; 40 hrs end to end; 0 issues reported | | | |
| Case study | `qlikview-to-qlik-cloud` | QlikView to Qlik Cloud Migration | For multiple customers | ~40% faster response time; ~40% faster response; ~30% shorter reload time; 2 months project duration | | | |
| Case study | `architecture-review` | Qlik Sense & QlikView Architecture Review | For multiple customers | 15 days to complete; Global user base; Fewer job failures; 15 days project duration | | | |
| Case study | `sap-ecc-snowflake` | SAP ECC to Snowflake on AWS | For multiple customers | $200K–$500K cost saving; ~1 TB full load; 100 GB+ changes per day; < 5s latency | | | |
| Case study | `multi-source-databricks` | Multiple Sources to Databricks on Azure | For a leading insurance company | $1M cost saving; ~10 TB full load; 500 GB+ changes per day; < 5s latency | | | |
| Case study | `oracle-onprem-oracle-cloud` | Oracle On-Prem to Oracle Cloud | For multiple customers | $300K–$500K cost saving; 100 GB+ changes per day; 30 GB peak hour load; < 5s latency | | | |
| Case study | `sqlserver-synapse` | 250 SQL Server Databases to Azure Synapse | For multiple customers | $1M–$2M cost saving; 250 databases; 1 TB+ changes per day; < 5s latency | | | |
| Case study | `sap-hana-synapse` | SAP HANA to ADLS / Synapse | For multiple customers | $500K–$1M cost saving; 30 GB+ changes per day; 10 GB peak hour load; < 5s latency | | | |
| Case study | `sap-extractor-adls` | SAP Extractor to ADLS Gen2 | For multiple customers | $500K–$1M cost saving; 40 GB+ changes per day; 5 GB peak hour load; < 5s latency | | | |
| Case study | `rdbms-kafka` | RDBMS to Kafka / Event Hub | For multiple customers | < 5s streaming latency; 4 source databases; 50 GB+ changes per day; < 5s latency | | | |
| Case study | `rdbms-snowflake-redshift` | RDBMS to Snowflake / Redshift | For multiple customers | < 5s replication latency; 100 GB+ changes per day; 30 GB peak hour load; < 5s latency | | | |
| Case study | `one-source-multi-target` | One Source to Multiple Targets | For multiple customers | $500K–$1M cost saving; 1 → many one read, all targets; 100 GB+ changes per day; < 10s latency | | | |
| Case study | `postgres-bidirectional` | PostgreSQL to PostgreSQL (Bidirectional) | For multiple customers | $300K–$1M cost saving; 2-way replication; 20 GB+ changes per day; < 15s latency | | | |
| Case study | `oracle-rds-snowflake` | Oracle (RDS) to Snowflake | For multiple customers | $200K–$300K cost saving; 40 GB+ changes per day; 10 GB peak hour load; < 5s latency | | | |
| Case study | `oracle-s3` | Oracle On-Prem to AWS S3 | For multiple customers | $200K–$300K cost saving; 20 GB+ changes per day; 5 GB peak hour load; < 5s latency | | | |
| Case study | `db2i-databricks` | DB2 i-Series to Databricks / ADLS Gen2 | For multiple customers | $400K–$500K cost saving; 20 GB+ changes per day; 5 GB peak hour load; < 5s latency | | | |
| Case study | `airline-modernization` | Airline Trade Association Modernization | For a leading airline trade association | 200+ Talend jobs migrated; 200+ Talend jobs; 20+ Power BI reports; 500+ entities | | | |

### 6.3 Qlik accelerators (5)

| Type | ID | Title | Tools shown | Claim | Approve | Edit | Remove |
|---|---|---|---|---|---|---|---|
| Accelerator | `prometheus` | Prometheus Integration | Built with Qlik Enterprise Manager, Prometheus, Grafana | "Home-grown" claim; features and benefits as written | | | |
| Accelerator | `nprinting` | NPrinting Task Trigger | Built with Qlik Sense, NPrinting REST API | "Home-grown" claim; features and benefits as written | | | |
| Accelerator | `pdf-export` | PDF Export of Dashboards | Built with Qlik Sense, PDF | "Home-grown" claim; features and benefits as written | | | |
| Accelerator | `log-scraping` | Qlik Log Scraping | Built with Qlik Replicate, System logs | "Home-grown" claim; features and benefits as written | | | |
| Accelerator | `adls-logs` | ADLS Gen2 Storage Integration for Qlik Logs | Built with Qlik logs, ADLS Gen2 | "Home-grown" claim; features and benefits as written | | | |

### 6.4 Content in the code that is not shown on the site

These are not published today, but they are in the data files and could be reused. Review them before anyone does.

| Item | Where | Note |
|---|---|---|
| Impact strip: "20 enterprise case studies", "$1M-$2M highest cost saving", "< 5s replication latency", "40 hrs typical Qlik migration" | `caseImpact` in `src/caseStudies.js` | Marked "TODO: confirm". Not displayed. |
| Healthcare feature list: Enterprise Data Hub, Unified Patient Analytics, Automated Regulatory Reporting ("340B, FPAR, NACHC"), Pharmacy & Medication Insights ("Medi Tracker platform"), Executive Dashboards | `HC_FEATURES` in `src/data.js` | Specific compliance and platform names; not displayed. |
| Case-study "outcomes" tags (Cost saving, Sales increase, Customer satisfaction) | `outcomes` field | No longer displayed. Cases tagged "Customer satisfaction" show no supporting evidence in their text. |
| Highlights list | `HIGHLIGHTS` in `src/data.js` | Not displayed. |
| 1 unpublished case study | `published: false` | Not displayed. |

### 6.5 Typos

- Fixed: "ADLF Integration" in the unused `QLIK_ACCELERATORS` list in `src/data.js` is now "ADLS Integration" (it is not shown on the site).
- No other obvious typos, doubled words or stray punctuation were found in the visible text of the four pages.
