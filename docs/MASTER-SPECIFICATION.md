# MASTER SPECIFICATION — jobbrowser.app

**Version:** 2.0 (Consolidated & Contradiction-Free)  
**Status:** READY FOR DEVELOPMENT  
**Created:** 2026-07-25  
**Previous Docs:** Archived in `/docs/ARCHIVE/` (do not use)

---

## TABLE OF CONTENTS

1. **Executive Summary**
2. **Phasing Strategy** (MVP / Phase 2 / Phase 3)
3. **Core Architecture & Technology Stack**
4. **Data Model (Complete Schema)**
5. **User Types & Feature Matrix**
6. **User Flows (MVP Only)**
7. **UI Specifications (by User Type)**
8. **Design System & Components**
9. **Monetization Model**
10. **Success Metrics & Timeline**
11. **Deployment & Operations**
12. **Appendix: Resolved Contradictions**

---

## 1. EXECUTIVE SUMMARY

**Product:** jobbrowser.app — Legitimate job aggregator across 5 regions (UAE, Saudi Arabia, India, Australia, USA), monetized via CPC/CPA affiliate networks + employer job postings + optional premium features.

**MVP Scope:** Job seekers (passive + active) + basic employer job posting + admin moderation + weekly email alerts.

**MVP Timeline:** 12–14 weeks (revised from 10–12; includes affiliate pipeline + accessibility testing)

**Target Revenue (Year 1):** $2.5M (base case) — affiliate clicks ($500K–$1M) + job posting + future premium tiers

**MVP Launch Target:** Week 12 with 1,000+ indexed jobs, organic traffic from Google, affiliate revenue live

---

## 2. PHASING STRATEGY

### MVP (WEEKS 1–12) — PRIMARY FOCUS

**Ship these user types:**
- ✅ Job Seeker (Passive) — browse, search, save, weekly email alerts
- ✅ Job Seeker (Active) — apply, email alerts (weekly, upsell to daily Phase 2)
- ✅ HR Manager (Small Business) — simple job posting form, basic applicant inbox
- ✅ Employer/CEO (Startup) — job posting with equity/benefit fields, company profile
- ✅ Admin (Platform) — rule-based moderation, user management, basic audit logs

**DO NOT ship (explicitly deferred):**
- ❌ Recruiter (In-House) — resume search, ATS, applicant tracking, bulk messaging
- ❌ Staffing Agency — bulk API, CSV upload, automated workflows
- ❌ Premium Job Seeker — career coaching, resume builder, interview prep, salary benchmarks
- ❌ CSM (Customer Success) — customer dashboard, CRM sync, advanced reporting
- ❌ Analytics/Insights — B2B data product, forecasting, custom reports
- ❌ AI Moderation — ML-based spam detection (use rules-based MVP)

**MVP Revenue Focus:**
- Affiliate backfill (Careerjet, Jooble CPC/CPA) — target $12.5K–$50K/month
- Free job posting (to seed supply-side)
- Weekly email alerts (no upsell in MVP)

**Success Criteria:**
- 1,000+ jobs indexed by week 2, 50K+ by launch
- 5K+ monthly visitors by week 12
- 100+ job applications/month by launch
- $12.5K–$50K monthly affiliate revenue by month 3–6

---

### PHASE 2 (WEEKS 13–24) — SECOND PRIORITY

**Ship:**
- 🚀 Recruiter (In-House) — resume search (Meilisearch), ATS pipeline, bulk messaging
- 🚀 Staffing Agency — bulk API, CSV upload, automated ingestion
- 🚀 Premium Job Seeker — daily alerts upsell ($9.99/month), career tools, resume builder
- 🚀 Job Seeker "My Applications" — track application status, follow-up reminders
- 🚀 CSM Dashboard — customer health, email campaigns, retention workflows
- 🚀 Replace rule-based moderation with AI detection (OpenAI API or third-party)
- 🚀 Paid job posting tiers ($99–$499/month for employers)

**Phase 2 Revenue Focus:**
- Employer subscriptions ($299–$999/month) — target $50K–$150K/month
- Premium job seeker ($9.99/month) — target $15K–$50K/month
- Featured listings markup (+50% premium)

