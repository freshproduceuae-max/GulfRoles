# Decision Log

**Project:** Legitimate Job Aggregator (GulfRoles)

---

## Phase 00: Operating Model

**Date:** 2026-07-23

### Decision: Execution Preferences

**Options considered:**
- Ask-first vs. act-and-report
- Check-in frequency (phase-by-phase, milestone, continuous)
- Deployment platform
- Review process

**Decision made:**
- **Approval style:** Ask-first (pause at decisions, recommend)
- **Check-in:** After major milestones (Phase 1, Phase 3, pre-launch)
- **Deploy:** TBD after Phase 1
- **Review:** User + Codex (task-based)

**Rationale:** Ensures alignment on high-stakes decisions (domain, legal, monetization) while keeping momentum between phases. Codex integration enables technical review before launch.

---

## Phase 01: Business Discovery

**Date:** 2026-07-23

### Decision: Geographic Scope & Target Regions

**Scope:** All countries, all job categories (horizontal, not vertical niche)
**MVP Regions:** UAE, Saudi Arabia, India, Australia, USA
**Strategy:** Multi-region, different pages and styles per country

**Rationale:** Horizontal scope maximizes addressable market. Regional variation enables localization (currency, legal, language, branding). Segmentation via subdirectories (`jobbrowser.app/ae`, `/sa`, `/in`, `/au`, `/us`) preserves SEO authority on single domain.

---

### Decision: Data Sources

**Choice:** Start with free/affiliate APIs (Adzuna, Careerjet, Jooble)
**Timeline:** Add direct partnerships after MVP validation and scale

**Rationale:** Minimizes Phase 2 costs, focuses on product-market fit before investing in integrations. Affiliate payouts (CPC/CPA) align with 5% spend cap and organic growth model.

---

### Decision: Monetization Strategy (3-Tier)

**Immediate (Month 1-2):** CPC/CPA clicks from Careerjet/Jooble affiliate network
**Medium-term (Month 3-6):** Google AdSense display ads (once traffic qualifies)
**Long-term (Month 6+):** Employer-paid featured listings (once scale exists)

**Spend Constraint:** Ultra-lean (5% or lower operational costs; no paid ads)
**Growth Engine:** Organic/SEO only (Google Jobs discovery + organic search)

**Rationale:** CPC/CPA provides immediate revenue signal while building SEO authority. AdSense and employer listings compound once platform has proven traffic and trust. Lean model forces organic growth, which aligns with long-term asset compounding.

---

### Decision: Domain Strategy (Both-Domain Launch)

**Domain 1 (Primary):** `jobbrowser.app`
- Cost: $8.75/year
- Strategy: Global MVP (all 5 regions simultaneously, all categories)
- Branding: "Job browsing" — user action-focused, scales globally
- TLD: `.app` — professional/trustworthy, higher status than `.fyi`

**Domain 2 (Regional):** `gulfjob.fyi`
- Cost: $5.66/year
- Strategy: Regional MVP or future brand (Gulf-specific marketing)
- Branding: "Gulf jobs" — regionally targeted, can be sub-brand later
- TLD: `.fyi` — cheaper, clear (For Your Information)

**Architecture:**
- Primary launch via `jobbrowser.app` with subdirectory model (`/ae`, `/sa`, `/in`, `/au`, `/us`)
- `gulfjob.fyi` held for regional expansion, future campaigns, or parallel launch if Gulf-focused go-to-market strategy emerges

**Rationale:** 
- Dual-domain approach allows global launch (jobbrowser) + regional specialization (gulfjob) without fragmenting SEO authority
- Both domains can share same CMS backend, just different DNS/branding
- Hedges against branding uncertainty; can validate which resonates with users
- Minimal additional cost ($14.41 total for both)
- Supports framework reuse: this pattern can apply to other multi-region aggregators

**Total Cost:** $14.41/year (two domains)

---

### Decision: Timeline

**Expected:** Standard track (8-12 weeks to Minimum Viable Product (MVP) — the smallest working version with real job listings, indexed pages, and functioning CPC/CPA click tracking)
**Rationale:** Allows proper foundation (legal, data integration), structured build (no shortcuts on JSON-LD structured data validation), and organic discovery time. Aligns with realistic Google indexing timelines (2-4 weeks for initial discovery, 4-8 weeks for meaningful traffic).

---

## Phase 1: Foundation & Legal

