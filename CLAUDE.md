# Kombu - Creative Studio Website

## Overview
Multi-page studio website for Kombu (kombu.uk), Ryan's one-person creative studio in Southampton: web design, graphic design, commercial photography, and marketing & infrastructure. Light cream theme with dark charcoal sections and terracotta accents. Anti-agency positioning, first person singular ("I", never "we"), British English, no em/en dashes anywhere in copy or aria-labels. Never mention AI tooling on the site.

## Design context (impeccable)
Strategic and visual design are documented for agent reference: `PRODUCT.md` (register `brand`, users, purpose, the five design principles, four anti-references, WCAG 2.2 AA floor) and `DESIGN.md` (the tray: linen ground, warm ink outlines, four compartment fills, the wordmark as architecture, real extracted tokens, type/colour/shape rules, component specs). The retired v1 design doc (North Star "The Quiet Foundation") is kept at `.retired-v1/DESIGN-v1.md` for reference; `DESIGN-v2.md` stays alongside `DESIGN.md` as the original prototype writeup. Machine-readable sidecar at `.impeccable/design.json` still describes the retired v1 tokens/components (shadows, 8px radii, bottom dock) and has not been regenerated for the tray system; run `/impeccable document` to refresh it before trusting it for design passes. Live-mode config at `.impeccable/live/config.json` (injects into `Layout.astro`). Read PRODUCT.md + DESIGN.md before design work; run `/impeccable <command>` (critique, audit, polish, live) for design passes.

## Tech Stack
- **Framework**: Astro 5 (static output). No View Transitions, no `<ClientRouter />`; each page is a full navigation.
- **Animations**: Lenis only (CDN, `is:inline`), for scroll smoothing. No GSAP, no ScrollTrigger, no shader. The home page carries one authored moment, a scroll-pinned intro (wordmark lands, slides to the top, the four tray compartments pop in), built by hand in `Layout.astro`'s inline scripts. `prefers-reduced-motion` and the `?nomotion` query flag both add `.no-motion`, which freezes the intro, the portrait-video hover and the live-frame pan, and forces lazy images eager for static captures.
- **Styling**: one stylesheet, `src/styles/site.css`, imported by `Layout.astro`. CSS custom properties for all colours; never raw hex inside rules. No shadows, no gradients: elevation is a 2px ink outline on every card, tile, pill and image frame, and a hover is a 2px downward translate.
- **Fonts**: Supermassive RS (display, self-hosted, `/fonts/SupermassiveRS-{I,II,III}.woff2` at weights 700/800/900) + Switzer (body) from Fontshare. Supermassive RS is Ryan's own licensed cut of Supermassive, made with the original author's permission, with custom-drawn punctuation, so it covers the full character set and needs no fallback face and no `unicode-range`. Bevellier has been removed from the system entirely. The superseded trial files (`Supermassive-*.woff2`) stamp a rotated "TRIAL" watermark over every non-alphanumeric glyph, so if punctuation renders as a tiny rotated word, the wrong file is loaded.
- **Deploy**: `wrangler pages deploy ./dist --project-name=kombu-web-design --branch=main --commit-dirty=true` (branch=main is production). No git auto-deploy.

## Pages
| Route | Purpose |
|---|---|
| `/` | Studio hub: pinned wordmark intro with the four-compartment tray (Websites/Photography/Graphic design/Marketing), the "missing piece" kelp card, Selected Work (three live site cards), about teaser (ochre card with portrait video), clients marquee, contact card |
| `/web-design` | SEO anchor ("web design southampton"): terracotta PageHead, services, Selected Work (six sites), pricing tiers with monthly/upfront segmented toggle, process strip, FAQ (7 items via `Faq.astro`, mirrored in FAQPage schema) |
| `/design` | Graphic design: ochre PageHead, disciplines ledger, from-prices, case studies |
| `/photography` | Kelp PageHead, category-filterable masonry gallery, instant quote calculator inline in the page (Google Places + postcodes.io), FAQ |
| `/marketing` | Mist PageHead (three-image collage), services, Hospitality Health Check (8 categories, from £295), infrastructure ask-cards, studio partnership from £950/mo, FAQ |
| `/about` | Ochre portrait card ("Say hello" video cue), one-trusted-route ledger, onward pills to the four disciplines, clients marquee, contact card |

