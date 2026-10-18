// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { writeFile, readFile } from 'node:fs/promises';

// The photographs and design work moved from public/images/ to src/assets/images/
// on 18 Oct 2026 (astro:assets). Their old URLs, and the old generated copies
// (-640, -800, -1100 and -sm), 301 to the full-size file the build wrote, so links
// and image search results that point at the old addresses keep working.
// src/lib/assets.ts records each old path as the pages render.
function movedImages() {
  return {
    name: 'kombu-moved-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const moved = globalThis.__kombuMovedImages;
        if (!moved || !moved.size) throw new Error('kombu-moved-images: no image paths were recorded, so no redirects were written');
        const lines = [];
        for (const [from, to] of [...moved].sort()) {
          const base = from.replace(/\.(jpe?g|png|webp)$/, '');
          for (const old of [from, `${base}-640.webp`, `${base}-800.webp`, `${base}-1100.webp`, `${base}-sm.webp`]) {
            if (old !== to) lines.push(`${old} ${to} 301`);
          }
        }
        const file = new URL('_redirects', dir);
        const existing = await readFile(file, 'utf8').catch(() => '');
        await writeFile(file, existing + (existing && !existing.endsWith('\n') ? '\n' : '') + '# Images moved to astro:assets (written by the build)\n' + [...new Set(lines)].join('\n') + '\n');
        logger.info(`${moved.size} moved images, ${lines.length} redirects written to _redirects`);
      },
    },
  };
}

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
    movedImages(),
    sitemap({
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
});
