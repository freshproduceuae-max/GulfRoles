# jobbrowser.app - Vercel Production Launch Checklist

**Date:** [Insert Launch Date]  
**Prepared by:** [Your Name]  
**Project:** jobbrowser.app MVP  

---

## Phase 1: Code Quality & Build Verification

### Build & Lint Tests
- [ ] Run `npm run build` - must complete without errors
- [ ] Run `npm run lint` - must pass all rules
- [ ] Run `npm run type-check` - all TypeScript types valid
- [ ] Verify `.next` build output directory is clean
- [ ] Test build with `NODE_ENV=production` locally

### Code Review Checklist
- [ ] All sensitive data removed from codebase
- [ ] No API keys hardcoded in source files
- [ ] All console.logs checked for production readiness
- [ ] Dead code removed or marked for deletion
- [ ] README.md updated with deployment instructions
- [ ] Security headers configured in next.config.js
- [ ] CORS headers configured appropriately
- [ ] CSP (Content Security Policy) headers set

---

## Phase 2: Vercel Project Setup

### Project Creation & Configuration
- [ ] Create Vercel project from GitHub
- [ ] Connect repository: [GulfRoles/jobbrowser-app]
- [ ] Set production branch to `main`
- [ ] Enable preview deployments for PR branches
- [ ] Configure project name: `jobbrowser-app`
- [ ] Set region: Primary (iad1), Secondary (sfo1, dub1)
- [ ] Verify vercel.json configuration uploaded

### Build Configuration
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`
- [ ] Node.js version: 18.17+ (set in package.json engines)
- [ ] Enable Deployment Protection for production

---

## Phase 3: Environment Variables Setup

### Critical Environment Variables (Must set before deploy)

#### NextAuth & Core
- [ ] `NODE_ENV` = `production`
- [ ] `NEXTAUTH_SECRET` - Generated 32+ char secret (openssl rand -base64 32)
- [ ] `NEXTAUTH_URL` = `https://jobbrowser.app`

#### Database
- [ ] `DATABASE_URL` = PostgreSQL connection string with ?sslmode=require
  - Format: `postgresql://user:password@host:5432/jobbrowser_prod?sslmode=require`
  - Verify SSL enabled for production
  - Test connection string before setting

#### OAuth Providers
- [ ] `GOOGLE_CLIENT_ID` - From Google Cloud Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- [ ] `GITHUB_CLIENT_ID` - From GitHub OAuth app
- [ ] `GITHUB_CLIENT_SECRET` - From GitHub OAuth app

#### Email Service (SendGrid)
- [ ] `SENDGRID_API_KEY` - Full access API key from SendGrid
- [ ] `SENDGRID_FROM_EMAIL` = `noreply@jobbrowser.app`
- [ ] Verify sender domain verification in SendGrid

#### Error Monitoring (Sentry)
- [ ] `SENTRY_DSN` - From Sentry project settings
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Public DSN for client errors
- [ ] `SENTRY_ORG` = `jobbrowser`
- [ ] `SENTRY_PROJECT` = `jobbrowser-production`
- [ ] `SENTRY_AUTH_TOKEN` - Internal use for event filtering

#### AWS (Email Queue/S3)
- [ ] `AWS_ACCESS_KEY_ID` - IAM user credentials
- [ ] `AWS_SECRET_ACCESS_KEY` - IAM user credentials
- [ ] `AWS_REGION` = `us-east-1` (or preferred region)
- [ ] Verify IAM user has SES & S3 permissions

#### Supabase (Storage)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - From Supabase project
- [ ] `SUPABASE_SERVICE_KEY` - Service role key (server-side only)

#### Affiliate Networks
- [ ] `CAREERJET_API_KEY` - From Careerjet affiliate program
- [ ] `JOOBLE_API_KEY` - From Jooble API dashboard

#### Security & Cron
- [ ] `CRON_SECRET` - Generated 32+ char secret (openssl rand -base64 32)

#### Application URLs
- [ ] `NEXT_PUBLIC_APP_NAME` = `JobBrowser`
- [ ] `NEXT_PUBLIC_API_BASE_URL` = `https://jobbrowser.app/api`
- [ ] `NEXT_PUBLIC_APP_BASE_URL` = `https://jobbrowser.app`

