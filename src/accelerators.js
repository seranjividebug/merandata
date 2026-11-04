// Meridanta – Qlik Accelerators (home-grown). Source: Qlik competency deck, slides 18–22.
// TODO: confirm content with Nataraj before launch.
import accPrometheus from "./assets/accelerators/acc-prometheus.webp";
import accNprinting from "./assets/accelerators/acc-nprinting.webp";
import accPdf from "./assets/accelerators/acc-pdf-export.webp";
import accLogs from "./assets/accelerators/acc-log-scraping.webp";
import accAdls from "./assets/accelerators/acc-adls-logs.webp";

export const accelerators = [
  {
    id: "prometheus",
    tab: "Prometheus Integration",
    title: "Prometheus Integration",
    tagline: "Real-time monitoring for Qlik replication.",
    image: accPrometheus,
    imageAlt: "Replication tasks streaming metrics into a monitoring dashboard with a gauge, trend chart and alert",
    challenge:
      "The business lacked real-time visibility into replication performance and database issues, making failures, latency spikes and data synchronization problems hard to spot quickly.",
    solution: [
      "Integrate Qlik Enterprise Manager with Prometheus and Grafana for centralized monitoring.",
      "Build real-time dashboards that track replication health and performance.",
      "Monitor task status, throughput, latency and errors.",
      "Deliver operational insight through interactive charts.",
    ],
    features: [
      "Visualize key replication metrics, including error tasks, table-level failures and task status.",
      "Track insert/update counts, throughput and total CDC events.",
      "Monitor task latency and replication performance in real time.",
      "Highlight critical errors and replication failures on dashboard indicators.",
      "Detect and alert on rising latency and abnormal replication behavior.",
    ],
    benefits: [
      "Faster detection of replication and database issues.",
      "Better visibility into task performance and data movement.",
      "Less troubleshooting effort through centralized monitoring.",
      "Proactive issue resolution with real-time alerts.",
      "A scalable, easy-to-deploy monitoring framework.",
    ],
  },
  {
    id: "nprinting",
    tab: "NPrinting Task Trigger",
    title: "NPrinting Task Trigger",
    tagline: "Run NPrinting reports straight from Qlik Sense.",
    image: accNprinting,
    imageAlt: "A Qlik Sense dashboard with a one-click run button generating reports with live status",
    challenge:
      "Business users needed direct control over NPrinting report runs from Qlik Sense dashboards, without relying on backend teams or opening the NPrinting console.",
    solution: [
      "A custom Qlik Sense extension that triggers NPrinting tasks from dashboards.",
      "Secure integration with the NPrinting REST API using NTLM authentication.",
      "Users run reports without accessing the NPrinting console.",
      "Real-time status updates and execution feedback inside Qlik Sense.",
    ],
    features: [
      "Configurable NPrinting server URL and task ID in the property panel.",
      "One-click report execution directly from Qlik Sense dashboards.",
      "Real-time task status monitoring and execution feedback.",
      "Handles validation errors, authentication failures and API exceptions.",
      "Shows task outcomes: Executing, Success, Failed and Aborted.",
    ],
    benefits: [
      "No dependency on backend teams for report runs.",
      "Higher productivity through self-service report triggering.",
      "Faster report delivery and better operational efficiency.",
      "More visibility and control over task execution.",
      "Secure, reliable report generation through authenticated APIs.",
    ],
  },
  {
    id: "pdf-export",
    tab: "PDF Dashboard Export",
    title: "PDF Export of Dashboards",
    tagline: "Every sheet, one PDF, one click.",
    image: accPdf,
    imageAlt: "Three dashboard sheets merging into a single PDF document ready to download and share",
    challenge:
      "Business users needed a simple way to export entire multi-sheet Qlik dashboards into a single PDF, instead of manual screenshots and multiple exports.",
    solution: [
      "One-click PDF export inside the dashboard.",
      "Captures every dashboard sheet automatically, in the correct order.",
      "Consolidates multiple dashboard views into one PDF document.",
      "Users create shareable reports without manual effort.",
    ],
    features: [
      "One-click export of complete multi-sheet dashboards.",
      "Automated capture of all sheets and visualizations.",
      "High-quality rendering for report-ready output.",
      "Multiple sheets consolidated into a single PDF file.",
      "Sheet order preserved for consistent reporting.",
    ],
    benefits: [
      "Less manual effort and better reporting efficiency.",
      "Faster report generation and distribution.",
      "A seamless self-service experience for business users.",
      "Consistent, professional report outputs.",
      "Simpler dashboard sharing across teams and stakeholders.",
    ],
  },
  {
    id: "log-scraping",
    tab: "Log Scraping",
    title: "Qlik Log Scraping",
    tagline: "Find problems in logs before users do.",
    image: accLogs,
    imageAlt: "Log lines scanned by a magnifier, filtered by a pattern engine and turned into automatic alerts",
    challenge:
      "When issues occurred, support teams had to manually download and analyze logs, which meant longer troubleshooting cycles and delayed resolution.",
    solution: [
      "Automated log collection from Qlik Replicate and related system components.",
      "Logs parsed and analyzed to identify errors and critical events.",
      "Predefined error patterns detected, with notifications generated automatically.",
      "Much less manual effort in log monitoring and troubleshooting.",
    ],
    features: [
      "Automated collection of Qlik Replicate and system logs.",
      "Content-based filtering and intelligent log routing.",
      "Pattern matching and log classification for faster analysis.",
      "Identification of critical errors, warnings and failures.",
      "Automated notifications based on configured patterns.",
    ],
    benefits: [
      "Less manual effort in log monitoring and analysis.",
      "Faster root-cause identification and resolution.",
      "Better SLA adherence through faster response times.",
      "Proactive monitoring with automated notifications.",
      "Cost-effective, built on open-source technologies.",
    ],
  },
  {
    id: "adls-logs",
    tab: "ADLS Integration",
    title: "ADLS Gen2 Storage Integration for Qlik Logs",
    tagline: "All Qlik logs, archived securely in one place.",
    image: accAdls,
    imageAlt: "Logs from servers flowing into secure cloud storage organized into date-based folders",
    challenge:
      "Qlik operational logs were stored across multiple locations, making long-term retention, analysis and retrieval difficult for support and audit teams.",
    solution: [
      "Qlik operational logs integrated with Azure Data Lake Storage Gen2.",
      "Automated log archival in a centralized cloud repository.",
      "Long-term retention of operational and historical log data.",
      "A scalable, secure framework for log management and analysis.",
    ],
    features: [
      "Automated transfer of Qlik logs to Azure Data Lake Storage Gen2.",
      "A centralized repository for operational and historical logs.",
      "Secure storage with Azure authentication and access controls.",
      "Date-based log organization for simple retrieval.",
      "Scalable architecture for growing log volumes.",
    ],
    benefits: [
      "Simpler log retention and management.",
      "Easier access to historical logs for troubleshooting.",
      "Stronger governance, audit readiness and compliance reporting.",
      "Less dependency on local storage and manual archiving.",
      "A reliable, scalable cloud-based storage solution.",
    ],
  },
];
