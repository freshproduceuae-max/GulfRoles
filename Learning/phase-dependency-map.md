# Phase Dependency Map

Use this file to decide whether a phase is allowed to start and which upstream artifacts must be re-checked first.

## Phase 00 Operating Model

- Depends on: none
- Must create:
  - `docs/tracking/execution-preferences.md`
  - `docs/tracking/progress.md`
  - `docs/tracking/decision-log.md`

## Phase 01 Business Discovery

- Depends on:
  - `docs/tracking/execution-preferences.md`
- Must create:
  - `docs/business/business-profile.md`

## Phase 02 Brand and Content

- Depends on:
  - `docs/business/business-profile.md`
- Must create:
  - `docs/brand/content-inventory.md`
- Must halt if:
  - the owner has not confirmed the full list of services/products/menu items

## Phase 03 Assets and Media

- Depends on:
  - `docs/business/business-profile.md`
  - `docs/brand/content-inventory.md`
- Must create:
  - `docs/assets/asset-inventory.md`
- Must halt if:
  - images or logo are referenced by the plan but no real files are provided

## Phase 04 Site Architecture

- Depends on:
  - `docs/business/business-profile.md`
  - `docs/brand/content-inventory.md`
  - `docs/assets/asset-inventory.md`
- Must create:
  - `docs/architecture/site-architecture.md`

## Phase 05 Build and Implementation

- Depends on:
  - `docs/architecture/site-architecture.md`
  - `docs/brand/content-inventory.md`
  - `docs/assets/asset-inventory.md`
- Must create:
  - `docs/build/build-plan.md`
  - `docs/features/feature-list.json`
- Rule:
  - every referenced image/logo must exist as a committed file before build is called done

## Phase 06 Conversion and Integrations

- Depends on:
  - `docs/business/business-profile.md`
  - `docs/architecture/site-architecture.md`
  - `docs/features/feature-list.json`
- Must create:
  - `docs/conversion/conversion-plan.md`

## Phase 07 Deployment and Launch

- Depends on:
  - `docs/build/build-plan.md`
  - `docs/features/feature-list.json`
  - `docs/conversion/conversion-plan.md`
- Must create:
  - `docs/operations/deployment-readiness.md`
  - `docs/operations/launch-checklist.md`
- Rule:
  - the live URL must be verified (images load, links work, forms/CTAs fire) before launch is called done

## Phase 08 Maintenance and Handoff

- Depends on:
  - `docs/operations/launch-checklist.md`
- Must create:
  - `docs/operations/maintenance-guide.md`

## Re-Run Rule

If a later phase introduces:

- a new service, product, or section
- new photos or a new logo
- a change of brand direction or tone
- a new integration (payments, booking, analytics)
- a change of deploy target or domain

then mark the affected upstream artifacts as stale in `docs/tracking/progress.md`, re-run the impacted phase, and do not treat downstream outputs as final until the upstream artifacts are updated.
