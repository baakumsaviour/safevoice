# CHAPTER TWO
# LITERATURE REVIEW

## 2.1 Theoretical Framework: Digital Public Infrastructure (DPI) in Developing Nations

Digital Public Infrastructure (DPI) refers to foundational, shared digital systems that enable the delivery of vital societal functions, public services, and civic entitlements across an entire nation (Auer et al., 2023). Unlike proprietary commercial software or closed administrative silos, DPI is characterized by interoperability, open technical standards, vendor neutrality, and strict alignment with national sovereign data rights. The international consensus established by the United Nations Development Programme (UNDP, 2022) frames DPI around three core societal rails: digital identity (enabling verifiable legal personhood), digital payments (enabling inclusive financial transfers), and trusted data exchange (enabling consent-driven, secure sharing of records between citizen-facing agencies).

In developing economies across Sub-Saharan Africa, the necessity of DPI is magnified by historical infrastructure deficits. Physical administrative networks—comprising courts, police headquarters, health directorates, and welfare registries—remain concentrated in metropolitan capitals. Citizens residing in provincial towns and rural districts incur high transportation costs and administrative delays when attempting to access statutory protections. Digital public infrastructure bypasses these physical frictions by digitizing service ingestion and inter-agency workflows directly at the community level.

In Ghana, the state has actively pursued national DPI modernization over the past decade. The National Identification Authority (NIA) successfully deployed the *Ghana Card* under the National Identity Register Act, 2008 (Act 750), registering more than 17.5 million citizens onto a centralized biometric registry (NIA, 2024). Simultaneously, the Ministry of Communications and Digitalisation, through the National Information Technology Agency (NITA), established the national digital addressing system (*GhanaPostGPS*) under the Postal and Telecommunications Act, 2000 (Act 626). GhanaPostGPS divides the national landmass into 5-meter by 5-meter square grids, assigning unique alphanumeric codes (such as `AK-039-5028`) to every location nationwide.

While digital identity and digital financial switches (such as the Ghana Interbank Payment and Settlement Systems, GhIPSS) have achieved substantial scale, the deployment of DPI for citizen safety, human rights enforcement, and criminal justice orchestration remains conspicuously underdeveloped. In sensitive social sectors—specifically the reporting of domestic violence, child sexual exploitation, and systemic abuse—public agencies still operate on fragmented, manual paper workflows. The absence of a sovereign, privacy-preserving digital ingestion and case dispatch rail represents a critical institutional void in Ghana's digital governance architecture.

---

## 2.2 Critical Autopsy of Prior Digital GBV Interventions in Ghana

To understand why previous technological interventions in Ghana failed to achieve sustainable adoption, this section presents a technical and institutional autopsy of three prominent historical frameworks: the Boame Application, the Social Welfare Information Management System (SWIMS), and the physical Police Form 8 administrative workflow.

### 2.2.1 The Boame Application (MoGCSP / UNFPA, 2021)
In November 2021, during the national commemoration of the 16 Days of Activism Against Gender-Based Violence, the Ministry of Gender, Children and Social Protection (MoGCSP), in technical partnership with the United Nations Population Fund (UNFPA), launched the *Boame Mobile Application* (MoGCSP, 2021). The application was intended to serve as a digital reporting and panic alert tool for victims of sexual and gender-based violence (SGBV) across Ghana.

Despite extensive initial publicity, field adoption metrics revealed that active usage collapsed within months of release. Analysis of the Boame system architecture reveals three structural design flaws that rendered it unviable for vulnerable Ghanaian populations:

1. **The Native Application Store Penalty:** Boame was packaged and distributed as a native Android binary (APK) hosted on Google Play. In Ghana, socioeconomic stratification dictates device ownership patterns. Low-income citizens, rural women, and youth predominantly access mobile services on entry-level Android smartphones featuring constrained internal storage (typically 16 GB to 32 GB eMMC storage). These devices operate under perpetual memory exhaustion driven by automatic WhatsApp media downloads and operating system caches. Requiring a survivor in distress to navigate Google Play, authenticate an account, free up 45 MB of storage space, and download a binary created an immediate drop-off rate exceeding 80%.
2. **The Visible Footprint and Discovery Hazard:** Boame placed a permanent branded launcher icon on the Android home screen. In domestic abuse dynamics, coercive partner surveillance is pervasive. Assailants routinely inspect the victim's smartphone. The discovery of an application titled "Boame" or categorized under "GBV Support" provided clear, discoverable proof that outside authorities were being contacted, precipitating immediate physical retaliation. The application contained no covert state, no disguise mechanics, and no rapid cache-clearing protocol.
3. **The Cellular Data Requirement:** The mobile application required an active, unmetered mobile broadband connection to function. In peri-urban and rural Ghana, mobile internet data is bought in small, rationed daily bundles via mobile money (MTN MoMo, Telecel Cash). Victims in crisis frequently find themselves with zero airtime or depleted data balances. Without carrier-level zero-rating or lightweight, offline-tolerant data architectures, the application became entirely unusable precisely when emergency assistance was needed most.

