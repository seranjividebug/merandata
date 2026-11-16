import { createServer, defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Date (YYYY-MM-DD) of the last commit touching any of `sources`; today if git history is unavailable.
function lastModified(sources) {
  try {
    const date = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...sources], { encoding: "utf8" }).trim();
    if (date) return date;
  } catch { /* no git history in this environment */ }
  return new Date().toISOString().slice(0, 10);
}

// Post-processes every built HTML file:
// 1. vite-react-ssg preloads every image a lazy route imports (all the lazy-loaded capability pictures).
//    Those are below the fold, so the preloads are removed (the hero image is preloaded by hand).
// 2. The app script starts after the page has painted instead of before it. The HTML is already complete
//    (headings, text, links, images), so hydration is not needed for the first paint; running it first only
//    delays the largest contentful paint on slow phones. It starts when the browser is idle after load, or
//    at the first sign of interaction (pointer, touch, key, scroll), whichever comes first.
function deferHydration(html) {
  const entry = html.match(/<script type="module"[^>]*src="(\/assets\/app-[^"]+\.js)"[^>]*><\/script>/);
  if (!entry) return html;
  const preloads = [...html.matchAll(/<link rel="modulepreload"[^>]*href="([^"]+)"[^>]*>/g)].map((m) => m[1]);
  const loader = `(function(){var d=0,m=${JSON.stringify(preloads)},e=${JSON.stringify(entry[1])};function go(){if(d)return;d=1;m.forEach(function(h){var l=document.createElement("link");l.rel="modulepreload";l.href=h;l.crossOrigin="";document.head.appendChild(l)});var s=document.createElement("script");s.type="module";s.crossOrigin="";s.src=e;document.head.appendChild(s)}function idle(){window.requestIdleCallback?requestIdleCallback(go,{timeout:1500}):setTimeout(go,300)}if(document.readyState==="complete")idle();else addEventListener("load",idle,{once:true});["pointerdown","pointermove","touchstart","keydown","scroll","focusin"].forEach(function(t){addEventListener(t,go,{once:true,passive:true,capture:true})})})();`;
  return html
    .replace(entry[0], `<script>${loader}</script>`)
    .replace(/<link rel="modulepreload"[^>]*>/g, "");
}

// The viewport meta must come first: image preloads with a media-conditioned `sizes` are resolved while the head
// is parsed, and without the viewport tag a phone is treated as 980 px wide, so they would pick the wrong file.
function viewportFirst(html) {
  const metas = [...html.matchAll(/<meta (?:charset|name="viewport")[^>]*>/g)].map((m) => m[0]);
  if (metas.length < 2) return html;
  return metas.reduce((out, m) => out.replace(m, ""), html).replace("<head>", `<head>${metas.join("")}`);
}

function postProcessHtml(dir = "dist") {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) { if (name !== "assets") postProcessHtml(path); continue; }
    if (!name.endsWith(".html")) continue;
    const html = readFileSync(path, "utf8");
    const cleaned = viewportFirst(deferHydration(html.replace(/<link rel="preload" as="image" href="[^"]+" crossorigin>/g, "")));
    if (cleaned !== html) writeFileSync(path, cleaned);
  }
}

// Writes sitemap.xml, robots.txt, llms.txt and llms-full.txt from the site data (see src/seoFiles.js).
async function writeSeoFiles() {
  const server = await createServer({ configFile: false, appType: "custom", logLevel: "silent", server: { middlewareMode: true } });
  try {
    const { buildSeoFiles } = await server.ssrLoadModule("/src/seoFiles.js");
    const { files, warnings } = buildSeoFiles(lastModified);
    for (const [name, content] of Object.entries(files)) writeFileSync(`dist/${name}`, content);
    warnings.forEach((w) => console.warn(`[seo] ${w}`));
  } finally {
    await server.close();
  }
}
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export default defineConfig({
  plugins: [react()],
  // Same year in the prerendered HTML and in the browser, so hydration never mismatches around New Year.
  define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
  server: {
    // Rebuilding or zipping dist while the dev server runs must not crash the file watcher.
    watch: { ignored: ["**/dist/**", "**/dist.zip", "**/preview/**"] },
  },
  build: {
    // Only tiny files (under 4 kB) are inlined; everything else is a separate, cacheable file
    // (inlined images bloat every page's HTML and cannot be cached or lazy-loaded).
    assetsInlineLimit: 4096,
  },
  // Static site generation (vite-react-ssg): every route in src/routes.jsx gets its own HTML file at build time.
  ssgOptions: {
    dirStyle: "nested", // /qlik -> dist/qlik/index.html
    script: "defer",
    // Critical CSS is inlined by beasties; fonts are preloaded by hand (Layout.jsx) so only the Latin file is fetched early.
    beastiesOptions: { preloadFonts: false },
    // Static routes plus the expanded getStaticPaths of dynamic ones, minus catch-alls, plus the 404 page.
    includedRoutes: (paths) => [...new Set([...paths.filter((p) => !p.includes("*")), "/404"])],
    // Hosts serve /404.html (with a 404 status) for unknown URLs, so move it out of its folder.
    async onFinished() {
      renameSync("dist/404/index.html", "dist/404.html");
      rmSync("dist/404", { recursive: true, force: true });
      rmSync("dist/.vite", { recursive: true, force: true }); // build metadata, not needed on the host
      postProcessHtml();
      await writeSeoFiles();
    },
  },
});
