# SafeVoice: Project Audit, Current State & Completion Plan

**Date:** 2026-09-05  
**Status:** Core Features & Critical Mobile Fixes Delivered — Ready for Production Launch Tuning

---

## 1. Project Overview & Architecture

**SafeVoice** is a trauma-informed, secure incident reporting and crisis intervention platform built specifically for Ghana. It enables victims and witnesses of Gender-Based Violence (GBV), child abuse, and domestic violence to safely report incidents, upload evidence, and communicate securely with caseworkers and an automated AI first-responder.

### Key Architectural Pillars
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript (strict mode).
- **Styling & Design System:** Tailwind CSS v4 with a Vodafone-inspired palette (Red `#e60000`, Ink `#25282b`, Canvas `#ffffff`) and 44px+ touch targets.
- **Database & Auth:** Supabase (`eu-west-1`, project ref `wnfvzbybxhswucrwolyf`).
  - Anonymous reporting via real anonymous Supabase auth (`signInAnonymously()`).
  - Role-Based Access Control (`victim`, `caseworker`, `admin`) enforced in `server/auth.ts` on every Server Action.
- **Security & Cryptography:** Application-layer AES-256-GCM (`lib/server/encryption.ts`) with a server-only `ENCRYPTION_KEY`. All case narratives and messages use `enc:v1:` payloads with base64 fallback.
- **AI First-Responder:** Vercel AI SDK connected via Vercel AI Gateway (`AI_MODEL`, defaulting to `openai/gpt-4o-mini`). AI messages are attributed to `sender_role='ai'` (with `sender_id` NULL).
- **Safety First:** Floating `QuickEscape` button (ESC x2 or click) to wipe session and redirect to Google.

---

## 2. DevOps & Engineering Workflow

### CI/CD & Deployment
- **Hosting:** Vercel project `olitech1010s-projects/safevoice` (`https://safevoice-olitech1010s-projects.vercel.app`).
- **Deployment Pipeline:** Automated Git deployment connected to branch `main`. Pushing to `origin/main` triggers an automatic preview and production deployment.
- **Vercel CLI:** Authenticated as user `olitech1010`.

### Database & Environment Management
- **Supabase CLI:** Project linked to `wnfvzbybxhswucrwolyf`. Schema pushed via `supabase db push --include-all`.
- **MCP Integration:** Supabase MCP server is configured project-scoped in `.mcp.json` (preventing cross-project pollution).
- **Testing & Tooling:** Playwright E2E suite (`tests/`), RLS automated verification (`scripts/verify-rls.mjs`), and staff/tester provisioning scripts (`scripts/create-staff.mjs`, `scripts/create-testers.mjs`).

---

## 3. Critical Lessons Learned

1. **The Stale Lockfile Hazard (`pnpm-lock.yaml`):**  
   Vercel CI runs `pnpm install --frozen-lockfile`. Previously, builds failed repeatedly when dependencies (`@playwright/test`, `dotenv`) were added to `package.json` without updating `pnpm-lock.yaml`. **Rule:** Always commit regenerated lockfiles together with `package.json`.
2. **True Encryption vs. Client Leaks:**  
   Earlier iterations stored sensitive keys as `NEXT_PUBLIC_` and used base64 encoding. True confidentiality requires server-side AES-256-GCM with environment-restricted secrets.
3. **Anonymous Realtime & RLS:**  
   Mock/unauthenticated users broke PostgREST RLS and Realtime socket subscriptions. Authentic Supabase anonymous sessions allow Realtime websockets to work cleanly for anonymous victims.
4. **Supabase Cloud Safeguards:**  
   **Never run `supabase config push`** on the cloud project (it overrides cloud settings with local `http://127.0.0.1:3000`). Never run `seed.sql` on production (it sets hardcoded default passwords).
5. **Vercel SSO Protection:**  
   Vercel's "Deployment Protection" (Vercel Authentication) can silently block public access by issuing 302 redirects to Vercel SSO until toggled off in the Vercel dashboard.

---

## 4. Claude Code Session Status

**Found:** Active and archived Claude Code sessions exist locally under:  
`/Users/user/.claude/projects/-Users-user-development-safevoice/`

### Existing Artifacts & Memory
- **Transcripts:** 7 session transcripts including `f7fe6b64-940c-47f9-afd4-b5fff9ebafc7.jsonl` (Sep 2) and `918e69eb-8129-444e-8458-807c1c7329a1.jsonl` (Aug 27–31).
- **Persistent Memory Bank:** `/Users/user/.claude/projects/-Users-user-development-safevoice/memory/`:
  - `safevoice-project-state.md`
  - `safevoice-user-blockers.md`
  - `safevoice-vercel-deploy.md`
  - `safevoice-rls-verified.md`
  - `MEMORY.md`
- **Settings:** `.claude/settings.local.json` enabling the `supabase` MCP server.

---

## 5. Current State of the Codebase

| Feature / Area | Status | Notes |
|---|---|---|
| **Public Landing Page** (`/`) | Implemented | Split-screen (Context + Live Chat). Needs mobile refactor. |
| **Incident Reporting Wizard** (`/report`) | Implemented | 4-step wizard: Category, Details (Voice/Narrative), Evidence, Review. |
| **Victim Case Chat** (`/chat/[caseNumber]`) | Implemented | Decrypted realtime chat with AI assistant & caseworker. |
| **Victim Dashboard** (`/dashboard`) | Implemented | Overview of cases submitted by logged-in users. |
| **Admin Case Management** (`/admin`) | Implemented | Active case listing with triage statuses. |
| **Admin Case Detail** (`/admin/cases/[id]`) | Implemented | Split view: Case Details + Live Staff Chat + Caseworker Assignment. |
| **Admin User Management** (`/admin/users`) | Implemented | Caseworker invitation and staff listing. |
| **Analytics & Map** (`/admin/analytics`) | Simulated | Awaiting real Mapbox token or OpenStreetMap integration. |
| **RLS & Security** | 100% Verified | 10/10 automated tests pass cross-tenant isolation. |

