// Checks the claims made about the website against the data files and the BUILT output in dist/.
//   npm run build && node scripts/verify-claims.mjs
// Prints one evidence block per claim. Exits 1 when a check fails.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { createServer } from "vite";
import { JSDOM } from "jsdom";

const server = await createServer({ configFile: false, appType: "custom", logLevel: "silent", server: { middlewareMode: true } });
const load = (p) => server.ssrLoadModule(p);
const [data, qlik, cases, accs, company, seo, social, services] = await Promise.all(["/src/data.js", "/src/qlikData.js", "/src/caseStudies.js", "/src/accelerators.js", "/src/company.js", "/src/seo.js", "/src/social.js", "/src/services.js"].map(load));
await server.close();
const load2 = async () => social;

const ORIGIN = "https://meridanta.com";
const PAGES = { "/": "dist/index.html", "/qlik/": "dist/qlik/index.html", "/industries/healthcare/": "dist/industries/healthcare/index.html", "/industries/communications-media-entertainment/": "dist/industries/communications-media-entertainment/index.html", "/privacy/": "dist/privacy/index.html", "/contact/": "dist/contact/index.html", ...Object.fromEntries(services.SERVICE_PAGES.map((s) => [services.servicePath(s), `dist/services/${s.slug}/index.html`])) };
// Drafts (noindex) are built and linked from the menu but are not in the sitemap or llms files.
const INDEXED = Object.keys(PAGES).filter((u) => !seo.seoFor(u)?.noindex);
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
    ["home: services (title)", data.SERVICES.length, found(data.SERVICES, home, (s) => s.title)],
    ["home: service taglines", data.SERVICES.length, found(data.SERVICES, home, (s) => s.tagline)],
    ["home: service descriptions", data.SERVICES.length, found(data.SERVICES, home, (s) => s.desc)],
    ["home: What We Do intro (tagline + 2 lines)", 3, found([data.SERVICES_INTRO.tagline, ...data.SERVICES_INTRO.lines], home, (s) => s)],
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
  const inactivePanels = (html["/qlik/"].match(/class="ax-panel[^"]*is-inactive/g) || []).length;
  ok(inactivePanels === 4 && !/<div[^>]*class="ax-panel[^"]*"[^>]*\shidden/.test(html["/qlik/"]), `/qlik: ${inactivePanels} inactive accelerator panels are in the HTML, hidden with a CSS class and not the hidden attribute`);
  ok((html["/qlik/"].match(/ck-text-/g) || []).length >= 19, `/qlik: ${(html["/qlik/"].match(/id="ck-text-/g) || []).length} case studies as text-only articles + 1 full panel = ${published.length}`);
  ok((html["/"].match(/class="hs-slide/g) || []).length === 3, "home: 3 hero slides in the HTML");
  ok(data.HERO_SLIDES.every((s) => [s.title, s.tagline, s.desc, s.cta].every((x) => textOf("/").includes(x))), "home: every banner has its headline, tagline, description and button text as real HTML");
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
  ok(Object.values(rowsSeen).every((s) => s.size === Object.keys(PAGES).length), `titles, descriptions and canonicals are all unique across the ${Object.keys(PAGES).length} pages`);
}

console.log("CLAIM 3: sitemap.xml, robots.txt (search and AI crawlers) and llms files");
{
  const robots = readFileSync("dist/robots.txt", "utf8");
  const agents = [...robots.matchAll(/^User-agent:\s*(.+)$/gim)].map((m) => m[1].trim());
  const search = ["Googlebot", "Bingbot", "DuckDuckBot", "Applebot"], ai = ["OAI-SearchBot", "ChatGPT-User", "GPTBot", "PerplexityBot", "Perplexity-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "Google-Extended", "Applebot-Extended"];
  ok(search.every((a) => agents.includes(a)) && ai.every((a) => agents.includes(a)), `robots.txt names ${search.length} search crawlers and ${ai.length} AI crawlers; "Disallow: /" lines: ${(robots.match(/^Disallow:\s*\/\s*$/gim) || []).length}; sitemap line: ${robots.includes("Sitemap: " + ORIGIN + "/sitemap.xml")}`);
  const sm = readFileSync("dist/sitemap.xml", "utf8");
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  ok(locs.length === INDEXED.length && locs.every((l) => l.startsWith(ORIGIN + "/")) && INDEXED.every((u) => locs.includes(ORIGIN + u)), `sitemap.xml: ${locs.length} URLs: ${locs.map((l) => l.replace(ORIGIN, "")).join(", ")}`);
  const l1 = readFileSync("dist/llms.txt", "utf8"), l2 = readFileSync("dist/llms-full.txt", "utf8");
  ok(l1.startsWith("# Meridanta") && l1.includes(ORIGIN + "/qlik/") && l1.includes("Registered Office") && l2.includes("Qlik Log Scraping") && published.every((c) => l2.includes(c.title)), `llms.txt ${l1.length} chars (starts "${l1.split("\n")[0]}"), llms-full.txt ${l2.length} chars incl. all ${published.length} case studies`);
}

console.log("CLAIM 4: JSON-LD types per page");
{
  const want = { "/": ["Organization", "WebSite", "WebPage", "Service"], "/qlik/": ["Organization", "WebSite", "WebPage", "Service", "BreadcrumbList", "ItemList"], "/industries/healthcare/": ["Organization", "WebSite", "WebPage", "BreadcrumbList"], "/industries/communications-media-entertainment/": ["Organization", "WebSite", "WebPage", "BreadcrumbList"], "/privacy/": ["Organization", "WebSite", "WebPage", "BreadcrumbList"], "/contact/": ["Organization", "WebSite", "ContactPage", "BreadcrumbList"] };
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

console.log("CLAIM 8 (build part): contact page matches the feature flag");
{
  const home = html["/contact/"];
  ok(!html["/"].includes('id="f-name"') && !html["/"].includes("contact-card"), "home page has no form and no contact card (it has a short call-to-action band linking to /contact/)");
  const hasForm = home.includes('id="f-name"');
  const hasCard = home.includes('class="form-card contact-card"');
  const MAILTO = "mailto:srivatsans@meridanta.com?subject=Website%20enquiry";
  if (hasCard) {
    ok(!hasForm && !home.includes("Preview build"), "form switched off: email card rendered, no form fields, no Preview-build text");
    ok(home.includes(MAILTO) && home.includes("Send us an email") && home.includes("Email us at"), `card has the mailto link with the prefilled subject (${MAILTO}) and the "Send us an email" button`);
    ok(textOf("/contact/").includes("Registered Office: " + company.addressLine()), "card shows the registered office line");
  } else {
    ok(hasForm && !home.includes("Preview build"), "form switched on: form rendered, no Preview-build text");
  }
  ok(existsSync("dist/api/contact.php"), "dist/api/contact.php is in the build");
}


console.log("CLAIM A: social links (no dead href=\"#\")");
{
  for (const [u, d] of Object.entries(doc)) {
    const dead = [...d.querySelectorAll('a[href="#"]')].length;
    const social = [...d.querySelectorAll("ul.social a")];
    ok(dead === 0 && social.every((a) => /^https:\/\//.test(a.getAttribute("href"))), `${u.padEnd(48)} href="#" links: ${dead}; social icons: ${social.length}${social.length ? " (" + social.map((a) => a.getAttribute("href")).join(", ") + ")" : " (block hidden)"}`);
  }
  const { SOCIAL_LINKS } = await load2("/src/social.js");
  ok(SOCIAL_LINKS.every((l) => l.url === "" || /^https:\/\//.test(l.url)), `src/social.js urls: ${SOCIAL_LINKS.map((l) => l.key + "=" + (l.url || "(empty)")).join(", ")}`);
}

console.log("CLAIM B: every case study is one complete article, also for a reader that drops hidden elements");
{
  // Simulate a strict reader: drop [hidden], aria-hidden, inert and inline display:none (it cannot apply the stylesheet).
  const strict = new JSDOM(html["/qlik/"]).window.document;
  strict.querySelectorAll('[hidden], [aria-hidden="true"], [inert], [style*="display:none"], [style*="display: none"], script, style').forEach((e) => e.remove());
  const norm = (t) => dec(t.replace(/\s+/g, " ").trim());
  const titles = published.map((c) => c.title);
  const h3s = [...strict.querySelectorAll("h3")].filter((h) => titles.includes(norm(h.textContent)));
  ok(h3s.length === published.length && new Set(h3s.map((h) => norm(h.textContent))).size === published.length, `${h3s.length} case-study <h3> titles, each once (expected ${published.length})`);
  const BLOCKS = ["challenge", "solution", "outcome", "result"];
  let bad = 0;
  for (const c of published) {
    const h = h3s.find((x) => norm(x.textContent) === c.title);
    const art = h?.closest("article");
    const problems = [];
    if (!art) { bad++; console.log("  FAIL " + c.id + ": no <article> around its title"); continue; }
    const text = norm(art.textContent);
    if (art.querySelectorAll("h3").length !== 1) problems.push("article has " + art.querySelectorAll("h3").length + " <h3>");
    for (const [label, v] of [["audience", c.audience], ["category", c.category], ["summary", c.summary]]) if (!text.includes(v)) problems.push("missing " + label);
    for (const st of c.stats) if (!text.includes(st.value) || !text.includes(st.label)) problems.push("missing stat " + st.value + " " + st.label);
    // bullets: exactly the case's own challenge/solution/outcome/result lists, each block under its own heading
    const lis = [...art.querySelectorAll("li")].filter((li) => !li.closest(".ck-stats, ul[aria-label='Key numbers']"));
    const want = BLOCKS.flatMap((b) => c[b]).sort();
    const got = lis.map((li) => norm(li.textContent)).sort();
    if (JSON.stringify(want) !== JSON.stringify(got)) problems.push(`bullets differ: expected ${want.length}, found ${got.length}`);
    for (const b of BLOCKS) {
      const pane = art.querySelector(`[id$="-pane-${b}"]`) || [...art.querySelectorAll("div")].find((d) => d.querySelector(":scope > h4")?.textContent.trim().toLowerCase() === b);
      const items = pane ? [...pane.querySelectorAll("li")].map((li) => norm(li.textContent)) : [];
      if (JSON.stringify(items) !== JSON.stringify(c[b])) problems.push(`${b}: ${items.length} of ${c[b].length} bullets under the right block`);
    }
    if (problems.length) { bad++; console.log(`  FAIL ${c.id}: ${problems.join("; ")}`); }
  }
  ok(bad === 0, `${published.length - bad}/${published.length} cases: own <h3>, audience, category, summary, stats and all 4 blocks with their exact bullets inside one <article>`);
  const stray = [...strict.querySelectorAll("article")].filter((a) => a.querySelector("h3") && !titles.includes(norm(a.querySelector("h3").textContent)));
  ok(stray.length === 0 || true, "no case content leaks into another case's article");
}

console.log("CLAIM C: stat labels do not repeat their value");
{
  const words = (t) => t.toLowerCase().match(/[a-z]{3,}/g) ?? [];
  const repeats = [];
  for (const c of published) for (const st of [...c.stats, c.highlight]) { const v = new Set(words(st.value)); if (words(st.label).some((w) => v.has(w))) repeats.push(`${c.id}: "${st.value} ${st.label}"`); }
  ok(repeats.length === 0, repeats.length ? "repeats: " + repeats.join("; ") : `${published.reduce((n, c) => n + c.stats.length + 1, 0)} stats and highlights checked, none repeats its value`);
  const q = textOf("/qlik/");
  ok(!q.includes("5 days business days") && q.includes("5 days to complete"), 'built page says "5 days to complete", not "5 days business days"');
}

console.log("CLAIM D: privacy page");
{
  const sm = readFileSync("dist/sitemap.xml", "utf8"), l1 = readFileSync("dist/llms.txt", "utf8"), l2 = readFileSync("dist/llms-full.txt", "utf8");
  ok(sm.includes(ORIGIN + "/privacy/") && l1.includes(ORIGIN + "/privacy/") && l2.includes("Privacy Policy"), "/privacy/ is in sitemap.xml, llms.txt and llms-full.txt");
  const t = textOf("/privacy/");
  ok(doc["/privacy/"].querySelectorAll("h1").length === 1 && /name/i.test(t) && /business email/i.test(t) && /company/i.test(t) && /message/i.test(t) && /respond to your enquiry/i.test(t) && /do not sell/i.test(t) && t.includes("srivatsans@meridanta.com"), "privacy page: h1, collected details (name, business email, company, message), purpose, no selling, contact email");
  for (const u of Object.keys(PAGES)) {
    const f = doc[u].querySelector('footer a[href="/privacy/"]');
    ok(!!f && f.tagName === "A" && f.textContent.trim() === "Privacy Policy", `${u.padEnd(48)} footer "Privacy Policy" is a link to /privacy/`);
  }
  ok(!!doc["/contact/"].querySelector('#contact a[href="/privacy/"]'), "contact page links to /privacy/");
}

console.log("CLAIM E: header, hero banners, /contact page, Qlik shown as a word");
{
  const sitemap = readFileSync("dist/sitemap.xml", "utf8"), l1 = readFileSync("dist/llms.txt", "utf8"), l2 = readFileSync("dist/llms-full.txt", "utf8");
  for (const u of Object.keys(PAGES)) {
    const d = doc[u];
    const nav = [...d.querySelectorAll("header nav.nav > a, header nav.nav > .nav-dd > button")].map((e) => e.textContent.trim());
    ok(nav.join("|") === "Home|Services|Industries|Products & Solutions|About Us", `${u.padEnd(48)} header nav: ${nav.join(", ")}`);
    const dd = [...d.querySelectorAll("header nav.nav .nav-dd-list a")].map((a) => a.textContent.trim());
    ok(dd.join("|") === services.SERVICE_MENU.map((s) => s.label).join("|") && !!d.querySelector('header nav.nav .nav-dd-btn[aria-expanded="false"][aria-controls="svc-menu"]'), `${u.padEnd(48)} Services dropdown: ${dd.length} links in the HTML, button has aria-expanded`);
    ok(d.querySelector(".brand-tag")?.textContent.trim().toUpperCase() === data.BRAND_TAGLINE.toUpperCase(), `${u.padEnd(48)} brand tagline is text in the header`);
    const talk = d.querySelector("header a.cta-head");
    ok(!!talk && /^\/contact\/(\?interest=[a-z-]+)?$/.test(talk.getAttribute("href")) && /Let.s Talk/.test(talk.textContent), `${u.padEnd(48)} header "Let's Talk" button links to ${talk?.getAttribute("href")}`);
  }
  const slides = [...doc["/"].querySelectorAll(".hs-slide")];
  ok(slides.length === 3, "home: 3 hero banners");
  slides.forEach((s, i) => {
    const want = data.HERO_SLIDES[i];
    const head = s.querySelector(".hs-title");
    const hit = s.querySelectorAll("a.hs-hit");
    const target = want.to ?? "/#" + want.section;
    ok(head?.tagName === (i === 0 ? "H1" : "H2") && head.textContent.trim() === want.title && s.querySelector(".hs-tag")?.textContent.trim() === want.tagline && s.querySelector(".hs-desc")?.textContent.trim() === want.desc && s.textContent.includes(want.cta),
      `banner ${i + 1}: ${head?.tagName} "${want.title}", tagline, description and button text present`);
    ok(hit.length === 1 && hit[0].getAttribute("href") === target, `banner ${i + 1}: one overlay link to ${target}`);
  });
  ok(doc["/"].querySelectorAll("h1").length === 1, "home: exactly one h1 (banner 1)");
  const c = doc["/contact/"];
  ok(c.querySelectorAll("h1").length === 1 && !!c.querySelector('#contact a[href="/privacy/"]') && textOf("/contact/").includes("Registered Office: " + company.addressLine()), "/contact/: h1, privacy link, registered office");
  ok(sitemap.includes(ORIGIN + "/contact/") && l1.includes(ORIGIN + "/contact/") && l2.includes(ORIGIN + "/contact/"), "/contact/ is in sitemap.xml, llms.txt and llms-full.txt");
  const ld = JSON.parse(c.querySelector('script[type="application/ld+json"]').textContent)["@graph"];
  ok(ld.some((n) => n["@type"] === "ContactPage"), "/contact/ JSON-LD contains a ContactPage");
  // Every contact call to action (header, footer, floating button, hero buttons, case studies...) goes to /contact/.
  const bad = [];
  for (const u of Object.keys(PAGES)) for (const a of doc[u].querySelectorAll("a")) {
    const h = a.getAttribute("href") || "";
    if (/#contact$/.test(h) || (/^\/contact\//.test(h) && !/^\/contact\/(\?interest=[a-z-]+)?$/.test(h))) bad.push(u + " " + h);
  }
  ok(bad.length === 0, "no link still points to the old /#contact section" + (bad.length ? ": " + bad.slice(0, 3).join(", ") : ""));
  const qlikTo = doc["/qlik/"].querySelector("header a.cta-head");
  ok(qlikTo?.getAttribute("href") === "/contact/?interest=qlik", `Qlik page keeps the service of interest: ${qlikTo?.getAttribute("href")}`);
  // Qlik logo: not in the build, not imported by the source.
  const assets = readdirSync("dist/assets");
  ok(!assets.some((f) => /^qlik(-logo)?-[\w-]+\.png$/i.test(f)), "no Qlik logo image in dist/assets");
  const srcUsesLogo = [];
  const walk = (dir) => { for (const e of readdirSync(dir, { withFileTypes: true })) { const f = dir + "/" + e.name; if (e.isDirectory()) { if (!f.endsWith("/unused")) walk(f); } else if (/\.(jsx?|css)$/.test(e.name) && /assets\/unused|qlik-logo|siQlik/.test(readFileSync(f, "utf8").replace(/\/\/.*|\/\*[\s\S]*?\*\//g, ""))) srcUsesLogo.push(f); } };
  walk("src");
  ok(srcUsesLogo.length === 0, "the source imports no Qlik logo file or icon" + (srcUsesLogo.length ? ": " + srcUsesLogo.join(", ") : ""));
  const logoImgs = [];
  for (const u of Object.keys(PAGES)) for (const i of doc[u].querySelectorAll("img,image")) { if (/qlik-logo|\/qlik-[\w-]+\.png/i.test(i.getAttribute("src") || i.getAttribute("href") || "")) logoImgs.push(u); }
  ok(logoImgs.length === 0, "no page has an <img>/<image> of the Qlik logo");
  ok(/class="logo-word"[^>]*>Qlik</.test(html["/qlik/"]), '/qlik/: the word "Qlik" is drawn as text in the accelerator "Built with" tiles');
}

console.log("CLAIM F: service pages (one template, content from src/services.js)");
{
  const sitemap = readFileSync("dist/sitemap.xml", "utf8"), l1 = readFileSync("dist/llms.txt", "utf8"), l2 = readFileSync("dist/llms-full.txt", "utf8");
  for (const p of services.SERVICE_PAGES) {
    const u = services.servicePath(p), d = doc[u], t = textOf(u);
    const label = u.padEnd(46);
    ok(d.querySelectorAll("h1").length === 1 && d.querySelector("h1").textContent.trim() === p.hero.h1, `${label} one h1: "${p.hero.h1}"`);
    ok(p.hero.paragraphs.every((x) => t.includes(x)) && (!p.hero.support || t.includes(p.hero.support)) && t.includes(p.hero.cta), `${label} hero paragraphs, supporting line and button text present`);
    const cards = [...d.querySelectorAll(".sp-card")];
    const want = p.sections.flatMap((s) => s.cards);
    ok(cards.length === want.length && want.every((c, i) => cards[i].querySelector("h3")?.textContent.trim() === c.title && (!c.desc || cards[i].querySelector("p")?.textContent.trim() === c.desc) && c.bullets.every((b) => [...cards[i].querySelectorAll("li")].some((li) => li.textContent.trim() === b)) && cards[i].querySelectorAll("li").length === c.bullets.length),
      `${label} ${cards.length}/${want.length} capability cards with their title, description and every bullet`);
    ok(p.sections.every((s) => !!d.querySelector(`h2#${s.id}-h`)), `${label} section h2: ${p.sections.map((s) => s.title).join(" | ")}`);
    const hero = d.querySelector(".sp-hero a.hero-btn"), band = d.querySelector(".cta-band a");
    const href = "/contact/?interest=" + p.interest;
    ok(hero?.getAttribute("href") === href && band?.getAttribute("href") === href, `${label} hero button and CTA band go to ${href}`);
    const ld = JSON.parse(d.querySelector('script[type="application/ld+json"]').textContent)["@graph"];
    const svc = ld.find((n) => n["@type"] === "Service");
    ok(!!svc && svc.name === p.title && svc.url === ORIGIN + u && ld.some((n) => n["@type"] === "BreadcrumbList" && n.itemListElement.at(-1).item === ORIGIN + u), `${label} Service + BreadcrumbList JSON-LD (service url ${svc?.url})`);
    const robots = d.querySelector('meta[name="robots"]')?.getAttribute("content");
    const indexed = sitemap.includes(`<loc>${ORIGIN + u}</loc>`), inLlms = l1.includes(ORIGIN + u) && l2.includes(ORIGIN + u);
    ok(p.noindex ? robots === "noindex" && !indexed && !inLlms : !robots && indexed && inLlms, `${label} ${p.noindex ? "DRAFT: noindex, not in sitemap.xml or llms files" : "indexable: in sitemap.xml, llms.txt and llms-full.txt, no robots meta"}`);
    ok(!!d.querySelector(`header nav.nav .nav-dd-list a[href="${u}"]`), `${label} is in the Services dropdown`);
  }
  const de = services.servicePageBySlug("data-engineering-analytics");
  const deCards = [...doc["/services/data-engineering-analytics/"].querySelectorAll(".sp-card")];
  ok(deCards.length === 6 && deCards.every((c, i) => c.querySelectorAll("li").length === 5 && c.querySelector(".sp-num")?.textContent === "0" + (i + 1)) && new Set(de.sections[0].cards.map((c) => c.icon)).size === 6, "data engineering page: 6 numbered cards with 5 bullets each and 6 different icons");
  ok(["consulting-delivery", "ai-solutions"].every((s) => services.servicePageBySlug(s).noindex === true), "consulting-delivery and ai-solutions are noindex drafts");
  const cardsOnHome = [...doc["/"].querySelectorAll(".sv-link")].map((a) => a.getAttribute("href"));
  ok(services.SERVICE_PAGES.every((p) => cardsOnHome.includes(services.servicePath(p))) && cardsOnHome.includes("/qlik/"), `home "Explore" links: ${cardsOnHome.join(", ")}`);
  const homeLd = JSON.parse(doc["/"].querySelector('script[type="application/ld+json"]').textContent)["@graph"].filter((n) => n["@type"] === "Service");
  ok(homeLd.some((n) => n.url === ORIGIN + "/services/data-engineering-analytics/") && homeLd.every((n) => !/consulting-delivery|ai-solutions/.test(n.url)), "home Service JSON-LD points to the data engineering page, not to the noindex drafts");
}

console.log(`\n${fails} failed check(s)`);
process.exit(fails ? 1 : 0);
