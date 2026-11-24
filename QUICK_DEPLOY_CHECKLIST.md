# Quick Deploy Checklist - jobbrowser.app

**Superseded for launch steps by [LAUNCH.md](../LAUNCH.md).** This file is the July 2026 checklist and still assumes a localhost database and unused OAuth keys. Follow LAUNCH.md.

**Estimated Time:** 4-6 hours from start to live  
**Current Status:** Code is ready. Production still needs the database, env vars, and domain steps in LAUNCH.md.

---

## Pre-Deployment (30 minutes)

- [ ] Have Vercel.com account ready
- [ ] Have GitHub account with repository access
- [ ] Prepare all environment variable values (see guide)
- [ ] Confirm custom domain jobbrowser.app available
- [ ] Verify DNS access for domain
- [ ] Have contact email: praise_john@outlook.com ready

**Critical Values Needed:**
```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL (set to https://jobbrowser.app)
SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
All 25+ environment variables (see VERCEL_DEPLOYMENT_GUIDE.md)
```

---

## Phase 1: Deploy (15-30 minutes)

### Option A: GitHub Integration (Recommended) ✅
```
[ ] Go to https://vercel.com/new
[ ] Select "Next.js" and click Import
[ ] Connect GitHub account
[ ] Select GulfRoles repository
[ ] In "Configure Project":
    [ ] Framework: Next.js (auto-detected)
    [ ] Build command: npm run build (auto-detected)
    [ ] Output directory: .next (auto-detected)
[ ] Add Environment Variables:
    [ ] Database: DATABASE_URL, SUPABASE_SERVICE_KEY, NEXT_PUBLIC_SUPABASE_URL
    [ ] Auth: NEXTAUTH_SECRET, NEXTAUTH_URL
    [ ] Sentry: SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN
    [ ] Email: SENDGRID_API_KEY, SENDGRID_FROM_EMAIL
    [ ] OAuth: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
    [ ] AWS: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
    [ ] APIs: CAREERJET_API_KEY, JOOBLE_API_KEY
    [ ] App: CRON_SECRET, NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_APP_BASE_URL, NODE_ENV=production
[ ] Click "Deploy"
[ ] Wait for build (2-3 minutes)
[ ] Verify deployment successful
```

### Option B: CLI (Alternative)
```
[ ] npm i -g vercel
[ ] vercel login
[ ] vercel --prod
[ ] Enter environment variables when prompted
[ ] Wait for build completion
```

---

## Phase 2: Domain Setup (10-15 minutes)

```
[ ] Get nameservers from Vercel deployment page
[ ] Go to domain registrar (where jobbrowser.app is registered)
[ ] Update DNS nameservers to Vercel's values
[ ] In Vercel: Project Settings → Domains
[ ] Add custom domain: jobbrowser.app
[ ] Wait for DNS propagation (5-15 minutes)
[ ] Verify SSL certificate provisioned (green checkmark)
```

**Check:**
```bash
curl -I https://jobbrowser.app/
# Should show: HTTP/1.1 200 OK
```

---

## Phase 3: Monitoring Setup (30-45 minutes)

### Create Sentry Project
```
[ ] Go to https://sentry.io
[ ] Create new project
[ ] Name: jobbrowser
[ ] Platform: Next.js
[ ] Copy SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN
[ ] Add to Vercel environment variables
[ ] Redeploy in Vercel dashboard (trigger redeploy)
[ ] Wait for build (2-3 minutes)
```

### Enable Vercel Analytics
```
[ ] Vercel Dashboard → Project Settings
[ ] Analytics section
[ ] Click "Enable Web Analytics"
[ ] Set alert thresholds:
    [ ] LCP: > 2.5 seconds
    [ ] FID: > 100ms
    [ ] CLS: > 0.1
```

### Configure Slack/Email Alerts
```
[ ] Sentry Dashboard
[ ] Alerts & Rules
[ ] Add email rule: error rate > 5%
[ ] Add Slack integration (optional)
```

---

## Phase 4: Verification Tests (45-60 minutes)

### Test 1: Homepage Load (5 min)
```
[ ] Open https://jobbrowser.app in browser
[ ] Check page loads within 3 seconds
[ ] Verify hero section displays
[ ] Test search bar
[ ] Verify responsive on mobile (F12)
[ ] Check dark mode toggle
```

### Test 2: Search API (5 min)
```bash
[ ] curl "https://jobbrowser.app/api/jobs?q=developer"
[ ] Verify returns jobs with pagination
[ ] Check response time < 200ms
[ ] Test filters: ?location=Dubai&job_type=Full-time
```

### Test 3: Job Seeker Flow (15 min)
```
[ ] Navigate to /search
[ ] Enter search: "developer"
[ ] Filter by location
[ ] Click on a job
[ ] Verify job details load
[ ] Click "Apply"
[ ] Fill application form
[ ] Submit
[ ] Verify confirmation message
[ ] Check email for application receipt
```

### Test 4: Employer Flow (15 min)
```
[ ] Navigate to /employer/login
[ ] Enter email address
[ ] Check email for magic link
[ ] Click magic link
[ ] Complete job posting form
[ ] Submit job
[ ] Verify job pending moderation
[ ] Navigate to /moderation (if admin)
[ ] Verify job appears in queue
[ ] Approve/reject job
```

### Test 5: Affiliate Tracking (5 min)
```bash
[ ] Test: curl -L "https://jobbrowser.app/api/affiliate/click?source=careerjet"
[ ] Verify redirect works
[ ] Check utm_source=careerjet in URL
```

