# SafeVoice Interactive Testing & Platform Documentation Portal (`/docs`) — Design Specification

**Document Path:** `docs/superpowers/specs/2026-10-06-interactive-docs-testing-portal-design.md`  
**Status:** Approved by User  
**Author:** Antigravity Pairing Assistant  
**Date:** 2026-10-06  
**Target Route:** `/docs`  

---

## 1. Executive Summary & Purpose

SafeVoice is a trauma-informed digital public infrastructure platform built for survivors of domestic violence and gender-based abuse in Ghana. To facilitate evaluation, thesis defense, user acceptance testing (UAT), and stakeholder onboarding, this specification designs an **All-in-One Interactive Platform Documentation & Testing Sandbox** located at the URL `/docs`.

The `/docs` page enables university evaluators, DOVVSU officers, peer testers, and developers to:
1. Understand the core mission, threat model, trauma-informed design choices, and cryptographic foundations of SafeVoice.
2. View and copy shared test account credentials (administrators, caseworkers, analysts, authenticated survivors, and anonymous reporters) with one-click clipboard copying.
3. Launch direct authentication shortcuts to `/auth/admin-login` and `/auth/login` with prefilled email parameters.
4. Execute 9 guided evaluation scenarios step-by-step with interactive completion checkboxes stored in browser `localStorage`.
5. Run automated verification scripts (`verify-stealth`, `verify-rls`, Playwright end-to-end tests) and file structured bug reports using a standardized template.

---

## 2. Security & Route Isolation Verification

