# SafeVoice Implementation Roadmap

## Phase 1: Core Infrastructure (CURRENT - IN PROGRESS)
**Goal:** Simple, user-friendly interface with basic auth

### Completed ✓
- [x] Landing page redesign - image-heavy, simple, trust-focused
- [x] Login page - simplified, user-friendly
- [x] Signup page - clean registration flow
- [x] Design system - Vodafone-inspired, Tailwind CSS
- [x] Navigation restructure - removed admin/dashboard from public nav
- [x] Hero images generated - support, security, confidentiality

### In Progress 🔄
- [x] Supabase auth integration setup
- [x] User roles and RBAC middleware
- [x] Session management
- [x] Error handling and validation

### Next (Priority)
- [x] Create admin dashboard (`/admin`)
- [x] Create admin login route (`/auth/admin-login` with unique link)
- [x] Create caseworker protected routes
- [x] Database schema setup

---

## Phase 2: Authentication & Authorization (COMPLETE ✓)
**Goal:** Secure multi-role access system

### Tasks
1. **Set up Supabase Auth**
   - User signup/login with email/password
   - Session tokens in httpOnly cookies
   - Password hashing (built-in Supabase)

2. **Implement RBAC**
   ```
   Roles:
   - user (victim/reporter)
   - caseworker (support staff)
   - admin (system admin)
   ```

3. **Protected Routes**
   - `/report` - public for all
   - `/dashboard` - caseworker only
   - `/admin` - admin only
   - `/auth/admin-login` - unique admin route

4. **Middleware**
   ```typescript
   // Check auth state on every request
   // Redirect based on role
   // Protect sensitive routes
   ```

### Success Criteria
- User can signup and login
- Admin can login with email: sbaakum@gmail.com, password: 00000000
- Routes are properly protected
- Session persists across page reloads

---

## Phase 3: Victim Reporting Flow (CURRENT - IN PROGRESS)
**Goal:** Simple, accessible reporting experience

### Pages to Create
1. **`/report` - Landing**
   - Hero image showing support
   - Simple "Start Report" button
   - "View my reports" link (if logged in)
   - Emergency hotlines
   - "You're not alone" messaging

2. **`/report/incident` - Type Selection**
   - 5 card buttons:
     - Domestic Violence
     - Child Abuse
     - Sexual Assault
     - Trafficking
     - Other
   - Simple, large, tap-friendly

3. **`/report/details` - Basic Info**
   - Date picker (no future dates)
   - Region dropdown (Ghana districts)
   - Optional description textarea
   - Optional: voice recording button
   - Optional: contact info toggle

4. **`/report/evidence` - Upload**
   - Drag-and-drop zone
   - File type validation (jpg, png, pdf, mp4, mp3)
   - Max 50MB total
   - Encryption indicator
   - Optional step

5. **`/report/confirmation` - Review**
   - Summary (no sensitive data)
   - Reference code (bold, monospace)
   - "Save this code" messaging
   - Submit button
   - Success page with case number

### Components
- `QuickEscapeButton` - Already exists, improve styling
- `VoiceRecorder` - Already exists, refine UX
- `EvidenceUploader` - Create new
- `ReportStepper` - Create new

### Success Criteria
- User can complete report in <3 minutes
- All data encrypted before storage
- Reference code generated and displayed
- Offline access to resources directory

---

## Phase 4: Admin Dashboard (`/admin`)
**Goal:** System management and overview

### Pages to Create
1. **`/admin` - Overview**
   - Statistics cards:
     - Total cases reported
     - Cases awaiting triage
     - Urgent cases
     - Resolved today
   - Recent cases list
   - Quick actions

2. **`/admin/users` - User Management**
   - List all users
   - Create new caseworker
   - Assign regions
   - Deactivate users
   - View user history

3. **`/admin/cases` - Case Management**
   - Filter/search cases
   - Assign to caseworker
   - Update status
   - View case details
   - Export reports

4. **`/admin/settings` - Configuration**
   - Organization info
   - Regions setup
   - Notification preferences
   - API keys
   - Backup settings

### Success Criteria
- Admin can login with provided credentials
- Dashboard shows accurate statistics
- Can manage users and cases
- Clear, admin-focused interface

---

## Phase 5: Caseworker Dashboard (ENHANCE EXISTING)
**Goal:** Case management and victim support

### Improvements Needed
1. **Triage Queue** (`/dashboard`)
   - Show new cases only
   - Urgent priority highlighting
   - Quick assign functionality
   - Search by reference code

2. **Case Detail** (`/dashboard/case/[id]`)
   - Decrypt and display report
   - Show uploaded evidence
   - Internal notes section
   - Secure messaging with victim
   - Update status workflow

3. **My Cases** (`/dashboard/assigned`)
   - Filter by status
   - Quick actions
   - Unread messages badge

