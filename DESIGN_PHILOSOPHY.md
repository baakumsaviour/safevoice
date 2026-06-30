# SafeVoice Design Philosophy

## Core Principle: Trust Through Simplicity

SafeVoice is designed for people in crisis - survivors of abuse who need help quickly, safely, and without judgment. Every design decision reflects this reality.

---

## Design Goals

### 1. **Clarity Over Cleverness**
- Plain language, never jargon
- One action per page
- Clear consequences ("What happens when I click this?")
- No hidden menus or confusing patterns

### 2. **Safety First**
- Quick Escape button always visible
- No unexpected navigation
- No autoplay or sudden sounds
- Confirmation before destructive actions
- Privacy respected at every step

### 3. **Accessibility**
- Readable on any device (mobile-first)
- Large, tap-friendly buttons
- High contrast for readability
- Works with screen readers
- Keyboard navigation supported

### 4. **Trauma-Informed**
- Minimal cognitive load
- Supportive, never judgmental tone
- Options, never demands
- Control always with user
- Breaks available at any time

---

## Visual Identity

### Color Palette

```
Primary:         #e60000 (Vodafone Red)
- Used for: CTAs, urgent states, highlights
- Psychology: Energy, urgency, trust

Dark (Ink):      #25282b (Dark Gray-Blue)
- Used for: Text, backgrounds, structure
- Psychology: Professional, grounded, safe

Light (Canvas):  #ffffff (White)
- Used for: Content areas, breathing room
- Psychology: Clean, honest, open

Neutral:         #bebebe (Light Gray)
- Used for: Borders, muted text, disabled states
- Psychology: Quiet, supportive

Soft:            #f2f2f2 (Off-White)
- Used for: Backgrounds, sections, depth
- Psychology: Gentle, accessible
```

### Typography

**Display Face:** Geist (sans-serif)
- Used for: Large headlines, hero text
- Weights: Bold (700), Black (900)
- Size: 24px - 144px

**Body Face:** Geist (sans-serif)
- Used for: Body text, labels, descriptions
- Weights: Regular (400), Semibold (600)
- Size: 14px - 22px

**Monospace:** Geist Mono
- Used for: Case numbers, codes, data
- Weights: Regular (400), Bold (700)
- Size: 12px - 16px

### Type Scale

```
display-hero    144px | Bold    | Hero headlines
display-xxl     126px | Bold    | Section titles
display-xl       90px | Bold    | Page titles
display-lg       48px | Light   | Large headings
display-md       40px | Light   | Headings
display-sm       32px | Bold    | Subheadings
display-xs       24px | Bold    | Card titles

body-lg          22px | Normal  | Large text
body-md          18px | Normal  | Standard text
body-md-strong   18px | Semibold| Emphasized text
body-sm          16px | Normal  | Body text
body-sm-strong   16px | Bold    | Strong text

caption          14px | Normal  | Helper text
caption-strong   14px | Bold    | Important helpers
caption-uppercase 12px| Semibold| Labels
```

### Spacing Scale

All spacing uses multiples of 4px:
```
0.25rem (4px)   - Fine details
0.5rem (8px)    - Small gaps
0.75rem (12px)  - Component padding
1rem (16px)     - Section padding
1.5rem (24px)   - Major sections
2rem (32px)     - Large separations
```

### Border Radius

```
radius-none     0px    - Lines
radius-xs       1px    - Subtle softness
radius-sm       6px    - Input fields
radius-card     12px   - Cards, containers
radius-pill-md  32px   - Medium buttons, pills
radius-full     9999px - Circular elements
```

---

## Component Patterns

### Buttons

**Primary CTA**
```
Background: Vodafone Red (#e60000)
Text: White
Padding: 12px 32px
Border-radius: 32px
Font: body-md, normal weight
Hover: opacity-90
State: disabled shows opacity-50
```

**Secondary**
```
Background: Transparent
Border: 2px solid ink (#25282b)
Text: ink
Padding: 12px 32px
Border-radius: 32px
Hover: background becomes ink/5
```

**Examples:**
- "Start Report" → Primary CTA (red)
- "Back" → Secondary (ink outline)
- "Create Account" → Primary CTA (red)

### Cards

