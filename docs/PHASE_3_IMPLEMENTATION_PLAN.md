# Phase 3: Victim Reporting Flow Implementation Plan

Enhance and complete **Phase 3: Victim Reporting Flow** to deliver a trauma-informed, highly accessible, multi-step reporting experience for victims and witnesses.

---

## User Review Required

> [!IMPORTANT]
> - **Trauma-Informed Design**: The multi-step flow ensures victims are not overwhelmed by long single-scroll forms and can save audio notes directly.
> - **Privacy & Safety**: All evidence files and narrative content will display clear client-side encryption badges prior to server submission.

---

## Proposed Changes

### Components & UI

#### [NEW] ReportStepper.tsx (`components/feature/ReportStepper.tsx`)
- Visual step progress indicator (Step 1: Incident Type, Step 2: Details, Step 3: Evidence, Step 4: Review & Submit).
- Supports mobile & desktop layout with step completion checkmarks.

#### [NEW] IncidentTypeSelector.tsx (`components/feature/IncidentTypeSelector.tsx`)
- Card-based selection grid for incident categories: Domestic Violence, Child Abuse, Gender-Based Violence, Sexual Assault, Harassment, and Other.
- Accessible tap targets (44px+) with supportive icons and clear explanations.

#### [NEW] EvidenceUploader.tsx (`components/feature/EvidenceUploader.tsx`)
- Drag-and-drop upload zone supporting images, PDFs, videos, and recorded audio.
- Live file previews, file size validation (<50MB limit), and file removal.
- Seamless integration with client-side voice recording.

#### [MODIFY] ReportForm.tsx (`components/feature/ReportForm.tsx`)
- Upgrade from single-page scroll to 4-step interactive wizard.
- Step 1: Incident Type Selection via `IncidentTypeSelector`.
- Step 2: Details (Narrative, Date picker with max today, Ghana Region/District selector, integrated `VoiceRecorder`).
- Step 3: Evidence Upload via `EvidenceUploader`.
- Step 4: Contact & Consent options, summary review, and submission.
- Confirmation screen with monospace case number, copy button, and safety instructions.

#### [MODIFY] report.ts (`server/actions/report.ts`)
- Handle audio recordings sent from client.
- Parse Ghana region & district metadata.
- Return structured error codes and confirmation payload.

---

## Verification Plan

### Automated Tests & Builds
- Run `npm run build` to verify TypeScript compilation and Next.js route bundling.

### Manual Verification
- Test multi-step navigation (Next / Back buttons, step state preservation).
- Test audio recording and attachment to report form.
- Test file drag-and-drop uploader.
- Verify case creation and case reference code generation.
- Test Quick Escape button functionality during report flow.
