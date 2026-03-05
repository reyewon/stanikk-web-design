# STANIKK Web Design - Portfolio Website Design Doc

## Overview
A single-page portfolio website for STANIKK Web Design, Ryan Stanikk's web design business. Inspired by webhero.co's dark, bold aesthetic but adapted with an orange/terracotta color palette. Built with Astro + GSAP, deployed to Cloudflare Pages via GitHub.

## Brand
- **Name**: STANIKK Web Design (subtle in header, not prominent)
- **Tone**: Direct, confident, no-nonsense. Function meets form.
- **Target**: Businesses needing professional websites, web apps, hosting, and domain services

## Color Palette

| Role | Hex | Description |
|------|-----|-------------|
| Primary BG | `#1A1412` | Deep charcoal-brown |
| Secondary BG | `#2A2018` | Dark warm brown |
| Card Surface | `#3A2E24` | Elevated surface |
| Accent Primary | `#D4714E` | Burnt orange/terracotta |
| Accent Highlight | `#E8956A` | Warm light terracotta |
| Text Primary | `#F5EDE4` | Off-white cream |
| Text Secondary | `#A89888` | Muted warm grey |
| Borders | `#4A3E34` | Subtle warm line |

## Typography

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Headings (H1-H3) | Bevellier | 700 | Bold, condensed, uppercase |
| Subheadings (H4-H6) | Bevellier | 400-500 | Lighter weights for hierarchy |
| Body | Switzer | 200 (Extra Light) | Clean sans-serif, no italics anywhere |
| Nav/UI | Switzer | 300-400 | Slightly heavier for nav elements |

**No serif fonts. No italic text. All sans-serif.**

## Sections (in order)

### 1. Loading Screen
- "STANIKK" centered, Bevellier 700, uppercase
- Terracotta progress bar at bottom
- Curtain reveal transition into hero

### 2. Hero
- **Nav**: STANIKK logo (small, subtle) left, nav links center, WhatsApp icon + CTA right. Transparent on hero, solid on scroll.
- **Headline**: Bold, catchy H1 in Bevellier 700 - the star of the section. NOT the brand name. Something like "I DESIGN WEBSITES THAT WORK AS HARD AS YOU DO" with the key word highlighted in terracotta.
- **Subtitle effect**: A subtle, interactive mouse-hover effect beneath the H1. Could be a particle field, a gradient mesh that follows the cursor, or glowing terracotta dots that react to mouse position. Subtle, not distracting.
- **Sub-copy**: One line in Switzer Extra Light about the approach
- **CTAs**: "See My Work" (filled terracotta) + "WhatsApp Me" (outlined terracotta)

### 3. About / Profile
- Split layout: photo placeholder left, text right
- Bio highlighting 17+ years design/marketing, photography background, design-first philosophy
- Stat badges: "17+ Years Design" | "Commercial Photographer" | "Southampton, UK"
- GSAP scroll-triggered text reveals

### 4. Portfolio
- Section heading uppercase Bevellier + "SEE MY WORK" arrow link right
- Card grid: screenshots of Padharo, ryanstanikk.co.uk, Texas Grill, Soleto
- Hover reveals: project name, brief description, "View Site" link
- Subtle parallax on images
- Warm-toned background panels behind cards

### 5. Services
- 4-column white card layout on dark background
- Terracotta icon/badge at top of each
- Services: Web Design, Web Apps, Hosting & Domains, Content Management
- Bold heading, description, bullet points, CTA per card
- Staggered scroll-trigger animations

### 6. Process
- Stepped layout: Discovery > Design > Build > Launch > Support
- Icon + heading + description per step
- Connected by terracotta line
- Sequential GSAP scroll reveals

### 7. FAQ
- Accordion with Bevellier headings for questions
- Switzer Extra Light body for answers
- GSAP expand/collapse animations
- Topics: pricing, timelines, inclusions, CMS, hosting

### 8. Contact / CTA
- Terracotta-tinted background panel
- Bold headline: "READY TO STAND OUT ONLINE?"
- WhatsApp CTA + email
- Simple contact form

### 9. Footer
- Dark background, STANIKK logo, nav links, social links
- Copyright, privacy placeholder

## Animations (GSAP + ScrollTrigger)
- Scroll-triggered fade/slide reveals for text and cards
- Character/word split animations on headings
- Parallax depth on images
- Card lift + shadow on hover
- Loading intro with brand reveal
- Smooth scroll behavior
- Interactive mouse-reactive effect under hero H1
- Nav transparency transition on scroll

## Technical Stack
- **Framework**: Astro (static output)
- **Animations**: GSAP + ScrollTrigger
- **Styling**: CSS custom properties, no framework
- **Fonts**: Self-hosted or CDN (Bevellier, Switzer)
- **SEO**: Semantic HTML5, meta tags, Open Graph, JSON-LD structured data
- **Performance**: Static HTML output, optimized images, lazy loading
- **Responsive**: Mobile-first
- **Deploy**: GitHub > Cloudflare Pages

## WhatsApp
- Number: +442381112819 (same as photography site)
- wa.me link for CTA buttons

## Portfolio Sites (for screenshots)
- padharo.co.uk
- ryanstanikk.co.uk
- texas-grill.pages.dev
- soleto-website.pages.dev
