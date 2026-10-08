// Secrets are set with `wrangler secret put`, so `wrangler types` can't see them.
interface Env {
	ANTHROPIC_API_KEY: string;
	RESEND_API_KEY?: string;
	ADMIN_TOKEN?: string;
	CRUX_API_KEY?: string;
}