```
Background: Canvas (#ffffff)
Border: 2px solid mute (#bebebe) with /20 opacity
Padding: 32px
Border-radius: 12px
Hover: border becomes primary color
Transition: all 200ms ease
```

### Forms

**Input Field**
```
Background: Canvas (#ffffff)
Border: 2px solid mute (#bebebe)
Padding: 12px 16px
Border-radius: 6px
Font: body-sm
Placeholder color: body (#7e7e7e)
Focus: border becomes primary, outline none
```

**Labels**
```
Font: body-sm-strong
Color: ink (#25282b)
Margin-bottom: 12px
```

### Status Indicators

```
New/Pending:  Blue accent
Urgent:       Red (#e60000)
In Progress:  Amber
Resolved:     Green
```

---

## Images & Illustrations

### Photography
- **Style:** Real people, diverse representation
- **Mood:** Warm, compassionate, hopeful
- **Lighting:** Soft, natural, safe-feeling
- **Composition:** Intimate, never clinical

### Illustrations
- **Style:** Minimalist, modern
- **Colors:** Use primary + neutrals only
- **Details:** Clean lines, no clutter
- **Purpose:** Reinforce safety and clarity

### Image Usage
1. **Hero section** - Full-width image sets tone
2. **Feature cards** - Smaller images with purpose
3. **No decorative elements** - Every image tells a story
4. **Accessibility** - All images have alt text

---

## Writing Guidelines

### Tone
- **Warm but professional**
- **Supportive, never condescending**
- **Clear, never clever**
- **Active voice, strong verbs**

### Vocabulary
- ✓ "Start Report" (clear action)
- ✗ "Submit Case Documentation" (jargon)
- ✓ "Tell us what happened" (invitation)
- ✗ "Provide victim account narrative" (clinical)
- ✓ "Secure message" (explains benefit)
- ✗ "End-to-end encrypted communication" (technical)

### Button Labels
- Always describe action: "Send Message" not "Submit"
- Active voice: "Save Changes" not "Changes Saved"
- Consistent: button says "Publish" → toast says "Published"

### Error Messages
- Explain what went wrong (not why technically)
- Suggest fix: "Email already in use - try signing in instead"
- Never blame user: ✓ "Password too short" ✗ "Invalid password"

---

## Responsive Design

### Breakpoints
```
Mobile:    < 640px   - Single column
Tablet:    640-1024px - Two columns
Desktop:   > 1024px  - Three+ columns
```

### Mobile-First Approach
1. Design for mobile first
2. Stack vertically
3. Large touch targets (44px minimum)
4. Full-width elements
5. Single column layouts
6. Then enhance for larger screens

### Navigation
- **Mobile:** Hamburger menu or bottom tab bar
- **Tablet:** Collapsible sidebar
- **Desktop:** Fixed sidebar or top navigation

---

## Interaction Patterns

### Micro-interactions
- **Hover:** Subtle color/border change, no animation
- **Active:** Slightly darker or highlighted state
- **Loading:** Spinner or skeleton loader
- **Success:** Green checkmark, toast notification
- **Error:** Red alert, inline validation

### Transitions
- Default: 200ms ease
- Page transitions: fade or slide
- No auto-play animations
- Respect `prefers-reduced-motion`

### Feedback
- All actions have visible feedback
- No silent failures
- Loading states when >1s wait
- Toast notifications for quick actions

---

## Accessibility

### WCAG AA Compliance
- ✓ Color contrast >7:1 for text
- ✓ Touch targets >44x44px
- ✓ Keyboard navigation (Tab, Enter, Escape)
- ✓ Screen reader support (semantic HTML)
- ✓ Alt text for all images

### Testing
- Test with keyboard only
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Test with color blindness (Deuteranopia filter)
- Test at mobile, tablet, desktop sizes
- Test with zoom at 200%

---

## Example: Landing Page Breakdown

### Section 1: Hero
```
Layout:      Image (right) + Text (left) on desktop, stacked on mobile
Image:       Full-bleed, compassionate support scene
Headline:    display-lg, "Report safely and securely"
Subheading:  caption-uppercase, "Your voice matters"
CTA:         Primary button, "Start Report"
Spacing:     32px padding, 64px vertical spacing
```

