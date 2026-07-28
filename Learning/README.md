# Small Business Websites Planning Folder

Reusable planning skeleton for building a fast, friendly, conversion-focused website for a small local business.

Current template version: `v0.1.0` on `2026-07-08`.

Read `START-HERE.md` first.

Helpful companion files:

- `COPY-INSTRUCTIONS.md`
- `canonical-paths.md`
- `phase-dependency-map.md`
- `session-resume-protocol.md`
- `response-header-standard.md`
- `NEW-WEBSITE-PROJECT-CHECKLIST.md`
- `website-folder-scaffold.md`
- `lessons-learned.md`
- `CHANGELOG.md`

## Purpose

Use this folder when you want to build a website for a small business that is:

- fast and lightweight (static-first; no heavy framework unless the project needs one)
- mobile-first
- honest and warm in tone, matched to the specific business
- built around clear conversion paths (WhatsApp, quote/booking request, call)
- easy for the owner to update later
- deployed simply to GitHub + a static host such as Vercel

It suits caterers, restaurants, cafés, bakeries, salons, clinics, tradespeople, event services, tutors, and similar owner-run businesses.

## Phases

1. `00-operating-model`
2. `01-business-discovery`
3. `02-brand-and-content`
4. `03-assets-and-media`
5. `04-site-architecture`
6. `05-build-and-implementation`
7. `06-conversion-and-integrations`
8. `07-deployment-and-launch`
9. `08-maintenance-and-handoff`

## How To Use This Folder

1. Copy this entire `Small Business Websites` folder into the new project.
2. Put the owner's photos, logo, and any brand material into `reference-materials/`.
3. Open the AI in that project.
4. A clear instruction like `refer to the Small Business Websites folder so we can begin` is enough. Exact wording is not required.
5. The AI reads `canonical-paths.md`, `phase-dependency-map.md`, and `session-resume-protocol.md` before starting.
6. The AI runs operating-model setup, then discovery, then content, then assets, then architecture, then build, conversions, deployment, and handoff.

## Important Rules

This folder is designed for owner-run businesses where trust, clarity, and getting a message/quote are what matter.

- do not start writing code before discovery and content are captured
- do not silently drop any service, product, or menu item the owner listed — keep everything, even if generic
- do not reference an image or logo that is not a real, committed file (broken images on the live site are the most common failure — see `lessons-learned.md`)
- do not assume file paths are case-insensitive; hosts like Vercel are case-sensitive
- do not commit `node_modules`, build caches, or large binaries to git
- do not re-frame an imported design into a different framework unless the owner asked for that
- do not claim a step works until it has been checked locally or on the live URL
- do not continue a phase if its required upstream inputs are missing or stale

## Recommended Project Outputs

Each website project should use the canonical files defined in `canonical-paths.md`, including:

- `docs/tracking/execution-preferences.md`
- `docs/tracking/progress.md`
- `docs/tracking/decision-log.md`
- `docs/tracking/change-control.md`
- `docs/tracking/version-history.md`
- `docs/business/business-profile.md`
- `docs/brand/content-inventory.md`
- `docs/assets/asset-inventory.md`
- `docs/architecture/site-architecture.md`
- `docs/build/build-plan.md`
- `docs/features/feature-list.json`
- `docs/conversion/conversion-plan.md`
- `docs/operations/deployment-readiness.md`
- `docs/operations/launch-checklist.md`
- `docs/operations/maintenance-guide.md`

Adjust filenames only if the project establishes a different canonical naming pattern and records the deviation in `docs/tracking/decision-log.md`.
