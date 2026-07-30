# Environment Variables Quick Reference

**Location:** Vercel Dashboard > Settings > Environment Variables  
**Mark All As:** Production  
**Total Variables:** 25

---

## Critical Variables (Set Before Deployment)

### 1. Node Environment
```
NODE_ENV=production
```
**Purpose:** Enables production mode, disables debug output  
**Default:** N/A  
**Required:** YES

### 2. NextAuth Configuration
```
NEXTAUTH_SECRET=[GENERATE: openssl rand -base64 32]
NEXTAUTH_URL=https://jobbrowser.app
```
**Purpose:** OAuth session management  
**Required:** YES (NEXTAUTH_SECRET must be > 32 chars)  
**Generate:** Run `openssl rand -base64 32` to create a new secret

### 3. Database Connection
```
DATABASE_URL=postgresql://jobbrowser_prod_user:PASSWORD@HOST:5432/jobbrowser_prod?sslmode=require
```
**Purpose:** PostgreSQL connection string  
**Required:** YES  
**Format:** `postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require`  
**Verification:** Test with `psql -h HOST -U user -d jobbrowser_prod -c "SELECT NOW();"`

---

## OAuth Providers

### Google OAuth
```
GOOGLE_CLIENT_ID=[from Google Cloud Console]
GOOGLE_CLIENT_SECRET=[from Google Cloud Console]
```
**Setup:** https://console.cloud.google.com/  
**Redirect URI:** `https://jobbrowser.app/api/auth/callback/google`  
**Required:** YES (if enabling Google login)

### GitHub OAuth
```
GITHUB_CLIENT_ID=[from GitHub OAuth settings]
GITHUB_CLIENT_SECRET=[from GitHub OAuth settings]
```
**Setup:** https://github.com/settings/developers  
**Redirect URI:** `https://jobbrowser.app/api/auth/callback/github`  
**Required:** YES (if enabling GitHub login)

---

## Email Service (SendGrid)

```
SENDGRID_API_KEY=[Full Access API Key]
SENDGRID_FROM_EMAIL=noreply@jobbrowser.app
```
**Setup:** https://app.sendgrid.com/settings/api_keys  
**Type:** Full Access API Key (not restricted)  
**Sender Email:** Must be verified in SendGrid  
**Required:** YES (for email alerts and notifications)  
**Verification:** Test endpoint: `POST /api/email/test`

---

## Error Monitoring (Sentry)

```
SENTRY_DSN=[from Sentry project settings]
NEXT_PUBLIC_SENTRY_DSN=[same as SENTRY_DSN]
SENTRY_ORG=jobbrowser
SENTRY_PROJECT=jobbrowser-production
SENTRY_AUTH_TOKEN=[Internal token for event filtering]
```
**Setup:** https://sentry.io/  
**SENTRY_DSN:** Get from Sentry > Settings > Client Keys (DSN)  
**Note:** NEXT_PUBLIC prefix means it's visible in client code (safe for DSN)  
**Required:** YES (for error tracking)  
**Verification:** Trigger error at `/api/test-error`, should appear in Sentry within 1 minute

---

## AWS Services

```
AWS_ACCESS_KEY_ID=[IAM User Access Key ID]
AWS_SECRET_ACCESS_KEY=[IAM User Secret Access Key]
AWS_REGION=us-east-1
```
**Setup:** https://console.aws.amazon.com/iam/  
**Permissions Required:**
- SES (Simple Email Service) - for email sending
- S3 (Simple Storage Service) - for file uploads
- CloudWatch Logs - for log aggregation

**Credential Type:** IAM User (not root account)  
**Required:** YES (for email queue and file storage)  
**Security:** Never use root AWS credentials

---

## Supabase (Storage)

```
NEXT_PUBLIC_SUPABASE_URL=[from Supabase project settings]
SUPABASE_SERVICE_KEY=[Service role key - server-side only]
```
**Setup:** https://app.supabase.com/  
**Purpose:** File storage for resumes, cover letters, etc.  
**NEXT_PUBLIC_SUPABASE_URL:** Public URL (safe to expose)  
**SUPABASE_SERVICE_KEY:** Keep private, server-side only  
**Required:** YES (for document uploads)  
**Verification:** Test upload endpoint: `POST /api/upload/resume`

---

## Affiliate Networks

```
CAREERJET_API_KEY=[from Careerjet affiliate program]
JOOBLE_API_KEY=[from Jooble API dashboard]
```
**Careerjet:**
- Program: https://www.careerjet.com/affiliates
- Type: Affiliate API key for tracking
- Required: YES (for affiliate link tracking)

**Jooble:**
- Program: https://jooble.org/api
- Type: API key for job search integration
- Required: YES (for affiliate link tracking)

---

## Cron Jobs & Security

```
CRON_SECRET=[GENERATE: openssl rand -base64 32]
```
**Purpose:** Secure scheduled job execution  
**Generate:** Run `openssl rand -base64 32` to create a new secret  
**Used By:** `/api/cron/send-alerts`, `/api/cron/expire-jobs`  
**Required:** YES (for scheduled jobs)  
**Verification:** Cron jobs must include `X-Vercel-Cron-Secret` header

---

## Application URLs

```
NEXT_PUBLIC_APP_NAME=JobBrowser
NEXT_PUBLIC_API_BASE_URL=https://jobbrowser.app/api
NEXT_PUBLIC_APP_BASE_URL=https://jobbrowser.app
```
**Purpose:** Frontend-accessible configuration URLs  
**NEXT_PUBLIC prefix:** These are exposed to browser (safe)  
**Used For:**
- API endpoint configuration
- Email links and redirects
- App name in UI and documents

