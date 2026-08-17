# SafeVoice Production-Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make SafeVoice secure, correct, and actually runnable: real auth on every server action, working RLS, honest encryption, a functioning AI chat via Vercel AI Gateway, and a reproducible local Supabase environment.

**Architecture:** Keep the existing Next.js 16 App Router + Server Actions + Supabase shape. Add a thin auth layer (`server/auth.ts`) consumed by every action, replace the base64 pseudo-encryption with server-side AES-256-GCM, replace ad-hoc SQL files with a consolidated idempotent migration under `supabase/migrations/`, and use anonymous Supabase auth sessions so RLS/Realtime work for anonymous reporters.

**Tech Stack:** Next.js 16.2, TypeScript strict, Supabase (`@supabase/ssr`), Zod, Node `crypto`, AI SDK (`ai` package) via Vercel AI Gateway, Playwright, Supabase CLI local stack.

## Global Constraints

- TypeScript strict; `tsc --noEmit` must be clean; `ignoreBuildErrors` removed by the end (Task 12).
- Never use the service-role client without a preceding `requireUser()`/`requireRole()` check, except the explicitly-documented anonymous report/chat entry points, which must create an anonymous auth session first.
- `sender_id`/`sender_role` and all identity fields derive from the session, never from client arguments.
- All victim-facing copy about security must be truthful: "encrypted in transit and stored encrypted" — never "encrypted in your browser".
- Encryption key env var is `ENCRYPTION_KEY` (server-only). `NEXT_PUBLIC_ENCRYPTION_KEY` must not exist anywhere.
- File uploads: 8 MB/file server-enforced cap; MIME allowlist `image/*, audio/*, video/mp4, application/pdf`; client copy says 8 MB.
- Case reference format: `SV-XXXX-XXXX` (alphabet `ABCDEFGHJKMNPQRSTUVWXYZ23456789`), generated with `crypto.randomBytes`, retried on unique violation.
- Incident types single source of truth: `constants/incident-types.ts` — values `domestic_violence, child_abuse, sexual_assault, gbv, harassment, general_abuse, other`.
- Commit after every task with a conventional-commit message.

---

### Task 0: Secret hygiene

**Files:**
- Modify: `.gitignore`, `.env.example`
- Create: `docs/RECOVERY_RUNBOOK.md`

Steps:
- [ ] Replace `.env.example` with a pure template (no real values): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ENCRYPTION_KEY` (comment: `openssl rand -base64 32`), `AI_GATEWAY_API_KEY`, `AI_MODEL` (default `openai/gpt-4o-mini`), `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` (optional).
- [ ] `.gitignore`: add `.env`, `.env.*`, `!.env.example`, plus `dev.log`, `dev.pid`, `tsconfig.tsbuildinfo`, `playwright-report/`, `test-results/` cleanup.
- [ ] `git rm --cached` nothing (only `.env.example` is tracked; rewrite in place). Write `docs/RECOVERY_RUNBOOK.md`: rotate all Supabase keys + DB password + AI Gateway key; restore/recreate the Supabase project; enable Anonymous sign-ins; run migrations; set Vercel env vars; optional git-history purge instructions (`git filter-repo`).
- [ ] Commit.

### Task 1: Local Supabase environment

**Files:**
- Create: `supabase/config.toml` (via `supabase init`), `supabase/migrations/20260817000000_init.sql`, `supabase/seed.sql`

Steps:
- [ ] `supabase init`; port `db/schema.sql` + `db/add_ai_handoff.sql` + fixed storage/realtime setup into one idempotent migration (Task 2 contains the policy fixes — write them directly here).
- [ ] `supabase/seed.sql`: create admin (`admin@safevoice.local`) and caseworker (`worker@safevoice.local`) auth users + matching `public.users` rows (password `password123` for local only).
- [ ] `supabase start`; write `.env.local` pointing at the local stack (anon key, service key, `ENCRYPTION_KEY` from `openssl rand -base64 32`).
- [ ] Verify: `supabase db reset` runs clean; commit (never commit `.env.local`).

### Task 2: Schema v2 + RLS fixes (inside the Task 1 migration)

Required changes relative to `db/schema.sql`:
- [ ] `public.users.id` references `auth.users(id)` where possible — keep as plain uuid PK for migration simplicity, but all app code now inserts with the auth uid.
- [ ] `cases.case_type` NOT NULL DEFAULT `'general_abuse'` + CHECK on the canonical list; `cases.ai_active BOOLEAN NOT NULL DEFAULT true` merged in.
- [ ] `case_messages.sender_role` CHECK extended to `('victim','caseworker','ai')`; `sender_id` made nullable (AI rows have NULL sender).
- [ ] `users_update_own` gains `WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()))` — implemented as separate USING/WITH CHECK preventing role self-change (use a `security definer` trigger `prevent_role_change` instead if simpler: raise exception when `NEW.role <> OLD.role` and `auth.uid() = OLD.id` and current user not admin).
- [ ] `cases_update_assigned` gains `WITH CHECK` forbidding change of `victim_id`, `created_by_user_id`, `case_number` (trigger `prevent_case_identity_change`).
- [ ] `messages_insert`: `WITH CHECK (sender_id = auth.uid() AND EXISTS (case membership as victim or assigned caseworker or admin) AND sender_role matches actual users.role mapping)`.
- [ ] `audit_insert_always` dropped; audit rows written only via service role (no anon policy).
- [ ] Storage: bucket `evidence` private; policies scoped — SELECT/INSERT only when the object's top folder equals a case id the user can access (victim/assigned/admin); no client UPDATE; service role handles the rest.
- [ ] Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE public.case_messages, public.cases;` guarded with DO-block existence checks — never `DROP PUBLICATION`.
- [ ] Indexes: add `idx_cases_victim ON cases(victim_id)`.
- [ ] Verify with `supabase db reset` + psql policy smoke queries; commit.

