// Desktop and phone screenshots through Browser Run, cut into the frames the
// model looks at. Same quickAction route Folio uses.

export type Shot = { label: string; base64: string; width: number; height: number };
export type Shots = { desktop: Shot[]; mobile: Shot[]; markdown: string; thumb: string | null; errors: string[] };

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };
const PHONE_UA = 'Mozilla/5.0 (Linux; Android 15; 24129PN74G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';

type SnapResult = { success?: boolean; result?: { screenshot?: string; markdown?: string }; errors?: { message?: string }[] };

// Pop-ups often lock scrolling (overflow hidden on html or body), which would stop
// the pass, so the lock is lifted while scrolling and put back after. Then anything
// fixed to the screen (cookie bars, chat buttons, sticky headers) is pinned where it
// sits on the first screen: in a capture taller than the screen it would otherwise
// land at the bottom of the whole capture, where no visitor sees it.
function revealScript(depth: number): string {
	return `(async()=>{const d=document.documentElement,b=document.body,s=[d.style.overflow,b.style.overflow,d.style.overflowY,b.style.overflowY];
const lock=[d,b].some(e=>/hidden|clip/.test(getComputedStyle(e).overflowY));if(lock){d.style.overflow=b.style.overflow='visible';d.style.overflowY=b.style.overflowY='visible'}
const H=Math.min(Math.max(d.scrollHeight,b.scrollHeight),${depth});const go=y=>{scrollTo(0,y);(document.scrollingElement||d).scrollTop=y;dispatchEvent(new Event('scroll'))};
for(let y=0;y<=H;y+=Math.round(innerHeight*0.5)){go(y);await new Promise(r=>setTimeout(r,110))}go(H);await new Promise(r=>setTimeout(r,400));go(0);
if(lock){[d.style.overflow,b.style.overflow,d.style.overflowY,b.style.overflowY]=s}
await new Promise(r=>setTimeout(r,700));
for(const e of document.querySelectorAll('body *')){const c=getComputedStyle(e);if(c.position!=='fixed'||c.display==='none'||c.visibility==='hidden')continue;const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;
const p=(k,v)=>e.style.setProperty(k,v,'important');p('position','absolute');p('top','0px');p('left','0px');p('right','auto');p('bottom','auto');p('margin','0');p('width',r.width+'px');p('height',r.height+'px');p('transform','none');
const n=e.getBoundingClientRect();p('top',(r.top-n.top)+'px');p('left',(r.left-n.left)+'px')}})()`;
}

async function snap(env: Env, url: string, mobile: boolean): Promise<{ jpeg: Uint8Array; markdown: string }> {
	const vp = mobile ? PHONE : DESKTOP;
	const depth = mobile ? vp.height * 2 : vp.height * 3; // two phone screens, three desktop screens
	const res = await env.BROWSER.quickAction('snapshot', {
		url,
		formats: ['screenshot', 'markdown'],
		gotoOptions: { waitUntil: 'networkidle2', timeout: 25_000 },
		bestAttempt: true,
		// Scroll through the part we capture and back, so scroll-triggered fade-ins and lazy
		// images have played before the shot. Without this they show as blank or half-faded.
		addScriptTag: [{ content: revealScript(depth) }],
		waitForTimeout: 2_600,
		viewport: { ...vp, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile },
		...(mobile ? { userAgent: PHONE_UA } : {}),
		setExtraHTTPHeaders: { 'Accept-Language': 'en-GB,en;q=0.9' },
		screenshotOptions: { type: 'jpeg', quality: 78, clip: { x: 0, y: 0, width: vp.width, height: depth }, captureBeyondViewport: true }
	} as never);
	const body = (await res.json()) as SnapResult;
	if (!res.ok || !body.success || !body.result?.screenshot) {
		throw new Error(body.errors?.[0]?.message || `Browser Run ${res.status}`);
	}
	return { jpeg: Uint8Array.from(atob(body.result.screenshot), (c) => c.charCodeAt(0)), markdown: body.result.markdown || '' };
}

async function cut(env: Env, jpeg: Uint8Array, top: number, height: number, outWidth: number, quality = 80): Promise<Shot | null> {
	const info = await env.IMAGES.info(new Blob([jpeg]).stream());
	const w = 'width' in info ? info.width : 0;
	const h = 'height' in info ? info.height : 0;
	if (!w || top >= h - 40) return null;
	const take = Math.min(height, h - top);
	const out = await env.IMAGES.input(new Blob([jpeg]).stream())
		.transform({ trim: { top, left: 0, width: w, height: take } })
		.transform({ width: Math.min(outWidth, w) })
		.output({ format: 'image/jpeg', quality });
	const buf = new Uint8Array(await new Response(out.image()).arrayBuffer());
	const scale = Math.min(outWidth, w) / w;
	return { label: '', base64: toBase64(buf), width: Math.round(w * scale), height: Math.round(take * scale) };
}

function toBase64(buf: Uint8Array): string {
	let s = '';
	for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
	return btoa(s);
}

export async function takeShots(env: Env, url: string): Promise<Shots> {
	const errors: string[] = [];
	const [d, m] = await Promise.allSettled([snap(env, url, false), snap(env, url, true)]);
	const out: Shots = { desktop: [], mobile: [], markdown: '', thumb: null, errors };

	if (d.status === 'fulfilled') {
		out.markdown = d.value.markdown;
		const fold = await cut(env, d.value.jpeg, 0, DESKTOP.height, 1440);
		const below = await cut(env, d.value.jpeg, DESKTOP.height, DESKTOP.height * 2, 960, 74);
		if (fold) out.desktop.push({ ...fold, label: 'Desktop, first screen (1440 x 900, what loads before any scrolling)' });
		if (below) out.desktop.push({ ...below, label: 'Desktop, the next two screens down (scaled to 960 wide)' });
	} else errors.push('desktop: ' + String(d.reason?.message || d.reason));

	if (m.status === 'fulfilled') {
		if (!out.markdown) out.markdown = m.value.markdown;
		const s1 = await cut(env, m.value.jpeg, 0, PHONE.height * 2, 780);
		const s2 = await cut(env, m.value.jpeg, PHONE.height * 2, PHONE.height * 2, 780);
		if (s1) out.mobile.push({ ...s1, label: 'Phone, first screen (390 x 844 at 2x, before any scrolling)' });
		if (s2) out.mobile.push({ ...s2, label: 'Phone, second screen (one scroll down)' });
		const thumb = await cut(env, m.value.jpeg, 0, PHONE.height * 2, 390, 70);
		out.thumb = thumb ? thumb.base64 : null;
	} else errors.push('mobile: ' + String(m.reason?.message || m.reason));

	return out;
}
