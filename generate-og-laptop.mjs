/**
 * Alternative OG card: the real homepage on a laptop, on a desk.
 *
 * The screen is a genuine screenshot of the live hero rather than a mockup of
 * one, so the card can never drift from the site. Run after a visual change:
 *   node generate-og-laptop.mjs            (screenshots kombu.uk)
 *   OG_URL=http://localhost:4321/ node generate-og-laptop.mjs
 */
import { chromium } from 'playwright';
import { writeFileSync, readFileSync } from 'fs';

const SITE = process.env.OG_URL || 'https://kombu.uk/?nomotion';

const FONT_FACES = [['I', 700], ['II', 800], ['III', 900]].map(([r, w]) =>
  `@font-face{font-family:'Supermassive RS';src:url(data:font/woff2;base64,${readFileSync(`public/fonts/SupermassiveRS-${r}.woff2`).toString('base64')}) format('woff2');font-weight:${w};font-style:normal}`
).join('\n');

const MARK = readFileSync('public/images/kombu-mark.png').toString('base64');

const browser = await chromium.launch();

// 1. Capture the live hero at desktop size.
const shotPage = await browser.newPage();
await shotPage.setViewportSize({ width: 1440, height: 900 });
await shotPage.goto(SITE, { waitUntil: 'networkidle' });
await shotPage.evaluate(() => document.fonts.ready);
await shotPage.waitForTimeout(2500);
const shot = (await shotPage.screenshot({ type: 'jpeg', quality: 92 })).toString('base64');
await shotPage.close();

// 2. Sit it in a laptop on a desk. Built in CSS rather than generated art so
//    the brand colours stay exact and the whole thing is reproducible.
const html = `<!DOCTYPE html><html><head><style>
@import url('https://api.fontshare.com/v2/css?f[]=switzer@200,300&display=swap');
${FONT_FACES}
*{margin:0;padding:0;box-sizing:border-box}
body{--gut:64px;width:1200px;height:630px;overflow:hidden;position:relative;
  background:radial-gradient(120% 90% at 50% 8%, #2A211C 0%, #1A1412 55%, #120D0B 100%);
  font-family:'Supermassive RS',sans-serif;display:flex;align-items:center}
/* warm key light, as if the room is lit from the left like the hero shader */
.glow{position:absolute;width:900px;height:640px;left:-160px;top:-140px;
  background:radial-gradient(ellipse,rgba(212,113,78,.20) 0%,transparent 66%)}
/* the desk: a plane the laptop sits on, not a hard horizon line */
.desk{position:absolute;left:0;right:0;bottom:0;height:210px;
  background:linear-gradient(180deg, rgba(212,113,78,.05) 0%, rgba(26,20,18,0) 100%);
  border-top:1px solid rgba(212,113,78,.14)}
/* GUT is the single gutter: edge-to-logo, logo-to-laptop and laptop-to-edge
   all use it, so the lockup reads as evenly padded on every side. */
.stage{position:relative;z-index:2;display:flex;align-items:center;gap:var(--gut);
  padding:var(--gut) calc(var(--gut) + 26px) var(--gut) var(--gut);width:100%;height:100%}
.copy{flex:0 0 168px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px}
.copy img{width:112px;height:112px;display:block}
.mark{text-align:center;font-weight:900;font-size:30px;text-transform:uppercase;color:#F5EDE4;
  letter-spacing:-.02em;line-height:1}
.mark span{display:block;font-size:10px;font-weight:700;letter-spacing:.36em;color:#D4714E;margin-top:8px}
/* laptop: lid in perspective, screenshot inset, then the base below it */
.laptop{flex:1;perspective:1700px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.lid{width:100%;max-width:566px;padding:10px 10px 12px;border-radius:13px;
  background:linear-gradient(160deg,#4A3E34 0%,#2A211C 60%,#1F1815 100%);
  box-shadow:0 44px 80px -28px rgba(0,0,0,.85), 0 0 0 1px rgba(245,237,228,.07) inset;
  transform:rotateX(6deg) rotateY(-9deg)}
.screen{width:100%;aspect-ratio:1440/900;border-radius:5px;overflow:hidden;background:#FAF7F4;
  box-shadow:0 0 0 1px rgba(0,0,0,.5) inset;position:relative}
.screen img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.screen::after{content:"";position:absolute;inset:0;
  background:linear-gradient(115deg,rgba(255,255,255,.13) 0%,transparent 38%)}
.base{width:100%;max-width:614px;height:13px;margin-top:-1px;border-radius:0 0 11px 11px;
  background:linear-gradient(180deg,#3A2F28 0%,#221A16 100%);
  transform:rotateX(6deg) rotateY(-9deg);
  box-shadow:0 26px 42px -18px rgba(0,0,0,.8)}
.notch{width:96px;height:4px;border-radius:0 0 5px 5px;background:rgba(245,237,228,.16);margin:0 auto}
.rule{position:absolute;bottom:0;left:0;width:100%;height:4px;background:#D4714E}
</style></head><body>
<div class="glow"></div><div class="desk"></div>
<div class="stage">
  <div class="copy">
    <img src="data:image/png;base64,${MARK}" alt="" />
    <div class="mark">Kombu<span>Studio</span></div>
  </div>
  <div class="laptop">
    <div class="lid"><div class="screen"><img src="data:image/jpeg;base64,${shot}" /></div></div>
    <div class="base"><div class="notch"></div></div>
  </div>
</div>
<div class="rule"></div>
</body></html>`;

const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);
const out = await page.screenshot({ type: 'jpeg', quality: 92 });
writeFileSync('public/images/og-image-laptop.jpg', out);
console.log(`OG laptop card written to public/images/og-image-laptop.jpg (${(out.length/1024).toFixed(0)} KB) from ${SITE}`);
await browser.close();
