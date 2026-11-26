# Launch JobBrowser

The app builds and the MVP flows are in the code. It does not earn anything until the affiliate keys and the `jobbrowser.app` domain are finished. This agent did not change the Vercel project or the domain.

Neon (Singapore) is already connected to the Vercel project. `DATABASE_URL` is the pooled URL the site uses. `DATABASE_URL_UNPOOLED` is the direct URL. `npm run build` applies migrations with the direct URL when one of those is present, then builds. It does not insert demo jobs. A second build skips migrations that are already recorded.

## 1. Database

The tables are created on the next Vercel build after this branch is merged. You can also apply them from your computer:

```bash
DATABASE_URL="postgresql://…pooler…" DATABASE_URL_UNPOOLED="postgresql://…direct…" npm run migrate
```

Migrations are `db/migrations/001_init_schema.sql` through `007_sourcing_team_analytics.sql`. Do not run `npm run seed` or `npm run seed:production` against Neon.

`npm run build` runs `tsx scripts/migrate.ts` before `next build`. `tsx` is a production dependency, so the migrate step still runs if `NODE_ENV=production` causes npm to skip devDependencies.

Migrations run only when `VERCEL_ENV=production` or `RUN_MIGRATIONS=true`. `npm run migrate` sets that flag. Preview deployments share the production Neon database, so a preview build skips migrations and does not change live tables.

## 2. Set environment variables in Vercel

Vercel dashboard → the JobBrowser project → Settings → Environment Variables. Set them for Production. Do not put them in git.

Generate secrets with `openssl rand -base64 32`.