4. **Messaging** (in case detail)
   - iMessage-style chat
   - End-to-end encrypted
   - Read receipts
   - Notification badge

### Components to Create
- `CaseCard` - Already exists, enhance
- `SecureChat` - Create new
- `EvidenceViewer` - Create new
- `CaseNoteEditor` - Create new

### Success Criteria
- Caseworker can view assigned cases
- Can message victims securely
- Can update case status
- Can add internal notes

---

## Phase 6: Security & Encryption
**Goal:** End-to-end encrypted case data

### Implementation
1. **Client-Side Encryption**
   ```typescript
   // Encrypt evidence files before upload
   // Encrypt case narrative
   // Use Web Crypto API (AES-256)
   ```

2. **Server-Side Security**
   ```typescript
   // Validate all inputs
   // Check authorization before decrypt
   // Log all access attempts
   // RLS policies on database
   ```

3. **Audit Trail**
   - Log all case access
   - Log all status changes
   - Log all message access
   - Compliance reporting

### Success Criteria
- All sensitive data encrypted at rest
- Files encrypted before upload
- Audit trail complete
- No unencrypted PII in logs

---

## Phase 7: Real-Time Features (OPTIONAL, LATER)
**Goal:** Live notifications and updates

### Features
1. **Supabase Realtime**
   - Case status changes
   - New messages
   - New case alerts

2. **Notifications**
   - Browser notifications (with permission)
   - Toast alerts in app
   - Email notifications (optional)

3. **Live Dashboards**
   - Cases auto-refresh
   - Message list updates in real-time
   - New case counter increments

### Success Criteria
- Cases update without page reload
- Caseworkers notified of new cases
- Messages appear instantly

---

## Phase 8: Analytics & Reporting (ADMIN ONLY)
**Goal:** Insights for decision-makers

### Reports
1. **Overview Dashboard**
   - Cases by status (pie chart)
   - Cases by type (bar chart)
   - Trend line (last 30 days)

2. **Geographic View**
   - Heatmap of cases by region
   - Click to drill down
   - Export regional reports

3. **Demographics**
   - Case distribution over time
   - Comparative analysis
   - Trend predictions

### Success Criteria
- Admin can view analytics
- Export reports to PDF
- Charts are readable on mobile
- No PII exposed in analytics

---

## Testing & QA
- [ ] User signup/login flow
- [ ] Report submission end-to-end
- [ ] Admin case management
- [ ] File encryption/decryption
- [ ] Mobile responsiveness
- [ ] Accessibility (WCAG AA)
- [ ] Security penetration testing
- [ ] Load testing (concurrent users)

---

## Deployment
1. **Staging**
   - Deploy to staging environment
   - Run full test suite
   - Security review

2. **Production**
   - Database backups configured
   - Monitoring setup
   - Error tracking (Sentry)
   - Performance monitoring
   - Gradual rollout

---

## Admin Credentials
```
Email: sbaakum@gmail.com
Password: 00000000
Login Path: /auth/login (or /auth/admin-login for unique link)
Dashboard: /admin
```

---

## User Flows

### Victim/Reporter
1. Land on homepage
2. Click "Start Report"
3. Select incident type
4. Enter date & region
5. Upload evidence (optional)
6. Review & submit
7. Receive reference code
8. Can login to check status

### Caseworker
1. Login to `/dashboard`
2. View triage queue
3. Assign cases
4. Chat with victims
5. Update case status
6. Add internal notes
7. Mark resolved

### Admin
1. Login to `/admin`
2. View all statistics
3. Manage users
4. Manage cases
5. Export reports
6. Configure system settings

---

## Design Consistency
- **Colors:** Red (#e60000), Ink (#25282b), Canvas (#ffffff)
- **Typography:** Display, Body, Caption scales
- **Spacing:** 8px grid (4, 8, 12, 16, 20, 24, 32px)
- **Borders:** 32px pills, 12px cards, 6px inputs
- **Images:** Professional, compassionate, diverse representation

---

## Timeline Estimate
- **Phase 1:** 2 days ✓
- **Phase 2:** 3 days
- **Phase 3:** 4 days
- **Phase 4:** 3 days
- **Phase 5:** 2 days
- **Phase 6:** 3 days
- **Phase 7:** 3 days (optional)
- **Phase 8:** 2 days (optional)
- **Testing & QA:** 5 days
- **Total:** 25-30 days for full implementation

---

## Success Metrics
- User can report abuse in <3 minutes
- 95% message delivery (real-time)
- <1s page load time
- 99.9% uptime
- Zero data breaches
- High user satisfaction (>4.5/5)

---

## Notes
- Keep interfaces simple and jargon-free
- Always prioritize user safety
- Test extensively before production
- Get user feedback early and often
- Follow trauma-informed design principles
- Make images meaningful, not decorative
