# SafeVoice Stealth Mode & Camouflage Skin (PWA) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a trauma-informed Stealth Mode & Camouflage Skin that transforms SafeVoice into an authentic, functioning Calculator ("QuickCalc") in under 10ms, camouflages PWA and tab metadata, securely stashes active drafts in-memory via AES-GCM (Zero-DOM-Leak), and supports PIN unmasking (`1984 =`) and panic wiping (`0000 =`).

**Architecture:** Client-side React context (`StealthProvider`) managing disguise state, tab spoofing (`document.title`, neutral favicon, `window.history`), in-memory Web Crypto encryption (`draftVault.ts`), genuine arithmetic engine (`CalculatorDisguise.tsx`), discreet trigger button (`StealthButton.tsx`), updated `QuickEscape.tsx`, and PWA manifest camouflage (`manifest.json` + `next.config.mjs`).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Web Crypto API (`AES-GCM`), `@ducanh2912/next-pwa`.

---

## Global Constraints & Trauma Guidelines

1. **Sub-10ms Latency**: Transition into disguise must be client-side and immediate (zero network requests, no loading spinners, no visible flash of unstyled content).
2. **Zero-DOM-Leakage**: When camouflaged, sensitive report text, victim contact information, and voice recordings must be removed from the DOM tree.
3. **Authentic Calculations**: The calculator must actually perform accurate arithmetic (e.g. `12.5 × 4 = 50`) to pass scrutiny if an abuser tests the screen.
4. **Panic Protocol**: Entering `0000 =` must immediately wipe all in-memory drafts, local session caches, and reset the calculator to `0`.
5. **Offline Ready**: Both the calculator shell and reporting core must function with zero active internet connection.
6. **Commit after every task**: Follow `skills/git-ops.md` with conventional commit messages.

---

### Task 1: In-Memory Ephemeral Draft Vault (`lib/client/draftVault.ts`)

**Files:**
- Create: `lib/client/draftVault.ts`

**Steps:**
- [ ] Create `draftVault.ts` with Web Crypto `AES-GCM` encryption/decryption.
- [ ] Store transient symmetric CryptoKey in-memory (never written to `localStorage` or `sessionStorage`).
- [ ] Implement `stashDraft(data: Record<string, any>): Promise<void>`:
  - Generates 256-bit AES-GCM key + 12-byte random IV.
  - Encrypts JSON serialized payload into ciphertext buffer.
  - Sets a 15-minute auto-purge timer (`setTimeout`) that zeros the key and ciphertext if unmasking does not occur.
- [ ] Implement `restoreDraft(): Promise<Record<string, any> | null>`:
  - Decrypts ciphertext buffer with in-memory key.
  - Clears the timer and resets the vault.
- [ ] Implement `purgeDraft(): void`:
  - Immediately wipes key and ciphertext.
- [ ] Verify functionality via a standalone unit test script; commit.

---

### Task 2: Authentic Interactive Calculator Disguise (`components/stealth/CalculatorDisguise.tsx`)

**Files:**
- Create: `components/stealth/CalculatorDisguise.tsx`

**Steps:**
- [ ] Build `CalculatorDisguise` with a clean dark-slate theme (`bg-slate-950 text-white font-mono`):
  - Header: Discreet title `"Calculator"` with covert long-press detector (3-second press triggers PIN dialog).
  - LCD Readout: Sub-display for expression history, primary display for current operand or calculation result.
  - Keypad: 4x5 grid for `C`, `±`, `%`, `÷`, `7`, `8`, `9`, `×`, `4`, `5`, `6`, `-`, `1`, `2`, `3`, `+`, `0`, `.`, `=`.
- [ ] Implement authentic arithmetic engine:
  - Supports chained calculations, floating-point math, divide-by-zero protection (`"Error"`).
  - Listens for physical keyboard events (`0-9`, `+`, `-`, `*`, `/`, `Enter`, `Backspace`, `Escape`).
- [ ] Implement Secret Code Listeners:
  - Unmask PIN (`1984 =` by default): triggers `onUnlock()` callback.
  - Panic Wipe Code (`0000 =`): triggers `onPanicWipe()` callback, clearing all stashes and resetting display to `0`.
- [ ] Test arithmetic and unmask triggers; commit.

---

### Task 3: Stealth Context & Global Provider (`components/stealth/StealthContext.tsx`)

**Files:**
- Create: `components/stealth/StealthContext.tsx`
- Create: `public/icons/calc.svg`

