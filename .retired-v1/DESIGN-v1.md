---
name: Kombu
description: Southampton creative studio, web, design, photography and marketing from one mind.
colors:
  terracotta: "#D4714E"
  terracotta-light: "#E8956A"
  terracotta-deep: "#B05433"
  error: "#B0472F"
  warm-white: "#FAF7F4"
  warm-sand: "#F0EBE5"
  warm-elevated: "#F5F0EB"
  card-white: "#FFFFFF"
  ink: "#1A1412"
  ink-secondary: "#3A3028"
  ink-muted: "#6A5E52"
  border: "#E0D8D0"
  charcoal-bg: "#1A1412"
  charcoal-text: "#F5EDE4"
  charcoal-muted: "#A89888"
  charcoal-body: "#C4B8AA"
  charcoal-border: "#4A3E34"
typography:
  display:
    fontFamily: "Supermassive RS, 'Supermassive FB', sans-serif"
    fontSize: "clamp(2.6rem, 10.5vw, 10rem)"
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Supermassive RS, 'Supermassive FB', sans-serif"
    fontSize: "clamp(2.4rem, 6vw, 5rem)"
    fontWeight: 800
    lineHeight: 0.87
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Supermassive RS, 'Supermassive FB', sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 0.88
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Switzer, 'Switzer FB', sans-serif"
    fontSize: "16px"
    fontWeight: 200
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Supermassive RS, 'Supermassive FB', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.1em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2rem"
  xl: "3rem"
  2xl: "4rem"
  3xl: "6rem"
  section: "clamp(4rem, 8vw, 8rem)"
components:
  button-primary:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.md}"
    padding: "1rem 2rem"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.terracotta-light}"
    textColor: "{colors.card-white}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.terracotta}"
    rounded: "{rounded.md}"
    padding: "1rem 2rem"
    typography: "{typography.label}"
  button-outline-hover:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.card-white}"
---

# Design System: Kombu

## 1. Overview

**Creative North Star: "The Quiet Foundation"**

Kombu is the dependable base layer under a brand, the thing everything else rests on, so the design carries itself the same way: structural, unhurried, and confident without raising its voice. The surface is a warm off-white that recedes; the work (real client sites, menus, photography, campaigns) sits on top and does the talking. Boldness is spent in exactly one place per page, a signature moment such as the shader hero or a numbered case-study plinth, and everything around it stays disciplined so that moment reads as a decision, not decoration.

The system deliberately escapes the "warm-cream-plus-terracotta" AI monoculture it superficially resembles. It does so through a self-hosted display face (Supermassive RS, a licensed custom cut) that no template ships, deep charcoal sections that break the light theme into chapters, an editorial numbered case-study language on the design page, and motion that is choreographed rather than sprinkled. The warmth lives in the type, the imagery and the restraint, not in a soft beige gradient.

Voice throughout is first person singular and plainly British: grounded, exacting, human. The interface should feel like a capable person talking straight, never like an agency performing scale.

**Key Characteristics:**
- Warm off-white base that recedes so client work is the loudest thing on screen.
- One saturated terracotta accent, used sparingly, as the single brand voice.
- Deep charcoal sections used as structural chapter breaks, not decoration.
- Big self-hosted display type against extralight body text: a deliberate weight contrast.
- Quiet by default; boldness rationed to one signature moment per page.

## 2. Colors

A warm-neutral canvas carrying a single saturated terracotta voice, with a deep charcoal counter-surface for contrast chapters.

