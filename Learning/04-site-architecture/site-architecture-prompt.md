# Site Architecture Prompt

Paste this into the project AI when planning the site structure.

```text
Your job is to agree the site's structure before build.

Before doing anything else:

- read `docs/brand/content-inventory.md`
- read `docs/assets/asset-inventory.md`
- read `docs/business/business-profile.md`

Decide and record, with the owner where a real choice exists:

- single-page or multi-page, and why (small businesses usually do well with one strong page)
- the ordered list of sections (e.g. hero, what we offer, events, story, gallery, contact/quote)
- what content and which image slot each section uses
- the navigation (sticky header, anchor links, primary CTA button)
- where long lists become dialogs/accordions instead of endless scrolling
- how each section behaves on mobile (stacking, full-screen sheets for dialogs)
- accessibility basics: one h1, logical headings, alt text, visible focus, adequate contrast, large tap targets

When a UX choice is genuinely open (e.g. how a dialog opens on mobile), ask the owner with a short recommendation rather than guessing.

Then:

- create or update `docs/architecture/site-architecture.md`
- update `docs/tracking/progress.md`
- record structural decisions in `docs/tracking/decision-log.md`
```
