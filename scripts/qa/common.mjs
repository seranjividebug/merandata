import { chromium } from "playwright-core";
export const BASE = process.env.BASE || "http://localhost:8090";
// Path of a Chromium-based browser (Edge or Chrome). Set BROWSER_PATH to override.
export const EDGE = process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
export const launch = () => chromium.launch({ executablePath: EDGE });
export const PAGES = ["/", "/qlik/", "/industries/healthcare/", "/industries/communications-media-entertainment/", "/privacy/", "/contact/", "/about/", "/solutions/", "/industries/", "/services/consulting-delivery/", "/services/ai-solutions/", "/services/data-engineering-analytics/"];
/** Collects console errors/warnings, page errors and failed requests (404 on the page URL itself is ignored when expected). */
export function watch(page, ignore = []) {
  const issues = [];
  page.on("console", (m) => { if (["error", "warning"].includes(m.type()) && !ignore.some((re) => re.test(m.text()))) issues.push(m.type() + ": " + m.text().slice(0, 140)); });
  page.on("pageerror", (e) => issues.push("pageerror: " + e.message.slice(0, 140)));
  page.on("requestfailed", (r) => issues.push("requestfailed: " + r.url().slice(0, 100)));
  return issues;
}
export const norm = (p) => p.replace(/\/+$/, "") || "/";
