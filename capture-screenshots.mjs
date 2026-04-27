import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const SITES = [
  { url: 'https://soleto-website.pages.dev', file: 'public/images/portfolio/soleto.jpg' },
  { url: 'https://ark-angels-cardover.pages.dev', file: 'public/images/portfolio/ark-angels.jpg' },
  { url: 'https://www.padharo.co.uk', file: 'public/images/portfolio/padharo.jpg' },
];

const VIEWPORT_WIDTH = 1024;
const VIEWPORT_HEIGHT = 1366;

async function capture(site) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log(`Loading ${site.url}...`);
  await page.goto(site.url, { waitUntil: 'load', timeout: 60000 });
  // Some sites have continuous animations and never reach networkidle, so just give them a fixed window
  await page.waitForTimeout(3000);

  // Wait for any popup detection scripts to run and hide
  await page.waitForTimeout(1500);

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

  // Wait for all images to load
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images)
        .filter(img => !img.complete)
        .map(img => new Promise(resolve => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve);
        }))
    )
  );

  await page.waitForTimeout(500);

  console.log(`  Capturing full-page screenshot...`);
  const buffer = await page.screenshot({
    fullPage: true,
    type: 'jpeg',
    quality: 80,
  });

  writeFileSync(site.file, buffer);
  console.log(`  ✓ Saved ${site.file} (${(buffer.length / 1024).toFixed(0)} KB)`);

  await browser.close();
}

for (const site of SITES) {
  try {
    await capture(site);
  } catch (err) {
    console.error(`✗ Failed for ${site.url}:`, err.message);
  }
}

console.log('\nDone.');
