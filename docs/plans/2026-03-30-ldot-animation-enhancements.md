# LDOT-Inspired Animation Enhancements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Lenis smooth scrolling, character blur-reveal animations, scale reveals, and spring easing to stanikk.com inspired by ldot.uk.

**Architecture:** All changes are in 2 files. Lenis CDN added to Layout.astro. All animation JS changes in the `<script>` block of index.astro (lines 1920-2523). Six `<h2>` headings get a class change from `reveal` to `blur-reveal`.

**Tech Stack:** Lenis 1.x (CDN), GSAP 3.12.5 + ScrollTrigger (already loaded)

---

### Task 1: Add Lenis CDN to Layout.astro

**Files:**
- Modify: `src/layouts/Layout.astro:285` (after ScrollTrigger CDN)

**Step 1: Add Lenis script tag**

After line 285 (`ScrollTrigger.min.js`), add:

```html
<script is:inline src="https://unpkg.com/lenis@1/dist/lenis.min.js"></script>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: add Lenis smooth scroll CDN to Layout"
```

---

### Task 2: Initialise Lenis and connect to GSAP

**Files:**
- Modify: `src/pages/index.astro:1921-1929` (initSite function top)

**Step 1: Update the library check to include Lenis**

Replace lines 1922-1926:

```js
    // @ts-ignore
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(initSite, 100);
      return;
    }
```

With:

```js
    // @ts-ignore
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Lenis === 'undefined') {
      setTimeout(initSite, 100);
      return;
    }
```

**Step 2: Add Lenis instantiation after `gsap.registerPlugin(ScrollTrigger)`**

After line 1929, add:

```js
    // @ts-ignore
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    // @ts-ignore
    window.__lenis = lenis;
    // @ts-ignore
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    // @ts-ignore
    gsap.ticker.lagSmoothing(0);
```

**Step 3: Replace the smooth-scroll anchor handler (lines 2360-2373)**

Replace the entire `// Smooth scroll` block:

```js
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  ...
});
```

With:

```js
    // Smooth scroll via Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          // @ts-ignore
          window.__lenis.scrollTo(target, { offset: -80 });
        }
      });
    });
```

**Step 4: Verify dev server**

Run: `npm run dev`
Open http://localhost:4321 in browser, scroll should feel smooth and buttery. Anchor links should smoothly scroll to sections.

**Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: initialise Lenis smooth scrolling with GSAP ticker sync"
```

---

### Task 3: Hero character blur-reveal

**Files:**
- Modify: `src/pages/index.astro:2375-2393` (initAnimations hero section)

**Step 1: Add character-split helper function**

At the top of the `<script>` block (just inside `function initSite()`, after the Lenis setup), add a helper:

```js
    function splitChars(el) {
      const text = el.textContent;
      el.textContent = '';
      el.style.display = 'inline-flex';
      const chars = [];
      for (const char of text) {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.filter = 'blur(12px)';
        el.appendChild(span);
        chars.push(span);
      }
      return chars;
    }
```

**Step 2: Replace the hero animation in initAnimations() (lines 2376-2393)**

Replace:

```js
      // Hero entrance - word reveal effect
      // @ts-ignore
      const heroTl = gsap.timeline();

      // Words slide up into view with stagger
      const wordInners = document.querySelectorAll('.hero-word-inner');
      heroTl.to(wordInners, {
        y: 0,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.08,
      }, 0);

      // Subtitle and CTAs fade in after words reveal
      heroTl
        .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.8)
        .to('.hero-ctas', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.0)
        .to('.hero-scroll-indicator', { opacity: 1, duration: 0.6 }, 1.2);