| Name | Required now | What to put |
| --- | --- | --- |
| `DATABASE_URL` | Already set | Pooled Neon URL. Leave the injected value. Do not point it at localhost. |
| `DATABASE_URL_UNPOOLED` | Already set | Direct Neon URL. Migrations prefer this. Do not use it as the runtime URL. |
| `NEXTAUTH_SECRET` | Yes | A long random string. |
| `NEXTAUTH_URL` | Yes | `https://jobbrowser.app` after the domain works. Until then, `https://jobbrowser.vercel.app`. |
| `ADMIN_EMAIL` | Server only | Admin login and optional contact-form notices. Never shown on the site. |
| `ADMIN_PASSWORD` | Yes | A password you choose. It is not in the source code. |
| `CRON_SECRET` | Yes | A long random string. Vercel Cron sends it as `Authorization: Bearer …`. |
| `NEXT_PUBLIC_APP_NAME` | Yes | `JobBrowser` |
| `NEXT_PUBLIC_APP_BASE_URL` | Yes | `https://jobbrowser.app` (or the vercel.app URL until the domain works). |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | That same origin plus `/api`. |
| `SITE_PUBLIC` | Leave unset | Set to `true` only when the site should be indexed. Until then, `robots.txt` disallows every path and every page sends `noindex`. |
| `RESUME_STORE` | Leave unset | `neon` stores CVs in Postgres. `blob` plus `BLOB_READ_WRITE_TOKEN` uses a private Vercel Blob store. |
| `RESEND_API_KEY` | For email | Resend API key. Without it, mail is logged and not sent. The site still loads. |
| `EMAIL_FROM` | For email | `JobBrowser <noreply@jobbrowser.app>` after that sender is verified in Resend. |
| `CAREERJET_AFFILIATE_ID` | For Careerjet jobs and clicks | Publisher id from Careerjet. `CAREERJET_API_KEY` is accepted as the same value. |
| `CAREERJET_USER_IP` | For Careerjet ingestion | The IP Careerjet tells you to send with server-side queries. |
| `JOOBLE_API_KEY` | For Jooble jobs | Key from the Jooble publisher API. |
| `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` | For Adzuna jobs | Adzuna covers India, Australia, and the US only. There is no UAE or Saudi feed. |
| `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` | Optional | From a Sentry project, when you want error monitoring. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` and `NEXT_PUBLIC_ADSENSE_SLOT_HOME`, `NEXT_PUBLIC_ADSENSE_SLOT_SEARCH`, `NEXT_PUBLIC_ADSENSE_SLOT_JOB` | Later | Leave blank. See section 7. |

Every name is also listed in `.env.example`.

Leave `SITE_PUBLIC` unset on Production until you want Google to index the site. The live site at `jobbrowser.vercel.app` should stay out of search while the employer applicant flow is the launch step. Setting the variable to `true` later opens `robots.txt` and removes the site-wide `noindex`. The sitemap line always uses `NEXT_PUBLIC_APP_BASE_URL`.

Do not set `NODE_ENV` by hand. Vercel sets it. `tsx` is already installed for the build even if a production install skips devDependencies.

## 3. Apply for the affiliate accounts

The ingestion code calls official publisher APIs and public ATS boards. It does not scrape boards. Indeed, Glassdoor, LinkedIn, and GulfTalent are blocked even if a URL shows up in a feed.

1. **Careerjet, Jooble, and Adzuna** stay the first CPC partners. Apply the same week to Talent.com, WhatJobs, Jobtome, JobRapido, and Jobg8 if you want more than one payout stream. Do not turn on `JobPosting` markup for those partners until the contract says Google for Jobs is allowed. The code leaves it off.
2. **Remote OK and Remotive** are on by default (`LEGAL_FEEDS=remoteok,remotive`). Remotive jobs are stored with attribution and **without** Google JobPosting markup. Set `LEGAL_FEEDS=none` to skip them. Do not send Remotive jobs onward to Jooble or another board.
3. **Employer career boards.** After the magic-link sign-in, the employer opens `/employer/sources` and enters a public Greenhouse, Lever, Ashby, or Workable board name. The next `/api/cron/daily` run indexes roles whose location matches the region they picked. There is no fee and no recruitment seat.
4. **Clicks.** `/admin/revenue` groups clicks by source. Dollar figures there are estimates for the three CPC partners only.

Careerjet still needs `CAREERJET_AFFILIATE_ID` and the `CAREERJET_USER_IP` they approve. Jooble needs `JOOBLE_API_KEY`. Adzuna needs `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`, and only covers India, Australia, and the US.

When those keys are in `.env.local` and `DATABASE_URL` points at the hosted database, pull a first partner batch from your computer (this is not limited by the Vercel cron timeout):

```bash
npm run ingest -- --slots=40
```

Repeat until `/api/jobs` shows a useful catalogue. One slot is one keyword in one country, across every configured source. The daily cron continues the rotation with one slot so it stays inside the free-tier function time.

Check a count in the Neon SQL editor:

```sql
SELECT source, COUNT(*) FROM jobs WHERE status = 'published' GROUP BY source;
```

The “1,000 indexed jobs” launch target is this step. The code cannot meet it without the keys.

## 4. Fix jobbrowser.app

1. In Vercel, add `jobbrowser.app` as a domain on this project. Do not remove the `vercel.app` URL until the custom domain loads.
2. At the registrar, set the DNS records Vercel shows you (usually an A record and a `www` CNAME, or the nameservers Vercel gives you).
3. Wait until Vercel says the certificate is ready and `https://jobbrowser.app` loads the same site.
4. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_BASE_URL` to `https://jobbrowser.app`, then redeploy.
5. `gulfjob.fyi` is the spare domain from the decision log. Leave it parked until you want a Gulf-only front.

## 5. Search Console, email, and admin

