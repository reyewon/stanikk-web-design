// Turns whatever a visitor typed into a URL we are willing to fetch. Public web
// hosts on ports 80/443 only: no IP literals, no localhost, no internal names.

export class UrlError extends Error {}

const BLOCKED_SUFFIXES = ['.local', '.localhost', '.internal', '.lan', '.home', '.corp', '.test', '.invalid', '.example', '.onion'];

export function normaliseUrl(input: string): URL {
	let raw = (input || '').trim();
	if (!raw) throw new UrlError('Pop your website address in first.');
	if (raw.length > 500) throw new UrlError("That address is too long to be a website.");
	if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = 'https://' + raw.replace(/^\/+/, '');
	let url: URL;
	try {
		url = new URL(raw);
	} catch {
		throw new UrlError("That doesn't look like a website address.");
	}
	assertPublic(url);
	url.hash = '';
	return url;
}

export function assertPublic(url: URL): void {
	if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new UrlError('Only web addresses (http or https) can be checked.');
	if (url.username || url.password) throw new UrlError("That address can't be checked.");
	if (url.port && url.port !== '80' && url.port !== '443') throw new UrlError("That address can't be checked.");
	const host = url.hostname.toLowerCase().replace(/\.$/, '');
	if (!host.includes('.')) throw new UrlError("That doesn't look like a website address.");
	if (host.startsWith('[') || /^[\d.]+$/.test(host) || /^0x/i.test(host)) throw new UrlError('Please use the website name rather than an IP address.');
	if (host === 'localhost' || BLOCKED_SUFFIXES.some((s) => host.endsWith(s))) throw new UrlError("That address can't be checked.");
	if (!/^[a-z0-9.-]+$/.test(host) && !/^[a-z0-9.-]*xn--/.test(host)) throw new UrlError("That doesn't look like a website address.");
	const tld = host.split('.').pop()!;
	if (!/^(xn--[a-z0-9-]+|[a-z]{2,})$/.test(tld)) throw new UrlError("That doesn't look like a website address.");
}

/** The cache key for a site: host + path, without www, scheme or trailing slash. */
export function siteKey(url: URL): string {
	const host = url.hostname.toLowerCase().replace(/^www\./, '');
	const path = url.pathname.replace(/\/+$/, '') || '';
	return host + path;
}
