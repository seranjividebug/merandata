import { launch, BASE, watch, norm } from "./common.mjs";
const b = await launch();
let fails = 0;
const rows = [];
const check = (c, msg) => { if (!c) fails++; rows.push((c ? "PASS " : "FAIL ") + msg); };

/** Click a link on `start`, then verify where we ended up and that the target is in view. */
async function click(start, label, locatorFn, expect, vp = { width: 1440, height: 900 }, before) {
  const p = await b.newPage({ viewport: vp });
  const issues = watch(p);
  await p.goto(BASE + start, { waitUntil: "load" });
  await p.waitForTimeout(2200);
  if (before) await before(p);
  const loc = locatorFn(p).first();
  if (!(await loc.count())) { check(false, `${start} ${label}: link not found`); await p.close(); return; }
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  await loc.click({ timeout: 5000 }).catch(async () => { await loc.click({ force: true }); });
  await p.waitForTimeout(2800); // long smooth scrolls (several thousand px) need about two seconds
  const u = new URL(p.url());
  const got = norm(u.pathname) + (u.hash || "");
  let topOk = true;
  let top = "";
  if (expect.hash) {
    top = await p.evaluate((id) => { const e = document.getElementById(id); return e ? Math.round(e.getBoundingClientRect().top) : 99999; }, expect.hash.slice(1));
    topOk = top >= -60 && top <= 150;
  }
  if (expect.home) { top = await p.evaluate(() => Math.round(scrollY)); topOk = top < 60; }
  // On the page a link points to, the browser scrolls without changing the address (existing behaviour), so the URL is unchanged there.
  const wanted = start.replace(/\/$/, "") === expect.url.split("#")[0].replace(/\/$/, "") && expect.hash ? norm(start) : expect.url.replace(/\/$/, "") || "/";
  const good = (got === expect.url || got === norm(expect.url.split("#")[0]) + (expect.url.includes("#") ? "#" + expect.url.split("#")[1] : "") || got === wanted) && topOk && !issues.length;
  check(good, `${(vp.width + "px").padEnd(7)} ${start.padEnd(26)} ${label.padEnd(36)} -> ${got}${top !== "" ? " (target top " + top + ")" : ""} ${issues.length ? "ISSUES " + issues.join("|") : ""}${good ? "" : "  EXPECTED " + expect.url}`);
  await p.close();
}

const L = (text, scope = "header") => (p) => p.locator(`${scope} a`, { hasText: new RegExp("^\\s*" + text + "\\s*$") });
const SECTIONS = [["Services", "#services"], ["Industries", "#industries"], ["Products & Solutions", "#solutions"], ["About Us", "#about"]];

console.log("== header, footer and call-to-action links (desktop 1440px)");
for (const start of ["/", "/qlik/", "/industries/healthcare/"]) {
  for (const [t, hash] of SECTIONS) await click(start, `header "${t}"`, L(t), { url: "/" + hash, hash });
  await click(start, 'header "Home"', L("Home"), { url: "/", home: true });
  await click(start, "header brand logo", (p) => p.locator("header a.brand"), { url: "/", home: true });
  await click(start, 'header "Get in Touch"', (p) => p.locator("header a.cta-head"), { url: "/#contact", hash: "#contact" });
  for (const [t, hash] of SECTIONS) await click(start, `footer "${t}"`, L(t, "footer"), { url: "/" + hash, hash });
  await click(start, 'footer "Get in Touch"', L("Get in Touch", "footer"), { url: "/#contact", hash: "#contact" });
}

