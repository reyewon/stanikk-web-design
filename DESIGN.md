---
name: Kombu
description: The tray. Linen ground, warm ink outlines, four compartment fills, the wordmark as architecture.
status: live
colors:
  linen: "#F1EEE6"
  white: "#FFFFFF"
  ink: "#141210"
  ink-soft: "#3B352F"
  ink-mute: "#6B635A"
  ink-hover: "#2A2520"
  terracotta: "#D4714E"
  terracotta-hover: "#DE7F5C"
  kelp: "#1F4A3C"
  ochre: "#E7B44A"
  mist: "#DCD6EA"
  linen-mute: "#B9B2A7"
  linen-soft: "#D8D2C8"
  error: "#8F3A22"
typography:
  wordmark:
    fontFamily: "'Supermassive RS', 'Supermassive FB', sans-serif"
    fontSize: "min(31.4vw, 33vh) desktop, 29.8vw under 820px"
    fontWeight: 900
    lineHeight: 0.78
    letterSpacing: "-0.025em"
  nav-mark:
    fontFamily: "'Supermassive RS', 'Supermassive FB', sans-serif"
    fontSize: "1.2rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
  pagehead-title:
    fontFamily: "'Supermassive RS', 'Supermassive FB', sans-serif"
    fontSize: "min(clamp(3rem, 8.5vw, 9rem), 13cqw)"
    fontWeight: 900
    lineHeight: 0.8
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Supermassive RS', 'Supermassive FB', sans-serif"
    fontSize: "clamp(2.4rem, 5.5vw, 5.4rem)"
    fontWeight: 800
    lineHeight: 0.87
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Supermassive RS', 'Supermassive FB', sans-serif"
    fontSize: "clamp(1.7rem, 2.6vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.02em"
  cell-title:
    fontFamily: "'Supermassive RS', 'Supermassive FB', sans-serif"
    fontSize: "clamp(2.2rem, max(3.2vw, 15cqh), 8.5rem)"
    fontWeight: 800
    lineHeight: 0.85
    letterSpacing: "-0.025em"
  lead:
    fontFamily: "'Switzer', 'Switzer FB', sans-serif"
    fontSize: "clamp(1.02rem, 1.2vw, 1.15rem)"
    fontWeight: 300
    lineHeight: 1.6
    letterSpacing: "normal"
  pagehead-lead:
    fontFamily: "'Switzer', 'Switzer FB', sans-serif"
    fontSize: "clamp(1.05rem, 1.25vw, 1.3rem)"
    fontWeight: 300
    lineHeight: 1.6
    letterSpacing: "normal"
  body:
    fontFamily: "'Switzer', 'Switzer FB', sans-serif"
    fontSize: "17px"
    fontWeight: 300
    lineHeight: 1.6
    letterSpacing: "normal"
  ledger:
    fontFamily: "'Switzer', 'Switzer FB', sans-serif"
    fontSize: "clamp(1rem, 1.15vw, 1.15rem)"
    fontWeight: 300
    lineHeight: 1.6
    letterSpacing: "normal"
  control:
    fontFamily: "'Switzer', 'Switzer FB', sans-serif"
    fontSize: "0.95rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "normal"
  control-small:
    fontFamily: "'Switzer', 'Switzer FB', sans-serif"
    fontSize: "0.85rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "normal"
  chip:
    fontFamily: "'Supermassive RS', 'Supermassive FB', sans-serif"
    fontSize: "0.9rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
  tag:
    fontFamily: "'Switzer', 'Switzer FB', sans-serif"
    fontSize: "0.8rem"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "normal"
  small-print:
    fontFamily: "'Switzer', 'Switzer FB', sans-serif"
    fontSize: "0.85rem"
    fontWeight: 300
    lineHeight: 1.6
    letterSpacing: "normal"
rounded:
  pill: "999px"
  card: "28px"
  tile: "16px"
  chip: "10px"
  focus: "4px"
  circle: "50%"