### Task 3: Server auth layer + admin client

**Files:**
- Create: `lib/supabase/admin.ts`, `server/auth.ts`
- Modify: `package.json` (add `server-only`)

**Interfaces (Produces):**
- `createAdminClient(): SupabaseClient` — lazy service-role client, `import 'server-only'`.
- `getSessionUser(): Promise<{ id: string; role: Role; email: string | null } | null>`
- `requireUser(): Promise<SessionUser>` — throws `AuthError('UNAUTHENTICATED')`.
- `requireRole(...roles: Role[]): Promise<SessionUser>` — throws `AuthError('FORBIDDEN')`.
- `type Role = 'victim' | 'caseworker' | 'admin' | 'analyst'`.
- [ ] Implement; commit.

### Task 4: Encryption module

**Files:**
- Create: `lib/server/encryption.ts`
- Delete: `lib/encryption.ts`; remove `crypto-js` from `package.json`.

**Interfaces (Produces):**
- `encrypt(plaintext: string): string` → `enc:v1:<b64(iv)>:<b64(tag)>:<b64(ciphertext)>` using AES-256-GCM, key = SHA-256 of `ENCRYPTION_KEY` env (throws at call time if missing in production, warns+derives dev key otherwise).
- `decrypt(stored: string): string` — handles `enc:v1:` format; legacy fallback: plain base64 → decoded utf8; on failure returns `'[unreadable]'`.
- [ ] Implement + a small node script check (`npx tsx` round-trip) since no unit-test runner exists; commit.

### Task 5: Reporting path rewrite

**Files:**
- Modify: `server/actions/report.ts`, `lib/supabase/storage.ts`, `components/feature/ReportForm.tsx`, `components/feature/EvidenceUploader.tsx`, `components/voice-recorder.tsx`
- Create: `constants/incident-types.ts`, `lib/server/case-number.ts`

**Interfaces (Produces):**
- `INCIDENT_TYPES: { value: IncidentType; label: string; description: string; icon: LucideIcon }[]` and `INCIDENT_TYPE_VALUES` tuple for Zod.
- `generateCaseNumber(): string`; `submitReportAction(formData)` returns `{ success: true, caseNumber, warnings: string[] } | { error: string }`.

Steps:
- [ ] Zod v2 schema per Global Constraints (consent `z.literal(true)`, date `YYYY-MM-DD` + not future, narrative 10–10000, case_type enum, contact ≤200 chars).
- [ ] Identity: if session user exists use it; else `signInAnonymously()` via the SSR cookie client, then insert/upsert `public.users` row with that auth uid (role `victim`).
- [ ] Real `encrypt()` for narrative; CSPRNG case number with 3-attempt retry on `23505`; evidence: server-side size/MIME validation, object key `caseId/randomUUID().ext-sanitized`, `upsert: false`, failures collected into `warnings` returned to the client and shown on the confirmation screen; evidence insert errors checked.
- [ ] `ReportForm`: wrap submit in try/catch/finally; show returned warnings; clipboard fallback (`document.execCommand` + only set "Copied" on success); fix `block flex` class conflicts; truthful copy; 8 MB copy in `EvidenceUploader` + input reset after validation error.
- [ ] `VoiceRecorder`: `useEffect` cleanup stopping tracks + timer; mic-denied visible error state; 5-minute cap.
- [ ] Verify: build + manual local run (submit anonymous report end-to-end against local stack); commit.

### Task 6: Chat + AI rewrite

**Files:**
- Modify: `server/actions/chat.ts`, `app/page.tsx`, `app/(dashboard)/admin/cases/[id]/page.tsx`
- Modify: `package.json` (add `ai`)

