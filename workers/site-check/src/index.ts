// kombu.uk/api/site-check: the free site check.
//   POST /api/site-check         { url }          -> NDJSON stream of stages, then the result
//   POST /api/site-check/email   { id, email }    -> sends the five fixes by email
//   GET  /api/site-check/log?token=...            -> recent checks, for Ryan

import { normaliseUrl, siteKey, UrlError } from './url';
import { fetchPage, FetchError, isChallenge, type PageFacts } from './page';
import { takeShots } from './shots';
import { fieldSpeed, type FieldSpeed } from './speed';
import { review, type Review } from './review';
import { sendCopy } from './email';

const ALLOWED_ORIGINS = ['https://kombu.uk', 'http://localhost:4321', 'http://127.0.0.1:4321'];
const DAY = 86_400;

export type Result = {
	id: string;
	url: string;
	checkedAt: string;
	site_name: string;
	business_type: string;
	strength: string;
	findings: Review['findings'];
	unable_to_check: string[];
	speed: FieldSpeed | null;
	thumb: string | null;
};

type LogEntry = {
	id: string;
	url: string;
	at: string;
	outcome: string;
	cached: boolean;
	country: string;
	ms: number;
	model?: string;
	email?: string;
};

export default {
	async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(req.url);
		const cors = corsHeaders(req);
		if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

		const path = url.pathname.replace(/\/+$/, '');
		try {
			if (path === '/api/site-check' && req.method === 'POST') return await check(req, env, ctx, cors);
			if (path === '/api/site-check/email' && req.method === 'POST') return await email(req, env, cors);
			if (path === '/api/site-check/log' && req.method === 'GET') return await log(url, env);
		} catch (e) {
			console.error('site-check error', e);
			return json({ error: "Something went wrong on my side. Please try again in a minute." }, 500, cors);
		}
		return json({ error: 'Not found' }, 404, cors);
	}
} satisfies ExportedHandler<Env>;

