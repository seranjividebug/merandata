import { launch, BASE, watch, PAGES } from "./common.mjs";

const b = await launch();
const SHOTS = process.env.SHOTS;
const widths = [390, 768, 1024, 1440, 1920];
const detail = [];
const rows = [];
let fails = 0;

/** Runs inside the page. Returns horizontal scroll, off-screen elements, clipped text and overlapping text blocks. */
const probe = () => {
  const vw = innerWidth;
  const out = { hscroll: document.documentElement.scrollWidth - vw, overflow: [], clipped: [], overlap: [] };
  const vis = (el) => {
    const s = getComputedStyle(el);
    return s.display !== "none" && s.visibility !== "hidden" && +s.opacity > 0 && !el.closest("[inert],[hidden],[aria-hidden='true']") && !el.closest(".sr,.skip,.hp");
  };
  const sel = (el) => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "");
  const clipAncestor = (el) => {
    for (let a = el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (/(hidden|auto|scroll|clip)/.test(s.overflowX)) {
        const r = a.getBoundingClientRect();
        if (r.left >= -1 && r.right <= vw + 1) return true;
      }
    }
    return false;
  };
  for (const el of document.body.querySelectorAll("*")) {
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const s = getComputedStyle(el);
    if ((r.right > vw + 1 || r.left < -1) && !clipAncestor(el) && s.position !== "fixed") out.overflow.push(sel(el) + ` [${Math.round(r.left)}..${Math.round(r.right)}]`);
    if ((s.overflow === "hidden" || s.overflowX === "hidden") && el.children.length === 0 && el.scrollWidth > el.clientWidth + 2 && s.textOverflow !== "ellipsis" && el.textContent.trim()) {
      out.clipped.push(sel(el) + ` (${el.scrollWidth}>${el.clientWidth}) "${el.textContent.trim().slice(0, 30)}"`);
    }
  }
  const layered = (el) => {
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      const p = getComputedStyle(a).position;
      if (p === "fixed" || p === "sticky" || p === "absolute") return true;
    }
    return false;
  };
  const items = [...document.body.querySelectorAll("h1,h2,h3,h4,p,li,a,button,label,.ck-pill,.ax-tab")]
    .filter((el) => vis(el) && el.textContent.trim().length > 1 && !layered(el))
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter((x) => x.r.width > 8 && x.r.height > 8);
  items.sort((a, c) => a.r.top - c.r.top);
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length && items[j].r.top < items[i].r.bottom; j++) {
      const A = items[i];
      const B = items[j];
      if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
      const w = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left);
      const h = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
      if (w > 4 && h > 4 && (w * h) / Math.min(A.r.width * A.r.height, B.r.width * B.r.height) > 0.25) out.overlap.push(`${sel(A.el)} x ${sel(B.el)} (${Math.round(w)}x${Math.round(h)})`);
    }
  }
  return out;
};

for (const path of PAGES) {
  for (const w of widths) {
    const h = w >= 1440 ? 900 : w >= 1024 ? 768 : w >= 768 ? 1024 : 844;
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 800, hasTouch: w < 800 });
    const issues = watch(p);
    await p.goto(BASE + path, { waitUntil: "load" });
    await p.waitForTimeout(2200);
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(h * 0.8)) { await p.evaluate((yy) => scrollTo(0, yy), y); await p.waitForTimeout(120); }
    await p.evaluate(() => scrollTo(0, 0));
    await p.waitForTimeout(600);
    const r = await p.evaluate(probe);
    if (SHOTS) {
      const name = `${path.replace(/\W+/g, "_")}_${w}`;
      await p.screenshot({ path: `${SHOTS}/${name}_top.png` });
      if (w === 390 || w === 1440) await p.screenshot({ path: `${SHOTS}/${name}_full.png`, fullPage: true });
    }
    const bad = r.hscroll > 0 || r.overflow.length || r.overlap.length || issues.length;
    if (bad) fails++;
    rows.push(`${bad ? "FAIL" : "PASS"} ${path.padEnd(48)} ${String(w).padStart(4)}px  hscroll=${r.hscroll}  offscreen=${r.overflow.length}  overlap=${r.overlap.length}  clipped-text=${r.clipped.length}  console=${issues.length}`);
    for (const [k, arr] of Object.entries({ offscreen: r.overflow, overlap: r.overlap, clipped: r.clipped })) {
      if (arr.length) detail.push(`   ${path} @${w} ${k}: ${[...new Set(arr)].slice(0, 6).join(" ; ")}`);
    }
    if (issues.length) detail.push(`   ${path} @${w} console: ${issues.slice(0, 3).join(" | ")}`);
    await p.close();
  }
}
console.log(rows.join("\n"));
if (detail.length) console.log("\nDetails:\n" + detail.join("\n"));
console.log(`\n${fails} page/width combinations with problems`);
await b.close();
