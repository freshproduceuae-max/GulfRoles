# Launch Checklist

Copy this into the target project at `docs/operations/launch-checklist.md` and tick each item on the LIVE URL.

```markdown
# Launch Checklist

## Repo hygiene
- [ ] .gitignore excludes node_modules, caches, large binaries
- [ ] No file exceeds the host size limit (commonly 100 MB)
- [ ] Every referenced image/logo is committed

## Live URL verification
- [ ] Page loads at the live URL
- [ ] All images load (no broken images)
- [ ] Logo shows correctly
- [ ] Navigation and anchor links work
- [ ] Primary CTA opens WhatsApp with the correct pre-filled message
- [ ] Quote/booking path works
- [ ] Click-to-call works
- [ ] Looks correct on a phone
- [ ] Hard refresh done to bypass cache

## Content
- [ ] All services/products/menu items present
- [ ] No placeholder text left
- [ ] Contact details correct

## SEO / meta
- [ ] Title and meta description set
- [ ] Social preview shows correctly

## Domain
- [ ] Custom domain connected (if owner has one)

## Sign-off
- [ ] Owner has reviewed the live site
- [ ] Launch approved by:
```
