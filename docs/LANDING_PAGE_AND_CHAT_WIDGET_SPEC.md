# SafeVoice: Full Landing Page & Floating Chat Redesign Specification

**Document:** `/docs/LANDING_PAGE_AND_CHAT_WIDGET_SPEC.md`  
**Author:** Architect Agent  
**Date:** 2026-09-05  
**Status:** Review & Decision Checkpoint  

---

## 1. Executive Summary & Purpose

The user requested a complete paradigm shift for the SafeVoice entry point:
- **From:** A split-screen 50/50 view where half the screen is a static sidebar and the other half is a raw, open chat box.
- **To:** A **full, beautifully designed trauma-informed landing page** with prominent actions to submit reports, verify safety, and access crisis resources, coupled with a **floating bottom-corner AI Chat Widget** that expands on demand.

This document aggressively interrogates this idea across usability, trauma-informed psychology, mobile responsiveness, and technical architecture, and proposes concrete high-value additions.

---

## 2. Grilling & Critical Interrogation (Matt Pocock Style)

### Dimension A: The Trauma-Informed Psychology Check
* **The Problem with the Current 50/50 Screen:**
  * When a survivor in crisis lands on the site, an empty chat window creates cognitive burden ("What do I say? Who is seeing this? Is this being recorded?").
  * The formal reporting flow (voice notes, evidence upload, district geocoding) is squeezed into an inconspicuous sidebar card.
* **Why the Full Landing Page Works Better:**
  * Establishes immediate safety cues, authoritative trust, and legal confidentiality before asking the user for information.
  * Gives clear, distinct pathways:
    1. **Pathway A (Formal Report):** "Submit an Encrypted Report" (with voice recording or files).
    2. **Pathway B (Immediate Emotional Support):** "Chat with SafeVoice AI" (instant floating widget).
    3. **Pathway C (Emergency Hotline):** Immediate phone call to DOVVSU / Ghana Police / Emergency 112.
    4. **Pathway D (Case Follow-Up):** "Track Report Status" with anonymous Case Reference Code.

---

### Dimension B: The Floating Chat Widget & Quick Escape Conflict
* **The Hardest Edge Case:** SafeVoice already has a fixed floating button: **`QuickEscape` ("Leave Site")**.
* **The Dilemma:** If both the Quick Escape button and the AI Chat button float at the bottom of the screen, how do we prevent catastrophic mis-clicks (e.g. user wanting to chat, but accidentally clicking "Leave Site" and getting redirected to Google)?
* **Architectural Decision:**
  1. **Quick Escape Position:** Move `QuickEscape` to the **top navigation bar** (as a sticky, high-contrast Red Emergency Exit button: "⚠️ Quick Escape [Esc x2]") and keep a discreet red pill on the **bottom-left**.
  2. **AI Chat Launcher Position:** Place the floating AI chat trigger at the **bottom-right** (`fixed bottom-6 right-6`).
  3. **Inside the Open Chat Drawer:** Embed a dedicated "Quick Escape" button in the chat modal header so the user can instantly vanish the window if someone approaches.

---

### Dimension C: Chat State & Continuity Across Page Navigation
* **The Question:** What happens if the user opens the floating chat, exchanges 3 messages with the AI, and then clicks "Open Full Report" or minimizes the chat window?
* **Architectural Decision:**
  * The floating chat must behave like an expandable drawer/dialog without navigating away from the page.
  * When minimized or closed, the chat state, `caseId`, and message history remain preserved in `sessionStorage`.
  * If the user clicks "Quick Escape", `sessionStorage` is immediately wiped clean.

---

## 3. High-Value Additions to Elevate the Platform

To make the platform significantly more usable, protective, and impactful, we propose 4 specific additions:

### Addition 1: Anonymous Case Status Quick-Lookup Directly on the Landing Page
* **Current Gap:** Users with a Case Number (like `SV-U5S6-PPBA`) are forced to navigate to `/auth/login`, which asks for email/password. But anonymous reporters do not have passwords!
* **Addition:** An inline modal or section on the landing page: **"Check Case Status"**. The user inputs their 12-character case code, and gets an instant read-only summary (Status: *Under Review / Caseworker Assigned*, Incident Category, Assigned Region) without logging in.