spacing:
  s-1: "0.5rem"
  s-2: "1rem"
  s-3: "1.5rem"
  s-4: "2rem"
  s-5: "3rem"
  gutter: "clamp(16px, 2vw, 28px)"
  gap: "clamp(16px, 1.6vw, 22px)"
  band: "clamp(4rem, 8vw, 7.5rem)"
  sec-head: "clamp(1.5rem, 3vw, 3rem)"
components:
  pill:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 1.35rem"
  pill-fill:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 1.35rem"
  pill-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.linen}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 1.35rem"
  pill-small:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.control-small}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 1rem"
  chip:
    backgroundColor: "{colors.linen}"
    textColor: "{colors.ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 0.95rem"
  card:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "clamp(2rem, 4vw, 4.5rem)"
  card-kelp:
    backgroundColor: "{colors.kelp}"
    textColor: "{colors.linen}"
    rounded: "{rounded.card}"
    padding: "clamp(2rem, 4vw, 4.5rem)"
  card-ochre:
    backgroundColor: "{colors.ochre}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "clamp(2rem, 4vw, 4.5rem)"
  card-terracotta:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "clamp(2rem, 4vw, 4.5rem)"
  cell:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "clamp(1.25rem, 4.2cqh, 3.25rem)"
  tag:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.tag}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 1rem"
  nav:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "8px 8px 8px 22px"
    width: "min(100% - 2 * var(--gutter), 1120px)"
---

# Kombu v2: the tray

## 1. Direction

**Thesis.** One person, four disciplines, one tray. The wordmark is the lid, the four compartments underneath are the offer, the work sits inside them. It refuses the category default the old site had drifted into: centred H1, subhead, two buttons over a shader, then a grid of identical cards.

**Where it comes from.** Two references pinned by Ryan, fused rather than averaged. From EVOKE: the brand name set to the full page width as architecture, flat colour fields, no depth of any kind. From Bento: a warm linen canvas, full-bleed colour bands stacked like a lunch tray, sticker-like cards ringed in a thick ink outline, pill controls, big tightly-set type. The product supplies every fact; the references supply form.

**Signature moment.** The intro. KOMBU alone in the middle of the screen, each letter landing separately on load (a hard scale-in with a short settle, 95ms apart), then a one-way scroll sequence: the name slides to the top and locks, the nav arrives on the first scroll, and the four compartments pop in one by one under it, each committing the moment its threshold is crossed and never un-popping, before the page lets go. The page opens and closes on the wordmark: ink on linen at the top, linen on ink at the bottom.

**Rhythm.** One spacing scale (0.5 / 1 / 1.5 / 2 / 3rem). Inside any text block, heading to body is 1.5rem and body to action is 2rem, everywhere, via `.stack`. A section heading block to its grid or list is `--sec-head` (clamp(1.5rem, 3vw, 3rem), 48px on desktop) via `.sec-head`. Between sections: plain linen sections open with `--band` above; consecutive cards sit `--gap` apart.

## 2. Colour

Strategy: **full palette**, committed at page scale. Fills own whole regions; nothing is scattered as accent over a neutral ground.

| Role | Token | Value | Where |
|---|---|---|---|
| Ground | linen | #F1EEE6 | page canvas, work section, clients |
| Ink | ink | #141210 | all text, every outline, the wordmark, the footer ground |
| Compartment 1 | terracotta | #D4714E | Websites cell, contact band, the one filled pill, the print tile field |
| Compartment 2 | kelp | #1F4A3C | Photography cell, the "missing piece" band, the web tile field |
| Compartment 3 | ochre | #E7B44A | Graphic design cell, the about band |
| Compartment 4 | mist | #DCD6EA | Marketing & infrastructure cell |

Terracotta stays the brand's existing voice; kelp is the plant the studio is named after; ochre and mist balance the two warm hues with one warm and one cool neutral-ish fill.

**Contrast, measured against the actual surfaces.** Ink on linen 15.9:1. Ink on terracotta 5.7:1 (body copy passes AA). Ink on ochre 9.1:1. Ink on mist 12.6:1. Linen on kelp 8.6:1. Terracotta is never used as small text on linen (2.7:1, fails); it is a fill only, always carrying ink text.

## 3. Type

