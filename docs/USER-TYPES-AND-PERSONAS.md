# User Types & Personas — jobbrowser.app

**Version:** 1.0  
**Purpose:** Define 10 primary user personas, their needs, and CSM/ISM requirements  
**Scope:** All 5 regions (UAE, Saudi, India, Australia, USA)

---

## USER TYPE OVERVIEW

| # | Type | Primary Goal | Region Priority | Volume Est. |
|---|------|---|---|---|
| 1 | **Job Seeker (Passive)** | Browse casually, build skills | India, USA | 60% |
| 2 | **Job Seeker (Active)** | Actively applying, urgent hire need | All regions | 25% |
| 3 | **Recruiter (In-House)** | Fill specific roles, track applicants | UAE, Saudi, USA | 5% |
| 4 | **Staffing Agency** | Volume hiring, bulk postings | India, USA | 3% |
| 5 | **HR Manager (Small Biz)** | Post jobs, manage postings | All regions | 2% |
| 6 | **Employer/CEO (Startup)** | Attract talent, build team | USA, India | 2% |
| 7 | **Premium Job Seeker** | Career coaching, resume boost | USA, Australia | 1.5% |
| 8 | **Admin (Platform)** | Monitor health, abuse, compliance | All | 0.3% |
| 9 | **CSM (Customer Success)** | Employer support, retention | All | 0.2% |
| 10 | **Analytics/Insights User** | Data-driven hiring, market trends | USA, UAE | 1% |

---

## PERSONA DETAILS & DESIGN REQUIREMENTS

### 1. **Job Seeker (Passive)**

**Profile:**
- Age: 25–45
- Primary driver: Career exploration, skill-building
- Engagement: 2–3 hours/week browsing
- Device: 70% mobile, 30% desktop
- Pain point: Overwhelmed by too many choices; doesn't know what they want yet

**Primary Flows:**
- Browse jobs by category/location
- Save jobs for later
- Set up job alerts (weekly digest preferred)
- View salary ranges to understand market

**Design Requirements:**
- **Homepage:** "Discover your next role" messaging
- **Search:** Broad filters, suggestions ("Similar to roles you've viewed")
- **Alerts:** Email digest (1–2 per week), not overwhelming
- **Mobile:** Simple, swipe-friendly job cards
- **Savings:** "Collections" (e.g., "Remote tech jobs", "Back to office roles")

**CSM/ISM Needs:**
- Help content: "How to search effectively"
- Email nurture: Weekly digest with curated jobs
- No upsell required; keep free experience clean

---

### 2. **Job Seeker (Active)**

**Profile:**
- Age: 25–55
- Primary driver: Urgent need to change jobs (quit, layoff, contract end)
- Engagement: 3–5 hours/day, rapid clicking
- Device: 60% mobile, 40% desktop
- Pain point: Needs to apply fast; frustrated by slow processes

**Primary Flows:**
- Search specific role/location
- Apply quickly (one-click or minimal steps)
- Track application status
- Get alerts on new matching jobs (daily)
- Direct contact with recruiters

**Design Requirements:**
- **Search:** Fast, responsive, no lag
- **Apply Button:** Prominent, fast feedback ("Submitted!")
- **Tracking:** "My Applications" dashboard (status, follow-up dates)
- **Alerts:** Daily emails for new matching jobs
- **Mobile:** Large tap targets, one-hand navigation

**CSM/ISM Needs:**
- Premium subscription offer ($9.99/month): priority alerts, profile boost
- Help content: "How to write a compelling application"
- Email: Daily alerts (customizable frequency)
- Support: Chat for application issues

---

### 3. **Recruiter (In-House)**

**Profile:**
- Age: 30–50
- Primary driver: Fill open requisitions, meet hiring targets
- Engagement: 2–4 hours/day, focused search + applicant review
- Device: 90% desktop, 10% mobile
- Pain point: Managing applications across platforms; losing track of candidates

**Primary Flows:**
- Post job opening (fast, no setup friction)
- Search candidate resumes
- Review applications (sort by fit)
- Contact candidates directly
- Track hiring pipeline
- Schedule interviews
- Manage multiple open roles

