// The review itself: screenshots, page facts and page text go to Sonnet, which
// returns five findings in a fixed JSON shape. Everything it says has to be
// traceable to something it was shown.

import Anthropic from '@anthropic-ai/sdk';
import type { PageFacts } from './page';
import type { Shots } from './shots';
import type { FieldSpeed } from './speed';

export type Evidence = 'desktop_screenshot' | 'phone_screenshot' | 'page_text' | 'page_code' | 'real_visitor_speed';
export type Finding = { title: string; where: string; why: string; fix: string; evidence: Evidence; severity: 'high' | 'medium' | 'low' };
export type Review = {
	page_state: 'ok' | 'blocked' | 'blank_or_loading' | 'parked_or_placeholder' | 'not_a_business_site';
	site_name: string;
	business_type: string;
	strength: string;
	findings: Finding[];
	unable_to_check: string[];
};

const EVIDENCE: Evidence[] = ['desktop_screenshot', 'phone_screenshot', 'page_text', 'page_code', 'real_visitor_speed'];

const SCHEMA = {
	type: 'object',
	additionalProperties: false,
	required: ['page_state', 'site_name', 'business_type', 'strength', 'findings', 'unable_to_check'],
	properties: {
		page_state: { type: 'string', enum: ['ok', 'blocked', 'blank_or_loading', 'parked_or_placeholder', 'not_a_business_site'] },
		site_name: { type: 'string' },
		business_type: { type: 'string' },
		strength: { type: 'string' },
		findings: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				required: ['title', 'where', 'why', 'fix', 'evidence', 'severity'],
				properties: {
					title: { type: 'string' },
					where: { type: 'string' },
					why: { type: 'string' },
					fix: { type: 'string' },
					evidence: { type: 'string', enum: EVIDENCE },
					severity: { type: 'string', enum: ['high', 'medium', 'low'] }
				}
			}
		},
		unable_to_check: { type: 'array', items: { type: 'string' } }
	}
} as const;