**Steps:**
- [ ] Create neutral calculator SVG icon at `public/icons/calc.svg`.
- [ ] Build `StealthContext` and `StealthProvider`:
  - State: `isCamouflaged` (boolean), `unlockPin` (string, default `"1984"`), `alwaysCamouflageOnLaunch` (boolean).
  - Tab Spoofing:
    - When `isCamouflaged = true`:
      - Saves current `document.title` and favicon href.
      - Sets `document.title = "QuickCalc - Calculator"`.
      - Replaces favicon `<link rel="icon">` with `/icons/calc.svg`.
      - Replaces URL display with `/` via `window.history.replaceState`.
    - When `isCamouflaged = false`:
      - Restores original title and favicon.
  - Integrates `CalculatorDisguise` as an absolute overlay covering the viewport (`fixed inset-0 z-[9999]`) when `isCamouflaged = true`.
  - Wire `onUnlock` to decrypt and restore stashed drafts.
  - Wire `onPanicWipe` to purge drafts, clear `sessionStorage`, and purge cached sessions.
- [ ] Mount `StealthProvider` inside `app/layout.tsx`.
- [ ] Verify tab spoofing and unlock round-trip; commit.

---

### Task 4: Discreet Stealth Trigger Button (`components/stealth/StealthButton.tsx`)

**Files:**
- Create: `components/stealth/StealthButton.tsx`
- Modify: `components/landing/LandingNavbar.tsx`
- Modify: `components/landing/LandingFooter.tsx`

**Steps:**
- [ ] Build `StealthButton`:
  - Renders a discreet eye-slash / shield icon with tooltip `"Camouflage (Quick Disguise)"`.
  - Tapping immediately activates camouflage mode (`activateStealth()`).
  - Accessible via keyboard focus and 44px+ touch target.
- [ ] Add `StealthButton` to `LandingNavbar.tsx` alongside the hotline and tracker buttons.
- [ ] Add `StealthButton` to `LandingFooter.tsx` in the safety actions band.
- [ ] Verify visual integration across desktop and mobile; commit.

---

### Task 5: Enhanced Quick Escape & Report Form Integration

**Files:**
- Modify: `components/ui/QuickEscape.tsx`
- Modify: `components/feature/ReportForm.tsx`

**Steps:**
- [ ] Update `components/ui/QuickEscape.tsx`:
  - Double-tap `Esc` triggers immediate Calculator Camouflage with draft stashing.
  - Clicking the "Leave Site" button presents a quick 2-option sheet on mobile/desktop:
    1. *"Camouflage to Calculator"* (discreet, preserves draft in memory).
    2. *"Exit to Google"* (external redirect, clears session).
- [ ] Integrate with `ReportForm.tsx`:
  - Register draft state serializer with `StealthContext` so in-progress category, narrative, date, and voice audio notes are encrypted into `draftVault` before unmounting.
  - Automatically repopulate form fields when unmasked with PIN.
- [ ] Verify draft preservation and restoration; commit.

---

### Task 6: PWA Camouflage Manifest & Next.js Configuration

**Files:**
- Create: `public/manifest.json`
- Create: `public/icons/calc-192.png` & `public/icons/calc-512.png`
- Modify: `next.config.mjs`
- Modify: `app/layout.tsx`

**Steps:**
- [ ] Generate neutral arithmetic PWA icons (192x192 and 512x512) in `public/icons/`.
- [ ] Create `public/manifest.json`:
  - App Name: `"QuickCalc Utility"`.
  - Short Name: `"Calculator"`.
  - Display: `"standalone"`.
  - Theme Color: `"#1e293b"`.
  - Background Color: `"#0f172a"`.
- [ ] Configure `next.config.mjs` with `@ducanh2912/next-pwa`:
  - Enable caching of static chunks and routes for offline resilience.
- [ ] Add manifest link and meta tags to `app/layout.tsx`.
- [ ] Verify PWA manifest loads correctly; commit.

---

### Task 7: Full System Verification, Build & Regression Audit

**Files:**
- Create: `tests/stealth.test.ts` or standalone verification script `scripts/verify-stealth.mjs`

**Steps:**
- [ ] Write `scripts/verify-stealth.mjs` to test:
  - Web Crypto AES-GCM draft stashing and decryption.
  - Calculator arithmetic precision logic.
  - Secret PIN validation and panic wipe code execution.
- [ ] Run `node scripts/verify-stealth.mjs`.
- [ ] Run `npm run build` to confirm clean Turbopack / TypeScript compilation.
- [ ] Run `node scripts/verify-rls.mjs` to ensure zero database security regressions.
- [ ] Update `PROJECT_STATUS.md` and commit all deliverables.
