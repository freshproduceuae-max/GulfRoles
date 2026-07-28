# 05 Build and Implementation

Goal: build the site from the agreed architecture, keeping it simple, mobile-first, and with every referenced asset a committed file.

Files:

- `build-prompt.md`
- `build-standards.md`
- `feature-list-template.json`

## Dependencies

- `docs/architecture/site-architecture.md`
- `docs/brand/content-inventory.md`
- `docs/assets/asset-inventory.md`

## Required Output

- `docs/build/build-plan.md`
- `docs/features/feature-list.json`

## Success Criteria

- stack chosen (static-first unless a real need is proven and recorded)
- if a design was provided, it is implemented as-is
- all content from the inventory is present (nothing dropped)
- every referenced image/logo exists as a committed file
- loading, success, and error states exist for every user action
- tested locally (preview server) before being called done

## Exit Criteria

- the site renders correctly locally
- `docs/features/feature-list.json` reflects what is built and what passes
- `docs/build/build-plan.md` records the stack and structure
- progress tracker updated

## Handoff

- next phase is `06-conversion-and-integrations`
