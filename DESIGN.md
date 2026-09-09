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
    backgroundColor: "{colors.mist}"
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

**Signature moment.** The wordmark. KOMBU alone at the full page width, each letter landing separately on load (a short drop-and-settle, 65ms apart), one line of positioning copy beneath it, and the tray directly under that, all in normal flow. The earlier scroll-pinned sequence (the name sliding to the top and locking, the compartments popping in one by one) was retired on 8 September 2026: it had to fit the fold at every viewport and needed a new patch for each screen size, where a content-height opening does not. The page opens and closes on the wordmark: ink on linen at the top, linen on ink at the bottom.

**Rhythm.** One spacing scale (0.5 / 1 / 1.5 / 2 / 3rem). Inside any text block, heading to body is 1.5rem and body to action is 2rem, everywhere, via `.stack`. A section heading block to its grid or list is `--sec-head` (clamp(1.5rem, 3vw, 3rem), 48px on desktop) via `.sec-head`. Between sections: plain linen sections open with `--band` above; consecutive cards sit `--gap` apart.

## 2. Colour

Strategy: **full palette**, committed at page scale. Fills own whole regions; nothing is scattered as accent over a neutral ground.

| Role | Token | Value | Where |
|---|---|---|---|
| Ground | linen | #F1EEE6 | page canvas, work section, clients |
| Ink | ink | #141210 | all text, every outline, the wordmark, the footer ground |
| Compartment 1 | terracotta | #D4714E | Websites cell, the about card, the one filled pill |
| Compartment 2 | kelp | #1F4A3C | Photography cell, the "One brand, kept together" copy card, the web tile field |
| Compartment 3 | ochre | #E7B44A | Graphic design cell, the contact card |
| Compartment 4 | mist | #DCD6EA | Marketing & infrastructure cell |

Terracotta stays the brand's existing voice; kelp is the plant the studio is named after; ochre and mist balance the two warm hues with one warm and one cool neutral-ish fill.

**Contrast, measured against the actual surfaces.** Ink on linen 15.9:1. Ink on terracotta 5.7:1 (body copy passes AA). Ink on ochre 9.1:1. Ink on mist 12.6:1. Linen on kelp 8.6:1. Terracotta is never used as small text on linen (2.7:1, fails); it is a fill only, always carrying ink text.

## 3. Type

**Supermassive RS** is the only display face, in two jobs: 900 for the wordmark alone, 800 for page-head titles, section headings and card titles. Ryan's ruling: the heavier the better, so nothing displays below 800. Line heights are per level (0.78 / 0.87 / 0.88), never shared. Uppercase everywhere it appears. No fallback face is needed; it covers the full character set.

**Switzer 300** for all reading copy, 400 for nav links, 500 for control labels. The identity is the weight contrast: very heavy display against light body. Never bring the body up to regular to match.

No monospace anywhere. Captions are Switzer, not a typewriter costume.

## 4. Shape and depth

**There are no shadows.** Elevation is a 2px ink outline on every card, tile, pill and image frame, exactly as both references do it. A hover is a 2px downward translate, never a lift and never a glow.

Radii by role: pills 999px for anything you press, and for the fact chip, which reads as a pill rather than a rounded box; 28px for compartments, cards, work cards, the portrait; 16px for image frames inside a compartment.

Sticker energy comes from rotation, not shadow: the print tile at -3°, the web tile at 2°, the compartment example pairs at 3° and -3°, the marketing flyer at -2°, the portrait at -1.5°. One or two degrees, never more.

## 5. Layout

Reloads of the home page always open at the top; the wordmark is the first thing the page says. There is no content column. Every boxed grid and every band meets the same gutter, clamp(16px, 2vw, 28px), so the tray, the work cards and the wordmark share one edge at any width, including half of a 4K screen. Reading measure is capped on paragraphs (30 to 58ch by role), never on containers.

Sequence, and why each section exists:

