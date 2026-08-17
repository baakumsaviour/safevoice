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

### Vercel

Project `olitech1010s-projects/safevoice`
(`prj_CLCBNFhDMTZSARPN3roIWN9blTfT`), hobby plan, production URL
`https://safevoice-olitech1010s-projects.vercel.app`. Linked locally with
`vercel link --project safevoice`; the CLI is already authenticated as
`olitech1010`, so no OAuth is needed for env or deploy work.

**Every production deployment has failed for 48 days.** The last five
production builds are all `Error` at 4–5s. Root cause from the build log:

```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile"
  * 2 dependencies were added: @playwright/test@^1.61.1, dotenv@^17.4.2
```

Vercel CI passes `--frozen-lockfile`, so a stale lockfile fails the build
before Next.js ever runs. **This is now fixed** — `pnpm install
--frozen-lockfile --dry-run` reports "pnpm-lock.yaml is up to date". Any
lockfile-affecting change to `package.json` must be committed together with a
regenerated `pnpm-lock.yaml`, or production breaks again the same way.

Related hazard: **both `package-lock.json` and `pnpm-lock.yaml` are tracked.**
Vercel resolves the ambiguity by choosing pnpm, and `package-lock.json` is
older and stale. Pick one package manager and delete the other lockfile;
otherwise an `npm install` can silently resolve a different dependency tree
than the one that gets deployed.

Env vars set on 2026-08-17 (Production + Preview):

| Var | State |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | repointed to the new project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | repointed to the new `sb_publishable_…` key |
| `ENCRYPTION_KEY` | **added** — was missing entirely, which crashed production outright (`getKey()` throws when `NODE_ENV === 'production'`). Store the value in a password manager: if it is lost, every encrypted row becomes permanently unreadable. |

Still stale on Vercel, all 48 days old and pointing at the dead project:

- `SUPABASE_SERVICE_ROLE_KEY` — **must** be replaced with the new
  `sb_secret_…` key before production can work.
- `AI_GATEWAY_API_KEY` — the burned `vck_…` key that was committed to git.
  Revoke and reissue.
- `NEXT_PUBLIC_ENCRYPTION_KEY` — a pre-takeover leftover with a dangerous name.
  No code references it, so Next.js never inlines it into the client bundle and
  it is inert, but delete it so nobody revives the pattern.
- `OPENROUTER_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWT_SECRET`,
  `POSTGRES_*`, `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` — none are read by
  application code. Legacy Supabase-integration wiring; safe to remove.

`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` **is** used, by the admin analytics map.

Note that `vercel env pull` writes `[SENSITIVE]` in place of real values, so it
is not a usable backup — removing a Vercel env var destroys its value.

Deploy with `vercel deploy` (preview) and `vercel deploy --prod` (production).
A preview built green on 2026-08-17 against the new project: `/`, `/report`,
`/auth/login` and `/auth/signup` all return 200, and `/admin` correctly 307s to
`/auth/login`. **Production was deliberately not promoted** — until
`SUPABASE_SERVICE_ROLE_KEY` is replaced, report submission and chat would fail
at runtime, and a reporting form that silently loses a survivor's report is
worse than an obviously unfinished site.

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
