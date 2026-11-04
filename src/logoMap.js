import { siApachekafka, siDatabricks, siMysql, siPostgresql, siQlik, siSap, siSnowflake, siTalend } from "simple-icons";

/**
 * Technology logos for the case study diagram.
 *
 * Each logo is resolved in this order:
 *   1. a file you drop in src/assets/logos/<key>.svg (or .png / .webp), picked up automatically
 *   2. the simple-icons SVG, where the brand exists in the pinned version
 *   3. a text badge: generic icon + short name (never a drawn or faked logo)
 * Logos are shown in their original colors on a white tile and are never stretched, recolored,
 * rotated or cropped.
 *
 * Files in src/assets/logos are the official AWS / Microsoft architecture icons. They are for the
 * case study detail diagram only: anywhere else call logoSource(key, "card"), which uses
 * simple-icons brands only and a generic icon for everything else.
 *
 * `match` is tested against the diagram label (case-insensitive); a label can hit several brands.
 * `kind` picks the generic icon for the text badge.
 */
const FILES = import.meta.glob("./assets/logos/*.{svg,png,webp}", { eager: true, query: "?url", import: "default" });
const fileFor = (key) => {
  const hit = Object.keys(FILES).find((p) => new RegExp(`/${key}\.(svg|png|webp)$`).test(p));
  return hit ? FILES[hit] : null;
};

const ICONS = {
  qlik: siQlik,
  sap: siSap,
  snowflake: siSnowflake,
  postgresql: siPostgresql,
  mysql: siMysql,
  databricks: siDatabricks,
  kafka: siApachekafka,
  talend: siTalend,
};

// Not in simple-icons 16.36.0: sqlserver, redshift, s3, aws, rds, oracle, db2, adls, synapse, azure,
// eventhubs, powerbi, bedrock. All ship as files in src/assets/logos.
export const LOGOS = {
  qlik: { name: "Qlik", match: /qlik|upgrade/i, kind: "server" },
  sap: { name: "SAP", match: /\bsap\b/i, kind: "database" },
  sqlserver: { name: "SQL Server", match: /sql server/i, kind: "database" },
  snowflake: { name: "Snowflake", match: /snowflake/i, kind: "cloud" },
  redshift: { name: "Redshift", match: /redshift/i, kind: "cloud" },
  s3: { name: "Amazon S3", short: "S3", match: /\bs3\b/i, kind: "file" },
  rds: { name: "Amazon RDS", short: "RDS", match: /\brds\b/i, kind: "database" },
  aws: { name: "AWS", match: /\baws\b/i, kind: "cloud" },
  oracle: { name: "Oracle", match: /oracle/i, kind: "database" },
  postgresql: { name: "PostgreSQL", short: "Postgres", match: /postgres/i, kind: "database" },
  mysql: { name: "MySQL", match: /mysql/i, kind: "database" },
  db2: { name: "IBM Db2", short: "Db2", match: /db2/i, kind: "database" },
  databricks: { name: "Databricks", match: /databricks/i, kind: "cloud" },
  adls: { name: "Azure Data Lake Storage", short: "ADLS", match: /adls/i, kind: "file" },
  synapse: { name: "Azure Synapse Analytics", short: "Synapse", match: /synapse/i, kind: "cloud" },
  azure: { name: "Microsoft Azure", short: "Azure", match: /azure/i, kind: "cloud" },
  kafka: { name: "Apache Kafka", short: "Kafka", match: /kafka/i, kind: "server" },
  eventhubs: { name: "Azure Event Hubs", short: "Event Hubs", match: /event\s?hubs?/i, kind: "server" },
  talend: { name: "Talend", match: /talend/i, kind: "server" },
  powerbi: { name: "Power BI", match: /power\s?bi/i, kind: "server" },
  bedrock: { name: "Amazon Bedrock", short: "Bedrock", match: /bedrock/i, kind: "cloud" },
};

// "AWS" and "Azure" are generic fallbacks: skip them when a more specific service of that cloud is named.
const AWS_SERVICES = ["s3", "redshift", "rds", "bedrock"];
const AZURE_SERVICES = ["adls", "synapse", "eventhubs", "sqlserver"];

/** Logo keys for a diagram label, in the order the brands are listed in LOGOS. */
export function logosFor(label) {
  const keys = Object.keys(LOGOS).filter((k) => LOGOS[k].match.test(label));
  const specific = (list) => keys.some((k) => list.includes(k));
  return keys.filter((k) => !(k === "aws" && specific(AWS_SERVICES)) && !(k === "azure" && specific(AZURE_SERVICES)));
}

/**
 * How to draw a logo: a file URL, a simple-icons path, or a text badge.
 * `context` is "diagram" (case study detail picture) or "card" (simple-icons brands only).
 */
export function logoSource(key, context = "diagram") {
  const meta = LOGOS[key];
  const icon = ICONS[key];
  const url = context === "diagram" ? fileFor(key) : null;
  if (url) return { type: "file", url, name: meta.name };
  if (icon) return { type: "icon", path: icon.path, hex: "#" + icon.hex, name: meta.name };
  const short = context === "diagram" ? meta.short || meta.name : "";
  return { type: "text", name: meta.name, short, kind: meta.kind };
}
