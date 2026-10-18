// The optional "email me these" copy, sent through Resend from design@kombu.uk.
// Ryan gets a blind copy, so every request doubles as a lead notification.

import type { Result } from './index';
import { SIGNATURE_HTML } from './signature';

// The email's own card leaves about 300px for the signature on a 390px phone, so it gets a
// tighter version here: smaller logo, less padding. Gmail keeps the full-size one.
const SIGNATURE_COMPACT = SIGNATURE_HTML
	.replace('width="88" height="97"', 'width="64" height="71"')
	.replace('width:88px;height:97px', 'width:64px;height:71px')
	.replace('padding:18px 22px 18px 18px', 'padding:14px 14px 14px 12px')
	.replace('padding:0 16px 0 0', 'padding:0 12px 0 0');

const FROM = 'Ryan at Kombu <design@kombu.uk>';
const RYAN = 'design@kombu.uk';

export function whatsappLink(siteUrl: string): string {
	const text = `Hi Ryan, I've just run the free site check on ${siteUrl}. Could we have a quick call about it?`;
	return 'https://wa.me/442381112819?text=' + encodeURIComponent(text);
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildEmail(r: Result): { subject: string; html: string; text: string } {
	const host = new URL(r.url).hostname.replace(/^www\./, '');
	const name = r.site_name || host;
	const wa = whatsappLink(r.url);

	const items = r.findings
		.map(
			(f, i) => `
<tr><td style="padding:0 0 22px">
  <p style="margin:0 0 6px;font:600 17px/1.35 Helvetica,Arial,sans-serif;color:#141210">${i + 1}. ${esc(f.title)}</p>
  <p style="margin:0 0 6px;font:14px/1.5 Helvetica,Arial,sans-serif;color:#141210"><strong>Where:</strong> ${esc(f.where)}</p>
  <p style="margin:0 0 6px;font:14px/1.5 Helvetica,Arial,sans-serif;color:#141210"><strong>Why it matters:</strong> ${esc(f.why)}</p>
  <p style="margin:0;font:14px/1.5 Helvetica,Arial,sans-serif;color:#141210"><strong>The fix:</strong> ${esc(f.fix)}</p>
</td></tr>`
		)
		.join('');

	const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Five fixes for ${esc(name)}</title></head><body style="margin:0;background:#F1EEE6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1EEE6"><tr><td align="center" style="padding:28px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:2px solid #141210;border-radius:20px"><tr><td style="padding:28px 26px">
  <h1 style="margin:0 0 14px;font:800 26px/1.15 Helvetica,Arial,sans-serif;color:#141210">Five fixes for ${esc(name)}</h1>
  <p style="margin:0 0 22px;font:15px/1.55 Helvetica,Arial,sans-serif;color:#141210">Here's the check you ran on <a href="${esc(r.url)}" style="color:#141210">${esc(host)}</a>. First, what's working: ${esc(r.strength)}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}</table>
  <p style="margin:6px 0 18px;font:15px/1.55 Helvetica,Arial,sans-serif;color:#141210">If you'd like a hand with any of these, or a proper look at the parts a quick check can't reach, I'm happy to talk it through.</p>
  <a href="${esc(wa)}" style="display:inline-block;background:#1F4A3C;color:#F1EEE6;border:2px solid #141210;border-radius:999px;padding:12px 22px;font:600 15px/1 Helvetica,Arial,sans-serif;text-decoration:none">Book a quick call on WhatsApp</a>
  <div style="margin:22px 0 0;font:15px/1.55 Helvetica,Arial,sans-serif;color:#141210">${SIGNATURE_COMPACT}</div>
</td></tr></table>
</td></tr></table></body></html>`;

	const text = [
		`Five fixes for ${name}`,
		'',
		`Here's the check you ran on ${r.url}. First, what's working: ${r.strength}`,
		'',
		...r.findings.flatMap((f, i) => [`${i + 1}. ${f.title}`, `Where: ${f.where}`, `Why it matters: ${f.why}`, `The fix: ${f.fix}`, '']),
		"If you'd like a hand with any of these, or a proper look at the parts a quick check can't reach, I'm happy to talk it through.",
		`Book a quick call on WhatsApp: ${wa}`,
		'',
		'Ryan Stanikk',
		'Kombu, Southampton',
		'https://kombu.uk/ · +44 23 8111 2819'
	].join('\n');

	return { subject: `Your site check: five fixes for ${name}`, html, text };
}

export async function sendCopy(apiKey: string, to: string, r: Result): Promise<void> {
	const { subject, html, text } = buildEmail(r);
	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({ from: FROM, to: [to], bcc: [RYAN], reply_to: RYAN, subject, html, text })
	});
	if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