### Variable Storage Method
- [ ] All vars set in Vercel dashboard under Settings > Environment Variables
- [ ] Marked as "Production" environment
- [ ] Do NOT use .env.production file in repo (use template only)
- [ ] Verify each variable with test deployment

---

## Phase 4: Database Setup

### PostgreSQL Production Database
- [ ] Production database provisioned (managed service recommended)
- [ ] Database name: `jobbrowser_prod`
- [ ] SSL connections enforced
- [ ] Backup enabled (daily automatic backups)
- [ ] Backups retained for 30 days minimum
- [ ] Read-only replica created for analytics (optional)

### Database Migrations
- [ ] Migration 001_init_schema.sql applied
  - [ ] All 7 core tables created
  - [ ] Indexes created
  - [ ] Full-text search vector function deployed
  - [ ] Triggers configured
- [ ] Migration 002_add_affiliate_tracking.sql applied
  - [ ] affiliate_clicks table created
  - [ ] Affiliate tracking indexes created
- [ ] Verify schema with `\dt` and `\di` commands

### Test Database Connection
- [ ] Connect from local machine: ✓ or ✗
- [ ] Connection from Vercel test: ✓ or ✗
- [ ] Query test: `SELECT NOW();` returns current timestamp
- [ ] Verify pg_extension "uuid-ossp" loaded

### Database Seeding (UAT Data)
- [ ] Seed script run: `npm run seed`
- [ ] 20+ test jobs inserted with `bsa_UAT_t1_` prefix
- [ ] Test employer account created
- [ ] Test admin user created
  - Email: `admin@test.jobbrowser.app`
  - Role: `superadmin`
- [ ] Verify data queryable: `SELECT COUNT(*) FROM jobs WHERE title LIKE 'bsa_UAT_t1_%';`

### Production Database Policy
- [ ] Document cleanup procedure for UAT data
- [ ] Weekly data backup verification
- [ ] Query performance monitoring enabled
- [ ] Connection pooling configured (PgBouncer recommended)

---

## Phase 5: Domain & SSL Configuration

### Domain Setup
- [ ] Primary domain: `jobbrowser.app`
- [ ] DNS records configured:
  - [ ] Vercel nameservers updated in domain registrar
  - OR
  - [ ] CNAME records created pointing to Vercel edge
- [ ] Verify domain propagation with `nslookup jobbrowser.app`
- [ ] Domain showing as "Valid" in Vercel dashboard

### Regional Subdomains (Optional)
- [ ] Redirects configured in vercel.json:
  - [ ] `/ae` → `/?region=ae`
  - [ ] `/sa` → `/?region=sa`
  - [ ] `/in` → `/?region=in`
  - [ ] `/au` → `/?region=au`
  - [ ] `/us` → `/?region=us`

### SSL Certificate
- [ ] Auto SSL provisioned by Vercel (automatic)
- [ ] Certificate status: Active ✓
- [ ] HTTPS enforced (no unencrypted traffic)
- [ ] Verify cert with `curl -vI https://jobbrowser.app`

---

## Phase 6: Third-Party Services Verification

### Sentry Error Tracking
- [ ] Sentry project created: https://sentry.io/organizations/[org]/projects/
- [ ] DSN configured in environment variables
- [ ] Sentry integration active in package.json
- [ ] Test error reporting with `/api/test-error` endpoint
- [ ] Verify errors appear in Sentry dashboard within 1 minute

### SendGrid Email Service
- [ ] SendGrid account created and verified
- [ ] API key generated (Full Access)
- [ ] Sender email domain verified in SendGrid
- [ ] Test email sent successfully
- [ ] Email delivery confirmed in Sentry logs
- [ ] Configure email templates:
  - [ ] Job alert email
  - [ ] Application confirmation email
  - [ ] Password reset email
  - [ ] Welcome email for employers