**Date:** 2026-07-23

### Decision: Legal Entity Structure

**Choice:** Sole Proprietor (Minimum Viable Product (MVP) phase) → Private Limited Company (if revenue justifies, later)

**Rationale:** Fastest to launch. Minimal paperwork and compliance costs. Can formalize to LLC/Private Limited once revenue flows and justifies registration costs. Aligns with bootstrap/lean-first approach.

---

### Decision: Data Privacy & Monetization

**Email data:** Captured for job alerts only. User owns their email.
**Future monetization:** Only with explicit consent + opt-out period. Users notified + reasonable timeframe to remove themselves from any third-party sharing.
**Affiliate data:** Careerjet/Jooble see only clicks (not emails). They're job networks that track clicks and pay per click (CPC/CPA — Cost Per Click/Cost Per Action). User data stays with you.

**Rationale:** Transparency builds trust. Aligns with "legitimate aggregator" core principle. Users know exactly what happens to their data.

---

### Decision: Hosting Provider

**Choice:** Vercel Free Tier

**Cost:** $0/month (unlimited deployments, serverless functions, custom domains, SSL/HTTPS, analytics)
**Upgrade path:** Pro Tier ($20/month) only if traffic exceeds free tier limits (unlikely in early stage)

**Total Minimum Viable Product (MVP) Cost Breakdown:**
- Domain (jobbrowser.app): $9/year (~$0.75/month)
- Hosting (Vercel): $0/month
- **Total: ~$0.75/month**

**Rationale:** Aligns with 5% spend cap. Free tier sufficient for Minimum Viable Product (MVP). Pay-as-you-grow model: upgrade only when revenue justifies.

---

## Tracking

Additional decisions will be logged as they emerge across remaining phases (Phase 02–08).

---

## 2026-11-24 — MVP implementation choices

These were made while finishing the code against the locked MVP. They do not change the product decisions above.

### Database

**Choice:** Any hosted Postgres behind `DATABASE_URL` (Neon, Vercel Postgres, or Supabase). SSL is turned on unless the host is localhost.

**Rationale:** The free Vercel project does not include a database. The July deployment pointed at `127.0.0.1:5432`.

### Admin sign-in

**Choice:** `ADMIN_EMAIL` plus `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`. A matching row in `admin_users` also works. The hardcoded password hash was removed.

**Rationale:** A password in the repository is public.

### Crons

**Choice:** Two daily cron jobs, which is the Vercel free-tier cap. `/api/cron/daily` ingests one keyword in one region and expires stale jobs. `/api/cron/send-alerts` runs daily but emails a subscriber only after 7 days.

**Rationale:** Hobby cron expressions must be once a day. A weekly expression is rejected. More than two jobs is rejected.

### Resumes

**Choice:** Resume bytes live in Postgres and are downloaded by the signed-in employer. They are not written under `public/`.

**Rationale:** Vercel’s disk is ephemeral, and a public uploads folder would expose CVs. CV resale stays forbidden.

### 2026-11-25 — Legal inventory, not a second catalog

**Choice:** CPC partners (Careerjet, Jooble, Adzuna) stay, with Google JobPosting off until a contract allows it. Employers can opt in a public Greenhouse, Lever, Ashby, or Workable board. Remote OK and Remotive are optional licensed feeds. Remotive rows are not marked up for Google Jobs and are not redistributable. Indeed, Glassdoor, LinkedIn, and GulfTalent URLs are rejected.

**Rationale:** The 25 Nov 2026 source catalog. Employers keep posting for free. Revenue stays clicks, ads, and later featured flags. A parallel branch hardcoded three company boards and duplicated JSON-LD; those listings are not ingested unless the employer opts in.

**Revenue target:** about $100k over 24 months, from several streams. That number is a plan, not a forecast in the code.

### Ads and featured jobs

**Choice:** AdSense markup renders only when the publisher id and slot ids are set. `listing_tier = featured` can be set by an admin API. No payment provider.

**Rationale:** Matches the three-tier plan: affiliate clicks now, AdSense after traffic, paid placement after that.

### Regions Adzuna cannot serve

**Choice:** Adzuna is requested for India, Australia, and the US only. UAE and Saudi listings come from Careerjet, Jooble, and employer posts.

**Rationale:** Adzuna does not publish UAE or Saudi feeds. Pretending otherwise would store nothing and look like a bug.
