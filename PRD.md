# PRD: Autonomous Local Business Growth Engine (ALBGE)

## 1. Objective
An end-to-end multi-agent system that identifies under-optimized local businesses on Google, generates high-conversion React landing pages for them, and initiates automated outreach via Email/WhatsApp.

## 2. Technical Stack
- **Orchestration:** LangGraph (Stateful transitions between Scout, Designer, and Closer).
- **Extraction:** Playwright + Stealth Plugin (via gstack-style browser daemon).
- **Frontend Generation:** React + Tailwind CSS (using TDD methodology).
- **Persistence:** Supabase (PostgreSQL + Auth + Storage for hosted sites).
- **Messaging:** Twilio API (WhatsApp) & Resend/Postmark (Email).
- **Event Bus:** Kafka (for handling lead queues at scale).

## 3. Agent Roles & Workflow
1. **The Scout (Ingestion):** - Scrapes Google Maps for businesses with missing websites or poor mobile optimization.
   - Saves structured JSON to `leads` table in Supabase.
2. **The Designer (Creative):** - Uses `superpowers` TDD approach: writes a vitest suite for the UI requirements first.
   - Generates a custom `LandingPage.tsx` using business-specific metadata.
3. **The Closer (Outreach):** - Drafts personalized copy referencing the newly built site.
   - Triggers outreach and tracks "Open/Click" status via Webhooks.

## 4. Engineering Standards (The Harness)
- **TDD First:** No UI code is committed without a corresponding test file.
- **Idempotency:** Each lead must have a unique hash to prevent duplicate outreach.
- **Safety:** All outreach must include an 'Opt-out' mechanism and human-in-the-loop (HITL) approval flag.