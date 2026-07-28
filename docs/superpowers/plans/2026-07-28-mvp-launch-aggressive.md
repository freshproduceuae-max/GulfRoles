# MVP Launch (Aggressive) — 6-Day Build Plan

**Goal:** Ship jobbrowser.app MVP in 6 calendar days with parallel agents + full-day user reviews.

**User Commitment:** 2–3 hours evening review (Day 1–5), full day Friday (Day 6: launch).

**Timeline:** 
- Day 1: Foundation (repo, DB, auth)
- Day 2: UI components + search
- Day 3: Alerts + employer posting  
- Day 4: Admin moderation + affiliate
- Day 5: Testing + fixes + polish
- Day 6: Launch + monitoring

---

## DAY 1: FOUNDATION (Monday)

**Agent Count:** 3 parallel agents (independent tasks, no dependencies)

**Tasks:**

### Agent 1.1: Repo Setup & CI/CD
- Create package.json, tsconfig, next.config, tailwind.config
- Create .env.example, .gitignore, README
- Commit: "feat: initialize Next.js 14 project"
- **Output:** Repo ready for DB + auth agents

### Agent 1.2: PostgreSQL Schema & DB Client
- Create db/migrations/001_init_schema.sql (all 7 tables)
- Create lib/db.ts (connection pool + query helpers)
- Create /api/health endpoint
- Commit: "feat: create PostgreSQL schema and DB client"
- **Output:** DB running, health check passing

### Agent 1.3: NextAuth Admin Setup
- Create lib/auth.ts (NextAuth config)
- Create app/api/auth/[...nextauth]/route.ts
- Create middleware.ts (route protection)
- Create app/(admin)/login/page.tsx
- Commit: "feat: implement NextAuth.js admin authentication"
- **Output:** /admin/login page working, admin routes protected

**Your Review (Evening, 2–3 hrs):**
1. Clone branch, `npm install`, `npm run dev`
2. Test:
   - Homepage loads (empty for now) ✓
   - `/api/health` returns `{"status":"ok"}` ✓
   - `/admin/login` shows login form ✓
   - Typing bad credentials shows error ✓
3. Run `npm run lint` (no errors) ✓
4. Approve or request fixes

**Approval → Merge to main**

---

## DAY 2: UI Components + Search (Tuesday)

**Agent Count:** 6 parallel agents

**Tasks:**

### Agent 2.1: Reusable UI Components (Part 1)
- Button.tsx, Input.tsx, Modal.tsx, Card.tsx
- Commit: "feat: create core UI components"

### Agent 2.2: Reusable UI Components (Part 2)
- Badge.tsx, Pagination.tsx, Loading.tsx, EmptyState.tsx
- Commit: "feat: create utility UI components"

### Agent 2.3: Shared Layout
- Header.tsx (sticky, responsive)
- Footer.tsx (links, copyright)
- app/(seeker)/layout.tsx
- Commit: "feat: create Header, Footer, and seeker layout"

### Agent 2.4: Job Card Components
- JobCard.tsx, JobMeta.tsx, JobActions.tsx
- lib/validation.ts (Zod schemas for Job)
- Commit: "feat: create Job Card and Meta components"

### Agent 2.5: Search API + Full-Text Search
- app/api/jobs/route.ts (GET with filters, full-text search)
- lib/search.ts (PostgreSQL tsvector helpers)
- lib/moderation.ts (stub for flagging rules)
- Commit: "feat: implement job search API with full-text indexing"

### Agent 2.6: Search Results Page + Homepage
- app/(seeker)/page.tsx (homepage with hero + featured carousel)
- app/(seeker)/search/page.tsx (results + filters sidebar)
- components/job/Filters.tsx (location, salary, job type, etc.)
- Commit: "feat: create Homepage and Search Results pages"

**Your Review (Evening, 2–3 hrs):**
1. Test:
   - Homepage loads with hero section ✓
   - Click search → results page ✓
   - Filter by location/salary → results update ✓
   - Pagination works ✓
   - Job cards display correctly (mobile + desktop) ✓
   - Clicking job card → navigate to job detail (stub) ✓
2. Run `npm run lint` ✓
3. Run Lighthouse on public pages (target >85 for now) ✓

**Approval → Merge to main**

---

## DAY 3: Alerts + Employer Posting (Wednesday)

**Agent Count:** 4 parallel agents

**Tasks:**

### Agent 3.1: Job Detail Page
- app/(seeker)/jobs/[id]/page.tsx
- Display full job, similar jobs carousel
- Commit: "feat: create Job Detail page"

### Agent 3.2: Job Alerts Infrastructure
- app/api/alerts/route.ts (POST subscribe, DELETE unsubscribe)
- lib/email.ts (SendGrid client + template builder)
- AlertModal.tsx + AlertPreferences.tsx
- Commit: "feat: implement job alert subscription API and UI"

### Agent 3.3: Email Queue + Scheduled Digest
- lib/sqs.ts (AWS SQS client)
- app/api/alerts/send-digest/route.ts (weekly job digest scheduler)
- Email template (HTML)
- Commit: "feat: wire up SendGrid + SQS email queue for weekly digests"

