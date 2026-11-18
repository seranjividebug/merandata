// Turns docs/STATUS_REPORT.md into docs/STATUS_REPORT.pdf (A4) using marked + a Chromium-based browser.
//   node scripts/make-status-pdf.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { marked } from "marked";
import { chromium } from "playwright-core";

const BROWSER = process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const md = readFileSync("docs/STATUS_REPORT.md", "utf8");
const body = marked.parse(md, { gfm: true });
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Meridanta Website - AI Search Discoverability: Status Report</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #151a2d; }
  h1 { font-size: 20pt; margin: 0 0 4pt; color: #0c1230; }
  h2 { font-size: 14pt; margin: 18pt 0 6pt; color: #5a2390; border-bottom: 1px solid #d9d4e6; padding-bottom: 3pt; }
  h3 { font-size: 11.5pt; margin: 12pt 0 4pt; }
  table { border-collapse: collapse; width: 100%; margin: 6pt 0 10pt; font-size: 8.6pt; page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  th { background: #0c1230; color: #fff; text-align: left; padding: 4pt 5pt; }
  td { border: 1px solid #d9d4e6; padding: 3.5pt 5pt; vertical-align: top; }
  tr:nth-child(even) td { background: #f6f4fb; }
  code { font-family: Consolas, monospace; font-size: 8.6pt; background: #f0edf7; padding: 0 2pt; border-radius: 2pt; }
  ul { margin: 4pt 0 8pt 16pt; padding: 0; }
  li { margin: 2pt 0; }
  p { margin: 5pt 0; }
</style></head><body>${body}</body></html>`;
writeFileSync("docs/.status-report.tmp.html", html);
const browser = await chromium.launch({ executablePath: BROWSER });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.pdf({ path: "docs/STATUS_REPORT.pdf", format: "A4", printBackground: true, displayHeaderFooter: true, footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#666"><span class="pageNumber"></span> / <span class="totalPages"></span></div>', headerTemplate: "<span></span>", margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" } });
await browser.close();
console.log("Wrote docs/STATUS_REPORT.pdf");
