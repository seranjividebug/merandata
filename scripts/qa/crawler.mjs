// Fetches every page the way a crawler does (plain HTTP, no JavaScript) and checks what it can read.
import { JSDOM } from "jsdom";
const BASE = process.env.BASE || "http://localhost:8090";
const ORIGIN = "https://meridanta.com";
let fails = 0;
const ok = (c, msg) => { if (!c) fails++; console.log((c ? "PASS " : "FAIL ") + msg); };
const get = async (path, headers = {}) => { const r = await fetch(BASE + path, { redirect: "manual", headers: { "User-Agent": "Mozilla/5.0 (compatible; GPTBot/1.1)", ...headers } }); return { r, text: await r.text() }; };

const pages = [
  ["/", { must: ["Meridanta", "Consulting & Delivery", "Industries We Serve", "About Meridanta", "Healthcare"], articles: 0 }],
  ["/qlik/", { must: ["Data Replication (CDC)", "Talend ETL", "Prometheus Integration", "Qlik Log Scraping", "250 SQL Server Databases to Azure Synapse", "trademarks of their respective owners"], articles: 20 }],
  ["/industries/healthcare/", { must: ["Industry challenges", "Technology opportunities", "Our capabilities"], articles: 0 }],
  ["/industries/communications-media-entertainment/", { must: ["Industry challenges", "Technology opportunities", "Our capabilities"], articles: 0 }],
  ["/privacy/", { must: ["What we collect", "Why we use it", "do not sell your personal information", "srivatsans@meridanta.com"], articles: 0, minText: 800 }],
];
console.log("== raw HTML per route (no JavaScript, crawler user agent)");
for (const [path, spec] of pages) {
  const { r, text } = await get(path);
  const d = new JSDOM(text).window.document;
  d.querySelectorAll("script:not([type='application/ld+json']),style,svg").forEach((e) => e.remove());
  const body = d.body.textContent.replace(/\s+/g, " ");
  const h1 = [...d.querySelectorAll("h1")];
  const ld = [...d.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { return JSON.parse(s.textContent); } catch { return null; } });
  const types = ld.flatMap((j) => (j && j["@graph"]) || []).map((n) => n["@type"]);
  const caseArticles = text.match(/ck-(title|text)-[a-z0-9-]+/g) ? new Set(text.match(/ck-(title|text)-[a-z0-9-]+/g).map((x) => x.replace(/^ck-(title|text)-/, "").replace(/-(tab|pane).*$/, ""))).size : 0;
  const missing = spec.must.filter((t) => !body.includes(t));
  const canon = d.querySelector('link[rel="canonical"]')?.getAttribute("href");
  const good = r.status === 200 && h1.length === 1 && !missing.length && ld.every(Boolean) && types.includes("Organization") && types.includes("WebPage") && canon === ORIGIN + path && (!spec.articles || caseArticles >= spec.articles) && body.length > (spec.minText || 2000);
  ok(good, `${path.padEnd(48)} ${r.status} h1="${h1[0]?.textContent.trim().slice(0, 36)}" text=${body.length} chars JSON-LD=[${[...new Set(types)].join(",")}] canonical=${canon === ORIGIN + path ? "ok" : canon}${spec.articles ? " cases=" + caseArticles : ""}${missing.length ? " MISSING: " + missing.join("; ") : ""}`);
}
{
  const { r, text } = await get("/this-page-does-not-exist");
  const d = new JSDOM(text).window.document;
  ok(r.status === 404 && /not found/i.test(d.querySelector("h1")?.textContent || "") && d.querySelector('meta[name="robots"]')?.getAttribute("content") === "noindex", `unknown URL -> ${r.status}, "Page not found" h1, noindex`);
}

console.log("== robots.txt, sitemap.xml, llms.txt, llms-full.txt");
{
  const { r, text } = await get("/robots.txt");
  const groups = text.split(/\n\s*\n/).filter((g) => /User-agent/i.test(g));
  const agents = [...text.matchAll(/^User-agent:\s*(.+)$/gim)].map((m) => m[1].trim());
  const need = ["*", "Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "GPTBot", "PerplexityBot", "Perplexity-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "Google-Extended", "Applebot", "Applebot-Extended", "DuckDuckBot", "Amazonbot"];
  const missingAgents = need.filter((a) => !agents.includes(a));
  const blocked = [...text.matchAll(/^Disallow:\s*\/\s*$/gim)].length;
  ok(r.status === 200 && /text\/plain/.test(r.headers.get("content-type")) && !missingAgents.length && blocked === 0 && text.includes(`Sitemap: ${ORIGIN}/sitemap.xml`), `robots.txt ${r.status} ${r.headers.get("content-type")} agents=${agents.length} groups=${groups.length} missing=[${missingAgents}] disallow-all=${blocked} sitemap-line=${text.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)}`);
}
{
  const { r, text } = await get("/sitemap.xml");
  const xml = new JSDOM(text, { contentType: "text/xml" }).window.document;
  const urls = [...xml.querySelectorAll("url")].map((u) => ({ loc: u.querySelector("loc").textContent, lastmod: u.querySelector("lastmod")?.textContent }));
  const parsed = !xml.querySelector("parsererror");
  let all200 = true;
  for (const u of urls) { const path = u.loc.replace(ORIGIN, ""); const { r: rr } = await get(path); if (rr.status !== 200) all200 = false; }
  ok(r.status === 200 && parsed && urls.length === 5 && urls.every((u) => u.loc.startsWith(ORIGIN + "/") && /^\d{4}-\d{2}-\d{2}$/.test(u.lastmod || "")) && all200, `sitemap.xml ${r.status} ${r.headers.get("content-type")} valid-xml=${parsed} urls=${urls.length} all-return-200=${all200} lastmod=${urls.map((u) => u.lastmod).join(",")}`);
}
for (const f of ["/llms.txt", "/llms-full.txt"]) {
  const { r, text } = await get(f);
  const links = [...text.matchAll(/\]\((https:\/\/meridanta\.com[^)\s]*)\)/g)].map((m) => m[1]);
  let bad = [];
  for (const l of new Set(links)) { const path = l.replace(ORIGIN, "").split("#")[0] || "/"; const { r: rr } = await get(path); if (rr.status !== 200) bad.push(l); }
  ok(r.status === 200 && /text\/plain/.test(r.headers.get("content-type")) && text.startsWith("# ") && text.length > 1500 && !bad.length, `${f} ${r.status} ${r.headers.get("content-type")} ${text.length} chars, ${new Set(links).size} links checked, broken=[${bad}]`);
}
console.log("== other public files");
for (const f of ["/site.webmanifest", "/favicon.ico", "/og-image.png", "/apple-touch-icon.png", "/api/contact.php"]) {
  const { r } = await get(f);
  console.log(`INFO ${f.padEnd(24)} ${r.status} ${r.headers.get("content-type")} (static test server; on Hostinger /api/contact.php answers 405 to GET)`);
}
console.log(`\n${fails} failure(s)`);
process.exit(fails ? 1 : 0);
