# MVP Requirements Document — jobbrowser.app

**Version:** 1.0 (Post-Review, Scope-Locked)  
**Status:** Ready for Development  
**Target Ship Date:** 10–12 weeks from start (revised from 4–8 weeks per FRAMEWORK.md)  
**Team Size:** 1–2 full-stack engineers + 1 product/design

---

## Executive Summary

**MVP Scope:** Job seeker aggregator + basic employer job posting, focused on **Passive + Active Job Seekers** (85% of user base).

**What We're Shipping:**
- Browse, search, filter, save jobs
- Weekly email digests (job alerts)
- Job posting for HR managers (simple form, no recruiter tools)
- Basic admin moderation (rule-based spam flagging)
- Mobile-first responsive design, 5 regional customizations

**What We're Deferring to Phase 2:**
- Recruiter ATS (resume search, applicant tracking)
- Staffing agency bulk API
- Premium job seeker features (career coaching, resume builder)
- CSM dashboard + CRM sync
- AI-based moderation (replacing rules-based MVP)

**Target Revenue (M1–6):** $42.5K–$199K/month (affiliate backfill + basic job posting)

---

## User Types (MVP Focus)

| Type | Priority | Included in MVP? | Notes |
|------|----------|---|---|
| Job Seeker (Passive) | ⭐⭐⭐⭐⭐ | ✅ YES | Core user, 60% of volume. Browse, search, save, weekly alerts. |
| Job Seeker (Active) | ⭐⭐⭐⭐ | ✅ YES (partial) | Core user, 25% of volume. Apply flow works; "My Applications" tracking deferred to Phase 2. |
| HR Manager (Small Biz) | ⭐⭐⭐ | ✅ YES (minimal) | Simple job posting form, basic applicant inbox. No recruiter features. |
| Employer/CEO (Startup) | ⭐⭐⭐ | ✅ YES (partial) | Job posting, company profile. Social sharing deferred. |
| Recruiter (In-House) | ⭐⭐ | ❌ NO — Phase 2 | ATS, resume search, applicant tracking deferred. Don't sell this tier in MVP. |
| Staffing Agency | ⭐⭐ | ❌ NO — Phase 2 | Bulk API, CSV upload deferred. Don't sell enterprise tier in MVP. |
| Premium Job Seeker | ⭐ | ❌ NO — Phase 2 | Career tools, resume builder, interview prep deferred. |
| Admin (Platform) | ⭐ | ✅ YES (minimal) | Basic moderation queue, rule-based flagging, user ban. |
| CSM (Customer Success) | ⭐ | ❌ NO — Phase 2 | CSM dashboard, CRM sync, reporting deferred. |
| Analytics/Insights | ⭐ | ❌ NO — Phase 2 | B2B data product deferred. |

**Key Insight:** Focusing on Job Seekers (Passive + Active) and basic Employers gets 85% of MVP value with 40% less scope.

---

## Core Flows (MVP)

### Flow 1: Job Seeker Browse & Search

**Actor:** Passive job seeker  
**Happy Path:**
1. Visit jobbrowser.app homepage
2. See featured jobs + hero search bar
3. Enter job title + location
4. Browse results (paginated, 10–50 per page)
5. Click job card → view full listing
6. Click "Save Job" (stored in browser or account)
7. Click "Set Alert" → email consent → weekly digest

**Design Touchpoints:**
- Homepage (hero + featured jobs)
- Search results page (filters sidebar, job cards, pagination)
- Job detail page (full description, apply button, similar jobs)
- Alert setup modal (frequency selection, email input)

**Success Metrics:**
- 1,000+ jobs indexed week 1
- <300ms search response time
- Mobile: 90%+ of actions on-screen (no horizontal scroll)

---

### Flow 2: Job Seeker Apply

**Actor:** Active job seeker  
**Happy Path:**
1. View job listing
2. Click "Apply"
3. Provide minimal info (name, email, resume file)
4. Submit
5. Confirmation: "Your application has been sent"
6. Redirect to employer application page (or affiliate job board)

