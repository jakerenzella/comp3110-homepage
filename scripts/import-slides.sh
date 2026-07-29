#!/usr/bin/env bash
#
# Copy exported lecture PDFs from the slides repo into public/slides/.
#
# The slides repo holds the iA Presenter bundles and gitignores its own *.pdf
# exports, so the published copy is the one committed here. Re-run after every
# export; it overwrites in place, so the paths in data/syllabus.json stay valid.
#
# Usage:
#   npm run slides:import
#   SLIDES_DIR=~/somewhere/else npm run slides:import
#
set -euo pipefail

site_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
src="$(cd "${SLIDES_DIR:-$site_root/../slides}" 2>/dev/null && pwd || true)"
dest="$site_root/public/slides"

if [ -z "$src" ]; then
  echo "error: slides directory not found at ${SLIDES_DIR:-$site_root/../slides}" >&2
  echo "       set SLIDES_DIR to point at the slides repo" >&2
  exit 1
fi

# Top-level exports only. Anything inside a .iapresenter bundle is app-managed.
shopt -s nullglob
pdfs=("$src"/*.pdf)
shopt -u nullglob

if [ ${#pdfs[@]} -eq 0 ]; then
  echo "error: no PDFs in $src" >&2
  echo "       export the decks from iA Presenter first (File > Export > PDF)" >&2
  exit 1
fi

mkdir -p "$dest"

copied=0
for pdf in "${pdfs[@]}"; do
  name="$(basename "$pdf")"
  # Warn on a PDF with no bundle behind it: usually a stale export left over
  # from a deck that was since renamed.
  if [ ! -d "$src/${name%.pdf}.iapresenter" ]; then
    echo "  warning: $name has no matching .iapresenter bundle"
  fi
  if cmp -s "$pdf" "$dest/$name"; then
    echo "  unchanged  $name"
  else
    cp "$pdf" "$dest/$name"
    echo "  copied     $name  ($(du -h "$pdf" | cut -f1 | tr -d ' '))"
    copied=$((copied + 1))
  fi
done

echo
echo "$copied of ${#pdfs[@]} file(s) updated in public/slides/"
if [ "$copied" -gt 0 ]; then
  echo "commit them here: they are gitignored in the slides repo."
fi