### Section 2: Features
```
Layout:      3-column grid on desktop, single on mobile
Cards:       3 image cards, each 64px height image
Icons:       Lucide React icons, 24px
Text:        display-xs headline + body-md description
Hover:       Border changes to primary color
```

### Section 3: CTA
```
Layout:      Centered, single column
Background:  Ink (#25282b) dark band
Text:        display-md, white/light
Button:      Primary CTA (red on dark)
Spacing:     64px vertical padding
```

---

## Dark Mode (Future)

### Color Adjustments
```
Canvas (light):     #1a1a1a
Ink (dark):         #e8e8e8
Soft (light bg):    #2d2d2d
Primary:            #ff4444 (brighter red)
```

**Not currently used but structure supports it**

---

## Common Mistakes to Avoid

1. **Too many colors**
   - ✗ Red, blue, green, purple buttons
   - ✓ Red for primary, ink outline for secondary

2. **Small buttons/targets**
   - ✗ 32px button height
   - ✓ 44px+ button height (mobile)

3. **Jargon in UI**
   - ✗ "Initialize RBAC workflow"
   - ✓ "Sign in as admin"

4. **Decorative-only elements**
   - ✗ Random illustrations that don't serve purpose
   - ✓ Purposeful images that build trust

5. **Animated distractions**
   - ✗ Spinning loaders, bouncing alerts
   - ✓ Simple spinners, static feedback

6. **Unclear CTAs**
   - ✗ "Proceed" or "Continue"
   - ✓ "Start Report" or "Send Message"

---

## Tools & Resources

### Font Installation
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700;900&display=swap" rel="stylesheet">
```

### CSS Variables
```css
--primary: #e60000
--ink: #25282b
--canvas: #ffffff
--mute: #bebebe
--soft: #f2f2f2
```

### Tailwind Classes
```
bg-primary, text-primary, border-primary
bg-ink, text-ink, border-ink
bg-canvas, text-canvas
bg-mute, text-mute, border-mute
bg-soft, text-soft
```

---

## Future Enhancements

1. **Typography Animation**
   - Animated type on hero
   - Gradient text for emphasis
   - Custom fonts for personality

2. **Advanced Interactions**
   - Scroll-triggered reveals
   - Parallax effects (subtle)
   - Gesture support (mobile)

3. **Personalization**
   - User preferences (font size, colors)
   - Regional customization
   - Language-specific layouts

4. **Analytics**
   - Track which CTAs convert best
   - User testing insights
   - A/B test variations

---

## Design Review Checklist

Before shipping, verify:
- [ ] Text is plain language (no jargon)
- [ ] Images serve a purpose
- [ ] Buttons are >44px tall
- [ ] Color contrast >7:1
- [ ] Mobile layout works
- [ ] No animation plays on load
- [ ] Error messages are helpful
- [ ] Keyboard navigation works
- [ ] Only red for primary CTA
- [ ] Spacing follows 4px grid
- [ ] Fonts are Geist family
- [ ] Borders are 2px, not 1px
- [ ] Cards have hover state
- [ ] Status badges are clear
- [ ] Links are underlined or colored

---

## Questions to Ask

When reviewing a new page or component:

1. **"Would a trauma survivor feel safe here?"**
   - Is language supportive?
   - Are options clear?
   - Can they escape easily?

2. **"Can someone understand this without help?"**
   - Is jargon eliminated?
   - Are icons clear?
   - Are steps obvious?

3. **"Does this design reinforce trust?"**
   - Is it professional but warm?
   - Are images respectful?
   - Is security emphasized?

4. **"Would this work on a 5-year-old phone?"**
   - Large buttons?
   - Fast loading?
   - Works offline?

5. **"Could someone with a disability use this?"**
   - Keyboard accessible?
   - Screen reader friendly?
   - Color-blind safe?

---

## Resources

- **Design System:** REDESIGN_SUMMARY.md
- **Implementation:** IMPLEMENTATION_ROADMAP.md
- **Vodafone System:** (Original brief)
- **Frontend Design:** frontend-design skill
- **Accessibility:** WCAG 2.1 AA guidelines

---

**Remember:** Good design is invisible. Users should focus on their story, not the interface.
