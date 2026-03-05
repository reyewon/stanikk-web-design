import { chromium } from 'playwright';
import { join } from 'path';

const sites = [
  { name: 'padharo', url: 'https://www.padharo.co.uk/', wait: 8000 },
  { name: 'texas-grill', url: 'https://texas-grill.pages.dev/', wait: 6000 },
  { name: 'soleto', url: 'https://soleto-website.pages.dev/', wait: 10000 },
  { name: 'ryanstanikk', url: 'https://www.ryanstanikk.co.uk/', wait: 8000 },
];

const outputDir = join(process.cwd(), 'public', 'images', 'portfolio');

async function capture() {
  const browser = await chromium.launch({ headless: true });

  for (const site of sites) {
    console.log(`Capturing ${site.name}...`);
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(site.url, { waitUntil: 'domcontentloaded' });

    // Wait for lazy-loaded content
    await page.waitForTimeout(site.wait);

    // Scroll down slightly to trigger lazy load, then back up
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Capture a tall screenshot showing header + content (1440x1200)
    await page.screenshot({
      path: join(outputDir, `${site.name}.png`),
      clip: { x: 0, y: 0, width: 1440, height: 1200 }
    });

    console.log(`  Saved ${site.name}.png`);
    await page.close();
  }

  await browser.close();
  console.log('All screenshots captured!');
}

capture().catch(console.error);
