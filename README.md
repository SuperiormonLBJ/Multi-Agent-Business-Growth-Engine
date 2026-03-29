# Multi-Agent-Business-Growth-Engine

## One repo per client site

From repo root (after `npm run install:all` and `.env` with `GOOGLE_PLACES_API_KEY`):

```bash
./scripts/new-site-repo.sh "https://www.google.com/maps/place/..."
# or: npm run new-site-repo -- "https://..."
```

Creates `../<slug>-site/` with the built static files, `vercel.json`, and a **Vercel import** checklist in `README.md`. Override the parent directory with a second argument, or set `ALBGE_SITE_TEMPLATE_REPO` to clone a GitHub template instead of `templates/site-repo`.