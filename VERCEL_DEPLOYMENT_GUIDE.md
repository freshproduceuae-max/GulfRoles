# Vercel Deployment Guide - jobbrowser.app

## Quick Start Deployment (5 minutes)

### Option 1: GitHub Integration (Recommended - Automatic)

1. **Connect Repository to Vercel**
   ```
   - Go to https://vercel.com/new
   - Select "Next.js" template
   - Connect your GitHub account
   - Select this repository (GulfRoles)
   - Click "Import"
   ```

2. **Configure Environment Variables**
   ```
   In Vercel Project Settings → Environment Variables, add:
   ```

   **Authentication:**
   - NEXTAUTH_SECRET: `9adf6e9741414886a6d87ea0bbd42e67dade50bca7d5c5c871025f69cfb00529`
   - NEXTAUTH_URL: `https://jobbrowser.app`

   **Database:**
   - DATABASE_URL: `postgresql://[user]:[password]@[host]:[port]/[database]`
   - SUPABASE_SERVICE_KEY: `[get from Supabase dashboard]`
   - NEXT_PUBLIC_SUPABASE_URL: `[your Supabase URL]`

   **Sentry Error Tracking:**
   - SENTRY_DSN: `[get from Sentry project settings]`
   - NEXT_PUBLIC_SENTRY_DSN: `[same as above]`
   - SENTRY_ORG: `[your Sentry org name]`
   - SENTRY_PROJECT: `jobbrowser`
   - SENTRY_AUTH_TOKEN: `[generate in Sentry]`

   **Email (SendGrid):**
   - SENDGRID_API_KEY: `[get from SendGrid]`
   - SENDGRID_FROM_EMAIL: `noreply@jobbrowser.app`

   **OAuth Providers:**
   - GOOGLE_CLIENT_ID: `[from Google Cloud Console]`
   - GOOGLE_CLIENT_SECRET: `[from Google Cloud Console]`
   - GITHUB_CLIENT_ID: `[from GitHub OAuth app]`
   - GITHUB_CLIENT_SECRET: `[from GitHub OAuth app]`

   **Storage (AWS S3):**
   - AWS_ACCESS_KEY_ID: `[your AWS access key]`
   - AWS_SECRET_ACCESS_KEY: `[your AWS secret key]`
   - AWS_REGION: `us-east-1`

   **Job APIs:**
   - CAREERJET_API_KEY: `[from CareerJet]`
   - JOOBLE_API_KEY: `[from Jooble]`

   **Application:**
   - CRON_SECRET: `[secure random string]`
   - NEXT_PUBLIC_APP_NAME: `JobBrowser`
   - NEXT_PUBLIC_API_BASE_URL: `https://jobbrowser.app/api`
   - NEXT_PUBLIC_APP_BASE_URL: `https://jobbrowser.app`
   - NODE_ENV: `production`

3. **Configure Domain**
   ```
   - Go to Project Settings → Domains
   - Add domain: jobbrowser.app
   - Follow DNS configuration instructions
   - Wait for SSL certificate (auto-provisioned)
   ```

4. **Trigger Deployment**
   ```
   - Push to master branch
   - Vercel automatically builds and deploys
   - Monitor deployment in dashboard
   ```

### Option 2: CLI Deployment (Quick Testing)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel (one-time)
vercel login

# Deploy to production
vercel --prod

# Verify deployment
vercel ls  # List all deployments
```

---

## Post-Deployment Verification

### 1. Check Deployment Status (5 min)

```bash
# Via Vercel Dashboard
https://vercel.com/dashboard

# Check:
- ✅ Build status: "Deployed"
- ✅ Deployment URL working
- ✅ No build errors
- ✅ Environment variables loaded
```

### 2. Test Production URL (5 min)

```bash
# Check homepage
curl -I https://jobbrowser.app/

# Expected response:
# HTTP/1.1 200 OK
# Cache-Control: public, s-maxage=604800, stale-while-revalidate=86400

# Test API endpoint
curl https://jobbrowser.app/api/health

# Expected response:
# {"status":"ok"}
```

### 3. Verify Critical Features (15 min)

```bash
# 1. Check search API
curl "https://jobbrowser.app/api/jobs?q=developer&limit=10"

# 2. Check affiliate redirect
curl -L "https://jobbrowser.app/api/affiliate/click?source=careerjet"