### Addition 2: Interactive Ghana Emergency Hotline Quick-Dial Grid
* Dedicated section featuring official Ghanaian emergency services:
  * **DOVVSU (Domestic Violence & Victim Support Unit - Ghana Police)**: `0302-773906` / `055-7799997`
  * **National Emergency (Police / Ambulance)**: `112`
  * **CHRAJ (Human Rights Commission)**: `0302-662150`
  * **Orange Support Hotline (GBV Support)**: `0800-111-222` (Toll-Free)
* Tap-to-call on mobile, copy number on desktop.

### Addition 3: "Voice-First" Interactive Reporting Banner
* A dedicated interactive section demonstrating the **Voice Recorder** capability: "Can't type safely? Send an encrypted voice note."
* Direct 1-click launch into the audio reporting wizard.

### Addition 4: "Stealth / Discreet Mode" (Camouflage Switch)
* A small toggle button in the footer or header: "Discreet View".
* Immediately replaces the page styling and headings with a neutral, innocuous public information article ("Ghana Public Safety & Health Advisory") so abusive partners or onlookers cannot see that abuse is being reported.

---

## 4. Proposed Landing Page Structure (Section-by-Section)

```
┌────────────────────────────────────────────────────────────────────────┐
│ NAVBAR: SafeVoice Logo | Emergency Hotlines | Track Case | [Quick Escape] │
├────────────────────────────────────────────────────────────────────────┤
│ HERO SECTION:                                                          │
│ - Headline: "Safe, Anonymous & Encrypted Abuse Reporting in Ghana"      │
│ - Subheading: "You are not alone. Speak up securely with end-to-end   │
│   encryption. No account or personal details required."                │
│ - CTA Buttons:                                                         │
│   [ 🛡️ Submit Confidential Report ]  [ 💬 Talk to SafeVoice AI ]       │
│ - Trust Badges: 100% Anonymous • AES-256 Encrypted • DOVVSU Aligned    │
├────────────────────────────────────────────────────────────────────────┤
│ EMERGENCY HELPLINES BAR (Ghana Toll-Free & Direct Dispatch):           │
│ - DOVVSU • Ghana Police (112) • GBV Crisis Line • Medical Support     │
├────────────────────────────────────────────────────────────────────────┤
│ HOW SAFEVOICE PROTECTS YOU (3-Step Visual Cards):                       │
│ 1. Voice or Form Report (Type, record audio, or attach photos)         │
│ 2. Zero-Knowledge Encryption (Stored encrypted on secure servers)      │
│ 3. Caseworker Triage (Assigned to regional trauma-informed specialists)│
├────────────────────────────────────────────────────────────────────────┤
│ AUDIO REPORTING SHOWCASE:                                              │
│ - "Prefer speaking instead of typing?"                                 │
│ - Audio recording feature highlight + instant submit                   │
├────────────────────────────────────────────────────────────────────────┤
│ ANONYMOUS CASE TRACKER:                                                │
│ - Simple input: [ Enter Reference Code (e.g. SV-XXXX-XXXX) ] [ Track ] │
├────────────────────────────────────────────────────────────────────────┤
│ FOOTER:                                                                │
│ - Safety instructions (Press Esc twice to exit)                        │
│ - Privacy policy • Legal disclaimers • Powered by Trauma-Informed AI   │
└────────────────────────────────────────────────────────────────────────┘

[ Floating Action Button - Bottom Right ]
  └── "💬 Talk to AI Assistant"
      └── Expands into slide-over / popup chat drawer powered by OpenRouter!
```

---

## 5. Technical Implementation Blueprint

1. **Components to Create / Update:**
   * `components/feature/LandingHero.tsx` — Hero with dual CTAs and trust indicators.
   * `components/feature/HelplineBar.tsx` — Ghana crisis hotline directory.
   * `components/feature/HowItWorks.tsx` — 3-step reporting explanation cards.
   * `components/feature/CaseTrackerModal.tsx` — Direct anonymous status lookup.
   * `components/feature/FloatingChatWidget.tsx` — Expandable floating bottom-right chat modal with OpenRouter AI engine, typing indicator, and minimize/expand states.
   * `components/ui/QuickEscape.tsx` — Adjusted to top navbar + discreet sticky pill.
   * `app/page.tsx` — Redesigned into the clean, full-page landing experience.

2. **Backend Server Action Additions:**
   * `lookupAnonymousCaseAction(caseNumber: string)` in `server/actions/victim.ts`: Returns safe public status (`status`, `created_at`, `case_type`, `region`) for reference codes without requiring caseworker sign-in.
