# CHAPTER THREE
# RESEARCH METHODOLOGY & SYSTEM ARCHITECTURE

## 3.1 Requirements Specification and Threat Modeling

Building a national digital public infrastructure platform for domestic crisis reporting requires a rigorous formulation of system requirements and an adversarial threat model. This section specifies the functional and non-functional requirements of SafeVoice, followed by a formal definition of the physical and network threat vectors the architecture must neutralize.

### 3.1.1 Functional Requirements
The functional scope of the SafeVoice platform spans four stakeholder personas: **Citizens/Survivors**, **Frontline Police Investigators (DOVVSU)**, **Department of Social Welfare (DSW) Caseworkers**, and **System Administrators**.

1. **Omnichannel Multi-Step Incident Ingestion:**
   - The system must provide an accessible, progressive reporting wizard dividing the disclosure into four discrete steps: Incident Categorization, Narrative Documentation, Evidence Upload, and Contact/Consent Preferences.
   - The platform must support direct client-side audio recording via the Web MediaStream Recording API, enabling survivors to submit voice notes in local Ghanaian languages without typing a mandatory text description.
   - Geographic classification must support all 16 administrative regions of Ghana and their respective municipal districts.
2. **Anonymous Case Tracking by Reference Code:**
   - The system must generate a 12-character cryptographically secure pseudo-random reference code formatted as `SV-XXXX-XXXX` using an unambiguous alphanumeric alphabet (`ABCDEFGHJKMNPQRSTUVWXYZ23456789`).
   - Survivors must be capable of tracking case triage status, assigned agency notes, and caseworker chat updates anonymously using this reference code without creating a persistent username, password, or email account.
3. **Instant Covert Camouflage Mode:**
   - The system must provide a single-action trigger (via button click or pressing <kbd>Esc</kbd> twice within 1000 milliseconds) that transforms the visible screen into an authentic arithmetic calculator within 10 milliseconds.
   - The disguise must execute genuine arithmetic operations to withstand interactive visual scrutiny.
   - Entering a secret PIN (`1984 =`) must unmask the system and restore the active reporting session.
   - Entering an emergency panic wipe code (`0000 =`) must permanently destroy all local drafts and session caches immediately.
4. **Automated Trauma-Informed AI First-Response:**
   - The system must provide an automated first-responder assistant that analyzes incoming disclosures, offers empathetic crisis reassurance, flags high-urgency keywords (such as weapons, active bleeding, or suicidal ideation), and initiates caseworker escalation.
5. **Role-Based Case Management and Inter-Agency Dispatch:**
   - Verified DOVVSU police sergeants and DSW social workers must access a secure administrative dashboard providing triage categorization (`pending`, `triaged`, `assigned`, `investigating`, `resolved`).
   - Caseworkers must be able to conduct realtime, two-way encrypted messaging with anonymous survivors via database websocket streams.

### 3.1.2 Non-Functional Requirements & Safety Constraints
1. **Zero-DOM-Leakage:** When camouflage mode is active, no survivor text, telephone numbers, or audio references may remain in plain-text DOM nodes or browser process memory accessible via developer tools.
2. **Sub-10 Millisecond Disguise Latency:** The visual transition from the SafeVoice reporting interface to the calculator disguise must complete within 10 milliseconds, preventing visual flicker or perceptible layout shifts during an emergency interruption.
3. **Offline Fault Tolerance:** Core platform shells, the arithmetic calculator, and emergency telephone directories must load and execute reliably with zero active cellular data connectivity via Progressive Web App (PWA) service worker caching.
4. **Transport Body and File Caps:** The server action intake pipeline must accept multi-part form payloads up to 20 MB, supporting an 8 MB primary evidence attachment, an uncompressed voice recording blob, and structured metadata in a single atomic request.
5. **Strict Multi-Tenant Database Isolation:** Database policies must prevent cross-tenant data leaks. An anonymous reporter must never be able to query, inspect, or modify another victim's records, nor read internal casework logs.

