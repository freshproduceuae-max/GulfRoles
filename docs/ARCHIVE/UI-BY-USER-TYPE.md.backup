# UI Specifications by User Type — jobbrowser.app

**Version:** 1.0  
**Purpose:** Define distinct UI interfaces for each user type, with feature enable/disable matrix and detailed layouts

---

## FEATURE ENABLE/DISABLE MATRIX (MVP + Phase 2)

| Feature | Job Seeker (Passive) | Job Seeker (Active) | HR Manager | Employer/CEO | Recruiter | Admin |
|---------|---|---|---|---|---|---|
| **Search & Browse** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Save Jobs** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Job Alerts (Weekly)** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Job Alerts (Daily)** | 🚀 Ph2 | 🚀 Ph2 | ❌ | ❌ | ❌ | ❌ |
| **Apply to Job** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **My Applications (Track)** | 🚀 Ph2 | 🚀 Ph2 | ❌ | ❌ | ❌ | ❌ |
| **Job Posting** | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Applicant Inbox** | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Resume Search** | ❌ | ❌ | ❌ | ❌ | 🚀 Ph2 | ❌ |
| **Applicant Tracker (ATS)** | ❌ | ❌ | ❌ | ❌ | 🚀 Ph2 | ❌ |
| **Bulk Job Upload (CSV)** | ❌ | ❌ | ❌ | ❌ | 🚀 Ph2 | ❌ |
| **Company Profile** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Job Analytics** | ❌ | ❌ | ✅ | ✅ | 🚀 Ph2 | ❌ |
| **Moderation Queue** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **User Management** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Career Coaching** | 🚀 Ph2 | 🚀 Ph2 | ❌ | ❌ | ❌ | ❌ |
| **Resume Builder** | 🚀 Ph2 | 🚀 Ph2 | ❌ | ❌ | ❌ | ❌ |
| **Salary Benchmarks** | 🚀 Ph2 | 🚀 Ph2 | ❌ | ❌ | ❌ | ❌ |
| **CRM Sync** | ❌ | ❌ | ❌ | ❌ | ❌ | 🚀 Ph2 |
| **Audit Logs** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Legend:**
- ✅ = Enabled in MVP
- 🚀 Ph2 = Deferred to Phase 2
- ❌ = Not available for this user type

---

## UI SPECIFICATIONS BY USER TYPE

---

## **USER TYPE 1: Job Seeker (Passive)**

### Primary Goal
Browse jobs casually, discover opportunities, stay informed via weekly digests.

### Navigation & Layout

```
┌─────────────────────────────────────────┐
│ HEADER (Sticky)                         │
│ [Logo] [Search Bar] [Sign Up] [Sign In]│
└─────────────────────────────────────────┘
│
├─ HOMEPAGE
│  ┌─────────────────────────────────────┐
│  │ HERO SECTION (Mobile-full width)   │
│  │ "Discover Your Next Opportunity"   │
│  │ [Search: Job Title] [Search: City] │
│  │ [Browse Jobs] [Set Alerts]         │
│  └─────────────────────────────────────┘
│  ┌─────────────────────────────────────┐
│  │ FEATURED JOBS (Carousel)            │
│  │ "Trending Right Now"                │
│  │ [Card 1] [Card 2] [Card 3]         │
│  └─────────────────────────────────────┘
│  ┌─────────────────────────────────────┐
│  │ VALUE PROPS (3-column grid)        │
│  │ ✓ Real jobs from verified employers│
│  │ ✓ Salary transparency included    │
│  │ ✓ Apply directly to employers     │
│  └─────────────────────────────────────┘
│
├─ SEARCH RESULTS PAGE
│  ┌────────────────┬──────────────────┐
│  │ FILTERS (Left) │ RESULTS (Right)  │
│  │ [Location]     │ 342 jobs found  │
│  │ [Job Type]     │ Sort: Relevance │
│  │ [Salary Range] │                 │
│  │ [Company]      │ [Job Card 1]    │
│  │ [Date Posted]  │ [Job Card 2]    │
│  │                │ [Job Card 3]    │
│  │ [Apply Filters]│ [Pagination]    │
│  └────────────────┴──────────────────┘
│
├─ JOB DETAIL PAGE
│  ┌─────────────────────────────────────┐
│  │ [Company Logo] Job Title            │
│  │ Company Name ✓ | Location | Remote │
│  │ $80K–$120K/year • Full-time         │
│  │ [APPLY NOW] [SAVE JOB] [SHARE]     │
│  │                                     │
│  │ Job Description                     │
│  │ Requirements, Benefits, etc.       │
│  │                                     │
│  │ SIMILAR JOBS (Carousel)            │
│  └─────────────────────────────────────┘
│
└─ ACCOUNT (No login for MVP; future)
   ├─ Saved Jobs (browser-stored)
   ├─ Job Alerts (manage subscriptions)
   └─ Account Settings (email, frequency)
```

