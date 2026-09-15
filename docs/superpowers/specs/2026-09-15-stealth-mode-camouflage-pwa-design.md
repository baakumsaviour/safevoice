# SafeVoice Stealth Mode & Camouflage Skin (PWA) Design Specification

**Date:** 2026-09-15  
**Document Version:** 1.0  
**Status:** Approved by Technical Lead; Ready for Implementation Plan  
**Target File:** `docs/superpowers/specs/2026-09-15-stealth-mode-camouflage-pwa-design.md`  

---

## 1. Executive Summary & Problem Statement

In Ghana, victims and survivors of Gender-Based Violence (GBV), domestic abuse, and child exploitation frequently live in shared living quarters with their abusers. Impromptu phone checks and physical device inspections are common coercive control tactics. 

If an abuser inspects a victim's smartphone and discovers an open tab or home-screen icon for a crisis intervention tool like **SafeVoice**, the victim faces immediate and severe physical retaliation. 

While the existing `QuickEscape` button immediately redirects the browser to `google.com`, it completely destroys active report drafts and cannot disguise an installed Progressive Web App (PWA).

**SafeVoice Stealth Mode** resolves this critical safety gap by:
1. Transforming the entire application into a fully functioning, realistic **Interactive Calculator ("QuickCalc")** in under 10ms with zero network calls.
2. Camouflaging the browser tab title, favicon, and mobile home screen PWA icons.
3. Securely stashing active report drafts and recorded voice notes in an in-memory encrypted vault with a 15-minute auto-expiry timeout (Zero-DOM-Leak).
4. Providing a discreet unmasking mechanism (entering a secret PIN e.g. `1984` or covert title long-press) and an emergency panic wipe (`0000 =`).

---

## 2. System Architecture & Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BROWSER / RUNTIME ENVIRONMENT                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          StealthProvider                              │  │
│  │   • Manages state: isStealthActive, isLocked, unlockPin, autoLockTimer │  │
│  │   • Manages tab metadata: document.title, favicon, history spoofing    │  │
│  │   • In-memory ephemeral draft encryption & timer-based purge          │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │                                       │
│                ┌────────────────────┴────────────────────┐                  │
│                ▼                                         ▼                  │
│  ┌───────────────────────────┐             ┌─────────────────────────────┐  │
│  │    CalculatorDisguise     │             │        SafeVoice UI         │  │
│  │  • Genuine Arithmetic     │             │  • Landing & Case Tracker   │  │
│  │  • Full Keypad (0-9,+,-,=)│             │  • Report Form Wizard       │  │
│  │  • Secret PIN Listener    │             │  • Realtime AI & Case Chat  │  │
│  │  • Panic Wipe (0000 =)    │             │  • QuickEscape & Stealth Btn│  │
│  └───────────────────────────┘             └─────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Component Breakdown

| Component / Module | Path | Purpose |
| :--- | :--- | :--- |
| `StealthContext` & `StealthProvider` | `components/stealth/StealthContext.tsx` | Global React context managing camouflage state, encrypted stash, PIN validation, and tab metadata spoofing. |
| `CalculatorDisguise` | `components/stealth/CalculatorDisguise.tsx` | Authentic arithmetic calculator facade with LCD display, full touch keypad, keyboard support, and covert unlock triggers. |
| `StealthButton` | `components/stealth/StealthButton.tsx` | Discreet camouflage toggle icon button embedded in navigation bars, form headers, and mobile footers. |
| `QuickEscape` (Updated) | `components/ui/QuickEscape.tsx` | Enhanced escape component offering instant disguise to Calculator or jump to Google. |
| `draftVault` | `lib/client/draftVault.ts` | Client-side in-memory Web Crypto AES-GCM stashing utility with zero-DOM leakage and 15-minute garbage collection. |
| `PWA Manifest & Icons` | `public/manifest.json`, `public/icons/*` | Neutral PWA metadata (`"QuickCalc"`) and icons for stealth home screen installation. |
| `next.config.mjs` (Updated) | `next.config.mjs` | `@ducanh2912/next-pwa` integration for offline caching of both calculator and reporting shells. |

---

## 3. Detailed Specifications

### 3.1 The Calculator Disguise (`CalculatorDisguise.tsx`)
* **Visual Styling**:
  - Dark slate theme (`bg-slate-900 text-white font-mono`).
  - Realistic LCD calculation readout: sub-line displaying current calculation history (e.g. `245 × 12`), main line displaying active input/result.
  - Grid keypad:
    - Row 1: `C` (Clear), `±` (Negate), `%` (Modulo/Percent), `÷` (Divide)
    - Row 2: `7`, `8`, `9`, `×` (Multiply)
    - Row 3: `4`, `5`, `6`, `-` (Subtract)
    - Row 4: `1`, `2`, `3`, `+` (Add)
    - Row 5: `0` (wide), `.`, `=` (Equals)
