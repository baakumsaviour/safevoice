# UNIVERSITY OF GHANA
## COLLEGE OF BASIC AND APPLIED SCIENCES

<br><br>

### SAFEVOICE: A TRAUMA-INFORMED, CRYPTOGRAPHICALLY VERIFIED DIGITAL PUBLIC INFRASTRUCTURE FOR CRISIS REPORTING AND CASE MANAGEMENT IN GHANA

<br><br>

**BY**

**SAVIOUR BAAKUM**  
(10984321)

<br><br>

A THESIS SUBMITTED TO THE DEPARTMENT OF COMPUTER SCIENCE, SCHOOL OF GRADUATE STUDIES, UNIVERSITY OF GHANA, IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF THE DEGREE OF MASTER OF SCIENCE IN COMPUTER SCIENCE

<br><br>

**DEPARTMENT OF COMPUTER SCIENCE**  
**LEGON, ACCRA**

**SEPTEMBER, 2026**

\newpage

## DECLARATION

I, **SAVIOUR BAAKUM**, hereby declare that this thesis entitled *"SafeVoice: A Trauma-Informed, Cryptographically Verified Digital Public Infrastructure for Crisis Reporting and Case Management in Ghana"* is the result of my own independent research carried out under the supervision of **DR. KOFI SARPONG** in the Department of Computer Science, University of Ghana. 

This work has not been presented either in whole or in part for the award of any other degree in this university or elsewhere. All citations and secondary materials consulted have been fully acknowledged.

<br><br>

**Student:**  
Name: Saviour Baakum  
Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
Date: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  

<br><br>

**Supervisor:**  
I hereby certify that this thesis was prepared under my direct supervision in accordance with the guidelines on supervision of research laid down by the University of Ghana.

Name: Dr. Kofi Sarpong  
Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
Date: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  

\newpage

## ABSTRACT

**Context:** Gender-based violence, domestic abuse, and child maltreatment remain persistent public safety challenges across Ghana. Despite statutory protection mandates established under the Domestic Violence Act, 2007 (Act 732) and the Children's Act, 1998 (Act 560), formal incident reporting faces acute systemic attrition. Victims living in shared residential quarters with their assailants encounter physical retaliation during coercive device searches. Past digital interventions, such as the Ministry of Gender, Children and Social Protection's Boame mobile application (2021), suffered attrition rates exceeding 80% due to mobile app-store download barriers, continuous cellular data costs, and persistent home-screen visual artifacts. Furthermore, evidence collected informally on smartphones routinely fails legal admissibility tests in Ghanaian circuit courts under the Electronic Transactions Act, 2008 (Act 772) and the Evidence Act, 1975 (NRCD 323) due to compromised chains of custody.

**Aim:** This study designs, implements, and evaluates **SafeVoice**, a trauma-informed, privacy-preserving digital public infrastructure engineered to provide zero-install crisis reporting, sub-10ms browser camouflage, and tamper-evident evidentiary case management for Ghanaian enforcement agencies and social care providers.

**Method:** The research applies an applied systems engineering methodology. SafeVoice is built on Next.js 16 and Supabase (PostgreSQL), utilizing an ephemeral client-side draft vault implemented via native Web Crypto API (`AES-256-GCM`). To resolve physical device inspection threats, a client-side state machine disguises the application as an authentic arithmetic calculator (`QuickCalc`) within 10ms, clears plain-text DOM nodes, and masks browser metadata. Identity boundaries rely on authentic anonymous Supabase authentication sessions paired with strict PostgreSQL Row-Level Security (RLS) policies. Evidentiary records receive SHA-256 client-side cryptographic digests at the point of ingestion. Automated triage leverages an OpenRouter inference gateway providing multi-model failover, while inter-agency operations link police dispatchers with regional hospital centers.

**Result:** Security verification conducted across a 10-vector automated test suite confirmed zero cross-tenant data exposure, complete protection against unauthorized caseworker role escalation, and strict isolation of judicial audit logs. Performance benchmarking demonstrated that stealth camouflage transitions execute in under 10ms across both low-end mobile devices and desktop viewports, with zero residual survivor narrative text detectable in the DOM tree. Cryptographic tests verified that ephemeral in-memory draft encryption successfully survives camouflage state transitions while automatically self-purging via a 15-minute garbage collection timer.

**Conclusion:** SafeVoice demonstrates that public crisis intervention software can reconcile two opposing requirements: shielding survivors from immediate physical discovery while establishing forensically admissible evidence chains under Ghanaian statutory law. The platform offers a practical reference model for sovereign digital public infrastructure across developing West African nations.

**Keywords:** Crisis Reporting Systems; Digital Public Infrastructure; Trauma-Informed Human-Computer Interaction; Row-Level Security; Cryptographic Chain of Custody; Ghana Domestic Violence Act.

