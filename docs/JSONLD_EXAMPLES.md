# JSON-LD examples

Extracted from the built HTML (`dist/`) in Phase 4. Each page carries one `<script type="application/ld+json">` block with a single `@graph`. Empty company details (legal name, email, phone, address, founding date) and unpublished social profiles (`sameAs`) are absent on purpose until they are confirmed in `src/company.js` / `src/social.js`.

## `/`

Node types: Organization, WebSite, WebPage, Service, Service, Service, Service

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://meridanta.com/#organization",
      "name": "Meridanta",
      "url": "https://meridanta.com/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://meridanta.com/icon-512.png",
        "width": 512,
        "height": 512
      },
      "image": "https://meridanta.com/og-image.png",
      "description": "Meridanta focuses on AI, Data & Analytics, and Cloud solutions that help organizations address business challenges through practical technology and disciplined delivery.",
      "slogan": "Technology Expertise. Business Outcomes.",
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "India"
        }
      ],
      "knowsAbout": [
        "Consulting & Delivery",
        "AI Solutions & Services",
        "Data Engineering & Analytics",
        "Qlik Center of Excellence",
        "Data Replication (CDC)",
        "Talend ETL",
        "Data Quality & Governance",
        "Open Lakehouse",
        "Visualization & Dashboards",
        "Enterprise Reporting",
        "Automation",
        "Healthcare",
        "Communications, Media & Entertainment",
        "Qlik Replicate",
        "Qlik Compose",
        "Qlik Catalog",
        "QlikView",
        "Qlik Sense",
        "Talend"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://meridanta.com/#website",
      "url": "https://meridanta.com/",
      "name": "Meridanta",
      "description": "Meridanta focuses on AI, Data & Analytics, and Cloud solutions that help organizations address business challenges through practical technology and disciplined delivery.",
      "inLanguage": "en",
      "publisher": {
        "@id": "https://meridanta.com/#organization"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://meridanta.com/#webpage",
      "url": "https://meridanta.com/",
      "name": "Meridanta | Outcome-driven AI, Data & Cloud Solutions",
      "description": "Meridanta helps organizations solve business problems with AI, data and analytics, cloud and Qlik expertise, using an AI-first, outcome-driven approach.",
      "inLanguage": "en",
      "isPartOf": {
        "@id": "https://meridanta.com/#website"
      },
      "about": {
        "@id": "https://meridanta.com/#organization"
      }
    },
    {
      "@type": "Service",
      "@id": "https://meridanta.com/#service-consulting-and-delivery",
      "name": "Consulting & Delivery",
      "description": "Outcome-based, data-driven, and AI-first consulting that takes solutions from strategy through end-to-end implementation.",
      "url": "https://meridanta.com/#services",
      "provider": {
        "@id": "https://meridanta.com/#organization"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "India"
        }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://meridanta.com/#service-ai-solutions-and-services",
      "name": "AI Solutions & Services",
      "description": "AI-enabled business solutions and intelligent automation, applied to real-world business challenges.",
      "url": "https://meridanta.com/#services",
      "provider": {
        "@id": "https://meridanta.com/#organization"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "India"
        }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://meridanta.com/#service-data-engineering-and-analytics",
      "name": "Data Engineering & Analytics",
      "description": "Building data foundations and enabling data-driven solutions that support better decisions.",
      "url": "https://meridanta.com/#services",
      "provider": {
        "@id": "https://meridanta.com/#organization"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "India"
        }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://meridanta.com/#service-qlik-center-of-excellence",
      "name": "Qlik Center of Excellence",
      "description": "Expert consultants, solutions, and accelerators across Qlik Replicate, Compose, Catalog, QlikView, Qlik Sense, and Talend.",
      "url": "https://meridanta.com/qlik/",
      "provider": {
        "@id": "https://meridanta.com/#organization"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "India"
        }
      ]
    }
  ]
}
```

## `/qlik/`

Node types: Organization, WebSite, WebPage, BreadcrumbList, Service, Service, Service, Service, ItemList

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://meridanta.com/#organization",
      "name": "Meridanta",
      "url": "https://meridanta.com/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://meridanta.com/icon-512.png",
        "width": 512,
        "height": 512
      },
      "image": "https://meridanta.com/og-image.png",
      "description": "Meridanta focuses on AI, Data & Analytics, and Cloud solutions that help organizations address business challenges through practical technology and disciplined delivery.",
      "slogan": "Technology Expertise. Business Outcomes.",
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "India"
        }
      ],
      "knowsAbout": [
        "Consulting & Delivery",
        "AI Solutions & Services",
        "Data Engineering & Analytics",
        "Qlik Center of Excellence",
        "Data Replication (CDC)",
        "Talend ETL",
        "Data Quality & Governance",
        "Open Lakehouse",
        "Visualization & Dashboards",
        "Enterprise Reporting",
        "Automation",
        "Healthcare",
        "Communications, Media & Entertainment",
        "Qlik Replicate",
        "Qlik Compose",
        "Qlik Catalog",
        "QlikView",
        "Qlik Sense",
        "Talend"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://meridanta.com/#website",
      "url": "https://meridanta.com/",
      "name": "Meridanta",
      "description": "Meridanta focuses on AI, Data & Analytics, and Cloud solutions that help organizations address business challenges through practical technology and disciplined delivery.",
      "inLanguage": "en",
      "publisher": {
        "@id": "https://meridanta.com/#organization"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://meridanta.com/qlik/#webpage",
      "url": "https://meridanta.com/qlik/",
      "name": "Qlik Center of Excellence | Data, Analytics & AI | Meridanta",
      "description": "Meridanta's Qlik Center of Excellence: data integration, analytics and AI on Qlik, from consulting and delivery to managed support and training.",
      "inLanguage": "en",
      "isPartOf": {
        "@id": "https://meridanta.com/#website"
      },
      "about": {
        "@id": "https://meridanta.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://meridanta.com/qlik/#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://meridanta.com/qlik/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://meridanta.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Qlik",
          "item": "https://meridanta.com/qlik/"
        }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://meridanta.com/#service-qlik-consulting",
      "name": "Qlik Center of Excellence: Consulting",
      "description": "Shape the right Qlik architecture and prove value before you scale.",
      "url": "https://meridanta.com/qlik/#qlik-services",
      "provider": {
        "@id": "https://meridanta.com/#organization"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "India"
        }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://meridanta.com/#service-qlik-delivery-and-execution",
      "name": "Qlik Center of Excellence: Delivery & Execution",
      "description": "Build and roll out Qlik solutions with proven methods and standards.",
      "url": "https://meridanta.com/qlik/#qlik-services",
      "provider": {
        "@id": "https://meridanta.com/#organization"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "India"
        }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://meridanta.com/#service-qlik-managed-support",
      "name": "Qlik Center of Excellence: Managed Support",
      "description": "Keep your Qlik platform healthy, fast and cost-efficient.",
      "url": "https://meridanta.com/qlik/#qlik-services",
      "provider": {
        "@id": "https://meridanta.com/#organization"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "India"
        }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://meridanta.com/#service-qlik-training",
      "name": "Qlik Center of Excellence: Training",
      "description": "Grow in-house Qlik skills with project-focused programs.",
      "url": "https://meridanta.com/qlik/#qlik-services",
      "provider": {
        "@id": "https://meridanta.com/#organization"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "India"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://meridanta.com/qlik/#case-studies",
      "name": "Proven Outcomes: Meridanta Qlik case studies",
      "numberOfItems": 20,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "250 SQL Server Databases to Azure Synapse",
          "url": "https://meridanta.com/qlik/#case-sqlserver-synapse",
          "description": "Replicated 1 TB+ of daily changes from 250 SQL Server databases to ADLS and Synapse in real time."
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Multiple Sources to Databricks on Azure",
          "url": "https://meridanta.com/qlik/#case-multi-source-databricks",
          "description": "Consolidated DB2, Postgres, Oracle and SQL Server data into Databricks on Azure in near real time."
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Airline Trade Association Modernization",
          "url": "https://meridanta.com/qlik/#case-airline-modernization",
          "description": "Migrated legacy SQL data to Snowflake and modernized Talend ETL and Power BI reporting for global operations."
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "QlikView to Qlik Cloud Migration",
          "url": "https://meridanta.com/qlik/#case-qlikview-to-qlik-cloud",
          "description": "Moved QlikView dashboards to Qlik Cloud, optimized the architecture and replaced NPrinting with a cloud-native alternative."
        },
        {
          "@type": "ListItem",
          "position": 5,
          "name": "Qlik Server Upgrade to the Latest Release",
          "url": "https://meridanta.com/qlik/#case-qlik-server-upgrade",
          "description": "Upgraded Qlik servers older than 12.xx to the latest release to unlock AI features, optimize performance and keep vendor support."
        },
        {
          "@type": "ListItem",
          "position": 6,
          "name": "Qlik Sense & QlikView Architecture Review",
          "url": "https://meridanta.com/qlik/#case-architecture-review",
          "description": "Redesigned Qlik Sense architecture for users across regions and tuned QlikView tasks for faster, more reliable runs."
        },
        {
          "@type": "ListItem",
          "position": 7,
          "name": "QlikView to Qlik Sense Migration",
          "url": "https://meridanta.com/qlik/#case-qlikview-to-qliksense",
          "description": "Migrated three QlikView servers to new Qlik Sense servers without changing the end-user experience."
        },
        {
          "@type": "ListItem",
          "position": 8,
          "name": "Qlik Sense Server Upgrade & Domain Migration",
          "url": "https://meridanta.com/qlik/#case-qliksense-upgrade-domain",
          "description": "Upgraded three Qlik Sense servers to a recent release on new infrastructure, with a domain change and an exact configuration replica."
        },
        {
          "@type": "ListItem",
          "position": 9,
          "name": "QlikView Domain Migration",
          "url": "https://meridanta.com/qlik/#case-qlikview-domain-migration",
          "description": "Moved three QlikView servers to new infrastructure with a domain change, as an exact replica of the existing setup."
        },
        {
          "@type": "ListItem",
          "position": 10,
          "name": "SAP ECC to Snowflake on AWS",
          "url": "https://meridanta.com/qlik/#case-sap-ecc-snowflake",
          "description": "Real-time replication from SAP ECC to Snowflake after an on-prem to cloud move, with zero impact on the source."
        },
        {
          "@type": "ListItem",
          "position": 11,
          "name": "Oracle On-Prem to Oracle Cloud",
          "url": "https://meridanta.com/qlik/#case-oracle-onprem-oracle-cloud",
          "description": "Real-time replication between Oracle environments for a cloud migration, with no impact on the source."
        },
        {
          "@type": "ListItem",
          "position": 12,
          "name": "SAP HANA to ADLS / Synapse",
          "url": "https://meridanta.com/qlik/#case-sap-hana-synapse",
          "description": "Real-time SAP HANA replication to Azure analytics using Qlik Replicate’s SAP connector."
        },
        {
          "@type": "ListItem",
          "position": 13,
          "name": "SAP Extractor to ADLS Gen2",
          "url": "https://meridanta.com/qlik/#case-sap-extractor-adls",
          "description": "Near real-time replication of SAP Extractor data into Azure Data Lake Storage Gen2."
        },
        {
          "@type": "ListItem",
          "position": 14,
          "name": "RDBMS to Kafka / Event Hub",
          "url": "https://meridanta.com/qlik/#case-rdbms-kafka",
          "description": "Streamed real-time changes from Oracle, SQL Server, Postgres and MySQL into Kafka topics."
        },
        {
          "@type": "ListItem",
          "position": 15,
          "name": "RDBMS to Snowflake / Redshift",
          "url": "https://meridanta.com/qlik/#case-rdbms-snowflake-redshift",
          "description": "Real-time replication from Oracle, SQL Server, Postgres and MySQL into Snowflake with DDL capture."
        },
        {
          "@type": "ListItem",
          "position": 16,
          "name": "One Source to Multiple Targets",
          "url": "https://meridanta.com/qlik/#case-one-source-multi-target",
          "description": "Read data once and wrote it to several RDBMS targets in real time using a log stream architecture."
        },
        {
          "@type": "ListItem",
          "position": 17,
          "name": "PostgreSQL to PostgreSQL (Bidirectional)",
          "url": "https://meridanta.com/qlik/#case-postgres-bidirectional",
          "description": "Set up bidirectional near real-time replication between PostgreSQL databases."
        },
        {
          "@type": "ListItem",
          "position": 18,
          "name": "Oracle (RDS) to Snowflake",
          "url": "https://meridanta.com/qlik/#case-oracle-rds-snowflake",
          "description": "Near real-time replication from Oracle on RDS into Snowflake with DDL changes applied."
        },
        {
          "@type": "ListItem",
          "position": 19,
          "name": "Oracle On-Prem to AWS S3",
          "url": "https://meridanta.com/qlik/#case-oracle-s3",
          "description": "Near real-time replication from on-prem Oracle into AWS S3 for cloud analytics."
        },
        {
          "@type": "ListItem",
          "position": 20,
          "name": "DB2 i-Series to Databricks / ADLS Gen2",
          "url": "https://meridanta.com/qlik/#case-db2i-databricks",
          "description": "Near real-time replication from IBM DB2 i-Series into ADLS Gen2 and Databricks."
        }
      ]
    }
  ]
}
```
