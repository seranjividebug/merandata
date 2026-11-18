// Loads every public page and reports console errors, warnings, page errors and failed requests.
import { launch, BASE, watch, PAGES } from "./common.mjs";

const b = await launch();
let total = 0;
for (const path of PAGES) {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const issues = watch(p);
    await p.goto(BASE + path, { waitUntil: "load" });
    await p.waitForTimeout(3000); // let the app start and hydrate
    total += issues.length;
    console.log(`${issues.length ? "FAIL" : "PASS"} ${path.padEnd(48)} ${String(w).padStart(4)}px  console messages: ${issues.length}${issues.length ? "  " + issues.join(" | ") : ""}`);
    await p.close();
  }
}
await b.close();
console.log(`\n${total} console message(s) in total`);
process.exit(total ? 1 : 0);
