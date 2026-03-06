import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const html = `
<!DOCTYPE html>
<html>
<head>
<style>
  @import url('https://api.fontshare.com/v2/css?f[]=bevellier@300,700&display=swap');
  @import url('https://api.fontshare.com/v2/css?f[]=switzer@200&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    background: #1A1412;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Bevellier', sans-serif;
    overflow: hidden;
    position: relative;
  }
  .glow {
    position: absolute;
    width: 800px;
    height: 500px;
    background: radial-gradient(ellipse, rgba(212, 113, 78, 0.12) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 0 80px;
  }
  .logo-name {
    font-weight: 700;
    font-size: 28px;
    text-transform: uppercase;
    color: #F5EDE4;
    letter-spacing: -0.02em;
  }
  .logo-sub {
    font-weight: 300;
    font-size: 11px;
    text-transform: uppercase;
    color: #D4714E;
    letter-spacing: 0.35em;
    margin-bottom: 48px;
  }
  h1 {
    font-weight: 700;
    font-size: 72px;
    text-transform: uppercase;
    color: #F5EDE4;
    line-height: 0.9;
    letter-spacing: -0.02em;
    margin-bottom: 24px;
  }
  h1 .accent {
    color: #D4714E;
  }
  p {
    font-family: 'Switzer', sans-serif;
    font-weight: 200;
    font-size: 22px;
    color: #A89888;
    line-height: 1.5;
    max-width: 700px;
    margin: 0 auto 32px;
  }
  .location {
    font-weight: 300;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #D4714E;
    border: 1px solid rgba(212, 113, 78, 0.4);
    display: inline-block;
    padding: 8px 24px;
    border-radius: 999px;
  }
  .border-line {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: #D4714E;
  }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="content">
    <div class="logo-name">Stanikk</div>
    <div class="logo-sub">Web Design</div>
    <h1>Websites That <span class="accent">Work</span> As Hard As You Do</h1>
    <p>Bespoke web design at a fraction of agency prices</p>
    <span class="location">Southampton, UK</span>
  </div>
  <div class="border-line"></div>
</body>
</html>`;

async function generateOGImage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  // Wait for fonts to load
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'public/images/og-image.jpg', type: 'jpeg', quality: 90 });
  await browser.close();
  console.log('OG image generated at public/images/og-image.jpg');
}

generateOGImage().catch(console.error);