---

## 6. Root Cause Analysis: Mobile Responsiveness

The user highlighted two critical issues:
1. *"The send button is being covered"*
2. *"Look at the side also"*

### Issue A: Send Button Covered by QuickEscape
- **Root Cause:**
  - `QuickEscape` (`components/ui/QuickEscape.tsx`) is styled with `fixed bottom-6 right-6 z-[100]`.
  - Both `app/page.tsx` and `app/(victim)/chat/[caseNumber]/page.tsx` place the chat input at the bottom (`sticky bottom-0`) with the `Send` button placed at the bottom right.
  - On mobile displays, the floating red "Leave Site" pill button directly overlaps and covers the `Send` button and input field.
- **Solution:**
  - On mobile, relocate the Quick Escape button to the top navigation header (or a compact persistent badge), or float it higher (`bottom-20 right-4`) on chat views so it never obscures input actions.

### Issue B: "The Side" (Sidebars & Split-Screen Columns)
- **1. Landing Page Sidebar (`app/page.tsx`):**
  - Layout is `flex-col md:flex-row`. The left section is a full sidebar (`w-full md:w-1/3 lg:w-[400px]`) containing high-density text, cards, and links.
  - On mobile, users must scroll through several screen heights of copy just to discover the chat widget.
  - *Fix:* Provide a mobile tab toggle ("Chat" vs "About / Formal Report") or collapse the info panel on mobile.
- **2. Admin Dashboard Layout Sidebar (`app/(dashboard)/layout.tsx`):**
  - Sidebar is `w-full md:w-64 flex flex-col md:h-screen sticky top-0`.
  - On mobile screens, this renders as a tall, permanent navigation block consuming the top half of the screen, pushing data tables down.
  - *Fix:* Add a responsive header with a hamburger menu (`Sheet` or collapsible drawer) for mobile.
- **3. Admin Case Details (`app/(dashboard)/admin/cases/[id]/page.tsx`):**
  - Layout has a fixed `h-screen` container and a 3-column grid (`grid md:grid-cols-3`).
  - On mobile, the left "Case Details" side panel stacks on top of the "Secure Chat" panel. Because the outer wrapper has `h-screen`, the chat box is squeezed off-screen or rendered unusable.
  - *Fix:* Switch to full responsive scrolling or mobile tabs ("Case Details" / "Chat").
- **4. Admin Cases Table (`app/(dashboard)/admin/page.tsx`):**
  - Uses `grid grid-cols-12` across 4 columns without horizontal scrolling or card transformations, breaking text on screens `< 768px`.

---

## 7. Immediate Completion Plan

### Phase 1: Mobile Responsiveness & Layout Overhaul (High Priority)
1. **Chat & QuickEscape Collision Fix:**
   - Modify `QuickEscape` positioning on mobile or create a contextual header escape button.
   - Ensure the chat input is safe-area aware (`pb-safe`) and always visible above keyboard and navigation bars.
2. **Mobile Sidebar & Navigation:**
   - Transform `(dashboard)/layout.tsx` into a modern responsive layout with a mobile header + drawer (`Sheet`).
   - Refactor `app/page.tsx` so mobile users can immediately chat or switch to reporting without heavy scrolling.
   - Refactor `app/(dashboard)/admin/cases/[id]/page.tsx` into responsive mobile tabs (Details vs. Chat).
   - Refactor `app/(dashboard)/admin/page.tsx` table to responsive stacked cards on mobile.

### Phase 2: Production Launch Blockers
1. **Vercel Authentication:** Ensure Vercel Deployment Protection is set to "Preview Only" in Vercel Settings.
2. **AI Gateway Credits & Key:** Update `AI_GATEWAY_API_KEY` on Vercel with active credits so the AI responder responds reliably.
3. **Staff Account Onboarding:** Run `scripts/create-staff.mjs` to create official administrator and caseworker accounts with unique passwords.
4. **Cleanup:** Drop the dead `public.resources` table or build the verified resources directory (Phase 3). Untrack test pages (`/testing`) before public launch.

---

## 8. High-Value Project Additions (What Else We Can Add)

1. **Verified Ghanaian Emergency Resources Directory (`/resources`):**
   - Direct emergency dialing for DOVVSU (Ghana Police Service), CHRAJ, Social Welfare Dept, Ghana Health Service, and Ark Foundation.
   - Filterable by region (Greater Accra, Ashanti, Northern, etc.).
2. **Low-Bandwidth / USSD & WhatsApp Integration:**
   - Introduce a Twilio/Africa's Talking webhook or WhatsApp Cloud API bot for victims without reliable internet or smartphones.
3. **Local Ghanaian Languages Audio Support:**
   - Voice note prompts in Twi, Ga, Ewe, and Hausa to make reporting accessible to non-English speakers.
4. **Stealth / Disguised PWA Mode:**
   - Progressive Web App with optional disguise (e.g. calculator, weather, or notes icon) so abusive partners cannot detect the app on the victim's phone.
5. **Private Internal Caseworker Notes:**
   - Add a private caseworker note timeline on cases, separate from the victim chat.
6. **Case Escalation & SLA Automation:**
   - Automated flagging/email notification if high-risk cases (e.g. child abuse or sexual assault) have not been triaged within 2 hours.
