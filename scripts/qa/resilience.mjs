// Progressive enhancement and engine differences that can be emulated in Chromium:
// JavaScript off, no requestIdleCallback (Safari), reduced motion, and touch input.
import { launch, BASE, watch, PAGES } from "./common.mjs";
const b = await launch();
let fails = 0;
const ok = (c, msg) => { if (!c) fails++; console.log((c ? "PASS " : "FAIL ") + msg); };

console.log("== JavaScript disabled (crawler view in a real browser)");
for (const path of PAGES) {
  const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(BASE + path, { waitUntil: "load" });
  // The main heading is the page h1, except on the home page, where the h1 is a hidden line and the visible heading is banner 1's title (an h2).
  const h1 = p.locator("h1:not(.sr), .hs-slide.is-active h2").first();
  const box = await h1.boundingBox();
  const heroImg = await p.evaluate(() => { const i = document.querySelector(".hs-slide.is-active img, .qhero-img img, .qhero-in svg"); return i ? i.getBoundingClientRect().height : -1; });
  const hscroll = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const navLinks = await p.locator("header nav a").count();
  ok(!!box && box.height > 10 && navLinks >= 5 && hscroll <= 0 && heroImg !== 0, `${path.padEnd(48)} h1 visible=${!!box} nav links=${navLinks} hero media height=${Math.round(heroImg)} hscroll=${hscroll}`);
  await ctx.close();
}

console.log("== no requestIdleCallback (as in Safari): the page must still become interactive");
for (const path of ["/", "/qlik/"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => { delete window.requestIdleCallback; delete window.cancelIdleCallback; });
  const p = await ctx.newPage();
  const issues = watch(p);
  await p.goto(BASE + path, { waitUntil: "load" });
  await p.waitForTimeout(2500);
  await p.locator("button.menu-btn").tap();
  await p.waitForTimeout(500);
  const open = await p.locator("button.menu-btn").getAttribute("aria-expanded");
  ok(open === "true" && !issues.length, `${path.padEnd(10)} menu button works after load without requestIdleCallback (aria-expanded=${open}) ${issues.join("|")}`);
  await ctx.close();
}

console.log("== interaction before hydration finishes (touch/scroll starts hydration at once)");
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const issues = watch(p);
  await p.route("**/assets/app-*.js", async (route) => { await new Promise((r) => setTimeout(r, 1500)); route.continue(); });
  await p.goto(BASE + "/", { waitUntil: "load" });
  await p.mouse.move(100, 300);
  await p.waitForTimeout(3500);
  await p.locator("button.menu-btn").tap();
  await p.waitForTimeout(500);
  ok((await p.locator("button.menu-btn").getAttribute("aria-expanded")) === "true" && !issues.length, "slow script (1.5 s delay): menu works once the script arrives " + issues.join("|"));
  await ctx.close();
}

console.log("== prefers-reduced-motion");
for (const path of PAGES) {
  const ctx = await b.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const issues = watch(p);
  await p.goto(BASE + path, { waitUntil: "load" });
  await p.waitForTimeout(2200);
  await p.evaluate(() => scrollTo(0, 2500));
  await p.waitForTimeout(400);
  const hscroll = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const pauseBtn = path === "/" ? await p.locator("button.hs-pp").count() : 0;
  ok(!issues.length && hscroll <= 0 && pauseBtn === 0, `${path.padEnd(48)} console clean, no horizontal scroll, slideshow pause button hidden=${pauseBtn === 0}`);
  await ctx.close();
}

console.log("== touch: hero swipe and tab taps");
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const issues = watch(p);
  await p.goto(BASE + "/", { waitUntil: "load" });
  await p.waitForTimeout(2500);
  const before = await p.locator(".hs-dot.is-on").evaluate((e) => [...e.parentElement.children].indexOf(e));
  await p.locator(".hs-dot").nth(1).tap();
  await p.waitForTimeout(600);
  const after = await p.locator(".hs-dot.is-on").evaluate((e) => [...e.parentElement.children].indexOf(e));
  ok(before === 0 && after === 1 && !issues.length, `hero dot tap changes slide ${before} -> ${after} ${issues.join("|")}`);
  await ctx.close();
}
await b.close();
console.log(`\n${fails} failure(s)`);