---

### PHASE 3 (WEEKS 25–36) — LONG-TERM

**Ship:**
- 🚀 Analytics/Insights B2B product ($499–$2,999/month)
- 🚀 Language support (Arabic, Hindi)
- 🚀 Glassdoor-style company reviews
- 🚀 Interview scheduling + calendar integration
- 🚀 White-label for staffing agencies
- 🚀 Employer featured listings (premium, $500–$5K/month)

---

## 3. CORE ARCHITECTURE & TECHNOLOGY STACK

### Tech Stack (MVP)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript | Full-stack framework, serverless-friendly, fast routing |
| **CSS/Design** | Tailwind CSS | Utility-first, mobile-first, rapid iteration |
| **Backend** | Next.js API routes (Vercel) | Serverless, scales automatically, integrated with frontend |
| **Database** | PostgreSQL (Supabase or AWS RDS) | Relational, full-text search, JSON support |
| **Search** | Postgres `tsvector` (MVP) → Meilisearch (Phase 2) | MVP uses native; Phase 2 adds dedicated search for resume/job search |
| **Email Queue** | SQS + Lambda (serverless-compatible) | Works with Vercel, no persistent worker required |
| **Email Provider** | SendGrid or AWS SES | Industry-standard, good deliverability, regional support |
| **File Storage** | Supabase Storage or AWS S3 | For resume uploads, job postings with attachments |
| **Authentication** | NextAuth.js (employer/admin only) | Employer + Admin login; Job seekers = no accounts (MVP) |
| **Monitoring** | Vercel Analytics + Sentry | Error tracking, performance monitoring |
| **Hosting** | Vercel (frontend + API routes) | Serverless, built-in CD/CI, fast deployment |
| **Payment** | Stripe (USA/Australia) + Razorpay (India) | Multi-currency support for Phase 2 subscriptions |

### Deployment Architecture

```
┌─────────────────────────────────────┐
│ Users (5 regions)                   │
│ jobbrowser.app                      │
└──────────────┬──────────────────────┘
               │
       ┌───────▼────────┐
       │ Vercel         │
       ├─ Frontend      │
       ├─ API Routes    │
       └───────┬────────┘
               │
     ┌─────────┼──────────┐
     │         │          │
  ┌──▼──┐  ┌──▼──┐  ┌────▼────┐
  │  DB │  │ S3  │  │ SendGrid │
  │(RDS)│  │     │  │+ SQS     │
  └─────┘  └─────┘  └──────────┘
       │
  ┌────▼──────────┐
  │ Affiliate APIs│
  │ Careerjet     │
  │ Jooble        │
  │ Adzuna        │
  └───────────────┘
```

---

## 4. DATA MODEL (COMPLETE SCHEMA)

### Tables (MVP)

#### `jobs`
```sql
id (PK, UUID)
title (varchar)
description (text, HTML)
company_id (FK → companies.id)
company_name (varchar, denormalized for MVP)
location (varchar)
region (enum: UAE, Saudi, India, Australia, USA)
salary_min, salary_max (int, nullable)
salary_currency (varchar: USD, AED, SAR, INR, AUD)
salary_normalized_usd (int, nullable) — for cross-region search/sorting
job_type (enum: full-time, part-time, contract, internship)
source (enum: direct, adzuna, careerjet, jooble, greenhouse, lever)
source_url (varchar)
employer_email (varchar)
employer_verified (boolean, default false)
posted_at (timestamp)
expires_at (timestamp)
status (enum: draft, flagged, published, rejected, expired)
equity_min_pct, equity_max_pct (decimal, nullable) — startups
bonus_structure (text, nullable) — startups
benefits (jsonb, nullable) — {health: true, remote: true, pto: 20, ...}
culture_notes (text, nullable) — startups
created_at, updated_at, deleted_at (timestamp)
```

#### `companies`
```sql
id (PK, UUID)
name (varchar, unique)
website (varchar, nullable)
logo_url (varchar, nullable)
description (text, nullable)
address (varchar, nullable)
region (enum: UAE, Saudi, India, Australia, USA)
verified (boolean, default false)
verified_at (timestamp, nullable)
verification_token (varchar, nullable, unique) — for email verification
verification_token_expires (timestamp, nullable)
created_at, updated_at
```

