# Build Prompt: Legitimate Job Aggregator with Borrowed Growth Mechanics

> **How to use:** Paste everything below the line into a coding agent (Claude
> Code, etc.). It's structured as a phased build spec with an explicit
> pitfalls list pulled directly from what made the scam site we analyzed
> obviously fraudulent — so the agent building this has a checklist of what
> NOT to replicate, not just what to build.

---

## THE CORE DISTINCTION (read this first, keep it as a standing constraint)

Illegitimate job-spam sites and legitimate job aggregators use **the same
underlying mechanism** — Google's free JobPosting structured data pickup —
and often the same monetization rails (CPC/CPA job networks). The
difference is entirely in two places:

1. **Is the listing real?** (sourced from an actual employer or a licensed
   job-data API, vs. auto-templated garbage)
2. **Does the user get what they were promised?** (a real application path
   to a real job, vs. a redirect chain that harvests data or pushes a paid
   "training" upsell)

Everything below is built to scale like the illegitimate version — fast,
programmatic, structured-data-heavy, multi-surface monetization — while
staying honest on both of those points. That's the whole game.

---

## A-Z COMPARISON: MECHANIC BY MECHANIC

| Mechanic | Illegitimate version (what we saw) | Legitimate version (what to build) |
|---|---|---|
| **Content sourcing** | Auto-templated placeholder text ("reputed company"), scraped without permission | Real listings via **Adzuna API** (free tier), **Careerjet public search API** (free embed), **Jooble affiliate feed**, direct **Greenhouse/Lever public JSON feeds** from real companies |
| **Scale mechanism** | Script-generate thousands of fake listings instantly | Programmatic SEO: real API data expanded into genuine long-tail pages (e.g. "Remote Data Analyst Jobs — Dubai") — same URL-volume scale, real content each time |
| **Domain strategy** | Numbered throwaway subdomains (`1.halvolink`, `2.halvolink`) that get spam-flagged and replaced | One real domain, built as a durable asset with actual domain trust over time |
| **Google discovery** | Same JobPosting JSON-LD schema, applied to fake pages | Same JobPosting JSON-LD schema, applied to real, deduplicated, policy-compliant pages |
| **Apply flow** | Redirects off-domain to a second site flagged for phishing risk | Redirects to the **real employer application page** or a real affiliate job board — no bait-and-switch |
| **Recommendation engine** | Random unrelated jobs (Chaplain next to Mainframe Ops) — signals auto-scrape | Genuine relevance: same-category, same-location suggestions |
| **Monetization: clicks** | CPC/CPA arbitrage, often paired with fraudulent "sign up for training" upsells that pay $5–50/lead | Same CPC/CPA rails (Careerjet ~$0.10/click, Jooble CPC/CPA) — legitimate job-network payouts, no fake upsells |
| **Monetization: data capture** | Harvest CV/email/phone under fake "apply now" pretense, resell as leads | Real, consented email capture for job alerts — monetized via subscription or **employer-paid featured listings**, never resold without explicit consent |
| **Monetization: ads** | Ad-stuffed redirect pages, no real content to support them | Display ads (AdSense/Ezoic) placed on pages with genuine utility, once real traffic exists |
| **Trust signals** | No About page, no contact info, no privacy policy | Real About/Contact/Privacy Policy — required both for user trust and to avoid Google's spam-policy manual actions |
| **Lifespan** | Weeks-to-months before delisting, then rebuild from scratch | Compounding SEO asset — gets *more* valuable over time |

---

## MISSION (for the build agent)

You are building a legitimate job-listing aggregator that gets discovered
through Google for Jobs via correct `JobPosting` structured data, sourced
entirely from real, permitted job-data APIs — not scraped or fabricated —
and monetized through legitimate CPC/CPA job networks, consented email
capture, and (once traffic exists) display ads and employer-paid featured
listings.

## LEARNER/OWNER CONTEXT

Non-developer founder, comfortable directing an AI coding agent and
reviewing output, but not hand-writing infrastructure code. Wants a
working MVP fast, built for honest long-term compounding rather than
short-term click arbitrage. Prior AI-assisted project experience (SpeakEase,
ITSM tooling, Power BI dashboards) — comfortable scoping and owning a
build, not doing the low-level engineering personally.

---

## PHASED BUILD PLAN

### Phase 1 — Foundation & Legal
1. Register a real domain (not a numbered/throwaway subdomain).
2. Draft a genuine Privacy Policy and Terms of Service — required if you
   capture any email/CV data. Disclose exactly what you collect and why.
3. Decide legal entity structure if monetization is expected to be
   meaningful (sole proprietorship is usually enough to start).
4. Set up Google Search Console for the domain from day one.

