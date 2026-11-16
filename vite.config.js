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
import { renameSync, rmSync, writeFileSync } from "node:fs";

export default defineConfig({
  plugins: [react()],
  // Same year in the prerendered HTML and in the browser, so hydration never mismatches around New Year.
  define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
  server: {
    // Rebuilding or zipping dist while the dev server runs must not crash the file watcher.
    watch: { ignored: ["**/dist/**", "**/dist.zip", "**/preview/**"] },
  },
  build: {
    // Inline the small logo images so the site is fully self-contained.
    // Capability images stay separate files so loading="lazy" works; everything else under 100 kB is inlined.
    assetsInlineLimit: (file, content) => (file.includes("/assets/capabilities/") ? false : content.length < 100000),
  },
  // Static site generation (vite-react-ssg): every route in src/routes.jsx gets its own HTML file at build time.
  ssgOptions: {
    dirStyle: "nested", // /qlik -> dist/qlik/index.html
    script: "defer",
    // Static routes plus the expanded getStaticPaths of dynamic ones, minus catch-alls, plus the 404 page.
    includedRoutes: (paths) => [...new Set([...paths.filter((p) => !p.includes("*")), "/404"])],
    // Hosts serve /404.html (with a 404 status) for unknown URLs, so move it out of its folder.
    async onFinished() {
      renameSync("dist/404/index.html", "dist/404.html");
      rmSync("dist/404", { recursive: true, force: true });
      rmSync("dist/.vite", { recursive: true, force: true }); // build metadata, not needed on the host
      await writeSeoFiles();
    },
  },
});