# 3. Check auth endpoint
curl -X POST https://jobbrowser.app/api/auth/employer-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 4. Check alerts subscription
curl -X POST https://jobbrowser.app/api/alerts \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","query":"developer"}'
```

### 4. Monitor Error Dashboard (Continuous)

1. **Sentry Setup**
   ```
   - Go to https://sentry.io
   - Create new project: jobbrowser
   - Select Next.js platform
   - Copy DSN values
   - Add to Vercel environment variables
   ```

2. **View Errors**
   ```
   - Dashboard: https://sentry.io/organizations/[org]/issues/
   - Alert on: Error rate > 5% per minute
   - Slack integration: Configure for real-time alerts
   ```

### 5. Enable Analytics (5 min)

1. **Vercel Analytics**
   ```
   - Project Settings → Analytics
   - Enable "Web Analytics"
   - View Core Web Vitals: https://vercel.com/analytics/[project]
   ```

2. **Monitor Metrics**
   ```
   - Largest Contentful Paint (LCP) < 2.5s
   - First Input Delay (FID) < 100ms
   - Cumulative Layout Shift (CLS) < 0.1
   ```

---

## Cron Jobs Configuration

### Automatic Email Alerts (Sunday 8 AM UTC)
```
Path: /api/cron/send-alerts
Schedule: 0 8 * * 0

Sets up in vercel.json automatically
```

### Expire Old Jobs (Daily Midnight UTC)
```
Path: /api/cron/expire-jobs
Schedule: 0 0 * * *

Sets up in vercel.json automatically
```

### Verify Cron Job Setup
```
- Go to Vercel Project → Deployments → Logs
- Search for "cron"
- Verify jobs executed on schedule
```

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
```
Solution:
1. Check package.json has all dependencies
2. Verify .env variables are set
3. Run: npm install
4. Retry deployment
```

**Error: "Database connection failed"**
```
Solution:
1. Verify DATABASE_URL is correct
2. Check database is running and accessible
3. Run migration: npm run migrate
4. Retry deployment
```

### Deployment is Slow

```
Check Vercel dashboard for:
- Build time > 5 minutes
- Large bundle size (> 500KB)
- External API calls during build

Solution:
- Optimize images
- Remove unused dependencies
- Move API calls to runtime
```

### 502 Bad Gateway

```
Check:
1. Server logs in Vercel dashboard
2. Database connection status
3. API rate limits

Solution:
1. Check Application Insights
2. Scale database resources
3. Implement caching
```

---

## Production Monitoring Checklist

- [ ] Vercel deployment dashboard accessible
- [ ] Sentry project created and receiving errors
- [ ] Google Search Console property verified
- [ ] Analytics enabled and tracking
- [ ] Custom domain DNS propagated (24-48 hours)
- [ ] SSL certificate installed
- [ ] Cron jobs scheduled and running
- [ ] Database backups configured
- [ ] Email service tested
- [ ] Error alerts configured
- [ ] Uptime monitoring enabled

---

## Rollback Procedure

If critical issues occur after deployment:

```bash
# Option 1: Via Vercel CLI
vercel rollback

# Option 2: Via Vercel Dashboard
1. Go to Deployments
2. Find previous stable deployment
3. Click "..."
4. Select "Promote to Production"

# Option 3: Re-deploy previous commit
git revert [commit-hash]
git push  # Triggers automatic redeploy
```

---

## Environment Variables Reference

| Variable | Type | Required | Notes |
|----------|------|----------|-------|
| DATABASE_URL | Secret | Yes | PostgreSQL connection string |
| NEXTAUTH_SECRET | Secret | Yes | JWT signing secret |
| NEXTAUTH_URL | Public | Yes | Production URL |
| SENTRY_DSN | Secret | Yes | Error tracking DSN |
| NEXT_PUBLIC_SENTRY_DSN | Public | Yes | Public error tracking key |
| SENDGRID_API_KEY | Secret | Yes | Email sending |
| AWS_ACCESS_KEY_ID | Secret | Yes | S3 uploads |
| GOOGLE_CLIENT_ID | Secret | Yes | OAuth login |
| CRON_SECRET | Secret | Yes | Scheduled job security |
| NODE_ENV | Public | Yes | Set to "production" |

---

## Support & Escalation

**For Deployment Issues:**
- Check Vercel status: https://www.vercel-status.com
- Review Vercel docs: https://vercel.com/docs

**For Application Issues:**
- Check Sentry dashboard: https://sentry.io
- Review application logs: Vercel dashboard → Deployments → Logs

**For Database Issues:**
- Check database provider status
- Review database logs
- Verify connection pool limits

**For Email Issues:**
- Check SendGrid dashboard
- Verify email template rendering
- Check spam filters

---

*Deployment Guide Complete*  
*Ready for Production Launch*