#### `job_alerts`
```sql
id (PK, UUID)
email (varchar)
frequency (enum: weekly, daily) — MVP: weekly only
preferences (jsonb) — {keywords: [...], locations: [...], salary_min: 80000, ...}
subscribed_at (timestamp)
last_sent_at (timestamp, nullable)
unsubscribed_at (timestamp, nullable)
created_at, updated_at
```

#### `moderation_flags`
```sql
id (PK, UUID)
job_id (FK → jobs.id)
rule_triggered (varchar) — "keyword_match", "posting_velocity", "unverified", "suspicious_link"
confidence (decimal 0–1)
status (enum: flagged, approved, rejected, investigating)
admin_notes (text, nullable)
admin_reviewed_by (varchar, nullable) — admin email
admin_reviewed_at (timestamp, nullable)
created_at
```

#### `admin_users`
```sql
id (PK, UUID)
email (varchar, unique)
password_hash (varchar)
role (enum: moderator, admin, superadmin)
created_at, updated_at
last_login (timestamp, nullable)
```

#### `employer_sessions` (OAuth-style, MVP)
```sql
id (PK, UUID)
company_id (FK → companies.id)
email (varchar)
session_token (varchar, unique)
token_expires (timestamp)
created_at
```

**Note:** Job Seeker accounts (Phase 2) will add `users` table. Application tracking (Phase 2) will add `applications` table.

---

## 5. USER TYPES & FEATURE MATRIX

### MVP User Types (5 Types)

| Feature | Job Seeker (Passive) | Job Seeker (Active) | HR Manager | Employer/CEO | Admin |
|---------|---|---|---|---|---|
| **Search & Browse Jobs** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Save Jobs (localStorage MVP)** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Apply (Anonymous)** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Job Alerts (Weekly)** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Saved Jobs Dashboard** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Post Jobs (Free)** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Company Profile** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Applicant Inbox** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Download Resumes** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Job Analytics (App Count)** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Moderation Queue** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **User Management (Ban/Suspend)** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Audit Logs** | ❌ | ❌ | ❌ | ❌ | ✅ |

### Deferred User Types (Phase 2+)

| User Type | Phase | Key Features |
|-----------|-------|---|
| **Recruiter (In-House)** | Phase 2 | Resume search, ATS pipeline, bulk messaging |
| **Staffing Agency** | Phase 2 | Bulk API, CSV upload, white-label |
| **Premium Job Seeker** | Phase 2 | Daily alerts ($9.99/mo), career tools, salary benchmarks |
| **CSM (Customer Success)** | Phase 2 | Customer dashboard, email campaigns, CRM sync |
| **Analytics/Insights** | Phase 3 | Market data, salary reports, forecasting ($499–$2,999/mo) |

---

## 6. USER FLOWS (MVP ONLY)

### Flow 1: Job Seeker (Passive) — Browse & Alert

**Happy Path:**
1. Visit jobbrowser.app homepage
2. See featured jobs + hero search bar
3. Enter job title + location → search results
4. Browse jobs, click card to view full details
5. Click "Save Job" → stored in localStorage (no account)
6. Click "Set Alert" → modal asks for email
7. Confirm weekly digest subscription
8. Weekly (Fridays 9 AM PT): Email digest arrives with 5–10 new matching jobs

**Success Metric:** 30%+ email open rate, <1% unsubscribe

---

### Flow 2: Job Seeker (Active) — Apply

**Happy Path:**
1. View job listing page
2. Click "Apply" button
3. Modal appears: "Name, Email, Upload Resume"
4. Fill fields, upload resume file
5. Click "Submit Application"
6. jobbrowser captures application data, sends applicant's resume + contact info to employer email
7. Success screen: "Your application has been sent to [Employer]. Check your email for updates."
8. User redirected to affiliate partner job board (Careerjet/Jooble) for alternate applications

**Key Detail:** Application is submitted via email to employer; jobbrowser stores email + resume for admin/moderation purposes, but user doesn't create an account.

