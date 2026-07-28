# 03 Assets and Media

Goal: inventory every photo and the logo, and map each site image slot to a real, committed file — before build. This phase exists because broken images are the most common live-site failure.

Files:

- `asset-intake-prompt.md`
- `asset-inventory-template.md`

## Dependencies

- `docs/business/business-profile.md`
- `docs/brand/content-inventory.md`

## Required Output

- `docs/assets/asset-inventory.md`

## Success Criteria

- every provided photo is listed, named meaningfully, and given alt text
- the logo is captured
- each planned image slot (hero, cards, gallery, story, etc.) is mapped to a real filename
- permission/rights to use each photo is confirmed
- oversized images are flagged for optimization

## Exit Criteria

- `docs/assets/asset-inventory.md` exists and every slot maps to a real file that is present in the project
- no slot points to a missing or placeholder-only file
- progress tracker updated

## Handoff

- next phase is `04-site-architecture`
- if new photos arrive later, update this inventory and mark downstream build stale
