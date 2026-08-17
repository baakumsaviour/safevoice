# SafeVoice Redesign Summary

## Overview
SafeVoice has been redesigned to focus on simplicity, user safety, and image-heavy storytelling. The platform now emphasizes:
- **Simple, trauma-informed reporting** for victims
- **Secure admin/caseworker access** via protected routes
- **User self-registration** with role-based access control (RBAC)
- **Admin credentials** for system management

---

## Key Changes Made

### 1. Landing Page (`/app/page.tsx`)
**Redesign Highlights:**
- Simplified navigation with only "Sign in" and "Get Started" buttons
- **Removed Dashboard/Analytics from public navbar** (admin-only)
- Hero section with compelling image and simple CTA
- Three visual feature cards with images (security, privacy, offline access)
- Image-heavy design using generated hero images
- Mobile-responsive layout using Tailwind flexbox
- Trust-focused messaging ("We keep you safe")
- Direct support hotline cards with call-to-action links

**Images Generated:**
- `/public/hero-support.png` - Supportive, compassionate imagery
- `/public/security-lock.png` - Security/privacy illustration
- `/public/confidential-private.png` - Confidentiality icon

### 2. Authentication Pages

#### Sign Up (`/app/auth/signup/page.tsx`)
- Clean, simple form with Name, Email, Password
- Password confirmation validation
- Minimum 8-character password requirement
- Error handling and success states
- Link to login page
- No confusing technical jargon

#### Sign In (`/app/auth/login/page.tsx`)
- Simplified from previous version
- Email and password fields only
- Admin credentials: `<provisioned-via-supabase>` / `<rotated>`
- Routes admin to `/admin` dashboard
- Routes regular users to `/report` flow
- Link to signup page

### 3. Design System (Vodafone-Inspired)
- **Primary Color:** Vodafone red (#e60000)
- **Dark Theme:** Ink (#25282b)
- **Light Theme:** Canvas white (#ffffff)
- **Typography:** Display, body, and caption scales
- **Border Radius:** 32px for pills, 12px for cards, 6px for inputs

---

## Still To Do (Next Steps)

### 1. Complete Authentication System
```
// Needs Supabase integration
- [ ] User signup server action
- [ ] User login server action
- [ ] Password reset flow
- [ ] Email verification
- [ ] Session management
- [ ] Admin authentication
```

### 2. Admin Dashboard (`/admin`)
```
- [ ] Admin landing page with stats
- [ ] Case management interface
- [ ] User management
- [ ] Organization settings
- [ ] Analytics overview (high-level)
```

### 3. Caseworker Dashboard (protected route)
```
- [ ] Case triage queue
- [ ] Case detail view
- [ ] Secure messaging with victims
- [ ] Case assignment
- [ ] Status tracking
```

### 4. Victim Report Flow (`/report`)
```
- [ ] Multi-step report form (simplified)
- [ ] Quick escape button
- [ ] Voice recording option
- [ ] File upload with encryption
- [ ] Reference code generation
- [ ] Submission confirmation
```

### 5. RBAC Implementation
```
- [ ] Create roles table
- [ ] Implement middleware for route protection
- [ ] Add role-based access checks
- [ ] Admin-only routes
- [ ] Caseworker-only routes
```

### 6. Database Schema
```
- [ ] Users/Profiles table
- [ ] Cases table
- [ ] Messages table
- [ ] Evidence files table
- [ ] Audit log table
- [ ] Row-level security (RLS) policies
```

### 7. Additional Features
```
- [ ] Offline resources directory
- [ ] Emergency hotline integration
- [ ] Real-time case notifications
- [ ] Case status tracking
- [ ] PDF case export
- [ ] Multi-language support (EN/Twi/FR)
```

---

## Admin Credentials
```
Email: <provisioned-via-supabase>
Password: <rotated — see docs/RECOVERY_RUNBOOK.md>
Route: /admin (after login)
```

---

## User Roles
1. **Regular User (Victim)** 
   - Access: `/report` (public), can create account
   - After login: View own reports, message caseworker

2. **Caseworker**
   - Access: Protected `/dashboard` route
   - Permissions: View assigned cases, send messages, update status

3. **Admin**
   - Access: Protected `/admin` route
   - Permissions: Manage all cases, users, organization settings

---

## Design Principles Applied

### From Frontend Design Skill:
✓ **Ground it in subject** - Victim safety and trauma-informed design
✓ **Hero is thesis** - Compassionate image + clear headline
✓ **Typography carries personality** - Distinctive display + body scales
✓ **Structure is information** - Simple 3-step flow
✓ **Restraint** - Single red accent, clean spacing
✓ **Written content** - Plain language, no jargon ("Report an Incident" not "Submit a Case Document")

### Visual Identity:
- Bold Vodafone red accent on white/gray backgrounds
- Clean, minimalist layout
- Image-first approach to storytelling
- Generous whitespace for breathing room
- Mobile-first responsive design

---

## Quick Start Commands
```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Test build
pnpm build && pnpm start
```

---

## File Structure
```
/app
  /auth
    /login - User login
    /signup - User registration
  /admin - Admin dashboard (TO DO)
  /report - Victim reporting (TO DO)
  /dashboard - Caseworker dashboard (existing)
  page.tsx - Landing page (REDESIGNED)

/public
  /hero-support.png - Generated hero image
  /security-lock.png - Generated security image
  /confidential-private.png - Generated privacy image

/components
  /dashboard-sidebar.tsx - Admin/caseworker nav (existing)
  /quick-escape-button.tsx - Safety feature (existing)
  /voice-recorder.tsx - Audio recording (existing)
```

---

## Next Phase: Implementation Order
1. **Database Setup** - Create Supabase schema
2. **Auth System** - Implement signup/login server actions
3. **Admin Dashboard** - Create `/admin` portal
4. **Victim Report Flow** - Complete `/report` pages
5. **Caseworker Tools** - Enhance `/dashboard`
6. **Real-time Features** - Add live notifications
7. **Security & Testing** - Final hardening

---

## Notes
- All pages follow Vodafone design system
- Removed technical jargon throughout UI
- Focus on simplicity and trust
- Admin/Dashboard hidden from public nav
- Image-heavy approach to overcome language barriers
- Trauma-informed design principles applied throughout
