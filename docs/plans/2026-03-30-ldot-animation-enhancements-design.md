# LDOT-Inspired Animation Enhancements

**Date**: 2026-03-30
**Status**: Approved
**Inspired by**: https://www.ldot.uk/ (Framer + Lenis)

## Summary

Add 5 animation enhancements to stanikk.com inspired by ldot.uk's polished motion design. All changes are in 2 files: `Layout.astro` (CDN script) and `index.astro` (JS + minor HTML class additions).

## Changes

### 1. Lenis Smooth Scrolling (site-wide)

- Add Lenis CDN (`https://unpkg.com/lenis@1/dist/lenis.min.js`) in `Layout.astro` after GSAP scripts
- Instantiate in `initSite()` before GSAP setup: `const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })`
- Connect to GSAP ticker: `gsap.ticker.add((time) => lenis.raf(time * 1000))` and `gsap.ticker.lagSmoothing(0)`
- Replace the existing `a[href^="#"]` smooth-scroll handler with `lenis.scrollTo(target, { offset: -80 })`
- Store on `window.__lenis` for access

### 2. Hero Character Blur-Reveal

- In `initAnimations()`, split each `.hero-word-inner` span into per-character `<span>` elements via JS
- Replace the current word slide-up animation with per-character blur reveal:
  - From: `opacity: 0, filter: 'blur(12px)'`
  - To: `opacity: 1, filter: 'blur(0px)'`
  - Stagger: `0.025s` per character
  - Duration: `0.6s` per character
  - Ease: `power4.out`
- Keep the subtitle and CTA fade-in timings as-is but adjust start time to account for new reveal duration

### 3. Scale Addition to Scroll Reveals

- Modify existing `.reveal` fromTo: add `scale: 0.97` in from-state, `scale: 1` in to-state
- Same for `.reveal-left` and `.reveal-right`
- No HTML changes needed

### 4. Blur-Reveal on Section Headings

- Add class `blur-reveal` to these `<h2>` elements:
  - `#portfolio-heading` ("My Work")
  - `#services-heading` ("What I Do")
  - `#pricing-heading` ("Investment")
  - `#process-heading` ("How I Work")
  - `#faq-heading` ("Common Questions")
  - `#contact-heading` ("Ready to stand out online?")
- Remove `reveal` class from these headings (blur-reveal replaces it)
- In `initAnimations()`, query all `.blur-reveal` elements, split into character spans
- Each heading gets a ScrollTrigger-driven blur reveal (same effect as hero but scroll-triggered)
  - From: `opacity: 0, filter: 'blur(8px)'`
  - To: `opacity: 1, filter: 'blur(0px)'`
  - Stagger: `0.02s`, triggered at `start: 'top 85%'`

### 5. Spring-like Easing

- Replace `ease: 'power3.out'` with `ease: 'back.out(1.4)'` on:
  - `.reveal`, `.reveal-left`, `.reveal-right` scroll animations
  - Service card stagger
  - Pricing card stagger
  - Process step stagger

## Files Modified

- `src/layouts/Layout.astro` — Add Lenis CDN script after GSAP scripts
- `src/pages/index.astro` — JS animation code changes + add `blur-reveal` class to 6 headings

## Not Changing

- Interactive waves canvas in hero
- Loader animation sequence
- Portfolio card structure/layout
- CSS layout or visual design
- About section heading (longer text, blur-reveal would be too slow)
