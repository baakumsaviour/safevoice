# SafeVoice Recovery & Rotation Runbook

## Why this exists

On 2026-08-17 an audit found **live production credentials committed to git** in
`.env.example` (Supabase service-role key, `SUPABASE_JWT_SECRET`, Postgres
password, `SUPABASE_SECRET_KEY`, Vercel AI Gateway key, a Vercel OIDC token).
The repo is private, but every one of those values must be treated as
compromised. The audit also found the Supabase project
`mraqktjekogpucmodghp.supabase.co` **no longer resolves in DNS** — it was
paused (free-tier inactivity) or deleted, so the deployed app has no backend.

## 1. Restore or recreate the Supabase project

Option A — restore: log in at https://supabase.com/dashboard, find the project
(`mraqktjekogpucmodghp`), and restore/unpause it if offered.

Option B — recreate (recommended, since keys must rotate anyway):
1. Create a new Supabase project (region close to Ghana, e.g. `eu-west-2`).
2. **Auth → Providers → enable "Anonymous sign-ins"** (required: anonymous
   reporters get real sessions so RLS and Realtime work).
3. Auth → disable email confirmations, or keep them and accept the
   "check your inbox" signup flow (the app supports both).
4. Link and push the schema:
   ```bash
   supabase link --project-ref <new-ref>
   supabase db push          # applies supabase/migrations/*
   ```
5. Create the storage bucket is handled by the migration; verify in Storage UI
   that `evidence` exists and is private.
6. Create staff accounts: Auth → Add user (email+password) for each admin /
   caseworker, then insert matching rows:
   ```sql
   insert into public.users (id, email, full_name, role)
   values ('<auth-user-uuid>', 'admin@yourdomain', 'Admin Name', 'admin');
   ```

## 2. Rotate every secret

| Secret | Where | Action |
|---|---|---|
| Service-role key, anon key, JWT secret | Supabase → Settings → API | New project = new keys. If restoring the old project, use "JWT secret rotation" and regenerate keys. |
| Postgres password | Supabase → Settings → Database | Reset password. |
| AI Gateway key (`vck_...`) | Vercel dashboard → AI Gateway | Revoke and create a new key. |
| `ENCRYPTION_KEY` | You generate: `openssl rand -base64 32` | New value; note that changing it later makes previously encrypted rows unreadable (they'll render as `[unreadable]`). |

## 3. Configure environments

Local: copy `.env.example` → `.env.local`, or use the local stack
(`supabase start` prints local keys). Delete the old `.env` file after
migrating values you still need.

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
