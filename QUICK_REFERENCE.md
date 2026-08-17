# SafeVoice Quick Reference Guide

## Quick Start

```bash
# Install and run
pnpm install
pnpm dev

# Build for production
pnpm build
pnpm start

# View at http://localhost:3000
```

---

## Key Files & Their Purpose

### Pages
- **`app/page.tsx`** - Redesigned landing page (image-heavy, simple)
- **`app/auth/login/page.tsx`** - User login (simplified)
- **`app/auth/signup/page.tsx`** - User registration
- **`app/report/page.tsx`** - Victim reporting portal (TO DO)
- **`app/dashboard/page.tsx`** - Caseworker dashboard (existing)
- **`app/admin/page.tsx`** - Admin panel (TO DO)

### Components (in `/components`)
- **`dashboard-sidebar.tsx`** - Navigation sidebar
- **`quick-escape-button.tsx`** - Safety exit feature
- **`voice-recorder.tsx`** - Audio recording tool

### Styles
- **`app/globals.css`** - Design tokens (colors, typography)
- **`tailwind.config.ts`** - Tailwind configuration

### Documentation
- **`REDESIGN_SUMMARY.md`** - What changed and next steps
- **`IMPLEMENTATION_ROADMAP.md`** - Detailed implementation plan
- **`DESIGN_PHILOSOPHY.md`** - Design system and principles
- **`QUICK_REFERENCE.md`** - This file

---

## Admin Credentials

```
Email:    <provisioned-via-supabase>
Password: <rotated — see docs/RECOVERY_RUNBOOK.md>
Login:    /auth/login
Path:     /admin (after login)
```

---

## User Roles

| Role | Access | Login Path | Next Page |
|------|--------|-----------|-----------|
| **Victim** | `/report` (public) | `/auth/login` | `/report` |
| **Caseworker** | Protected dashboard | `/auth/login` | `/dashboard` |
| **Admin** | All pages | `/auth/login` | `/admin` |

---

## Design System at a Glance

### Colors
```
Primary:     #e60000 (Red)      → Buttons, highlights
Dark (Ink):  #25282b (Gray)     → Text, backgrounds
Light:       #ffffff (White)    → Content areas
Neutral:     #bebebe (Light)    → Borders, muted
Soft:        #f2f2f2 (Off-white) → Sections
```

### Typography
```
Headlines:    Geist Bold/Black (24px-144px)
Body:         Geist Regular/Semibold (16px-22px)
Monospace:    Geist Mono (12px-16px for codes)
```

### Spacing
```
4px, 8px, 12px, 16px, 24px, 32px (multiples of 4)
```

### Border Radius
```
Inputs:  6px
Cards:   12px
Buttons: 32px (pills)
```

---

## Common Patterns

### Primary Button
```tsx
<button className="bg-primary text-on-primary body-md font-normal py-3 px-8 rounded-[32px] hover:opacity-90">
  Start Report
</button>
```

### Secondary Button
```tsx
<button className="border-2 border-ink text-ink body-md py-3 px-8 rounded-[32px] hover:bg-ink/5">
  Go Back
</button>
```

### Card
```tsx
<div className="bg-canvas rounded-[12px] p-8 border-2 border-mute/20 hover:border-primary">
  {/* content */}
</div>
```

### Form Input
```tsx
<input
  type="email"
  placeholder="you@example.com"
  className="w-full px-4 py-3 border-2 border-mute rounded-[6px] bg-canvas text-ink body-sm"
/>
```

### Image with Text
```tsx
<div className="grid md:grid-cols-2 gap-12 items-center">
  <div>
    <h2 className="display-md text-ink mb-6">Title</h2>
    <p className="body-md text-body mb-8">Description</p>
    <button>CTA</button>
  </div>
  <Image src="/image.png" alt="Description" fill />
</div>
```

---

## Navigation Structure

```
/                          → Landing page (redesigned)
├─ /auth/
│  ├─ /login              → User login
│  ├─ /signup             → User registration
│  └─ /admin-login        → Admin-only (TO DO)
├─ /report/               → Victim reporting (TO DO)
│  ├─ /incident           → Select type
│  ├─ /details            → Enter info
│  ├─ /evidence           → Upload files
│  └─ /confirmation       → Review & submit
├─ /dashboard/            → Caseworker dashboard
│  ├─ /case/[id]          → Case detail
│  └─ /assigned           → My cases
└─ /admin/                → Admin panel (TO DO)
   ├─ /users              → User management
   ├─ /cases              → Case management
   └─ /settings           → Configuration
```

---

## CSS Class Examples

### Text Styles
```
display-hero    → Large hero headline
display-lg      → Large section heading
display-md      → Medium heading
body-lg         → Large body text
body-md         → Standard body text
body-sm-strong  → Bold small text
caption         → Helper text
caption-uppercase → Labels
```

### Spacing
```
p-4   → 16px padding
px-8  → 32px horizontal padding
py-12 → 48px vertical padding
gap-4 → 16px gap between items
mb-6  → 24px margin bottom
mt-8  → 32px margin top
```