**Supermassive RS** is the only display face, in three jobs: 900 for the wordmark and the page-head titles, 800 for section headings and card titles. Ryan's ruling: the heavier the better, so nothing displays below 800. Line heights are per level (0.78 / 0.87 / 0.88), never shared. Uppercase everywhere it appears. No fallback face is needed; it covers the full character set.

**Switzer 300** for all reading copy, 400 for nav links, 500 for control labels. The identity is the weight contrast: very heavy display against light body. Never bring the body up to regular to match.

No monospace anywhere. Captions are Switzer, not a typewriter costume.

## 4. Shape and depth

**There are no shadows.** Elevation is a 2px ink outline on every card, tile, pill and image frame, exactly as both references do it. A hover is a 2px downward translate, never a lift and never a glow.

Radii by role: pills 999px for anything you press, and for the fact chip, which reads as a pill rather than a rounded box; 28px for compartments, cards, work cards, the portrait; 16px for image frames inside a compartment.

Sticker energy comes from rotation, not shadow: the print tile at -3°, the web tile at 2°, the Websites cell image at 2°, the marketing flyer at -2°, the portrait at -1.5°. One or two degrees, never more.

## 5. Layout

Reloads always open at the top; the intro is the first thing the page says. There is no content column. Every boxed grid and every band meets the same gutter, clamp(16px, 2vw, 28px), so the tray, the work cards and the wordmark share one edge at any width, including half of a 4K screen. Reading measure is capped on paragraphs (30 to 58ch by role), never on containers.

Sequence, and why each section exists:

1. **The intro**: on load, the wordmark alone, centred, grown to the gutters. Scrolling slides it to the top (and on a short screen shrinks it so the tray fits beneath) over the first fifth of a pinned stage; the four compartments then pop in one after another with a slight overshoot; when all four are in the stage releases and the page scrolls normally. No strapline, no button: the tray is the pitch. Phones skip the pin and reveal each compartment as it arrives.
2. **The tray**: four compartments on a 12-column grid, sized 7/5 then 5/7 so no two rows match. Each cell is a size container above phone width, so title, copy, chips and tile are set in cqh and scale with the cell, filling a 750px compartment on a 4K half as fully as a 300px one on a laptop. Every one the same skeleton: a title at up to 6.2rem with its one line of copy, a fact chip (a real price from pricing.md) and the action pinned to the bottom, and the work as a tilted tile bleeding out of the bottom-right corner behind the text. Each is one link to its discipline page.
3. **The missing piece** (kelp card): the page's single crafted line, the paragraph that explains the differentiator, one filled pill. A card, not a band: the compartment shape at page width, separated from the tray by the tray gap.
4. **Selected work**: three live site frames in outlined cards, name and one line beneath, a Visit pill. Hover pans the full-page capture; the live iframe mounts on approach.
5. **Ryan Stanikk** (ochre card): portrait tile with the introduction video playing on hover (a Say hello cue toggles it anywhere), bio with the two facts folded into the prose, More about me.
6. **Clients**: ink logos on linen in a marquee, ruled top and bottom, with no visible label; the logos say it.
7. **Tell me what you're trying to do** (terracotta card): the heading matches the first words of the copy beneath it; the three contact routes as pills in one row.
8. **Footer**: the lid. Full width, ink, with the card radius on its top corners so the page closes the way its compartments open; the wordmark again, inverted; one row of links; copyright and email.

Mobile: everything stacks in the same order, the nav pill keeps the mark, a Menu pill and the WhatsApp pill, and Menu opens the five links as a stacked sheet inside the same outlined pill, the wordmark drops to 29.8vw so it stays inside the gutter, the tray becomes one column.

## 6. Motion

One authored moment: the intro sequence (letters land on load, the wordmark slides up and locks, the nav arrives, the four pop-ins commit one way). Lenis smooths the wheel. Nothing else animates on scroll. The marquee drifts and pauses on hover. Work cards pan on hover. `prefers-reduced-motion` and `?nomotion` freeze all of it and render the resting state, with lazy images forced eager for static captures.

Lenis for the scroll feel, at the same lerp the main site uses. No GSAP, no shader.

## 7. Copy rules carried over

