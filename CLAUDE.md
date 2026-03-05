# STANIKK Web Design - Portfolio Website

## Overview
Single-page portfolio website for STANIKK Web Design (Ryan Stanikk's web design business). Dark theme with terracotta/orange accents, GSAP scroll animations, and responsive design.

## Tech Stack
- **Framework**: Astro (static output)
- **Animations**: GSAP 3.12.5 + ScrollTrigger (loaded via CDN with `is:inline`)
- **Styling**: CSS custom properties in `src/styles/global.css`, component styles in `<style>` blocks
- **Fonts**: Bevellier (headings) + Switzer (body) from Fontshare CDN
- **Deploy**: GitHub → Cloudflare Workers & Pages (auto-deploy on push to `main`)

## Project Structure
```
src/
  layouts/Layout.astro    # Base HTML layout, meta tags, GSAP CDN scripts, JSON-LD
  pages/index.astro       # Full single-page site (all sections, styles, GSAP scripts)
  styles/global.css       # CSS custom properties, reset, typography, utility classes
public/
  images/
    portfolio/            # Portfolio screenshots (JPEG, optimized)
    ryan-stanikk.jpg      # Profile photo (3:4 crop, 900x1200)
  favicon.svg             # Terracotta "S" on dark background
docs/plans/               # Design document
capture-screenshots.mjs   # Playwright script for portfolio screenshots
```

## Key Design Decisions

### Fonts
- **Bevellier 700**: H1-H3 headings, nav logo name, loader name
- **Bevellier 300 (Light)**: Nav links, "Web Design" sub-text, subheadings
- **Switzer 200 (Extra Light)**: Body text, descriptions, FAQ answers
- No serif fonts. No italic text anywhere.

### Color Palette
- Background: `#1A1412` (deep charcoal-brown)
- Accent: `#D4714E` (terracotta), `#E8956A` (light terracotta)
- Text: `#F5EDE4` (cream white), `#A89888` (muted grey)

### GSAP Integration
GSAP is loaded via CDN in `Layout.astro` with `is:inline` (critical - Astro strips CDN scripts without this). The main animation script in `index.astro` uses `initSite()` with a retry pattern that waits for GSAP to load before initializing. Animations include:
- Loader timeline (text fade + progress bar + curtain reveal)
- Hero entrance (heading, subtitle, CTAs stagger in)
- Scroll-triggered reveals (`.reveal`, `.reveal-left`, `.reveal-right`)
- Staggered service cards and process steps
- Interactive hero glow (radial gradient follows mouse cursor)

### Sections
1. **Loader** - "Stanikk / Web Design" two-tone reveal with terracotta progress bar
2. **Nav** - Fixed, transparent → solid on scroll, Bevellier nav links, WhatsApp icon + CTA
3. **Hero** - Large H1 with accent word, interactive mouse glow, dual CTAs
4. **About** - Split layout with profile photo + bio + stat badges
5. **Portfolio** - 2-column grid, screenshot cards with hover overlay
6. **Services** - 4 white cards (Web Design, Web Apps, Hosting, Content Management)
7. **Process** - 5 numbered steps with terracotta connecting lines
8. **FAQ** - Accordion with CSS + JS toggle
9. **Contact CTA** - WhatsApp + Email buttons
10. **Footer** - 3-column: brand, navigation, social links

## Commands
```bash
npm run dev       # Start dev server on port 4321
npm run build     # Build static site to dist/
npm run preview   # Preview built site locally
```

## Portfolio Screenshots
Run `node capture-screenshots.mjs` to recapture portfolio site screenshots using Playwright. The script handles lazy-loading by scrolling and waiting. Requires `playwright` package.

## Deployment
Pushes to `main` auto-deploy via Cloudflare Workers & Pages. Build command: `npm run build`.
Live URL: https://stanikk-web-design.rstanikk.workers.dev

## WhatsApp
All CTA buttons link to wa.me/442381112819.
