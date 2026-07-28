# Maintenance Guide Template

Save this in the target project at:

- `docs/operations/maintenance-guide.md`

Write it for the business owner, not a developer.

Template:

```markdown
# How to Update Your Website

## Change some words
1. Open `index.html`.
2. Find the text you want to change.
3. Type over it. Save.
4. See "Make it go live" below.

## Swap a photo
1. Put the new photo in the `images/` folder.
2. Give it the SAME name as the one you're replacing (or update the name in the page).
3. Keep photos a reasonable size so the site stays fast.
4. Make it go live.
> Photos must actually be saved and committed, or they show as broken on the live site.

## Add a new service / item
1. Copy an existing item block in `index.html`.
2. Change the text (and image name if it has one).
3. Make it go live.

## Make it go live
- Save your changes, then commit and push to the repo.
- The host (e.g. Vercel) rebuilds the site automatically in about a minute.
- Do a hard refresh (Ctrl/Cmd + Shift + R) to see the newest version.

## Undo a change
- Every change is saved in history. Ask for the last good version to be restored.

## Need help?
- Contact: <who to contact and how>

## Version History
- See `docs/tracking/version-history.md`
```
