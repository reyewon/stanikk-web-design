// The site's photographs and design work live in src/assets/images/ (moved from
// public/images/ on 18 Oct 2026) so astro:assets can resize, convert and hash them.
// Pages still name each image by its old public path ('/images/design/x.jpg'),
// which keeps the data arrays readable; this table turns that path into the asset.
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/**/*.{jpg,jpeg,png,webp}', { eager: true });

// One quality for every copy, so the full-size file the srcset ends on and the one
// a viewer opens are the same file rather than two encodes of it.
export const QUALITY = 82;

export function assetFor(path: string): ImageMetadata {
  const asset = files['/src/assets' + path.split('?')[0]]?.default;
  if (!asset) throw new Error(`No image at src/assets${path}: add it there, or fix the path`);
  return asset;
}

// Width and height without touching the import itself: reading any property of it
// marks the original as used, and the build then ships the untouched file as well.
export function sizeOf(asset: ImageMetadata): { width: number; height: number } {
  const { width, height } = (asset as any).clone ?? asset;
  return { width, height };
}

// Old public URL -> the full-size file astro:assets wrote, collected while pages
// render so the build can 301 the old URLs (the integration in astro.config.mjs).
const moved: Map<string, string> = ((globalThis as any).__kombuMovedImages ??= new Map());

// The full-size WebP, for the src and for anything that opens an image full size (data-full).
export async function fullUrl(path: string): Promise<string> {
  const img = await getImage({ src: assetFor(path), format: 'webp', quality: QUALITY });
  moved.set(path.split('?')[0], img.src);
  return img.src;
}

// A JPEG at full size for og:image, absolute, since some link previews skip WebP.
export async function ogUrl(path: string): Promise<string> {
  const img = await getImage({ src: assetFor(path), format: 'jpg', quality: 85 });
  return new URL(img.src, 'https://kombu.uk').href;
}