### Key Components

**Job Card (Passive Seeker View)**
```
┌──────────────────────────────────────┐
│ [Logo] Company Name ✓ | Location    │
│ Job Title (Bold, 18px)               │
│ $80K–$120K/year                     │
│ Posted 3 days ago • 24 applications │
│                                      │
│ [APPLY] [❤ SAVE]                   │
└──────────────────────────────────────┘
```

**Alert Setup Modal (On Save or "Set Alerts")**
```
┌─────────────────────────────────────┐
│ Stay Updated on Jobs Like This      │
│                                     │
│ Get weekly digest of jobs matching: │
│ • Your saved jobs                   │
│ • Your search history               │
│                                     │
│ Email: [john@example.com]          │
│ Frequency: [Weekly ▼]              │
│ [✓] I agree to receive emails      │
│                                     │
│ [SUBSCRIBE] [NO THANKS]            │
└─────────────────────────────────────┘
```

### Mobile-Specific Layout

- **Sticky Search Bar:** Always visible at top when scrolling
- **Sticky Apply Button:** Bottom of screen, full width, 48px height
- **Filters Sidebar:** Slides in from bottom (bottom-sheet modal)
- **Job Cards:** Full width, tall cards with large touch targets
- **No horizontal scroll:** All content fits within viewport width

### Features Enabled
✅ Search & browse  
✅ Save jobs (localStorage)  
✅ Weekly email alerts  
✅ Apply (anonymous)  
❌ My Applications tracking (Phase 2)  
❌ Account login (Phase 2)

### Features Disabled (Hidden from UI)
- Job posting
- Resume search
- Recruiter tools
- Career coaching

---

## **USER TYPE 2: Job Seeker (Active)**

### Primary Goal
Apply quickly, track applications, get daily alerts on new matching jobs.

### Navigation & Layout

```
┌─────────────────────────────────────────┐
│ HEADER (Sticky)                         │
│ [Logo] [Search Bar] [Sign In / Register]│
└─────────────────────────────────────────┘
│
├─ HOMEPAGE (Same as Passive)
│  (Upsell to "Sign In" for tracking)
│
├─ SEARCH RESULTS (Same as Passive)
│
├─ JOB DETAIL PAGE (Enhanced)
│  ┌─────────────────────────────────────┐
│  │ [Company Logo] Job Title            │
│  │ Company Name ✓ | Location | Remote │
│  │ $80K–$120K/year • Full-time         │
│  │ [APPLY NOW] [SAVE JOB] [SHARE]     │
│  │                                     │
│  │ ⚠️ Premium Feature Alert (if not sub)
│  │ "Track this application and get    │
│  │ alerts when recruiters respond"    │
│  │ [Upgrade to Premium]               │
│  │                                     │
│  │ Job Description                     │
│  │ Requirements, Benefits, etc.       │
│  │                                     │
│  │ SIMILAR JOBS (Carousel)            │
│  └─────────────────────────────────────┘
│
└─ MY APPLICATIONS (Post-MVP, Phase 2)
   ├─ Application Status (Applied, Screening, etc.)
   ├─ Follow-up Reminders
   └─ Saved Jobs vs. Applied
```

### Key Differences from Passive Seeker

**Apply Button Behavior (Active)**
```
[APPLY NOW] → Opens modal with:
- Name, Email, Resume
- "Applying to [Company]"
- Submit → Confirmation
- Later: Can track this application
```

**After Apply (Active Seeker Upsell)**
```
┌─────────────────────────────────────┐
│ ✅ Application Submitted!           │
│                                     │
│ Next Steps:                         │
│ • You'll hear from [Company] soon  │
│ • Check your email for updates     │
│ • Follow up in 1 week if no reply  │
│                                     │
│ [Track This Application] (Phase 2)  │
│ [Continue Browsing]                │
│                                     │
│ 💡 Tip: Premium members can track  │
│ all applications and get alerts    │
│ [Upgrade to Premium $9.99/month]   │
└─────────────────────────────────────┘
```

