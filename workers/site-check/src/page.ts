// Fetches the page itself (following redirects by hand so each hop is checked)
// and pulls out the facts that can be read from the code. Everything here is
// deterministic: the model is told these are facts, so they must be right.

import { assertPublic } from './url';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const MAX_BYTES = 1_500_000;

export type PageFacts = {
	requestedUrl: string;
	finalUrl: string;
	status: number;
	redirects: string[];
	https: boolean;
	httpUpgrades: boolean | null;
	htmlBytes: number;
	title: string;
	metaDescription: string;
	viewport: string;
	lang: string;
	canonical: string;
	ogTitle: string;
	ogImage: string;
	favicon: boolean;
	generator: string;
	h1: string[];
	headings: string[];
	phoneLinks: string[];
	emailLinks: string[];
	whatsappLinks: string[];
	bookingLinks: string[];
	orderingLinks: string[];
	socialLinks: string[];
	pdfLinks: string[];
	mapLinks: string[];
	embeds: string[];
	images: number;
	imagesMissingAlt: number;
	jsonLdTypes: string[];
	copyrightYears: number[];
	scripts: number;
	challenge: boolean;
	codeUnreadable: boolean;
};

export class FetchError extends Error {
	constructor(message: string, public kind: 'unreachable' | 'blocked' | 'not_html' | 'error_status' | 'expired') {
		super(message);
	}
}

const BOOKING = /opentable|resdiary|sevenrooms|designmynight|tablein|quandoo|bookatable|collins|dojo\.app|fresha|treatwell|booksy|calendly|acuityscheduling|simplybook|setmore|squareup\.com\/appointments|book\.squareup|youcanbook|tock|resy|eveve|tableagent|tablebooker|bookings?\b|reservations?\b|reserve/i;
const ORDERING = /deliveroo|ubereats|just-?eat|order\.|orderonline|flipdish|slerp|toasttab|square\.site|wix\.com\/.*order|order-?online|takeaway/i;
const MAPS = /google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.apple\.com|what3words\.com|openstreetmap\.org/i;
const SOCIAL = /instagram\.com|facebook\.com|tiktok\.com|x\.com|twitter\.com|linkedin\.com|youtube\.com/i;

export async function fetchPage(start: URL): Promise<{ facts: PageFacts; html: string }> {
	const redirects: string[] = [];
	let url = start;
	let res: Response | null = null;
	for (let hop = 0; hop < 6; hop++) {
		assertPublic(url);
		try {
			res = await fetch(url.toString(), {
				redirect: 'manual',
				headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml', 'Accept-Language': 'en-GB,en;q=0.9' },
				signal: AbortSignal.timeout(12_000)
			});
		} catch {
			// A bare domain that only answers on www, or only on http, is common on small sites.
			if (hop === 0 && !url.hostname.startsWith('www.')) {
				url = new URL(url.toString().replace('://', '://www.'));
				redirects.push(url.toString());
				continue;
			}
			if (hop === 0 && url.protocol === 'https:') {
				url = new URL(url.toString().replace(/^https:/, 'http:'));
				redirects.push(url.toString());
				continue;
			}
			throw new FetchError("I couldn't reach that website. Check the address and try again.", 'unreachable');
		}
		if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
			url = new URL(res.headers.get('location')!, url);
			redirects.push(url.toString());
			continue;
		}
		break;
	}
	if (!res) throw new FetchError("I couldn't reach that website.", 'unreachable');

	const type = res.headers.get('content-type') || '';
	const html = await readCapped(res);
	const challenge = isChallenge(res, html);
	// Bot walls and rate limits block a plain fetch but usually let a real browser in.
	const walled = challenge || [401, 403, 429, 503].includes(res.status);
	// Hosting that has lapsed (Squarespace, Wix, cPanel, registrars) is worth saying plainly.
	const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || '').trim();
	if (/website expired|site (has )?expired|account (has been )?suspended|site suspended|this domain (is|may be) for sale|domain (has )?expired|parked free|renew (your|this) (site|domain|subscription)/i.test(title + ' ' + html.slice(0, 6000).replace(/<[^>]+>/g, ' '))) {
		throw new FetchError(`Your website looks like it has expired or been switched off: anyone visiting ${url.hostname} sees a page saying "${title.slice(0, 80) || 'expired'}" instead of your site. That's worth fixing today, and I can help.`, 'expired');
	}
	if (!walled && res.status >= 400) throw new FetchError(`That address answered with an error (${res.status}). Is it the right one?`, 'error_status');
	if (!walled && type && !/html/i.test(type)) throw new FetchError("That address isn't a web page I can read.", 'not_html');

	const facts = await extract(html, url);
	facts.requestedUrl = start.toString();
	facts.finalUrl = url.toString();
	facts.status = res.status;
	facts.redirects = redirects;
	facts.https = url.protocol === 'https:';
	facts.htmlBytes = html.length;
	facts.challenge = challenge;
	facts.codeUnreadable = walled;
	facts.httpUpgrades = await checkHttpUpgrade(url);
	return { facts, html };
}