* **Arithmetic Execution**:
  - Fully supports addition, subtraction, multiplication, division, percentages, and floating-point precision.
  - Supports standard physical keyboard inputs (digits, Enter, Backspace, Escape).
* **Covert Unmasking Protocol**:
  - **PIN Entry**: Entering the 4-to-6 digit secret PIN (default `1984`) followed by `=` triggers validation. If valid, the calculator gracefully dissolves and SafeVoice is remounted.
  - **Fallback Long-Press**: Long-pressing the `"Calculator"` header text for 3 seconds triggers a discreet unlock prompt.
* **Panic Wipe Code (`0000 =`)**:
  - Entering `0000 =` executes an immediate zero-trace purge: clears all stashed drafts, flushes `sessionStorage`, wipes cached Supabase tokens, and resets the calculator display to `0`.

### 3.2 Ephemeral Draft Encryption & Zero-DOM-Leakage (`draftVault.ts`)
* **Security Threat Model**: An abuser grabbing the phone may open browser DevTools, inspect the DOM tree, or view background tabs.
* **Mitigation**:
  - When Camouflage is triggered, SafeVoice immediately fires a serialize event.
  - Current form values (incident category, narrative text, attached voice note blob, victim contact fields) are serialized into a JSON string.
  - The string is encrypted using the native browser **Web Crypto API** (`AES-256-GCM`) with a 256-bit key stored exclusively in memory.
  - The SafeVoice DOM tree is unmounted and replaced by `CalculatorDisguise`.
  - A 15-minute auto-expiry countdown begins. If not unlocked within 15 minutes, the in-memory key and encrypted blob are overwritten and discarded.
  - When unlocked with the PIN, the payload is decrypted and deserialized directly back into form state.

### 3.3 Metadata & Tab Spoofing
* When Camouflage is active:
  - `document.title` is replaced with `"QuickCalc - Calculator"`.
  - The `<link rel="icon">` is dynamically switched to a neutral calculator SVG.
  - The address bar is sanitized using `window.history.replaceState(null, '', '/')`.
* When Camouflage is unlocked:
  - `document.title` reverts to `"SafeVoice Ghana | Crisis Support & Reporting"`.
  - The original favicon and route history are restored.

### 3.4 PWA Manifest & Offline Architecture
* **`next.config.mjs`**: Wraps the Next.js configuration with `withPWA({ dest: 'public', disable: process.env.NODE_ENV === 'development' })`.
* **Manifest (`public/manifest.json`)**:
  - Default camouflaged profile:
    - `name`: `"QuickCalc Utility"`
    - `short_name`: `"QuickCalc"`
    - `start_url`: `/?stealth=true`
    - `display`: `"standalone"`
    - `background_color`: `"#0f172a"`
    - `theme_color`: `"#1e293b"`
    - `icons`: standard 192x192 and 512x512 neutral math/calculator icons.
* **Standalone PWA Launch**:
  - When opened from the home screen in standalone mode, the app boots directly into `CalculatorDisguise`.
  - The user enters `1984 =` to access SafeVoice.
  - Putting the PWA in the background or closing it automatically re-arms the camouflage lock.

---

## 4. User Experience & Trigger Workflows

### Flow A: Instant Camouflage during Reporting
1. Victim is on `/report` typing a sensitive narrative or recording audio.
2. Footsteps approach. Victim taps the discreet `"Disguise"` icon in the header or presses `Esc` x 2.
3. SafeVoice instantly vanishes (<10ms). The screen displays a normal dark-mode calculator.
4. Tab title becomes `"QuickCalc - Calculator"`.
5. Footsteps arrive. Abuser looks at screen, sees calculator, taps `9 × 8 =` → displays `72`.
6. Abuser departs. Victim enters `1984 =`.
7. SafeVoice reappears with narrative and audio note intact.

### Flow B: Emergency Panic Wipe
1. Victim is in disguise mode. Abuser demands phone and unlock code.
2. Victim types `0000 =`.
3. Screen flashes calculation result `0`.
4. In background, all stashed drafts, session storage, and tokens are permanently purged. Even if inspected, zero data can be recovered.

---

## 5. Testing & Verification Plan

1. **Unit & Logic Tests**:
   - Verify calculator arithmetic operations (`+`, `-`, `*`, `/`, `%`, precision handling).
   - Verify PIN detection and unmasking callback triggering.
   - Verify `0000 =` panic code execution.
2. **Security & Cryptographic Verification**:
   - Inspect DOM while calculator is active: assert zero occurrences of report text or victim PII.
   - Verify AES-GCM draft encryption and decryption round-trip.
   - Verify 15-minute expiration timer purges stashed drafts.
3. **PWA & Offline Verification**:
   - Run production build (`next build`) with PWA service worker generation.
   - Test offline loading in airplane mode (calculator must render 100% offline).
4. **Cross-Device Usability**:
   - Verify touch targets on mobile viewports (<380px, standard 400px, tablet).
