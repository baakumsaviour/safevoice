# SafeVoice Production-Readiness Design

**Date:** 2026-08-17
**Status:** Executed autonomously per owner's mandate ("take over this project and make it production-ready"); owner review requested post-hoc.

## 1. What SafeVoice is

A trauma-informed platform for victims of GBV and child abuse in Ghana: anonymous or authenticated incident reporting (narrative, voice note, evidence files), a secure case chat with an AI first-responder that hands off to human caseworkers, caseworker/admin case management, and (later) regional analytics. Stack: Next.js 16 App Router + Server Actions, Supabase (Postgres/Auth/Storage/Realtime), Tailwind v4, deployed on Vercel.

## 2. State found during the audit (the "grill")

Three parallel audits (auth/RBAC, reporting flow, DB/dashboards) found the app **functionally demo-ready but unsafe and not actually running**:

### Blockers
- **The Supabase project (`mraqktjekogpucmodghp`) no longer resolves in DNS** — paused/deleted. Nothing works locally or in production.
- **Live secrets committed to git** in `.env.example` (service-role key, DB password, JWT secret, AI Gateway key). `.gitignore` does not ignore `.env`.

### Critical security defects
1. Server actions (`chat.ts`, `admin.ts`, `report.ts`) all use a module-scope **service-role client with zero auth checks**. `getCaseDetailsAction`, `sendChatMessageAction`, `getAdminDataAction`, `inviteCaseworkerAction`, `assignCaseAction` are unauthenticated public endpoints: full case dump, caseworker impersonation, self-service staff-account minting.
2. **RLS is decorative** — written but bypassed everywhere; and itself broken: `users_update_own` lacks `WITH CHECK` (self-promotion to admin), `messages_insert` doesn't check case membership or role, storage policy grants every authenticated user read of **all** evidence files, `audit_insert_always WITH CHECK (true)` allows forged audit entries.
3. **"Encryption" is base64.** UI promises client-side encryption to abuse victims; nothing is encrypted. The one real AES helper uses a `NEXT_PUBLIC_` (browser-shipped) key with an unsafe default, and is dead code.
4. Case numbers from `Math.random()` (~6 base-36 chars) are the sole credential for anonymous follow-up **and** the storage folder name — guessable, collision-prone, no retry.

### Major correctness defects
- Middleware redirect loop for missing/`analyst` roles; `/analytics` unprotected (route group has no URL segment); signup ignores email-confirmation; admin Sign Out button wired to nothing.
- AI chat: invalid OpenRouter model (`openrouter/free`), key not set anywhere → always silent failure; AI replies attributed to a **random unrelated victim's** user id (duplicate object key bug); caseworker replies stored with the victim's own id; anonymous reporters have no auth session so **RLS blocks realtime — AI replies never reach them anyway**.
- Realtime setup script `DROP`s the whole `supabase_realtime` publication and only re-adds `case_messages`; the `cases` listener never fires; channel cleanup returned from inside `.then()` → leak.
- 10 MB Server Action body limit vs "up to 50 MB" promised in the uploader → throw with no `try/catch`, spinner stuck forever, report lost.
- Evidence upload failures silently swallowed while the victim is told "Report Submitted Safely"; no server-side size/MIME validation; `upsert: true` lets colliding paths overwrite evidence.
- `case_type` nullable with divergent value sets across selector/server/analytics; `.replace('_',' ')` crashes on null and misses later underscores.
- ~615 lines of dead code (`lib/actions/*`, `lib/hooks/use-realtime-cases.ts`, `components/dashboard-sidebar.tsx`, `components/quick-escape-button.tsx`) — including all the *real* security controls (AES, MIME allowlist, audit logging), wired to nothing.
- `typescript.ignoreBuildErrors: true` hides ~38 errors including genuine logic bugs.

## 3. Design decisions

### D1 — Identity: anonymous Supabase auth sessions
Anonymous reporters get a real session via `supabase.auth.signInAnonymously()`. `public.users.id` = `auth.users.id` always. This makes RLS and Realtime work for anonymous victims (fixes the one-way chat), gives a stable identity for follow-up, and removes the fake `anon-<timestamp>@safevoice.local` rows. Requires enabling Anonymous sign-ins in Supabase Auth settings.