1. **The opening**: the wordmark at the gutters, letters landing on load. Beneath it, one line of positioning copy on the left and the studio's name and place on the right. Then the four compartments as a two-by-two grid, each a card with the copy on the left, two overlapping tilted examples in a square art box on the right, and a ruled footer holding the fact and a See the work pill. The art box is in flow and sized by its column, so the pair scales with the card at every width and never collides with the heading. Content sets the height; nothing is pinned. Under 1200px each card stacks copy, art and footer; under 760px the tray is one column.
2. **The tray**: four compartments in a two-by-two grid of equal columns, the page gap between them, all in normal flow. Each is a card rather than a link: 2px ink outline, 28px, a fill from the four, and inside it two columns, the copy on the left (title at up to 64px, one sentence at 17px) and a square art box on the right holding the pair of examples, the back tile top-right at 3 degrees and the front tile bottom-left at minus 3, each 65% of the box, so the pair scales with the card at every width and never meets the heading. A ruled footer runs the full card width: the fact on the left (a real figure from the site) and a See the work outline pill on the right, and that pill is the link to the discipline page. Hovering or focusing the card opens the two tiles a degree further apart. Under 1200px the copy, art and footer stack; under 760px the tray is one column.
3. **One brand, kept together**: a kelp copy card (sticky beside its proof on desktop) saying that Padharo's photography, menus, website, social and strategy all come from the same person, next to a proof grid of the website, the menu and the Veganuary campaign, each with a small captioned label. Beneath, an ochre note carries the page's single crafted line, "Whatever the missing piece is, I build it", with a Tell me what you need pill. A card and a note, not a band.
4. **Selected work**: three recorded website tours in outlined 36:25 frames, name and one line beneath, a Visit pill. Each recording holds on the moving hero and pauses on selected sections. Visible previews play automatically on desktop and mobile; a shared control pauses playback, and reduced motion shows the matching first-frame posters.
5. **Ryan Stanikk** (terracotta card): the portrait is a cutout sitting on the card itself, no frame. Its bottom slice is tucked under the card's bottom outline and its head rises past the card's top edge; when the text column is taller, as on the about page, the head sits inside the card instead. The cutout drifts a few pixels against the card as it crosses the viewport. No hover state. Bio with the two facts folded into the prose, More about me.
6. **Proof**: four real Google reviews in a static two-by-two grid, stacking on phones. Ankit Vaghela’s Padharo excerpt leads in mist with a larger quote and a link to his full review; the other cards are white. All have five stars and a ruled line above the name, under a plain heading with a linked "5.0 from 4 Google reviews" pill; the clients marquee follows straight after with no band between them, ink logos on linen and no visible label, so the words and the marks read as one block.
7. **Tell me what you're trying to do** (ochre card, ink text): the heading matches the first words of the copy beneath it; the three contact routes as outline pills in one row, labelled WhatsApp, Call and Email so they hold one line on a phone.
8. **Footer**: the lid. Full width, ink, with the card radius on its top corners so the page closes the way its compartments open; the wordmark again, inverted; one row of links; copyright and email.

Mobile: everything stacks in the same order, the nav is visible from the first paint (nothing is pinned, so nothing waits), the nav pill keeps the mark, a Menu pill and the WhatsApp pill, and Menu opens a tray of its own: a full-screen linen sheet with the five sections as filled compartments (terracotta, ochre, kelp, mist, white) that pop in one after another, the current page ringed in ink, and WhatsApp, Call and Email centred along the bottom, the wordmark drops to 29.8vw so it stays inside the gutter, the tray becomes one column with each compartment's pair of tiles still overlapping and tilted under the copy.

## 6. Motion

One authored moment: the wordmark landing on load, each letter dropping a few pixels from a hair oversize and settling, 65ms apart. Lenis smooths the wheel. The portrait cutout drifts a few pixels against its card as it crosses the viewport. Nothing else animates on scroll. The marquee drifts and pauses on hover. A tray card's two examples tilt a degree further apart on hover. Recorded work previews play while they are the nearest visible card (three on desktop, one on a phone), stop off screen, and a Pause previews pill holds them. `prefers-reduced-motion` and `?nomotion` freeze all of it, show the first-frame posters, and force lazy images eager for static captures.

Lenis for the scroll feel, at the same lerp the main site uses. No GSAP, no shader.

## 7. Copy rules carried over

First person singular, British English, no em or en dashes anywhere including aria-labels, never mentions AI. Headers are plain labels except the one crafted line. No eyebrows or kickers above any heading. No full stops on headers. Every fact on the page is lifted from the live site; nothing new is claimed.

## 8. Components

