# Handoff Prompt

Paste this into the project AI when preparing owner handoff.

```text
Your job is to leave the owner able to maintain the site, in plain language.

Before doing anything else:

- read `docs/operations/launch-checklist.md`
- read `docs/build/build-plan.md`

Write a maintenance guide for a non-developer that covers:

- how to change wording (which file, what to look for)
- how to swap a photo (name it the same, keep the size reasonable, commit it)
- how to add a new service/product/menu item
- how changes go live (commit -> push -> host redeploys automatically)
- how to ask for help / request a change
- how to undo a change (revert to the last good version)
- a note that images must be real committed files or they break on the live site

Keep it friendly and jargon-light; define any technical word the first time.

Then:

- create `docs/operations/maintenance-guide.md`
- update `docs/tracking/version-history.md` with the launch entry
- mark the project live in `docs/tracking/progress.md`
```
