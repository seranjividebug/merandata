// Header links that scroll to a home-page section: Industries / Solutions / About clicked in random order, 10 times, at
// 1920x1080, 1440x900 and 390px (through the mobile menu). After every click:
//  - the section's top edge sits 0-8px below the sticky header (the heading is further down by the section's own padding),
//  - the page does not scroll again after it stopped (no late jump),
//  - the floating "Talk to an Expert" button changes state at most once,
//  - the clicked item is the highlighted one in the menu.
// It also reports the layout shift (CLS) measured over the whole sequence.
//   npm run build && npm run qa:serve   (other window)   npm run qa:anchors
import { launch, BASE } from "./common.mjs";

const TARGETS = ["industries", "solutions", "about"];
let fails = 0;
const ok = (c, m) => { if (!c) fails += 1; console.log((c ? "PASS " : "FAIL ") + m); };

// A fixed pseudo-random sequence (same on every run), never the same target twice in a row.
function sequence(n, seed) {
  let s = seed;
  const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  const out = [];
  while (out.length < n) {
    const t = TARGETS[Math.floor(rnd() * TARGETS.length)];
    if (t !== out[out.length - 1]) out.push(t);
  }
  return out;
}

const b = await launch();
for (const [w, h, mobile, seed] of [[1920, 1080, false, 7], [1440, 900, false, 11], [390, 844, true, 5]]) {
  const label = `${w}x${h}${mobile ? " (mobile menu)" : ""}`;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  });
  await p.goto(BASE + "/", { waitUntil: "load" });
  await p.waitForTimeout(2500);
  // count every show/hide of the floating button
  await p.evaluate(() => {
    window.__fab = 0;
    const el = document.querySelector(".fab-talk");
    let was = el.classList.contains("is-off");
    new MutationObserver(() => { const now = el.classList.contains("is-off"); if (now !== was) { window.__fab += 1; was = now; } }).observe(el, { attributes: true, attributeFilter: ["class"] });
  });
  let bad = 0;
  const rows = [];
  for (const [i, id] of sequence(10, seed).entries()) {
    await p.evaluate(() => { window.__fab = 0; });
    if (mobile) {
      await p.locator("button.menu-btn").click();
      await p.waitForTimeout(250);
      await p.locator(`#mnav a[href="/#${id}"]`).click();
    } else {
      await p.locator(`header nav.nav a[href="/#${id}"]`).first().click();
    }
    // wait until the page has stopped (8 equal samples in a row), at most 12 s
    let last = -1, still = 0;
    for (let k = 0; k < 120 && still < 8; k += 1) { const y = await p.evaluate(() => Math.round(scrollY)); still = y === last ? still + 1 : 0; last = y; await p.waitForTimeout(100); }
    const m1 = await p.evaluate((id) => {
      const sec = document.getElementById(id);
      const hd = document.querySelector("header.header") || document.querySelector("header");
      return { top: sec.getBoundingClientRect().top, hb: hd.getBoundingClientRect().bottom, head: sec.querySelector("h2").getBoundingClientRect().top, y: scrollY };
    }, id);
    await p.waitForTimeout(1500); // a late jump would show up here
    const m2 = await p.evaluate((id) => ({ y: scrollY, fab: window.__fab, cur: [...document.querySelectorAll('header a[aria-current="true"], #mnav a[aria-current="true"]')].map((a) => a.getAttribute("href")).join(",") }), id);
    const gap = m1.top - m1.hb;
    const good = gap >= -1 && gap <= 8 && Math.abs(m2.y - m1.y) <= 1 && m2.fab <= 1 && m2.cur.includes("#" + id);
    if (!good) bad += 1;
    rows.push(`${i + 1}:${id}(gap ${gap.toFixed(0)}, heading ${(m1.head - m1.hb).toFixed(0)}, late ${(m2.y - m1.y).toFixed(0)}, fab x${m2.fab}, active ${m2.cur || "-"})`);
  }
  ok(bad === 0, `${label}: 10 clicks, all landed 0-8px below the header, no late jump, button changed at most once per click, clicked item highlighted${bad ? " (" + bad + " bad)" : ""}`);
  if (bad) rows.forEach((r) => console.log("     " + r));
  else console.log("     e.g. " + rows.slice(0, 3).join("  "));
  const cls = await p.evaluate(() => window.__cls);
  ok(cls < 0.1, `${label}: layout shift over the sequence = ${cls.toFixed(4)} (limit 0.1)`);
  await ctx.close();
}
await b.close();
console.log(`\n${fails} failure(s)`);
process.exit(fails ? 1 : 0);
