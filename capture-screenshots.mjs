import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const SITES = [
  { url: 'https://soleto-website.pages.dev', file: 'public/images/portfolio/soleto.jpg' },
  { url: 'https://arkangelsband.com', file: 'public/images/portfolio/ark-angels.jpg' },
  // ?embed=1 switches these sites into embed mode (no cookie banners or
  // on-load popups), so the captures come out clean.
  { url: 'https://www.padharo.co.uk/?embed=1', file: 'public/images/portfolio/padharo.jpg' },
  { url: 'https://www.ennios.co.uk/?embed=1', file: 'public/images/portfolio/ennios.jpg' },
  // Grumpy Monkey sends no X-Frame-Options and no CSP, and carries no cookie
  // banner or on-load popup, so it needs neither embed mode nor a host gate.
  { url: 'https://www.grumpy-monkey.co.uk/', file: 'public/images/portfolio/grumpy-monkey.jpg' },
  { url: 'https://www.bananawharf.co.uk/?embed=1', file: 'public/images/portfolio/banana-wharf.jpg' },
  { url: 'https://www.ryanstanikk.co.uk/?embed=1', file: 'public/images/portfolio/ryanstanikk.jpg' },
];

// Pass keywords as CLI args to capture a subset, e.g.
//   node capture-screenshots.mjs ennios banana ryanstanikk
const FILTER = process.argv.slice(2);
const ACTIVE = FILTER.length
  ? SITES.filter((s) => FILTER.some((f) => s.url.includes(f) || s.file.includes(f)))
  : SITES;

const VIEWPORT_WIDTH = 1024;
const VIEWPORT_HEIGHT = 1366;

async function capture(site) {
  const browser = await chromium.launch();
  try {
    await captureWith(browser, site);
  } finally {
    // Always close: a navigation timeout used to leave the Chromium process
    // running, and repeated failures leaked one browser per site.
    await browser.close();
  }
}

async function captureWith(browser, site) {
  const context = await browser.newContext({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    deviceScaleFactor: 1,
  });
  // Banana Wharf: pre-seed the venue selection so the homepage captures in
  // its Ocean Village state with no marina modal or consent banner. The keys
  // are meaningless to every other site.
  await context.addInitScript(() => {
    try {
      localStorage.setItem('bw:location', 'ocean-village');
      localStorage.setItem('bw:consent', 'denied');
      localStorage.setItem('bw:modal-seen', '1');
    } catch (e) {}
  });
  const page = await context.newPage();

  console.log(`Loading ${site.url}...`);

  // Belt and braces alongside ?embed=1: until every site has deployed its
  // embed mode, strip known overlays in-page so captures stay clean.
  const stripOverlays = () => page.evaluate(() => {
    document.documentElement.classList.add('is-embedded', 'embedded');
    // Hide with CSS rather than removing nodes: React-managed DOM (Banana
    // Wharf) crashes to its error boundary if elements vanish under it.
    if (!document.getElementById('capture-overlay-hider')) {
      const selectors = [
        '[aria-label="Cookie consent"]',            // Banana Wharf consent banner
        '[aria-labelledby="marina-modal-title"]',   // Banana Wharf venue selector
        '.loader', '#loader',                        // splash loaders
        '.popup-backdrop', '.popup-modal',           // Padharo promo popup
        '[id*="cookie" i]', '[class*="cookie-banner" i]', '[class*="cookie-consent" i]',
        '.cky-consent-container', '.cky-overlay', '.cky-modal', '.cky-btn-revisit-wrapper', // CookieYes (Ennio's, via GTM)
      '[aria-label="Cookies"]', '[aria-label="Refurbishment notice"]', // Soleto
      ];
      const style = document.createElement('style');
      style.id = 'capture-overlay-hider';
      style.textContent = selectors.join(', ') + ' { display: none !important; visibility: hidden !important; }'
        // Clamp horizontal overflow (tickers, off-canvas panels): otherwise a
        // fullPage screenshot widens past the viewport and breaks pan geometry.
        + ' html, body { overflow-x: clip !important; }';
      document.head.appendChild(style);
    }
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
  });

  // Check the response: an unchecked goto treats a 404 or 503 as success and
  // silently overwrites a good poster with the error page, still printing "Saved".
  const response = await page.goto(site.url, { waitUntil: 'load', timeout: 60000 });
  if (!response) throw new Error('no response from ' + site.url);
  if (!response.ok()) throw new Error(`HTTP ${response.status()} from ${site.url}`);
  // Some sites have continuous animations and never reach networkidle, so just give them a fixed window
  await page.waitForTimeout(3000);

  // Wait for any popup detection scripts to run, then clear whatever showed
  await page.waitForTimeout(1500);
  await stripOverlays();

  // Force lazy-loaded images: scroll through the page slowly
  console.log('  Triggering lazy-load by scrolling...');
  await page.evaluate(async () => {
    const distance = 300;
    const delay = 100;
    const maxScrolls = 100;
    for (let i = 0; i < maxScrolls; i++) {
      const before = window.scrollY;
      window.scrollBy(0, distance);
      await new Promise(r => setTimeout(r, delay));
      if (window.scrollY === before) break;
    }
    // Scroll back to top so screenshot starts at the top
    window.scrollTo(0, 0);
  });

  // Give images time to finish loading after scroll
  await page.waitForTimeout(2000);

  // Wait for outstanding images, but never indefinitely: loading="lazy"
  // images that scrolled out of the viewport again may simply never load,
  // which used to hang this step forever. Cap it at 8 seconds.
  await page.evaluate(() =>
    Promise.race([
      Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise(resolve => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', resolve);
          }))
      ),
      new Promise(resolve => setTimeout(resolve, 8000)),
    ])
  );

  await page.waitForTimeout(500);
  // Scroll-triggered overlays (e.g. Banana Wharf's venue modal arms on first
  // scroll) may have appeared during the lazy-load pass: clear them again.
  await stripOverlays();

  console.log(`  Capturing full-page screenshot...`);
  // Clip to the viewport width explicitly. The overflow-x clamp above cannot
  // catch everything (Grumpy Monkey has a fixed .grit texture layer and a
  // ticker that together push body.scrollWidth to 1193), and a capture wider
  // than SITE_WIDTH renders at a different scale to the 1024px live iframe,
  // which breaks the pan geometry in the browser cards.
  const pageHeight = await page.evaluate(() => Math.max(
    document.documentElement.scrollHeight, document.body.scrollHeight,
    document.documentElement.offsetHeight, document.body.offsetHeight,
  ));
  const buffer = await page.screenshot({
    fullPage: true,
    clip: { x: 0, y: 0, width: VIEWPORT_WIDTH, height: pageHeight },
    type: 'jpeg',
    quality: 80,
  });

  writeFileSync(site.file, buffer);
  console.log(`  ✓ Saved ${site.file} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

// A filter that matches nothing used to print "Done." and exit 0 with every
// screenshot left stale, which reads exactly like a successful run.
if (FILTER.length && !ACTIVE.length) {
  console.error(`✗ No sites match ${JSON.stringify(FILTER)}. Nothing captured.`);
  process.exit(1);
}

for (const site of ACTIVE) {
  try {
    await capture(site);
  } catch (err) {
    console.error(`✗ Failed for ${site.url}:`, err.message);
    process.exitCode = 1;   // never report success when a poster is stale
  }
}

console.log('\nDone.');
