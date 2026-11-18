// Checks the claims made about the website against the data files and the BUILT output in dist/.
//   npm run build && node scripts/verify-claims.mjs
// Prints one evidence block per claim. Exits 1 when a check fails.
import { readFileSync, existsSync } from "node:fs";
import { createServer } from "vite";
import { JSDOM } from "jsdom";

const server = await createServer({ configFile: false, appType: "custom", logLevel: "silent", server: { middlewareMode: true } });
const load = (p) => server.ssrLoadModule(p);
const [data, qlik, cases, accs, company, seo] = await Promise.all(["/src/data.js", "/src/qlikData.js", "/src/caseStudies.js", "/src/accelerators.js", "/src/company.js", "/src/seo.js"].map(load));
await server.close();

const ORIGIN = "https://meridanta.com";
const PAGES = { "/": "dist/index.html", "/qlik/": "dist/qlik/index.html", "/industries/healthcare/": "dist/industries/healthcare/index.html", "/industries/communications-media-entertainment/": "dist/industries/communications-media-entertainment/index.html" };
const html = Object.fromEntries(Object.entries(PAGES).map(([u, f]) => [u, readFileSync(f, "utf8")]));
const doc = Object.fromEntries(Object.entries(html).map(([u, h]) => [u, new JSDOM(h).window.document]));
const dec = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const textOf = (u) => { const c = doc[u].body.cloneNode(true); c.querySelectorAll("script,style,svg").forEach((e) => e.remove()); return dec(c.textContent.replace(/\s+/g, " ")); };
let fails = 0;
const ok = (c, msg) => { if (!c) fails++; console.log((c ? "  PASS " : "  FAIL ") + msg); };
const found = (arr, hay, f) => arr.filter((x) => hay.includes(f(x))).length;
const published = cases.caseStudies.filter((c) => c.published);

