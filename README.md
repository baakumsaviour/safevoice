# SafeVoice — Trauma-Informed Incident Reporting & Case Management

SafeVoice helps victims of gender-based violence and child abuse in Ghana report incidents safely — anonymously or with an account — and connects them with caseworkers through a secure chat with an AI first-responder.

## What it does

- **Anonymous reporting** (`/report`): a 4-step trauma-informed wizard (category → details with voice notes → evidence → review). Anonymous reporters get a real (anonymous) Supabase auth session, so their case stays reachable from the same browser and Realtime works. Case references look like `SV-K3TP-9WQA`.
- **Secure chat** (`/` and `/chat/[caseNumber]`): live chat that opens a case, answered first by a trauma-informed AI responder (via Vercel AI Gateway) and handed off to a human caseworker the moment one replies.
- **Staff portal** (`/admin`): case list with triage status, case detail with decrypted narrative and chat, caseworker assignment, user management, analytics stub (`/admin/analytics`).
- **Quick Escape**: floating button + double-Esc instantly replaces the page with Google and scrubs the tab title/history entry.

## Security model (the honest version)

- Narratives and chat messages are encrypted at rest with **AES-256-GCM** using a **server-only** `ENCRYPTION_KEY` (`lib/server/encryption.ts`). Transport is HTTPS. This is *not* end-to-end encryption — caseworkers and the AI triage need to read the content — and the UI copy says so truthfully.
- Every server action authenticates and authorizes first (`server/auth.ts`: `requireUser` / `requireRole`); sender identity and role always come from the session, never from client arguments.
- Supabase **RLS is enforced** as defense-in-depth (see `supabase/migrations/`): victims see only their cases, caseworkers only assigned ones, storage objects are scoped per case, and users cannot change their own role (trigger-enforced).
- Evidence uploads: 8 MB cap, MIME allowlist, UUID object keys under the case id (never the case reference), no overwrites.

## Stack

Next.js 16 (App Router, Server Actions) · TypeScript strict · Tailwind v4 · Supabase (Postgres, Auth with anonymous sign-ins, Storage, Realtime) · AI SDK via Vercel AI Gateway · Playwright · Vercel.

## Local development

Prereqs: Node 20+, pnpm, Docker, Supabase CLI.

```bash
pnpm install
supabase start            # local Postgres/Auth/Storage/Realtime + applies migrations & seed
# create .env.local with the keys `supabase status` prints:
#   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
#   SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
#   ENCRYPTION_KEY=$(openssl rand -base64 32)
#   AI_GATEWAY_API_KEY=<your key>   # optional; chat AI silently skips without it
pnpm dev
```

Seeded local staff accounts (local stack only): `admin@safevoice.local` / `worker@safevoice.local`, password `password123`.

## Tests

```bash
npx playwright test        # e2e: report wizard, chat, auth redirects, admin round-trip
AI_E2E=1 npx playwright test tests/ai-chat.spec.ts   # AI reply test (needs funded AI Gateway)
```

## Production deployment

See `docs/RECOVERY_RUNBOOK.md` — the Supabase project must be restored/recreated, **all previously committed keys rotated**, anonymous sign-ins enabled, migrations pushed (`supabase db push`), and env vars set in Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ENCRYPTION_KEY`, `AI_GATEWAY_API_KEY`, optional `AI_MODEL`).

## Deferred (tracked, not built)

PWA/offline queue, SMS/USSD reporting, Mapbox heatmaps with real geo data, 30-day evidence expiry job, staff MFA, rate limiting.