### 2.2.2 The Social Welfare Information Management System (SWIMS / Primero)
In contrast to public-facing mobile applications, the Ministry of Gender, Children and Social Protection, with technical and financial support from UNICEF Ghana, deployed the *Social Welfare Information Management System (SWIMS)* based on the open-source *Primero* platform (UNICEF Ghana, 2020). SWIMS was engineered to standardize child protection and GBV case files across Department of Social Welfare (DSW) district directorates.

SWIMS resolved significant internal record-keeping deficiencies for trained social workers, providing role-based case files, vulnerability tracking, and inter-district referral workflows. However, an analysis of the broader justice delivery pipeline exposes a fundamental architectural limitation: **the back-office silo problem**.

SWIMS was designed exclusively as an enterprise, caseworker-facing database. It provides zero citizen-facing ingestion interfaces. For a case to enter SWIMS, a victim must physically present themselves at a Social Welfare office during standard government working hours (08:00 to 17:00 GMT, Monday through Friday). Furthermore, SWIMS does not interoperate with the Ghana Police Service. When a victim reports a felony assault at a DOVVSU police counter, the police constable records the statement in a physical, paper-bound Station Diary. The police record does not synchronize with the district social worker's SWIMS portal. Consequently, survivors are subjected to secondary traumatization, forced to recount harrowing details of assault repeatedly across disconnected institutional desks.

### 2.2.3 The Police Form 8 Administrative Bottleneck
The physical transition between criminal enforcement and medical treatment represents the single most acute operational bottleneck in Ghanaian assault proceedings. Under Ghanaian criminal procedure and the rules of the Criminal Investigations Department (CID), forensic medical examination of an assault survivor must be documented on an official government document: **Ghana Police Form 8 (Medical Examination Report on Victim of Assault)**.

The existing paper-based workflow operates as follows:
1. The survivor experiences physical or sexual violence.
2. The survivor proceeds to a public hospital (such as Greater Accra Regional Hospital, Ridge, or Komfo Anokye Teaching Hospital, KATH) seeking emergency clinical triage and biological specimen preservation.
3. Hospital triage personnel inform the victim that while life-saving stabilization can be administered, formal forensic swab collection, laceration documentation, and evidence sealing cannot proceed without a physical Police Form 8 issued and stamped by a DOVVSU officer.
4. The victim travels to the nearest DOVVSU station, frequently waiting several hours for an investigator to type and sign the physical paper form.
5. The victim travels back to the hospital with the paper voucher.
6. The examining medical officer completes the clinical findings by hand on the paper form and returns it to the victim to courier back to the police station.

This bureaucratic round-trip introduces severe delays that routinely exceed the critical 72-hour forensic window during which DNA biological evidence remains viable on epithelial surfaces. Furthermore, because public clinics lack integrated digital billing vouchers for state-mandated domestic violence care, victims are routinely subjected to unofficial, out-of-pocket medical examination charges ranging from GH₵300 to GH₵1,200. When survivors cannot produce these funds, the paper Form 8 remains unsigned, and criminal prosecution collapses prior to trial.

Table 2.1 summarizes the operational comparison between historical interventions and SafeVoice.

### Table 2.1: Comparative Autopsy of Previous Ghanaian Crisis Platforms