async function check(req: Request, env: Env, ctx: ExecutionContext, cors: HeadersInit): Promise<Response> {
	const body = (await req.json().catch(() => ({}))) as { url?: string; website?: string; debug?: boolean };
	if (body.website) return json({ error: 'Not found' }, 404, cors); // honeypot field, only bots fill it

	let target: URL;
	try {
		target = normaliseUrl(body.url || '');
	} catch (e) {
		return json({ error: e instanceof UrlError ? e.message : "That doesn't look like a website address." }, 400, cors);
	}
	const key = siteKey(target);
	const ip = req.headers.get('cf-connecting-ip') || 'unknown';
	const country = (req as Request & { cf?: { country?: string } }).cf?.country || '';
	const started = Date.now();

	// Ryan's own test runs skip the cache and the limits.
	const admin = !!env.ADMIN_TOKEN && req.headers.get('x-admin-token') === env.ADMIN_TOKEN;

	// Same site within a day: serve the stored result, free and instant.
	const cached = admin ? null : await env.KV.get<Result>(`cache:${key}`, 'json');
	if (cached) {
		ctx.waitUntil(writeLog(env, { id: cached.id, url: target.toString(), at: new Date().toISOString(), outcome: 'ok', cached: true, country, ms: 0 }));
		return stream(cors, ctx, async (send) => send({ stage: 'done', result: cached }));
	}

	const hour = Math.floor(Date.now() / 3_600_000);
	const today = new Date().toISOString().slice(0, 10);
	const ipKey = `ip:${ip}:${hour}`;
	const dayKey = `day:${today}`;
	const [ipCount, dayCount] = await Promise.all([env.KV.get(ipKey), env.KV.get(dayKey)]);
	if (!admin && Number(ipCount || 0) >= Number(env.PER_IP_HOURLY || 3)) {
		return json({ error: "You've run a few checks already this hour. Try again a bit later, or just message me and I'll have a look myself.", limit: 'ip' }, 429, cors);
	}
	if (!admin && Number(dayCount || 0) >= Number(env.DAILY_CAP || 50)) {
		return json({ error: "The site check is busy today. Message me your address and I'll have a look myself.", limit: 'day' }, 429, cors);
	}
	if (!admin) await Promise.all([
		env.KV.put(ipKey, String(Number(ipCount || 0) + 1), { expirationTtl: 3_700 }),
		env.KV.put(dayKey, String(Number(dayCount || 0) + 1), { expirationTtl: 2 * DAY })
	]);

	const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
	const entry: LogEntry = { id, url: target.toString(), at: new Date().toISOString(), outcome: 'started', cached: false, country: admin ? 'test' : country, ms: 0 };

	return stream(cors, ctx, async (send) => {
		try {
			send({ stage: 'fetch' });
			let facts: PageFacts;
			try {
				facts = (await fetchPage(target)).facts;
			} catch (e) {
				entry.outcome = e instanceof FetchError ? e.kind : 'fetch_failed';
				// A failed fetch costs nothing much, so give the visitor their check back.
				await env.KV.put(ipKey, String(Number(ipCount || 0)), { expirationTtl: 3_700 });
				return send({ stage: 'error', error: e instanceof FetchError || e instanceof UrlError ? e.message : "I couldn't reach that website." });
			}
			entry.url = facts.finalUrl;

			send({ stage: 'look' });
			const [shots, speed] = await Promise.all([takeShots(env, facts.finalUrl), fieldSpeed(facts.finalUrl, env.CRUX_API_KEY)]);
			if (shots.errors.length) console.warn('shots', shots.errors);
			if (!shots.mobile.length && !shots.desktop.length) {
				entry.outcome = 'no_screenshots';
				return send({ stage: 'error', error: "Your site didn't finish loading for me, so I can't give you a fair check. Message me the address and I'll look myself." });
			}
			if (facts.codeUnreadable && isChallenge(null, shots.markdown)) {
				entry.outcome = 'blocked';
				return send({ stage: 'unusable', reason: 'blocked', message: blockedMessage('blocked') });
			}

			send({ stage: 'review' });
			let out = await review(env, facts, shots, speed);
			if (out.review.page_state === 'ok' && out.review.findings.length < 5) {
				out = await review(env, facts, shots, speed, `Return exactly five findings this time, each a different problem, each backed by the material you were given.`);
			}
			entry.model = out.model;
			const r = out.review;
			if (r.page_state !== 'ok' || r.findings.length < 3) {
				entry.outcome = r.page_state === 'ok' ? 'too_few' : r.page_state;
				return send({ stage: 'unusable', reason: r.page_state, message: blockedMessage(r.page_state) });
			}

			const result: Result = {
				id,
				url: facts.finalUrl,
				checkedAt: new Date().toISOString(),
				site_name: r.site_name,
				business_type: r.business_type,
				strength: r.strength,
				findings: r.findings,
				unable_to_check: r.unable_to_check,
				speed,
				thumb: shots.thumb
			};
			await Promise.all([
				env.KV.put(`cache:${key}`, JSON.stringify(result), { expirationTtl: DAY }),
				env.KV.put(`result:${id}`, JSON.stringify(result), { expirationTtl: 30 * DAY })
			]);
			entry.outcome = 'ok';
			console.log('usage', JSON.stringify(out.usage));
			send({ stage: 'done', result });
			if (admin && body.debug) send({ stage: 'debug', facts, speed, markdown: shots.markdown.slice(0, 20_000), shots: [...shots.mobile, ...shots.desktop].map((x) => ({ label: x.label, jpeg: x.base64 })) });
		} catch (e) {
			console.error('check failed', e);
			entry.outcome = 'error';
			send({ stage: 'error', error: "Something went wrong on my side while checking. Please try again in a minute." });
		} finally {
			entry.ms = Date.now() - started;
			await writeLog(env, entry);
		}
	});
}

function blockedMessage(state: string): string {
	switch (state) {
		case 'blocked':
			return "Your site's security check stopped me getting in, so I can't look at it properly from here. Message me the address and I'll check it by hand.";
		case 'blank_or_loading':
			return "Your site was still blank or loading when I looked, so I can't give you a fair check. That's worth knowing in itself: message me and I'll look by hand.";
		case 'parked_or_placeholder':
			return "That address shows a holding page rather than a finished website. If you're planning the real thing, I'd be glad to talk it through.";
		case 'not_a_business_site':
			return "That doesn't look like a small business website, which is what this check is built for. Try your own site's address.";
		default:
			return "I couldn't find enough to say about that page to give you five honest fixes. Message me and I'll look by hand.";
	}
}

async function email(req: Request, env: Env, cors: HeadersInit): Promise<Response> {
	const body = (await req.json().catch(() => ({}))) as { id?: string; email?: string; website?: string };
	if (body.website) return json({ error: 'Not found' }, 404, cors);
	const id = (body.id || '').replace(/[^a-f0-9]/g, '').slice(0, 16);
	const to = (body.email || '').trim().toLowerCase();
	if (!/^[^\s@<>,;"]+@[^\s@<>,;"]+\.[a-z]{2,}$/i.test(to) || to.length > 200) return json({ error: "That email address doesn't look right." }, 400, cors);
	const result = id ? await env.KV.get<Result>(`result:${id}`, 'json') : null;
	if (!result) return json({ error: "I couldn't find that check any more. Run it again and I'll send it." }, 404, cors);

	const sentKey = `sent:${id}`;
	const sent = Number((await env.KV.get(sentKey)) || 0);
	if (sent >= 2) return json({ error: "I've already sent this one a couple of times." }, 429, cors);
	if (!env.RESEND_API_KEY) return json({ error: "Email isn't set up yet. Screenshot this page for now." }, 503, cors);

	await sendCopy(env.RESEND_API_KEY, to, result);
	await env.KV.put(sentKey, String(sent + 1), { expirationTtl: 30 * DAY });
	const entry = await env.KV.get<LogEntry>(`logid:${id}`, 'json');
	if (entry) await writeLog(env, { ...entry, email: to });
	return json({ ok: true }, 200, cors);
}