**Success Metric:** <5 sec submit time, 70%+ success rate, affiliate click tracking live

---

### Flow 3: Employer/HR Manager — Post Job

**Happy Path:**
1. Visit jobbrowser.app → "Post a Job" button
2. Enter email address → auto-send verification email to company domain
3. Click verification link in email
4. 3-step form wizard:
   - Step 1: Job title, company name, location, job type
   - Step 2: Description (WYSIWYG editor)
   - Step 3: Review & publish
5. Job published to site + indexed by Google + visible in search results
6. Employer receives weekly email: "Your job got X views, Y applications"

**Auth:** Magic link (email verification); no password required. Session stored in `employer_sessions` table.

**Key Detail:** No employer account persistence in MVP (Phase 2 adds accounts). If employer wants to edit/delete, they get a unique link per job.

**Success Metric:** 100+ jobs posted by week 1, <10 min to post

---

### Flow 4: Admin — Moderation

**Happy Path:**
1. Admin logs into `/admin` with NextAuth
2. Dashboard shows: metrics (jobs posted, users, revenue), flagged jobs queue
3. Click on flagged job
4. Preview: title, description, employer, flag reason, confidence score
5. Decision: Approve or Reject
6. If Approved: job moves to "published"; employer notified
7. If Rejected: job removed; employer notified with reason

**Flagging Rules (Rule-Based, Not AI):**
- Keyword blocklist: "work from home no experience $5000" → spam
- Unverified employer: employer not yet email-verified → flag for review
- Posting velocity: same employer posts 50 jobs in 1 hour → flag
- Link analysis: external links to known phishing domains → flag
- Confirmed: <2% false positive rate

**Success Metric:** All flagged jobs reviewed <24 hours; <2% false-positive rate

---

## 7. UI SPECIFICATIONS (by User Type)

### **JOB SEEKER UI** (All job seekers share this interface)

**Homepage**
```
┌─────────────────────────────────────┐
│ HEADER (Sticky)                     │
│ [Logo jobbrowser] [Search Bar]      │
│ [Post a Job] [Set Alerts]           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ HERO SECTION                        │
│ "Discover Your Next Opportunity"   │
│ [Job Title] [Location] [SEARCH]    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ FEATURED JOBS (Carousel)            │
│ "Trending Right Now"                │
│ [Card 1] [Card 2] [Card 3]         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ VALUE PROPS                         │
│ ✓ Real jobs from verified employers│
│ ✓ Salary transparency included    │
│ ✓ Apply directly to employers     │
└─────────────────────────────────────┘

FOOTER
[Privacy] [Terms] [Contact]
```

**Search Results Page**
```
┌────────────────┬──────────────────┐
│ FILTERS (300px)│ RESULTS          │
│ [Location]     │ 342 jobs found  │
│ [Job Type]     │ Sort: Relevance │
│ [Salary Range] │                 │
│ [Company]      │ [Job Card 1]    │
│ [Date Posted]  │ [Job Card 2]    │
│                │ [Job Card 3]    │
│ [Apply]        │ [Pagination]    │
└────────────────┴──────────────────┘
```

**Job Card (Mobile-First)**
```
┌──────────────────────────────────┐
│ [Logo] Company ✓                 │
│ Job Title (18px bold)            │
│ Location • Remote                │
│ $80K–$120K/year                  │
│ Posted 3 days ago • 24 apps      │
│                                  │
│ [APPLY] [❤ SAVE]                │
└──────────────────────────────────┘
```

**Job Detail Page**
```
┌─────────────────────────────────────┐
│ [Logo] Job Title                   │
│ Company ✓ | Location | Remote      │
│ $80K–$120K/year • Full-time        │
│ [APPLY NOW] [SAVE JOB] [SHARE]    │
│                                     │
│ JOB DESCRIPTION                    │
│ (HTML, formatted)                  │
│                                     │
│ SIMILAR JOBS (Carousel)            │
└─────────────────────────────────────┘
```

**Alert Signup Modal**
```
┌─────────────────────────────────────┐
│ Get Weekly Job Digest              │
│ Email: [enter email]               │
│ Frequency: [Weekly ▼]              │
│ [✓] Agree to emails                │
│ [SUBSCRIBE] [NO THANKS]            │
└─────────────────────────────────────┘
```

