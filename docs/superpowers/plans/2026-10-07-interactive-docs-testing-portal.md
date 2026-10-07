# Implementation Plan: SafeVoice Interactive Testing & Platform Documentation (`/docs`)

**Spec:** [`docs/superpowers/specs/2026-10-06-interactive-docs-testing-portal-design.md`](file:///Users/user/development/safevoice/docs/superpowers/specs/2026-10-06-interactive-docs-testing-portal-design.md)  
**Date:** 2026-10-07  
**Branch:** main  

---

## Plan Overview
Build the full interactive `/docs` testing page for SafeVoice, enabling examiners, evaluators, and testers to explore the platform, copy credentials, launch auto-prefilled logins, track scenario walkthroughs, and run verification scripts.

---

## Tasks

### Task 1: Add URL Query Parameter Prefill to Login Pages
- Modify [`app/auth/admin-login/page.tsx`](file:///Users/user/development/safevoice/app/auth/admin-login/page.tsx) to read `searchParams.get('email')` and set the initial email state/default value.
- Modify [`app/auth/login/page.tsx`](file:///Users/user/development/safevoice/app/auth/login/page.tsx) to read `searchParams.get('email')` and set the initial email state/default value.

### Task 2: Build Interactive `/docs` Page
- Create directory `app/docs/`
- Create [`app/docs/page.tsx`](file:///Users/user/development/safevoice/app/docs/page.tsx):
  - Header with SafeVoice branding, Quick Escape safety exit, and tab navigation.
  - **Tab 1: Platform Overview & Architecture:** Ghana context, trauma-informed principles, cryptographic audit trail, security architecture.
  - **Tab 2: Accounts & Credentials Switchboard:** Cards for each persona synced with `constants/testers.mjs`, copy email/password with clipboard feedback, direct launch buttons to `/auth/admin-login?email=...` or `/auth/login?email=...`.
  - **Tab 3: Interactive Workflows & Scenarios:** 9 evaluation scenarios with step-by-step checkboxes, completion counter, `localStorage` state persistence, and direct action triggers.
  - **Tab 4: Automated Verification & Issue Reporting:** Copyable CLI command blocks for running test scripts and formatted bug report template.

### Task 3: Footer Integration
- Update [`components/feature/LandingFooter.tsx`](file:///Users/user/development/safevoice/components/feature/LandingFooter.tsx) to include a discreet link to `/docs` ("Documentation & Testing Guide").

### Task 4: Verification & Build Quality Gate
- Run `npm run build` to verify clean SSR compilation of all routes including `/docs`.
- Test admin route protection to ensure `/admin` remains strictly gated and redirects unauthenticated requests.
- Commit changes per `skills/git-ops.md`.
