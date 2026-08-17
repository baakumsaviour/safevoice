# SafeVoice Recovery & Rotation Runbook

## Why this exists

On 2026-08-17 an audit found **live production credentials committed to git** in
`.env.example` (Supabase service-role key, `SUPABASE_JWT_SECRET`, Postgres
password, `SUPABASE_SECRET_KEY`, Vercel AI Gateway key, a Vercel OIDC token).
The repo is private, but every one of those values must be treated as
compromised. The audit also found the Supabase project
`mraqktjekogpucmodghp.supabase.co` **no longer resolves in DNS** — it was
paused (free-tier inactivity) or deleted, so the deployed app has no backend.

## 1. The replacement Supabase project

The dead project was replaced on 2026-08-17 by **`wnfvzbybxhswucrwolyf`**
(`https://wnfvzbybxhswucrwolyf.supabase.co`), which uses the new API-key
scheme: a publishable key (`sb_publishable_…`, safe for the browser, goes in
`NEXT_PUBLIC_SUPABASE_ANON_KEY`) and a secret key (`sb_secret_…`, server-only,
goes in `SUPABASE_SERVICE_ROLE_KEY`).

Project `Safevoice`, org `fkitnuhqwsosyfozdnuy`, region `eu-west-1`,
Postgres 17.6, `ACTIVE_HEALTHY`.

### Done (2026-08-17)

- **Schema applied.** `supabase link --project-ref wnfvzbybxhswucrwolyf` +
  `supabase db push --include-all` applied `20260817000000_init.sql`. All seven
  tables (`users`, `cases`, `case_messages`, `case_notes`, `evidence`,
  `audit_log`, `resources`) return 200 through PostgREST. The migration is
  idempotent (`IF NOT EXISTS` / `DROP POLICY IF EXISTS`), so re-running is safe.
- **Anonymous sign-ins enabled**, via
  `PATCH /v1/projects/{ref}/config/auth {"external_anonymous_users_enabled": true}`.
  Verified with a live `POST /auth/v1/signup` returning `is_anonymous: true`.
- **`evidence` bucket exists and is private.** Confirmed with
  `supabase storage ls --linked --experimental`. Reading its metadata as a
  non-service-role user correctly returns 404 — that is the private-bucket
  behaviour, not a fault.
- **RLS spot-checked.** An anonymous session selecting `cases`, `users`,
  `audit_log` and `resources` gets empty result sets rather than errors or
  other users' rows.

Do **not** run `supabase config push` against this project: `config.toml` is
the local-dev config and would overwrite the production `site_url` with
`http://127.0.0.1:3000`. There is no per-key flag, so make cloud auth changes
through the Management API instead.

Do **not** run `supabase/seed.sql` against this project either — it is marked
local-only and creates `admin@safevoice.local` / `worker@safevoice.local` with
the published password `password123`.

### Remaining

1. Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` to the project's
   `sb_secret_…` key (Project Settings → API Keys → Secret keys). The report,
   chat, storage, auth and admin server actions all construct the admin client,
   so the app cannot function without it.
2. Create real staff accounts (Auth → Add user, strong unique passwords — never
   the seed credentials), then insert matching rows:
   ```sql
   insert into public.users (id, email, full_name, role)
   values ('<auth-user-uuid>', 'admin@yourdomain', 'Admin Name', 'admin');
   ```
3. Seed `public.resources` with real Ghanaian helplines and support services —
   no migration or seed file populates it, so the resources page ships empty.
4. Decide on email confirmations (Auth → keep them and accept the "check your
   inbox" signup flow, or disable them; the app supports both).
5. Delete the throwaway anonymous users created while verifying the anonymous
   flow.

The Supabase MCP server is wired into this repo at project scope in
`.mcp.json`, pinned to `project_ref=wnfvzbybxhswucrwolyf`, so agent access
never reaches other projects in the account.

## 2. Rotate every secret

| Secret | Where | Action |
|---|---|---|
| Service-role key, anon key, JWT secret | Supabase → Settings → API | New project = new keys. If restoring the old project, use "JWT secret rotation" and regenerate keys. |
| Postgres password | Supabase → Settings → Database | Reset password. |
| AI Gateway key (`vck_...`) | Vercel dashboard → AI Gateway | Revoke and create a new key. |
| `ENCRYPTION_KEY` | You generate: `openssl rand -base64 32` | New value; note that changing it later makes previously encrypted rows unreadable (they'll render as `[unreadable]`). |

## 3. Configure environments

Local: `.env.local` now points at the cloud project
`wnfvzbybxhswucrwolyf`. To develop against the Docker stack instead
(`supabase start`, which prints its own local keys), restore the saved copy at
`.env.local.localstack.bak`. Note the tradeoff: while `.env.local` points at
the cloud project, local dev reads and writes real cloud data.

`NEXT_PUBLIC_SUPABASE_ANON_KEY` holds the `sb_publishable_…` key and
`SUPABASE_SERVICE_ROLE_KEY` holds the `sb_secret_…` key. The env var names kept
the old wording so no code changes were needed; `@supabase/supabase-js` v2.107
accepts either key scheme.

Vercel (production): Project → Settings → Environment Variables, set:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `ENCRYPTION_KEY`, `AI_GATEWAY_API_KEY`,
`AI_MODEL` (optional, defaults to `openai/gpt-4o-mini`). Redeploy.

## 4. (Optional) purge secrets from git history

The private repo's history still contains the old `.env.example`. After
rotating, this is low-risk, but to purge:

```bash
brew install git-filter-repo
git filter-repo --path .env.example --invert-paths --force
git push origin --force --all
```

Warning: rewrites history; coordinate with anyone who has clones.

## 5. Data-safety invariants to preserve

- Anonymous sign-ins stay enabled.
- Never add a `NEXT_PUBLIC_` prefix to `ENCRYPTION_KEY` or the service key.
- Realtime publication must include `case_messages` and `cases` (the
  migration does this; never run a `DROP PUBLICATION supabase_realtime`).
