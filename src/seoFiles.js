// Build-time generators for the files crawlers look for. Called from vite.config.js after the pages are rendered.
import { ALLOW_AI_TRAINING, CRAWLERS, SITE, absoluteUrl, canonicalUrl, indexablePages, seoWarnings } from "./seo";
import { buildLlmsFullTxt, buildLlmsTxt } from "./llmsText";

const xml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** sitemap.xml for every indexable page in PAGES (`noindex` drafts are left out). `lastmod(sources)` returns a YYYY-MM-DD date for a page. */
export function buildSitemap(lastmod) {
  const urls = indexablePages().map((p) => `  <url>\n    <loc>${xml(canonicalUrl(p.path))}</loc>\n    <lastmod>${lastmod(p.sources)}</lastmod>\n  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

/** robots.txt: everything allowed, named crawlers listed explicitly, sitemap declared. */
export function buildRobots() {
  const groups = CRAWLERS.map(({ group, agents, training }) => {
    const rule = training && !ALLOW_AI_TRAINING ? "Disallow: /" : "Allow: /";
    return `# ${group}\n${agents.map((a) => `User-agent: ${a}`).join("\n")}\n${rule}\n`;
  });
  return [
    `# robots.txt for ${SITE.url}`,
    "# Public content is open to search engines and AI systems.",
    "",
    "User-agent: *",
    "Allow: /",
    "",
    ...groups,
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
  ].join("\n");
}

/** All generated files as { "name": "content" } plus any content warnings. */
export function buildSeoFiles(lastmod) {
  return {
    files: {
      "sitemap.xml": buildSitemap(lastmod),
      "robots.txt": buildRobots(),
      "llms.txt": buildLlmsTxt(),
      "llms-full.txt": buildLlmsFullTxt(),
    },
    warnings: seoWarnings(),
  };
}