### Google OAuth
- [ ] Google Cloud project created
- [ ] OAuth app configured
- [ ] Authorized redirect URI: `https://jobbrowser.app/api/auth/callback/google`
- [ ] Client ID & Secret stored as env vars
- [ ] Test OAuth flow in production

### GitHub OAuth
- [ ] GitHub OAuth app created
- [ ] Authorization callback URL: `https://jobbrowser.app/api/auth/callback/github`
- [ ] Client ID & Secret stored as env vars
- [ ] Test OAuth flow in production

### AWS Services
- [ ] AWS account configured
- [ ] IAM user created with:
  - [ ] SES (Simple Email Service) access
  - [ ] S3 (Simple Storage Service) access
  - [ ] CloudWatch logs access
- [ ] Access Key ID & Secret Key stored as env vars
- [ ] Test SES email sending

### Supabase Storage
- [ ] Supabase project created
- [ ] Storage bucket configured for resumes/uploads
- [ ] Row-level security (RLS) policies configured
- [ ] Service role key stored as env var (server-side only)
- [ ] Bucket configured with public access for downloads

### Affiliate Networks
- [ ] Careerjet affiliate account active
- [ ] API key obtained and stored
- [ ] Affiliate tracking parameters configured
- [ ] Jooble affiliate account active
- [ ] API key obtained and stored
- [ ] Test affiliate links generate proper UTM params

---

## Phase 7: Monitoring & Alerting Setup

### Vercel Monitoring
- [ ] Enable deployment notifications to Slack (optional)
- [ ] Set up alerts for:
  - [ ] Failed deployments
  - [ ] High error rates
  - [ ] Slow page load times
- [ ] Configure Edge Middleware logging

### Sentry Monitoring
- [ ] Configure alert rules:
  - [ ] Alert on first error in production
  - [ ] Alert on error rate > 5%
  - [ ] Alert on performance degradation
- [ ] Set notification channels:
  - [ ] Email alerts to: praise_john@outlook.com
  - [ ] (Optional) Slack integration
- [ ] Configure performance monitoring:
  - [ ] Core Web Vitals tracking
  - [ ] Database query performance
  - [ ] API response times

### Database Monitoring
- [ ] Enable PostgreSQL query logging
- [ ] Set up connection pool alerts
- [ ] Configure slow query alerts (> 1s)
- [ ] Set database backup monitoring
- [ ] Test backup restoration procedure

### Application Health Checks
- [ ] Create `/api/health` endpoint that checks:
  - [ ] Database connectivity
  - [ ] All third-party services
  - [ ] Required environment variables
- [ ] Endpoint returns: `{ status: "ok", timestamp, checks: {...} }`
- [ ] Set up Vercel cron to check health every 5 minutes

### Email Delivery Monitoring
- [ ] Track SendGrid webhook events:
  - [ ] Email delivered
  - [ ] Email opened
  - [ ] Email bounced
  - [ ] Email marked as spam
- [ ] Alert threshold: > 2% bounce rate
- [ ] Daily delivery report to praise_john@outlook.com

### Affiliate Tracking Verification
- [ ] Monitor affiliate_clicks table growth
- [ ] Set up daily report of:
  - [ ] Clicks per affiliate
  - [ ] Conversion rate
  - [ ] Revenue impact (if available)
- [ ] Verify UTM parameter accuracy

---

## Phase 8: Pre-Launch Testing

### Homepage & Navigation
- [ ] Homepage loads in < 2 seconds
- [ ] Regional filtering works:
  - [ ] UAE jobs display correctly
  - [ ] Saudi Arabia jobs display
  - [ ] India jobs display
  - [ ] Australia jobs display
  - [ ] USA jobs display
- [ ] Search functionality operational
- [ ] All navigation links working

### Job Search & Filtering
- [ ] Search by keyword returns results
- [ ] Filter by region works
- [ ] Filter by job type works
- [ ] Filter by salary range works
- [ ] Pagination works (load next page)
- [ ] No results shown for invalid search

### User Authentication
- [ ] Google OAuth login works
- [ ] GitHub OAuth login works
- [ ] NextAuth session persists across pages
- [ ] Logout functionality works
- [ ] Logout clears session properly