**Important:** User never logs in or creates an account. Application is submitted anonymously via email to employer.

**Design Touchpoints:**
- Apply button (prominent, sticky on mobile)
- Apply modal (name, email, file upload)
- Success confirmation modal

**Success Metrics:**
- <5 seconds from click to submission
- 70%+ of apply clicks complete successfully
- No lost applications

---

### Flow 3: Employer Post a Job

**Actor:** HR Manager or Startup CEO  
**Happy Path:**
1. Visit jobbrowser.app → "Post a Job" button
2. 3-step form:
   - **Step 1:** Job title, company name, location, job type
   - **Step 2:** Job description (WYSIWYG editor)
   - **Step 3:** Review & post
3. Job posted, employer gets confirmation email
4. Employer can view application count (basic analytics)

**Important:** No login required. Job posting is free in MVP (paid tiers come in Phase 2).

**Design Touchpoints:**
- "Post a Job" CTA (homepage, navigation)
- Job posting wizard (3-step form)
- Success: job live, employer can share link
- Job performance email (weekly, automated)

**Success Metrics:**
- <10 minutes to post a job
- 100+ jobs posted by end of week 1
- Employer can delete/edit posted jobs

---

### Flow 4: Weekly Email Alert

**Actor:** Passive job seeker + job alert subscribers  
**Trigger:** Once per week (Fridays, 9 AM PT / 6 PM GST / 2 PM UK time)

**Email Content:**
- Subject: "Your Weekly Job Digest — [X] new jobs matching your interests"
- Body:
  - 5–10 top matching jobs (based on saved/browsed jobs)
  - Salary ranges
  - Apply button (direct link, no login)
  - Settings link (to manage frequency, unsubscribe)
- Footer: Privacy, unsubscribe

**Important:** No payload in the email ties the user to an account (pure affiliate model). Unsubscribe is one-click.

**Success Metrics:**
- 30%+ open rate (recruitment emails typically 32–42%)
- <1% unsubscribe rate per send
- <0.5% spam complaint rate

---

### Flow 5: Admin Moderation (Rule-Based)

**Actor:** Admin  
**Happy Path:**
1. Log in to admin panel (`/admin`)
2. See moderation queue: flagged jobs
3. Review job: title, description, employer
4. Decision: Approve or Reject
5. Action: Job published or removed; employer notified

**Flagging Rules (MVP, not AI):**
- Keyword blocklist (e.g., "work from home no experience $5000" = likely spam)
- Employer verification status (unverified employer = flag)
- Posting velocity (same employer posting 50 jobs in 1 hour = flag)
- Link analysis (external links to known phishing domains = flag)

**Design Touchpoints:**
- Admin login
- Moderation queue dashboard
- Job preview modal with approve/reject buttons

**Success Metrics:**
- <2% false-positive rate (legitimate jobs flagged as spam)
- <5% false-negative rate (spam jobs slip through)
- All flagged jobs reviewed within 24 hours

---

## Data Model (High-Level)

### Core Tables

**jobs**
```
id (PK)
title, description, company_name
location, region (UAE, Saudi, India, Australia, USA)
salary_min, salary_max, salary_currency, salary_normalized_usd
job_type (full-time, part-time, contract, internship)
employer_email, verified_employer (boolean)
source_url (if from API), source (adzuna, careerjet, jooble, direct)
posted_at, expires_at
status (draft, published, rejected, expired)
created_at, updated_at
```

**job_alerts**
```
id (PK)
email, frequency (weekly), preferences (JSON: keywords, location, salary_min)
subscribed_at, last_sent_at
unsubscribed_at
created_at, updated_at
```

**moderation_flags**
```
id (PK)
job_id (FK)
reason (keyword_match, posting_velocity, unverified_employer, suspicious_link)
status (flagged, approved, rejected)
admin_reviewed_at, admin_id
created_at
```