### **EMPLOYER/HR MANAGER UI**

**Dashboard (After Email Verification)**
```
┌─────────────────────────────────────┐
│ HEADER                              │
│ [Logo] [Dashboard] [New Job]        │
│ [Sign Out]                          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ METRICS (Cards)                     │
│ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │ 3 Jobs │ │ 42 Apps│ │ 8 Hired│   │
│ │ Posted │ │ Total  │ │ This Q │   │
│ └────────┘ └────────┘ └────────┘   │
│                                     │
│ OPEN JOBS (Table)                   │
│ Title | Applications | Status | Act │
│ Software Engineer | 15 | Live | ⋯  │
│ Sales Manager | 8 | Live | ⋯       │
│                                     │
│ [+ NEW JOB]                         │
└─────────────────────────────────────┘
```

**Job Posting Wizard (3 Steps)**
```
Step 1: Basics
[Job Title] [Company] [Location] [Type] [Salary Min/Max]

Step 2: Description
[WYSIWYG Editor] — paste or type job description

Step 3: Review
Title: Software Engineer
Description: [preview]
[Edit] [PUBLISH]
```

**Applicant Inbox**
```
Software Engineer (15 applicants)

[Applicant 1]
Name: John Doe | john@email.com
[View Resume] [Reply] [Advance]

[Applicant 2]
Name: Jane Smith | jane@email.com
[View Resume] [Reply] [Advance]
```

**Startup-Specific (Employer/CEO)**
```
Step 3: Equity & Benefits
Salary: $120K–$150K + Equity
Equity: [1.0%–1.5%]
Benefits: ☑ Health ☑ Remote ☑ PTO
Culture: [We're building...]
[Publish & Share]
```

### **ADMIN UI**

**Dashboard**
```
┌─────────────────────────────────────┐
│ ADMIN DASHBOARD                     │
├─────────────────────────────────────┤
│ Metrics:                            │
│ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │ 45.2K  │ │ 12.3K  │ │ $234K  │   │
│ │ Jobs   │ │ Users  │ │ Revenue│   │
│ └────────┘ └────────┘ └────────┘   │
│                                     │
│ ALERTS:                             │
│ 🔴 23 Flagged Jobs                  │
│ 🟡 5 Appeals                        │
│                                     │
│ SYSTEM HEALTH:                      │
│ ✅ API: Green | ✅ DB: Green       │
└─────────────────────────────────────┘
```

**Moderation Queue**
```
┌─────────────────────────────────────┐
│ FLAGGED JOBS (23)                   │
│ [All] [Spam] [Scam] [Suspicious]   │
│                                     │
│ Job ID | Title | Employer | Flag   │
│ ─────────────────────────────────── │
│ J892 | "Work from home $$$" | Spam │
│ Confidence: 95%                     │
│ [Preview] [Approve] [Reject]        │
│                                     │
│ J891 | "Urgent Hiring" | Scam      │
│ Confidence: 87%                     │
│ [Preview] [Approve] [Reject]        │
└─────────────────────────────────────┘
```

---

## 8. DESIGN SYSTEM & COMPONENTS

### Color Palette

| Usage | Color | Hex |
|-------|-------|-----|
| Primary (Action) | Blue | #007AFF |
| Secondary (Success) | Green | #10B981 |
| Salary/Positive | Green | #10B981 |
| Verified Badge | Blue checkmark | #007AFF |
| Warning/Alert | Amber | #F59E0B |
| Error | Red | #EF4444 |
| Text (Primary) | Dark Gray | #1F2937 |
| Text (Secondary) | Medium Gray | #6B7280 |
| Background (Light) | Light Gray | #F3F4F6 |
| Background (Card) | White | #FFFFFF |