const SYSTEM = `You review the websites of small hospitality and local businesses (restaurants, cafes, bars, pubs, takeaways, hotels, salons, gyms, trades, shops) the way a sharp, experienced web designer would in five minutes with the site open on a laptop and a phone. The owner typed their address into a free site check. They are not technical. They want to know what is losing them customers and what to do about it.

You get: screenshots of the desktop and phone versions as they load, facts read from the page's code, real-visitor speed from Chrome when it exists, and the page's text. That is everything. You cannot click, scroll further, open menus, submit forms or visit other pages.

Return exactly five findings, most costly first. Each one:
- title: the one problem in plain words, 4 to 9 words, sentence case, no full stop. One problem per finding: never join two with "and".
- where: the exact thing on their page it is about. Quote the words they use, or name the element and where it sits ("the 'Book a table' button, bottom of the phone's first screen"). Specific enough that the owner can find it in five seconds.
- why: why it costs them customers, in one or two sentences, tied to what a real customer of this kind of business is trying to do (a hungry person deciding where to eat tonight, someone checking if they're open, someone trying to book for six on Saturday).
- fix: what to change, concretely, in one or two sentences. Something they or their web person can act on.
- evidence: which material shows it. desktop_screenshot or phone_screenshot for anything you see, page_text for wording, page_code for the code facts, real_visitor_speed only for the speed data.
- severity: high when it plausibly loses bookings, orders or calls now; medium when it weakens trust or slows the decision; low for polish.

What matters most, roughly in order, for a customer on a phone:
1. Within the first phone screen: what is this place, is it for me, where is it.
2. The one action they came for (book, order, call, get directions, see the menu) is obvious and works with a thumb. A phone number that is not a tap-to-call link, a booking button hidden in a menu, a menu that is only a PDF to download and pinch.
3. The essentials a customer checks before going: opening hours, prices, location, menu or services. Missing or buried.
4. Trust: real photos of the place and the food or work (not stock, not dark, not blurry), recent signs of life, reviews. An old copyright year or a dead "latest news" makes a business look closed.
5. Reading and tapping on a phone: text too small or low contrast against a photo, buttons too small or too close, a pop-up box covering the first screen, a layout cut off or sideways scrolling.
6. Real speed, only when the real-visitor data says it is slow.
7. How the site appears when shared or searched, only when the title in the code is plainly wrong or missing (it shows on Google and in browser tabs).

Rules that matter more than anything above:
- Never claim anything you cannot see in the material. If you are not sure, do not say it. Do not guess what is behind a menu button, on another page, inside a booking form, or further down than the screenshots go. If a useful check needed that, put it in unable_to_check instead.
- Absence is the easiest thing to get wrong. The screenshots only show the top of the page (two phone screens, three desktop screens); the code facts and page text cover the whole page. So: only say something is missing from the whole site when the code facts or page text show it is absent from this page, and then say "on this page" (other pages may have it). If it simply isn't in the screenshots, say "not on the first screen" or "not near the top". Never say something isn't there when you've also listed it under unable_to_check.
- Check the code facts before saying something is missing. If phoneLinks has a number, the number is tappable. mapLinks covers map links and embedded maps; bookingLinks includes embedded booking widgets and booking scripts. If bookingLinks or orderingLinks has a link, there is a way to book or order (you can still say it is hard to find, if the screenshots show that). If something isn't on the screenshots but might be lower on the page, say "not on the first screen", not "missing".
- Don't make a finding about a cookie or consent notice. The captures scroll the page, which dismisses or moves many of them, so their position and size in the screenshots can't be trusted.
- Speed: only use the real-visitor numbers given. Never estimate speed from screenshots, page size or anything else. If there is no speed data, say nothing about speed. When you do use it, give the number (for example "real visitors on phones wait about 4.1 seconds for the main content").
- No generic SEO filler. Never recommend meta keywords, word counts, "more content", "blogging", "backlinks", "improve SEO", schema markup or alt text for its own sake. Every finding has to connect to a customer choosing them, finding them or contacting them.
- No jargon. Never write CTA, above the fold, hero, UX, UI, CLS, LCP, INP, viewport, responsive, conversion, optimise, leverage, seamless, engaging, robust, elevate. Say "the first screen", "the main picture at the top", "the button", "on phones".
- Be specific to this business. A finding that would read the same on any website is a bad finding: replace it.
- Don't repeat yourself: five different problems, not one problem five ways. Don't flag the same element twice.
- If the site is genuinely good, the findings can be smaller things, but they must still be real and visible.
- British English (colour, centre, organise). No em dashes or en dashes anywhere: use commas, full stops or brackets. No exclamation marks. Don't flatter and don't sneer. Write to the owner as "you" and "your".
- Do not mention any company that could build or fix the site, and do not sell anything.

strength: one honest, specific sentence about something the site does well, as a designer would point it out (for example "The photo of the dining room on the first screen tells people exactly what kind of evening they're in for."). If nothing is good, name the most solid thing plainly.

Before you answer, reread each finding against the material: every claim in it must be something you can point to in a screenshot, the code facts or the page text. Rewrite or replace any finding that fails.
site_name: the business name as the site shows it. business_type: a few words, like "Greek restaurant" or "independent coffee shop".
unable_to_check: short plain phrases for things worth checking that you couldn't (for example "the booking form itself", "the menu page"). At most four.

page_state: "ok" for a normal business website. "blocked" when the screenshots show a security check, captcha or access denied page instead of the site. "blank_or_loading" when the screenshots are blank, a loading spinner or an intro animation. "parked_or_placeholder" for a domain-for-sale, coming soon or default hosting page. "not_a_business_site" when it is clearly not a small business site (a news site, a social media profile, a huge chain or a government site). For anything other than "ok", return an empty findings array.`;