console.log("CLAIM 1: full content in the built HTML (not only the active slide or tab)");
{
  const home = textOf("/"), q = textOf("/qlik/");
  const rows = [
    ["home: hero slides", data.HERO_SLIDES.length, found(data.HERO_SLIDES, home, (s) => s.title)],
    ["home: services", data.SERVICES.length, found(data.SERVICES, home, (s) => s.title)],
    ["home: service bullet items", data.SERVICES.flatMap((s) => s.items).length, found(data.SERVICES.flatMap((s) => s.items), home, (s) => s)],
    ["home: industry cards", data.INDUSTRIES.length, found(data.INDUSTRIES, home, (s) => s.cardTitle)],
    ["/qlik: capabilities", qlik.QLIK_CAPABILITIES.length, found(qlik.QLIK_CAPABILITIES, q, (s) => s.title)],
    ["/qlik: capability bullets", qlik.QLIK_CAPABILITIES.flatMap((c) => c.bullets).length, found(qlik.QLIK_CAPABILITIES.flatMap((c) => c.bullets), q, (s) => s)],
    ["/qlik: service offerings", qlik.QLIK_OFFERINGS.length, found(qlik.QLIK_OFFERINGS, q, (s) => s.title)],
    ["/qlik: accelerators", accs.accelerators.length, found(accs.accelerators, q, (s) => s.title)],
    ["/qlik: accelerator challenge text", accs.accelerators.length, found(accs.accelerators, q, (s) => s.challenge)],
    ["/qlik: accelerator solution bullets", accs.accelerators.flatMap((a) => a.solution).length, found(accs.accelerators.flatMap((a) => a.solution), q, (s) => s)],
    ["/qlik: accelerator benefits", accs.accelerators.flatMap((a) => a.benefits).length, found(accs.accelerators.flatMap((a) => a.benefits), q, (s) => s)],
    ["/qlik: published case studies (title)", published.length, found(published, q, (s) => s.title)],
    ["/qlik: case summaries", published.length, found(published, q, (s) => s.summary)],
    ["/qlik: case challenge/solution/outcome/result bullets", published.flatMap((c) => [...c.challenge, ...c.solution, ...c.outcome, ...c.result]).length, found(published.flatMap((c) => [...c.challenge, ...c.solution, ...c.outcome, ...c.result]), q, (s) => s)],
  ];
  for (const [label, want, got] of rows) ok(want === got, `${label.padEnd(54)} ${got}/${want}`);
  for (const d of data.INDUSTRIES) {
    const t = textOf(`/industries/${d.slug}/`);
    ok([d.ch, d.op, d.ca].every((x) => t.includes(x)), `/industries/${d.slug}/: challenges, opportunities and capabilities text present`);
  }
  const hiddenPanels = (html["/qlik/"].match(/class="ax-panel[^"]*" hidden/g) || []).length;
  const archive = (html["/qlik/"].match(/<div class="ck-archive" hidden>[\s\S]*?<\/div><\/div>/) || [""])[0];
  ok(hiddenPanels === 4, `/qlik: ${hiddenPanels} inactive accelerator panels are in the HTML (hidden attribute)`);
  ok((html["/qlik/"].match(/ck-text-/g) || []).length >= 19, `/qlik: ${(html["/qlik/"].match(/id="ck-text-/g) || []).length} case studies as text-only articles + 1 full panel = ${published.length}`);
  ok((html["/"].match(/class="hs-slide/g) || []).length === 3, "home: 3 hero slides in the HTML");
}

console.log("CLAIM 2: unique title, description, canonical, Open Graph and Twitter tags with an og:image");
{
  const rowsSeen = { title: new Set(), description: new Set(), canonical: new Set() };
  for (const [u, d] of Object.entries(doc)) {
    const m = (sel, attr = "content") => d.querySelector(sel)?.getAttribute(attr) ?? "";
    const title = d.querySelector("title")?.textContent ?? "", desc = m('meta[name="description"]'), canon = m('link[rel="canonical"]', "href");
    const og = ["og:title", "og:description", "og:url", "og:image", "og:type", "og:site_name"].map((p) => [p, m(`meta[property="${p}"]`)]);
    const tw = ["twitter:card", "twitter:title", "twitter:description", "twitter:image"].map((p) => [p, m(`meta[name="${p}"]`)]);
    const imgFile = "dist" + new URL(m('meta[property="og:image"]')).pathname;
    rowsSeen.title.add(title); rowsSeen.description.add(desc); rowsSeen.canonical.add(canon);
    ok(title && desc && canon === ORIGIN + u && og.every(([, v]) => v) && tw.every(([, v]) => v) && existsSync(imgFile) && m('meta[property="og:image"]').startsWith(ORIGIN + "/"), `${u.padEnd(48)} title(${title.length})  desc(${desc.length})  canonical=${canon}  og:image=${m('meta[property="og:image"]')} (file exists: ${existsSync(imgFile)})  twitter:card=${m('meta[name="twitter:card"]')}`);
  }
  ok(Object.values(rowsSeen).every((s) => s.size === 4), "titles, descriptions and canonicals are all unique across the 4 pages");
}

console.log("CLAIM 3: sitemap.xml, robots.txt (search and AI crawlers) and llms files");
{
  const robots = readFileSync("dist/robots.txt", "utf8");
  const agents = [...robots.matchAll(/^User-agent:\s*(.+)$/gim)].map((m) => m[1].trim());
  const search = ["Googlebot", "Bingbot", "DuckDuckBot", "Applebot"], ai = ["OAI-SearchBot", "ChatGPT-User", "GPTBot", "PerplexityBot", "Perplexity-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "Google-Extended", "Applebot-Extended"];
  ok(search.every((a) => agents.includes(a)) && ai.every((a) => agents.includes(a)), `robots.txt names ${search.length} search crawlers and ${ai.length} AI crawlers; "Disallow: /" lines: ${(robots.match(/^Disallow:\s*\/\s*$/gim) || []).length}; sitemap line: ${robots.includes("Sitemap: " + ORIGIN + "/sitemap.xml")}`);
  const sm = readFileSync("dist/sitemap.xml", "utf8");
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  ok(locs.length === 4 && locs.every((l) => l.startsWith(ORIGIN + "/")) && Object.keys(PAGES).every((u) => locs.includes(ORIGIN + u)), `sitemap.xml: ${locs.length} URLs: ${locs.map((l) => l.replace(ORIGIN, "")).join(", ")}`);
  const l1 = readFileSync("dist/llms.txt", "utf8"), l2 = readFileSync("dist/llms-full.txt", "utf8");
  ok(l1.startsWith("# Meridanta") && l1.includes(ORIGIN + "/qlik/") && l1.includes("Registered Office") && l2.includes("Qlik Log Scraping") && published.every((c) => l2.includes(c.title)), `llms.txt ${l1.length} chars (starts "${l1.split("\n")[0]}"), llms-full.txt ${l2.length} chars incl. all ${published.length} case studies`);
}

console.log("CLAIM 4: JSON-LD types per page");
{
  const want = { "/": ["Organization", "WebSite", "WebPage", "Service"], "/qlik/": ["Organization", "WebSite", "WebPage", "Service", "BreadcrumbList", "ItemList"], "/industries/healthcare/": ["Organization", "WebSite", "WebPage", "BreadcrumbList"], "/industries/communications-media-entertainment/": ["Organization", "WebSite", "WebPage", "BreadcrumbList"] };
  for (const [u, types] of Object.entries(want)) {
    const blocks = [...doc[u].querySelectorAll('script[type="application/ld+json"]')];
    let graph = [];
    let valid = true;
    for (const b of blocks) { try { graph = graph.concat(JSON.parse(b.textContent)["@graph"]); } catch { valid = false; } }
    const have = [...new Set(graph.map((n) => n["@type"]))];
    ok(valid && types.every((t) => have.includes(t)), `${u.padEnd(48)} valid JSON: ${valid}; types: ${have.join(", ")}${u === "/" ? "; no BreadcrumbList on the home page: " + !have.includes("BreadcrumbList") : ""}`);
  }
}

console.log("CLAIM 7: registered office and email (footer and Organization JSON-LD)");
{
  const line = company.addressLine();
  for (const u of Object.keys(PAGES)) {
    const f = doc[u].querySelector("footer");
    const txt = dec(f.textContent.replace(/\s+/g, " "));
    ok(txt.includes("Registered Office:") && txt.includes(line) && !!f.querySelector('a[href="mailto:srivatsans@meridanta.com"]'), `${u.padEnd(48)} footer: "Registered Office: ${line}" and mailto link`);
  }
  const g = JSON.parse(doc["/"].querySelector('script[type="application/ld+json"]').textContent)["@graph"].find((n) => n["@type"] === "Organization");
  ok(g.email === "srivatsans@meridanta.com" && g.address.streetAddress === "262 Chapman Rd, Ste 240" && g.address.postalCode === "19702" && g.location?.name === "Registered Office", `Organization JSON-LD: email=${g.email}; address=${JSON.stringify(g.address)}; location.name="${g.location?.name}"`);
}

console.log(`\n${fails} failed check(s)`);
process.exit(fails ? 1 : 0);
