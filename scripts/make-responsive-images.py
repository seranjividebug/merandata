"""Creates responsive AVIF and WebP variants of the large images (run once after changing a source image).

Source files stay in src/assets (the full-size WebP). Output: <name>-<width>.webp and <name>.avif / <name>-<width>.avif next to it. Needs Pillow with AVIF support.
    python scripts/make-responsive-images.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "src" / "assets"
# Hero images are shown full width but at least ~850 px wide (cover crop), so 1024 and full size are enough.
SOURCES = {
    "hero/hero-qlik.webp": (1024,),
    "hero/hero-ai.webp": (1024,),
    "hero/hero-healthcare.webp": (1024,),
    "hero/hero-consulting.webp": (1024,),
    "qlik-platform.webp": (640, 1024),
}


def save(img: Image.Image, path: Path, fmt: str) -> None:
    if fmt == "avif":
        img.save(path, quality=55, speed=6)
    else:
        img.save(path, quality=80, method=6)
    print(f"{path.relative_to(ROOT)}  {img.width}x{img.height}  {path.stat().st_size // 1024} KB")


for rel, widths in SOURCES.items():
    src = ROOT / rel
    full = Image.open(src).convert("RGB")
    stem = src.with_suffix("")
    save(full, stem.with_suffix(".avif"), "avif")
    for w in widths:
        small = full.resize((w, round(full.height * w / full.width)), Image.LANCZOS)
        save(small, Path(f"{stem}-{w}.webp"), "webp")
        save(small, Path(f"{stem}-{w}.avif"), "avif")