**applications** (future, not MVP)
```
id (PK)
job_id (FK)
seeker_email, seeker_name, resume_url
submitted_at
status (applied, screening, interview, offered, rejected)
created_at
```

---

## Technical Architecture (MVP)

### Stack
- **Frontend:** Next.js 14, React 18, Tailwind CSS, TypeScript
- **Backend:** Next.js API routes (serverless)
- **Database:** PostgreSQL (Supabase or AWS RDS)
- **Search:** Postgres `tsvector` + full-text search (MVP); Meilisearch (Phase 2)
- **Email:** SendGrid or AWS SES + BullMQ for queue
- **Hosting:** Vercel (frontend + API routes)
- **Auth:** Next-Auth.js (for admin only; no job seeker login)
- **Monitoring:** Vercel Analytics + Sentry for errors

### Key Architectural Decisions

1. **Single Next.js app** with route groups:
   - `(seeker)/` — public job search, homepage, job detail
   - `(employer)/` — job posting wizard, applicant inbox
   - `(admin)/` — moderation dashboard, admin users
   - Middleware-based RBAC (role checks on protected routes)

2. **No user accounts for job seekers** (MVP):
   - Job alerts stored per email (no login)
   - Saved jobs stored in browser localStorage or cookie
   - Applications submitted anonymously via email
   - Phase 2: Add job seeker accounts + application tracking

3. **Email queue architecture:**
   - BullMQ (Redis-backed queue) or SQS + Lambda
   - Scheduled job: Friday 9 AM, query alerts + matching jobs + send
   - Retry logic for failed sends (exponential backoff)

4. **Affiliate backfill:**
   - Careerjet + Jooble API pull (daily crawl or feed)
   - Deduplication: same job from multiple sources = single listing
   - Job expiry: remove if not found in sources after 30 days

5. **Admin moderation:**
   - Pre-publish: new jobs flagged before indexing
   - Rule engine: keyword + velocity + link checks
   - Queue: flagged jobs wait for admin approval
   - Bulk actions: approve/reject multiple at once

---

## Monetization (MVP)

### Revenue Streams (MVP Only)

| Stream | Model | Projected |
|--------|-------|-----------|
| Affiliate CPC/CPA | Careerjet, Jooble affiliate clicks | $12.5K/month (M1-3), scaling to $50K+ (M6-12) |
| Job Posting | Free (MVP only) | $0 (seeded adoption) |
| AdSense | Display ads (low volume) | $50–200/month |
| **Total MVP** | | **$12.5K–$50K/month** |

### **Intentionally NOT Included (Phase 2+)**

- Recruiter subscriptions ($299–$499/month) — no recruiter features in MVP
- Premium job seeker ($19.99/month) — career tools deferred
- Staffing agency ($999+/month) — bulk API deferred
- Employer branding ($5.5K) — company profiles basic only
- CSM services — no dedicated support tier
- Analytics tier ($499–$2,999) — no B2B data product yet

**Rationale:** Selling features you don't ship damages trust. Better to under-promise (free MVP) and upgrade in Phase 2 once demand is proven.

---

## Success Metrics (MVP, 0–12 weeks)

| Metric | Target | Notes |
|--------|--------|-------|
| **Jobs Indexed** | 1,000 by week 2, 50K+ by week 12 | Via Careerjet + Jooble APIs + direct posts |
| **Monthly Visitors** | 5K (M1), 25K+ (M3), 100K+ (M6) | Organic from Google Jobs + SEO |
| **Job Seeker Signups for Alerts** | 500 (M1), 5K (M3), 20K+ (M6) | Email list growth = retention lever |
| **Job Applications** | 100 (M1), 1K (M3), 5K+ (M6) | Affiliate click conversion |
| **Affiliate Revenue** | $12.5K (M1), $50K (M3), $180K+ (M6) | Via CPC/CPA networks |
| **Admin Moderation** | <24h time to review, <2% false positives | Quality + speed |
| **Email Open Rate** | 30%+ (recruitment baseline) | Indicator of alert relevance |
| **Mobile Traffic** | 70%+ of visitors | Job search is mobile-first |
| **Lighthouse Scores (Public Pages)** | FCP <1.5s, LCP <2.5s, CLS <0.1 | Seeker-facing pages only; dashboards exempt |