---

## Variable Checklist for Setup

### Before Vercel Deployment
- [ ] Generate NEXTAUTH_SECRET (openssl rand -base64 32)
- [ ] Generate CRON_SECRET (openssl rand -base64 32)
- [ ] Provision PostgreSQL database, get DATABASE_URL
- [ ] Create Google OAuth app, get credentials
- [ ] Create GitHub OAuth app, get credentials
- [ ] Create SendGrid account, get API key
- [ ] Verify sender email domain in SendGrid
- [ ] Create Sentry project, get DSN
- [ ] Create AWS IAM user, get access keys
- [ ] Create Supabase project, get keys
- [ ] Register with Careerjet affiliate program, get API key
- [ ] Register with Jooble affiliate program, get API key

### Vercel Dashboard Setup Steps

1. **Go to Project Settings**
   ```
   https://vercel.com/dashboard/[project]/settings/environment-variables
   ```

2. **Add Each Variable**
   - Click "Add New"
   - Name: [Variable name]
   - Value: [Variable value]
   - Environment: Select "Production"
   - Click "Save"

3. **Verify All 25 Variables**
   - [ ] NODE_ENV
   - [ ] NEXTAUTH_SECRET
   - [ ] NEXTAUTH_URL
   - [ ] DATABASE_URL
   - [ ] GOOGLE_CLIENT_ID
   - [ ] GOOGLE_CLIENT_SECRET
   - [ ] GITHUB_CLIENT_ID
   - [ ] GITHUB_CLIENT_SECRET
   - [ ] SENDGRID_API_KEY
   - [ ] SENDGRID_FROM_EMAIL
   - [ ] SENTRY_DSN
   - [ ] NEXT_PUBLIC_SENTRY_DSN
   - [ ] SENTRY_ORG
   - [ ] SENTRY_PROJECT
   - [ ] SENTRY_AUTH_TOKEN
   - [ ] AWS_ACCESS_KEY_ID
   - [ ] AWS_SECRET_ACCESS_KEY
   - [ ] AWS_REGION
   - [ ] NEXT_PUBLIC_SUPABASE_URL
   - [ ] SUPABASE_SERVICE_KEY
   - [ ] CAREERJET_API_KEY
   - [ ] JOOBLE_API_KEY
   - [ ] CRON_SECRET
   - [ ] NEXT_PUBLIC_APP_NAME
   - [ ] NEXT_PUBLIC_API_BASE_URL
   - [ ] NEXT_PUBLIC_APP_BASE_URL

4. **Redeploy**
   - Make a commit to main branch
   - Or manually trigger deployment
   - Vercel will use new environment variables

---

## Variable Validation Commands

```bash
# Test database connection
psql -h $(echo $DATABASE_URL | sed 's/.*@//;s/:.*//') \
  -U $(echo $DATABASE_URL | sed 's/.*\///;s/:.*//') \
  -d jobbrowser_prod \
  -c "SELECT NOW();"

# Test Sentry
curl -X POST https://[key]@[domain].ingest.sentry.io/[id] \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'

# Test SendGrid
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Test AWS credentials
aws sts get-caller-identity
```

---

## Common Issues

### "NEXTAUTH_SECRET not set"
**Solution:** Make sure NEXTAUTH_SECRET is set in Vercel environment variables (not just locally)

### "Database connection refused"
**Solution:** Verify DATABASE_URL format and check that database server is accessible from Vercel IPs

### "OAuth redirect mismatch"
**Solution:** Ensure OAuth redirect URIs match exactly (https://jobbrowser.app/api/auth/callback/[provider])

### "SendGrid 401 Unauthorized"
**Solution:** Verify API key is correct and has "Full Access" permissions

### "Sentry DSN invalid"
**Solution:** Use complete DSN from Sentry dashboard, including https:// prefix

---

## Security Best Practices

1. **Never Commit Secrets**
   - Use .env.production.template only
   - Actual values go in Vercel dashboard

2. **Use Strong Values**
   - NEXTAUTH_SECRET: min 32 characters
   - CRON_SECRET: min 32 characters
   - Use `openssl rand -base64 32` to generate

3. **Rotate Secrets Regularly**
   - Recommend quarterly rotation
   - Update procedure: Change in Vercel > Redeploy > Monitor

4. **Least Privilege**
   - AWS IAM user: only SES, S3, CloudWatch permissions
   - Database user: only CONNECT and CREATE on schema
   - SendGrid API key: Full Access (no way to restrict)

5. **Audit Access**
   - Review Vercel environment variables monthly
   - Check AWS IAM key usage
   - Monitor Sentry for suspicious activity

---

## Post-Deployment Verification

After setting all variables and deploying:

```bash
# Check app loads
curl -I https://jobbrowser.app

# Check health endpoint
curl https://jobbrowser.app/api/health

# Check database connectivity
# (Should see in logs if DB works)

# Check Sentry integration
# (Errors should appear in Sentry dashboard)

# Check email delivery
# (Send test email and verify in SendGrid dashboard)
```

---

**Total Variables:** 25  
**Critical (must have):** 8  
**Important (should have):** 15  
**Optional:** 2  

**Estimated Setup Time:** 60-90 minutes  
**Last Updated:** 2026-07-30
