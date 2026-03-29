#!/usr/bin/env bash
# Create a standalone git repo for one built site: run generate, then seed from template + copy dist output.
# Usage:
#   ./scripts/new-site-repo.sh "<google-maps-url>" [category] [parent-directory]
#   Category is optional; use a word like handyman or plumber (see generate.ts). Paths for
#   parent-directory should start with /, ./, ../, or be an existing directory so they are
#   not mistaken for a category. Alternatively: ALBGE_CATEGORY=handyman ./scripts/...
#
# Environment:
#   ALBGE_SITE_TEMPLATE_REPO  — if set, `git clone <url> <dest>` instead of copying templates/site-repo
#
# Requires: repo root .env with GOOGLE_PLACES_API_KEY; npm deps (npm run install:all from repo root).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENGINE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MAPS_URL="${1:-}"
CATEGORY_ARG=""
PARENT_DIR=""
TEMPLATE_LOCAL="$ENGINE_ROOT/templates/site-repo"

is_parent_dir_arg() {
  local a="${1:-}"
  [[ "$a" == . || "$a" == .. ]] && return 0
  [[ "$a" == /* || "$a" == ./* || "$a" == ../* ]] && return 0
  [[ -n "$a" && -d "$a" ]] && return 0
  return 1
}

usage() {
  echo "Usage: $0 \"<google-maps-url>\" [category] [parent-directory]" >&2
  echo "  parent-directory defaults to the folder containing the engine repo (sibling path)." >&2
  echo "  Optional category overrides Places (e.g. handyman). Or set ALBGE_CATEGORY." >&2
  echo "  Set ALBGE_SITE_TEMPLATE_REPO to a git URL to clone that template instead of templates/site-repo." >&2
  exit 1
}

[[ -n "$MAPS_URL" ]] || usage

if [[ -n "${2:-}" ]]; then
  if is_parent_dir_arg "$2"; then
    PARENT_DIR="$2"
  else
    CATEGORY_ARG="$2"
    if [[ -n "${3:-}" ]]; then
      PARENT_DIR="$3"
    fi
  fi
fi

PARENT_DIR="${PARENT_DIR:-$(dirname "$ENGINE_ROOT")}"
CATEGORY_ARG="${ALBGE_CATEGORY:-$CATEGORY_ARG}"

if [[ ! -f "$ENGINE_ROOT/.env" ]]; then
  echo "Warning: no .env at repo root — GOOGLE_PLACES_API_KEY may be missing." >&2
fi

cd "$ENGINE_ROOT"

echo "→ Running generate (builds into sites/<slug>/ )..."
if [[ -n "$CATEGORY_ARG" ]]; then
  npx ts-node generate.ts "$MAPS_URL" "$CATEGORY_ARG"
else
  npx ts-node generate.ts "$MAPS_URL"
fi

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