### Job Application Flow
- [ ] Can view job details
- [ ] Can apply with resume upload
- [ ] Application confirmation email received
- [ ] Application data saved to database
- [ ] Affiliate tracking triggered (UTM params recorded)

### Employer Features
- [ ] Employer registration works
- [ ] Employer email verification sent
- [ ] Employer can post job
- [ ] Job moderation system working
- [ ] Employer can view applications

### Admin Features
- [ ] Admin login works
- [ ] Can view flagged jobs
- [ ] Can approve/reject jobs
- [ ] Can view analytics dashboard
- [ ] Can export data

### Performance Testing
- [ ] Lighthouse score > 90 (Performance)
- [ ] Lighthouse score > 90 (SEO)
- [ ] Homepage FCP < 1.5s
- [ ] Search results LCP < 2.5s
- [ ] No CLS (Cumulative Layout Shift)

### Security Testing
- [ ] No sensitive data in HTML comments
- [ ] No API keys exposed in network requests
- [ ] CSP headers present
- [ ] XSS protection active
- [ ] CORS properly configured
- [ ] SQL injection protection active

### Mobile Testing
- [ ] Responsive design on 375px width
- [ ] Touch interactions work (no hover-only)
- [ ] Viewport meta tag present
- [ ] Mobile performance acceptable

### Error Handling
- [ ] 404 error page displays
- [ ] 500 error page displays
- [ ] Network error handled gracefully
- [ ] Database connection error caught
- [ ] Errors appear in Sentry

---

## Phase 9: Post-Launch Monitoring (First 24 Hours)

### Real-Time Monitoring
- [ ] Check Sentry dashboard for errors (every 30 min)
- [ ] Monitor Vercel deployment health
- [ ] Check SendGrid delivery stats
- [ ] Verify database performance
- [ ] Monitor error rates (target: < 0.1%)

### User Testing
- [ ] Can users register successfully?
- [ ] Can users login with OAuth?
- [ ] Can users search for jobs?
- [ ] Can users apply to jobs?
- [ ] Are confirmation emails arriving?

### Performance Monitoring
- [ ] Page load times stable
- [ ] No spike in error rates
- [ ] Database queries performing well
- [ ] API response times acceptable

### Incident Response Plan
- [ ] Rollback procedure documented
- [ ] Emergency contacts identified
- [ ] Escalation path defined
- [ ] On-call rotation established

---

## Phase 10: Documentation & Handoff

### Deployment Documentation
- [ ] Deployment process documented
- [ ] Environment variable guide created
- [ ] Database backup procedures documented
- [ ] Rollback procedures documented
- [ ] Emergency contact list created

### Monitoring & Alerting Docs
- [ ] Alert configuration documented
- [ ] Escalation procedures documented
- [ ] Troubleshooting guide created
- [ ] Common issues & solutions listed

### Team Knowledge Transfer
- [ ] Architecture overview shared
- [ ] Database schema documented
- [ ] API endpoints documented
- [ ] Configuration procedures explained
- [ ] Access credentials securely shared

### Post-Launch Review
- [ ] Performance metrics reviewed
- [ ] User feedback collected
- [ ] Issues logged and prioritized
- [ ] Lessons learned documented

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | [Your Name] | | |
| QA Lead | | | |
| Product Owner | | | |
| DevOps/Infra | | | |

---

## Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Primary Dev | | | praise_john@outlook.com |
| Secondary Dev | | | |
| DevOps | | | |
| Support | | | |

---

## Critical Hotline

**Production Issues Hotline:** [To be defined]  
**Escalation Channel:** Slack #production-incidents  
**Status Page:** [To be defined]  

---

## Rollback Plan

If critical issues arise post-launch:

1. **Immediate:** Revert deployment in Vercel dashboard (previous stable version)
2. **Database:** No rollback needed (only writes to new tables)
3. **DNS:** If needed, update domain to previous infrastructure
4. **Communication:** Post update to status page and notify stakeholders
5. **Post-Mortem:** Schedule incident review within 24 hours

---

## Notes

```
[Space for deployment notes, issues encountered, and lessons learned]
```
