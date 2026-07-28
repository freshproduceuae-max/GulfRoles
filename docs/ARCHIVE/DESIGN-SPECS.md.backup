# Design Specifications — jobbrowser.app

**Version:** 1.0  
**Status:** Ready for Designer Implementation  
**Target Platform:** Web (responsive mobile-first) + Mobile App (future)  
**Tech Stack:** Next.js, React, Tailwind CSS

---

## DESIGN PRINCIPLES

Based on competitor analysis (Indeed, LinkedIn, Careerjet, Jooble, Adzuna):

1. **Modern & Clean** — Not cluttered like Indeed; not gated like LinkedIn
2. **Mobile-First** — 67%+ of job searches happen on mobile
3. **Trust-Visible** — Salary transparency, verified employers, verified badges visible above fold
4. **Fast & Responsive** — No lag on search; instant filter feedback
5. **Accessible** — WCAG 2.1 AA compliance; keyboard navigation
6. **Regional-Flexible** — One design system that works in all 5 regions (USD/AED/INR/AUD/SAR currency display)

---

## NAVIGATION ARCHITECTURE

### Primary Navigation (Desktop & Mobile)

```
HEADER (Sticky on scroll, light shadow)
├── Logo/Brand [jobbrowser]
├── Search Bar (prominent, centered)
│   └── Input: "Job title, keywords, or company"
│   └── Input: "City, region, or remote"
│   └── Button: "Search" [Primary Color]
├── Secondary Nav (Right side, desktop only)
│   ├── Sign In / Register [Text Link]
│   └── Post a Job [Button, Secondary Color]
└── Mobile Menu (Hamburger icon, hidden on desktop)
    ├── My Saved Jobs
    ├── My Alerts
    ├── Sign In / Register
    └── Post a Job
```

### Filter/Sidebar Navigation (Left side, desktop; Collapsed on mobile)

```
FILTERS PANEL (Sticky, 300px wide on desktop)
├── Job Type
│   ├── [ ] Full-time
│   ├── [ ] Part-time
│   ├── [ ] Contract
│   └── [ ] Internship
├── Location
│   ├── [Autocomplete search]
│   ├── [ ] Remote
│   ├── [Radius slider] (0–100 km)
├── Salary Range
│   ├── [Min slider] – [Max slider]
│   └── Currency selector [USD / AED / SAR / INR / AUD]
├── Company
│   ├── [Autocomplete search]
│   ├── [ ] Verified Employer
├── Experience Level
│   ├── [ ] Entry Level (0–2 yrs)
│   ├── [ ] Mid-Level (2–5 yrs)
│   ├── [ ] Senior (5+ yrs)
├── Date Posted
│   ├── [ ] Last 24 hours
│   ├── [ ] Last 7 days
│   ├── [ ] Last 30 days
└── [Clear Filters] [Apply Filters]
```

**Mobile Filters:** Bottom-sheet modal or slide-in panel; "Apply Filters" button sticky at bottom.

---

## LAYOUT STRUCTURE

### HOMEPAGE (Desktop)

```
┌─────────────────────────────────────────┐
│         HEADER + STICKY NAV             │ (100px)
├─────────────────────────────────────────┤
│                                         │
│         HERO SECTION                    │ (200px)
│  "Find Your Next Opportunity"           │
│  [Search Bar] [Browse Jobs]             │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  FEATURED JOBS CAROUSEL (3 jobs wide)   │ (250px)
│  "Trending Right Now" / "Recommended"   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  VALUE PROPS (3-column grid)            │ (150px)
│  ✓ Real jobs from verified employers    │
│  ✓ Salary transparency included         │
│  ✓ Apply directly to employers          │
│                                         │
├─────────────────────────────────────────┤
│  FOOTER (Links, Privacy, Company)       │ (150px)
└─────────────────────────────────────────┘
```

### SEARCH RESULTS PAGE (Desktop)

