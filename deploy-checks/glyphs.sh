#!/bin/bash
# Glyph coverage (review card design-7, 18 Oct 2026): every character the live pages set in
# a web font must exist in that font file. glyphcheck renders each page in the sitemap,
# collects the text per face after text-transform, and diffs it against the font's cmap.
set -euo pipefail
base="${PRODUCTION_URL:-https://kombu.uk}"
exec "$HOME/.local/bin/glyphcheck" --sitemap "${base%/}/sitemap-0.xml"
