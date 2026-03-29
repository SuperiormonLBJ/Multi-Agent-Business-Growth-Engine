# Client landing (static)

This repository holds a **built** Vite/React export: `index.html`, `assets/`, `theme.css`, and `lead-data.js`. Customize files here per client without touching the main ALBGE engine repo.

## Deploy on Vercel

1. **Create a Git remote** (GitHub/GitLab/Bitbucket), then push this repo:

   ```bash
   git remote add origin git@github.com:YOUR_ORG/YOUR_REPO.git
   git push -u origin main
   ```

2. **Import in Vercel**  
   [vercel.com](https://vercel.com) → **Add New…** → **Project** → **Import Git Repository** → pick this repo.

3. **Project settings** (defaults usually work):

   - **Framework Preset:** Other  
   - **Root Directory:** `./` (repository root)  
   - **Build Command:** leave empty (static files only)  
   - **Output Directory:** `.` (must match `vercel.json`)

4. **Deploy** — Production URL is shown when the build finishes. Use that URL in outreach.

5. **Optional:** **Settings → Domains** to attach a custom domain for the client.

## Local preview

Static assets need an HTTP server (ES modules):

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/`.

## Regenerating from the engine

From the **Multi-Agent-Business-Growth-Engine** repo, run `generate.ts` with the Google Maps URL, then copy `sites/<slug>/` into this repo root (or re-run `scripts/new-site-repo.sh` into a fresh folder).
