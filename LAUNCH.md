# Launch JobBrowser

The app builds and the MVP flows are in the code. It does not go live, and it does not earn anything, until you do the steps below. This agent did not change the Vercel project, the domain, or any secret.

Live site today: https://jobbrowser.vercel.app still points `DATABASE_URL` at localhost, so search returns a connection error. https://jobbrowser.app did not complete a TLS handshake when it was checked on 24 Nov 2026.

## 1. Create the database

1. Create a free Postgres database. [Neon](https://neon.tech) is enough. Vercel Postgres or Supabase work too, as long as you get a normal `postgresql://` URL.
2. Copy the connection string. It should include the host, database, user, password, and `sslmode=require`.
3. On your computer, in this repo, put that URL only in `.env.local` (that file is gitignored):

   ```bash
   DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
   npm run migrate
   ```

4. `npm run migrate` applies `db/migrations/001_init_schema.sql`, `002_add_affiliate_tracking.sql`, and `003_ingestion_featured_resumes.sql`. It records what it has applied and can be run again safely.
5. Do not run `npm run seed` or `npm run seed:production` against this database. Those scripts can insert labeled demo jobs. Real listings come from the feeds.

## 2. Set environment variables in Vercel

Vercel dashboard → the JobBrowser project → Settings → Environment Variables. Set them for Production. Do not put them in git.

Generate secrets with `openssl rand -base64 32`.

| Name | Required now | What to put |
| --- | --- | --- |
| `DATABASE_URL` | Yes | The hosted Postgres URL from step 1. Replace the localhost value. |
| `NEXTAUTH_SECRET` | Yes | A long random string. |
| `NEXTAUTH_URL` | Yes | `https://jobbrowser.app` after the domain works. Until then, `https://jobbrowser.vercel.app`. |
| `ADMIN_EMAIL` | Yes | The email you will use at `/admin/login`. |
| `ADMIN_PASSWORD` | Yes | A password you choose. It is not in the source code. |
| `CRON_SECRET` | Yes | A long random string. Vercel Cron sends it as `Authorization: Bearer …`. |
| `NEXT_PUBLIC_APP_NAME` | Yes | `JobBrowser` |
| `NEXT_PUBLIC_APP_BASE_URL` | Yes | `https://jobbrowser.app` (or the vercel.app URL until the domain works). |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | That same origin plus `/api`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Yes | The inbox you actually read. |
| `SENDGRID_API_KEY` | For email | SendGrid API key. Without it, alerts, employer links, and application emails do not send. The site still loads. |
| `SENDGRID_FROM_EMAIL` | For email | A sender on a domain you verify in SendGrid, such as `noreply@jobbrowser.app`. |
| `CAREERJET_AFFILIATE_ID` | For Careerjet jobs and clicks | Publisher id from Careerjet. `CAREERJET_API_KEY` is accepted as the same value. |
| `CAREERJET_USER_IP` | For Careerjet ingestion | The IP Careerjet tells you to send with server-side queries. |
| `JOOBLE_API_KEY` | For Jooble jobs | Key from the Jooble publisher API. |
| `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` | For Adzuna jobs | Adzuna covers India, Australia, and the US only. There is no UAE or Saudi feed. |
| `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` | Optional | From a Sentry project, when you want error monitoring. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` and `NEXT_PUBLIC_ADSENSE_SLOT_HOME`, `NEXT_PUBLIC_ADSENSE_SLOT_SEARCH`, `NEXT_PUBLIC_ADSENSE_SLOT_JOB` | Later | Leave blank. See section 7. |

Every name is also listed in `.env.example`.

After saving the variables, redeploy the project from the Vercel dashboard so the new values are picked up. Confirm `https://jobbrowser.vercel.app/api/health` returns `"database": "connected"`.

## 3. Apply for the affiliate accounts

The ingestion code calls the official publisher APIs. It does not scrape boards.

1. **Careerjet.** Apply for a publisher / affiliate account. Put the affiliate id in `CAREERJET_AFFILIATE_ID`. Their search API also requires `CAREERJET_USER_IP`. Use the value they approve. Do not invent an IP.
2. **Jooble.** Request an API key at [jooble.org/api/about](https://jooble.org/api/about) and set `JOOBLE_API_KEY`.
3. **Adzuna.** Create an app id and key. The crawl uses them for India (`in`), Australia (`au`), and the US (`us`). UAE and Saudi listings will not come from Adzuna.

Clicks are stored in `affiliate_clicks`. A partner job’s Apply button tells the seeker which network they are going to, then redirects to that listing’s URL. Direct employer jobs stay on JobBrowser and are not counted as affiliate clicks.

When the keys are in `.env.local` and `DATABASE_URL` points at the hosted database, pull a first batch from your computer (this is not limited by the Vercel cron timeout):

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

The two Vercel cron jobs, which is the free-tier maximum, and both run once a day:

- `0 3 * * *` → `/api/cron/daily` ingests one keyword/region slot and expires jobs that were not seen for 30 days, or whose `expires_at` has passed.
- `0 16 * * *` → `/api/cron/send-alerts` sends the weekly digest only to people whose last email was at least 7 days ago.

Both return 401 until `CRON_SECRET` is set. Vercel adds the bearer header for you when that variable exists.

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

## If your laptop has newer files

This branch starts from commit `b16e687` on `master`. Compare your local project to this branch before you overwrite either side. Demo seed data is still in `db/seed.ts` and is not loaded by migrate.
