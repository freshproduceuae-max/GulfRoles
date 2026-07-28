# Site Architecture Template

Save this in the target project at:

- `docs/architecture/site-architecture.md`

Template:

```markdown
# Site Architecture

- Page model: (single-page | multi-page) — reason:
- Navigation: (sticky header, anchor links, primary CTA)

## Sections (in order)

| # | Section | Content source | Image slot | Mobile behavior |
|---|---------|----------------|-----------|-----------------|
| 1 | Hero | content-inventory: tagline | hero-main | full-bleed, text overlay |
| 2 | What We Offer | offering groups | service-1..n | cards stack |
| 3 | ... | | | |

## Dialogs / Accordions
- Trigger:
- Contents:
- Mobile behavior: (full-screen slide-up sheet | inline accordion)

## Accessibility Notes
- Headings:
- Alt text: from asset-inventory
- Focus / contrast / tap targets:

## Notes
-
```