First person singular, British English, no em or en dashes anywhere including aria-labels, never mentions AI. Headers are plain labels except the one crafted line. No eyebrows or kickers above any heading. No full stops on headers. Every fact on the page is lifted from the live site; nothing new is claimed.

## 8. Components

- **Pill**: 2px ink outline, 999px, Switzer 500, padding 0.85rem 1.35rem (0.6rem 1rem small). Variants: filled terracotta (the primary action, ink text), filled ink (on terracotta only), outline (everything else). On kelp the outline and label go linen.
- **Compartment**: 2px ink outline, 28px, padding clamp(1.4rem, 2.2vw, 2rem), a fill from the four, title 700, one sentence, a small outline pill pinned to the bottom, an image frame at 16px.
- **Chip**: a fact in a linen pill with a 2px ink outline, Supermassive 700 at 0.9rem uppercase. Only ever carries a checkable figure.
- **Work card**: outline frame around a 1024:1366 viewport, poster beneath a live iframe, title and line and Visit pill in a row beneath.
- **Floating nav**: white, 2px ink, 999px, 1120px max, mark left, links centre, terracotta pill right. Under 820px the links collapse behind a Menu pill (aria-expanded, no JS dependency for the rest of the page) and open as a sheet under the top row.
- **Focus**: 3px ink ring on light surfaces; on ink and kelp the ring switches to linen so it is never invisible.

## 9. Do and don't

Do keep every outline at 2px ink. Do keep terracotta as a fill that carries ink text. Do keep the wordmark edge to edge on every viewport. Do keep headers flat.

Don't add a shadow, a gradient, a glass effect, an eyebrow, a section number, or a fifth fill. Don't set terracotta as small text on linen. Don't animate sections on scroll. Don't let a compartment become an icon-heading-text card.

## 10. Interior pages (rolled out)

Every interior page is the tray applied to one discipline. Same nav, same footer lid, same contact card; only the opening fill and the middle change.

**Opening card (PageHead).** A full-width card in the discipline's own fill, directly under the nav: h1 at the wordmark weight (900, `clamp(3rem, 8.5vw, 9rem)`), the page's existing lede at `clamp(1.05rem, 1.25vw, 1.3rem)` capped at 44ch, then one row of a fact chip and two pills; a real piece of work in a 4/3 outlined tile at 2° on the right. Websites terracotta (title and lede white, the lede at 24px minimum so white on terracotta clears AA as large text), Photography kelp, Graphic design ochre, Marketing mist (a three-tile collage instead of the single tile). Web design puts Selected work straight under the head, then the four services as a 2x2 of white cards with their list items as tags; Marketing puts the Health Check card second and folds How I help into a mist strip. About opens on the ochre portrait card instead (h1 "An engineering mind, a designer's eye", the bio, three fact chips).

**Ledger.** Plain-label lists (What I build, What I design, How I help, One trusted route) are rows ruled with 2px ink, title 4/12 and copy 8/12, never a grid of cards. Copy at `clamp(1rem, 1.15vw, 1.15rem)`, 58ch.

**FAQ.** Native `details`/`summary`, ruled rows, a drawn "+" that turns to "×". No script.

**Page-specific pieces.** Pricing: three outlined tiers, Business as a kelp fill with a "Most popular" chip, a segmented pill switch (Monthly / Pay upfront). How I work: five columns in an ochre card, ruled between, no numbers. Free review: kelp card with the URL field as a linen-outlined pill and a terracotta submit. Case studies: five cards alternating white, kelp, white, mist, white, each with its own image layout, tags as chips, every image opening the lightbox. Gallery: three-column masonry of outlined 16px tiles, ordered so the columns finish level. Instant quote: the calculator inside a mist card, categories as pills, fields as white pills capped at 640px, the result a white card. Health Check: kelp card, eight categories ruled in linen, offer row with the price chip. Infrastructure: four white outlined cards, the owner's line as the title. Studio partnership: ochre card, price in display type.

**Lightbox.** Ink overlay, image in a linen 2px outline at 16px, a linen Close pill, Escape and outside-click close, Lenis paused while open, off under reduced motion.

**Nav on interior pages** is shown from load (there is no intro to wait for); reloads keep their anchor. The home page still opens at the top.
