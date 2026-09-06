# SafeVoice Deployment Plan (Vercel & Supabase)

> **Prepared by the DevOps Agent**  
> **Updated:** 2026-09-06  
> **Target:** Vercel Production (`https://safevoice-olitech1010s-projects.vercel.app`) & Supabase (`wnfvzbybxhswucrwolyf`)

---

## 1. Environment Variables Audit

All required variables for production must be present in Vercel Project Settings (Production & Preview):

| Variable | Scope | Status | Purpose |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Client | ✅ Configured | Supabase project URL (`eu-west-1`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Client | ✅ Configured | Client anon key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Only | ✅ Configured | Admin service role key (`sb_secret_...`) |
| `ENCRYPTION_KEY` | Server Only | ✅ Configured | 32-byte AES-256-GCM secret for narratives & messages |
| `OPENROUTER_API_KEY` | Server Only | ⚠️ Check Vercel | API key for OpenRouter AI responder |
| `OPENROUTER_MODEL` | Server Only | ⚠️ Check Vercel | Set to `openrouter/free` |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Public / Client | ✅ Configured | Mapbox GL token for analytics map |

*Note: `NEXT_PUBLIC_ENCRYPTION_KEY` is deprecated and must remain removed to prevent client-side credential leakage.*

---

## 2. Pre-Deployment Verification Checklist

- [x] **TypeScript Strict Check:** Passed with 0 errors (`npx tsc --noEmit`).
- [x] **Production Build:** Passed with 100% Turbopack compile (`pnpm build`).
- [x] **Lockfile Consistency:** `pnpm-lock.yaml` regenerated and synchronized with `package.json` for Vercel `--frozen-lockfile`.
- [x] **Database & RLS:** Supabase schema and RLS policies verified on project `wnfvzbybxhswucrwolyf`. Anonymous authentication enabled.
- [x] **AI Integration:** OpenRouter meta-router (`openrouter/free`) with multi-model automatic failover and guaranteed trauma-informed reassurance fallback.
- [x] **Voice Reporting:** Audio WebMedia recording with optional narrative text validation verified on client and server.
- [x] **Interactive Map:** Live Mapbox GL Ghana regional geocoded map verified on `/admin/analytics`.
- [x] **Mobile Responsiveness:** QuickEscape repositioned to prevent overlap; report button rows stack responsively with safe-area bottom padding.
- [x] **Homepage Redesign:** Full landing page with sticky navbar, emergency hotlines, voice showcase, case tracking modal, and floating expandable AI chat widget.

---

## 3. Deployment Pipeline & Execution

1. Commits are made following Conventional Commits (`git-ops.md`).
2. Pushing to `origin/main` automatically triggers Vercel CI.
3. Vercel runs `pnpm install --frozen-lockfile` followed by `pnpm build`.
4. Production release goes live automatically.
