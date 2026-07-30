# jobbrowser.app - Database Deployment & Backup Guide

**Status:** Production Ready  
**Database:** PostgreSQL 14+  
**Last Updated:** 2026-07-30  

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Production Database Setup](#production-database-setup)
3. [Migration Process](#migration-process)
4. [Connection Configuration](#connection-configuration)
5. [Backup & Recovery](#backup--recovery)
6. [Performance Tuning](#performance-tuning)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Disaster Recovery](#disaster-recovery)

---

## Pre-Deployment Checklist

### Database Planning
- [ ] Choose PostgreSQL managed service:
  - Option 1: AWS RDS PostgreSQL
  - Option 2: Google Cloud SQL
  - Option 3: DigitalOcean Managed Databases
  - Option 4: Self-hosted (not recommended for production)

- [ ] Database specifications:
  - PostgreSQL version: 14.x or later
  - Storage: 100GB (for MVP, scale as needed)
  - Memory: 2GB RAM minimum
  - Backup retention: 30 days
  - Multi-AZ enabled (high availability)

- [ ] Network configuration:
  - [ ] VPC/Private network setup
  - [ ] SSL/TLS enforced for all connections
  - [ ] Firewall rules configured
  - [ ] IP allowlist includes Vercel IPs

### User & Credentials
- [ ] Create production database user (not superuser)
  - Username: `jobbrowser_prod_user`
  - Permissions: CREATE, CONNECT only
  - No superuser privileges

- [ ] Create read-only user for analytics (optional)
  - Username: `jobbrowser_read_user`
  - Permissions: SELECT only
  - Purpose: Dashboards and reporting

- [ ] Create replication user (for backups)
  - Username: `replication_user`
  - Permissions: REPLICATION
  - Purpose: Automated backups

---

## Production Database Setup

### Step 1: Create Database

**AWS RDS Example:**
```bash
# Using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier jobbrowser-prod \
  --db-instance-class db.t3.small \
  --engine postgres \
  --engine-version 14.7 \
  --master-username postgres \
  --master-user-password <STRONG_PASSWORD> \
  --allocated-storage 100 \
  --storage-type gp2 \
  --backup-retention-period 30 \
  --multi-az \
  --storage-encrypted \
  --enable-iam-database-authentication
```

**Connection Details After Creation:**
```
Host: jobbrowser-prod.xxxxx.rds.amazonaws.com
Port: 5432
Database: jobbrowser_prod (create after connection)
Admin User: postgres
```

### Step 2: Initial Connection

```bash
# Connect as admin
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U postgres -p 5432

# Create application database
CREATE DATABASE jobbrowser_prod 
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8';

# Create application user
CREATE USER jobbrowser_prod_user WITH PASSWORD '<STRONG_PASSWORD>';

# Grant permissions
GRANT CONNECT ON DATABASE jobbrowser_prod TO jobbrowser_prod_user;
GRANT USAGE ON SCHEMA public TO jobbrowser_prod_user;
GRANT CREATE ON SCHEMA public TO jobbrowser_prod_user;

-- Connect to the new database
\c jobbrowser_prod

-- Grant default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO jobbrowser_prod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO jobbrowser_prod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO jobbrowser_prod_user;
```

### Step 3: Verify Connection

```bash
# Test connection as application user
PGPASSWORD='<PASSWORD>' psql \
  -h <HOST> \
  -U jobbrowser_prod_user \
  -d jobbrowser_prod \
  -p 5432

# Should return current timestamp
SELECT NOW();
```

---

## Migration Process

### Step 1: Run Migrations in Order

**Migration 001 - Initial Schema (Core Tables)**

```bash
# Download migration file
# File location: db/migrations/001_init_schema.sql

# Apply migration
PGPASSWORD='<PASSWORD>' psql \
  -h <HOST> \
  -U jobbrowser_prod_user \
  -d jobbrowser_prod \
  -p 5432 \
  -f db/migrations/001_init_schema.sql

# Verify migration
psql -h <HOST> -U jobbrowser_prod_user -d jobbrowser_prod -c "\dt"

# Expected tables:
# - companies
# - jobs
# - job_alerts
# - moderation_flags
# - admin_users
# - employer_sessions
# - applications
```

**Verify Schema:**
```sql
-- Check all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected output:
-- admin_users
-- applications
-- companies
-- employer_sessions
-- job_alerts
-- jobs
-- moderation_flags

-- Check indexes
SELECT 
  schemaname, 
  tablename, 
  indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verify full-text search function
SELECT proname 
FROM pg_proc 
WHERE proname = 'jobs_search_vector_update';
```

**Migration 002 - Affiliate Tracking**

```bash
# Apply affiliate tracking migration
PGPASSWORD='<PASSWORD>' psql \
  -h <HOST> \
  -U jobbrowser_prod_user \
  -d jobbrowser_prod \
  -p 5432 \
  -f db/migrations/002_add_affiliate_tracking.sql

# Verify affiliate_clicks table
psql -h <HOST> -U jobbrowser_prod_user -d jobbrowser_prod -c "\dt affiliate_clicks"
```

### Step 2: Seed Test Data

```bash
# Seed production test data (UAT jobs)
npm run seed:production -- --confirm
```

**Expected Output:**
```
🚀 Starting Production Database Seeding...
Environment: production
Database: Connected

=== Seeding Test Companies ===
✓ Company: Tech Corp UAT (UAE)
✓ Company: Global Solutions UAT (UAE)
✓ Company: Saudi Tech Hub UAT (Saudi)
✓ Company: India Tech Leaders UAT (India)
✓ Company: Aussie FinTech UAT (Australia)
✓ Company: Tech Giants USA UAT (USA)
✓ Seeded 6 companies

=== Seeding Test Jobs ===
✓ [1/6] bsa_UAT_t1_Senior Software Engineer at Tech Corp UAT
✓ [2/6] bsa_UAT_t1_Product Manager at Global Solutions UAT
...
✓ Seeded 6/6 jobs

=== Seeding Admin Users ===
✓ Admin: admin@test.jobbrowser.app (superadmin)
✓ Admin: moderator@test.jobbrowser.app (moderator)
✓ Seeded 2 admin users

=== Verification ===
Companies: 6
Admins: 2
Jobs: 6

✓ Production seeding complete!
```

### Step 3: Verify Data

```sql
-- Count records
SELECT COUNT(*) as company_count FROM companies WHERE name LIKE '%UAT%';
SELECT COUNT(*) as job_count FROM jobs WHERE title LIKE 'bsa_UAT_t1_%';
SELECT COUNT(*) as admin_count FROM admin_users WHERE email LIKE '%test%';

-- Test search functionality
SELECT id, title, company_name, location 
FROM jobs 
WHERE search_vector @@ to_tsquery('software & engineer')
LIMIT 5;

-- Test affiliate tracking structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'affiliate_clicks' 
ORDER BY ordinal_position;
```

---

## Connection Configuration

### Vercel Environment Variables

```bash
# Production DATABASE_URL format
postgresql://jobbrowser_prod_user:PASSWORD@HOST:5432/jobbrowser_prod?sslmode=require

# Set in Vercel Dashboard:
# Settings > Environment Variables > Production

# Example:
DATABASE_URL=postgresql://jobbrowser_prod_user:abc123xyz@jobbrowser-prod.xxxxx.rds.amazonaws.com:5432/jobbrowser_prod?sslmode=require
```

### Local Development (Using Production Snapshot)

```bash
# Do NOT use production database for local development

# Create local copy for testing:
pg_dump -h <PROD_HOST> -U jobbrowser_prod_user -d jobbrowser_prod > prod_dump.sql

# Restore to local database:
createdb jobbrowser_local
psql -d jobbrowser_local < prod_dump.sql

# Update .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/jobbrowser_local
```

### Connection Pooling

**Recommended:** Use PgBouncer for connection pooling

```ini
# pgbouncer.ini configuration
[databases]
jobbrowser_prod = host=<RDS_HOST> port=5432 dbname=jobbrowser_prod

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 3
server_lifetime = 3600
server_idle_timeout = 600
```

---

## Backup & Recovery

### Automated Backups (AWS RDS)

**Automatic Backups:**
- Retention: 30 days (configured during setup)
- Backup window: 03:00 UTC daily (configurable)
- Multi-AZ automatic failover enabled

**Verify Backup Settings:**
```bash
aws rds describe-db-instances \
  --db-instance-identifier jobbrowser-prod \
  --query 'DBInstances[0].[BackupRetentionPeriod,MultiAZ,PreferredBackupWindow]'
```

### Manual Backup (Before Major Changes)

```bash
# Create manual snapshot before migrations
aws rds create-db-snapshot \
  --db-instance-identifier jobbrowser-prod \
  --db-snapshot-identifier jobbrowser-prod-backup-2026-07-30

# Monitor snapshot creation
aws rds describe-db-snapshots \
  --db-snapshot-identifier jobbrowser-prod-backup-2026-07-30
```

### Point-in-Time Recovery

**If data corruption detected:**

```bash
# Restore to 1 hour ago
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier jobbrowser-prod-restored \
  --db-snapshot-identifier jobbrowser-prod-backup-2026-07-30 \
  --restore-time 2026-07-30T12:00:00Z

# Verify restored database
# Test with test user before switching
```

### PostgreSQL-Level Backups

**Full Database Backup Script:**
```bash
#!/bin/bash
# backup_db.sh

BACKUP_DIR="/backups/jobbrowser"
DATE=$(date +%Y%m%d_%H%M%S)
DB_HOST="<RDS_HOST>"
DB_USER="jobbrowser_prod_user"
DB_NAME="jobbrowser_prod"

mkdir -p $BACKUP_DIR

# Create backup
PGPASSWORD='<PASSWORD>' pg_dump \
  -h $DB_HOST \
  -U $DB_USER \
  -d $DB_NAME \
  --format=custom \
  --verbose \
  > "$BACKUP_DIR/jobbrowser_prod_$DATE.dump"

# Compress backup
gzip "$BACKUP_DIR/jobbrowser_prod_$DATE.dump"

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.dump.gz" -mtime +7 -delete

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/jobbrowser_prod_$DATE.dump.gz" \
  s3://jobbrowser-backups/

echo "Backup completed: jobbrowser_prod_$DATE.dump.gz"
```

**Setup Cron Job:**
```bash
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup_db.sh >> /var/log/backup_db.log 2>&1
```

### Restore from Backup

```bash
# Restore from custom format backup
pg_restore -h localhost \
  -U postgres \
  -d jobbrowser_prod_restored \
  --verbose \
  jobbrowser_prod_20260730_020000.dump

# Verify restoration
psql -d jobbrowser_prod_restored -c "SELECT COUNT(*) FROM jobs;"
```

---

## Performance Tuning

### PostgreSQL Configuration

```sql
-- Connect as superuser (postgres)
-- Adjust for your hardware

-- Memory Settings (for 2GB instance)
ALTER SYSTEM SET shared_buffers = '512MB';
ALTER SYSTEM SET effective_cache_size = '1536MB';
ALTER SYSTEM SET work_mem = '32MB';
ALTER SYSTEM SET maintenance_work_mem = '256MB';

-- Connection Settings
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET max_prepared_transactions = 50;

-- WAL (Write-Ahead Log)
ALTER SYSTEM SET max_wal_size = '4GB';
ALTER SYSTEM SET checkpoint_timeout = '15min';

-- Apply changes
SELECT pg_reload_conf();

-- Verify settings
SHOW shared_buffers;
SHOW effective_cache_size;
SHOW work_mem;
```

### Index Optimization

```sql
-- Existing indexes are created in migrations
-- Monitor index usage

-- Find unused indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY idx_scan DESC;

-- Find slow queries (requires log analysis)
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC
LIMIT 10;

-- Analyze table statistics
ANALYZE;

-- Full vacuum (do during maintenance window)
VACUUM FULL ANALYZE;
```

### Query Optimization

**Enable query plan analysis:**
```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT jobs.* FROM jobs
WHERE region = 'UAE'
  AND status = 'published'
  AND search_vector @@ to_tsquery('software')
ORDER BY posted_at DESC
LIMIT 20;
```

---

## Monitoring & Maintenance

### Daily Maintenance

```sql
-- Run daily (during low-traffic hours)
-- Collect statistics
ANALYZE;

-- Check for bloat
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  ROUND(
    (pg_total_relation_size(schemaname||'.'||tablename)::numeric / 
    GREATEST(1, pg_relation_size(schemaname||'.'||tablename))::numeric - 1) * 100, 2
  ) AS bloat_pct
FROM pg_tables
WHERE schemaname = 'public';

-- Reset statistics
SELECT pg_stat_reset();
```

### Weekly Maintenance

```bash
# Weekly backup verification
aws s3 ls s3://jobbrowser-backups/ --recursive

# Check backup integrity
pg_restore -h localhost -l jobbrowser_prod_backup.dump | head -20
```

### Monthly Maintenance

```sql
-- Full vacuum (do during maintenance window)
VACUUM FULL ANALYZE;

-- Reindex (if needed)
REINDEX DATABASE jobbrowser_prod;

-- Check database integrity
PRAGMA integrity_check;

-- Update table statistics
ANALYZE;
```

---

## Disaster Recovery

### Scenario 1: Database Becomes Unavailable

**Detection:**
- Application health check fails
- Sentry reports database connection errors
- Vercel deployment affected

**Recovery Steps:**
1. Verify RDS status in AWS dashboard
2. If RDS down, trigger failover to standby (if multi-AZ)
3. If persistent, restore from backup
4. Update DNS/connection strings if needed
5. Run verification queries
6. Monitor for 30 minutes before marking resolved

**Expected Recovery Time:** 2-5 minutes (with multi-AZ)

### Scenario 2: Data Corruption

**Detection:**
- Unexpected NULL values
- Constraint violations
- Search queries returning wrong results

**Recovery Steps:**
1. Stop accepting writes (maintenance mode)
2. Create snapshot for forensics
3. Restore from last known good backup
4. Run validation queries
5. Resume normal operations
6. Investigate root cause

**Expected Recovery Time:** 15-30 minutes

### Scenario 3: Accidental Deletion

**Detection:**
- Jobs disappear from search
- Applications data missing
- Alerts in Sentry

**Recovery Steps:**
1. Identify deletion timestamp from logs
2. Restore database to point-in-time before deletion
3. Extract deleted data
4. Merge back into current database
5. Verify data integrity
6. Resume operations

**Expected Recovery Time:** 30-60 minutes

### RTO & RPO Targets

| Metric | Target | Current Config |
|--------|--------|-----------------|
| RTO (Recovery Time Objective) | 5 minutes | Multi-AZ failover |
| RPO (Recovery Point Objective) | 1 hour | Hourly backups |
| Backup Retention | 30 days | AWS RDS automatic |
| Test Recovery Frequency | Monthly | Scheduled |

---

## Compliance & Security

### Database Access Control

```sql
-- Create read-only role for analytics
CREATE ROLE analytics_reader LOGIN PASSWORD '<PASSWORD>';

-- Grant permissions
GRANT CONNECT ON DATABASE jobbrowser_prod TO analytics_reader;
GRANT USAGE ON SCHEMA public TO analytics_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_reader;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO analytics_reader;
```

### Encryption

- **At Rest:** AWS RDS encryption enabled (via storage encryption)
- **In Transit:** SSL/TLS enforced (sslmode=require)
- **Connections:** All passwords in environment variables (never in code)

### Audit Logging

```sql
-- Enable query logging (for debugging)
ALTER SYSTEM SET log_statement = 'ddl';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second

SELECT pg_reload_conf();
```

### GDPR/Privacy Compliance

```sql
-- Users can request data deletion
-- Add function to safely delete user data

CREATE OR REPLACE FUNCTION delete_user_data(user_email VARCHAR)
RETURNS void AS $$
BEGIN
  -- Soft delete approach (safer than hard delete)
  UPDATE admin_users SET deleted_at = NOW() WHERE email = user_email;
  UPDATE job_alerts SET unsubscribed_at = NOW() WHERE email = user_email;
  -- Keep applications for legal reasons, but anonymize
  UPDATE applications SET 
    applicant_email = 'DELETED@example.com',
    applicant_name = 'DELETED',
    cover_letter = NULL
    WHERE applicant_email = user_email;
END;
$$ LANGUAGE plpgsql;
```

---

## Emergency Contacts

**Database Support:**
- AWS Support: https://console.aws.amazon.com/support
- On-Call DBA: [To be assigned]
- Engineering Lead: praise_john@outlook.com

**Incident Response Phone Numbers:**
[To be documented]

---

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [pgBouncer Connection Pooling](https://www.pgbouncer.org/)
- [Postgres Backup Best Practices](https://wiki.postgresql.org/wiki/Backup,_Restore_and_Recovery)

---

**Document Status:** READY FOR PRODUCTION  
**Last Review:** 2026-07-30  
**Next Review:** 2026-08-15