```
┌──────────────────────────────────────────────────┐
│           HEADER + SEARCH BAR (sticky)           │
├────────────────────┬────────────────────────────┤
│                    │                            │
│  FILTERS PANEL     │  RESULTS SECTION          │
│  (Sticky, 300px)   │                            │
│                    │  Results count: "342 jobs" │
│  [Filter options]  │  Sort by: [Relevance ▼]  │
│                    │  View: [Grid] [List]      │
│                    │                            │
│                    │  ┌──────────────────────┐ │
│                    │  │ JOB CARD #1          │ │
│                    │  │ [Company Logo]       │ │
│                    │  │ Job Title            │ │
│                    │  │ Company Name ✓       │ │
│                    │  │ Location | Remote    │ │
│                    │  │ $80K – $120K/year   │ │
│                    │  │ [Apply] [Save]      │ │
│                    │  └──────────────────────┘ │
│                    │                            │
│                    │  [Job Card #2...]        │
│                    │  [Job Card #3...]        │
│                    │                            │
│                    │  [Pagination]            │
│                    │  1 2 3 4 5 ... Next >    │
│                    │                            │
└────────────────────┴────────────────────────────┘
```

### JOB LISTING PAGE (Full-width, mobile-responsive)

```
┌─────────────────────────────────────────┐
│      HEADER + BACK TO RESULTS           │ (60px)
├─────────────────────────────────────────┤
│                                         │
│  [Company Logo] [Verified Badge]       │ (40px)
│  Job Title (H1)                         │ (50px)
│  Company Name | Location | Remote       │ (30px)
│  $80K – $120K/year • Full-time          │ (30px)
│  Posted 3 days ago | 24 applicants     │ (20px)
│                                         │
│  [APPLY NOW] [SAVE JOB] [SHARE]        │ (50px, sticky on mobile)
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  JOB DESCRIPTION                        │
│  (HTML formatted, links preserved)      │
│                                         │
│  ▪ About the role                       │
│  ▪ Responsibilities                     │
│  ▪ Requirements                         │
│  ▪ Benefits                             │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  SIMILAR JOBS (Carousel or Grid)        │
│  "Other roles at [Company]"             │
│  "Other [Job Title] jobs nearby"        │
│                                         │
└─────────────────────────────────────────┘
```

---

## COMPONENT SPECS

### Job Card (Search Results)

**Desktop Layout (List view):**
```
┌─────────────────────────────────────────────┐
│ [Logo] Title           Company ✓  | Remote │
│        $80K–120K       Posted 3d   | 24 apps
│        [APPLY] [SAVE]                       │
└─────────────────────────────────────────────┘
```

**Desktop Layout (Grid view):**
```
┌──────────────────┐
│ [Logo]           │
│ Job Title        │
│ Company Name ✓   │
│                  │
│ $80K–$120K/yr   │
│ Location, Remote │
│                  │
│ [APPLY] [SAVE]  │
└──────────────────┘
```

**Mobile Layout (Card-based):**
```
┌──────────────────────┐
│ [Logo] Company ✓     │
│ Job Title (bold)     │
│ Location | Remote    │
│ $80K–$120K/year      │
│ Posted 3d • 24 apps  │
│                      │
│ [APPLY →] [❤ SAVE]  │
└──────────────────────┘
```

**Information Density:**
- Logo: 40×40px
- Title: 18px, bold, dark color
- Company: 14px, medium gray, checkmark (verified)
- Salary: 16px, bold, primary color
- Meta: 12px, light gray (posted date, applicant count)
- Location: 14px, regular, with location icon

---

## VISUAL HIERARCHY & COLOR SYSTEM

### Primary Elements (Highest Attention)
1. Job title (H1, bold, large)
2. Salary (prominent, primary color)
3. Apply button (high-contrast, primary color)
4. Company name + verified badge (trust signal)

### Secondary Elements
- Location, job type, posted date (meta info, smaller)
- Saved/bookmark button (secondary action)
- Filters (sidebar, unobtrusive)

### Tertiary Elements
- Pagination, sorting, view toggle
- Footer links