## Architecture notes
- `src/layouts/Layout.astro`: the whole document. Head carries meta/OG/Twitter/geo/PWA/favicons and the JSON-LD base graph (WebSite + ProfessionalService/LocalBusiness + Person) merged with each page's `extraSchema` prop, same props interface as before (`title`, `description`, `canonical`, `ogImage*`, `ogType`, `extraSchema`); body carries every client script (Lenis bootstrap, the pinned intro sequence, portrait-video hover, mobile menu, lightbox, live site frames) plus the service worker registration. `<slot name="head" />` lets a page add its own head content (the photography page uses it for the Google Places script). A noscript block forces the floating nav visible and collapses the pinned intro's scroll padding, mirroring what `.no-motion` already does, since without JS the nav would otherwise sit permanently at `opacity:0`.
- No separate runtime component: `SiteRuntime.astro`, `Rail.astro`, `BottomNav.astro` and `Loader.astro` are retired. Navigation is `Nav.astro`, a single floating pill nav shared by every page (desktop and mobile alike): white, 2px ink outline, the wordmark left, links centre, a WhatsApp pill right; under 820px the links collapse behind a Menu pill that opens as a stacked sheet. `Footer.astro` is the shared ink lid at the bottom of every page.
- The quote calculator lives inline in `photography.astro` (no separate `QuoteCalculator.astro` component): same pricing logic as before (RACK 2h £275 / 4h £415 / 8h £690, takeaway x1.25, multi-day x0.9, local independent x0.8 only when a verified distance <=30mi and not London, travel bands £0/£40/£90/£150, London £80, round to £5). London text-detection only applies to postcode-shaped input; coordinates use the bounds check. Maps key is referrer-restricted to kombu.uk + localhost.
- Shared interior-page components: `PageHead.astro` (the opening full-width fill card under the nav, h1 + lede + fact chip + two pills + an image or collage), `Ledger.astro` (ruled plain-label rows, not cards), `Faq.astro` (native `details`/`summary` accordion, no JS), `ContactCard.astro` (the terracotta contact card, WhatsApp/call/email pills), `Marquee.astro` (clients marquee).
- Portfolio/work cards: home shows three (Padharo, Grumpy Monkey, Ryan Stanikk Photography); `/web-design` shows all six (Grumpy Monkey, Padharo, Ryan Stanikk, Banana Wharf, Ark Angels, Soleto). Live iframes mount on approach and pan the poster on hover, same behaviour as before, now implemented directly in `Layout.astro`'s inline script with the GSAP/Lenis-specific parts removed (plain `requestAnimationFrame`).
- `?nomotion` query param renders any page statically (used by screenshot tooling), same as before.

### Colour tokens (linen theme)
- Ground: `--c-linen #F1EEE6`, ink `--c-ink #141210` (all text and every 2px outline)
- Four compartment fills: terracotta `#D4714E` (Websites), kelp `#1F4A3C` (Photography), ochre `#E7B44A` (Graphic design), mist `#DCD6EA` (Marketing & infrastructure)
- Terracotta and kelp carry ink or linen body text respectively (never small terracotta text on linen, which fails AA); see `DESIGN.md` for the full contrast table

## Client quotes: quotes.kombu.uk (separate Pages project)
Private, `noindex` quote documents live in `quotes/<slug>/index.html` and deploy to their **own** Cloudflare Pages project `kombu-quotes` (custom domain `quotes.kombu.uk`), NOT to the main site. Keeps client pricing off kombu.uk and gives each quote a clean URL like `https://quotes.kombu.uk/toqeer/`.

