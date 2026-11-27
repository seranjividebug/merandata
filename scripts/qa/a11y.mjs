// Accessibility scan (axe-core, all rules) of every kind of page at phone, tablet and desktop width.
//   npm run build && npm run qa:serve   (other window)   npm run qa:a11y
import { readFileSync } from "node:fs";
import { launch, BASE } from "./common.mjs";

const AXE = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const PAGES = ["/", "/qlik/", "/contact/", "/privacy/", "/services/consulting-delivery/", "/services/ai-solutions/", "/services/data-engineering-analytics/", "/industries/healthcare/", "/no-such-page/"];
const b = await launch();
let fails = 0;
for (const [w, h, mobile] of [[412, 823, true], [820, 1100, true], [1440, 900, false]]) {
  for (const u of PAGES) {
    const p = await b.newPage({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 1.75 : 1 });
    await p.goto(BASE + u);
    await p.waitForTimeout(1500);
    await p.addScriptTag({ content: AXE });
    const found = await p.evaluate(async () => (await axe.run(document)).violations.map((v) => v.id + "(" + v.nodes.length + ")"));
    if (found.length) fails += 1;
    console.log((found.length ? "FAIL " : "PASS ") + String(w).padEnd(5) + u.padEnd(42) + found.join(" "));
    await p.close();
  }
}
await b.close();
console.log(`\n${fails} page/width combination(s) with violations`);
process.exit(fails ? 1 : 0);