```

With:

```js
      // Hero entrance - character blur reveal
      // @ts-ignore
      const heroTl = gsap.timeline();

      // Split each word into characters and collect all char spans
      const wordInners = document.querySelectorAll('.hero-word-inner');
      const allChars = [];
      wordInners.forEach(word => {
        // Reset the slide-up transform so word is in position
        // @ts-ignore
        word.style.transform = 'translateY(0)';
        const chars = splitChars(word);
        allChars.push(...chars);
      });

      // @ts-ignore
      heroTl.to(allChars, {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.6,
        ease: 'power4.out',
        stagger: 0.025,
      }, 0);

      // Subtitle and CTAs fade in after character reveal completes
      const charRevealDuration = 0.6 + (allChars.length * 0.025);
      heroTl
        // @ts-ignore
        .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.4)' }, charRevealDuration * 0.6)
        // @ts-ignore
        .to('.hero-ctas', { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.4)' }, charRevealDuration * 0.7)
        // @ts-ignore
        .to('.hero-scroll-indicator', { opacity: 1, duration: 0.6 }, charRevealDuration * 0.85);
```

**Step 3: Verify in browser**

Run dev server, reload page. After loader, hero text should blur-reveal character by character.

**Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: hero character blur-reveal animation replacing word slide-up"
```

---

### Task 4: Change heading classes from `reveal` to `blur-reveal`

**Files:**
- Modify: `src/pages/index.astro` lines 116, 186, 261, 400, 460

**Step 1: Update 5 headings**

Change each `class="reveal"` to `class="blur-reveal"` on these lines:

- Line 116: `<h2 class="reveal" id="portfolio-heading">` → `<h2 class="blur-reveal" id="portfolio-heading">`
- Line 186: `<h2 class="reveal" id="services-heading">` → `<h2 class="blur-reveal" id="services-heading">`
- Line 261: `<h2 class="reveal" id="pricing-heading">` → `<h2 class="blur-reveal" id="pricing-heading">`
- Line 400: `<h2 class="reveal" id="process-heading">` → `<h2 class="blur-reveal" id="process-heading">`
- Line 460: `<h2 class="reveal" id="faq-heading">` → `<h2 class="blur-reveal" id="faq-heading">`

Also add `blur-reveal` class to line 553:
- `<h2 id="contact-heading">` → `<h2 class="blur-reveal" id="contact-heading">`

**Step 2: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add blur-reveal class to section headings"
```

---

### Task 5: Scroll-triggered blur-reveal for section headings

**Files:**
- Modify: `src/pages/index.astro` (in initAnimations, after the hero animation block)

**Step 1: Add scroll-triggered blur-reveal for `.blur-reveal` headings**

Insert after the hero animation block (before the `// Scroll reveals` comment):

```js
      // Section heading blur-reveal on scroll
      document.querySelectorAll('.blur-reveal').forEach(heading => {
        const chars = splitChars(heading);
        // @ts-ignore
        gsap.to(chars, {
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.02,
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });
```

**Step 2: Verify in browser**

Scroll down the page. Each section heading should blur-reveal character by character as it enters the viewport.

**Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: scroll-triggered character blur-reveal on section headings"
```

---

### Task 6: Add scale to scroll reveals + spring easing

**Files:**
- Modify: `src/pages/index.astro:2397-2502` (all scroll reveal animations)

**Step 1: Update `.reveal` animation (around line 2399)**

Change from-state from `{ opacity: 0, y: 30 }` to `{ opacity: 0, y: 30, scale: 0.97 }`.
Change to-state to include `scale: 1` and change ease from `'power3.out'` to `'back.out(1.4)'`.

```js
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30, scale: 0.97 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.8,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
```

**Step 2: Update `.reveal-left` animation**

Change from `{ opacity: 0, x: -40 }` to `{ opacity: 0, x: -40, scale: 0.97 }`.
Add `scale: 1` to to-state, change ease to `'back.out(1.4)'`.

**Step 3: Update `.reveal-right` animation**

Same pattern: add `scale: 0.97` in from, `scale: 1` in to, ease `'back.out(1.4)'`.

**Step 4: Update service cards stagger (around line 2452)**

Change ease from `'power3.out'` to `'back.out(1.4)'`.

**Step 5: Update pricing cards stagger (around line 2471)**

Change ease from `'power3.out'` to `'back.out(1.4)'`.

**Step 6: Update process steps stagger (around line 2490)**

Change ease from `'power3.out'` to `'back.out(1.4)'`.

**Step 7: Verify in browser**

Scroll through all sections. Elements should have a subtle scale-up and slight overshoot as they enter.

**Step 8: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add scale to scroll reveals and spring-like easing"
```

---

### Task 7: Final verification

**Step 1: Full build check**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 2: Full visual pass**

Run: `npm run preview`
Walk through the entire page:
- Loader plays normally
- Hero characters blur-reveal after loader
- Smooth scrolling feels buttery throughout
- Anchor links scroll smoothly with offset
- Section headings blur-reveal on scroll
- All other elements have scale + spring easing on reveal
- Mobile responsive still works (resize browser)

**Step 3: Commit any fixes if needed**
