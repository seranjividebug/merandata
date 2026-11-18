// Checks the built HTML in dist/ the way a crawler sees it (no JavaScript is run):
// headings, landmarks, image alt text, links, head tags and JSON-LD. Exits 1 on errors.
//   node scripts/check-html.mjs            print a summary and any problems
//   node scripts/check-html.mjs --write    also write docs/LINK_INVENTORY.md and docs/IMAGE_ALT.md
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { JSDOM } from "jsdom";

const DIST = "dist";
const ORIGIN = "https://meridanta.com";
const WRITE = process.argv.includes("--write");

/** Every page: dist/index.html, dist/<route>/index.html (404.html is checked separately). */
function listPages(dir = DIST, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== "assets") listPages(p, out); }
    else if (name === "index.html" || (dir === DIST && name === "404.html")) out.push(p);
  }
  return out;
}
const urlOf = (file) => {
  const rel = relative(DIST, file).split(sep).join("/");
  if (rel === "404.html") return "/404";
  return "/" + rel.replace(/index\.html$/, "");
};

const pages = new Map();
for (const file of listPages()) {
  const html = readFileSync(file, "utf8");
  pages.set(urlOf(file), { file, html, doc: new JSDOM(html).window.document });
}

const errors = [];
const warnings = [];
const err = (page, msg) => errors.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);
const text = (el) => el.textContent.replace(/\s+/g, " ").trim();

// ---------- headings, landmarks ----------
const outlines = new Map();
for (const [url, { doc }] of pages) {
  const heads = [...doc.querySelectorAll("h1,h2,h3,h4,h5,h6")];
  outlines.set(url, heads.map((h) => ({ level: +h.tagName[1], text: text(h) })));
  const h1 = heads.filter((h) => h.tagName === "H1");
  if (h1.length !== 1) err(url, `${h1.length} <h1> elements (need exactly 1)`);
  else if (text(h1[0]).length < 3) err(url, "empty <h1>");
  let prev = 0;
  for (const h of heads) {
    const lvl = +h.tagName[1];
    if (prev && lvl > prev + 1) warn(url, `heading level jumps from h${prev} to h${lvl}: "${text(h).slice(0, 50)}"`);
    if (!text(h)) err(url, `empty <${h.tagName.toLowerCase()}>`);
    prev = lvl;
  }
  for (const tag of ["header", "nav", "main", "footer"]) if (!doc.querySelector(tag)) err(url, `missing <${tag}>`);
  if (doc.querySelectorAll("main").length !== 1) err(url, "need exactly one <main>");
  for (const s of doc.querySelectorAll("section")) {
    const label = s.getAttribute("aria-labelledby");
    if (!label && !s.getAttribute("aria-label")) warn(url, `<section> without an accessible name near "${text(s).slice(0, 40)}"`);
    else if (label && !doc.getElementById(label)) err(url, `aria-labelledby="${label}" points to a missing id`);
  }
  if (doc.documentElement.lang !== "en") err(url, "html lang is not en");
  const ids = new Set();
  for (const el of doc.querySelectorAll("[id]")) { if (ids.has(el.id)) err(url, `duplicate id "${el.id}"`); ids.add(el.id); }
}

// ---------- images ----------
const images = [];
for (const [url, { doc }] of pages) {
  for (const img of doc.querySelectorAll("img")) {
    const alt = img.getAttribute("alt");
    const src = img.getAttribute("src") || "";
    images.push({ page: url, src: src.startsWith("data:") ? "(inline image)" : src, alt, kind: "img" });
    if (alt === null) err(url, `<img> without alt attribute: ${src.slice(0, 60)}`);
    if (alt && /\.(png|webp|jpe?g|svg)$/i.test(alt)) err(url, `alt looks like a file name: ${alt}`);
  }
  for (const svg of doc.querySelectorAll('svg[role="img"]')) {
    const label = svg.getAttribute("aria-label") || svg.querySelector("title")?.textContent;
    images.push({ page: url, src: "(inline svg)", alt: label ?? null, kind: "svg" });
    if (!label) err(url, "svg with role=img but no label");
  }
}

