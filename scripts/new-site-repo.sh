#!/usr/bin/env bash
# Create a standalone git repo for one built site: run generate, then seed from template + copy dist output.
# Usage:
#   ./scripts/new-site-repo.sh "<google-maps-url>" [parent-directory]
#
# Environment:
#   ALBGE_SITE_TEMPLATE_REPO  — if set, `git clone <url> <dest>` instead of copying templates/site-repo
#
# Requires: repo root .env with GOOGLE_PLACES_API_KEY; npm deps (npm run install:all from repo root).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENGINE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MAPS_URL="${1:-}"
PARENT_DIR="${2:-"$(dirname "$ENGINE_ROOT")"}"
TEMPLATE_LOCAL="$ENGINE_ROOT/templates/site-repo"

usage() {
  echo "Usage: $0 \"<google-maps-url>\" [parent-directory]" >&2
  echo "  parent-directory defaults to the folder containing the engine repo (sibling path)." >&2
  echo "  Set ALBGE_SITE_TEMPLATE_REPO to a git URL to clone that template instead of templates/site-repo." >&2
  exit 1
}

[[ -n "$MAPS_URL" ]] || usage

if [[ ! -f "$ENGINE_ROOT/.env" ]]; then
  echo "Warning: no .env at repo root — GOOGLE_PLACES_API_KEY may be missing." >&2
fi

cd "$ENGINE_ROOT"

echo "→ Running generate (builds into sites/<slug>/ )..."
npx ts-node generate.ts "$MAPS_URL"

SLUG="$(node -p "require('./services/designer/src/lead-data.json').slug")"
if [[ -z "$SLUG" || "$SLUG" == "undefined" ]]; then
  echo "Could not read slug from services/designer/src/lead-data.json" >&2
  exit 1
fi

SITE_SRC="$ENGINE_ROOT/sites/$SLUG"
if [[ ! -d "$SITE_SRC" ]]; then
  echo "Expected build output missing: $SITE_SRC" >&2
  exit 1
fi

DEST="$PARENT_DIR/${SLUG}-site"
if [[ -e "$DEST" ]]; then
  echo "Destination already exists: $DEST" >&2
  echo "Remove it or pick another parent directory." >&2
  exit 1
fi

mkdir -p "$PARENT_DIR"

if [[ -n "${ALBGE_SITE_TEMPLATE_REPO:-}" ]]; then
  echo "→ Cloning template: $ALBGE_SITE_TEMPLATE_REPO"
  git clone --depth 1 "$ALBGE_SITE_TEMPLATE_REPO" "$DEST"
else
  echo "→ Copying built-in template from templates/site-repo"
  mkdir -p "$DEST"
  cp -R "$TEMPLATE_LOCAL/." "$DEST/"
fi

echo "→ Copying built site from sites/$SLUG/"
# Overlay build artifacts (template README / vercel.json stay unless overwritten by same names)
cp -R "$SITE_SRC/." "$DEST/"

cd "$DEST"

if [[ ! -d .git ]]; then
  echo "→ git init"
  git init -b main
fi

git add -A
echo ""
echo "✓ Repo ready at: $DEST"
echo ""
echo "Next:"
echo "  1. Review: cd \"$DEST\" && python3 -m http.server 8080"
echo "  2. Commit:  git commit -m \"Initial site for $SLUG\""
echo "  3. Remote:  git remote add origin <your-empty-repo-url> && git push -u origin main"
echo "  4. Vercel:  see README.md in this folder (Import Git Repository → Other → output .)"
echo ""