### Typography

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| **H1** | Inter | 32px | 700 | 1.2 |
| **H2** | Inter | 24px | 600 | 1.3 |
| **H3** | Inter | 20px | 600 | 1.4 |
| **Body Large** | Inter | 16px | 400 | 1.6 |
| **Body** | Inter | 14px | 400 | 1.6 |
| **Body Small** | Inter | 12px | 400 | 1.5 |
| **Label** | Inter | 12px | 600 | 1.5 |

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | <640px | Single column, stacked filters |
| Tablet | 640–1024px | Two-column (filters + content) |
| Desktop | >1024px | Three-column (sidebar + content + ads) |

### Key Components

**Job Card**
```
[Logo] Company ✓ | Location | Remote
Job Title (bold)
$80K–$120K/year
Posted Xd ago • N applications
[APPLY] [❤ SAVE]
```

**Button Styles**
- Primary: Blue bg, white text, hover darker
- Secondary: Outline blue, solid text
- Danger: Red bg, white text

**Accessibility**
- WCAG 2.1 AA compliance on public pages (job seeker)
- Color contrast 4.5:1 minimum
- Keyboard navigation throughout
- Focus indicators on all interactive elements

---

## 9. MONETIZATION MODEL

### MVP (Months 1–3)

| Stream | Model | Projected |
|--------|-------|-----------|
| **Affiliate CPC/CPA** | Careerjet, Jooble per-click | $12.5K/month |
| **Job Posting (Free)** | Free to seed supply | $0 (incentive) |
| **AdSense** | Display ads, low traffic | $100–$300/month |
| **TOTAL** | | **$12.5K–$12.8K/month** |

### Phase 2 (Months 4–12)

| Stream | Model | Projected |
|--------|-------|-----------|
| **Affiliate (growing)** | Volume increases | $50K–$180K/month |
| **Job Posting (Paid Tiers)** | $100–$300 per post | $5K–$20K/month |
| **Premium Job Seeker** | $9.99/month (daily alerts, resume tools) | $15K–$50K/month |
| **Employer Subscriptions** | $299–$999/month (unlimited posts, resume search) | $50K–$150K/month |
| **Featured Listings** | +50% markup on job postings | $5K–$15K/month |
| **Email Sponsorships** | $50–$500 per send (once list >50K) | $1K–$5K/month |
| **TOTAL** | | **$126K–$420K/month** |

### Year 1 Projection

**Baseline Case:**
- M1–3: $12.5K–$12.8K/month = $37.5K
- M4–6: $50K–$100K/month = $225K
- M7–12: $126K–$180K/month = $900K
- **Total Year 1: $1.16M**

**Optimistic Case (+40%):**
- Total Year 1: **$1.6M**

**Conservative Case (-40%):**
- Total Year 1: **$700K**

---

## 10. SUCCESS METRICS & TIMELINE

### MVP Success Metrics (Milestones)

| Week | Milestone | Target |
|------|-----------|--------|
| **Week 1–2** | Foundation + first 1,000 jobs indexed | 1,000 jobs live, Google indexing starts |
| **Week 3–4** | Search + browse working, homepage live | 5K monthly visitors, organic traffic begins |
| **Week 5–6** | Email alerts working, first subscribers | 100+ alert subscribers, weekly digest tested |
| **Week 7–8** | Employer posting + inbox live | 50+ jobs posted, first applicants |
| **Week 9–10** | Admin moderation + user management | Spam detection working, <2% false positives |
| **Week 11–12** | Polish, testing, launch | 50K+ jobs indexed, 5K+ visitors, affiliate revenue live |

### Definition of Done (MVP Launch)

- [ ] 1,000+ jobs indexed (via Careerjet + Jooble + direct posts)
- [ ] Homepage, search results, job detail pages live & indexed by Google
- [ ] Job posting form (3-step wizard) working, email verification live
- [ ] Applicant inbox functional (download resume, reply via email)
- [ ] Weekly email alert digest working, 100+ subscribers
- [ ] Admin moderation queue functional (rule-based flagging, approve/reject)
- [ ] Affiliate tracking wired (CPC/CPA clicks tracked, payout-ready)
- [ ] Mobile responsive (375px–1440px)
- [ ] Lighthouse >90 on public pages (job seeker only)
- [ ] WCAG AA contrast on seeker pages
- [ ] Privacy policy + Terms of Service live
- [ ] Google Search Console verified, sitemap submitted
- [ ] Sentry error monitoring live
- [ ] No critical bugs on core flows (search, apply, alerts, posting)