### Features Enabled
✅ Search & browse  
✅ Save jobs  
✅ Apply (anonymous)  
✅ Email alerts (weekly, upsell to daily)  
🚀 My Applications tracking (Phase 2)  
🚀 Daily alerts (Phase 2, Premium)  
🚀 Career coaching (Phase 2, Premium)

### Features Disabled
- Job posting
- Resume search
- Recruiter tools

---

## **USER TYPE 3: HR Manager / Small Business**

### Primary Goal
Post jobs quickly, manage applicants, track hiring.

### Navigation & Layout

```
┌─────────────────────────────────────────┐
│ HEADER (Sticky)                         │
│ [Logo] [Dashboard] [New Job] [Sign Out]│
└─────────────────────────────────────────┘
│
├─ DASHBOARD
│  ┌─────────────────────────────────────┐
│  │ Welcome, John (HR Manager)          │
│  │                                     │
│  │ METRICS (Top row, cards)           │
│  │ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ │ 3 Jobs │ │ 42 Apps│ │ 8 Hired│  │
│  │ │ Posted │ │ Total  │ │ This Q │  │
│  │ └────────┘ └────────┘ └────────┘  │
│  │                                     │
│  │ OPEN JOBS (Table)                   │
│  │ Job Title | Apps | Status | Action │
│  │ Software Engineer | 15 | Live | ⋯  │
│  │ Sales Manager | 8 | Live | ⋯      │
│  │ Operations Lead | 5 | Draft | ⋯    │
│  │                                     │
│  │ [+ NEW JOB]                        │
│  └─────────────────────────────────────┘
│
├─ JOB POSTING WIZARD (3 Steps)
│  Step 1: Job Title, Company, Location, Type
│  Step 2: Description (WYSIWYG editor)
│  Step 3: Review & Publish
│  → Confirmation: "Job live, share link"
│
├─ APPLICANT INBOX (Per Job)
│  ┌─────────────────────────────────────┐
│  │ Software Engineer (15 applicants)   │
│  │                                     │
│  │ APPLICANTS (List)                   │
│  │ [Resume] John Doe | john@email.com │
│  │ [Resume] Jane Smith | jane@email   │
│  │ [Resume] Bob Johnson | bob@email   │
│  │                                     │
│  │ [Reply] [Review] [Advance to Stage]│
│  │                                     │
│  └─────────────────────────────────────┘
│
└─ COMPANY PROFILE
   ├─ Company name, logo, description
   ├─ Address, website
   └─ "Verified Employer" badge
```

### Key Components

**Job Posting Form (Step 1)**
```
┌─────────────────────────────────────┐
│ Step 1 of 3: Job Basics            │
│                                     │
│ Job Title: [Software Engineer]      │
│ Company: [TechCorp] (auto-filled)  │
│ Location: [San Francisco, CA]       │
│ Job Type: [Full-time ▼]            │
│ Salary (optional):                 │
│ ┌─────────────────┬─────────────┐ │
│ │ $100K           │ $150K       │ │
│ │ Min             │ Max         │ │
│ │ [Currency: USD] │             │ │
│ └─────────────────┴─────────────┘ │
│                                     │
│ [Back] [Next]                      │
└─────────────────────────────────────┘
```

**Job Posting Form (Step 2)**
```
┌─────────────────────────────────────┐
│ Step 2 of 3: Job Description       │
│                                     │
│ Description (WYSIWYG Editor):      │
│ ┌─────────────────────────────────┐│
│ │ About the Role                  ││
│ │ We're hiring for a Software ... ││
│ │                                 ││
│ │ Responsibilities:               ││
│ │ - Design APIs                   ││
│ │ - Lead team                     ││
│ │                                 ││
│ │ [B] [I] [U] [Link] [List]       ││
│ └─────────────────────────────────┘│
│                                     │
│ [Back] [Next]                      │
└─────────────────────────────────────┘
```