1. Open [Google Search Console](https://search.google.com/search-console), add `https://jobbrowser.app`, and verify it with the DNS record Google gives you.
2. Submit `https://jobbrowser.app/sitemap.xml`. The sitemap lists the static pages, the five regions, and published jobs. `robots.txt` already points at that sitemap.
3. In SendGrid, authenticate `jobbrowser.app` (SPF and DKIM) before you expect alerts to reach inboxes.
4. Sign in at `/admin/login` with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The moderation queue is `/admin/moderation`.
5. Post a job once, end to end: `/employer/login`, open the email link, finish the 3 steps, then apply as a seeker and open `/employer/inbox/<job id>`. Resumes are stored in Postgres and are not public files.

The daily jobs are declared in `vercel.json`. Hobby can run each of them at most once per day. Vercel’s preview check on this pull request fails in the first second, before the build, because the commits are authored by `cursoragent@cursor.com` and that address is not a member of the Vercel team. Open the failed deployment, allow that author, or merge and redeploy from your own account. Your deploy is the one that registers the schedules.

- `0 5 * * *` → `/api/cron/daily` ingests one keyword/region slot and expires jobs that were not seen for 30 days, or whose `expires_at` has passed.
- `0 16 * * *` → `/api/cron/send-alerts` sends the weekly digest only to people whose last email was at least 7 days ago.

Both routes return 401 until `CRON_SECRET` is set. Vercel adds the bearer header for you when that variable exists.

## 6. Put your name on the legal pages

`components/content/OperatorNotice.tsx` says the site is operated as a sole proprietorship and gives the contact email. Before you take money (affiliate payouts, AdSense, or featured jobs), edit that paragraph so it includes your legal name and postal address, then update Privacy and Terms if the address should appear there too. This is your notice to readers, not a filing.

## 7. AdSense, later

Leave the AdSense variables empty at launch. No ad code is sent to the browser until `NEXT_PUBLIC_ADSENSE_CLIENT` is set.

When Search Console shows real traffic and Google accepts the site:

1. Apply for AdSense on `jobbrowser.app`.
2. Create three display units.
3. Set `NEXT_PUBLIC_ADSENSE_CLIENT` and `NEXT_PUBLIC_ADSENSE_SLOT_HOME`, `NEXT_PUBLIC_ADSENSE_SLOT_SEARCH`, `NEXT_PUBLIC_ADSENSE_SLOT_JOB`.
4. Redeploy.

The slots are already placed on the homepage, the search results, and the job page. The privacy and cookie pages already say advertising cookies stay off until this is configured.

## 8. Featured listings, later

Employer posts are free. There is no Stripe or Razorpay checkout.

The database has `listing_tier` (`free` or `featured`), `is_featured`, and `featured_until`. Homepage ordering prefers featured jobs. An admin session can set the flag:

`POST /api/admin/listings/feature` with JSON `{ "job_id": "…", "featured": true, "days": 30 }`.

A paid flow can call that same update after a successful payment. Do not charge anyone until that checkout exists and the legal pages name you.

## What this version does not do

These stay out of scope, on purpose:

- Recruiter ATS, resume search, subscriptions, premium seeker tools.
- Selling or reselling CVs. Applications are visible only to the employer who posted the job, and to you as admin.
- Arabic or Hindi.
- Payments.

Lighthouse and a formal WCAG audit were not run in this change. Search Console verification, 1,000 live jobs, and 100 alert subscribers cannot be checked until the steps above are done.

## 9. Cloudflare cutover (free plan)

Vercel Hobby cannot show ads. The app can run on Cloudflare Workers with `@opennextjs/cloudflare` while the Vercel project stays up. Do not point `jobbrowser.app` at Cloudflare until the Worker answers.

`tsx` stays a production dependency. `robots.txt` still builds its sitemap from `NEXT_PUBLIC_APP_BASE_URL`. Leave `SITE_PUBLIC` unset until you want the site indexed.

### Secrets and variables

Set Worker secrets with `npx wrangler secret put NAME`. Do not put them in git. GitHub Actions needs repository secrets, not the values in the workflow file.

| Name | Where | Purpose |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | GitHub secret | Deploy token with Workers Scripts edit permission. R2 is not required. |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub secret | The account that owns the Worker. |
| `DATABASE_URL` | GitHub secret and Worker secret | Pooled Neon URL. The Worker reads through Neon’s HTTP driver, one round trip per query. Vercel still uses the pg pool. |
| `DATABASE_URL_UNPOOLED` | GitHub secret | Direct Neon URL. Used only by `npm run migrate` in Actions. |
| `NEXTAUTH_SECRET` | Worker secret | Admin session signing. |
| `NEXTAUTH_URL` | Plaintext var in `wrangler.jsonc` | `https://jobbrowser.jobbrowser.workers.dev` until the domain moves. A dashboard text value is replaced on every deploy. |
| `ADMIN_EMAIL` | Worker secret | Admin login and contact-form notices. Never rendered. |
| `ADMIN_PASSWORD` | Worker secret | Admin login. |
| `CRON_SECRET` | Worker secret | Cron routes reject calls without `Authorization: Bearer` this value. The Worker cron sends it. |
| `NEXT_PUBLIC_APP_NAME` | GitHub Actions variable | `JobBrowser`. Read at build time as `vars.NEXT_PUBLIC_APP_NAME`. |
| `NEXT_PUBLIC_APP_BASE_URL` | GitHub Actions variable | `https://jobbrowser.jobbrowser.workers.dev` until the custom domain. Read as `vars.NEXT_PUBLIC_APP_BASE_URL`. |
| `NEXT_PUBLIC_API_BASE_URL` | GitHub Actions variable | `https://jobbrowser.jobbrowser.workers.dev/api` until the custom domain. Read as `vars.NEXT_PUBLIC_API_BASE_URL`. |
| `RESEND_API_KEY` | Worker secret | Mail. Optional. Unset means mail is logged and not sent. |
| `EMAIL_FROM` | Plaintext var in `wrangler.jsonc` | `JobBrowser <noreply@jobbrowser.app>`. Do not rely on the dashboard; deploy replaces plaintext vars. |
| `RESUME_STORE` | Worker var | `neon`. Set in `wrangler.jsonc`. CVs stay in Postgres. The `r2` code path is unused until a later plan adds a bucket binding. |
| `SITE_PUBLIC` | Worker var | Leave unset. `true` is the only value that opens crawlers. |
| `CAREERJET_AFFILIATE_ID`, `CAREERJET_USER_IP`, `JOOBLE_API_KEY`, `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` | Worker secrets | Same partner keys as Vercel, when you have them. |
| `LEGAL_FEEDS` | Worker var | `remoteok,remotive`, or `none`. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` and the three `NEXT_PUBLIC_ADSENSE_SLOT_*` values | GitHub Actions variables and Worker vars | Leave empty until AdSense is approved. |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | Worker secret, GitHub variable, GitHub secret | Optional. The build skips source-map upload without a real token. |
| `ADMIN_PASSWORD_HASH` | Worker secret | Optional instead of `ADMIN_PASSWORD`. |
| `CAREERJET_API_KEY`, `CAREERJET_AFFILIATE_URL`, `JOOBLE_AFFILIATE_URL`, `ADZUNA_AFFILIATE_URL`, `BLOB_READ_WRITE_TOKEN` | Worker secrets | Optional. Blob is the Vercel store. Leave the token unset on Cloudflare unless `RESUME_STORE=blob`. |

Every other name in `.env.example` can stay unset. `GOOGLE_*`, `GITHUB_*`, `AWS_*`, `SUPABASE_*`, `INDEED_API_KEY`, and `LINKEDIN_API_KEY` are not used. Do not set `SEED_SAMPLE_JOBS` on the public Worker.

The deploy workflow reads these GitHub Actions variables at build time, because Next copies `NEXT_PUBLIC_*` into the browser bundle:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_BASE_URL`
- `NEXT_PUBLIC_API_BASE_URL`

It also reads optional variables `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT_HOME`, `NEXT_PUBLIC_ADSENSE_SLOT_SEARCH`, `NEXT_PUBLIC_ADSENSE_SLOT_JOB`, and `NEXT_PUBLIC_SENTRY_DSN`. Leave those unset until you use them. Until the custom domain, set the base URL variables to `https://jobbrowser.jobbrowser.workers.dev` and the API variable to that origin plus `/api`.

GitHub secrets the workflow reads are `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `DATABASE_URL`, and `DATABASE_URL_UNPOOLED`. Other runtime secrets (`CRON_SECRET`, `NEXTAUTH_SECRET`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`, `RESEND_API_KEY`, partner keys) are Worker secrets only. Do not put an owner address in a `NEXT_PUBLIC_` variable.