### 3.1.3 Physical and Network Threat Model
The security design of SafeVoice addresses three distinct threat vectors:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ADVERSARIAL THREAT MODEL                          │
├────────────────────────────────┬────────────────────────────────────────────┤
│ THREAT ACTOR                   │ ATTACK VECTOR & MOTIVATION                 │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 1. Physically Proximate Abuser │ • Sudden room entry during report entry    │
│    (Coercive Domestic Control) │ • Unannounced phone handover & inspection  │
│                                │ • Examination of browser history & tabs    │
│                                │ • Examination of home-screen PWA icons     │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 2. Hostile Network / Forensic  │ • Inspection of browser DevTools & memory  │
│    Adversary                   │ • Man-in-the-Middle (MitM) Wi-Fi sniffing  │
│                                │ • Defense subpoena challenging hash spoli- │
│                                │   ation in court under Act 772             │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 3. Compromised Insider /       │ • Caseworker querying unassigned files     │
│    Untrusted Tenant            │ • Victim attempting privilege escalation   │
│                                │ • Tampering with case audit logs           │
└────────────────────────────────┴────────────────────────────────────────────┘
```

1. **Threat Actor 1: The Physically Proximate Abuser.**  
   *Vector:* The adversary enters the room abruptly while the survivor is actively using the system. The adversary demands the phone or glances at the display.  
   *Countermeasure:* The survivor presses <kbd>Esc</kbd> twice or taps the discreet disguise toggle. Within 10 milliseconds, the screen switches to an authentic calculator, `document.title` becomes `"QuickCalc - Calculator"`, the browser tab icon switches to a math glyph, and the address bar changes to `/`. The in-progress draft is encrypted into volatile memory and removed from the HTML.
2. **Threat Actor 2: The Hostile Forensic Examiner / Defense Counsel.**  
   *Vector:* In court, defense counsel challenges uploaded photographs or audio recordings, alleging that the evidence was manipulated, edited, or re-compressed during transmission.  
   *Countermeasure:* At the millisecond of file attachment, the client computes a 256-bit SHA-256 digest on the raw byte stream. The digest is stored alongside file size, MIME type, and UTC timestamp in an immutable server audit record. Any post-intake modification invalidates the cryptographic hash.
3. **Threat Actor 3: The Malicious Tenant or Insider.**  
   *Vector:* An anonymous reporter attempts to query the database via PostgREST endpoints to inspect other domestic violence reports, or an attacker attempts to promote their account to administrative status.  
   *Countermeasure:* PostgreSQL Row-Level Security (RLS) is applied to all tables. The database rejects all queries where `auth.uid() != victim_id`, blocks role changes at the database trigger level, and limits audit log insertions strictly to service-role background processes.

---

## 3.2 High-Level System Architecture

SafeVoice is organized into a modular four-tier architecture: **Client Layer (PWA & Stealth State Engine)**, **API & Edge Compute Layer (Next.js Server Actions)**, **Persistence & Identity Layer (Supabase PostgreSQL & Storage)**, and **External Service Gateways (OpenRouter Inference & Mapbox GL)**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT LAYER                                 │
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │   SafeVoice UI Shell  │  │  Calculator Disguise  │  │  Draft Vault    │  │
│  │  • Multi-Step Form    │  │  • Real Math Engine   │  │  • In-Memory    │  │
│  │  • Voice Recorder     │  │  • Event Keypad Grid  │  │    AES-256-GCM  │  │
│  │  • Case Status Modal  │  │  • PIN Listener       │  │  • 15m Auto-    │  │
│  │  • Realtime Case Chat │  │  • Panic Wipe Hook    │  │    Purge Timer  │  │
│  └───────────┬───────────┘  └───────────┬───────────┘  └────────┬────────┘  │
│              │                          │                       │           │
│              └──────────────────────────┼───────────────────────┘           │
│                                         │                                   │
│                               ┌─────────▼──────────┐                        │
│                               │   StealthProvider  │                        │
│                               │ • State Machine    │                        │
│                               │ • Tab Meta Spoof   │                        │
│                               │ • Esc x 2 Listener │                        │
│                               └─────────┬──────────┘                        │
└─────────────────────────────────────────┼───────────────────────────────────┘
                                          │ HTTPS / Server Actions
┌─────────────────────────────────────────▼───────────────────────────────────┐
│                          EDGE COMPUTE & API LAYER                           │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          Next.js 16 App Router                        │  │
│  │   • server/actions/report.ts    (Encrypted Intake & SHA-256 Commit)   │  │
│  │   • server/actions/chat.ts      (Realtime Decryption & Message Send)  │  │
│  │   • server/actions/victim.ts    (Anonymous Reference Code Lookup)     │  │
│  │   • server/actions/admin.ts     (Staff Case Triage & Assignment)      │  │
│  │   • server/auth.ts              (requireUser / requireRole Gates)     │  │
│  │   • lib/server/encryption.ts    (Server AES-256-GCM Envelope Core)    │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │
       ┌──────────────────────────────┼──────────────────────────────┐
       │ Authenticated PostgREST      │ S3 Compatible API            │ OpenRouter API
┌──────▼──────────────────────────────▼──────┐  ┌────────────────────▼────────┐
│         PERSISTENCE & SECURITY LAYER       │  │    EXTERNAL SERVICE RAILS   │
│                                            │  │                             │
│  PostgreSQL (Supabase eu-west-1):          │  │  • OpenRouter Inference     │
│   • public.cases         (Row-Level Sec)   │  │    google/gemma-3-1b-it:free│
│   • public.case_messages (Websocket Stream)│  │    15s Timeout / Failover   │
│   • public.users         (Role Enforced)   │  │                             │
│   • public.case_audit    (Immutable Logs)  │  │  • Mapbox GL Static & Live  │
│                                            │  │    Geocoded Jittered Map    │
│  Supabase Storage (evidence bucket):       │  │    for Ghana 16 Regions     │
│   • Private / Scoped by case_id UUID       │  │                             │
└────────────────────────────────────────────┘  └─────────────────────────────┘
```

