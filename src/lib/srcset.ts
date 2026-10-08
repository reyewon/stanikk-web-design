// Smaller WebP copies of the design and photography images, made by
// scripts/make-image-variants.py. srcsetFor() returns a srcset string when copies
// exist (the original stays as the largest candidate and as src, which the
// lightbox opens), or undefined so the attribute is simply left off.
import variants from '../data/image-variants.json';

type Entry = { w: number; h: number; variants: [string, number][] };
const table = variants as Record<string, Entry>;

export function srcsetFor(src: string): string | undefined {
  const e = table[src];
  if (!e) return undefined;
  return [...e.variants.map(([url, w]) => `${url} ${w}w`), `${src} ${e.w}w`].join(', ');
}
