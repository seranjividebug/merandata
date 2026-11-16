// Responsive AVIF + WebP sets for the large images (made by scripts/make-responsive-images.py).
// Files sit next to the full-size WebP: <name>.webp (full), <name>-<width>.webp and <name>.avif / <name>-<width>.avif.
const FILES = {
  ...import.meta.glob("./assets/hero/*.{webp,avif}", { eager: true, query: "?url", import: "default" }),
  ...import.meta.glob("./assets/qlik-platform*.{webp,avif}", { eager: true, query: "?url", import: "default" }),
};

/**
 * srcset strings for one image.
 * @param {string} base path under src/assets without extension, e.g. "hero/hero-qlik"
 * @param {number[]} widths widths of the smaller variants, e.g. [1024]
 * @param {number} fullWidth pixel width of the full-size file
 * @returns {{ avif: string, webp: string, src: string }}
 */
export function responsiveImage(base, widths, fullWidth) {
  const file = (suffix, ext) => FILES[`./assets/${base}${suffix}.${ext}`];
  const set = (ext) => [...widths.map((w) => `${file(`-${w}`, ext)} ${w}w`), `${file("", ext)} ${fullWidth}w`].join(", ");
  return { avif: set("avif"), webp: set("webp"), src: file("", "webp") };
}
