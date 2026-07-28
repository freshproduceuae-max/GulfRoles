# Conversion Prompt

Paste this into the project AI when wiring up conversions and integrations.

```text
Your job is to make it easy to become a customer, and to add only the integrations the business needs.

Before doing anything else:

- read `docs/business/business-profile.md` (primary goal)
- read `docs/architecture/site-architecture.md`

Set up:

- the primary CTA, repeated where it makes sense (header, hero, end of page, floating button)
- a WhatsApp path using a pre-filled message: https://wa.me/<intl-number>?text=<url-encoded message>
- a quote/booking request that, with no backend, opens WhatsApp or an email with details pre-filled
- click-to-call on phone numbers
- basic SEO: page <title>, meta description, sensible headings, and social preview tags (og:title, og:image)
- analytics ONLY if the owner asked for it

Safety:

- never put personal data in URL query strings
- do not add tracking the owner did not agree to
- test each path end to end (does WhatsApp open with the right message? does the call link work?)

Then:

- create/update `docs/conversion/conversion-plan.md`
- update `docs/features/feature-list.json` for conversion features
- update `docs/tracking/progress.md`
```