### Colors
```
bg-primary       → Red button background
text-primary     → Red text
border-primary   → Red border
bg-ink          → Dark gray background
text-ink        → Dark gray text
bg-canvas       → White background
text-body       → Gray body text
```

---

## Form Validation Tips

### Email
```tsx
if (!email.includes('@')) {
  setError('Please enter a valid email')
}
```

### Password
```tsx
if (password.length < 8) {
  setError('Password must be at least 8 characters')
}
```

### Matching Passwords
```tsx
if (password !== confirmPassword) {
  setError('Passwords do not match')
}
```

---

## Error Handling Pattern

```tsx
const [error, setError] = useState('')

const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  
  // Validation
  if (!email) {
    setError('Email is required')
    return
  }
  
  try {
    // API call
    const result = await submitForm()
    // Success
  } catch (err) {
    setError(err.message)
  }
}

// In JSX
{error && (
  <div className="p-4 bg-primary/10 border border-primary rounded-[6px]">
    <p className="caption text-ink">{error}</p>
  </div>
)}
```

---

## Image Usage

### Hero Image
```tsx
import Image from 'next/image'

<div className="relative h-96">
  <Image
    src="/hero-support.png"
    alt="Supportive hands"
    fill
    className="object-cover rounded-[12px]"
    priority
  />
</div>
```

### Generated Images
- `/public/hero-support.png` - Compassionate support scene
- `/public/security-lock.png` - Security/privacy illustration
- `/public/confidential-private.png` - Confidentiality icon

---

## Accessibility Quick Checks

- [ ] Button text describes action ("Start Report" not "Go")
- [ ] Images have meaningful alt text
- [ ] Color contrast >7:1
- [ ] Buttons/links >44px tall on mobile
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] No autoplay audio or video
- [ ] Form labels linked to inputs
- [ ] Error messages are clear and helpful

---

## Performance Tips

1. **Images**
   - Use Next.js Image component
   - Set width/height to prevent layout shift
   - Use priority on hero images
   - Compress images to <500KB

2. **Code**
   - Use dynamic imports for large components
   - Lazy load images below the fold
   - Minify CSS and JavaScript
   - Cache static assets

3. **Database**
   - Index frequently queried fields
   - Use pagination for large lists
   - Cache common queries
   - Optimize images before storage

---

## Common Gotchas

### ❌ Don't Do This
```tsx
// Too many colors
<button className="bg-blue-600 text-yellow-300">Wrong</button>

// Jargon in UI
<h1>Initialize RBAC Workflow</h1>

// Tiny buttons
<button className="px-2 py-1">Too Small</button>

// Decorative images only
<img src="/random-shape.svg" />

// Auto-playing video
<video autoPlay>
```

### ✅ Do This Instead
```tsx
// Consistent colors
<button className="bg-primary text-on-primary">Right</button>

// Clear language
<h1>Sign In</h1>

// Touch-friendly
<button className="px-8 py-3">Big Enough</button>

// Purposeful images
<img src="/hero-support.png" alt="Support hands" />

// User-initiated
<button onClick={() => videoRef.current.play()}>Play</button>
```

---

## Testing the App

### Manual Testing
1. **Desktop**
   - Load homepage
   - Click "Sign in"
   - Click "Get Started"
   - Fill signup form
   - Test error states

2. **Mobile**
   - Check layout at 375px width
   - Tap buttons (check size)
   - Test form inputs
   - Check image loading

3. **Admin Access**
   - Email: <provisioned-via-supabase>
   - Password: <rotated — see docs/RECOVERY_RUNBOOK.md>
   - Should see `/admin` page

### Automated Testing
```bash
# Run tests (when implemented)
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

---

## Useful Links

- **Tailwind Docs:** https://tailwindcss.com
- **Next.js Docs:** https://nextjs.org
- **React Docs:** https://react.dev
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Supabase Docs:** https://supabase.com/docs

---

## Getting Help

1. **Check DESIGN_PHILOSOPHY.md** for design questions
2. **Check IMPLEMENTATION_ROADMAP.md** for building features
3. **Check REDESIGN_SUMMARY.md** for overview
4. **Check component files** for existing patterns
5. **Run `pnpm dev`** and inspect in browser DevTools

---

## Pro Tips

1. **Use Copy Paste**
   - Button patterns are consistent
   - Form patterns repeat
   - Card patterns are standard

2. **Mobile First**
   - Design mobile layout first
   - Use `md:` prefix for desktop
   - Test on real phone when possible

3. **Color Consistency**
   - Only 5 colors total
   - Red for primary CTAs
   - Ink for text
   - Use opacity for subtlety

4. **Component Reuse**
   - Create components for repeated patterns
   - Props for variations
   - Keep components small and focused

5. **Naming Consistency**
   - Buttons: "Start Report", "Send Message" (active verbs)
   - Errors: "Email already used" (clear, not technical)
   - Status: "New", "Urgent", "Resolved" (simple words)

---

**Last Updated:** Today  
**Status:** Phase 1 Complete ✓ / Phase 2 Ready 🚀