### Realistic Timeline

| Phase | Duration | Effort | Note |
|-------|----------|--------|------|
| **MVP** | 12–14 weeks | 2 FTE engineers | Revised up from 10–12; includes affiliate pipeline + a11y testing |
| **Phase 2** | 12–16 weeks | 2–3 FTE engineers | Adds recruiter ATS, premium features, CSM tooling |
| **Phase 3** | 8–12 weeks | 2–3 FTE engineers | Analytics product, language support, enterprise features |

---

## 11. DEPLOYMENT & OPERATIONS

### Hosting & Infrastructure

| Component | Service | Cost |
|-----------|---------|------|
| **Frontend + API** | Vercel Pro | $20–$100/month |
| **Database** | Supabase or AWS RDS | $50–$500/month |
| **File Storage** | Supabase Storage or S3 | $5–$50/month |
| **Email Sending** | SendGrid | $10–$100/month |
| **Error Monitoring** | Sentry | Free–$50/month |
| **Domain** | Namecheap/Porkbun | $9–$15/year |
| **Total Infra Cost** | | **~$100–$700/month** |

### Operational Responsibilities (MVP)

**Week 1–2:**
- Set up repos (GitHub), CI/CD (Vercel), monitoring (Sentry)
- Database migrations + schema deployment
- Affiliate API key setup (Careerjet, Jooble)

**Weeks 3–12:**
- Daily: monitor errors (Sentry), fix critical bugs
- Weekly: review analytics, moderation queue, affiliate payouts
- Post-launch: scale database if needed, optimize queries

**Phase 2+:**
- Hire ops person for scaling, customer support
- Establish SLAs for CSM support, enterprise contracts

---

## 12. APPENDIX: RESOLVED CONTRADICTIONS

### Contradiction #1: "My Applications" Tracking

**Original Conflict:**
- USER-TYPES said "primary flow" for Active Seekers
- MVP-REQUIREMENTS said "deferred to Phase 2"

**RESOLUTION:**
- **MVP:** Active Seekers can apply, get confirmation email, but NO tracking dashboard
- **Phase 2:** Add "My Applications" dashboard + email status updates
- **Rationale:** MVP focuses on basic apply → affiliate conversion; tracking adds complexity

### Contradiction #2: Daily vs Weekly Alerts

**Original Conflict:**
- USER-TYPES said "daily alerts"
- MVP-REQUIREMENTS said "weekly only"

**RESOLUTION:**
- **MVP:** Weekly digests only (Friday 9 AM PT)
- **Phase 2:** Daily alerts as premium upsell ($9.99/month)
- **Rationale:** Weekly is easier to implement + manage, reduces email fatigue MVP

### Contradiction #3: Apply Button Submission

**Original Conflict:**
- Unclear whether jobbrowser captures or redirects to affiliate

**RESOLUTION:**
- **MVP:** jobbrowser captures applicant email + resume file
- Sends email to employer with resume attachment
- Redirects user to affiliate partner (Careerjet/Jooble) for additional applications
- **Benefit:** Captures affiliate metrics + employer email for phase 2 follow-up

### Contradiction #4: Employer Authentication

**Original Conflict:**
- UI showed "Dashboard + Sign Out"
- Architecture said "no login required"

**RESOLUTION:**
- **MVP:** Magic-link auth (email verification only, no password)
- Session stored in `employer_sessions` table
- Per-job unique links for edit/delete (no persistent dashboard in MVP)
- **Phase 2:** Add full employer accounts + persistent dashboard
- **Rationale:** Reduces friction (no password), still allows verification + job management

### Contradiction #5: Applications Table

**Original Conflict:**
- Schema said "Phase 2 only"
- Applicant inbox flows required it

**RESOLUTION:**
- **MVP:** Create `applications` table (needed for applicant inbox)
- Store: applicant_name, applicant_email, resume_url, submitted_at
- Do NOT build "My Applications" dashboard (job seeker side) — that's Phase 2
- **Rationale:** Backend needs to persist applications for employer inbox; frontend tracking is phase 2