**Interfaces (Produces):**
- `initializeChatAction(initialMessage: string)` → anonymous session + case, returns `{ caseId, caseNumber }` (no userId leak).
- `sendChatMessageAction(caseId: string, message: string)` — sender derived from session; caseworker path checks `requireRole('caseworker','admin')` and case assignment; victim path checks ownership.
- `getCaseDetailsAction(caseNumber: string)` — requires session; victim must own the case; staff must be assigned or admin; decrypts messages server-side.
- `triggerAIResponse(caseId)` — AI SDK `generateText` with `gateway(process.env.AI_MODEL ?? 'openai/gpt-4o-mini')`, `AI_GATEWAY_API_KEY`; inserts `sender_role:'ai'`, `sender_id: null`; logs failures loudly; respects `ai_active`.
- [ ] Update homepage chat + admin case page to new signatures; fix realtime channel cleanup (return from `useEffect` body), remove the drop-all-caseworker-messages filter (dedupe by message id instead), fix `items-${...}` dynamic Tailwind class, decode via server (no client base64), `case_type` null-guards + `replaceAll`.
- [ ] Admin replies attributed to the real staff user (from session).
- [ ] Verify locally: anonymous chat round-trip with AI reply arriving over realtime; commit.

### Task 7: Admin/victim actions hardening

**Files:**
- Modify: `server/actions/admin.ts`, `server/actions/victim.ts`, `app/(dashboard)/admin/page.tsx`, `app/(dashboard)/admin/users/page.tsx`

Steps:
- [ ] `requireRole('admin')` on `inviteCaseworkerAction`; `requireRole('caseworker','admin')` on `getAdminDataAction`/`assignCaseAction`; `requireUser()` + own-cases filter on victim actions; audit-log entries (service role) for case reads/assignments.
- [ ] Admin dashboard: filter to non-archived, order by `created_at desc`, render all four statuses, null-safe `case_type`.
- [ ] Verify + commit.

### Task 8: Middleware + routing fixes

**Files:**
- Modify: `lib/supabase/middleware.ts`, `app/(dashboard)/layout.tsx`, `app/auth/actions.ts`
- Move: `app/(dashboard)/analytics/` → `app/(dashboard)/admin/analytics/`

Steps:
- [ ] Role-unknown → sign out + `/auth/login?error=account-setup`; `analyst` allowed on admin routes; signed-in users visiting `/auth/*` redirected to their home; no cross-redirect loop.
- [ ] Wire admin Sign Out to `logoutAction`; signup honors email-confirmation (`data.session` null → "check your inbox" state); server-side password min-length in `signupAction`.
- [ ] Update sidebar/nav links to `/admin/analytics`.
- [ ] Verify redirects locally; commit.

### Task 9: Dead code removal

- [ ] Delete `lib/actions/cases.ts`, `lib/actions/upload.ts`, `lib/hooks/use-realtime-cases.ts`, `components/dashboard-sidebar.tsx`, `components/quick-escape-button.tsx`, `lib/supabase.ts` (port the `Database` type only if still referenced), `db/*.sql` (superseded by `supabase/migrations`; keep as `docs/legacy-sql/` or delete).
- [ ] Fix `components/ui/QuickEscape.tsx`: consistent "press Esc twice" copy, also clear `document.title`, use `location.replace('https://www.google.com')` and `history.replaceState` before leaving.
- [ ] Commit.

### Task 10: Broken victim-dashboard chat link

- [ ] Create `app/(victim)/chat/[caseNumber]/page.tsx` — reuses the same chat UI as the homepage widget (extract shared `components/feature/CaseChat.tsx` used by both) so "Open Secure Chat" works; update `app/(victim)/dashboard/page.tsx` link to `/chat/<caseNumber>` and null-guard `case_type`.
- [ ] Commit.

### Task 11: Tests

**Files:**
- Modify: `tests/submit-report.spec.ts`, `tests/ai-chat.spec.ts`, `playwright.config.ts`

- [ ] Rewrite Playwright specs against the real stepper (role-based selectors, step through 1→4), auth-redirect spec (anon `/admin` → login; victim `/admin` → dashboard), analytics-gated spec. Run against local stack.
- [ ] Commit.

### Task 12: Types + build gate

- [ ] Remove `typescript.ignoreBuildErrors` from `next.config.mjs`; fix every remaining `tsc --noEmit` error (font `.variable` usage in `app/layout.tsx` → `next/font` with `variable` option, etc.).
- [ ] `pnpm build` green with type validation ON; commit.

### Task 13: Docs refresh

- [ ] Update `README.md` (accurate setup: supabase CLI, env vars), prune stale claims in `PROJECT_STATUS.md` (remove published admin credentials), note deferred items.
- [ ] Commit.

## Verification (whole-plan)

1. `npx tsc --noEmit` → 0 errors.
2. `pnpm build` (no ignoreBuildErrors) → success.
3. `supabase db reset` → clean; `pnpm dev` against local stack.
4. `npx playwright test` → green.
5. Manual: anonymous report with voice note + photo → confirmation with `SV-` code → visible in admin → caseworker reply → AI stays silent after human takeover.
