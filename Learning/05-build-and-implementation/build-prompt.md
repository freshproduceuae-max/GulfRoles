# Build Prompt

Paste this into the project AI when building the site.

```text
Your job is to build the site from the agreed architecture.

Before doing anything else:

- read `docs/architecture/site-architecture.md`
- read `docs/brand/content-inventory.md`
- read `docs/assets/asset-inventory.md`
- read `Small Business Websites/05-build-and-implementation/build-standards.md`
- read `Small Business Websites/lessons-learned.md`

Build rules:

- default to a static site (HTML/CSS/JS). Only add a framework if a real need is recorded in the build plan.
- if the owner provided a design, implement it as-is; do not re-frame or restyle it unless asked
- include every item from the content inventory; long lists may use dialogs/accordions but keep all items
- reference only images that exist as real files; match filename case exactly
- make it mobile-first; give every action a loading, success, and error state
- reuse patterns; keep the smallest diff that solves the problem; no speculative code

Verify before claiming done:

- run a local preview server and confirm the page renders, images load, and interactions work
- do not say it works until you have checked it

Then:

- create/update `docs/build/build-plan.md` (stack, files, structure)
- create/update `docs/features/feature-list.json`
- update `docs/tracking/progress.md`
```
