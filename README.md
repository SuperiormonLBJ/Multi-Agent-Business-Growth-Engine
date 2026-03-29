# Multi-Agent-Business-Growth-Engine

## One repo per client site

From repo root (after `npm run install:all`, root `npm install` for Playwright, `npx playwright install chromium`, and `.env` from `.env.example` with `GOOGLE_PLACES_API_KEY`):

```bash
./scripts/new-site-repo.sh "https://www.google.com/maps/place/..."
# or: npm run new-site-repo -- "https://..."
```

Creates `../<slug>-site/` with the built static files, `vercel.json`, and a **Vercel import** checklist in `README.md`. Override the parent directory with a second argument, or set `ALBGE_SITE_TEMPLATE_REPO` to clone a GitHub template instead of `templates/site-repo`.

Environment variables are documented in [.env.example](.env.example).

## Phase C: when a lead says yes (activation runbook)

What **LIVE** means for the first manual closes:

1. **Plumber (or trade) says yes** — they want the site and agree to setup + hosting.
2. **Confirm $99 payment** in the Stripe Dashboard (Phase C uses one shared Payment Link; set `STRIPE_PHASE_C_PAYMENT_LINK` in `.env` so `generate.ts` prints it in the message template).
3. **Site is already deployable** — after you `git push`, Vercel serves the static site (see per-site repo README).
4. **Reply on WhatsApp** with something like: *Your site is live at [url] — set up hosting here: [stripe-subscription-link]* (use your real recurring $9/mo Stripe link).
5. **Update the lead row** in `leads-tracker.csv`: set `status` to `converted` (or your agreed terminal state).

## WhatsApp / cold outreach

**WhatsApp Business Policy** prohibits unsolicited commercial messages to people who have not opted in. For Phase C (a small number of manual sends from a personal phone), operational risk is relatively low, but the policy still applies. Before scaling or automating outreach (Phase A), get a proper legal/compliance review and use approved channels (e.g. WhatsApp Business API with opt-in) where required.
