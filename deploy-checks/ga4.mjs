// GA4 deploy check (review card data-11, 18 Oct 2026). Loads the live site and the
// fresh deploy, clicks each tracked control and asserts the GA4 collect requests:
//   - page_view on the live host, and nothing at all on a pages.dev preview or localhost
//   - contact_click for WhatsApp, email and phone, with the right placement
//   - quote_calculated from the /photography calculator
//   - film_sound_on from a case-study film
// Every collect request is answered here with a 204 and never reaches Google, and
// outbound links are stubbed, so a run leaves no trace in the analytics.
// Run: node deploy-checks/ga4.mjs   (env PRODUCTION_URL, DEPLOY_URL; exit 1 on any failure)
// site_check_done is not tested: it needs a real site check (paid model call, rate limited).
import { createRequire } from 'module';
import { execSync } from 'child_process';
const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');

const LIVE = (process.env.PRODUCTION_URL || 'https://kombu.uk').replace(/\/$/, '');
const PREVIEW = (process.env.DEPLOY_URL || '').replace(/\/$/, '');
const TID = 'G-5H2CJESBZ0';
const results = []; let failed = 0;
const check = (name, ok, detail = '') => { results.push(`${ok ? '✓' : '✗'} ${name}${detail ? ' (' + detail + ')' : ''}`); if (!ok) failed++; };

// one GA4 request can carry several events: shared params in the query, one event per body line
function parseCollect(req) {
  const q = Object.fromEntries(new URL(req.url()).searchParams);
  const lines = (req.postData() || '').split('\n').filter(Boolean).map(l => Object.fromEntries(new URLSearchParams(l)));
  return (lines.length ? lines : [{}]).map(l => ({ ...q, ...l })).filter(e => e.en);
}

async function session(browser, base) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const events = [];
  await context.route(/google-analytics\.com\/g\/collect|analytics\.google\.com\/g\/collect/, (route, req) => { events.push(...parseCollect(req)); route.fulfill({ status: 204 }); });
  await context.route(/^https:\/\/(wa\.me|api\.whatsapp\.com|www\.google\.com\/maps)/, route => route.fulfill({ status: 204, body: '' }));
  const page = await context.newPage();
  context.on('page', p => { if (p !== page) p.close().catch(() => {}); });
  const go = async p => { await page.goto(base + p, { waitUntil: 'networkidle' }); await page.waitForTimeout(800); };
  const click = async sel => { const el = page.locator(sel).first(); await el.click({ force: true, noWaitAfter: true, timeout: 5000 }).catch(() => el.dispatchEvent('click')); await page.waitForTimeout(1500); if (!page.url().startsWith(base)) await page.goBack().catch(() => {}); };
  // gtag batches events and sends them on a timer or when the page is left, so leave it
  const flush = async (...want) => {
    for (let t = 0; t < 12000 && !want.every(w => events.some(e => e.en === w)); t += 500) await page.waitForTimeout(500);
    await page.goto('about:blank').catch(() => {}); await page.waitForTimeout(1500);
  };
  return { context, page, events, go, click, flush };
}
const has = (events, en, params = {}) => events.some(e => e.en === en && e.tid === TID && Object.entries(params).every(([k, v]) => e['ep.' + k] === v || e['epn.' + k] === v || (v === '*' && (('ep.' + k) in e || ('epn.' + k) in e))));

const browser = await chromium.launch();
try {
  // live: every tracked control reports
  const s = await session(browser, LIVE);
  await s.go('/');
  await s.click('#contact a[href^="https://wa.me"]');
  await s.click('#contact a[href^="mailto:"]');
  await s.click('#contact a[href^="tel:"]');
  await s.click('footer a[href^="mailto:"], footer a[href^="https://wa.me"]');
  await s.go('/about/');   // the home page holds the nav back until its desktop opening has played
  await s.click('nav a[href^="https://wa.me"]');
  await s.flush('page_view', 'contact_click');
  check('page_view on the live home page', has(s.events, 'page_view'));
  // gtag sends page_path as the reserved dp field, not as ep.page_path, so the GA4 custom
  // dimension "page_path" stays empty; the built-in page path already carries it.
  check('contact_click whatsapp / nav', s.events.some(e => e.en === 'contact_click' && e['ep.method'] === 'whatsapp' && e['ep.placement'] === 'nav' && e.dp === '/about/'));
  check('contact_click whatsapp / contact_card', has(s.events, 'contact_click', { method: 'whatsapp', placement: 'contact_card' }));
  check('contact_click email / contact_card', has(s.events, 'contact_click', { method: 'email', placement: 'contact_card' }));
  check('contact_click phone / contact_card', has(s.events, 'contact_click', { method: 'phone', placement: 'contact_card' }));
  check('contact_click / footer', has(s.events, 'contact_click', { placement: 'footer' }));
  check('no link or quote text in contact_click', !s.events.some(e => e.en === 'contact_click' && Object.keys(e).some(k => /^ep\./.test(k) && /wa\.me|mailto|text=/.test(e[k]))));

  await s.go('/photography/');
  await s.click('#rsCategoryGrid .quote-cat');
  await s.page.selectOption('#rsUsageScope', 'standard').catch(() => {});
  await s.click('#rsCalculate');
  await s.flush('quote_calculated');
  check('quote_calculated from the calculator', has(s.events, 'quote_calculated', { shoot_type: '*', estimate_gbp: '*', quote_kind: '*' }));

  await s.go('/work/padharo/');
  await s.page.getByRole('button', { name: /play with sound/i }).first().dispatchEvent('click').catch(() => {}); await s.flush('film_sound_on');
  check('film_sound_on from the Padharo film', has(s.events, 'film_sound_on', { film: '*' }), has(s.events, 'film_sound_on', { film: '*' }) ? '' : 'saw ' + [...new Set(s.events.map(e => e.en))].join(','));
  await s.context.close();

  // preview: the same clicks must send nothing
  if (PREVIEW && !/^https?:\/\/(www\.)?kombu\.uk/.test(PREVIEW)) {
    const p = await session(browser, PREVIEW);
    await p.go('/'); await p.click('nav a[href^="https://wa.me"]'); await p.flush();
    check(`no GA4 requests on the preview ${new URL(PREVIEW).host}`, p.events.length === 0, p.events.length ? p.events.map(e => e.en).join(',') : '');
    await p.context.close();
  }
} catch (e) { check('run', false, e.message.split('\n')[0]); }
finally { await browser.close(); }
console.log(results.join('\n'));
console.log(failed ? `GA4 check: ${failed} failed` : 'GA4 check: all passed');
process.exit(failed ? 1 : 0);
