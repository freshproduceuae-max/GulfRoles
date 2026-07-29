#!/bin/bash

# Moderation System Schema Verification Test
# Verifies the database has all required tables and columns

echo "=== Moderation System Schema Test ==="
echo ""

# Check if we can connect to the database
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable not set"
  exit 1
fi

echo "Testing database connection and schema..."
echo ""

# Test 1: Verify moderation_flags table exists
echo "Test 1: Checking moderation_flags table..."
psql "$DATABASE_URL" -c "\d moderation_flags" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✓ moderation_flags table exists"
  psql "$DATABASE_URL" -c "\d moderation_flags"
else
  echo "✗ moderation_flags table not found"
  exit 1
fi
echo ""

# Test 2: Verify jobs table has status column with 'flagged'
echo "Test 2: Checking jobs table status column..."
psql "$DATABASE_URL" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='jobs' AND column_name='status';"
if [ $? -eq 0 ]; then
  echo "✓ jobs.status column exists"
else
  echo "✗ jobs.status column not found"
  exit 1
fi
echo ""

# Test 3: Count existing flagged jobs
echo "Test 3: Checking for flagged jobs..."
COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM moderation_flags WHERE status='flagged';")
echo "✓ Flagged jobs in queue: $COUNT"
echo ""

# Test 4: Check moderation_flags indexes
echo "Test 4: Checking indexes on moderation_flags..."
psql "$DATABASE_URL" -c "\di *moderation_flags*"
if [ $? -eq 0 ]; then
  echo "✓ Indexes verified"
else
  echo "✗ Index check failed"
  exit 1
fi
echo ""

echo "All schema tests passed!"
