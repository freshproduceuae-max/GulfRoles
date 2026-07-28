# Asset Intake Prompt

Paste this into the project AI when handling images and the logo.

```text
Your job is to inventory and map every image before build. Broken images on the live site are the #1 failure — prevent them here.

Before doing anything else:

- read `Small Business Websites/lessons-learned.md` (Images and Logo section)
- read `docs/brand/content-inventory.md` to know what sections/slots exist

Do this:

- list every photo the owner provided
- give each a meaningful, lowercase, consistent filename (hero-main.jpg, event-wedding.jpg, gallery-1.jpg, logo.png)
- write alt text for each
- map each planned image slot to a real filename (hero, service cards, gallery, story, logo, banner)
- confirm the owner has the right to use each photo
- flag any image over ~1 MB for optimization
- remove or exclude temporary/pasted files that will not be used

Hard rules:

- do not map a slot to a file that does not exist in the project
- match filename case exactly to how it will be referenced (hosts are case-sensitive)
- if a slot has no real photo yet, mark it OPEN and halt build for that slot rather than inventing a stand-in

Then:

- create or update `docs/assets/asset-inventory.md`
- update `docs/tracking/progress.md`
- if any slot is OPEN, record it as a blocker and tell the owner exactly which photo is needed
```