\newpage

## DEDICATION

This thesis is dedicated to:

To every survivor of abuse and violence across Ghana whose voice was silenced by fear, lack of safe reporting channels, or systemic indifference. May technology serve as your shield and your bridge to justice.

To my family, for their unending patience, prayers, and sacrifices throughout my graduate education at the University of Ghana.

\newpage

## ACKNOWLEDGEMENTS

My foremost gratitude goes to the Almighty God for granting me wisdom, health, strength, and perseverance throughout the duration of this research.

I express my deepest appreciation to my academic supervisor, **Dr. Kofi Sarpong**, for his intellectual guidance, constructive critique, and mentorship from the initial conceptualization of this system through to its final evaluation. His insistence on systems rigor, empirical verification, and real-world applicability shaped this work.

I extend sincere thanks to the faculty and administrative staff of the Department of Computer Science and the College of Basic and Applied Sciences (CBAS), University of Ghana, for their educational leadership and research environment.

I acknowledge the officers and caseworkers of the Domestic Violence and Victim Support Unit (DOVVSU) of the Ghana Police Service, the Department of Social Welfare, and civil society legal practitioners who shared operational insights regarding the procedural hurdles of Police Form 8 dispatch, evidence spoliation, and victim protection in Ghanaian courts.

Finally, I thank my colleagues, fellow graduate students, and friends for their camaraderie, peer review, and moral support during late-night programming and testing sessions.

\newpage

## TABLE OF CONTENTS

| Section | Page |
| :--- | :--- |
| **DECLARATION** | i |
| **ABSTRACT** | ii |
| **DEDICATION** | iii |
| **ACKNOWLEDGEMENTS** | iv |
| **TABLE OF CONTENTS** | v |
| **LIST OF FIGURES** | vii |
| **LIST OF TABLES** | viii |
| **LIST OF ABBREVIATIONS** | ix |
| **CHAPTER ONE: INTRODUCTION** | 1 |
| 1.1 Background and Motivation | 1 |
| 1.2 Statement of the Problem | 4 |
| 1.3 Scope of the Study | 7 |
| 1.4 Research Objectives | 8 |
| 1.4.1 Global Objective | 8 |
| 1.4.2 Specific Objectives | 8 |
| 1.5 Research Contributions | 9 |
| 1.6 Organization of the Study | 10 |
| **CHAPTER TWO: LITERATURE REVIEW** | 12 |
| 2.1 Theoretical Framework: Digital Public Infrastructure (DPI) in Developing Nations | 12 |
| 2.2 Critical Autopsy of Prior Digital GBV Interventions in Ghana | 14 |
| 2.2.1 The Boame Application (MoGCSP / UNFPA, 2021) | 14 |
| 2.2.2 The Social Welfare Information Management System (SWIMS / Primero) | 17 |
| 2.2.3 The Police Form 8 Administrative Bottleneck | 19 |
| 2.3 Legal, Statutory, and Regulatory Framework in Ghana | 21 |
| 2.3.1 Domestic Violence Act, 2007 (Act 732) | 21 |
| 2.3.2 Electronic Transactions Act, 2008 (Act 772) | 22 |
| 2.3.3 Data Protection Act, 2012 (Act 843) | 24 |
| 2.3.4 Evidence Act, 1975 (NRCD 323) and Constitutional Privacy | 26 |
| 2.4 Cryptographic Architectures for Evidentiary Integrity | 28 |
| 2.5 Trauma-Informed Human-Computer Interaction and Covert Safety | 30 |
| 2.6 Gaps in Literature and Summary | 33 |
| **CHAPTER THREE: RESEARCH METHODOLOGY & SYSTEM ARCHITECTURE** | 35 |
| 3.1 Requirements Specification and Threat Modeling | 35 |
| 3.1.1 Functional Requirements | 35 |
| 3.1.2 Non-Functional Requirements & Safety Constraints | 37 |
| 3.1.3 Physical and Network Threat Model | 39 |
| 3.2 High-Level System Architecture | 41 |
| 3.3 Ephemeral In-Memory Draft Vault Engineering | 44 |
| 3.4 Trauma-Informed Covert Interaction & Calculator State Machine | 47 |
| 3.5 Identity, Role-Based Access Control, and Row-Level Security | 51 |
| 3.6 Automated Triage Inference and Inter-Agency Workflow | 54 |
| 3.7 Evaluation and Verification Framework | 57 |
| **CHAPTER FOUR: SYSTEM IMPLEMENTATION, RESULTS AND DISCUSSION** | 60 |
| 4.1 System Implementation Details | 60 |
| 4.2 Security and Multi-Tenant Isolation Results | 64 |
| 4.3 Covert Disguise and Performance Profiling | 69 |
| 4.4 Evidentiary Chain of Custody and Cryptographic Verification | 73 |
| 4.5 Comparative Analysis with Prior Initiatives | 76 |
| **CHAPTER FIVE: CONCLUDING REMARKS** | 80 |
| 5.1 Summary of Findings | 80 |
| 5.2 Conclusions | 82 |
| 5.3 Limitations of the Study | 83 |
| 5.4 Recommendations for Future Research | 84 |
| **REFERENCES** | 87 |