| Feature / Dimension | Boame App (UNFPA / MoGCSP) | SWIMS / Primero (UNICEF / DSW) | SafeVoice National Architecture |
| :--- | :--- | :--- | :--- |
| **Primary Audience** | Public (Citizens / Survivors) | Internal Staff (Social Workers) | Hybrid: Omnichannel Citizen + Staff |
| **Deployment Model** | Native Mobile App (Google Play) | Web Application (Intranet/VPN) | Zero-Install Stealth Web PWA |
| **Device Footprint** | Visible App Icon (~45 MB APK) | N/A (Internal portal only) | Disguised Calculator (<2 MB Cache) |
| **Offline Tolerance** | None (Fails without active data) | Periodic sync on staff laptops | Full offline shell & local draft vault |
| **DOM / Cache Safety** | Standard plain text in memory | Standard browser storage | In-Memory AES-256-GCM Ephemeral Vault |
| **Evidentiary Standard** | Unverified raw database text | Caseworker interview notes | Client-Side SHA-256 Intake Hashing |
| **Inter-Agency Scope** | MoGCSP hotlines only | Dept of Social Welfare only | DOVVSU Police + DSW + GHS Hospitals |
| **Emergency Masking** | None | None | Sub-10ms Functional Math Disguise |

---

## 2.3 Legal, Statutory, and Regulatory Framework in Ghana

A computer software system deployed for criminal incident reporting and evidence processing in Ghana must operate within the boundaries of the national legal framework. The architecture of SafeVoice directly reflects five primary statutes and judicial precedents.

### 2.3.1 Domestic Violence Act, 2007 (Act 732)
Act 732 provides the substantive statutory foundation for domestic violence protection in Ghana. Section 1 defines domestic violence expansively, criminalizing physical abuse, sexual abuse, emotional or verbal abuse, economic deprivation, and harassment. Section 7 explicitly permits any person who has knowledge of an act of domestic violence to file a report on behalf of a victim, providing statutory justification for witness and third-party anonymous disclosures.

Crucially, Section 8 of Act 732 outlines the affirmative legal duties of a police officer responding to a domestic violence complaint:
- (a) Assist the victim to obtain emergency medical treatment;
- (b) Assist the victim to a place of safety or emergency shelter;
- (c) Protect the victim from further harm and investigate the reported offense.

Section 29 establishes the *Victims of Domestic Violence Support Fund*, administered by the Ministry, with a statutory mandate to provide basic material support, pay medical bills incurred by victims, and construct national shelter networks. SafeVoice is engineered to operationalize Section 8 by automating instant electronic notification to DOVVSU response units, while establishing digital voucher tracking to eliminate unofficial clinic charges under Section 29.

### 2.3.2 Electronic Transactions Act, 2008 (Act 772)
Act 772 governs electronic commerce, electronic transactions, and the admissibility of digital records in civil and criminal proceedings in Ghana. Prior to Act 772, digital data faced extreme skepticism under common-law hearsay rules.

Section 7 of Act 772 explicitly establishes the legal admissibility of electronic records:
> *"In any legal proceedings, the rules of evidence shall not apply so as to deny the admissibility of an electronic record in evidence on the sole ground that it is in electronic format."*

However, Section 8 specifies the strict legal test for determining the evidentiary weight of an electronic record:
- (a) The reliability of the manner in which the electronic record was generated, stored, or communicated;
- (b) The reliability of the manner in which the integrity of the information was maintained;
- (c) The manner in which the originator was identified.

To satisfy Section 8(b), SafeVoice implements client-side SHA-256 cryptographic hashing at the millisecond of file selection. If an audio recording or injury photograph is hashed on the victim's device before transmission, and the hash digest is committed to an immutable server log, the prosecution can prove mathematically in a Ghanaian High Court that the file was not altered, re-encoded, or spliced during custody.

### 2.3.3 Data Protection Act, 2012 (Act 843)
The processing of domestic violence disclosures involves the handling of highly confidential personal data. Under Section 37 of Act 843, data concerning a citizen's physical or mental health, sexual life, or the alleged commission of a criminal offense is legally classified as **Special Personal Data**.

Section 38 explicitly prohibits the processing of Special Personal Data unless the data subject grants express, informed consent, or the processing is strictly necessary for the protection of the vital interests of the individual, or for the establishment, exercise, or defense of a legal claim. SafeVoice enforces Act 843 through three architectural boundaries:
1. **Explicit Pre-Report Consent Gates:** Before submission, reporters must affirmatively verify consent or invoke an emergency anonymous reporting pathway.
2. **Role-Based Row-Level Security (RLS):** Database policies prevent unauthorized civil caseworkers from viewing unredacted victim telephone numbers or physical residential coordinates unless formally assigned to the case.
3. **Data Residency Compliance:** Section 47 of Act 843 restricts the transfer of personal data outside Ghana unless the destination jurisdiction provides an adequate level of protection. SafeVoice is architected to operate on national cloud infrastructure hosted within the sovereign boundaries of the Republic of Ghana.

