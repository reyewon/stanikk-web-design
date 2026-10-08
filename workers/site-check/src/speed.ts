// Real-visitor speed from Chrome's field data (CrUX API), phones only. Lab
// scores are deliberately ignored: only what real phones experienced counts.
// Needs CRUX_API_KEY; without it, or for sites too small to have data, the
// check simply says nothing about speed.

export type FieldSpeed = {
	scope: 'page' | 'whole site';
	lcpSeconds: number | null;
	inpMs: number | null;
	cls: number | null;
	lcpRating: 'good' | 'needs improvement' | 'poor' | null;
};

type Metric = { percentiles?: { p75?: number | string } };
type Record_ = { record?: { metrics?: Record<string, Metric> } };

export async function fieldSpeed(url: string, key?: string): Promise<FieldSpeed | null> {
	if (!key) return null;
	const u = new URL(url);
	const tries: [FieldSpeed['scope'], Record<string, string>][] = [
		['page', { url: u.origin + u.pathname }],
		['whole site', { origin: u.origin }]
	];
	for (const [scope, target] of tries) {
		try {
			const res = await fetch(`https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${encodeURIComponent(key)}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...target, formFactor: 'PHONE', metrics: ['largest_contentful_paint', 'interaction_to_next_paint', 'cumulative_layout_shift'] }),
				signal: AbortSignal.timeout(6_000)
			});
			if (!res.ok) continue; // 404 = not enough visitors for data
			const m = ((await res.json()) as Record_).record?.metrics;
			const lcp = Number(m?.largest_contentful_paint?.percentiles?.p75);
			if (!m || !lcp) continue;
			const inp = Number(m.interaction_to_next_paint?.percentiles?.p75);
			const cls = Number(m.cumulative_layout_shift?.percentiles?.p75);
			return {
				scope,
				lcpSeconds: Math.round(lcp / 100) / 10,
				inpMs: inp || null,
				cls: Number.isFinite(cls) ? cls : null,
				lcpRating: lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs improvement' : 'poor'
			};
		} catch {
			/* speed is optional */
		}
	}
	return null;
}