### Agent 3.4: Employer Magic-Link Auth + Job Posting
- app/api/auth/employer-login/route.ts (magic-link email send)
- app/api/auth/employer-verify/[token]/route.ts (verification redirect)
- app/(employer)/post-job/page.tsx (3-step wizard)
- app/(employer)/layout.tsx
- components/employer/JobPostingWizard.tsx
- Commit: "feat: implement employer magic-link auth and job posting wizard"

**Your Review (Evening, 2–3 hrs):**
1. Test:
   - Job detail page loads ✓
   - "Set Alert" modal works, email subscription saves ✓
   - Employer email verification flow (send link, click, verify) ✓
   - Job posting wizard (3 steps) works ✓
   - Posted job appears in search results ✓
2. Run `npm run lint` ✓
3. Check email sending (SendGrid logs) ✓

**Approval → Merge to main**

---

## DAY 4: Admin Moderation + Affiliate (Thursday)

**Agent Count:** 3 parallel agents

**Tasks:**

### Agent 4.1: Applicant Inbox + Application Submission
- app/api/applications/route.ts (POST submit application)
- app/(employer)/inbox/[jobId]/page.tsx (view applicants)
- components/employer/ApplicantInbox.tsx
- Commit: "feat: implement application submission and applicant inbox"

### Agent 4.2: Admin Moderation Queue
- lib/moderation.ts (rule engine: keyword blocklist, velocity checks, link analysis)
- app/api/moderation/queue/route.ts (GET flagged jobs)
- app/api/moderation/review/route.ts (POST approve/reject)
- app/(admin)/moderation/page.tsx
- components/admin/ModerationQueue.tsx
- Commit: "feat: implement rule-based job moderation with flagging engine"

### Agent 4.3: Affiliate Tracking + Careerjet/Jooble APIs
- app/api/jobs/sync-affiliate/route.ts (sync Careerjet + Jooble jobs daily)
- lib/affiliate.ts (UTM tracking, affiliate redirect helpers)
- Wire up affiliate links to Apply button redirects
- Commit: "feat: integrate affiliate APIs and implement UTM tracking"

**Your Review (Evening, 2–3 hrs):**
1. Test:
   - Apply for job → application captured ✓
   - Employer sees applicant in inbox ✓
   - Admin moderation queue shows flagged jobs ✓
   - Approve/reject works ✓
   - Affiliate sync runs, jobs imported ✓
   - Apply button redirects to Careerjet with UTM params ✓
2. Run `npm run lint` ✓

**Approval → Merge to main**

---

## DAY 5: Testing + Polish + Fixes (Friday)

**Your Full Day (6–8 hrs)**

**Tasks:**

### Test All Flows End-to-End
1. **Job Seeker Flow:**
   - Search job → save → apply → email received ✓
   - Subscribe to alert → receive weekly digest ✓

2. **Employer Flow:**
   - Email verification → dashboard → post job → see applications ✓

3. **Admin Flow:**
   - Log in → see flagged jobs → approve/reject → notifications ✓

4. **Performance & Accessibility:**
   - Run Lighthouse (target >90 on public pages) ✓
   - Test mobile (375px viewport) ✓
   - Test keyboard navigation ✓
   - Test screen reader (NVDA/JAWS simulation) ✓

5. **Bug Fixes:**
   - Fix any failures from end-to-end tests
   - Optimize slow queries
   - Fix responsive layout issues

**Commit:** "fix: polish UI, optimize performance, fix integration bugs"

**Approval → Ready for launch**

---

## DAY 6: LAUNCH (Saturday)

**Your Full Day (6–8 hrs)**

**Tasks:**

### Pre-Launch Checklist
- [ ] Seed 100 test jobs in DB (manual or script)
- [ ] Create admin user in DB
- [ ] Deploy to Vercel production
- [ ] Verify production health (api/health endpoint)
- [ ] Submit to Google Search Console
- [ ] Create sitemap.xml + robots.txt
- [ ] Enable Sentry error monitoring
- [ ] Test production URLs
- [ ] Send verification email to test employer
- [ ] Complete end-to-end flow on production

### Go Live
- [ ] Announce on Twitter/LinkedIn
- [ ] Monitor Sentry for errors
- [ ] Check Vercel analytics for traffic
- [ ] Check affiliate partner dashboards for click tracking

**Status: LIVE at jobbrowser.app** 🚀

---

## FUTURE ENHANCEMENTS (Day 7+)

As you discover missing features (like Hirst.tech's profile registration), add them as follow-up tasks:

- **Job Seeker Profiles:** Multi-step signup (personal, education, professional, resume upload)
- **Employer Accounts:** Persistent dashboard + job management
- **Daily Alerts:** Premium upsell ($9.99/month)
- **Company Profiles:** Enhanced with photos, culture, team
- **Job Analytics:** Application count, view count per job

---

## EXECUTION

**Start now with Day 1 parallel agents** (repo setup, DB, auth).

**Ready?**