`wrangler deploy` replaces every plaintext Worker variable with the `vars` block in `wrangler.jsonc`. Secrets set with `wrangler secret put` stay. The file includes `CF_WORKER`, `RESUME_STORE`, `EMAIL_FROM`, `NEXTAUTH_URL`, and `NEXT_PUBLIC_APP_BASE_URL`. `ADMIN_EMAIL`, `RESEND_API_KEY`, and the database URLs stay secrets and are not in the file. `SITE_PUBLIC` is omitted on purpose, so a dashboard text value is cleared and the site stays out of search. `LEGAL_FEEDS` is also omitted; when it is unset the app uses `remoteok,remotive`. AdSense and Sentry values are not plaintext vars. Deploy does not create an R2 bucket.

### Cutover

1. In the Cloudflare dashboard, create an API token that can edit Workers scripts for this account. R2 is not enabled and is not required. Put the token and account id in the GitHub repository secrets named above. Also add `DATABASE_URL` and `DATABASE_URL_UNPOOLED`. Add GitHub Actions variables `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_BASE_URL`, and `NEXT_PUBLIC_API_BASE_URL`.
2. Create the Worker by merging this branch, or run `npm run deploy:cf` from your computer after `npx wrangler login`. The GitHub Action on `master` runs tests, then `npm run migrate`, then the Worker deploy. It does not migrate inside the Worker and it does not create storage.
3. Set the Worker secrets listed above. CVs stay in Postgres because `RESUME_STORE` is `neon`.
4. Open `https://jobbrowser.jobbrowser.workers.dev`. Confirm `/api/health` says the database is connected, `/` responds, and `/robots.txt` disallows `/` while `SITE_PUBLIC` is unset.
5. DNS is at Porkbun. Add the domain `jobbrowser.app` to the Cloudflare account. At Porkbun, change the nameservers to the two Cloudflare nameservers shown for the zone. Wait until Cloudflare says the zone is active.
6. Attach `jobbrowser.app` and `www.jobbrowser.app` as custom domains on the Worker. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_BASE_URL` to `https://jobbrowser.app`, then redeploy.
7. Hit `/api/health`, a job page, employer login, and `/robots.txt` on the custom domain.
8. When that looks right, remove the Vercel project or at least its crons and domain. Until then both hosts can run the daily jobs. Retire Vercel before the next `0 5` or `0 16` UTC cron so ingestion and alert mail do not run twice.
9. Leave `RESUME_STORE` at `neon`. The R2 adapter stays in the code for a later plan. This deploy does not use it.

### Free plan limits

A dry-run of this Worker reported `Total Upload: 6057 KiB / gzip: 1498 KiB`. That is under the older 3 MB compressed cap and under the current 64 MiB uncompressed cap. Cloudflare Images is not used.

Workers Free allows 10 ms of CPU per request and per cron run. Time spent waiting on Neon does not count. Next.js rendering and the daily ingest can still cross 10 ms and then Cloudflare returns error 1102. If that happens on real traffic, the $5 Workers Paid plan raises the CPU limit. Free also allows 100,000 requests per day and 5 cron triggers on the account. This app uses 2.

Until Vercel is retired, both hosts can run the same crons. Remove the Vercel crons before the next `0 5` or `0 16` UTC run.


## If your laptop has newer files

This branch starts from commit `b16e687` on `master`. Compare your local project to this branch before you overwrite either side. Demo seed data is still in `db/seed.ts` and is not loaded by migrate.
