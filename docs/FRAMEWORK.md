# GulfRoles Discovery & Execution Framework

**Version:** 1.0  
**Date:** 2026-07-23  
**Project:** Legitimate Job Aggregator (GulfRoles)

This document codifies the discovery methodology and execution framework used for GulfRoles so it can be adapted to other multi-region, multi-category platforms.

---

## Phase Structure (8 Phases)

| Phase | Focus | Duration | Checkpoint |
|-------|-------|----------|------------|
| 00 | Operating Model | 1–2 days | Execution preferences documented |
| 01 | Business Discovery | 1–2 days | Business profile + decision log complete |
| 02 | Brand & Content | 2–3 days | Tone of voice, messaging pillars, content inventory |
| 03 | Assets & Media | 2–3 days | Image/media inventory mapped to content |
| 04 | Site Architecture | 3–5 days | URL structure, information hierarchy, wireframes agreed |
| 05 | Build & Implementation | 4–8 weeks | Code, deployment, testing |
| 06 | Monetization Integration | 1–2 weeks | Affiliate tracking, email capture, ads wired |
| 07 | Deployment & Launch | 1 week | Search Console, sitemap submission, monitoring |
| 08 | Maintenance & Handoff | Ongoing | Documentation, SLA setup, scaling playbook |

---

## Discovery Method: Structured Interview (Phase 01)

### Seven Core Questions (Ask One-by-One)

**1. Scope: What are you building for?**
   - What niches, categories, or products/services?
   - Vertical (specialized) or horizontal (all categories)?
   - *Why:* Shapes content sourcing, competitive positioning, page architecture

**2. Geography: Where are you operating?**
   - Which countries, regions, or locales?
   - Different branding/localization per region?
   - *Why:* Determines legal entity, privacy policies, data source availability, regional customization strategy

**3. Data Sources: How do you get your inventory?**
   - Existing partnerships (API access, direct feeds)?
   - Or start with free/public APIs and add partnerships later?
   - *Why:* Phase 2 cost, speed-to-launch, data quality, scaling timeline

**4. Monetization: What's your primary revenue stream?**
   - Direct payments (users pay)?
   - Affiliate/CPC networks (pay-per-click)?
   - Advertising (display ads)?
   - Premium/listed features (seller or buyer pays)?
   - *Why:* Shapes Phase 5 wiring, KPIs, growth strategy

**5. Budget: What's your operational cost cap?**
   - Startup budget? Annual spend cap?
   - Lean/bootstrap, or funded?
   - *Why:* Determines tech stack, hosting, tool choices, growth strategy (paid ads vs. organic)

**6. Timeline: When do you need MVP live?**
   - Fast track (4–6 weeks)?
   - Standard (8–12 weeks)?
   - No rush (3+ months)?
   - *Why:* Phases phasing, which features are MVP vs. later

**7. Success Metrics: What does winning look like?**
   - 3-month goal? 1-year goal?
   - Revenue? Users? Traffic? Engagement?
   - *Why:* Informs KPI reporting, roadmap prioritization, feature scope decisions

### Outputs

After interview, create:
- **`docs/business/business-profile.md`** — Summary of answers, audience, success criteria
- **`docs/tracking/decision-log.md`** — Material decisions and rationale
- **`docs/tracking/progress.md`** — Updated with Phase 02 start

---

## Multi-Region/Multi-Domain Pattern

**Pattern:** If building for multiple regions/categories with localization needs

### Three Architectural Options

**A. Subdirectory Model** (Recommended for single-domain authority)
```
domain.com/ae  ← UAE listings, AED currency, Arabic optional
domain.com/sa  ← Saudi listings, SAR currency, Arabic optional
domain.com/in  ← India listings, INR currency
domain.com/au  ← Australia listings, AUD currency
domain.com/us  ← USA listings, USD currency
```
- Pros: Single domain authority compounds over time; unified codebase; easy scaling (add region = add subdirectory + template)
- Cons: Legal/compliance per region handled centrally (more complex)
- **SEO:** All regions feed one domain's authority → faster ranking, lower overall traffic needed

**B. Subdomain Model** (Regional sovereignty)
```
ae.domain.com, sa.domain.com, in.domain.com, etc.
```
- Pros: Each region owns SEO authority; true local separation
- Cons: Splits domain authority; harder to manage
- **SEO:** Slower authority build per region, but full local autonomy

**C. Multi-Domain Model** (Maximum independence)
```
domain.ae, domain.sa, domain.in, etc.
```
- Pros: Complete regional independence; local branding; full local compliance
- Cons: Most complex; authority split across many domains; hardest to manage
- **SEO:** Each domain competes independently; no authority sharing

### GulfRoles Implementation

**Primary domain:** `jobbrowser.app` with subdirectory model
- Global audience, all regions, all categories
- Single domain builds long-term SEO asset
- Regional templates handle localization (currency, language, branding)

**Secondary domain:** `gulfjob.fyi` held for regional campaigns or parallel brand
- Complements primary without fragmenting SEO authority
- Can be regional-focused marketing lever
- Cost: minimal ($5.66/year)

---

## Execution Preferences Template

For similar projects, establish upfront:

**Approval Style**
- [ ] Ask-first (pause at decisions, recommend options)
- [ ] Act-and-report (make reasonable decisions, explain)

**Check-in Frequency**
- [ ] After each phase
- [ ] After major milestones (foundation, MVP, pre-launch)
- [ ] Continuously (daily/weekly updates)

**Deploy Target** (if known)
- [ ] Vercel + Next.js
- [ ] Static hosting (Netlify, GitHub Pages)
- [ ] TBD

**Review Process**
- [ ] User signs off
- [ ] User + technical reviewer
- [ ] User + legal reviewer
- [ ] User + (multiple reviewers)

---

## Reuse Checklist (Next Project)

- [ ] Copy Phase 00–08 structure
- [ ] Adapt Phase 01 discovery questions to new domain (e.g., restaurant aggregator: cuisines, delivery radii, reviews)
- [ ] Apply multi-domain/multi-region pattern if applicable
- [ ] Use same tracking files (execution-preferences, progress, decision-log)
- [ ] Adapt monetization tiers to new business model
- [ ] Copy Phase 04 site-architecture prompts/templates
- [ ] Copy Phase 05 build standards and checklists

---

## Related Docs

- `docs/tracking/execution-preferences.md` — Your specific preferences (overrides defaults)
- `docs/tracking/decision-log.md` — All decisions made, rationale, trade-offs
- `docs/business/business-profile.md` — Distilled business model + success criteria
- `Learning/` folder — Phased planning templates for build guidance