---

## Out of Scope (Phase 2+)

### Features Explicitly Deferred

- Recruiter ATS (resume search, applicant tracking, bulk messaging)
- Staffing agency API (bulk CSV upload, automation)
- Premium job seeker features (career coaching, resume builder, interview prep)
- CSM dashboard + CRM integration
- Analytics/Insights B2B product
- AI-based moderation (rules-based MVP only)
- Daily job alerts (weekly only)
- In-app messaging / direct recruiter contact
- Interview scheduling / calendar integration
- Glassdoor-style company reviews
- Language support (Arabic, Hindi) — English only
- Employer branding packages
- White-label / reseller model

### Why These Are Deferred

- **Scope creep risk:** Each would add 2–5 weeks to build
- **Revenue risk:** No proven demand yet; wait for MVP traction
- **Team capacity:** 1–2 engineers can't build all in 10 weeks
- **Technical debt:** Core platform stability > feature sprawl

---

## Known Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Job posting spam (malicious employers) | Rule-based flagging, manual review, email verification |
| Email deliverability (spam folder) | SendGrid reputation management, DKIM/SPF/DMARC, monitor bounce rate |
| Job seeker privacy (resume/email exposed) | No account = no login; limited data exposure; comply with GDPR deletion (1 year) |
| Competitor copy (Indeed, LinkedIn) | Speed to market; niche focus (salary transparency); mobile-first design |
| Affiliate volume/payouts decline | Diversify: affiliate + job posting (Phase 2) + premium (Phase 2) |
| Affiliate link compliance (FTC) | Disclose affiliate relationships on apply redirects |

---

## Timeline (10–12 Weeks)

| Week | Phase | Deliverables |
|------|-------|---|
| 1–2 | Setup | Repo, dev env, DB schema, Vercel setup, auth (admin only) |
| 3–4 | Search UI | Homepage, search bar, filters, job listing page (design → code) |
| 5–6 | Job Posting | Employer posting wizard (3 steps), applicant inbox, email notifications |
| 7–8 | Email Alerts | Alert subscription flow, email template, queue setup, weekly send job |
| 9–10 | Admin Panel | Moderation queue, rule-based flagging, user management dashboard |
| 11–12 | Polish & Launch | Mobile testing, performance optimization, SEO setup (Google Search Console), launch |

---

## Definition of Done (MVP Launch)

- [ ] 1,000+ jobs indexed (via Careerjet + Jooble + 10 direct posts)
- [ ] Homepage + search results page live and indexed by Google
- [ ] Job posting form live (free tier)
- [ ] Weekly email alerts sent to 100+ subscribers
- [ ] Admin moderation queue functional (manual review, no AI)
- [ ] Mobile responsive (375px–1440px)
- [ ] Lighthouse >90 on public pages (seeker-facing)
- [ ] WCAG AA contrast on seeker pages
- [ ] Privacy policy + ToS live
- [ ] Google Search Console verified, sitemap submitted
- [ ] Affiliate tracking wired (Careerjet, Jooble CPC/CPA live)
- [ ] Basic error monitoring (Sentry)
- [ ] No critical bugs on core flows (search, posting, alerts, apply)

---

## Handoff to Phase 2

Post-MVP launch (week 12+), document for Phase 2:
- User feedback on missing recruiter features
- Affiliate payout data (which job categories drive revenue)
- Job alert engagement (open rate, unsubscribe, search behavior)
- Admin moderation patterns (top spam keywords, false positive cases)
- Payment provider selection (Stripe + Razorpay final decision)
- Recruiter demand signals (LinkedIn/Indeed competition intel)

**Phase 2 kickoff:** Recruiter ATS, premium features, CSM tooling based on MVP learnings.

---

**Status:** Locked in for development. Ready to code.
