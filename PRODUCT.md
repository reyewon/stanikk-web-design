# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Small and independent businesses in and around Southampton and Hampshire, with a strong lean towards hospitality (restaurants, takeaways, cafes, bars). Typically owner-operators who wear every hat: they are time-poor, allergic to jargon, and have usually been burned by an agency that overcharged, over-promised, or handed back something they could not maintain.

They arrive needing one specific thing (a website, a menu redesign, food photography, help with ads) but their real problem is that their web, brand, photography and marketing were built by different people and pull in different directions. The job to be done: find one trusted person who can own the whole stack end to end, explain it in plain English, and quietly fix the operational thing nobody else will touch, without making them feel small for asking.

## Product Purpose

Kombu is Ryan's one-person creative studio (kombu.uk, Southampton): web design, graphic design, commercial photography, and marketing & infrastructure. The site exists to reposition a former single-service "web design" offer as a cross-disciplinary studio, win enquiries across all four disciplines, and rank for the money keyword ("web design southampton") without diluting it.

The differentiator, and the thing the site must land, is an engineering mind paired with a designer's eye: Ryan builds the missing piece other suppliers leave on the table (sourcing a printer, wiring two systems together, re-typesetting a menu, solving the operational problem nobody owns). Success looks like a visitor understanding within one scroll that hiring Ryan replaces three or four specialists with a single accountable route, and reaching for WhatsApp.

Named as the metaphor: kombu is the quiet foundation that makes everything around it work. The whole brand is built on being the dependable base layer, not the loudest voice in the room.

## Positioning

One person owns the whole stack. Web, brand, photography and marketing come from a single accountable person, who also builds the missing operational piece nobody else will touch (sourcing a printer, wiring two systems together, re-typesetting a menu). A local agency cannot truthfully say this: its disciplines are separate people with a handoff between each. A DIY site builder cannot say any of it.

Confirmed by Ryan on 9 September 2026 as the claim the site leads with. The engineering mind paired with a designer's eye, the depth in hospitality and the twenty years of design are support for that claim, not claims of their own.

## Operating Context

How an engagement runs (confirmed 9 September 2026): first contact by WhatsApp (wa.me/442381112819) or email (design@kombu.uk); a coffee in Southampton or a video call; a written quote as a private page on quotes.kombu.uk (noindex, its own Cloudflare Pages project, never on the public site); the build; then hosting and care on a monthly plan. Marketing continues as an ongoing arrangement for some clients. Every conversation is with the person doing the work. There is no account manager and no handoff.

Clients are mostly hospitality owner-operators and judge the work on a phone first, so mobile is the priority for every surface. Ryan works inside their existing systems rather than replacing them: booking platforms, tills and loyalty programmes, Google Business Profile, Google Ads, Analytics and Search Console. Sites deploy to Cloudflare Pages. The studio's own channels are kombu.uk, its Google Business Profile (a service-area business in Southampton, Web Designer category), Instagram and LinkedIn.

## Capabilities and Constraints

Four disciplines, each with its own page: websites (bespoke design and build, hosted and looked after, web apps included), graphic design (identities, menus, print, editorial), commercial photography (food, interiors, product, brand, portraits), and marketing and infrastructure (strategy, ads, social and local SEO, plus the systems and sourcing that tie a business together).

Published pricing is the only pricing on the site: web plans at £49, £99 and £175 a month, or £229, £499 and £899 to build and then £29, £49 and £99 a month (repriced 25 Sep 2026), with bespoke sites quoted from £1,500 and web apps from £1,200; photography from £275 for two hours, £415 for four and £690 for a day, quoted live by the on-page calculator with its travel bands; the Hospitality Health Check from £295; the studio partnership from £950 a month. Graphic design is quoted per project and carries no published price. These figures are canonical in CLAUDE.md and mirrored in llms.txt and the JSON-LD; change all three together.

Constraints future work must keep: first person singular, British English, no em or en dashes anywhere including aria-labels and alt text; the site never mentions AI or the tooling behind the work; the repository is public, so client quotes, client PDFs and internal research stay out of git; every fact on a page is lifted from the live site or confirmed by Ryan, never inferred. Undecided product facts: none recorded.

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

## Evidence on Hand

- Four real Google reviews, quoted verbatim from the Kombu Business Profile (Ankit Vaghela of Padharo, Kirsty McCulloch of Mustang Group, Simone Jiojioras of Soleto, Mahesh Sharma of Kesarum), held in `src/data/reviews.ts`, shown on the home, web design, about and marketing pages, and mirrored in the schema only where visible. Profile: https://www.google.com/maps?cid=16407402703526049661.
- Six live client sites recorded as desktop tours in `public/videos/work/` with first-frame posters: Padharo, Grumpy Monkey, Ryan Stanikk Photography, Banana Wharf, Ark Angels, Soleto. Screenshot pairs for the Websites compartment and the web design page head: msnry and The Grand (`public/images/preview/`, `public/images/work/`).
- Five design case studies on /design with the real artwork in `public/images/design/`: Kwackers, Ideal Produce, Padharo, Build Budget Expert, Remedi Health.
- Ten client marks in the clients marquee (`public/images/clients/`): Soleto, Padharo, Banana Wharf, The Grand, Kesarum, Ryan Stanikk Photography, Ark Angels, Ennio's, Grumpy Monkey, Mustang Group.
- The photography portfolio on /photography (`public/images/photography/`), and the cutout portrait of Ryan at `public/images/ryan-cutout.webp`.
- Padharo as the worked example of one client across every discipline (website, menu, Veganuary campaign, photography), shown on the home page and on /design.
- Absences, so that nothing gets invented: no client performance figures are published or cleared for publication (Ryan's decision, 9 September 2026: the reviews and the work are the proof); no awards are claimed for Kombu, and Padharo's "award-winning" is the client's own description carried from their site, with the award unnamed here; no case-study metrics, no press, no certifications, no team.

## Product Principles

1. **Show the work, not the pitch.** Real client outcomes (Padharo, Kwackers, Ideal Produce, and the rest) do the persuading: case studies and the actual work over adjectives and stock imagery.
2. **One mind, the whole stack.** Every page should reinforce that web, brand, photography and marketing come from one accountable person and pull in the same direction. Breadth is the moat; make it legible.
3. **Sell the missing piece.** Lead with the differentiator competitors cannot copy: the willingness to own the operational problem nobody else will. This is the hook, not a footnote.
4. **Earn confidence by restraint.** Quiet beats loud. Spend boldness in one place per page and keep everything around it disciplined; no decoration that does not serve the point.
5. **British, plain, human.** Copy sounds like a capable person talking straight, in first-person singular British English, with zero jargon and zero hype. Clarity is the brand.

## Accessibility & Inclusion

Target **WCAG 2.2 AA** as the floor across the site.

- Body text ≥ 4.5:1, large text ≥ 3:1 against its actual background. Terracotta sections (#D4714E) use dark ink for body text because white fails AA on that surface; small accent text uses the deeper terracotta (#B05433) on light backgrounds.
- `prefers-reduced-motion` fully honoured: the same static `.no-motion` path the `?nomotion` test flag uses, so every animation has a no-motion alternative rather than being suppressed to a blank state.
- Visible keyboard focus, semantic landmarks, `aria-current` on the active nav item, and no information conveyed by colour or motion alone.
- Reveal animations enhance already-visible content; nothing is gated behind a class-triggered transition that could leave a section blank in a headless or reduced-motion render.