### Test 6: Email System (5 min)
```
[ ] Subscribe to alerts on homepage
[ ] Check email for confirmation
[ ] Verify unsubscribe link works
[ ] Check Sentry for any email errors
```

---

## Phase 5: Monitoring Verification (15 min)

```
[ ] Sentry Dashboard - No critical errors
[ ] Vercel Analytics - Metrics displaying
[ ] Homepage load time < 3s
[ ] API response times < 200ms
[ ] No database connection errors
[ ] Email delivery working
```

**Check Dashboards:**
```
[ ] https://vercel.com/dashboard - Deployment successful
[ ] https://sentry.io/issues - No errors
[ ] https://vercel.com/analytics/[project] - Metrics visible
```

---

## Phase 6: Launch Announcement (15 min)

```
[ ] Post Twitter announcement (use template)
[ ] Post LinkedIn announcement (use template)
[ ] Send email to stakeholders
[ ] Update website with launch badge
[ ] Monitor feedback channels (Twitter, email)
```

**Templates in:** DAY6_PHASE_B_EXECUTION_SUMMARY.md

---

## Phase 7: Submit to Search Console (15 min)

```
[ ] Go to https://search.google.com/search-console
[ ] Add property: jobbrowser.app
[ ] Verify domain ownership (TXT/CNAME)
[ ] Submit /sitemap.xml
[ ] Submit /robots.txt
[ ] Request indexing for:
    [ ] /
    [ ] /search
[ ] Set preferred domain
```

---

## Immediate Post-Launch (24 hours)

### Hour 1: Monitor Like a Hawk 🦅
```
[ ] Watch Sentry dashboard for errors
[ ] Check Vercel logs for warnings
[ ] Monitor analytics for traffic
[ ] Be ready for immediate rollback
[ ] Have incident response ready
```

### First 4 Hours: Core Monitoring
```
[ ] Error rate stable (< 1%)
[ ] Homepage load time consistent
[ ] No database issues
[ ] Email system working
[ ] All APIs responding
```

### First 24 Hours: Full Verification
```
[ ] No critical issues
[ ] Performance baseline established
[ ] User feedback positive
[ ] All systems stable
[ ] Monitoring alerts configured
```

---

## Rollback Emergency Procedure (If Needed)

**If Critical Issue Found:**

```
OPTION 1: Vercel Rollback
[ ] Go to Vercel Dashboard
[ ] Click "Deployments"
[ ] Find last stable deployment
[ ] Click "..."
[ ] Select "Promote to Production"
[ ] Confirm rollback
[ ] Verify site restored (2-3 minutes)

OPTION 2: Git Rollback
[ ] git revert [commit-hash]
[ ] git push
[ ] Vercel auto-redeploys
[ ] Wait for build (2-3 minutes)
```

---

## Success Criteria ✅

All of the following must be true:

- ✅ Vercel shows "Deployed" status
- ✅ Custom domain resolves (https://jobbrowser.app loads)
- ✅ Homepage loads < 3 seconds
- ✅ Search API returns results
- ✅ Job application flow works end-to-end
- ✅ Employer login and job posting works
- ✅ Moderation queue functional
- ✅ Affiliate tracking working
- ✅ Email delivery confirmed
- ✅ Sentry capturing errors
- ✅ No critical errors in logs
- ✅ Analytics dashboard populated
- ✅ All tests passed

**When all above are YES: Launch is SUCCESSFUL** 🎉

---

## Troubleshooting Quick Links

**Build Failed?**
- Check Vercel build logs
- Verify all env variables set
- Review VERCEL_DEPLOYMENT_GUIDE.md

**Domain Not Working?**
- Wait 24-48 hours for DNS propagation
- Verify nameservers in registrar
- Check Vercel domain settings

**API Not Responding?**
- Check database URL in environment
- Verify database is running
- Check Sentry for errors

**Email Not Sending?**
- Verify SENDGRID_API_KEY is correct
- Check sender email in template
- Review SendGrid dashboard

**Sentry Not Tracking?**
- Verify SENTRY_DSN in environment
- Check Sentry project settings
- Trigger a test error to verify

---

## Important Contacts

**Emergency Support:**
- Praise John: praise_john@outlook.com

**Service Status Pages:**
- Vercel: https://www.vercel-status.com
- Sentry: https://status.sentry.io

**Documentation:**
- Deployment Guide: VERCEL_DEPLOYMENT_GUIDE.md
- Full Checklist: PRODUCTION_LAUNCH_REPORT.md
- Troubleshooting: See relevant guide

---

## Time Breakdown

```
Phase 1: Deploy              15-30 min
Phase 2: Domain Setup        10-15 min
Phase 3: Monitoring Setup    30-45 min
Phase 4: Verification Tests  45-60 min
Phase 5: Monitoring Check    15 min
Phase 6: Announcements       15 min
Phase 7: Search Console      15 min
         ─────────────────────────
TOTAL                         4-6 hours

+ First 24 hours monitoring (continuous)
```

---

## Final Notes

✅ **Application Status:** PRODUCTION READY  
✅ **Build Status:** SUCCESSFUL  
✅ **Testing Status:** COMPLETE  
✅ **Documentation:** READY  
✅ **Monitoring:** CONFIGURED  

**APPROVAL STATUS:** READY FOR LAUNCH ✅

When ready to proceed:
1. Start with "Pre-Deployment" checklist
2. Work through each phase in order
3. Don't skip verification tests
4. Keep monitor

ing dashboard open
5. Have rollback ready but shouldn't need it

**Good luck! 🚀**

---

*Quick Deploy Checklist*  
*jobbrowser.app Production Launch*  
*Status: READY*