console.log(rows.splice(0).join("\n"));
console.log("== page-specific call-to-action buttons");
await click("/qlik/", 'hero "Talk to a Qlik Expert"', (p) => p.locator("a.hero-btn", { hasText: "Talk to a Qlik Expert" }), { url: "/#contact", hash: "#contact" });
await click("/qlik/", 'hero "Explore Capabilities"', (p) => p.locator("a.hero-btn", { hasText: "Explore Capabilities" }), { url: "/qlik/#capabilities", hash: "#capabilities" });
await click("/qlik/", "accelerator talk-to-us button", (p) => p.locator(".ax-panel:visible a", { hasText: "Talk to us about this accelerator" }), { url: "/#contact", hash: "#contact" });
await click("/qlik/", "case study Discuss a similar project", (p) => p.locator(".ck-discuss"), { url: "/#contact", hash: "#contact" });
await click("/qlik/", "service journey free consultation", (p) => p.locator(".sj-cta a"), { url: "/#contact", hash: "#contact" });
await click("/qlik/", "floating CTA (after scrolling)", (p) => p.locator("a.fab-talk"), { url: "/#contact", hash: "#contact" }, undefined, async (p) => { await p.evaluate(() => scrollTo(0, 3000)); await p.waitForTimeout(800); });
await click("/industries/healthcare/", 'hero "Talk to Our Team"', (p) => p.locator(".qhero-ctas a", { hasText: "Talk to Our Team" }), { url: "/#contact", hash: "#contact" });
await click("/industries/healthcare/", 'hero "All industries"', (p) => p.locator(".qhero-ctas a", { hasText: "All industries" }), { url: "/#industries", hash: "#industries" });
await click("/industries/healthcare/", "CTA band button", (p) => p.locator(".cta-band a"), { url: "/#contact", hash: "#contact" });
await click("/industries/healthcare/", "breadcrumb Industries", (p) => p.locator("nav.crumbs a", { hasText: "Industries" }), { url: "/#industries", hash: "#industries" });
await click("/qlik/", "breadcrumb Home", (p) => p.locator("nav.crumbs a", { hasText: "Home" }), { url: "/", home: true });
await click("/", 'hero slide 1 "Explore More"', (p) => p.locator(".hs-slide.is-active a.hs-btn"), { url: "/qlik/" });
await click("/", "Products: Qlik Accelerators card", (p) => p.locator("a.spot", { hasText: "Qlik Accelerators" }), { url: "/qlik/#accelerators", hash: "#accelerators" });
await click("/", "Products: HCInsights card", (p) => p.locator("a.spot", { hasText: "HCInsights" }), { url: "/industries/healthcare" });
await click("/", "Services card: Explore Qlik", (p) => p.locator(".sv-link"), { url: "/qlik/" });
await click("/", "Industries card: Learn More (healthcare)", (p) => p.locator("#industries a", { hasText: /Learn More/ }), { url: "/industries/healthcare/" }, undefined, async (p) => { await p.locator("#industries .ic-card").first().hover(); await p.waitForTimeout(700); });
console.log(rows.splice(0).join("\n"));

console.log("== controls: back to top, privacy page link, search, mobile menu");
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const issues = watch(p);
  await p.goto(BASE + "/", { waitUntil: "load" });
  await p.waitForTimeout(2500);
  await p.evaluate(() => scrollTo(0, 2500));
  await p.waitForTimeout(700);
  check((await p.locator("button.fab-top.is-on").count()) === 1, "back-to-top appears after scrolling");
  await p.locator("button.fab-top").click();
  await p.waitForTimeout(1200);
  check((await p.evaluate(() => scrollY)) < 30, "back-to-top returns to the top");
  await p.locator("footer a", { hasText: "Privacy Policy" }).click();
  await p.waitForTimeout(1200);
  check(norm(new URL(p.url()).pathname) === "/privacy" && (await p.locator("h1").innerText()) === "Privacy Policy" && (await p.evaluate(() => scrollY)) < 60, "footer Privacy Policy opens the /privacy/ page (client navigation)");
  await p.goBack();
  await p.waitForTimeout(800);
  await p.locator("button.search-btn").click();
  await p.waitForTimeout(400);
  await p.keyboard.type("healthcare");
  await p.waitForTimeout(600);
  const hits = await p.locator('[role="option"]').count();
  check(hits > 0, `search shows results for "healthcare" (${hits})`);
  await p.keyboard.press("Enter");
  await p.waitForTimeout(1500);
  const here = new URL(p.url()).pathname + new URL(p.url()).hash;
  check(/healthcare/.test(here), "search result opens: " + here);
  check(!issues.length, "no console issues " + issues.join("|"));
  await p.close();
}
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const issues = watch(p);
  await p.goto(BASE + "/qlik/", { waitUntil: "load" });
  await p.waitForTimeout(2500);
  await p.locator("button.menu-btn").click();
  await p.waitForTimeout(500);
  check((await p.locator("button.menu-btn").getAttribute("aria-expanded")) === "true", "mobile menu opens (aria-expanded=true)");
  const items = await p.locator("#mnav a").allInnerTexts();
  check(items.length === 6, `mobile menu lists ${items.length} links: ${items.map((t) => t.trim()).join(", ")}`);
  await p.locator("#mnav a", { hasText: "Industries" }).click();
  await p.waitForTimeout(1500);
  const u = new URL(p.url());
  check(u.pathname === "/" && u.hash === "#industries" && (await p.locator("button.menu-btn").getAttribute("aria-expanded")) === "false", `mobile menu link -> ${u.pathname}${u.hash}, menu closed`);
  check(issues.length === 0, "no console issues on mobile " + issues.join("|"));
  await p.close();
}
console.log(rows.join("\n"));
await b.close();
console.log(`\n${fails} failure(s)`);
process.exit(fails ? 1 : 0);