- `build-quotes.mjs` assembles `dist-quotes/` = `quotes/**` plus the shared brand fonts (`public/fonts`) and favicons, so the fonts are never duplicated in the repo. `dist-quotes/` is gitignored.
- `quotes/_redirects` sends the bare subdomain to kombu.uk (there is no quote index); `quotes/robots.txt` disallows everything.
- Quote pages are standalone single-file HTML using the same tokens as the site: Supermassive RS display (uppercase, 800, no fallback face needed), Switzer body, terracotta accent, 8/12/16px radii, and a nine-step type ramp declared in `:root`. Type rules follow the site exactly: h1 line-height 0.8, h2 0.87, h3 0.88, body and links Switzer 300 at 16px. Sticky section headers are only for grid layouts where the heading column sits beside scrolling content, never on full-width headers.
- `public/nova-quote/` stays on the main site because that link was already sent to the client; new quotes go to the subdomain only.

## Commands
```bash
npm run dev            # dev server on 4321
npm run build          # static build to dist/
npm run preview        # preview built site
npm run build:quotes   # assemble dist-quotes/ for quotes.kombu.uk
node capture-screenshots.mjs   # recapture portfolio browser screenshots (Playwright)
```

## Pricing (canonical, keep visible copy + JSON-LD + llms.txt in sync)
- Web: Starter £49/mo or £199 build (then £29/mo), Business £79/mo or £299 (then £49/mo), Professional £149/mo or £499 (then £99/mo)
- Design: logo & identity from £450, menu from £250, print from £150, guidelines from £600
- Photography: calculator (see above)
- Marketing: Health Check from £295; studio partnership from £950/mo

## Deployment
- **Primary domain**: https://kombu.uk (Cloudflare Pages project `kombu-web-design`)
- **Quotes subdomain**: https://quotes.kombu.uk (Cloudflare Pages project `kombu-quotes`), deployed with `npm run build:quotes` then `npx wrangler pages deploy ./dist-quotes --project-name=kombu-quotes --branch=main`
- **Legacy domain**: https://stanikk.com (301 to kombu.uk)
- Deploy via wrangler (above) or the `cf-pages-deploy` MCP (`deploy_with_checks` for lighthouse + screenshots)
- **Cloudflare settings**: "Always Use HTTPS", SSL Full

## SEO & Analytics
- **Google Analytics**: GA4 tag `G-5H2CJESBZ0` in Layout.astro. Property "Kombu Web Design" (id `527363222`), web stream `https://kombu.uk` (stream id `13777297531`). NB the property sits under the "Padharo" GA account grouping for historical reasons - it can be moved via Admin > Property > Move property. A duplicate property "STANIKK Web Design" (id `527498503`, measurement id `G-L4S3K5GTY5`) under the Photography account is an unused leftover.
- **Google Search Console**: `kombu.uk` is a verified Domain property (DNS TXT `google-site-verification=nS6463BJc67U3pJ-olsNRlEwWx0eWaSZvtX-3MaKRkk` in Cloudflare). Sitemap `https://kombu.uk/sitemap-index.xml` submitted. GSC linked to the Kombu GA4 property.
- **Cloudflare analytics**: proxied zone, server-side analytics always on. Client-side Web Analytics RUM beacon not yet enabled (dash > Web Analytics > automatic setup).
- **JSON-LD**: shared base graph in Layout.astro (WebSite + ProfessionalService/LocalBusiness "Kombu" + Person), per-page WebPage/Service/BreadcrumbList via the `extraSchema` prop. FAQPage schemas live on `/web-design` (7 items, first is the "What is Kombu?" entity definition), `/photography` (3) and `/marketing` (3) - each **must mirror its page's visible FAQ items exactly** (they are generated from the same `faqs` array, so edit that array only). Service schemas carry `areaServed` Hampshire + United Kingdom and `hasOfferCatalog` with real prices. No `aggregateRating` until real Google reviews exist.
- **AEO/GEO**: `public/llms.txt` (entity, services, pages, pricing incl. renewals, clients) - update when pricing/clients change. `robots.txt` allows AI answer-engine bots.
- **Google Business Profile**: live and verified, service-area business (Southampton, no map pin), Web Designer category. Canonical URL `https://www.google.com/maps?cid=16407402703526049661` wired into schema `sameAs` + `hasMap`. Outstanding: add photos; collect reviews.

## Contact
- **WhatsApp**: all CTAs link to wa.me/442381112819
- **Email**: design@kombu.uk (forwards to photography@ryanstanikk.co.uk via Cloudflare Email Routing)
- **Phone**: +442381112819