**Design Requirements:**
- **Employer Dashboard:** Dedicated recruiter UI (not job seeker design)
- **Job Posting:** Step-by-step form, templates for common roles
- **Resume Search:** Filter by skills, experience, location
- **Applicant Tracker:** Pipeline view (Applied → Screening → Interview → Offered)
- **Bulk Actions:** Reply to multiple candidates at once
- **Analytics:** Job performance (views, applies, conversions)
- **Mobile:** Notifications on new applications (mobile-friendly alerts)

**CSM/ISM Needs:**
- Employer onboarding: "Getting started" checklist
- Training content: Video tutorials on posting, searching, tracking
- Premium subscription ($299–$499/month): Resume access, bulk messaging, ATS integration
- Support: Email + phone for account issues
- Retention: Monthly check-ins, performance reports

---

### 4. **Staffing Agency**

**Profile:**
- Age: 30–60
- Primary driver: High-volume hiring, contract placements
- Engagement: 4–6 hours/day, bulk operations
- Device: 95% desktop, 5% mobile
- Pain point: Posting hundreds of jobs, managing many candidates, repetitive work

**Primary Flows:**
- Bulk upload jobs (CSV, API)
- Auto-post to multiple job boards
- Receive and screen bulk applicants
- Candidate database management
- Track placements and metrics
- Contract/candidate status updates

**Design Requirements:**
- **Bulk API:** REST API for job posting, applicant sync
- **CSV Upload:** Batch job posting, bulk updates
- **Candidate Database:** Import, segment, tag candidates
- **Automated Workflows:** Post job → auto-email candidates → track placements
- **Reporting:** Placement rates, revenue per job, time-to-fill
- **Dashboard:** Agency-level view (all clients/jobs/placements)
- **White-Label Option (Future):** Custom branding for sub-agency resale

**CSM/ISM Needs:**
- Enterprise subscription ($999+/month): API access, bulk uploads, custom integrations
- Onboarding: Technical setup (API keys, CSV templates)
- Training: Account manager assigned to agency
- Support: Dedicated Slack channel for technical issues
- Retention: Quarterly business reviews, platform roadmap updates

---

### 5. **HR Manager (Small Business)**

**Profile:**
- Age: 28–55
- Primary driver: Fill roles occasionally, manage employment compliance
- Engagement: 1–2 hours/week (sporadic, around hiring cycles)
- Device: 70% desktop, 30% mobile
- Pain point: Don't want to learn complex hiring tools; need simple solution

**Primary Flows:**
- Post a job opening (5-minute process)
- Review applications
- Schedule interviews
- Make offers
- Basic reporting (how many applied, source of hires)

**Design Requirements:**
- **Job Posting:** 3-step wizard, minimal required fields, templates for common roles
- **Applicant Review:** Simple inbox view, filter/sort by rating
- **Interview Scheduling:** Calendar sync (optional)
- **Offer Letter:** Template + send (simple email-based)
- **Analytics:** Basic dashboard (applications, conversion rate)
- **Compliance:** Privacy reminders, data retention policies

**CSM/ISM Needs:**
- Starter subscription ($99–$199/month): Posting + basic tracking
- Onboarding: Email walk-through, quick-start guide
- Help content: FAQ, email support only
- Minimal training needed; intuitive UI critical

---

### 6. **Employer/CEO (Startup)**

**Profile:**
- Age: 25–45
- Primary driver: Build team fast, find founder-fit candidates
- Engagement: 1–3 hours/week (sporadic, between leadership duties)
- Device: 60% mobile, 40% desktop
- Pain point: Limited budget; wants visibility without paying premium; values networking

**Primary Flows:**
- Post startup jobs (emphasize equity, culture)
- Search by startup background/culture fit
- Direct messaging with candidates
- Social sharing (jobs shared on Twitter, LinkedIn)
- Track applications and candidates
- Employer branding (company profile, culture description)

**Design Requirements:**
- **Startup-Friendly Posting:** Equity/compensation fields, culture highlight section
- **Company Profile:** Logo, culture description, team photos, perks list
- **Social Sharing:** Easy share buttons (Twitter, LinkedIn, email)
- **Talent Search:** "Looking for startup experience" filter
- **Messaging:** Direct contact with candidates (no intermediary)
- **Employer Branding:** Glassdoor-style reviews/ratings (future)
- **Free + Premium:** Free tier with 1–2 free jobs/month; Premium for unlimited ($299/month)