// ---------- links ----------
const appHash = (page, id) => {
  const prefixes = { "case-": ["ck-title-", "ck-text-"], "accelerator-": ["ax-panel-"] };
  for (const [prefix, targets] of Object.entries(prefixes)) {
    if (id.startsWith(prefix)) return targets.some((t) => page.doc.getElementById(t + id.slice(prefix.length)));
  }
  return null;
};
const resolvePage = (path) => pages.get(path.endsWith("/") ? path : path + "/") ?? pages.get(path);
const links = [];
for (const [url, page] of pages) {
  for (const a of page.doc.querySelectorAll("a[href]")) {
    const href = a.getAttribute("href");
    const row = { page: url, href, label: text(a).slice(0, 50) || a.getAttribute("aria-label") || "(icon)", type: "internal", status: "ok" };
    links.push(row);
    if (href === "#") { row.status = "PLACEHOLDER"; warn(url, `placeholder link "#" (${row.label})`); continue; }
    if (/^(mailto|tel):/.test(href)) { row.type = "contact"; continue; }
    if (/^https?:\/\//.test(href) && !href.startsWith(ORIGIN)) {
      row.type = "external";
      const rel = (a.getAttribute("rel") || "").split(/\s+/);
      if (a.getAttribute("target") === "_blank" && !(rel.includes("noopener") && rel.includes("noreferrer"))) { row.status = "NO REL"; err(url, `external link without rel="noopener noreferrer": ${href}`); }
      continue;
    }
    const u = new URL(href, ORIGIN + url);
    if (!href.startsWith("#") && u.pathname !== "/" && !u.pathname.endsWith("/") && !/\.[a-z0-9]+$/i.test(u.pathname)) { row.status = "NO SLASH"; err(url, `link ${href} should end with a slash (canonical form), text "${row.label}"`); }
    const target = href.startsWith("#") ? page : resolvePage(u.pathname);
    const targetPath = u.pathname || url;
    if (!target && !existsSync(join(DIST, u.pathname))) { row.status = "BROKEN"; err(url, `link to missing page ${u.pathname} (${row.label})`); continue; }
    if (u.hash) {
      const id = decodeURIComponent(u.hash.slice(1));
      const t = target ?? page;
      const deep = appHash(t, id);
      if (deep === false) { row.status = "BROKEN ANCHOR"; err(url, `deep link ${href} has no matching content`); }
      else if (deep === null && !t.doc.getElementById(id)) { row.status = "BROKEN ANCHOR"; err(url, `anchor #${id} not found on ${targetPath} (${row.label})`); }
    }
  }
}

