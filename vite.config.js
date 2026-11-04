import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