**Applicant Inbox (Simple Review)**
```
┌─────────────────────────────────────┐
│ Software Engineer — 15 Applicants  │
│                                     │
│ John Doe                            │
│ john@example.com | Applied 2 days  │
│ [Download Resume] [View Full]      │
│ [✓ Advance] [Mail Icon] [Trash]    │
│                                     │
│ Jane Smith                          │
│ jane@example.com | Applied 1 day   │
│ [Download Resume] [View Full]      │
│ [✓ Advance] [Mail Icon] [Trash]    │
│                                     │
└─────────────────────────────────────┘
```

### Features Enabled
✅ Job posting (free tier, simple form)  
✅ Applicant inbox (basic view)  
✅ Download resumes  
✅ Company profile (basic)  
✅ Job analytics (view counts, applicant count)  
❌ Resume search  
❌ Bulk upload  
❌ ATS (advanced pipeline)

### Features Disabled
- Search jobs
- Save jobs
- Career coaching
- Recruiter tools

---

## **USER TYPE 4: Employer / Startup CEO**

### Primary Goal
Post jobs quickly, build company brand, attract startup-minded talent.

### Navigation & Layout

```
(Similar to HR Manager, but with startup-specific sections)

┌─────────────────────────────────────────┐
│ HEADER                                  │
│ [Logo] [Dashboard] [Company Page] [+ Job]
└─────────────────────────────────────────┘
│
├─ COMPANY PAGE (Public)
│  ┌─────────────────────────────────────┐
│  │ [Company Logo] Startup XYZ         │
│  │ ✓ Verified Employer               │
│  │                                     │
│  │ "Building AI tools for developers" │
│  │ Founded 2024 • 15 employees       │
│  │ 🌐 website.com                    │
│  │                                     │
│  │ OPEN JOBS                          │
│  │ • Senior Engineer                  │
│  │ • Product Manager                  │
│  │ • Sales Lead                       │
│  │                                     │
│  │ Equity & Compensation              │
│  │ "We offer 0.5-2% equity packages" │
│  │ [See All Benefits]                │
│  │                                     │
│  │ [Follow Company] [See All Jobs]   │
│  └─────────────────────────────────────┘
│
├─ JOB POSTING (Startup-Specific Fields)
│  Step 1: Job Basics
│  Step 2: Description
│  Step 3: Equity & Compensation
│         ├─ Equity % Range (0.5–2%)
│         ├─ Bonus Structure
│         ├─ Benefits (checkboxes)
│         │  ☑ Health Insurance
│         │  ☑ Remote OK
│         │  ☑ PTO
│         │  ☑ Equity
│         └─ Culture Notes
│
├─ DASHBOARD (Same as HR Manager)
│  ├─ Metrics: jobs, applications, hired
│  ├─ Open jobs list
│  └─ Recent applications
│
└─ SOCIAL SHARING
   ├─ [Share on Twitter]
   ├─ [Share on LinkedIn]
   └─ [Share Link]
```

### Key Differences from HR Manager

**Equity & Compensation Step (Startup)**
```
┌─────────────────────────────────────┐
│ Step 3: Equity & Benefits           │
│                                     │
│ Salary: $120K–$150K + Equity       │
│ Equity (%): [1.0 - 1.5]            │
│                                     │
│ Benefits:                           │
│ ☑ Health Insurance                  │
│ ☑ Remote Work                       │
│ ☑ 20 days PTO                       │
│ ☑ Equity Vesting (4-year)          │
│ ☑ Learning Budget                  │
│                                     │
│ Culture Notes:                      │
│ [We're building the future of...]  │
│                                     │
│ [Back] [Publish]                   │
└─────────────────────────────────────┘
```

**Social Sharing (Post-Publish)**
```
┌─────────────────────────────────────┐
│ Job Published! 🎉                   │
│                                     │
│ [Share on Twitter]                 │
│ "We're hiring a Senior Engineer... │
│ [Link]"                            │
│                                     │
│ [Share on LinkedIn]                │
│ [Share via Email]                  │
│ [Copy Link]                        │
│                                     │
│ [See Job] [Back to Dashboard]      │
└─────────────────────────────────────┘
```

### Features Enabled
✅ Job posting (startup-specific fields)  
✅ Equity & compensation fields  
✅ Company profile (public, branding)  
✅ Social sharing (Twitter, LinkedIn, email)  
✅ Applicant inbox  
✅ Job analytics  
❌ Resume search  
❌ Bulk upload  

### Features Disabled
- Search jobs
- Career coaching
- Recruiter tools

---

