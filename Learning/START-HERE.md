# Small Business Websites Planning Folder

This folder is a reusable skeleton for planning, building, and launching a website for a small local business (catering, restaurant, salon, clinic, trades, retail, events, and similar).

It is meant to be copied into a new website project as its planning and build backbone.

## Simple Invocation

If you are an AI working in a project and the user says:

- `refer to the Small Business Websites folder`
- `use the small business website planning folder`
- `start from the Small Business Websites folder`
- or otherwise clearly points you to this folder as the planning skeleton

interpret that as the instruction to use this folder as the operating skeleton for the website project.

## What You Should Do

1. Read this file first.
2. Read `README.md`.
3. Read `canonical-paths.md`, `phase-dependency-map.md`, and `session-resume-protocol.md`.
4. If `docs/tracking/progress.md` exists, resume from it instead of restarting completed phases.
5. If `docs/tracking/progress.md` does not exist, initialize it during phase 00.
6. Start with execution preferences (phase 00).
7. Run the business discovery interview (phase 01).
8. Capture brand and content (phase 02) before touching layout or code.
9. Inventory and map every image and asset (phase 03) before build — see `lessons-learned.md`.
10. Agree the site architecture (phase 04), then build (phase 05), wire conversions (phase 06), deploy (phase 07), and hand off (phase 08).

## Default Interpretation

Unless the user explicitly says otherwise:

- begin with business discovery, not code
- capture the full list of services/products/menu items — never silently drop any the owner listed
- treat the owner's real photos and logo as the source of truth, and map each placeholder to a real, committed file
- design mobile-first, then scale up
- give every user action a loading, success, and error state
- keep copy warm and human, matched to the business, not generic or pushy
- if importing a design (e.g. from a design tool), implement it as-is unless asked to change it
- test locally and confirm it works before claiming a step is done
- record material decisions in `docs/tracking/decision-log.md` as they occur
- halt a phase and ask rather than improvise if required inputs (photos, copy, brand direction, deploy target) are missing

## Folder Intent

This folder governs:

- business and goal discovery
- brand voice and content collection
- image/logo/asset inventory and mapping
- site structure and responsive design
- static or lightweight build and implementation
- conversion paths (WhatsApp, quote/booking forms, calls)
- deployment to GitHub + a static host (e.g. Vercel)
- launch verification and owner handoff/maintenance

## Resume Rule

- Do not assume this is a new project session.
- Always check `docs/tracking/progress.md` first if it exists.
- If the last phase is incomplete, continue that phase unless the owner explicitly changes direction.