### 2.1 Admin Route Protection
A core requirement verified during design is that **unauthenticated visitors and unauthorized roles cannot access admin cases or dashboard pages without logging in**:
- **Middleware Guard ([`lib/supabase/middleware.ts`](file:///Users/user/development/safevoice/lib/supabase/middleware.ts)):**
  - Intercepts all paths starting with `/admin`. If no active Supabase session is present, it issues an immediate HTTP redirect to `/auth/admin-login`.
  - If a user is logged in with a non-staff role (e.g. `role: 'victim'`), they are redirected to `/auth/admin-login?error=unauthorized`.
- **Server Layout Barrier ([`app/(dashboard)/layout.tsx`](file:///Users/user/development/safevoice/app/(dashboard)/layout.tsx)):**
  - Executes server-side `getSessionUser()`. If the user is unauthenticated or has a role outside `['admin', 'caseworker', 'analyst']`, it throws an unconditional server redirect to `/auth/admin-login`.
- **Docs Safety:** The `/docs` page itself is an informational and interactive test launcher. It does not display live survivor cases or bypass database Row-Level Security (RLS). All actual data operations respect existing Supabase RLS policies.

---

## 3. Architecture & User Interface Design

### 3.1 Route & File Structure
- **Page Component:** [`app/docs/page.tsx`](file:///Users/user/development/safevoice/app/docs/page.tsx)
- **Shared Constants:** Imports test account roster from [`constants/testers.mjs`](file:///Users/user/development/safevoice/constants/testers.mjs) (`TESTER_ACCOUNTS`, `TESTER_PASSWORD`) to ensure zero drift between database seed scripts and documentation.
- **Client Components & Utilities:**
  - `DocsClientLayout`: Interactive tab navigation (`overview`, `accounts`, `workflows`, `verification`).
  - `CredentialCard`: Card component with one-click copy and auto-fill launcher.
  - `ScenarioWorkflowCard`: Interactive accordion card with steps, checklist progress, and local storage state.
  - `VerificationConsole`: CLI command snippet runner with copyable terminal blocks.

### 3.2 Visual & Design System Conformance
The `/docs` page adheres strictly to the SafeVoice Design System:
- **Backgrounds:** Canvas (`#FAFAF8`), Canvas Soft (`#F3F4F1`).
- **Typography:** Display (`display-sm`), Headings (`body-lg-strong`), Body (`body-md`, `body-sm`), Monospace for credentials and codes.
- **Brand Colors:** SafeVoice Primary Teal (`#006B5E`), Ink (`#1E2522`), Accent Amber / Red for warnings, Muted grays for borders.
- **Safety Header:** Includes quick-return navigation and the emergency "Quick Escape" exit button.

---

## 4. Feature Specifications

### 4.1 Tab 1: Platform Overview & Architecture
- **Academic Context:** University of Ghana, College of Basic and Applied Sciences (CBAS) Computer Science Final-Year Thesis.
- **Ghanaian Legal Framework:** Alignment with Domestic Violence Act, 2007 (Act 732) and DOVVSU operational guidelines.
- **Trauma-Informed Principles:**
  - Zero-friction anonymous reporting (no sign-up gate).
  - Quick Escape mechanism (instant redirectional flush and history clearing).
  - Camouflaged stealth mode (disguised interface with secret PIN).
- **Security & Cryptography Overview:**
  - Cryptographic case IDs (`SV-XXXX-XXXX`) derived via HMAC.
  - Multi-tenant data isolation via PostgreSQL Row-Level Security (RLS).
  - AES-256-GCM encryption for stored evidence and narratives.

### 4.2 Tab 2: Interactive Accounts & Login Credentials Switchboard
Displays the complete testing account roster with role categorization:

| Role | Email | Password | Primary Target | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Anonymous Citizen** | *None* | *None* | `/report` or `/` | Fully anonymous reporting; no persistent identity trail. |
| **Survivor 1** | `survivor1@safevoice.test` | `00000000` | `/auth/login` | Tracks own cases in `/dashboard`; chats 2-way with caseworkers. |
| **Survivor 2–4** | `survivor2@safevoice.test` | `00000000` | `/auth/login` | Multi-tenant test accounts to verify cross-account data isolation. |
| **Caseworker 1–3** | `caseworker1@safevoice.test` | `00000000` | `/auth/admin-login` | Staff portal triage; manages assigned cases. |
| **Admin 1–2** | `admin1@safevoice.test` | `00000000` | `/auth/admin-login` | Full DOVVSU supervisor access: all cases, assignments, users. |
| **Data Analyst 1** | `analyst1@safevoice.test` | `00000000` | `/auth/admin-login` | Read-only analytics access: regional heatmaps and case metrics. |

**Interactive Behaviors:**
1. **One-Click Copy:** Copies email or password to clipboard with a 2-second checkmark feedback.
2. **Launch Portal Button:**
   - Navigates to `/auth/admin-login?email=<email>` or `/auth/login?email=<email>`.
   - The login forms on both pages are enhanced to read the `?email=` search param and initialize the email input automatically.
3. **Role Filter:** Filter cards by `All`, `Staff Portal`, `Survivors`, or `Anonymous`.

### 4.3 Tab 3: Interactive Workflows & Scenario Walkthroughs
Nine guided scenarios with interactive checkboxes that persist to browser `localStorage`:

1. **Scenario 1: Anonymous Reporting (Zero Trace)** — Wizard navigation, incident categorization, narrative validation, evidence upload limit test (<8MB), receipt of tracking code `SV-XXXX-XXXX`.
2. **Scenario 2: First-Contact AI Triage Assistant** — Landing page chat widget, empathetic triage, case opening without credentials.
3. **Scenario 3: Quick Escape & Stealth Protection** — Emergency exit button and double-Escape keypress verification.
4. **Scenario 4: Authenticated Survivor Multi-Tenant Isolation** — Verifying survivor1 cannot view survivor2's cases.
5. **Scenario 5: Staff Case Triaging & Two-Way Secure Chat** — Admin triage, narrative inspection, responding in thread, checking survivor view.
6. **Scenario 6: Caseworker Delegation & Scoping** — Admin assigning case to Caseworker 1, status changing to `in_progress`, testing scoping against Caseworker 2.
7. **Scenario 7: Geospatial Analytics & Incident Heatmap** — Inspecting Mapbox visualization and aggregated metrics at `/admin/analytics`.
8. **Scenario 8: RBAC & Perimeter Resistance (Penetration Test)** — Testing unauthenticated and unauthorized access directly to `/admin`, verifying error redirects.
9. **Scenario 9: Mobile Usability & Keyboard Accessibility** — Narrow viewport check, keyboard tab order, focus ring contrast.

**Checklist UI:**
- Top progress tracker showing completed scenario count and percentage.
- Reset progress button to clear `localStorage` checklist cache.

### 4.4 Tab 4: Automated Verification & Bug Reporting
- **CLI Verification Commands:**
  - `node scripts/create-testers.mjs`
  - `node scripts/verify-rls.mjs`
  - `node scripts/verify-stealth.mjs`
  - `npx playwright test`
- **Standardized Issue Reporting Template:**
  - Formatted markdown block with one-click copy for reporting bugs to developers.

### 4.5 Navigation Integration
- Add a discreet link in [`LandingFooter.tsx`](file:///Users/user/development/safevoice/components/feature/LandingFooter.tsx):
  `"Platform Documentation & Testing Guide"` pointing to `/docs`, placed cleanly alongside *"Staff & Officer Portal"*.

---

## 5. Implementation Boundaries & Acceptance Criteria
1. The `/docs` route compiles without errors and passes Next.js SSR / client hydration checks.
2. Email query parameters on `/auth/login?email=...` and `/auth/admin-login?email=...` successfully pre-fill the form.
3. Direct unauthenticated visits to `/admin` continue to redirect to `/auth/admin-login` with zero case data leakage.
4. All interactive elements (copy buttons, tab navigation, scenario checkboxes) operate smoothly with zero external dependencies.
5. All Dev-OS standards and coding standards are maintained.