### Color Palette (Brand-Agnostic, Adaptable)

**Primary Color:** Energetic blue (trust + action)
- Hex: #007AFF (or regional variant)
- Used for: Apply button, links, primary CTA

**Secondary Color:** Modern teal/green (differentiation)
- Hex: #00D084 (or regional variant)
- Used for: Secondary buttons, verified badges, success states

**Neutral Colors:**
- Dark Gray: #1F2937 (headings, main text)
- Medium Gray: #6B7280 (secondary text, meta)
- Light Gray: #F3F4F6 (backgrounds, borders)
- White: #FFFFFF (cards, section backgrounds)

**Accent Colors:**
- Salary/Money: Green (#10B981) — signals positive (opportunity)
- Alert/Warning: Amber (#F59E0B)
- Error: Red (#EF4444)

**Accessibility:** All color contrasts meet WCAG AA (4.5:1 for text).

---

## TYPOGRAPHY SYSTEM

### Font Stack (Web-Safe, Fast Loading)
- **Headings:** Inter or Poppins (sans-serif, clean, modern)
- **Body Text:** Inter or Source Sans Pro (sans-serif, highly readable)
- **Monospace (optional):** Fira Code (for salary ranges, job codes)

### Type Scale (Tailwind-Compatible)

| Level | Size | Weight | Line-Height | Use Case |
|-------|------|--------|-------------|----------|
| H1 | 32px | 700 | 1.2 | Job title, page heading |
| H2 | 24px | 600 | 1.3 | Section heading |
| H3 | 20px | 600 | 1.4 | Subsection |
| Body Large | 16px | 400 | 1.6 | Job description, main content |
| Body | 14px | 400 | 1.6 | Card text, descriptions |
| Body Small | 12px | 400 | 1.5 | Meta info, captions |
| Label | 12px | 600 | 1.5 | Button labels, filter labels |

---

## RESPONSIVE DESIGN BREAKPOINTS

| Breakpoint | Width | Behavior |
|-----------|-------|----------|
| **Mobile** | <640px | Single column, stacked filters (bottom-sheet modal) |
| **Tablet** | 640px–1024px | Two-column (filters + results), smaller sidebar |
| **Desktop** | >1024px | Three-column (sidebar 300px + results + ads), full width |
| **Large Desktop** | >1440px | Same, with wider margins |

**Mobile Optimizations:**
- Search bar remains sticky at top
- Filters slide in from bottom (modal)
- Job cards full-width with touch-friendly padding
- Apply button sticky at bottom (large tap target, 48px min height)

---

## TRUST SIGNALS & VISUAL PLACEMENT

### Employer Verification Badge
- **Placement:** Logo area (top-right corner of job card)
- **Design:** Checkmark in circle, blue background
- **Tooltip:** "Verified Employer" (on hover)
- **Size:** 24×24px on cards, 40×40px on listing page

### Salary Transparency
- **Placement:** Prominent (below job title on cards, in bold green)
- **Format:** "$80K – $120K/year" or "AED 250K – 350K/year"
- **Conditionally shown:** Only if employer disclosed (no "Competitive salary" placeholder)

### Company Rating/Reviews (Future)
- **Placement:** Below company name (12px text, star icon)
- **Format:** "⭐ 4.2/5 (342 reviews)" — links to Glassdoor-style reviews

### Application Count
- **Placement:** Meta info (right side, 12px gray text)
- **Format:** "24 people applied"
- **Purpose:** Signal job legitimacy (popular = real)

---

## INTERACTION PATTERNS

### Search & Filter Feedback
- **Instant response:** Filters update results in <300ms (no loading spinner for small sets)
- **Large result sets:** Show skeleton loaders for cards during fetch
- **Accessibility:** Announce filter changes to screen readers ("342 jobs found")

### Apply Button
- **Primary state:** Blue button, large
- **Hover state:** Slightly darker blue, shadow increase
- **Loading state:** Button shows spinner + "Applying..."
- **Success state:** Confirm modal "Your application has been sent. You'll hear from [Employer] soon."

### Save/Bookmark
- **Primary state:** Outline heart icon
- **Saved state:** Solid red heart, animates on click
- **Unsave:** Click again to toggle off

### Mobile-Specific
- **Swipe gestures:** (Future) Swipe left to save, right to dismiss
- **Bottom sheet:** Filters slide in from bottom, "Apply Filters" sticky at bottom
- **Scroll behavior:** Search bar collapses on scroll down, expands on scroll up (saves space)

---

## REGIONAL CUSTOMIZATION (Single Design System)

### Currency & Salary Display
- **USA:** $80K–$120K/year
- **UAE:** AED 250K–350K/year (or USD equivalent with toggle)
- **Saudi:** SAR 250K–400K/year
- **India:** ₹50L–80L/year (in lakhs) or ₹5,000K–8,000K (alternative format)
- **Australia:** AUD $80K–$120K/year

**Implementation:** Currency selector in filter panel (sticky header, dropdown).

### Language & Text
- **English:** Default for all regions (job seekers fluent in English)
- **Arabic (Future):** UAE, Saudi Arabia regions; RTL layout
- **Hindi (Future):** India region (lower-tier); English primary

### Job Types by Region
- **All regions:** Full-time, Part-time, Contract, Internship (standard)
- **UAE/Saudi:** Add visa sponsorship filter
- **India:** Add fresher-focused filter
- **Australia:** Add Trade/Apprenticeship filter

---

## PERFORMANCE & ACCESSIBILITY

### Lighthouse Targets
- **Performance:** >90 (optimized images, lazy loading)
- **Accessibility:** >95 (WCAG 2.1 AA compliance)
- **Best Practices:** >95
- **SEO:** >95

### Mobile Performance
- **First Contentful Paint (FCP):** <1.5s
- **Largest Contentful Paint (LCP):** <2.5s
- **Cumulative Layout Shift (CLS):** <0.1

### Accessibility Features
- Keyboard navigation (Tab, Enter, Arrow keys work everywhere)
- Screen reader tested (NVDA, JAWS)
- High contrast mode support
- Focus indicators visible (2px outline, primary color)
- Alt text on all images
- Form labels associated with inputs (`<label for="">`)

---

## DESIGN TOKENS (For Implementation)

```
SPACING:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

BORDER RADIUS:
- none: 0
- sm: 4px
- md: 8px
- lg: 12px
- full: 9999px

SHADOWS:
- sm: 0 1px 2px rgba(0,0,0,0.05)
- md: 0 4px 6px rgba(0,0,0,0.1)
- lg: 0 10px 15px rgba(0,0,0,0.1)

Z-INDEX:
- base: 0
- dropdown: 10
- sticky: 20
- modal: 30
- toast: 40
```

---

## NEXT STEPS FOR DESIGNER

1. **Build Homepage Layout** (hero + featured jobs + value props)
2. **Build Search Results Layout** (desktop + mobile, with filters)
3. **Build Job Listing Page** (full job details view)
4. **Create Component Library** (job card, button, filter, etc.)
5. **Test Responsive** (mobile/tablet/desktop)
6. **Accessibility Testing** (keyboard nav, screen reader)
7. **Regional Variants** (currency display, RTL for future Arabic support)

---

## DESIGN ASSETS NEEDED

- [ ] Logo (jobbrowser wordmark + icon)
- [ ] Favicon (32×32px, SVG)
- [ ] Company verified badge (SVG)
- [ ] Location icon, remote icon, clock icon (16px, 24px SVG)
- [ ] Checkmark icon for filters, heart icon for save (SVG)
- [ ] Loading spinner (SVG animation)
- [ ] Empty state illustrations (job search, no results, etc.)
- [ ] Regional logo variants (if localized branding needed)

---

**Status:** Ready for Designer to implement in Figma/Adobe XD, then hand off for development.

**Questions?** Refer to competitor analysis research for specific patterns.