async function log(url: URL, env: Env): Promise<Response> {
	if (!env.ADMIN_TOKEN || url.searchParams.get('token') !== env.ADMIN_TOKEN) return json({ error: 'Not found' }, 404, {});
	const list = await env.KV.list({ prefix: 'log:', limit: 200 });
	const rows = list.keys.map((k) => k.metadata as LogEntry).filter(Boolean);
	if (url.searchParams.get('format') === 'json') return json({ count: rows.length, checks: rows }, 200, {});
	const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { timeZone: 'Europe/London', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
	const body = rows
		.map((r) => `<tr><td>${when(r.at)}</td><td><a href="${esc(r.url)}" rel="noopener nofollow" target="_blank">${esc(r.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a></td><td>${esc(r.outcome)}${r.cached ? ' (repeat)' : ''}</td><td>${esc(r.country)}</td><td>${r.ms ? (r.ms / 1000).toFixed(0) + 's' : ''}</td><td>${r.email ? `<a href="mailto:${esc(r.email)}">${esc(r.email)}</a>` : ''}</td></tr>`)
		.join('');
	const page = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Site check log</title><style>body{margin:0;padding:24px 16px;background:#F1EEE6;color:#141210;font:15px/1.45 -apple-system,Helvetica,Arial,sans-serif}h1{font-size:22px;margin:0 0 4px}p{margin:0 0 16px;color:#3B352F}.wrap{overflow-x:auto;background:#fff;border:2px solid #141210;border-radius:16px}table{border-collapse:collapse;width:100%;min-width:640px}th,td{text-align:left;padding:10px 12px;border-bottom:1px solid #D8D2C8;white-space:nowrap}th{font-weight:600}a{color:#141210}</style></head><body><h1>Site check log</h1><p>${rows.length} most recent checks, newest first. "test" in the country column is one of your own test runs.</p><div class="wrap"><table><thead><tr><th>When</th><th>Site</th><th>Outcome</th><th>Country</th><th>Time</th><th>Email copy</th></tr></thead><tbody>${body}</tbody></table></div></body></html>`;
	return new Response(page, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
}

/** Log keys sort newest first (reverse timestamp), and the entry rides in metadata so one list() reads them all. */
async function writeLog(env: Env, e: LogEntry): Promise<void> {
	e = { ...e, url: e.url.slice(0, 300), email: e.email?.slice(0, 120) };
	// a cached repeat gets its own row; an email request updates the row of the check it belongs to
	const existing = e.cached ? null : await env.KV.get(`logkey:${e.id}`);
	const key = existing || `log:${String(9_999_999_999_999 - Date.now()).padStart(13, '0')}:${e.id}${e.cached ? ':c' + Date.now() : ''}`;
	await Promise.all([
		env.KV.put(key, '', { metadata: e, expirationTtl: 180 * DAY }),
		e.cached ? Promise.resolve() : env.KV.put(`logkey:${e.id}`, key, { expirationTtl: 180 * DAY }),
		e.cached ? Promise.resolve() : env.KV.put(`logid:${e.id}`, JSON.stringify(e), { expirationTtl: 180 * DAY })
	]);
}

function stream(cors: HeadersInit, ctx: ExecutionContext, work: (send: (o: unknown) => void) => Promise<void>): Response {
	const { readable, writable } = new TransformStream();
	const writer = writable.getWriter();
	const enc = new TextEncoder();
	const send = (o: unknown) => void writer.write(enc.encode(JSON.stringify(o) + '\n')).catch(() => {});
	ctx.waitUntil(work(send).finally(() => writer.close().catch(() => {})));
	return new Response(readable, {
		headers: { ...cors, 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
	});
}

function corsHeaders(req: Request): Record<string, string> {
	const origin = req.headers.get('origin') || '';
	if (!ALLOWED_ORIGINS.includes(origin)) return {};
	return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' };
}

function json(o: unknown, status: number, cors: HeadersInit): Response {
	return new Response(JSON.stringify(o), { status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