async function readCapped(res: Response): Promise<string> {
	if (!res.body) return '';
	const reader = res.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	while (size < MAX_BYTES) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
		size += value.byteLength;
	}
	reader.cancel().catch(() => {});
	const buf = new Uint8Array(Math.min(size, MAX_BYTES));
	let off = 0;
	for (const c of chunks) {
		const take = Math.min(c.byteLength, buf.length - off);
		buf.set(c.subarray(0, take), off);
		off += take;
		if (off >= buf.length) break;
	}
	return new TextDecoder().decode(buf);
}

export function isChallenge(res: Response | null, html: string): boolean {
	if (res?.headers.get('cf-mitigated') === 'challenge') return true;
	const head = html.slice(0, 20_000);
	return /<title>\s*(Just a moment|Attention Required|Access denied|Checking your browser|Verifying you are human|DDoS-Guard)/i.test(head) || /cf-turnstile|challenge-platform|captcha-delivery\.com|_Incapsula_Resource|px-captcha/i.test(head);
}

/** Does http:// on the same host end up on https://? null when http doesn't answer at all. */
async function checkHttpUpgrade(finalUrl: URL): Promise<boolean | null> {
	if (finalUrl.protocol !== 'https:') return false;
	const http = new URL(finalUrl.toString());
	http.protocol = 'http:';
	try {
		const r = await fetch(http.toString(), { redirect: 'manual', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(5_000) });
		const loc = r.headers.get('location') || '';
		r.body?.cancel().catch(() => {});
		if (r.status >= 300 && r.status < 400) return loc.startsWith('https://') || loc.startsWith('//');
		return false;
	} catch {
		return null;
	}
}

