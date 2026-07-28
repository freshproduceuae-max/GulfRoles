# 07 Deployment and Launch

Goal: get the site online safely and verify it actually works on the live URL.

Files:

- `deployment-prompt.md`
- `launch-checklist.md`

## Dependencies

- `docs/build/build-plan.md`
- `docs/features/feature-list.json`
- `docs/conversion/conversion-plan.md`

## Required Output

- `docs/operations/deployment-readiness.md`
- `docs/operations/launch-checklist.md`

## Success Criteria

- repo created with a correct `.gitignore` (node_modules, caches, large binaries excluded)
- deployed to the chosen host (e.g. Vercel) and auto-redeploys on push
- live URL verified: every image loads, links work, CTAs and forms fire
- domain connected if the owner has one
- no file exceeds the host size limit

## Exit Criteria

- the live site is confirmed working (with evidence, not assumption)
- `docs/operations/deployment-readiness.md` and `launch-checklist.md` completed
- progress and version history updated

## Handoff

- next phase is `08-maintenance-and-handoff`