**CSM/ISM Needs:**
- Freemium model: Offer free jobs to attract startups to platform
- Onboarding: Email + brief call with founder
- Community: Startup job board showcase, marketing mentions
- Support: Email support, community Slack for founders
- Retention: Founder meetups, pitch opportunities

---

### 7. **Premium Job Seeker**

**Profile:**
- Age: 30–50
- Primary driver: Career advancement, salary negotiation, executive roles
- Engagement: 1–2 hours/day (focused, intentional)
- Device: 50% mobile, 50% desktop
- Pain point: Can't find executive/niche roles; wants career coaching

**Primary Flows:**
- Search executive/specialized roles
- View detailed salary benchmarks
- Access career coaching resources
- Resume optimization tools
- Interview prep courses
- Priority alerts for new roles
- Direct contact with recruiters

**Design Requirements:**
- **Niche Job Board:** Separate "Executive" or "Specialized" tab
- **Salary Data:** Detailed benchmarks (by title, company, region, experience)
- **Career Tools:** Resume builder, interview prep, salary negotiation guide
- **Premium Badge:** "Premium member" label visible to employers
- **Profile Boost:** Feature on top of recruiter searches
- **Courses:** Partner with Udemy/Coursera for career content
- **Direct Access:** In-app messaging with recruiters

**CSM/ISM Needs:**
- Premium subscription ($19.99–$29.99/month): All features above
- Onboarding: Setup profile, preferences
- Content: Monthly career tips, webinars, interviews with hiring managers
- Support: Priority email support
- Upsell: Intro to recruiters (for $49 one-time fee)
- Retention: Career success stories, alumni network

---

### 8. **Admin (Platform)**

**Profile:**
- Age: 25–40
- Primary driver: Platform health, compliance, abuse prevention
- Engagement: 4–6 hours/day (ongoing monitoring)
- Device: 100% desktop
- Pain point: Detecting fake jobs/employers, managing disputes

**Primary Flows:**
- Monitor suspicious listings (AI flagging)
- Review reported jobs/employers
- Ban bad actors
- View system health metrics
- Manage user appeals
- Audit logs (who did what, when)
- Compliance reporting

**Design Requirements:**
- **Admin Dashboard:** System metrics (jobs posted, active users, revenue)
- **Moderation Queue:** Flagged jobs, flagged users, appeals
- **Job Review:** Preview listing, decision buttons (Approve/Reject/Investigate)
- **User Management:** Search users, view history, suspend/ban
- **Reports:** Compliance (GDPR, CCPA), abuse trends, monthly summary
- **Audit Logs:** Track all actions (who approved what job, when)
- **Email Templates:** Automated rejection/approval emails

**CSM/ISM Needs:**
- Training: Moderation policy, anti-spam detection
- Tools: Automated flagging (AI model for spam detection)
- Support: Escalation path for complex cases
- Reporting: Monthly moderation report to leadership

---

### 9. **CSM (Customer Success Manager)**

**Profile:**
- Age: 28–50
- Primary driver: Employer retention, upsell, support
- Engagement: 6–8 hours/day (customer-focused)
- Device: 100% desktop
- Pain point: Managing many customers; tracking who's at risk

**Primary Flows:**
- View customer account health
- Track posting activity, application volume
- Identify at-risk customers (low activity, churn signals)
- Send targeted outreach (job performance reports, tips)
- Schedule check-in calls
- Manage support tickets
- Track upsell opportunities

**Design Requirements:**
- **CSM Dashboard:** Customer list, health status (green/yellow/red), last activity
- **Customer Profile:** Account details, posting history, application trends, support tickets
- **Reporting:** Custom reports (activity, ROI metrics, performance summary)
- **Email Campaigns:** Templated outreach (job performance reports, tips, upsells)
- **Ticket System:** Support queue, response tracking, escalation
- **CRM Integration:** Sync with Salesforce/HubSpot
- **Feedback Tracker:** Customer feedback on feature requests