## **USER TYPE 5: Admin (Platform)**

### Primary Goal
Monitor platform health, flag spam, manage abuse, ensure compliance.

### Navigation & Layout

```
┌─────────────────────────────────────────┐
│ ADMIN DASHBOARD                         │
│ [Logo] [Dashboard] [Moderation] [Users] │
│ [Reports] [Settings] [Sign Out]        │
└─────────────────────────────────────────┘
│
├─ DASHBOARD (Overview)
│  ┌─────────────────────────────────────┐
│  │ KEY METRICS (Top row)               │
│  │ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │ │ 45.2K  │ │ 12.3K  │ │ $234K  │   │
│  │ │ Jobs   │ │ Users  │ │ Revenue│   │
│  │ │ Posted │ │ Active │ │ MTD    │   │
│  │ └────────┘ └────────┘ └────────┘   │
│  │                                     │
│  │ ALERTS (Red, requires action)      │
│  │ 🔴 23 Flagged Jobs (Spam/Scam)    │
│  │ 🟡 5 User Appeals                  │
│  │ 🟡 2 Payment Disputes              │
│  │                                     │
│  │ SYSTEM HEALTH                       │
│  │ ✅ API: Green | DB: Green | Email: ⚠️
│  └─────────────────────────────────────┘
│
├─ MODERATION QUEUE
│  ┌─────────────────────────────────────┐
│  │ FLAGGED JOBS (23)                   │
│  │ [All] [Spam] [Scam] [Suspicious]   │
│  │                                     │
│  │ Job ID | Title | Employer | Flag   │
│  │ ─────────────────────────────────── │
│  │ J892   | "Work from home $$$"      │
│  │ XYZ Corp | Spam (keywords)         │
│  │ [Preview] [Approve] [Reject] [...]  │
│  │                                     │
│  │ J891   | "Urgent Hiring"           │
│  │ ABC Ltd | Scam (phishing detected)  │
│  │ [Preview] [Approve] [Reject] [...]  │
│  │                                     │
│  │ [Next] [Prev]                      │
│  └─────────────────────────────────────┘
│
├─ USER MANAGEMENT
│  ┌─────────────────────────────────────┐
│  │ USERS                               │
│  │ Search: [by name/email/ID]          │
│  │                                     │
│  │ User ID | Name | Type | Status     │
│  │ ─────────────────────────────────── │
│  │ U123    | John Smith | Recruiter   │
│  │ ✓ Active | 45 posts | [View] [Ban] │
│  │                                     │
│  │ U456    | Spammer | Job Seeker     │
│  │ ⛔ Banned | [Unban] [Delete]       │
│  │                                     │
│  └─────────────────────────────────────┘
│
└─ REPORTS & COMPLIANCE
   ├─ Monthly Moderation Report
   ├─ GDPR Compliance (data deletions)
   ├─ Revenue Report
   ├─ Audit Logs (all admin actions)
   └─ Export CSV/PDF
```

### Key Components

**Moderation Queue (Detailed View)**
```
┌─────────────────────────────────────┐
│ Job ID: J892 (Flagged for Spam)    │
│                                     │
│ PREVIEW:                            │
│ Title: "Work from home no exp $5K"  │
│ Description: [HTML rendered]        │
│ Employer: XYZ Corp (unverified)     │
│ Posted: 2 hours ago                │
│                                     │
│ FLAG REASON:                        │
│ • Keywords: "no experience needed"  │
│ • Employer: Unverified              │
│ • Posting velocity: 12 jobs/hour    │
│                                     │
│ CONFIDENCE: 95% (Likely Spam)      │
│                                     │
│ [Approve] [Reject] [Investigate]   │
│ [Add Note for Log]                 │
└─────────────────────────────────────┘
```

**Audit Logs (Compliance)**
```
┌─────────────────────────────────────┐
│ AUDIT LOGS                          │
│ Filter by: [Admin] [Date] [Action]  │
│                                     │
│ Time | Admin | Action | Target      │
│ ─────────────────────────────────── │
│ 10:23 | Sarah | Rejected | J892    │
│       | Reason: Spam keywords      │
│                                     │
│ 10:15 | Mike | Banned | U456       │
│       | Reason: Multiple reports   │
│                                     │
│ 09:47 | Sarah | Approved | J891    │
│       | (after investigation)       │
│                                     │
│ [Export CSV] [Export PDF]          │
└─────────────────────────────────────┘
```

