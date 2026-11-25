# Progress Tracker

**Project:** Legitimate Job Aggregator (GulfRoles)  
**Product name:** JobBrowser (`jobbrowser.app`)  
**Started:** 2026-07-23  
**Updated:** 2026-11-24

The July status below was never updated after the 28–30 July build. This revision matches the code on the MVP branch, not the old “phases 02–08 pending” table.

## Phase status

| Phase | Title | Status | Notes |
| --- | --- | --- | --- |
| 00 | Operating Model | Complete | Preferences stayed: small diffs, no new paid vendors, no CV resale. |
| 01 | Business Discovery | Complete | Five regions, affiliate-first revenue, Vercel free tier. |
| 02 | Brand and content | Complete for MVP | About, Privacy, Terms, Contact, Help, FAQ, Cookies, plus honest stubs for salary notes, careers, and the blog. |
| 03 | Assets and media | Closed without a shoot | Text mark only. No stock photography and no paid asset pass. |
| 04 | Site architecture | Complete | `/ae`, `/sa`, `/in`, `/au`, `/us` are pages. Employer flows live under `/employer`. Admin moderation lives under `/admin`. |
| 05 | Build and implementation | Complete in code | Search, job page, alerts, employer magic link, applicant inbox, rule-based moderation, ingestion, expiry. |
| 06 | Monetization integration | Code complete, not earning | CPC partners, licensed Remote OK/Remotive feeds, employer ATS opt-in, click report, dormant AdSense slots, featured flag. No seats and no checkout. |
| 07 | Deployment and launch | Waiting on the owner | App builds. Production still needs a hosted database, Vercel env, affiliate keys, and the `jobbrowser.app` certificate. Steps are in `LAUNCH.md`. |
| 08 | Maintenance and handoff | Handoff written | `LAUNCH.md` is the operator guide. Ongoing moderation and key renewal stay with the owner. |

## MVP definition of done

From `docs/MVP-REQUIREMENTS.md` and `docs/MASTER-SPECIFICATION.md` §10.

| Item | State |
| --- | --- |
| 1,000+ jobs indexed | Not yet. Ingestion is implemented. The count stays at zero until Careerjet, Jooble, and Adzuna keys are set and `npm run ingest` is run. |
| Homepage, search, job pages live and indexed | Pages and sitemap exist. Google indexing waits on Search Console after the domain loads. |
| Free 3-step job post and email verification | Routes fixed. Email sends only when `SENDGRID_API_KEY` is set. |
| Applicant inbox | Works for the signed-in employer. Resumes are in Postgres, not a public folder. |
| Weekly alert digest | Sends when `/api/cron/send-alerts` runs and the last email was at least 7 days ago. Subscriber count is an operating result, not a code result. |
| Admin moderation | Queue, approve, and reject. Sign-in reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`. |
| Affiliate click tracking | Click route records Careerjet, Jooble, and Adzuna and redirects to the partner URL. |
| Mobile layout | Existing responsive layout kept. Not re-measured in a device lab. |
| Lighthouse > 90 and WCAG AA | Not measured in this pass. Do not treat them as passed. |
| Privacy policy and terms | Published at `/privacy` and `/terms`. About is at `/about`. |
| Search Console and sitemap submitted | Sitemap is generated at `/sitemap.xml`. Verification is an owner step. |
| Sentry | SDK is already wired and stays off until `SENTRY_DSN` is set. |
| No critical bugs on search, apply, alerts, posting | Search no longer queries the word “english” by accident. Employer verify URLs match the email. Database failures return an empty state or HTTP 503 instead of a localhost stack trace. |

## Phase 01 summary (unchanged)

**Key decisions made:**

- Scope: all job categories, five launch regions (UAE, Saudi Arabia, India, Australia, USA).
- Segmentation: subdirectories on `jobbrowser.app`.
- Data sources: Adzuna, Careerjet, Jooble, plus direct employer posts.
- Monetization: affiliate clicks, then AdSense, then paid featured listings.
- Budget: organic only, Vercel free tier.
- Domains: `jobbrowser.app` and `gulfjob.fyi`.

## Explicitly still out of scope

Recruiter ATS, seeker accounts, subscriptions, premium tools, payments, CV resale, Arabic, and Hindi. Featured listings can be flagged by an admin so a later checkout has a place to write. Nothing is billed.