**CSM/ISM Needs:**
- Training: Customer success playbook, churn prevention tactics
- Tools: Email templates, reporting infrastructure
- Support: Access to product/eng for escalations
- Retention metrics: Churn rate, NPS, customer lifetime value

---

### 10. **Analytics/Insights User**

**Profile:**
- Age: 28–50
- Primary driver: Data-driven hiring decisions, market insights
- Engagement: 2–4 hours/week (focused analysis)
- Device: 100% desktop
- Pain point: Can't find actionable insights on hiring trends

**Primary Flows:**
- View hiring trends by region/industry/job type
- Export salary data for benchmarking
- Monitor competitor hiring (which companies are hiring for what)
- Identify skill gaps in the market
- Generate custom reports

**Design Requirements:**
- **Analytics Dashboard:** Hiring trends, salary insights, job market data
- **Custom Reports:** Filter by region, industry, experience level, skills
- **Data Export:** CSV/Excel export for analysis
- **Salary Data:** Aggregated, anonymized salary ranges by region/role
- **Competitor Insights:** Which companies hiring for what roles (public data only)
- **Skill Trends:** Emerging skills, in-demand roles by region
- **Forecasting:** Projected hiring needs (by season, industry)

**CSM/ISM Needs:**
- B2B subscription ($499–$2,999/month): Data access, custom reports, API
- Onboarding: Business use-case discussion, setup
- Support: Dedicated account manager for enterprise deals
- Training: How to interpret data, best practices
- Updates: Quarterly insights reports (HR trends, salary benchmarks)

---

## ISM (Information/System Management) REQUIREMENTS

### By User Type

| User Type | Data Critical? | Compliance Needs | Support Level | SLA |
|-----------|---|---|---|---|
| Job Seeker (Passive) | Low | Privacy (email) | Email | 24–48h |
| Job Seeker (Active) | Medium | Privacy, data retention | Chat + Email | 6–12h |
| Recruiter | High | GDPR, CCPA, EEOC | Phone + Email | 1–4h |
| Staffing Agency | Very High | Compliance reporting, data security | Dedicated account manager | <1h |
| HR Manager | High | Compliance, data retention | Email + Phone | 4–24h |
| Employer/Startup | Medium | Privacy, ToS | Email | 24h |
| Premium Job Seeker | Medium | Privacy, payment | Priority email | 6h |
| Admin | Critical | Audit logs, compliance | Escalation path | Real-time |
| CSM | Medium | CRM privacy, confidentiality | Slack, email | 2h |
| Analytics User | High | Data anonymization, confidentiality | Dedicated support | 4h |

### Data Retention Policies

- **Job Seeker Data:** Delete after 1 year of inactivity (or on request)
- **Application Data:** Retain for 2 years (legal requirement)
- **Recruiter Resume Access:** No permanent storage; access log tracked
- **Admin Audit Logs:** Retain 7 years (compliance)

---

## CSM (Customer Success Manager) REQUIREMENTS

### Employer Success Metrics

**By Tier:**

**Free Tier (Small Biz):**
- Target: 10–20 applications per job posted
- Engagement: 1 email per month (job performance summary)
- Support: Email only
- Churn triggers: No postings in 60 days → Email reminder

**Starter Tier ($99/month):**
- Target: 20–50 applications per job
- Engagement: Bi-weekly job tips email
- Support: Email + chat
- Churn triggers: No logins in 30 days → Call from CSM

**Professional Tier ($299/month):**
- Target: 50+ applications per job, 5+ hires per month
- Engagement: Monthly check-in call, custom reports
- Support: Phone + email + chat
- Churn triggers: Declining application volume → Proactive outreach

**Enterprise Tier ($999+/month):**
- Target: 100+ applications per job, 10+ hires per month
- Engagement: Dedicated account manager, quarterly business reviews
- Support: 1-hour SLA, dedicated Slack channel
- Churn triggers: Real-time alerting if health score drops

### CSM Workflow

1. **Onboarding:** Welcome call, setup checklist, first job posted
2. **Nurture:** Weekly tips, job performance emails (automated)
3. **Expansion:** Upsell to higher tier based on job volume
4. **Retention:** Monthly calls for top accounts, churn prevention
5. **Offboarding:** Exit survey, attempt win-back