- **Pill**: 2px ink outline, 999px, Switzer 500, padding 0.85rem 1.35rem (0.6rem 1rem small). Variants: filled terracotta (the primary action, white text, Ryan's call over the AA figure), filled ink (on terracotta only), outline (everything else). On kelp the outline and label go linen.
- **Compartment**: 2px ink outline, 28px, a fill from the four; copy on the left (title 800, one sentence), a square art box on the right with two overlapping 13px-radius example tiles at 3 and minus 3 degrees, and a ruled footer with the fact on the left and a See the work outline pill on the right. The pill is the link.
- **Chip**: a fact in a linen pill with a 2px ink outline, Supermassive 700 at 0.9rem uppercase. Only ever carries a checkable figure.
- **Work card**: outlined 36:25 frame containing a recorded desktop website tour and matching poster. Title, description and Visit pill below; captions use the available width. Three columns on wide screens, two on tablets and one on phones.
- **Floating nav**: white, 2px ink, 999px, 1120px max, mark left, links centre, terracotta pill right. Under 768px the links collapse behind a Menu pill that opens the full-screen tray menu (five filled compartments on linen, the contact routes centred beneath); Close, Escape or a link shuts it and the page scroll is held while it is open. Nav links are Switzer 500 in full ink.
- **Focus**: 3px ink ring on light surfaces; on ink and kelp the ring switches to linen so it is never invisible.

## 9. Do and don't

Do keep every outline at 2px ink. Do keep terracotta as a fill that carries ink text. Do keep the wordmark edge to edge on every viewport. Do keep headers flat.

Don't add a shadow, a gradient, a glass effect, an eyebrow, a section number, or a fifth fill. Don't size a section to fit the fold; content sets the height. Don't set terracotta as small text on linen. Don't animate sections on scroll. Don't let a compartment become an icon-heading-text card.

## 10. Interior pages (rolled out)

Every interior page is the tray applied to one discipline. Same nav, same footer lid, same contact card; only the opening fill and the middle change.

**Opening card (PageHead).** A full-width card in the discipline's own fill, directly under the nav: h1 at the heading weight (800, `clamp(3rem, 8.5vw, 9rem)`), the page's existing lede at `clamp(1.05rem, 1.25vw, 1.3rem)` capped at 44ch, then one row of a fact chip and two pills; a real piece of work in a 4/3 outlined tile at 2° on the right. Websites terracotta (title and lede white, the lede at 24px minimum so white on terracotta clears AA as large text, and two of Ryan's cropped screenshots stacked like a compartment's tiles in place of the single tile), Photography kelp, Graphic design ochre, Marketing mist (a three-tile collage instead of the single tile). Web design puts Selected work straight under the head, then the four services as a 2x2 of white cards with their list items as tags; Marketing puts the Health Check card second and folds How I help into a mist strip. About opens on the terracotta portrait card instead (h1 "An engineering mind, a designer's eye", the one-line lede and three fact chips beside the cutout, so the card's height follows the cutout, not the bio); the three bio paragraphs follow in their own linen section, the first at lead size across both columns, the other two side by side.

**Ledger.** Plain-label lists (What I build, What I design, How I help, One trusted route) are rows ruled with 2px ink, title 4/12 and copy 8/12, never a grid of cards. Copy at `clamp(1rem, 1.15vw, 1.15rem)`, 58ch.

**FAQ.** Native `details`/`summary`, ruled rows, a drawn "+" that turns to "×". No script.

**Page-specific pieces.** Pricing: three outlined tiers, Business as a kelp fill with a "Most popular" chip, a segmented pill switch (Monthly / Pay upfront). How I work: five columns in an ochre card, ruled between, no numbers. Free review: kelp card with the URL field as a linen-outlined pill and a terracotta submit. Case studies: five cards alternating white, kelp, white, mist, white, each with its own image layout, tags as chips, every image opening the lightbox. Gallery: three-column masonry of outlined 16px tiles, ordered so the columns finish level. Instant quote: the calculator inside a mist card, categories as pills, fields as white pills capped at 640px, the result a white card. Health Check: kelp card, eight categories ruled in linen, offer row with the price chip. Infrastructure: four white outlined cards, the owner's line as the title. Studio partnership: ochre card, price in display type.

**Lightbox.** Ink overlay, image in a linen 2px outline at 16px, a linen Close pill, Escape and outside-click close, Lenis paused while open, off under reduced motion.

**Nav on interior pages** is shown from load (there is no intro to wait for); reloads keep their anchor. The home page still opens at the top.