### Primary
- **Terracotta** (#D4714E): the one brand voice. Primary CTAs, active nav indicators, the hero mark, accents and links. Used on a small share of any screen; its rarity is what makes it read as intentional.
- **Terracotta Light** (#E8956A): hover state for primary buttons and warm hover glows only. Never a primary fill at rest.
- **Terracotta Deep** (#B05433): the AA-safe terracotta for small text and links on light backgrounds, where the base terracotta would fail contrast. Small-text accent work uses this, not the brighter primary.

### Neutral (light surfaces)
- **Warm White** (#FAF7F4): the default body background. It recedes; it is never the subject.
- **Warm Sand** (#F0EBE5): secondary section background for gentle banding between light sections.
- **Warm Elevated** (#F5F0EB): raised surfaces that need to lift a half-step off the base without going pure white.
- **Card White** (#FFFFFF): true white, reserved for cards and media frames that must feel crisp against the warm base.
- **Ink** (#1A1412): primary text. Near-black with a warm cast; the workhorse reading colour.
- **Ink Secondary** (#3A3028): sub-headings and secondary copy.
- **Ink Muted** (#6A5E52): captions, meta, supporting labels. Still AA on the warm base; do not push lighter.
- **Border** (#E0D8D0): hairline dividers and card edges on light surfaces.

### Neutral (charcoal chapters)
- **Charcoal** (#1A1412): the dark section and footer background. Used as a deliberate chapter break (about, process, footer), not a theme toggle.
- **Charcoal Text** (#F5EDE4): headings on charcoal.
- **Charcoal Body** (#C4B8AA): body copy on charcoal; AA against the dark ground.
- **Charcoal Muted** (#A89888): meta and supporting text on charcoal.
- **Charcoal Border** (#4A3E34): dividers on charcoal.

### Supporting
- **Error** (#B0472F): form validation and error states, tuned to the palette so it never looks like a bootstrap red.

### Named Rules
**The One Voice Rule.** Terracotta is the only saturated colour in the system and appears on a small share of any screen. Do not introduce a second accent hue; range and interest come from the charcoal/warm-white contrast and from typography, never from more colours.

**The Dark-Ink-On-Terracotta Rule.** White text fails WCAG AA on the terracotta surface (#D4714E). Any body text sitting on a terracotta fill uses dark ink (#1A1412), and small terracotta text on light backgrounds uses Terracotta Deep (#B05433). This is non-negotiable, not a stylistic preference.

## 3. Typography

**Display Font:** Supermassive RS (self-hosted; Ryan's licensed cut of Supermassive with custom-drawn punctuation, so it needs no fallback face)
**Body Font:** Switzer (with a metric-matched local fallback, "Switzer FB", to hold layout before the webfont activates)

**Character:** A high-contrast pairing by weight and role, not two lookalike sans-serifs. Supermassive RS is a heavy, tightly-set display face that gives headings physical presence; Switzer is a clean, quiet grotesque set extralight for body, so the page reads as loud-headline / calm-prose. The contrast axis is weight and scale, which is what keeps the pairing from feeling templated.

### Hierarchy
- **Display** (800, clamp(2.6rem, 10.5vw, 10rem), line-height 0.8, tracking -0.02em): hero headlines only. Uppercase, one per page.
- **Headline** (800, clamp(2.4rem, 6vw, 5rem), line-height 0.87): section headings.
- **Title** (700, clamp(1.5rem, 3vw, 2.5rem), line-height 0.88): card and case-study titles.
- **Body** (200, 16px, line-height 1.6): all reading copy, set deliberately extralight against the heavy display. Cap measure at 65-75ch. Primary ink (#1A1412) keeps the light weight legible; do not also lighten the colour.
- **Label** (500, 0.875rem, tracking 0.1em, uppercase): buttons, eyebrows and nav labels, set in the display family for a small-caps utility voice.

### Named Rules
**The Heading-Stack Rule (read this before styling any heading, on any surface).** Every heading on every Kombu surface, the site's pages, the quote documents on quotes.kombu.uk, and any one-off HTML, uses this exact stack:

```css
font-family: 'Supermassive RS', 'Supermassive FB', sans-serif;
text-transform: uppercase;
font-weight: 800;   /* 700 for card titles */
```

**Supermassive RS is the heading face, and the only one.** It is Ryan's own licensed cut of Supermassive, drawn with permission from the original author, with custom punctuation replacing the trial's watermark glyphs. It therefore covers the full character set alone: apostrophes, ampersands, quotes, brackets, %, £, ? and / all render in the display face. No fallback face sits behind it, and Bevellier is no longer part of the system at all. A page whose headings render in a serif or in the body face is mis-built, not a variant. `'Supermassive FB'` is only the metric-matched local-Arial stand-in that holds layout before the webfont activates.

**Line heights are per level, never shared:** h1 `0.8`, h2 `0.87`, h3 `0.88`. The face wants to set tighter as it grows.

**The Weight-Contrast Rule.** Never pair Supermassive with another heavy sans, and never bring the body up to regular "to match". The extralight-body against heavy-display contrast is the identity; flattening it makes the page generic.

**The Full-Set Rule.** Supermassive RS covers the whole character set, so never reintroduce a punctuation fallback, never split a heading across two faces, and never restrict it with `unicode-range`. The superseded trial (`Supermassive-*.woff2`, family `Supermassive TRIAL`) stamps a rotated "TRIAL" watermark over every non-alphanumeric glyph: if punctuation ever renders as a small rotated word, the wrong file is loaded.

## 4. Elevation

A soft, ambient shadow system on an otherwise flat surface. Surfaces are flat at rest; shadows are diffuse and warm-tinted (built on the ink colour, rgba(26, 20, 18, ...)), and they mostly appear as a response to state (hover, lift) rather than sitting heavy by default. Depth is warm and quiet, never a hard drop shadow.

### Shadow Vocabulary
- **Resting card** (`box-shadow: 0 2px 20px rgba(26, 20, 18, 0.05)`): the barely-there lift that separates a white card from the warm base.
- **Hover lift** (`box-shadow: 0 12px 30px rgba(26, 20, 18, 0.14)`): paired with a -2px translate on interactive cards and buttons.
- **Accent glow** (`box-shadow: 0 8px 24px rgba(212, 113, 78, 0.3)`): the one terracotta-tinted shadow, reserved for the primary button hover so the brand colour blooms on press.
- **Floating chrome** (`box-shadow: 0 14px 36px rgba(26, 20, 18, 0.16)`): the mobile bottom dock and other floating navigation.
- **Lightbox media** (`box-shadow: 0 30px 90px rgba(0, 0, 0, 0.6)`): full-screen image overlays only, where a deep shadow is doing real work.

### Named Rules
**The Warm-Shadow Rule.** Shadows are built on the ink hue (rgba(26, 20, 18, ...)), never pure black, so depth stays inside the warm world. The only coloured shadow allowed is the terracotta accent glow on primary hover.

## 5. Components

### Buttons
- **Shape:** gently rounded (8px, `--radius-md`); pill-free, corner-consistent with cards.
- **Primary:** terracotta fill (#D4714E), white label, uppercase Supermassive at 0.1em tracking, padding 1rem 2rem.
- **Hover / Focus:** lifts -2px into Terracotta Light (#E8956A) with the terracotta accent-glow shadow; visible keyboard focus required.
- **Outline:** transparent with a 2px terracotta border and terracotta label; on hover it fills terracotta with a white label and the same -2px lift. This is the quiet secondary action.

### Cards / Containers
- **Corner Style:** 8-16px depending on scale (`--radius-md` to `--radius-xl`); consistent within a section.
- **Background:** Card White (#FFFFFF) or Warm Elevated (#F5F0EB) against the warm base; charcoal (#1A1412) inside dark chapters.
- **Shadow Strategy:** resting-card shadow at rest, hover-lift on interaction (see Elevation). Refined and restrained: depth appears as a response, not a default.
- **Border:** hairline #E0D8D0 on light surfaces where a card needs definition without a shadow.
- **Internal Padding:** generous, `--space-lg` (2rem) and up. Air is part of the quiet-confidence feel.

### Inputs / Fields
- **Style:** light stroke on white, 8px radius, comfortable padding, body type at readable size.
- **Focus:** terracotta border shift with a soft focus ring; never a bare browser outline.
- **Error:** #B0472F border and message text, palette-tuned; error copy states what to fix, in the interface's voice.

### Navigation
- **Desktop:** an editorial vertical side rail on the right (`--rail-w` 64px), cream surface, stroke icons, a terracotta active bar. It is scroll-governed on the home page (hidden at the top, slides in past the hero) and always present on interior pages. `transition:persist` so it survives View Transitions.
- **Mobile:** a floating app-style bottom dock replaces the rail: five labelled tabs (Home, Websites, Design, Photo, Marketing), blurred cream pill, terracotta active-bar bookmark and terracotta active label. Same scroll-governed-on-home, always-in-on-interior behaviour.
- **Active state:** server-rendered for first paint, re-synced per page-load, marked with `aria-current="page"`.

### Signature: Numbered Case-Study Plinths
On the design page, client work is presented as an editorial sequence (01-05) with ghost numerals and plinth panels, each case study a distinct layout. The numbering is legitimate here because it is a real ordered sequence of work, not scaffolding bolted above every section.

### Signature: Shader Hero + Masked Roll
The home hero pairs a mesh-gradient shader with a once-per-session masked vertical type roll (disciplines roll up through a baseline mask, then resolve into the persistent headline). This is the single bold moment on the page; everything below it stays quiet.

## 6. Do's and Don'ts

### Do:
- **Do** keep terracotta (#D4714E) as the only saturated colour, on a small share of any screen (The One Voice Rule).
- **Do** put dark ink (#1A1412) on terracotta fills and use Terracotta Deep (#B05433) for small terracotta text on light backgrounds; verify body text hits AA (≥4.5:1).
- **Do** preserve the weight contrast: heavy Supermassive display against extralight (200) Switzer body.
- **Do** use charcoal (#1A1412) sections as deliberate chapter breaks between light sections.
- **Do** spend boldness on one signature moment per page and keep everything around it restrained.
- **Do** honour `prefers-reduced-motion` with the static `.no-motion` path, and keep content visible by default so reveals enhance rather than gate it.
- **Do** write first person singular, British English, with no em-dashes or en-dashes anywhere including aria-labels.

### Don't:
- **Don't** let this become **vibe-coded AI slop**: no tiny tracked uppercase eyebrow above every section, no identical icon-heading-text card grids, no gradient text (`background-clip: text`), no big-number hero-metric block.
- **Don't** use side-stripe borders (a `border-left`/`border-right` greater than 1px as a coloured accent). Use full borders, background tints or leading numerals instead.
- **Don't** drift toward a **generic agency** look: no "we/our" voice, no team grid, no wall of identical service cards, no buzzwords.
- **Don't** drift toward **corporate SaaS**: no cold navy-and-gradient, no feature-grid gloss with no human behind it.
- **Don't** drift toward a **loud freelancer portfolio**: motion serves the work and never upstages it; no neon, no over-animation.
- **Don't** introduce a second accent hue, hard pure-black shadows, or bring the body weight up to regular. Each one flattens the identity.
- **Don't** mention AI or the tooling behind the work anywhere on the site.
