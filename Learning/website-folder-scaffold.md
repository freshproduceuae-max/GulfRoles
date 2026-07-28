# Website Folder Scaffold

When this folder is copied into a new project, the AI should create the canonical docs folders early if they do not already exist, plus the site's own working folders.

## Planning / docs structure

```text
docs/
  business/
  brand/
  assets/
  architecture/
  build/
  features/
  conversion/
  tracking/
  operations/
reference-materials/
  images/
  brand-assets/
  copy/
  inspiration/
  links/
```

## Typical site structure (static-first)

```text
index.html
styles.css            (or inline <style> for a single-page site)
script.js             (or inline <script>)
images/               (all real, committed photos + logo)
.gitignore            (must include node_modules/, caches, large binaries)
README.md             (short: how to run and edit)
vercel.json           (optional; static hosting config)
```

## Minimum expected outputs over time

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

## Rule

If the project establishes a different canonical naming pattern, follow it consistently and record it in `docs/tracking/decision-log.md`.