### D2 — Authorization: auth checks in every server action; RLS as defense-in-depth
- New `lib/supabase/admin.ts`: lazy, `server-only` service-role client.
- New `server/auth.ts`: `requireUser()` and `requireRole(...roles)` helpers using the cookie-bound SSR client. **First line of every server action.**
- Sender identity/role always derived from the session, never from arguments.
- Case access scoped: victims see own cases; caseworkers see assigned; admins see all.
- RLS v2 migration fixes: `WITH CHECK` on updates, case-membership + role checks on message inserts, per-case-scoped storage policies, no client-forgeable audit inserts, `ai_active` merged into schema.
- Middleware remains an optimistic gate only; loop fixed (unknown role → sign out to `/auth/login?error=...`), `/analytics` moved under `/admin/analytics`, auth pages redirect signed-in users away.

### D3 — Honest security: server-side AES-256-GCM, truthful copy
Client-side E2E encryption is incompatible with the product (AI triage and caseworkers must read narratives, priority is keyword-derived server-side). So: application-layer **AES-256-GCM with a server-only `ENCRYPTION_KEY`** (never `NEXT_PUBLIC_`), random IV per record, `enc:v1:` prefix with base64-legacy fallback on read. All victim-facing copy changed to the truthful "encrypted in transit and stored encrypted" language. crypto-js removed; Node `crypto` used.

### D4 — Case references: CSPRNG + retry
`SV-XXXX-XXXX` from `crypto.randomBytes` (unambiguous alphabet, ~40 bits), unique-violation retry loop. Storage object keys become `caseId/crypto.randomUUID()` — never the case number, no `upsert`.

### D5 — AI responder: Vercel AI Gateway via AI SDK
The user's key is a Vercel AI Gateway key (`AI_GATEWAY_API_KEY`), not NVIDIA. Rewire `triggerAIResponse` to the AI SDK (`ai` package) with a gateway model string (default `openai/gpt-4o-mini`, configurable via `AI_MODEL` env var). Fail visibly in logs; AI messages stored with `sender_role='ai'` (schema change: allow `'ai'`, make `sender_id` nullable for AI rows) so no victim is ever falsely recorded as the author.

### D6 — Reporting flow hardening
Server-side Zod v2 schema: enum-constrained `case_type`, `consent_given: z.literal(true)`, ISO date not-in-future, narrative 10–10 000 chars, contact format check. Server-side file caps (8 MB/file to fit the body limit honestly, MIME allowlist) with client copy matched to it. `try/catch/finally` around submission, upload failures surfaced ("your report was saved, but the file failed — keep your copy"), evidence insert errors checked. Mic released on unmount + denied-permission UI + max duration in `VoiceRecorder`.

### D7 — Environments
- **Local:** `supabase start` (Docker) + `supabase/config.toml` + consolidated migration + seed (admin + caseworker users). `.env.local` generated from local stack keys.
- **Production:** owner must restore or recreate the Supabase cloud project and set env vars in Vercel (documented in `docs/RECOVERY_RUNBOOK.md`). All committed secrets treated as compromised → rotate.

### D8 — Cleanup
Delete dead modules; port their good ideas (audit logging on case access, MIME allowlist) into the live path. Remove `ignoreBuildErrors`; fix all TS errors. Fix admin sign-out, caseworker attribution, realtime publication script (idempotent `ALTER PUBLICATION ... ADD`), channel cleanup, `case_type` guards + single value set in `constants/incident-types.ts`, status filtering on admin dashboard. Analytics page stays stubbed (Mapbox deferred) but moves behind admin auth.

## 4. Out of scope (deferred, tracked in roadmap)
PWA/offline (IndexedDB queue), SMS/USSD, Mapbox heatmaps with real geo data, 30-day data-expiry job, MFA for staff, rate limiting (needs infra choice — Vercel WAF or Upstash), i18n.

## 5. Verification
- `tsc --noEmit` clean; `next build` with type checking ON.
- Local Supabase stack: seeded roles; Playwright smoke: anonymous report end-to-end → case visible in admin; chat message round-trip; auth redirects (victim↔admin, analytics gated).
- Manual: quick-escape, voice recorder cleanup, oversized-file rejection message.