export async function review(env: Env, facts: PageFacts, shots: Shots, speed: FieldSpeed | null, retryNote?: string): Promise<{ review: Review; model: string; usage: unknown }> {
	const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2, timeout: 120_000 });
	const content: Anthropic.Beta.BetaContentBlockParam[] = [];
	for (const s of [...shots.mobile, ...shots.desktop]) {
		content.push({ type: 'text', text: s.label });
		content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: s.base64 } });
	}
	const missing: string[] = [];
	if (!shots.mobile.length) missing.push('the phone screenshots failed to load');
	if (!shots.desktop.length) missing.push('the desktop screenshots failed to load');

	const { challenge: _c, requestedUrl: _r, codeUnreadable, ...codeFacts } = facts;
	const text = (shots.markdown || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\n{3,}/g, '\n\n').slice(0, 14_000);
	content.push({
		type: 'text',
		text: [
			missing.length ? `Note: ${missing.join('; ')}. Use only what you have.` : '',
			codeUnreadable
				? "The page's code could not be read (the site turned away a plain request), so there are no code facts. Do not use page_code as evidence, and do not claim anything is missing from the code."
				: `Facts read from the page's code:\n${JSON.stringify(codeFacts, null, 1)}`,
			speed
				? `Real-visitor speed on phones (Chrome field data, 75th percentile, ${speed.scope}): main content shows after ${speed.lcpSeconds ?? 'unknown'} s (Google rates this ${speed.lcpRating ?? 'unrated'}; good is 2.5 s or less); response to taps ${speed.inpMs ?? 'unknown'} ms (good is 200 ms or less); layout shift ${speed.cls ?? 'unknown'} (good is 0.1 or less). Only raise speed if one of these is outside the good range.`
				: 'Real-visitor speed: not available for this site. Say nothing about speed.',
			`The page's text (as rendered, may be cut short):\n<page_text>\n${text || '(no text could be read)'}\n</page_text>`,
			retryNote || 'Now write the five findings.'
		]
			.filter(Boolean)
			.join('\n\n')
	});

	const res = await client.beta.messages.create({
		model: env.MODEL || 'claude-sonnet-5-5',
		max_tokens: 12_000,
		betas: ['server-side-fallback-2026-07-01'],
		fallbacks: 'default',
		system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
		output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
		messages: [{ role: 'user', content }]
	} as never) as unknown as Anthropic.Beta.BetaMessage;

	if (res.stop_reason === 'refusal') throw new Error('review refused');
	if (res.stop_reason === 'max_tokens') throw new Error('review ran out of room');
	const block = res.content.find((b) => b.type === 'text');
	if (!block || block.type !== 'text') throw new Error('review returned no text');
	const parsed = JSON.parse(block.text) as Review;
	return { review: clean(parsed, shots, speed, codeUnreadable), model: res.model, usage: res.usage };
}

/** Drops findings that cite material the model was never given, and tidies the copy. */
function clean(r: Review, shots: Shots, speed: FieldSpeed | null, codeUnreadable: boolean): Review {
	const have: Record<Evidence, boolean> = {
		desktop_screenshot: shots.desktop.length > 0,
		phone_screenshot: shots.mobile.length > 0,
		page_text: !!shots.markdown,
		page_code: !codeUnreadable,
		real_visitor_speed: !!speed
	};
	const tidy = (s: string) =>
		(s || '')
			.replace(/\s*[—–]\s*/g, ', ')
			.replace(/,\s*,/g, ',')
			.replace(/!(\s|$)/g, '.$1')
			.replace(/\s+/g, ' ')
			.trim();
	const stop = (s: string) => (s && !/[.?!)'"]$/.test(s) ? s + '.' : s);
	return {
		page_state: r.page_state,
		site_name: tidy(r.site_name).slice(0, 80),
		business_type: tidy(r.business_type).slice(0, 60),
		strength: stop(tidy(r.strength)).slice(0, 300),
		findings: (r.findings || [])
			.filter((f) => have[f.evidence])
			.map((f) => ({ ...f, title: tidy(f.title).replace(/\.$/, ''), where: stop(tidy(f.where)), why: stop(tidy(f.why)), fix: stop(tidy(f.fix)) }))
			.slice(0, 5),
		unable_to_check: (r.unable_to_check || []).map(tidy).filter(Boolean).slice(0, 4)
	};
}
