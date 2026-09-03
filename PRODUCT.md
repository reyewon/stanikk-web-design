# Product

## Register

brand

## Users

Small and independent businesses in and around Southampton and Hampshire, with a strong lean towards hospitality (restaurants, takeaways, cafes, bars). Typically owner-operators who wear every hat: they are time-poor, allergic to jargon, and have usually been burned by an agency that overcharged, over-promised, or handed back something they could not maintain.

They arrive needing one specific thing (a website, a menu redesign, food photography, help with ads) but their real problem is that their web, brand, photography and marketing were built by different people and pull in different directions. The job to be done: find one trusted person who can own the whole stack end to end, explain it in plain English, and quietly fix the operational thing nobody else will touch, without making them feel small for asking.

## Product Purpose

Kombu is Ryan's one-person creative studio (kombu.uk, Southampton): web design, graphic design, commercial photography, and marketing & infrastructure. The site exists to reposition a former single-service "web design" offer as a cross-disciplinary studio, win enquiries across all four disciplines, and rank for the money keyword ("web design southampton") without diluting it.

The differentiator, and the thing the site must land, is an engineering mind paired with a designer's eye: Ryan builds the missing piece other suppliers leave on the table (sourcing a printer, wiring two systems together, re-typesetting a menu, solving the operational problem nobody owns). Success looks like a visitor understanding within one scroll that hiring Ryan replaces three or four specialists with a single accountable route, and reaching for WhatsApp.

Named as the metaphor: kombu is the quiet foundation that makes everything around it work. The whole brand is built on being the dependable base layer, not the loudest voice in the room.

## Brand Personality

Voice: first person singular ("I", never "we"), British English, direct and unshowy. No em-dashes or en-dashes anywhere, including aria-labels. No agency buzzwords, no hard sell, no hype. Confident because the work is good, not because the copy shouts.

Three words: grounded, exacting, human.

Emotional goal: **quiet confidence.** A visitor should leave thinking "this person clearly knows what they are doing, and I would trust them with the whole thing," without ever being sold to. Warmth and craft carried by typography, restraint, and real client work, not by adjectives.

Hard rule: the site never mentions AI or the tooling behind the work. It presents Ryan and the craft, full stop.

## Anti-references

The site must not look or read like any of these:

- **Generic agency site.** "We are a full-service digital agency," we/our voice, team grids, buzzword soup, an endless wall of identical service cards. This is the exact thing Kombu positions against.
- **Vibe-coded / AI slop.** The 2026 AI default: warm cream background, tiny tracked uppercase eyebrows above every section, identical icon-heading-text card grids, gradient text, the big-number hero-metric block, side-stripe borders. If it could be guessed from the category, it is wrong here.
- **Corporate SaaS landing page.** Cold navy-and-gradient, feature-grid gloss, product-marketing polish with no human behind it. Kombu is a person, not a platform.
- **Loud freelancer portfolio.** Over-animated, neon, look-at-me showreel energy that buries the actual work under effects. Motion here serves the work; it never upstages it.

## Design Principles

1. **Show the work, not the pitch.** Real client outcomes (Padharo, Kwackers, Ideal Produce, and the rest) do the persuading. Case studies and live site frames over adjectives and stock imagery.
2. **One mind, the whole stack.** Every page should reinforce that web, brand, photography and marketing come from one accountable person and pull in the same direction. Breadth is the moat; make it legible.
3. **Sell the missing piece.** Lead with the differentiator competitors cannot copy: the willingness to own the operational problem nobody else will. This is the hook, not a footnote.
4. **Earn confidence by restraint.** Quiet beats loud. Spend boldness in one place per page (a signature moment), keep everything around it disciplined, and let whitespace and typography carry the premium feel. No decoration that does not serve the point.
5. **British, plain, human.** Copy sounds like a capable person talking straight, in first-person singular British English, with zero jargon and zero hype. Clarity is the brand.

## Accessibility & Inclusion

Target **WCAG 2.2 AA** as the floor across the site.

- Body text ≥ 4.5:1, large text ≥ 3:1 against its actual background. Terracotta sections (#D4714E) use dark ink for body text because white fails AA on that surface; small accent text uses the deeper terracotta (#B05433) on light backgrounds.
- `prefers-reduced-motion` fully honoured: the same static `.no-motion` path the `?nomotion` test flag uses, so every animation has a no-motion alternative rather than being suppressed to a blank state.
- Visible keyboard focus, semantic landmarks, `aria-current` on the active nav item, and no information conveyed by colour or motion alone.
- Reveal animations enhance already-visible content; nothing is gated behind a class-triggered transition that could leave a section blank in a headless or reduced-motion render.