### Contradiction #6: Employer Verification

**Original Conflict:**
- Flagging rule mentions "verified_employer" but no verification flow defined

**RESOLUTION:**
- **MVP Process:**
  1. Employer posts job via posting wizard
  2. jobbrowser auto-sends verification email to company domain (e.g., john@techcorp.com)
  3. Employer clicks link in email
  4. Email verified → job auto-approves and publishes
  5. Verified badge shown on job card + company profile
- **Fallback:** Admin can manually verify via moderation queue if needed

### Contradiction #7: Job Seeker Accounts

**Original Conflict:**
- Design specs showed "Sign In / Register" button
- MVP-REQUIREMENTS said "no job seeker accounts"

**RESOLUTION:**
- **MVP:** Hide login buttons for job seekers
- Saved jobs = browser localStorage (not cross-device)
- Alerts = email-based subscriptions (no account required)
- **Header UI:** Only shows "Post a Job" and "Set Alerts" CTAs for job seekers
- **Phase 2:** Add job seeker accounts for cross-device saved jobs + application tracking

### Contradiction #8: Company Profile Scope

**Original Conflict:**
- UI-BY-USER-TYPE showed company profiles in MVP
- MVP-REQUIREMENTS was silent

**RESOLUTION:**
- **MVP:** Basic company profile (name, logo, website, short description)
- Populated by employer during job posting wizard
- Shown on job card + job detail page
- Verified badge shown if email verified
- **Phase 2:** Enhanced profiles (team photos, culture page, ratings)

### Contradiction #9: Salary Display Condition

**Original Conflict:**
- Design specs assume salary always present
- Many jobs may not disclose salary

**RESOLUTION:**
- **Display Rules:**
  - If salary_min & salary_max present: show "$80K–$120K/year"
  - If only salary_min: show "$80K+/year"
  - If neither: do NOT show placeholder ("Competitive salary"); omit salary line
- **Regional Format:**
  - USD: "$80K–$120K/year"
  - AED: "AED 250K–350K/year"
  - INR: "₹50L–80L/year" or "₹5000K–8000K"
  - AUD: "AUD $80K–$120K/year"
  - SAR: "SAR 250K–400K/year"

### Contradiction #10: Affiliate Redirect Flow

**Original Conflict:**
- Underspecified whether apply click = affiliate conversion

**RESOLUTION:**
- **Apply Flow (Resolved):**
  1. User clicks "Apply Now" on jobbrowser listing
  2. Apply modal: name, email, resume file
  3. jobbrowser submits to employer email
  4. After success screen, redirect to Careerjet/Jooble job board
  5. Redirect includes UTM params + affiliate ID
  6. If user clicks "Apply" on affiliate partner → affiliate pays jobbrowser
  7. If user applies directly to employer → jobbrowser doesn't get paid but captured lead for Phase 2 follow-up
- **Revenue:** Primarily from affiliate partners' CPC/CPA, supplemented by Phase 2 job posting fees

---

## FINAL CHECKLIST BEFORE DEVELOPMENT

- [x] MVP scope locked (5 user types, no Phase 2 features)
- [x] Architecture decided (Next.js, Postgres, SQS+Lambda, Supabase Storage)
- [x] Authentication model chosen (magic-link for employers, no job seeker accounts)
- [x] Data model complete (jobs, companies, job_alerts, moderation_flags, admin_users, employer_sessions)
- [x] All 10 contradictions resolved
- [x] User flows documented (4 core flows)
- [x] UI specs provided (job seeker, employer, admin)
- [x] Design system spec'd (colors, typography, breakpoints)
- [x] Monetization model realistic ($12.5K–$50K/month MVP, scaling to $1M+ Year 1)
- [x] Timeline realistic (12–14 weeks for MVP with 2 FTE)
- [x] Success metrics defined
- [x] Definition of Done locked

---

## STATUS: READY FOR DEVELOPMENT ✅

**This document is the single source of truth for jobbrowser.app development.**

**Do not reference archived documents.** All decisions are consolidated here.

**Questions?** Any ambiguity found during dev work should be clarified via comments in this document, not revisited from old specs.