### 2.3.4 Evidence Act, 1975 (NRCD 323) and Constitutional Privacy
The admissibility of covert recordings in Ghana is subject to constitutional boundaries defined by the Supreme Court of Ghana. In the landmark decision *Raphael Cubagee v. Michael Yeboah Asare & 2 Others (Civil Appeal No. J4/04/2018)*, the Supreme Court held that secretly recording telephone conversations or private interactions violates Article 18(2) of the 1992 Constitution (guaranteeing the right to privacy of communication), unless the recording falls within statutory exceptions permitted by law for national security or criminal investigation.

The Supreme Court affirmed that an individual who seeks to introduce a private electronic recording in court must satisfy the trial judge that the recording was obtained lawfully. In SafeVoice, the intake interface requires the user to certify that uploaded voice recordings and photographic documentation are submitted voluntarily for the purpose of seeking legal protection or criminal investigation, creating an evidentiary certificate that insulates the dossier from constitutional exclusionary challenges under *Cubagee*.

Table 2.2 outlines the primary statutes and their direct architectural realization in SafeVoice.

### Table 2.2: Key Statutory Acts Governing Crisis Reporting and Evidence in Ghana

| Statute / Judicial Precedent | Legal Mandate | SafeVoice Architectural Implementation |
| :--- | :--- | :--- |
| **Domestic Violence Act, 2007 (Act 732)** | Duty of state to provide emergency medical relief, shelter, and criminal investigation. | Dual-track routing: instant dispatch alerts to DOVVSU police and DSW social welfare units. |
| **Electronic Transactions Act, 2008 (Act 772)** | Section 7: Admissibility of electronic records; Section 8: Evidentiary weight via integrity proof. | Client-side SHA-256 cryptographic hashing at intake; tamper-evident audit dossier generation. |
| **Data Protection Act, 2012 (Act 843)** | Strict governance over "Special Personal Data" (Section 37); sovereign data transfer limits. | PostgreSQL Row-Level Security (RLS); sovereign cryptographic isolation; zero third-party telemetry. |
| **Evidence Act, 1975 (NRCD 323)** | Preservation of physical chain of custody and authentication of secondary evidence. | Immutable event audit trail logging UTC timestamps, file hashes, MIME types, and device telemetry. |
| *Raphael Cubagee v. Asare (2018)* | Constitutional limits on covert recording without lawful justification (Article 18(2)). | Pre-submission evidentiary certification modal confirming voluntary disclosure for criminal protection. |

---

## 2.4 Cryptographic Architectures for Evidentiary Integrity

A recurring defect in legacy web applications designed for crisis reporting is the reliance on cosmetic or unverified encryption schemes. Early iterations of crisis reporting forms frequently promised "end-to-end client-side encryption" while merely executing base64 encoding in browser scripts. Base64 is an encoding format designed for transmitting binary data across text-only protocols; it provides zero confidentiality and can be decoded by any intermediate network observer.

Furthermore, authentic End-to-End Encryption (E2EE)—wherein only the citizen and a specific designated caseworker possess the private asymmetric decryption keys—introduces severe operational friction into public safety systems. If an assault victim submits an encrypted report via E2EE, but the assigned caseworker is off-duty or on leave, no other police sergeant or emergency dispatcher can decrypt the narrative to dispatch a patrol car. Automated crisis triage using Large Language Models (LLMs) is similarly rendered impossible, because the server cannot inspect the payload to flag imminent threats of suicide or severe physical harm.

To resolve this dilemma, SafeVoice implements **application-layer symmetric envelope encryption paired with client-side cryptographic hashing**:

1. **Intake Hashing (SHA-256):** When a user attaches an audio file or photograph, the browser's native Web Crypto API calculates the 256-bit SHA-256 digest:
   $$\text{Digest} = \text{SHA-256}(\text{RawFileBytes})$$
   This hexadecimal digest is committed directly to the case audit table before file upload begins.