// ---------- calls to action ----------
const CTA = /^(get in touch|talk to|discuss|start with a free consultation|contact)/i;
for (const l of links) {
  if (CTA.test(l.label) && !/#contact$/.test(l.href)) { l.status = "CTA"; err(l.page, `call to action "${l.label}" does not lead to the contact form (${l.href})`); }
}

// ---------- head tags and JSON-LD ----------
const REQUIRED_TYPES = { "/": ["Organization", "WebSite", "WebPage", "Service"], "/qlik/": ["Organization", "WebPage", "BreadcrumbList", "ItemList", "Service"] };
const ldReport = new Map();
for (const [url, { doc }] of pages) {
  if (url === "/404") continue;
  const title = doc.querySelector("title")?.textContent ?? "";
  const desc = doc.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
  if (title.length < 50 || title.length > 60) warn(url, `title is ${title.length} chars`);
  if (desc.length < 140 || desc.length > 160) warn(url, `description is ${desc.length} chars`);
  const canon = [...doc.querySelectorAll('link[rel="canonical"]')];
  if (canon.length !== 1 || canon[0].href !== ORIGIN + url) err(url, `canonical is ${canon.map((c) => c.href).join(",") || "missing"}, expected ${ORIGIN + url}`);
  const blocks = [...doc.querySelectorAll('script[type="application/ld+json"]')];
  const nodes = [];
  for (const b of blocks) {
    try { const j = JSON.parse(b.textContent); nodes.push(...(j["@graph"] ?? [j])); }
    catch (e) { err(url, `invalid JSON-LD: ${e.message}`); }
  }
  ldReport.set(url, nodes);
  const ids = new Set(nodes.map((n) => n["@id"]).filter(Boolean));
  const types = nodes.map((n) => n["@type"]);
  for (const t of REQUIRED_TYPES[url] ?? ["Organization", "WebPage", "BreadcrumbList"]) if (!types.includes(t)) err(url, `JSON-LD is missing ${t}`);
  const seen = new Set();
  for (const n of nodes) {
    if (n["@id"]) { if (seen.has(n["@id"])) err(url, `duplicate JSON-LD @id ${n["@id"]}`); seen.add(n["@id"]); }
    if (/^(Organization|WebSite|Service|WebPage)$/.test(n["@type"]) && !n.name) err(url, `JSON-LD ${n["@type"]} without name`);
    if (n["@type"] === "Service" && !n.provider) err(url, `JSON-LD Service "${n.name}" without provider`);
    if (n["@type"] === "BreadcrumbList") n.itemListElement.forEach((it, i) => { if (it.position !== i + 1 || !it.name || !it.item) err(url, "BreadcrumbList item malformed"); });
    if (n["@type"] === "ItemList" && n.numberOfItems !== n.itemListElement.length) err(url, "ItemList numberOfItems mismatch");
    if (n["@type"] === "FAQPage" && !doc.querySelector("[data-faq]")) err(url, "FAQPage JSON-LD without a visible FAQ on the page");
    const json = JSON.stringify(n);
    for (const u of json.matchAll(/"(https?:\/\/[^"]+)"/g)) if (u[1].slice(8).includes("//")) err(url, `JSON-LD URL has a double slash: ${u[1]}`);
    if (/"[a-zA-Z]+":""/.test(json)) err(url, `JSON-LD ${n["@type"]} has an empty value`);
    for (const m of json.matchAll(/"@id":"([^"]+)"/g)) { /* ids defined here */ }
    const refs = [...json.matchAll(/"(?:provider|publisher|isPartOf|about|parentOrganization|mainEntityOfPage|breadcrumb)":\{"@id":"([^"]+)"\}/g)].map((m) => m[1]);
    for (const r of refs) if (!ids.has(r)) err(url, `JSON-LD reference ${r} is not defined on the page`);
  }
}

// ---------- sitemap, robots and llms files use the canonical host ----------
for (const file of ["sitemap.xml", "robots.txt", "llms.txt", "llms-full.txt"]) {
  const text = readFileSync(join(DIST, file), "utf8");
  for (const m of text.matchAll(/https?:\/\/[^\s<>"')]+/g)) {
    const url = m[0].replace(/[.,;:]+$/, "");
    if (url !== ORIGIN && !url.startsWith(ORIGIN + "/") && !/^https?:\/\/(www\.sitemaps\.org|schema\.org)/.test(url)) err(file, `URL not on ${ORIGIN}: ${url}`);
  }
}

// ---------- report ----------
console.log(`Checked ${pages.size} pages: ${[...pages.keys()].join("  ")}`);
for (const [url, o] of outlines) {
  console.log(`\n${url}  (h1: ${o.filter((h) => h.level === 1).length}, headings: ${o.length}, JSON-LD nodes: ${ldReport.get(url)?.length ?? 0})`);
}
console.log(`\nImages: ${images.length} (${images.filter((i) => i.alt === "").length} decorative, ${images.filter((i) => i.alt === null).length} missing alt)`);
console.log(`Links: ${links.length} (${links.filter((l) => l.type === "external").length} external, ${links.filter((l) => l.status !== "ok").length} with problems)`);
warnings.forEach((w) => console.log("WARN  " + w));
errors.forEach((e) => console.log("ERROR " + e));
console.log(`\n${errors.length} errors, ${warnings.length} warnings`);

if (WRITE) {
  mkdirSync("docs", { recursive: true });
  const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  const today = new Date().toISOString().slice(0, 10);
  const imgRows = images.map((i) => `| ${i.page} | ${i.kind} | ${cell(i.src)} | ${i.alt === "" ? "(decorative, empty alt)" : i.alt === null ? "**MISSING**" : cell(i.alt)} |`);
  writeFileSync("docs/IMAGE_ALT.md", `# Image inventory and alt text\n\nGenerated by \`node scripts/check-html.mjs --write\` from the built HTML (${today}). ${images.length} images across ${pages.size} pages.\n\n| Page | Type | Source | Alt text |\n|---|---|---|---|\n${imgRows.join("\n")}\n`);
  const linkRows = links.map((l) => `| ${l.page} | ${cell(l.label)} | ${cell(l.href)} | ${l.type} | ${l.status} |`);
  writeFileSync("docs/LINK_INVENTORY.md", `# Link inventory\n\nGenerated by \`node scripts/check-html.mjs --write\` from the built HTML (${today}). ${links.length} links across ${pages.size} pages. Status "ok" means the target page exists and the anchor or deep link resolves.\n\n| Page | Link text | Target | Type | Status |\n|---|---|---|---|---|\n${linkRows.join("\n")}\n`);
  console.log("Wrote docs/IMAGE_ALT.md and docs/LINK_INVENTORY.md");
}
process.exit(errors.length ? 1 : 0);