### Features Enabled
✅ Moderation queue (flagged jobs)  
✅ User management (ban/suspend)  
✅ Audit logs (all actions)  
✅ Reports (compliance, revenue)  
✅ Rule-based flagging (keywords, velocity, verification status)  
🚀 AI moderation (Phase 2)  

### Features Disabled
- Search jobs
- Post jobs
- View applications (except for abuse investigation)

---

## **USER TYPE 6: Recruiter (In-House) — Phase 2**

### Primary Goal
Find candidates via resume search, manage applicants, track pipeline.

### Navigation & Layout (Planned for Phase 2)

```
┌─────────────────────────────────────────┐
│ RECRUITER DASHBOARD (Phase 2)           │
│ [Logo] [Search] [Applicants] [Pipeline] │
│ [Reports] [Profile] [Sign Out]         │
└─────────────────────────────────────────┘
│
├─ RESUME SEARCH (Phase 2)
│  ┌────────────────┬──────────────────┐
│  │ FILTERS (Left) │ RESULTS (Right) │
│  │ [Skills]       │ 342 resumes     │
│  │ [Experience]   │ Sort: Relevance│
│  │ [Location]     │                 │
│  │ [Salary]       │ [Resume Card 1]│
│  │ [Education]    │ [Resume Card 2]│
│  │ [Visa Status]  │ [Resume Card 3]│
│  │                │ [Pagination]   │
│  │ [Search]       │                 │
│  └────────────────┴──────────────────┘
│
├─ PIPELINE (ATS View)
│  ┌─────────────────────────────────────┐
│  │ HIRING PIPELINE: Software Engineer  │
│  │                                     │
│  │ Applied │ Screening │ Interview │ Offer
│  │   15    │    8      │     3     │   1
│  │                                     │
│  │ [Drag to Move Between Stages]      │
│  │                                     │
│  │ Applied Stage:                     │
│  │ • John Doe (5 days)                │
│  │ • Jane Smith (3 days)              │
│  │ • Bob Johnson (1 day)              │
│  └─────────────────────────────────────┘
│
└─ BULK UPLOAD (CSV/API)
   ├─ Upload candidates via CSV
   ├─ Sync with ATS/HRIS
   └─ Bulk actions (tag, message, move)
```

### Features Enabled (Phase 2 only)
🚀 Resume search  
🚀 Pipeline/ATS view  
🚀 Bulk candidate upload  
🚀 Email templates & bulk messaging  
🚀 Interview scheduling  

### Features Disabled
- Search jobs
- Post jobs (use employer dashboard)

---

## SUMMARY: UI DIFFERENCES BY USER TYPE

| User Type | Primary Surface | Design Style | Complexity |
|-----------|---|---|---|
| **Job Seeker (Passive)** | Search + Browse | Clean, minimal, mobile-first | Low |
| **Job Seeker (Active)** | Apply + Track | Same as Passive + upsells | Low-Medium |
| **HR Manager** | Dashboard + Posting | Business-focused, dense | Medium |
| **Employer/CEO** | Dashboard + Branding | Startup-friendly, visual | Medium |
| **Admin** | Moderation Queue | Data-heavy, compliance-focused | High |
| **Recruiter** (Ph2) | Resume Search + ATS | Dense grid, pipeline view | High |

---

## FEATURE ROLLOUT (MVP vs Phase 2 Timeline)

### MVP (Week 1–10)
✅ Job Seeker (Passive): Search + Browse + Weekly Alerts  
✅ Job Seeker (Active): Apply + Email Alerts  
✅ HR Manager: Job Posting + Applicant Inbox  
✅ Employer/CEO: Job Posting + Company Profile + Social Sharing  
✅ Admin: Moderation Queue (rule-based)

### Phase 2 (Week 11–24)
🚀 Job Seeker: My Applications Dashboard + Daily Alerts + Premium Features  
🚀 Recruiter: Resume Search + ATS Pipeline + Bulk Upload  
🚀 Admin: AI Moderation + Advanced Audit Reports  

### Phase 3 (Week 25+)
🚀 CSM Dashboard + CRM Sync  
🚀 Analytics/Insights B2B Product  
🚀 Language Support (Arabic, Hindi)

---

**Status:** UI specs locked in per user type. Ready for design handoff.
