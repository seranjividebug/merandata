# Meridanta Corporate Website (React + Vite)

Single-page corporate website built from *MD Website Design v1.0*.

## Quick look (no install)
Open `preview/meridanta-website.html` in any browser (fully self-contained; internet only needed for the font).

## Run locally
Requires Node.js 18 or newer.

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build for hosting
```bash
npm run build    # output in dist/
```
Upload the contents of `dist/` to any static host (Hostinger, Netlify, Vercel, Azure Static Web Apps, etc.).
A ready-built `dist/` folder is already included.

## Project structure
```
src/
  App.jsx                 page layout and section order
  data.js                 ALL website copy (edit text here)
  styles.css              design tokens (colors, fonts) and styles
  utils.js                smooth scrolling helper
  assets/                 approved MD logo (color + white)
  components/
    Header.jsx            sticky header + mobile menu
    Hero.jsx              3-slide carousel (6s, fade, pause, keyboard)
    HeroArt.jsx           slide illustrations (dashboard, AI, data pipeline)
    Services.jsx          What We Do + How We Work
    Industries.jsx        Healthcare, Communications/Media/Entertainment tabs
    Products.jsx          HCInsights, Qlik Accelerators, Data Platforms + CTA band
    About.jsx             About Meridanta
    Contact.jsx           contact form + US/India visual
    Footer.jsx            footer + privacy dialog
```

## Brand colors (src/styles.css)
| Token | Hex |
|---|---|
| Navy (hero, footer) | `#0C1230` |
| Plum (logo M) | `#42116F` |
| Orchid | `#9B4DA8` |
| Rose (logo D) | `#EC5FAE` |
| Ink (text) | `#1B1D2B` |
| Mist (light sections) | `#F6F5FA` |

Font: Plus Jakarta Sans (Google Fonts).

## Before launch (to confirm)
- **Contact form delivery:** `sendInquiry()` in `src/components/Contact.jsx` is simulated. Connect it to the real form service and confirm the receiving inbox.
- **Company details:** the legal entity name and business email in the footer.
- **Privacy policy:** the full text, replacing the placeholder dialog.
- **Additional industries** (Insurance, Banking & Financial Services, Enterprise Technology): add them to `INDUSTRIES` in `src/data.js` when content is approved.
