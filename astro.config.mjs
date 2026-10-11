// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kombu.uk',
  // Inline the stylesheets so the first paint doesn't wait on a CSS download
  // (PageSpeed flagged about.*.css as render-blocking on every page, 11 Oct 2026).
  build: { inlineStylesheets: 'always' },
  // lastmod is a freshness signal for both Search and AI answer engines, and
  // the sitemap shipped without one. Build time is the honest source: the site
  // is rebuilt whenever content changes, and git dates are not usable because
  // most page files are untracked.
  integrations: [
    sitemap({
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
});
