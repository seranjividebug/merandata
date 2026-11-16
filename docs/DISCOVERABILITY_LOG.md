# Discoverability log

Running record of the discoverability / AI-search upgrade. One section per phase.

## Phase 1: architecture audit (2026-11-16)

**Done**
- Audited stack, routes, anchors, data files, crawler view, access and status behaviour, SSR blockers.
- Compared vite-react-ssg, React Router framework mode, custom script, Vike, Astro/Next.
- Chose **vite-react-ssg 0.8.9** (keeps React 18 / React Router 6 / Vite 5).

**Files changed**
- `docs/AUDIT.md` (new)
- `docs/DISCOVERABILITY_LOG.md` (new)

No application code was changed.

**Evidence**
- Raw built HTML is the same 1,307-byte shell on every route (`docs/AUDIT.md` section 5).
- Status-code matrix for preview, the Cloudflare Worker and meridanta.com (section 6).
- Unknown paths and `robots.txt`/`sitemap.xml`/`llms.txt` return HTML with 200 everywhere.

**Open TODOs**
- Is meridanta.com staying on Hostinger or moving to Cloudflare? It decides which 404/redirect and AI-crawler settings apply.
- Confirm trailing-slash policy in Phase 3.
- Verify the Cloudflare Workers Builds Node version in Phase 2.
