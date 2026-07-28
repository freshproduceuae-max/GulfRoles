# Build Standards

Rules for building small-business sites. Keep it simple, fast, and safe to redeploy.

## Stack

- Default: static HTML + CSS + vanilla JS. No build step needed.
- Add a framework (e.g. Next.js) only if the project genuinely needs it (dynamic data, many pages, app-like features) and the reason is recorded in `docs/build/build-plan.md`.

## Structure

- Keep a clear `images/` folder with real, committed files.
- Single-page sites can keep CSS/JS inline or in `styles.css` / `script.js` — be consistent.
- Add a short `README.md` explaining how to run and edit.

## Quality bar

- Mobile-first; test at phone width first.
- Every user action has loading, success, and error states.
- Semantic headings (one h1), alt text on images, visible focus, good contrast, large tap targets.
- Reuse existing patterns; smallest diff that solves the problem; no "just in case" code.
- Do not refactor unrelated code while making a change.

## Assets

- Reference only files that exist and are committed.
- Match filename case exactly (hosts are case-sensitive).
- Optimize large images; remove unused/pasted files.

## Git hygiene

- `.gitignore` must include `node_modules/`, build caches, and large binaries from the start.
- Never commit files over the host limit (commonly 100 MB).
- Small, frequent commits; write clear messages.

## Verification

- Run locally and confirm behavior before claiming any step works.
- After deploy, verify on the live URL, not just locally.
