# jobbrowser.app - Monitoring & Alerting Setup Guide

**Last Updated:** 2026-07-30  
**Status:** Production Deployment Phase  

---

## Table of Contents

1. [Sentry Error Tracking](#sentry-error-tracking)
2. [Vercel Deployment Monitoring](#vercel-deployment-monitoring)
3. [Database Connection Monitoring](#database-connection-monitoring)
4. [Email Delivery Monitoring](#email-delivery-monitoring)
5. [Affiliate Tracking Verification](#affiliate-tracking-verification)
6. [Alert Channels & Escalation](#alert-channels--escalation)
7. [Dashboard Setup](#dashboard-setup)
8. [Health Check Endpoint](#health-check-endpoint)
9. [Incident Response](#incident-response)

---

## Sentry Error Tracking

### Setup Instructions

1. **Create Sentry Project**
   ```
   Go to: https://sentry.io/organizations/[your-org]/projects/
   Click "Create Project"
   Select Platform: Next.js
   Project Name: jobbrowser-production
   ```

2. **Configure Vercel Integration**
   ```
   Dashboard > Settings > Integrations > Vercel
   Connect Vercel account
   Link to jobbrowser-app project
   ```

3. **Set Environment Variables** (in Vercel Dashboard)
   ```
   SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/123456
   NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/123456
   SENTRY_ORG=jobbrowser
   SENTRY_PROJECT=jobbrowser-production
   SENTRY_AUTH_TOKEN=sntrys_your-auth-token-here
   ```

### Alert Rules Configuration

#### Rule 1: First Error in Production
- **Trigger:** Any new error type appears
- **Actions:** Email alert to praise_john@outlook.com
- **Priority:** HIGH
- **Setup Path:** Sentry > Alerts > Create Alert Rule > Error Rate
  - Error count >= 1
  - Environment = production
  - Send to email

#### Rule 2: High Error Rate
- **Trigger:** Error rate > 5% in last 5 minutes
- **Actions:** Email + Slack (if configured)
- **Priority:** CRITICAL
- **Setup Path:** Sentry > Alerts > Create Alert Rule
  - Error rate > 5%
  - Environment = production
  - Timeframe = 5 minutes

#### Rule 3: Performance Degradation
- **Trigger:** Response time > 3 seconds (p95)
- **Actions:** Email alert
- **Priority:** MEDIUM
- **Setup Path:** Sentry > Alerts > Create Alert Rule > Performance
  - p95 response time > 3000ms
  - Environment = production

#### Rule 4: Database Connection Errors
- **Trigger:** ECONNREFUSED or timeout errors spike
- **Actions:** Email + PagerDuty (if configured)
- **Priority:** CRITICAL
- **Setup Path:** Sentry > Alerts > Create Alert Rule
  - Error message contains: "ECONNREFUSED" OR "timeout"
  - Error count >= 5 in 5 minutes
  - Environment = production

#### Rule 5: OAuth/Auth Failures
- **Trigger:** Authentication errors > 10 per minute
- **Actions:** Email alert
- **Priority:** HIGH
- **Setup Path:** Sentry > Alerts > Create Alert Rule
  - Error message contains: "auth" OR "oauth" OR "session"
  - Error rate > 10/min
  - Environment = production

### Monitoring Dashboard

**Access:** https://sentry.io/organizations/[org]/issues/?environment=production

**Key Metrics to Monitor:**
- Error count (last 24 hours)
- Affected users
- Error frequency by type
- Performance metrics
- Release versions

**Daily Review Checklist:**
- [ ] Check for new error types
- [ ] Review error trends
- [ ] Verify alert firing properly
- [ ] Check performance metrics

---

## Vercel Deployment Monitoring

### Setup Instructions

1. **Enable Deployment Notifications**
   - Go to Vercel Dashboard > Settings > Notifications
   - Enable "Deployment Events"
   - Select notification channel (Email recommended)

2. **Configure Production Alerts**
   - Dashboard > Project Settings > Deployments
   - Enable "Deployment Protection"
   - Require approval for production

3. **Set Up GitHub Integration**
   - Vercel automatically comments on PRs
   - Link commits to deployments
   - Track deployment status

### Monitoring Checklist

**Pre-Deployment:**
- [ ] Tests passing in CI/CD
- [ ] Build preview successful
- [ ] No critical Lighthouse issues
- [ ] Security scan passed

**Post-Deployment (First Hour):**
- [ ] Deployment completes successfully
- [ ] No new errors in Sentry
- [ ] Performance metrics stable
- [ ] Database connection healthy

**Daily Monitoring:**
- [ ] Check deployment success rate
- [ ] Review failed deployments (if any)
- [ ] Verify no stuck deployments
- [ ] Check build time trends

**Weekly Review:**
- [ ] Deployment frequency
- [ ] Rollback frequency (should be < 1%)
- [ ] Time to deploy
- [ ] Performance impact of updates

---

## Database Connection Monitoring

### PostgreSQL Connection Monitoring

#### 1. Connection Pool Health

**Check Current Connections:**
```sql
SELECT 
  datname, 
  count(*) as connection_count,
  max_conn,
  round(count(*)*100.0 / max_conn, 2) as usage_pct
FROM pg_stat_activity, 
     (SELECT setting::int as max_conn FROM pg_settings 
      WHERE name = 'max_connections') 
GROUP BY datname, max_conn;
```

**Alert Thresholds:**
- Yellow Alert: > 75% connection pool used
- Red Alert: > 90% connection pool used

#### 2. Slow Query Monitoring

**Enable Slow Query Logging:**
```sql
-- PostgreSQL Configuration
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second
SELECT pg_reload_conf();
```

**Monitor Slow Queries:**
```sql
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Alert Rules:**
- Alert on any query > 5 seconds
- Alert if slow query count > 10 per hour
- Daily report of top 5 slow queries

#### 3. Database Size Monitoring

**Check Database Size:**
```sql
SELECT 
  pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;
```

**Alert Thresholds:**
- Monitor growth rate
- Alert when database grows > 20% month-over-month
- Plan scaling when > 80% of allocated storage

#### 4. Connection Monitoring Script

**Setup via Cron (runs every 5 minutes):**
```bash
*/5 * * * * /usr/local/bin/check_db_health.sh >> /var/log/db_health.log 2>&1
```

**Script: check_db_health.sh**
```bash
#!/bin/bash
DB_USER="prod_user"
DB_HOST="prod-database.example.com"
DB_NAME="jobbrowser_prod"

# Check connection count
CONN_COUNT=$(psql -h $DB_HOST -U $DB_USER -d $DB_NAME -tc \
  "SELECT COUNT(*) FROM pg_stat_activity;")

# Check if > 90 connections (assuming max_connections=100)
if [ $CONN_COUNT -gt 90 ]; then
  echo "CRITICAL: High connection count: $CONN_COUNT"
  # Send alert to Sentry or email
fi

# Check if database is responding
if ! psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT NOW();" > /dev/null 2>&1; then
  echo "CRITICAL: Database not responding"
  # Send alert
fi
```

---

## Email Delivery Monitoring

### SendGrid Integration

#### 1. Webhook Configuration

**Setup SendGrid Webhooks:**
1. Go to: SendGrid > Settings > Mail Send > Event Webhook
2. Enable these events:
   - [ ] Delivered
   - [ ] Bounce
   - [ ] Dropped
   - [ ] Spam Report
   - [ ] Unsubscribe
   - [ ] Click
   - [ ] Open

3. Webhook URL: `https://jobbrowser.app/api/webhooks/sendgrid`

#### 2. Email Delivery Metrics

**Daily Report Script:**
```sql
-- Query email delivery metrics
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_emails,
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced,
  SUM(CASE WHEN status = 'spam' THEN 1 ELSE 0 END) as spam_reports,
  ROUND(
    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)::numeric / 
    COUNT(*) * 100, 2
  ) as delivery_rate_pct
FROM email_logs
WHERE created_at >= NOW() - INTERVAL '1 day'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

#### 3. Alert Rules

**Alert 1: High Bounce Rate**
- Condition: Bounce rate > 2%
- Action: Email alert to praise_john@outlook.com
- Frequency: Daily if threshold exceeded

**Alert 2: High Spam Report Rate**
- Condition: Spam reports > 0.1%
- Action: Email alert + review sender domain
- Frequency: Immediate

**Alert 3: Delivery Failure**
- Condition: No successful deliveries for 30 minutes
- Action: Critical alert + escalate
- Frequency: Immediate

### Email Testing

**Send Test Email:**
```bash
# Test endpoint
curl -X POST https://jobbrowser.app/api/email/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -d '{
    "to": "praise_john@outlook.com",
    "template": "test"
  }'
```

---

## Affiliate Tracking Verification

### Affiliate Clicks Monitoring

#### 1. Daily Tracking Report

**Query Affiliate Performance:**
```sql
SELECT 
  DATE(created_at) as date,
  affiliate,
  utm_campaign,
  COUNT(*) as clicks,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT job_id) as unique_jobs
FROM affiliate_clicks
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), affiliate, utm_campaign
ORDER BY date DESC, clicks DESC;
```

#### 2. Alert Rules

**Alert 1: Zero Affiliate Clicks**
- Condition: No clicks in 1 hour (during business hours)
- Action: Email alert
- Schedule: 9 AM - 6 PM weekdays

**Alert 2: Tracking Accuracy**
- Condition: Missing UTM parameters on > 5% of clicks
- Action: Email alert + investigate
- Frequency: Daily at 8 AM

**Alert 3: Affiliate Down**
- Condition: One affiliate gets 0 clicks for 2+ hours
- Action: Email alert + check affiliate API
- Frequency: Immediate

#### 3. Weekly Affiliate Report

**Automated Email Report (Every Monday 9 AM):**

```sql
SELECT 
  affiliate,
  COUNT(*) as total_clicks,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT job_id) as unique_jobs,
  STRING_AGG(DISTINCT utm_campaign, ', ') as campaigns,
  DATE_TRUNC('week', created_at) as week
FROM affiliate_clicks
WHERE created_at >= NOW() - INTERVAL '1 week'
GROUP BY affiliate
ORDER BY total_clicks DESC;
```

---

## Alert Channels & Escalation

### Primary Alert Channel: Email

**Primary Recipient:** praise_john@outlook.com

**Email Alert Configuration:**

| Severity | Response Time | Escalation |
|----------|--------------|------------|
| CRITICAL | 5 minutes | Page on-call engineer via phone |
| HIGH | 30 minutes | Email escalation to backup |
| MEDIUM | 2 hours | Daily summary email |
| LOW | Daily summary | Weekly digest |

### Secondary Alert Channel: Slack (Optional)

**Setup Slack Integration:**
1. Create Slack bot token
2. Add to #production-alerts channel
3. Configure Sentry > Integrations > Slack

**Channel: #production-alerts**
- Real-time error notifications
- Deployment status updates
- Database health alerts

### Escalation Contacts

| Role | Name | Email | Phone |
|------|------|-------|-------|
| Primary DevOps | [To be assigned] | | |
| Secondary DevOps | [To be assigned] | | |
| Engineering Lead | [To be assigned] | | |
| CTO | [To be assigned] | | |

### Escalation Workflow

```
Critical Alert Triggered
    ↓
[T+5 min] Email sent to primary contact
    ↓
[T+10 min] If no acknowledgment, email to secondary
    ↓
[T+15 min] If critical, page on-call (phone call)
    ↓
[T+20 min] Escalate to CTO
    ↓
[T+30 min] Initiate incident response
```

---

## Dashboard Setup

### Create Production Monitoring Dashboard

**Dashboard URL:** [To be configured]

**Key Panels:**

1. **System Health (Top Row)**
   - Deployment Status
   - Database Connection Status
   - Email Service Status
   - Affiliate APIs Status

2. **Error Monitoring (Second Row)**
   - Error Rate (Last 24h)
   - Top 5 Error Types
   - Error Rate by Service
   - Error Trend Chart

3. **Performance (Third Row)**
   - Page Load Time (p95)
   - API Response Time (p95)
   - Database Query Time (p95)
   - Core Web Vitals

4. **Application (Fourth Row)**
   - User Registrations (Last 24h)
   - Job Applications (Last 24h)
   - Search Queries (Last 24h)
   - Email Deliveries (Last 24h)

5. **Infrastructure (Fifth Row)**
   - Database CPU Usage
   - Database Memory Usage
   - Database Connections
   - Storage Usage

### Grafana Setup (Optional Advanced)

```bash
# Add Grafana data sources
- Sentry (for error metrics)
- PostgreSQL (for database metrics)
- Vercel API (for deployment metrics)

# Create dashboards
- Production Overview
- Database Performance
- Email Delivery
- Affiliate Tracking
- User Activity
```

---

## Health Check Endpoint

### Implement `/api/health` Endpoint

**Location:** `app/api/health/route.ts`

```typescript
import { query } from '@/lib/db';

interface HealthCheck {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  checks: {
    database: { status: string; responseTime: number };
    sentry: { status: string };
    sendgrid: { status: string };
    supabase: { status: string };
    environment: { status: string };
  };
  uptime: number;
}

export async function GET(request: Request): Promise<Response> {
  const startTime = Date.now();
  const checks = {
    database: { status: 'error', responseTime: 0 },
    sentry: { status: 'ok' },
    sendgrid: { status: 'ok' },
    supabase: { status: 'ok' },
    environment: { status: 'ok' },
  };

  // Check database
  try {
    const dbStart = Date.now();
    await query('SELECT NOW()');
    checks.database = {
      status: 'ok',
      responseTime: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database.status = 'error';
  }

  // Check Sentry configuration
  if (!process.env.SENTRY_DSN) {
    checks.sentry.status = 'error';
  }

  // Check SendGrid configuration
  if (!process.env.SENDGRID_API_KEY) {
    checks.sendgrid.status = 'error';
  }

  // Check environment variables
  const requiredEnvs = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];
  if (!requiredEnvs.every((env) => process.env[env])) {
    checks.environment.status = 'error';
  }

  const overallStatus = Object.values(checks).some((c) => c.status === 'error')
    ? 'error'
    : 'ok';

  const response: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };

  return Response.json(response, {
    status: overallStatus === 'ok' ? 200 : 503,
  });
}
```

### Monitor Health Endpoint

**Setup Vercel Cron:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "*/5 * * * *"  // Every 5 minutes
    }
  ]
}
```

**Alert Configuration:**
- Response time > 2 seconds: Alert
- Status != 'ok': Critical alert
- Endpoint unavailable: Critical alert

---

## Incident Response

### Incident Response Procedure

**Step 1: Alert Received (T+0)**
- Alert triggers in Sentry/Email
- Acknowledge receipt within 5 minutes
- Check status page

**Step 2: Initial Assessment (T+5)**
- Check health endpoint
- Review recent deployments
- Check database status
- Review error logs

**Step 3: Triage (T+15)**
- Determine severity
- Identify affected services
- Estimate user impact
- Create incident ticket

**Step 4: Mitigation (T+30)**
- Apply hotfix if available
- Rollback if necessary
- Scale resources if needed
- Communicate with team

**Step 5: Resolution (T+60)**
- Implement permanent fix
- Verify resolution
- Monitor metrics
- Document incident

**Step 6: Post-Incident (T+1 day)**
- Conduct post-mortem
- Document lessons learned
- Update runbooks
- Track follow-ups

### Runbooks

#### Runbook: High Error Rate

1. **Identify Error Type**
   ```
   Go to Sentry > Issues > [Top Issue]
   Note error message and stack trace
   ```

2. **Check Deployment**
   ```
   Vercel Dashboard > Deployments
   Review last 3 deployments
   Check if new deployment introduced error
   ```

3. **Database Health**
   ```
   Check database connection count
   Check for long-running queries
   Review slow query logs
   ```

4. **Escalate if Needed**
   ```
   If error rate > 10% for 5+ minutes
   Contact on-call engineer
   Consider rollback
   ```

#### Runbook: Database Connection Failure

1. **Verify Connection String**
   ```
   Check DATABASE_URL in Vercel dashboard
   Verify host/port/database name
   Test with psql from terminal
   ```

2. **Check Database Status**
   ```
   Contact database provider
   Check service health dashboard
   Verify no maintenance windows
   ```

3. **Connection Pool**
   ```
   Check current connections
   Kill idle connections if necessary
   Increase pool size if needed
   ```

4. **Implement Workaround**
   ```
   If persistent:
   - Route to read replica if available
   - Enable query caching
   - Scale down non-critical features
   ```

---

## Checklist: First 24 Hours Post-Launch

- [ ] Monitor Sentry dashboard every 30 minutes
- [ ] Check Vercel deployment logs
- [ ] Verify database connection health
- [ ] Monitor email delivery rate
- [ ] Test OAuth login flows
- [ ] Verify affiliate tracking
- [ ] Check search functionality
- [ ] Monitor error rate (target: < 0.1%)
- [ ] Collect user feedback
- [ ] Review performance metrics
- [ ] Document any incidents
- [ ] Prepare post-launch report

---

## Quick Reference: Alert Thresholds

| Metric | Yellow | Red | Check Frequency |
|--------|--------|-----|-----------------|
| Error Rate | > 1% | > 5% | Real-time |
| Database Connections | > 75% | > 90% | Every 5 min |
| API Response Time (p95) | > 2s | > 5s | Every 1 min |
| Email Bounce Rate | > 1% | > 2% | Daily |
| Affiliate Clicks/Hour | < 10 | 0 | Every hour |
| Deployment Success | < 95% | < 90% | Weekly |
| Database Growth | > 20% MoM | > 50% MoM | Weekly |

---

**Last Updated:** 2026-07-30  
**Next Review:** 2026-08-06