---

## 3.3 Ephemeral In-Memory Draft Vault Engineering

The core technical innovation resolving the tension between emergency physical concealment and user input preservation is the **Ephemeral In-Memory Draft Vault** ([`lib/client/draftVault.ts`](file:///Users/user/development/safevoice/lib/client/draftVault.ts)).

### Cryptographic Lifecycle Specification
Standard web storage mechanisms (`localStorage`, `sessionStorage`, and `IndexedDB`) write plain-text or base64 data to unencrypted SQLite database files on the device's flash storage. In Android and iOS file systems, these files persist even after the browser tab is closed and can be extracted using forensic extraction tools.

To ensure **Zero-DOM-Leakage**, SafeVoice operates an ephemeral in-memory vault utilizing the W3C Web Crypto API (`window.crypto.subtle`). The vault lifecycle proceeds through five states:

```
[UNREGISTERED] 
       │
       │ registerDraftHandlers(serializer, restorer)
       ▼
  [REGISTERED] 
       │
       │ stashDraft() triggered by Stealth Engine
       ▼
   [ENCRYPTING] ──► Generates 256-bit AES-GCM Key in volatile execution memory
       │        ──► Generates 12-byte CSPRNG IV
       │        ──► Encrypts serialized JSON draft payload
       │        ──► Purges plain-text DOM nodes
       ▼
   [STASHED]    ──► Starts 15-minute countdown timer (setTimeout)
       │
       ├───► PIN '1984 =' verified ──► [DECRYPTING] ──► Restores state ──► [REGISTERED]
       │
       └───► Timer expires OR '0000 =' entered ──► [PURGED] (Memory zeroed)
```

### Mathematical Formulation
Let $D$ represent the serialized JSON string of the active report draft, comprising incident category, narrative, selected region, district, and contact details:
$$D = \text{JSON.stringify}(\{\text{step}, \text{caseType}, \text{narrative}, \dots\})$$

1. **Key Generation:** The runtime generates a non-extractable symmetric key $K$:
   $$K \leftarrow \text{CryptoKey}_{\text{AES-GCM-256}} \quad (\text{extractable} = \text{false})$$
2. **IV Generation:** A 12-byte cryptographic initialization vector $IV$ is populated via cryptographically secure pseudo-random values:
   $$IV \leftarrow \text{CSPRNG}(12 \text{ bytes})$$
3. **Encryption:** The plaintext buffer $P = \text{EncodeUTF8}(D)$ is transformed into ciphertext $C$ with an integrated 128-bit authentication tag:
   $$C \leftarrow \text{Encrypt}_{\text{AES-GCM}}(K, IV, P)$$
4. **DOM Scrubbing:** Following encryption, $D$ is dereferenced. The React root unmounts or applies strict style hiding (`display: none; aria-hidden: true`), eliminating all survivor text nodes from the active browser layout tree.
5. **Garbage Collection Expiry:** A countdown timer $T_{\text{exp}} = 900,000 \text{ ms}$ (15 minutes) is armed. If unmasking is not executed before $T_{\text{exp}}$, the memory references are cleared:
   $$K \leftarrow \text{null}, \quad IV \leftarrow \text{null}, \quad C \leftarrow \text{null}$$

---

## 3.4 Trauma-Informed Covert Interaction & Calculator State Machine

The covert disguise is implemented via a synchronized React Context (`StealthContext.tsx`) and an authentic calculation component (`CalculatorDisguise.tsx`).

### State Machine Definition
The disguise engine is modeled as a finite-state machine with four primary states:

```
                  ┌─────────────────────────────────────┐
                  │          SAFEVOICE_ACTIVE           │
                  │   • Full reporting UI mounted       │
                  │   • Title: "SafeVoice Ghana"        │
                  │   • Favicon: /icon.svg              │
                  └───────┬─────────────────────▲───────┘
                          │                     │
      Esc x 2 OR          │                     │ Secret PIN '1984 ='
      Disguise Button Tap │                     │ verified
                          ▼                     │
                  ┌─────────────────────────────┴───────┐
                  │          CAMOUFLAGE_ACTIVE          │
                  │   • Draft encrypted via AES-GCM     │
                  │   • SafeVoice UI removed from DOM   │
                  │   • Calculator keypad displayed     │
                  │   • Title: "QuickCalc - Calculator" │
                  │   • Favicon: /icons/calc.svg        │
                  │   • URL: window.history.replace('/')│
                  └───────┬─────────────────────┬───────┘
                          │                     │
        Covert Header     │                     │ Panic Wipe Code
        Long-Press (3s)   │                     │ '0000 =' entered
                          ▼                     ▼
                  ┌───────────────┐     ┌───────────────┐
                  │ UNLOCK_MODAL  │     │ TOTAL_PURGE   │
                  │ Emergency PIN │     │ Memory wiped, │
                  │ Dialog prompt │     │ session reset,│
                  └───────────────┘     │ display = '0' │
                                        └───────────────┘
```

### Arithmetic Engine & Secret Evaluation Loop
The disguise cannot rely on a static visual mockup; if an assailant tests the screen by tapping numbers and operators, the application must compute accurate arithmetic. 

The arithmetic engine maintains three reactive state variables: `displayValue` (string), `prevValue` (float), and `operation` (string). When the equals button (`=`) is triggered, the evaluation function executes the algorithm specified in Listing 3.1.

```typescript
// Listing 3.1: Calculator Evaluation and Secret Sequence Detection
const handleEquals = useCallback(() => {
  // 1. Check for Emergency Panic Wipe Code (0000)
  if (displayValue === '0000') {
    onPanicWipe()
    handleClear()
    return
  }

  // 2. Check for Secret Unmask PIN (Default 1984)
  if (displayValue === unlockPin) {
    onUnlock()
    return
  }

  // 3. Normal Authentic Calculation Execution
  if (!operation || prevValue === null) return

  const inputValue = parseFloat(displayValue)
  const result = calculate(prevValue, inputValue, operation)

  setHistoryLine(`${prevValue} ${operation} ${displayValue} =`)
  setDisplayValue(formatResult(result))
  setPrevValue(null)
  setOperation(null)
  setWaitingForOperand(true)
}, [displayValue, operation, prevValue, unlockPin, onUnlock, onPanicWipe])
```

### Tab Metadata Spoofing
Upon transition into `CAMOUFLAGE_ACTIVE`, the state machine manipulates three elements of browser tab metadata:
1. `document.title = 'QuickCalc - Calculator'`
2. The active `<link rel="icon">` element is located and its `href` attribute is replaced with `/icons/calc.svg`.
3. `window.history.replaceState(null, '', '/')` is executed to strip any sensitive routing segments (such as `/report` or `/chat/SV-XXXX-XXXX`) from the address bar and back-button history.

---

## 3.5 Identity, Role-Based Access Control, and Row-Level Security

SafeVoice implements a dual-layer security model comprising application-level Server Action authorization gates and database-level PostgreSQL Row-Level Security (RLS).

### Dual-Track Identity Model
The system supports two entry pathways:
- **Authenticated Staff & Caseworkers:** Registered personnel log in through standard credentials. Their role is committed to `public.users.role` as either `caseworker` or `admin`.
- **Anonymous Survivors:** Anonymous reporters are provisioned with an authentic Supabase anonymous authentication session (`supabase.auth.signInAnonymously()`). This creates a genuine UUID in `auth.users`, enabling PostgREST to evaluate `auth.uid()` in Row-Level Security policies and subscribe to real-time websocket channels without exposing personal identity.

### Role-Based Authorization Gates
Every server action in `server/actions/` invokes strict validation from `server/auth.ts` on its first line of execution:
- `requireUser()`: Asserts that an authenticated session (anonymous or permanent) exists.
- `requireRole('caseworker', 'admin')`: Derives the caller's role strictly from the authenticated cookie session and asserts authorization before executing administrative functions. Client-supplied role arguments are ignored.

### Table 3.1: Role-Based Access Control Permission Matrix

| Operation / Endpoint | Anonymous Victim | Assigned Caseworker | Unassigned Caseworker | System Administrator |
| :--- | :---: | :---: | :---: | :---: |
| **Submit New Report** | Allowed | Allowed | Allowed | Allowed |
| **View Case Details** | Own Case Only | Assigned Cases | Denied | All Cases |
| **Send Chat Message** | Own Case Only | Assigned Cases | Denied | Allowed |
| **View Audit Log** | Denied | Denied | Denied | Allowed |
| **Triage / Assign Case**| Denied | Denied | Denied | Allowed |
| **Change User Role** | Denied | Denied | Denied | Blocked by Trigger |

### Database Row-Level Security (RLS) Policy Formulation
Listing 3.2 illustrates the formal PostgreSQL policy governing the `case_messages` table, enforcing strict tenancy boundaries.

```sql
-- Listing 3.2: Row-Level Security Policy for Case Messages
CREATE POLICY "messages_select_authorized"
ON public.case_messages
FOR SELECT
USING (
  -- 1. The message author can read their own message
  auth.uid() = sender_id
  OR
  -- 2. The victim who owns the parent case can read messages in their case
  EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_messages.case_id
    AND cases.victim_id = auth.uid()
  )
  OR
  -- 3. The assigned caseworker can read messages
  EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_messages.case_id
    AND cases.assigned_caseworker_id = auth.uid()
  )
  OR
  -- 4. Administrators can read all messages
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

---

## 3.6 Automated Triage Inference and Inter-Agency Workflow

SafeVoice implements an asynchronous automated first-response pipeline using Large Language Model (LLM) inference integrated through an OpenRouter meta-gateway.

### Inference Gateway Architecture
When a report or chat message is submitted, the server evaluates whether the incident requires immediate risk-tier classification. To prevent vendor lock-in and avoid single-point-of-failure outages, the inference gateway uses `@openrouter/ai-sdk-provider` connected to `google/gemma-3-1b-it:free` with automated multi-model fallback.

To prevent infinite thread blocking under network latency, all AI inference queries are wrapped in a 15-second `Promise.race` timeout guard. Messages generated by the assistant are committed to `case_messages` with `sender_role = 'ai'` and `sender_id = NULL`, ensuring that algorithmic responses are never falsely attributed to a human caseworker or survivor.

### Dual-Track Case Routing
Once triaged, SafeVoice orchestrates twin operational tracks:
- **Track A (Criminal Justice & DOVVSU Police):** Dispatches geolocated alert packets including GhanaPostGPS digital addresses to the nearest police squad vehicle. Enables station sergeants to issue cryptographic QR-coded Digital Police Form 8 medical examination vouchers.
- **Track B (Social Care & Clinical Protection):** Notifies Department of Social Welfare caseworkers and partner medical centers (Korle-Bu, KATH, Ridge, Tamale), facilitating trauma counseling and shelter coordination.

---

## 3.7 Evaluation and Verification Framework

The empirical evaluation of SafeVoice is conducted using three specialized verification frameworkes:

1. **Security Isolation Verification Suite ([`scripts/verify-rls.mjs`](file:///Users/user/development/safevoice/scripts/verify-rls.mjs)):** An automated script that provisions two independent anonymous reporters (User A and User B) against the live cloud database (`wnfvzbybxhswucrwolyf.supabase.co`). The test suite executes 10 adversarial checks attempting cross-tenant case reading, unauthorized status closing, message spoofing, caseworker impersonation, and administrative self-promotion.
2. **Stealth and Cryptographic Profiler ([`scripts/verify-stealth.mjs`](file:///Users/user/development/safevoice/scripts/verify-stealth.mjs)):** A benchmarking tool that validates Web Crypto AES-256-GCM encryption/decryption round-trips, measures draft serialization time, verifies memory zeroing upon expiry, and tests arithmetic precision and secret PIN detection.
3. **Latency & DOM Inspection Suite:** High-resolution timer tests measuring disguise transition times and validating zero survivor text nodes across viewport resizes.
