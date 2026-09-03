/**
 * Assembles the quotes.kombu.uk site into dist-quotes/.
 *
 * Quote pages live in quotes/<slug>/index.html and share the main site's
 * self-hosted brand fonts, so the fonts and favicons are copied in at build
 * time rather than duplicated in the repo. Deploy with:
 *   npm run build:quotes
 *   npx wrangler pages deploy ./dist-quotes --project-name=kombu-quotes --branch=main
 */
import { cp, rm, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const SRC = 'quotes';
const OUT = 'dist-quotes';
const SHARED = [
  ['public/fonts', `${OUT}/fonts`],
  ['public/favicon.svg', `${OUT}/favicon.svg`],
  ['public/favicon.ico', `${OUT}/favicon.ico`],
  ['public/favicon-32.png', `${OUT}/favicon-32.png`],
  ['public/apple-touch-icon.png', `${OUT}/apple-touch-icon.png`],
];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await cp(SRC, OUT, { recursive: true });

for (const [from, to] of SHARED) {
  if (!existsSync(from)) throw new Error(`Missing shared asset: ${from}`);
  await cp(from, to, { recursive: true });
}

const slugs = (await readdir(OUT, { withFileTypes: true }))
  .filter(d => d.isDirectory() && d.name !== 'fonts')
  .map(d => d.name);
console.log(`Built ${OUT}/ with quotes: ${slugs.join(', ')}`);