### Phase 2 — Data Sourcing (the part that must stay 100% real)
5. Register for **Adzuna API** (free developer tier) — real job ads across
   many countries.
6. Register for **Careerjet's public search API** (free to embed, has a
   CPC affiliate payout).
7. Apply to the **Jooble Affiliate Program** (CPC/CPA, monthly payout,
   Net45).
8. Identify a handful of companies with public **Greenhouse/Lever** job
   feeds relevant to your niche — these are real listings, free to pull,
   no scraping-ToS issues.
9. Explicitly avoid: scraping Indeed/LinkedIn directly outside their
   sanctioned APIs — this violates their ToS and is a real legal exposure,
   distinct from the ethical issue.

### Phase 3 — Site Architecture
10. Each job listing gets its own **unique, crawlable, canonical URL** —
    never a filtered search-results page pretending to be a listing.
11. Build deduplication logic — the same real job pulled from two sources
    must not create two indexed pages (Google penalizes this).
12. Implement `JobPosting` JSON-LD on every listing page with all required
    fields (title, description, hiringOrganization, jobLocation, datePosted,
    validThrough, employmentType). Validate with Google's Rich Results Test
    before launch, not after.
13. Build genuine category/location landing pages (e.g. "Remote BA Jobs —
    India") — this is the programmatic-SEO scale mechanic, done honestly:
    each page aggregates real listings, doesn't fabricate them.
14. Generate an XML sitemap and register it with the **Google Indexing
    API** for fast discovery of new/updated listings.

### Phase 4 — Trust & Compliance Layer
15. Build real About, Contact, and Privacy Policy pages — this is a direct
    countermeasure to everything that made the scam site look fake.
16. Add cookie consent if you're in a region requiring it (GDPR/CCPA-style).
17. Make sure the apply flow is transparent: either link straight to the
    employer/source board, or clearly label it as "Apply via [Partner]."
    Never disguise a redirect as a direct application.

### Phase 5 — Monetization Integration
18. Wire up Careerjet/Jooble CPC-CPA tracking on outbound apply clicks.
19. Build a genuine **job-alert email capture** — real value (candidates
    actually want this), consented, unsubscribe-able, never resold.
20. Once you have meaningful traffic (this takes months, be honest with
    yourself about the timeline), apply for AdSense or a higher-tier ad
    network (Ezoic/Mediavine have traffic minimums).
21. Longer-term, real revenue lever: **employer-paid featured listings** —
    once you have applicant traffic, local/niche employers will pay to be
    seen. This is the highest-value legitimate monetization path and the
    one that actually scales past click arbitrage.

### Phase 6 — Launch & Growth
22. Submit the sitemap, request indexing on key pages, monitor Search
    Console for both indexing status and any manual-action flags.
23. Track which niche/location combos get real click-through — expand
    programmatic pages into what's working, not blindly everywhere.
24. Diversify traffic beyond Google Jobs alone: SEO for the category pages
    themselves, a newsletter, maybe a narrow social presence.
25. Reinvest early revenue into more data-source integrations and better
    UX (salary insights, application tracking) — differentiation is what
    prevents you from being "just another aggregator" once bigger players
    notice the niche.

---

## PITFALLS TO EXPLICITLY AVOID (each one is something the scam site did)

```
NO template placeholders left unfilled in any listing text
NO redirects that don't clearly disclose where the user is going
NO recommendation widgets showing unrelated content (signals auto-scrape)
NO numbered/disposable subdomains — one real domain, built to last
NO missing About/Contact/Privacy Policy pages
NO scraping job boards outside their sanctioned API/ToS
NO selling or reusing captured emails/CVs beyond disclosed purpose
NO duplicate indexed pages for the same underlying job
NO fabricated urgency ("apply now, filling fast") on listings you don't
    control the true status of
NO stale listings left live after their real closing date — this is both
    a user-trust issue and something Google's spam policy explicitly
    penalizes
```

---

## REALISTIC EXPECTATIONS (set these before the agent starts building)

- Meaningful organic Google Jobs traffic typically takes **months**, not
  days — Google needs to trust a new domain's structured data and content
  quality before ranking it prominently.
- Early CPC/CPA payouts per click are modest (roughly $0.05–$0.30 per
  click through legitimate job networks) — this is a compounding SEO
  asset, not a fast-cash mechanism.
- The real money, if it comes, is more likely from **employer-paid
  featured listings** once you have real applicant traffic than from ad
  clicks alone — plan the build with that end-state in mind from Phase 1.

---

## START

Confirm you understand the Phase 1–6 structure and the pitfalls list in
two lines, then begin with Phase 1, step by step, pausing for review after
each phase before continuing to the next.