async function extract(html: string, base: URL): Promise<PageFacts> {
	const f: PageFacts = {
		requestedUrl: '', finalUrl: '', status: 0, redirects: [], https: false, httpUpgrades: null, htmlBytes: 0,
		title: '', metaDescription: '', viewport: '', lang: '', canonical: '', ogTitle: '', ogImage: '', favicon: false, generator: '',
		h1: [], headings: [], phoneLinks: [], emailLinks: [], whatsappLinks: [], bookingLinks: [], orderingLinks: [], socialLinks: [], pdfLinks: [], mapLinks: [], embeds: [],
		images: 0, imagesMissingAlt: 0, jsonLdTypes: [], copyrightYears: [], scripts: 0, challenge: false, codeUnreadable: false
	};
	let inTitle = false;
	let heading: { tag: string; text: string } | null = null;
	let ldBuf: string | null = null;
	const lds: string[] = [];
	let text = '';

	const add = (list: string[], v: string, max = 8) => {
		if (v && !list.includes(v) && list.length < max) list.push(v);
	};

	const rw = new HTMLRewriter()
		.on('html', { element: (e) => void (f.lang = e.getAttribute('lang') || '') })
		.on('title', {
			element: (e) => {
				inTitle = !f.title;
				e.onEndTag(() => void (inTitle = false));
			},
			text: (t) => void (inTitle && (f.title += t.text))
		})
		.on('meta', {
			element: (e) => {
				const name = (e.getAttribute('name') || e.getAttribute('property') || '').toLowerCase();
				const content = e.getAttribute('content') || '';
				if (name === 'description') f.metaDescription = content;
				else if (name === 'viewport') f.viewport = content;
				else if (name === 'og:title') f.ogTitle = content;
				else if (name === 'og:image') f.ogImage = content;
				else if (name === 'generator') f.generator = content;
			}
		})
		.on('link', {
			element: (e) => {
				const rel = (e.getAttribute('rel') || '').toLowerCase();
				if (rel === 'canonical') f.canonical = e.getAttribute('href') || '';
				if (rel.includes('icon')) f.favicon = true;
			}
		})
		.on('h1, h2, h3', {
			element: (e) => {
				heading = { tag: e.tagName, text: '' };
				e.onEndTag(() => {
					const h = heading;
					heading = null;
					const t = h ? decode(h.text.replace(/\s+/g, ' ').trim()) : '';
					if (!h || !t) return;
					if (h.tag === 'h1') add(f.h1, t.slice(0, 140), 5);
					add(f.headings, `${h.tag}: ${t.slice(0, 120)}`, 24);
				});
			},
			text: (t) => void (heading && (heading.text += t.text))
		})
		.on('a[href]', {
			element: (e) => {
				const href = (e.getAttribute('href') || '').trim();
				if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
				if (href.startsWith('tel:')) return add(f.phoneLinks, href.slice(4).replace(/\s+/g, ''));
				if (href.startsWith('mailto:')) return add(f.emailLinks, href.slice(7).split('?')[0]);
				let abs: URL;
				try {
					abs = new URL(href, base);
				} catch {
					return;
				}
				const s = abs.toString();
				if (/wa\.me|whatsapp\.com/i.test(abs.hostname)) return add(f.whatsappLinks, s.slice(0, 80));
				if (MAPS.test(s)) return add(f.mapLinks, s.slice(0, 120), 4);
				if (/\.pdf($|\?)/i.test(abs.pathname)) add(f.pdfLinks, s.slice(0, 160));
				if (SOCIAL.test(abs.hostname)) return add(f.socialLinks, s.slice(0, 100));
				if (BOOKING.test(s)) add(f.bookingLinks, s.slice(0, 140));
				if (ORDERING.test(s)) add(f.orderingLinks, s.slice(0, 140));
			}
		})
		.on('iframe[src], iframe[data-src]', {
			element: (e) => {
				const src = e.getAttribute('src') || e.getAttribute('data-src') || '';
				let host = '';
				try {
					host = new URL(src, base).hostname;
				} catch {
					return;
				}
				if (MAPS.test(src)) add(f.mapLinks, 'embedded map: ' + host, 4);
				else add(f.embeds, host, 8);
				if (BOOKING.test(src)) add(f.bookingLinks, 'embedded widget: ' + src.slice(0, 120));
				if (ORDERING.test(src)) add(f.orderingLinks, 'embedded widget: ' + src.slice(0, 120));
			}
		})
		.on('img', {
			element: (e) => {
				f.images++;
				const alt = e.getAttribute('alt');
				if (alt === null || !alt.trim()) f.imagesMissingAlt++;
			}
		})
		.on('script', {
			element: (e) => {
				f.scripts++;
				const src = e.getAttribute('src') || '';
				if (src && /opentable|resdiary|sevenrooms|designmynight|tablein|quandoo|collins|tock|resy|fresha|treatwell|booksy|calendly|simplybook|setmore|flipdish|slerp/i.test(src)) add(f.bookingLinks, 'booking script: ' + src.slice(0, 120));
				if ((e.getAttribute('type') || '').includes('ld+json')) {
					ldBuf = '';
					e.onEndTag(() => {
						if (ldBuf) lds.push(ldBuf);
						ldBuf = null;
					});
				}
			},
			text: (t) => void (ldBuf !== null && (ldBuf += t.text))
		})
		.on('body', { text: (t) => void (text.length < 400_000 && (text += t.text)) });

	await rw.transform(new Response(html, { headers: { 'content-type': 'text/html' } })).arrayBuffer();

	f.title = decode(f.title.replace(/\s+/g, ' ').trim());
	f.metaDescription = decode(f.metaDescription.trim());
	for (const raw of lds) {
		try {
			collectTypes(JSON.parse(raw), f.jsonLdTypes);
		} catch {
			/* broken JSON-LD is itself a finding, but not one we report */
		}
	}
	const years = new Set<number>();
	for (const m of text.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/gi)) years.add(Number(m[1]));
	f.copyrightYears = [...years].filter((y) => y > 1995 && y < 2100).sort();
	return f;
}

function collectTypes(node: unknown, out: string[]): void {
	if (Array.isArray(node)) return node.forEach((n) => collectTypes(n, out));
	if (!node || typeof node !== 'object') return;
	const o = node as Record<string, unknown>;
	const t = o['@type'];
	for (const v of Array.isArray(t) ? t : [t]) if (typeof v === 'string' && !out.includes(v) && out.length < 12) out.push(v);
	if (o['@graph']) collectTypes(o['@graph'], out);
}

function decode(s: string): string {
	return s.replace(/&amp;/g, '&').replace(/&#39;|&#039;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8211;|&ndash;/g, '-').replace(/&#8217;|&rsquo;/g, "'").replace(/&nbsp;/g, ' ');
}
