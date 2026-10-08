#!/usr/bin/env python3
"""Write 640w, 800w and 1100w WebP copies next to the design, photography, preview and tray originals,
and a manifest (src/data/image-variants.json) that src/lib/srcset.ts reads to build
srcset attributes. Originals are untouched: the lightbox still opens them.
Re-run after adding images: python3 scripts/make-image-variants.py"""
import json, os
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIRS = ["public/images/design", "public/images/photography", "public/images/preview", "public/images/tray"]
WIDTHS = [640, 800, 1100]
manifest = {}
for d in DIRS:
    for name in sorted(os.listdir(os.path.join(ROOT, d))):
        base, ext = os.path.splitext(name)
        if ext.lower() not in (".jpg", ".jpeg", ".png", ".webp") or base.endswith(tuple(f"-{w}" for w in WIDTHS)):
            continue
        path = os.path.join(ROOT, d, name)
        im = Image.open(path)
        w, h = im.size
        variants = []
        for tw in WIDTHS:
            if tw >= w * 0.9:
                continue
            out = os.path.join(ROOT, d, f"{base}-{tw}.webp")
            if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(path):
                th = round(h * tw / w)
                mode = "RGBA" if im.mode in ("RGBA", "LA", "P") and ext.lower() == ".png" else "RGB"
                im.convert(mode).resize((tw, th), Image.LANCZOS).save(out, "WEBP", quality=80, method=6)
            variants.append([f"/{d[len('public/'):]}/{base}-{tw}.webp", tw])
        if variants:
            manifest[f"/{d[len('public/'):]}/{name}"] = {"w": w, "h": h, "variants": variants}
with open(os.path.join(ROOT, "src/data/image-variants.json"), "w") as f:
    json.dump(manifest, f, indent=1)
print(f"{len(manifest)} images with variants")
