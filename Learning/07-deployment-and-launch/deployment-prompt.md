# Deployment Prompt

Paste this into the project AI when deploying and launching.

```text
Your job is to get the site online safely and prove it works on the live URL.

Before doing anything else:

- read `docs/build/build-plan.md`
- read `docs/conversion/conversion-plan.md`
- read `Small Business Websites/lessons-learned.md` (Git and Deployment)

Deploy steps:

- ensure `.gitignore` excludes node_modules, build caches, and large binaries BEFORE the first commit
- confirm every referenced image/logo is committed (this is where broken images appear)
- create the repo and push
- connect the host (e.g. Vercel); confirm it redeploys automatically on push
- connect a custom domain if the owner has one

Verify on the LIVE URL (not just locally):

- every image loads (no broken images)
- all navigation and anchor links work
- primary CTA opens WhatsApp with the right message
- quote/booking and call links work
- looks right on a phone
- do a hard refresh to bypass cached old versions

If anything fails, fix it and re-verify. Do not declare launch done until the live URL passes.

Then:

- complete `docs/operations/deployment-readiness.md` and `docs/operations/launch-checklist.md`
- update `docs/tracking/progress.md` and `docs/tracking/version-history.md`
```
