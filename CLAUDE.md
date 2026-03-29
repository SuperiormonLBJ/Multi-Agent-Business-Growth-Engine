# 21st.dev Usage Rule
- **Reference only:** Use https://21st.dev/community/components for design inspiration. Install components via `npx shadcn@latest add "https://21st.dev/r/[author]/[component]"`. Do NOT screenshot or browse the site. Pick components by category need (hero, testimonials, CTA, footer) when building UI.

# Engineering Standards
- **Browser Persistence:** Use a single persistent Playwright Context for all scraping to avoid Google bot detection.
- **TDD Requirement:** Every new feature in `/services/designer` must have a corresponding `.test.tsx` file using Vitest.
- **State Management:** Use PostgreSQL (Supabase) as the source of truth for all lead states.
- **Async First:** All external API calls (Twilio, Resend) must be handled via Kafka topics to ensure retries on failure.


## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /review, /ship, /land-and-deploy, /canary, /benchmark, /browse,
/qa, /qa-only, /design-review, /setup-browser-cookies, /setup-deploy, /retro,
/investigate, /document-release, /codex, /cso, /autoplan, /careful, /freeze, /guard,
/unfreeze, /gstack-upgrade.