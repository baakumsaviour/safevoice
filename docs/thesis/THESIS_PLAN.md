# University of Ghana — Final Year Thesis Implementation Plan
## Department of Computer Science | College of Basic and Applied Sciences

**Candidate:** Saviour Baakum  
**Supervisor:** Dr. Kofi Sarpong  
**Project Title:** SafeVoice: A Trauma-Informed, Cryptographically Verified Digital Public Infrastructure for Crisis Reporting and Case Management in Ghana  
**Document Location:** `docs/thesis/THESIS_PLAN.md`  
**Writing Standard:** Academic Computer Science Thesis conforming strictly to the [Humanizer](https://github.com/blader/humanizer) 25-Pattern Anti-AI Scale  

---

## 1. Academic & Institutional Alignment

This thesis fulfills the final-year research and documentation requirements for the **Department of Computer Science, University of Ghana, Legon**.

### Supervisory & Candidate Details
* **University:** University of Ghana
* **College:** College of Basic and Applied Sciences (CBAS)
* **Department:** Department of Computer Science
* **Student Name:** Saviour Baakum
* **Supervisor:** Dr. Kofi Sarpong
* **Submission Date:** Academic Year 2025/2026

### Thesis Title
> **SafeVoice: A Trauma-Informed, Cryptographically Verified Digital Public Infrastructure for Crisis Reporting and Case Management in Ghana**

---

## 2. Writing Discipline: Humanizer Anti-AI Protocol

All chapters will be authored and audited against the 25-pattern Humanizer criteria (`.agents/skills/humanizer/SKILL.md`):

1. **Zero Artificial Staging**:
   - No *"Not only X, but also Y"* or *"It's not X, it's Y"* constructions. State technical claims directly.
   - No dramatic one-line closers (*"That is the real victory."*, *"This changes everything."*).
   - No rhetorical run-ups (*"Let's dive in"*, *"It is crucial to note that"*).
   - No pseudo-philosophical platitudes (*"At its core..."*, *"In the fast-evolving digital landscape..."*).
2. **Organic Sentence Rhythm**:
   - Eliminate forced triads (*"safe, scalable, and robust"*).
   - Strict limit on em-dashes and repetitive connective formulas.
   - Natural alternation between short factual sentences and technical explanations.
3. **No Vocabulary Inflation**:
   - Ban stock AI words: *delve, testament, tapestry, pivotal, harness, beacon, bolster, foster, landscape, paramount, revolutionize*.
   - Use precise systems terminology: latency, cryptographic primitive, AES-256-GCM, PostgREST row-level security, hash digest, round-trip time.
4. **Concrete Grounding**:
   - Cite specific statutory Ghanaian laws: Domestic Violence Act, 2007 (Act 732), Electronic Transactions Act, 2008 (Act 772), Data Protection Act, 2012 (Act 843), Evidence Act, 1975 (NRCD 323).
   - Include real empirical data: 10/10 RLS isolation assertions, sub-10ms stealth transition times, 12-character base-32 reference codes.

---

## 3. Phased Execution Roadmap

The thesis documentation is executed in **7 structured phases**. Each phase produces a dedicated chapter markdown file in `docs/thesis/`, followed by final compilation into `docs/thesis/COMPLETE_THESIS.md`.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      THESIS WRITING & VERIFICATION PHASES                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Phase 1: Front Matter & Abstract (Declaration, Aim, Method, Results)       │
│     │                                                                       │
│     ▼                                                                       │
│  Phase 2: Chapter One — Introduction (Motivation, Problem, Scope, Goals)    │
│     │                                                                       │
│     ▼                                                                       │
│  Phase 3: Chapter Two — Literature Review (DPI, Ghana Acts, Forensic Chain) │
│     │                                                                       │
│     ▼                                                                       │
│  Phase 4: Chapter Three — Methodology & System Architecture (AES, Stealth)  │
│     │                                                                       │
│     ▼                                                                       │
│  Phase 5: Chapter Four — Implementation & Experimental Results (RLS Tests)  │
│     │                                                                       │
│     ▼                                                                       │
│  Phase 6: Chapter Five — Concluding Remarks & Academic References           │
│     │                                                                       │
│     ▼                                                                       │
│  Phase 7: Humanizer Audit Pass & Complete Thesis Compilation                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 1: Front Matter & Executive Structure
**Target File:** `docs/thesis/00_FRONT_MATTER.md`
* Title Page with official University of Ghana, CBAS, and Computer Science Department formatting.
* Formal Candidate Declaration & Supervisor Certification blocks.
* Structured Academic Abstract:
  - **Context:** Pervasiveness of domestic and gender-based abuse in Ghana and limitations of physical reporting.
  - **Aim:** Build a zero-knowledge, trauma-informed digital infrastructure with instant stealth disguise and court-admissible audit logs.
  - **Method:** Next.js 16 App Router, Web Crypto AES-256-GCM in-memory stashing, Supabase multi-tenant RLS, and OpenRouter AI triage.
  - **Results:** 10/10 automated isolation passes, sub-10ms disguise switch to functional calculator, and tamper-evident SHA-256 evidence logging.
  - **Conclusion:** Proves digital public infrastructure can balance evidentiary rigor with physical survivor safety.
  - **Keywords:** Crisis Reporting; Digital Public Infrastructure; Trauma-Informed UX; Applied Cryptography; Row-Level Security; Ghana.
* Dedication and Acknowledgements (recognizing the supervisor, department, and social welfare practitioners).
* Table of Contents, List of Figures, List of Tables, List of Abbreviations.

---

### Phase 2: Chapter One — Introduction
**Target File:** `docs/thesis/01_CHAPTER_ONE_INTRODUCTION.md`
* **1.1 Background and Motivation:** Social context of GBV and child protection in Ghana; statutory duties under Act 732; role of digital technologies in overcoming stigmatization and physical intimidation.
* **1.2 Statement of the Problem:** High attrition rates in reporting; physical retaliation risk during device searches; paper-based DOVVSU Police Form 8 delays; evidence inadmissibility under Act 772 due to broken chain of custody.
* **1.3 Scope of the Study:** Development of the SafeVoice web application and PWA; automated triage assistant; caseworker portal; evaluation of cryptographic and architectural boundaries.
* **1.4 Research Objectives:**
  - *1.4.1 Global Objective:* Design, build, and evaluate an institutional-grade crisis reporting and case management platform tailored to Ghanaian legal and infrastructural realities.
  - *1.4.2 Specific Objectives:*
    1. Implement a client-side in-memory encrypted vault and functional calculator disguise (<10ms switch).
    2. Enforce strict multi-tenant Row-Level Security preventing cross-victim and staff data leakage.
    3. Construct a tamper-evident evidentiary hashing workflow satisfying the Evidence Act, 1975.
    4. Provide automated first-responder AI triage with fallback to human caseworkers.
* **1.5 Research Contributions:** Practical software engineering and security contributions to Ghanaian Digital Public Infrastructure (DPI).
* **1.6 Organization of the Study:** Outline of subsequent chapters.

---

### Phase 3: Chapter Two — Literature Review
**Target File:** `docs/thesis/02_CHAPTER_TWO_LITERATURE_REVIEW.md`
* **2.1 Digital Public Infrastructure (DPI) in Developing Nations:** Principles of sovereign digital infrastructure in West Africa.
* **2.2 Critical Autopsy of Prior Ghanaian Interventions:**
  - *The Boame App (MoGCSP / UNFPA, 2021):* Technical reasons for failure (app store storage penalty, lack of stealth, data cost barrier).
  - *SWIMS / Primero (MoGCSP / UNICEF):* Back-office silo problem and absence of public-facing crisis intake.
  - *Police Form 8 Administrative Bottleneck:* Medical evidence delays and unofficial clinic fee exploitation.
* **2.3 Ghanaian Legal, Policy, and Regulatory Architecture:**
  - Domestic Violence Act, 2007 (Act 732).
  - Electronic Transactions Act, 2008 (Act 772) on electronic evidence and signatures.
  - Data Protection Act, 2012 (Act 843) on Special Category Personal Data.
  - Cybersecurity Act, 2020 (Act 1038) on Critical Information Infrastructure.
  - Evidence Act, 1975 (NRCD 323) and constitutional privacy precedents (*Raphael Cubagee v. Michael Yeboah Asare*).
* **2.4 Cryptographic Frameworks for Evidentiary Integrity:** Application-layer AES-256-GCM vs base64 fallacies; SHA-256 digests; immutable audit logs.
* **2.5 Trauma-Informed Human-Computer Interaction (HCI):** Physical threat models; coercive device checks; covert interface design (Chayn, Refuge UK benchmarks).
* **2.6 Summary of Literature and Research Gaps:** Matrix of existing systems vs SafeVoice requirements.

---

### Phase 4: Chapter Three — System Analysis, Architecture & Methodology
**Target File:** `docs/thesis/03_CHAPTER_THREE_METHODOLOGY.md`
* **3.1 System Requirements Analysis:** Functional requirements (intake, audio note capture, case tracking, caseworker dispatch) and non-functional requirements (zero-DOM-leakage, latency, offline resilience).
* **3.2 Architectural Design:** High-level tiered architecture (Next.js 16 App Router, Supabase Backend, Vercel Edge, OpenRouter AI Gateway).
* **3.3 Trauma-Informed Covert Interaction Engineering:**
  - State machine of `StealthContext`.
  - Functional arithmetic engine specifications for `CalculatorDisguise`.
  - Secret sequence listeners (`1984 =`, `0000 =`, header long-press).
* **3.4 Ephemeral Cryptographic In-Memory Draft Vault:**
  - Web Crypto API `AES-GCM` key generation and symmetric payload encryption.
  - Zero-DOM-leakage proof: removing survivor disclosure text from HTML nodes.
  - 15-minute garbage collection timer architecture.
* **3.5 Sovereign Identity & Access Control Architecture:**
  - Anonymous Supabase auth integration for realtime websocket communication without password barriers.
  - Role-based Server Action authorization guard (`server/auth.ts`).
  - Database Row-Level Security policies.
* **3.6 Experimental & Verification Framework:** Test harness specification for automated isolation checks, arithmetic precision, and latency profiling.

---

### Phase 5: Chapter Four — Implementation, Experimental Results & Discussion
**Target File:** `docs/thesis/04_CHAPTER_FOUR_IMPLEMENTATION_AND_RESULTS.md`
* **4.1 Implementation Overview:** Codebase composition, directory layout, Next.js 16 Turbopack build pipeline, PWA service worker caching.
* **4.2 Security & Isolation Evaluation:**
  - Empirical results from `scripts/verify-rls.mjs`: 10/10 automated tests passing against cloud database.
  - Analysis of attack vectors: direct ID lookup, unauthorized message posting, caseworker impersonation, privilege escalation, audit forging.
* **4.3 Performance & Usability Profiling:**
  - Stealth disguise activation latency benchmarks (<10ms).
  - Draft vault memory overhead and garbage collection verification.
  - Arithmetic engine precision and keyboard event dispatch latency.
* **4.4 Evidentiary Admissibility Evaluation:**
  - SHA-256 hashing verification at intake point.
  - Compliance with Act 772 section 7 standards for electronic admissibility.
* **4.5 Comparative Discussion:** Empirical comparison table against Boame and SWIMS across 8 operational criteria.

---

### Phase 6: Chapter Five — Concluding Remarks & References
**Target File:** `docs/thesis/05_CHAPTER_FIVE_CONCLUSION.md` & `docs/thesis/06_REFERENCES.md`
* **5.1 Summary of Findings:** Synthesis of engineering and security outcomes.
* **5.2 Conclusions:** How SafeVoice demonstrates feasible digital sovereign protection in Ghana.
* **5.3 Limitations of the Study:** Dependency on browser Web Crypto; USSD carrier integration awaiting commercial aggregators.
* **5.4 Recommendations & Future Directions:**
  - Integration with GhanaPostGPS 5m x 5m API.
  - National Data Centre (NITA) on-premise migration.
  - Digital Form 8 deployment across GHS regional hospitals (Korle-Bu, KATH, Ridge, Tamale).
* **References:** Academic bibliography formatted in APA/IEEE containing statutory laws, Supreme Court precedents, computer science and cybersecurity literature.

---

### Phase 7: Complete Compilation & Humanizer Quality Pass
**Target File:** `docs/thesis/COMPLETE_THESIS.md`
* Merge all sections into a single, cohesive, publication-grade thesis document.
* Full 25-rule Humanizer review ensuring natural, varied academic cadence free of generative AI markers.
* Final commit and git-ops push to repository.
