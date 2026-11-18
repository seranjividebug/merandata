import { launch, BASE, watch, norm } from "./common.mjs";
const b = await launch();
let fails = 0; const ok = (c, msg) => { if (!c) fails++; console.log((c ? "PASS " : "FAIL ") + msg); };
const routes = [["/", /Meridanta/, "home"], ["/qlik/", /Qlik Center of Excellence/, "qlik"], ["/qlik", /Qlik Center of Excellence/, "qlik (no trailing slash)"], ["/qlik/?utm_source=test&x=1", /Qlik Center of Excellence/, "qlik + query"], ["/industries/healthcare/", /Healthcare/, "healthcare"], ["/industries/healthcare", /Healthcare/, "healthcare (no slash)"], ["/industries/communications-media-entertainment/", /Communications, Media/, "cme"]];
console.log("== 1. direct access and refresh");
for (const [url, titleRe, label] of routes) {
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const issues = watch(p);
  const r = await p.goto(BASE + url, { waitUntil: "load" }); await p.waitForTimeout(700);
  const t1 = await p.title(); const h1 = await p.locator("h1").first().innerText();
  await p.reload({ waitUntil: "load" }); await p.waitForTimeout(500);
  const t2 = await p.title(); const keep = new URL(p.url()).search;
  ok(r.status() === 200 && titleRe.test(t1) && t1 === t2 && h1.length > 3 && !issues.length, `${label.padEnd(26)} ${r.status()} title="${t1.slice(0, 45)}" h1="${h1.replace(/\n/g, " ").slice(0, 40)}" refresh-same=${t1 === t2} query-kept=${url.includes("?") ? keep === new URL("http://x" + url).search : "n/a"} ${issues.length ? "ISSUES " + issues.join(" | ") : ""}`);
  await p.close();
}
console.log("== 2. unknown paths");
for (const u of ["/no/such/page", "/qlik/unknown-thing", "/industries/finance/", "/services", "/robots-missing.txt"]) {
  const p = await b.newPage(); const r = await p.goto(BASE + u, { waitUntil: "load" }); await p.waitForTimeout(500);
  const h1 = await p.locator("h1").first().innerText().catch(() => "");
  console.log(`${r.status() === 404 ? "PASS" : "INFO"} ${u.padEnd(26)} status ${r.status()} -> ${new URL(p.url()).pathname} h1="${h1.slice(0, 30)}"  (static test server: no rewrites; Hostinger redirects /services etc. via .htaccess)`);
  if (u === "/no/such/page" || u === "/industries/finance/") ok(r.status() === 404 && /not found/i.test(h1), `${u} shows the Page not found page with status 404`);
  await p.close();
}
console.log("== 3. back / forward and client-side navigation");
{
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const issues = watch(p);
  await p.goto(BASE + "/", { waitUntil: "load" }); await p.waitForTimeout(2500); // let the app hydrate
  const titleHome = await p.title();
  await p.locator('a.hs-btn[href="/qlik"], a.hs-btn[href="/qlik/"]').first().click({ force: true }); await p.waitForTimeout(1200);
  ok(norm(new URL(p.url()).pathname) === "/qlik" && /Qlik Center of Excellence/.test(await p.title()), `hero button -> /qlik (client navigation) url=${new URL(p.url()).pathname} title="${(await p.title()).slice(0, 40)}"`);
  ok((await p.evaluate(() => scrollY)) < 50, "page starts at the top after navigating");
  await p.goBack(); await p.waitForTimeout(900);
  ok(norm(new URL(p.url()).pathname) === "/" && (await p.title()) === titleHome, `back -> home, title restored ("${(await p.title()).slice(0, 30)}")`);
  await p.goForward(); await p.waitForTimeout(900);
  ok(norm(new URL(p.url()).pathname) === "/qlik" && /Qlik Center/.test(await p.title()), "forward -> /qlik");
  await p.locator('nav.crumbs a').first().click(); await p.waitForTimeout(900);
  ok(norm(new URL(p.url()).pathname) === "/", "breadcrumb Home -> /");
  await p.locator("#industries a.btn-grad, #industries a[href*='healthcare']").first().click({ force: true }).catch(() => {}); await p.waitForTimeout(900);
  console.log("INFO after industries Learn More: " + new URL(p.url()).pathname);
  ok(!issues.length, "no console errors during navigation " + issues.join(" | "));
  await p.close();
}
console.log("== 4. anchors (section top should sit just under the 72px header)");
const anchors = [["/", ["services", "industries", "solutions", "about", "contact"]], ["/qlik/", ["capabilities", "qlik-services", "accelerators", "case-studies"]]];
for (const [path, ids] of anchors) for (const id of ids) {
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto(BASE + path + "#" + id, { waitUntil: "load" }); await p.waitForTimeout(1800);
  const top = await p.evaluate((i) => Math.round(document.getElementById(i).getBoundingClientRect().top), id);
  ok(top >= 0 && top <= 140, `${path}#${id} top=${top}px`); await p.close();
}
{
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto(BASE + "/qlik/#case-airline-modernization", { waitUntil: "load" }); await p.waitForTimeout(2000);
  ok(/Airline/.test(await p.locator(".ck-name").innerText()), "deep link #case-airline-modernization selects that case");
  await p.goto(BASE + "/qlik/#accelerator-log-scraping", { waitUntil: "load" }); await p.waitForTimeout(2000);
  ok(/Log Scraping/.test(await p.locator(".ax-panel:visible .ax-title").innerText()), "deep link #accelerator-log-scraping selects that accelerator");
  await p.goto(BASE + "/qlik/", { waitUntil: "load" }); await p.waitForTimeout(2500);
  await p.locator("header a", { hasText: "Services" }).first().click(); await p.waitForTimeout(1500);
  const top = await p.evaluate(() => Math.round(document.getElementById("services")?.getBoundingClientRect().top ?? 9999));
  ok(norm(new URL(p.url()).pathname) === "/" && new URL(p.url()).hash === "#services" && top >= 0 && top < 140, `from /qlik/: header Services -> /#services (top ${top}px)`);
  await p.close();
}
await b.close(); console.log(`\n${fails} failure(s)`); process.exit(fails ? 1 : 0);
