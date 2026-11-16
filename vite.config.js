import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Client-side routes that have their own URL. Keep in sync with <Routes> in src/App.jsx.
function routePaths() {
  const data = readFileSync("src/data.js", "utf8");
  const industries = [...data.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => `industries/${m[1]}`);
  return ["qlik", ...industries];
}

// Static hosts (Apache/Hostinger) answer a direct visit or refresh of /qlik with their own 404 unless
// the .htaccess rewrite is active. Writing index.html into each route's folder makes those URLs resolve
// as real files, so the site works even when the rewrite rules are missing or ignored.
const routeShells = () => ({
  name: "route-shells",
  apply: "build",
  closeBundle() {
    const out = "dist";
    for (const route of routePaths()) {
      mkdirSync(join(out, route), { recursive: true });
      copyFileSync(join(out, "index.html"), join(out, route, "index.html"));
    }
  },
});

export default defineConfig({
  plugins: [react(), routeShells()],
  server: {
    // Rebuilding or zipping dist while the dev server runs must not crash the file watcher.
    watch: { ignored: ["**/dist/**", "**/dist.zip", "**/preview/**"] },
  },
  build: {
    // Inline the small logo images so the site is fully self-contained.
    // Capability images stay separate files so loading="lazy" works; everything else under 100 kB is inlined.
    assetsInlineLimit: (file, content) => (file.includes("/assets/capabilities/") ? false : content.length < 100000),
  },
});