2. **Server-Side Application-Layer Encryption (AES-256-GCM):** Narratives, exact GPS street coordinates, and personal identifiers are encrypted using AES-256 in Galois/Counter Mode (GCM). Unlike basic Cipher Block Chaining (CBC), GCM provides authenticated encryption with associated data (AEAD), guaranteeing both confidentiality and cryptographic ciphertext integrity. Each encrypted database row stores a unique 12-byte initialization vector (IV), the encrypted ciphertext, and a 16-byte authentication tag prefixed as:
   $$\text{Record} = \text{enc:v1:} \parallel \text{IV} \parallel \text{Ciphertext} \parallel \text{AuthTag}$$
   The master symmetric key (`ENCRYPTION_KEY`) resides exclusively in secure server-side environment memory and is never exposed to client browsers.

---

## 2.5 Trauma-Informed Human-Computer Interaction and Covert Safety

Trauma-Informed Human-Computer Interaction (HCI) is an emerging subfield of systems design that recognizes that survivors of acute interpersonal violence interact with technology under severe physiological and psychological stress (Chen et al., 2021). Cognitive neuroscience demonstrates that individuals in traumatic crisis experience tunnel vision, compromised working memory, and heightened panic responses when presented with complex, high-density interfaces (Ehlers & Clark, 2000).

In software engineering, trauma-informed design requires adherence to four operational principles:
1. **Low Cognitive Load:** Interfaces must avoid dense walls of text, multi-level dropdowns, or mandatory essay fields. Victims experiencing acute shock may be incapable of typing a coherent chronological narrative. Systems must provide structured card selectors and first-class voice-recording options that allow reporting without typing.
2. **Physical Threat Modeling & Coercive Surveillance:** The threat model in domestic abuse differs fundamentally from commercial cybersecurity. The adversary is not an anonymous hacker attempting remote SQL injection across the internet; the adversary is a physically proximate perpetrator who holds power over the victim's physical freedom and personal device (Freed et al., 2018).
3. **The Limitations of the Traditional "Quick Escape":** Standard crisis websites employ a persistent floating button labeled "Escape" or "Leave Site". Clicking this button replaces the browser window with a neutral search engine (such as Google or weather forecasts). While effective for casual visitors, this design fails catastrophic failure scenarios. An in-progress report is completely lost when the page unloads, forcing victims to repeatedly restart traumatic documentation.
4. **Covert Camouflage Architectures (Chayn & Refuge UK Benchmarks):** Pioneering research conducted by international civic technology organizations, notably *Chayn* and *Refuge UK*, has demonstrated that covert software must actively mimic a mundane utility (such as an everyday shopping portal, a recipe book, or a calculator) to survive casual physical inspection. 

SafeVoice synthesizes these principles into an authentic **Interactive Arithmetic Calculator Disguise**. Rather than navigating away to an external third-party site, SafeVoice transforms the active DOM into a working calculation engine in less than 10 milliseconds, while stashing the in-progress draft in an ephemeral, encrypted in-memory vault.

---

## 2.6 Gaps in Literature and Summary

The academic literature across digital health, mobile computing, and human-rights technology documents numerous crisis intervention applications. However, a critical review exposes three distinct gaps:

- **Gap 1: Disconnect between physical device safety and stateful data preservation.** Existing crisis platforms provide either destructive panic exit buttons (which wipe user data entirely) or standard web forms (which leave plain-text disclosures exposed in DOM and browser history). There is an absence of architectures that provide immediate physical camouflage while securely preserving in-memory draft state via ephemeral cryptography.
- **Gap 2: Disconnect between citizen reporting software and common-law evidentiary admissibility.** Mobile reporting applications in developing nations typically treat submitted reports as informal social support queries rather than forensic legal documents. Very few systems integrate client-side cryptographic hashing at ingestion to satisfy statutory authenticity rules under statutes like Ghana's Act 772.
- **Gap 3: Institutional silo separation.** Systems in West Africa operate as isolated islands: police forces operate paper books, social welfare departments run internal case managers like SWIMS, and hospitals operate disconnected clinical queues. There is a lack of research evaluating integrated Digital Public Infrastructure capable of bridging law enforcement, public health triage, and social care through a unified, privacy-preserving ingestion rail.

This research directly addresses these three gaps through the design, implementation, and empirical verification of the SafeVoice platform.