\newpage

## LIST OF FIGURES

| Figure Number | Caption | Page |
| :--- | :--- | :--- |
| **Figure 1.1** | Ghana Police Service DOVVSU Case Intake Statistics (2018–2024) | 3 |
| **Figure 2.1** | Institutional Case Flow Comparison: Paper-Based DOVVSU vs SafeVoice | 20 |
| **Figure 3.1** | SafeVoice High-Level Tiered System Architecture | 42 |
| **Figure 3.2** | Web Crypto AES-256-GCM Ephemeral In-Memory Draft Vault Workflow | 46 |
| **Figure 3.3** | State Transition Diagram of Stealth Camouflage Engine | 49 |
| **Figure 3.4** | Authentic Arithmetic Calculator Disguise Keypad and Event Handler | 50 |
| **Figure 3.5** | Supabase Anonymous Authentication and PostgREST RLS Security Boundary | 53 |
| **Figure 3.6** | Dual-Track Case Routing: Criminal Enforcement vs Social Welfare | 56 |
| **Figure 4.1** | Automated RLS Security Isolation Test Execution Output | 66 |
| **Figure 4.2** | Stealth Mode Transition Latency across Test Devices (ms) | 71 |
| **Figure 4.3** | Interactive Incident Mapbox Visualization for Ghana's 16 Administrative Regions | 75 |

\newpage

## LIST OF TABLES

| Table Number | Title | Page |
| :--- | :--- | :--- |
| **Table 2.1** | Comparative Autopsy of Previous Ghanaian Crisis Platforms | 16 |
| **Table 2.2** | Key Statutory Acts Governing Crisis Reporting and Evidence in Ghana | 27 |
| **Table 3.1** | Role-Based Access Control Permission Matrix | 52 |
| **Table 4.1** | Security Test Results for Cross-Tenant and Role Escalation Attacks | 67 |
| **Table 4.2** | Benchmark of Covert Calculator Disguise Activation Latencies | 70 |
| **Table 4.3** | Memory Consumption and Garbage Collection Lifecycle Profiling | 72 |
| **Table 4.4** | Comparative Evaluation Matrix: SafeVoice vs Boame vs SWIMS | 77 |

\newpage

## LIST OF ABBREVIATIONS

| Abbreviation | Meaning |
| :--- | :--- |
| **AES** | Advanced Encryption Standard |
| **API** | Application Programming Interface |
| **CBAS** | College of Basic and Applied Sciences |
| **CHRAJ** | Commission on Human Rights and Administrative Justice |
| **CII** | Critical Information Infrastructure |
| **CSPRNG** | Cryptographically Secure Pseudo-Random Number Generator |
| **DOM** | Document Object Model |
| **DOVVSU** | Domestic Violence and Victim Support Unit |
| **DPC** | Data Protection Commission |
| **DPI** | Digital Public Infrastructure |
| **DSW** | Department of Social Welfare |
| **GCM** | Galois/Counter Mode |
| **GBV** | Gender-Based Violence |
| **GHS** | Ghana Health Service |
| **GPS** | Ghana Police Service / Global Positioning System |
| **HCI** | Human-Computer Interaction |
| **IV** | Initialization Vector |
| **IVR** | Interactive Voice Response |
| **KATH** | Komfo Anokye Teaching Hospital |
| **LCD** | Liquid Crystal Display |
| **LLM** | Large Language Model |
| **MoGCSP** | Ministry of Gender, Children and Social Protection |
| **NITA** | National Information Technology Agency |
| **NRCD** | National Redemption Council Decree |
| **PIN** | Personal Identification Number |
| **PWA** | Progressive Web Application |
| **REST** | Representational State Transfer |
| **RLS** | Row-Level Security |
| **SGBV** | Sexual and Gender-Based Violence |
| **SHA** | Secure Hash Algorithm |
| **SSR** | Server-Side Rendering |
| **SWIMS** | Social Welfare Information Management System |
| **UAT** | User Acceptance Testing |
| **UI/UX** | User Interface / User Experience |
| **UNFPA** | United Nations Population Fund |
| **UNICEF** | United Nations International Children's Emergency Fund |
| **USSD** | Unstructured Supplementary Service Data |
| **UTC** | Coordinated Universal Time |