---

## ADMIN PANEL SPECIFICATION

### Dashboard (Overview)

```
┌─────────────────────────────────────────────┐
│ Admin Dashboard                             │
├─────────────────────────────────────────────┤
│                                             │
│ Key Metrics (Top row, cards)               │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ │ 45.2K    │ │ 12.3K    │ │ $234K    │   │
│ │ Jobs     │ │ Users    │ │ Revenue  │   │
│ │ Posted   │ │ Active   │ │ MTD      │   │
│ └──────────┘ └──────────┘ └──────────┘   │
│                                             │
│ Flagged Items (Urgent, red badge)         │
│ ┌─────────────────────────────────────┐   │
│ │ 23 Flagged Jobs (Spam/Scam)        │   │
│ │ 5 User Appeals                     │   │
│ │ 2 Payment Disputes                 │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ System Health                              │
│ ┌─────────────────────────────────────┐   │
│ │ API Health: ✓ Green                │   │
│ │ Database: ✓ Green (95% disk)       │   │
│ │ Email Queue: ⚠ Yellow (1.2K queued)│   │
│ └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### Moderation Queue

```
FLAGGED JOBS
┌─────────────────────────────────────────┐
│ [All] [Spam] [Scam] [Inappropriate] [Other]
│                                         │
│ Job ID | Title | Employer | Flag Type │
│ ─────────────────────────────────────  │
│ J892   | "Work from home $$$" | XYZ   │ Spam
│        | Reason: Multiple red-flag keywords
│        | [Preview Job] [Approve] [Reject] [Investigate]
│                                         │
│ J891   | "Urgent Hiring" | ABC Corp   │ Scam
│        | Reason: Flagged as phishing (external links)
│        | [Preview Job] [Approve] [Reject] [Investigate]
│                                         │
└─────────────────────────────────────────┘
```

### User Management

```
USERS
┌─────────────────────────────────────────┐
│ Search: [by name/email/ID] [Filter]    │
│                                         │
│ User ID | Name | Type | Status | Acts │
│ ─────────────────────────────────────  │
│ U123    | John Smith | Recruiter | ✓  │ View
│         | Employer: Tech Corp | 45 posts
│                                         │
│ U456    | Spammer | Job Seeker | ⛔ Banned
│         | Reason: Multiple fake apps
│         | [View Details] [Appeal History]
│                                         │
└─────────────────────────────────────────┘
```

### Reports & Compliance

```
REPORTS
┌─────────────────────────────────────────┐
│ [Monthly Moderation] [GDPR Compliance]  │
│ [Revenue Report] [Job Trends] [Custom] │
│                                         │
│ Monthly Moderation Report (Dec 2025)   │
│ ┌─────────────────────────────────────┐│
│ │ Jobs Flagged: 156                  ││
│ │ Jobs Rejected: 42 (27%)            ││
│ │ Jobs Approved: 114 (73%)           ││
│ │ Top Violation: Spam (65%)          ││
│ │ Avg Resolution Time: 4.2 hours    ││
│ │ [Download CSV] [Export PDF]        ││
│ └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

### Audit Logs

```
AUDIT LOGS
┌─────────────────────────────────────────┐
│ Search: [Admin action] [Date range]    │
│                                         │
│ Time | Admin | Action | Target | Change
│ ─────────────────────────────────────  │
│ 10:23 | Sarah | Rejected Job | J892 | Spam flagged
│ 10:15 | Mike | Banned User | U456 | Status: Active → Banned
│ 09:47 | Sarah | Approved Job | J891 | Status: Flagged → Published
│                                         │
│ [Export Logs] [Filter by Date] [Print] │
└─────────────────────────────────────────┘
```

---

## NEXT STEPS FOR REVIEW

This document should be reviewed by:

1. **Codex (Technical Review)**
   - Are the required features technically feasible?
   - Any API/data modeling concerns?
   - Admin panel scalability?

2. **Claude (UX/Business Logic Review)**
   - Do design specs align with each user type's needs?
   - Are CSM/ISM flows practical?
   - Any missing user types or flows?
   - Compliance gaps?

---

**Status:** Ready for Codex + Claude review.
