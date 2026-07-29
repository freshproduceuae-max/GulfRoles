# Job Alerts API Testing Guide

This document outlines how to test the newly implemented job alerts infrastructure.

## Overview

Three new endpoints have been created:

1. **POST /api/alerts** - Subscribe to job alerts
2. **GET /api/alerts?email=...** - Retrieve subscription details
3. **DELETE /api/alerts** - Unsubscribe from alerts
4. **POST /api/alerts/send-digest** - Send weekly email digests (admin/scheduled)
5. **GET /api/alerts/unsubscribe?token=...** - Unsubscribe via email link

## Database Schema

The `job_alerts` table (already exists) stores:
- `id` (UUID) - Subscription ID
- `email` (VARCHAR) - Subscriber email
- `frequency` (VARCHAR) - 'weekly' (only option for MVP)
- `preferences` (JSONB) - Filter preferences (keywords, locations, salary_min)
- `subscribed_at` (TIMESTAMP) - When subscription was created
- `last_sent_at` (TIMESTAMP) - When last digest was sent
- `unsubscribed_at` (TIMESTAMP) - When unsubscribed (NULL if active)
- `created_at`, `updated_at` - Record timestamps

## Test Cases

### 1. Subscribe to Job Alerts

**Endpoint:** `POST /api/alerts`

**Request:**
```bash
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "frequency": "weekly",
    "preferences": {
      "keywords": ["React", "Next.js"],
      "locations": ["Dubai", "Abu Dhabi"],
      "salary_min": 100000
    }
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "subscription_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "frequency": "weekly"
}
```

**Validation:**
- Email must be valid format
- Frequency must be 'weekly' for MVP
- Preferences are optional
- Returns subscription_id (UUID)
- Creates record in job_alerts table

### 2. Get Subscription Details

**Endpoint:** `GET /api/alerts?email=user@example.com`

**Request:**
```bash
curl http://localhost:3000/api/alerts?email=user@example.com
```

**Expected Response (200):**
```json
{
  "subscribed": true,
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "frequency": "weekly",
  "preferences": {
    "keywords": ["React", "Next.js"],
    "locations": ["Dubai", "Abu Dhabi"],
    "salary_min": 100000
  },
  "subscribed_at": "2026-07-29T10:30:00Z",
  "last_sent_at": null
}
```

**Test Cases:**
- Valid email - returns subscription
- Non-existent email - returns `"subscribed": false`
- Invalid email format - returns 400 error
- Unsubscribed email - returns `"subscribed": false`

### 3. Unsubscribe via API

**Endpoint:** `DELETE /api/alerts`

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Unsubscribed from job alerts"
}
```

**Validation:**
- Sets unsubscribed_at timestamp
- Email no longer appears as subscribed
- Can re-subscribe later

### 4. Unsubscribe via Email Link

**Endpoint:** `GET /api/alerts/unsubscribe?token=<subscription_id>`

**Request:**
```bash
curl "http://localhost:3000/api/alerts/unsubscribe?token=550e8400-e29b-41d4-a716-446655440000"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Successfully unsubscribed from job alerts"
}
```

**Note:** This endpoint is included in email as clickable link for one-click unsubscribe.

### 5. Send Weekly Digest

**Endpoint:** `POST /api/alerts/send-digest`

**Request (Manual):**
```bash
curl -X POST http://localhost:3000/api/alerts/send-digest \
  -H "Authorization: Bearer test-cron-secret"
```

**Request (For specific email - testing):**
```bash
curl -X POST "http://localhost:3000/api/alerts/send-digest?email=user@example.com&dryRun=true" \
  -H "Authorization: Bearer test-cron-secret"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Processed 5 subscriptions",
  "dryRun": false,
  "sent": 5,
  "failed": 0,
  "results": [
    {
      "email": "user1@example.com",
      "success": true,
      "jobsCount": 8
    },
    {
      "email": "user2@example.com",
      "success": true,
      "jobsCount": 0
    }
  ]
}
```

**Behavior:**
- Fetches all subscriptions with `last_sent_at < 7 days ago` or NULL
- For each subscription, queries `/api/jobs` using preferences
- Sends HTML email with matched jobs (max 10 per digest)
- Updates `last_sent_at` timestamp
- Returns summary of sent/failed emails

**Query Parameters:**
- `email` (optional) - Send digest only to specific email
- `dryRun` (optional, true/false) - Don't actually send emails

## Environment Variables Required

Add to `.env.local`:

```
# Email Configuration (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=noreply@jobbrowser.app

# For scheduled jobs
CRON_SECRET=your-secret-here

# For email links
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
```

## Email Template Features

The email digest includes:

1. **Header** - "JobBrowser Weekly Digest" with gradient background
2. **Job Cards** (max 10) - Each showing:
   - Job title
   - Company name
   - Location (badge)
   - Salary range (if available)
   - Job type
   - Description preview (150 chars)
   - "View Job Details" button
3. **Footer** - Links to browse all jobs and unsubscribe
4. **Responsive Design** - Mobile-friendly HTML/CSS

## Integration with Scheduled Jobs

For production deployment on Vercel, set up a cron job:

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/alerts/send-digest",
      "schedule": "0 9 * * 5"
    }
  ]
}
```

This runs every Friday at 9 AM UTC.

For local testing:

```bash
# Manually trigger digest
curl -X POST http://localhost:3000/api/alerts/send-digest \
  -H "Authorization: Bearer test-cron-secret"
```

## Validation Rules

**Email:**
- Must be valid email format (RFC 5322)
- Required field

**Frequency:**
- Only 'weekly' supported for MVP
- Defaults to 'weekly'

**Preferences:**
- All optional
- `keywords` - array of strings (search terms)
- `locations` - array of strings (city names)
- `salary_min` - positive integer (USD)

**Duplicate Handling:**
- If email already subscribed, returns 400 with existing subscription_id
- Can check subscription status before subscribing

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200** - Success
- **201** - Created (subscription)
- **400** - Bad request (validation error)
- **401** - Unauthorized (invalid token for send-digest)
- **404** - Not found (subscription)
- **500** - Server error

## Type Safety

All code is written in TypeScript with strict mode enabled:

- Zod schemas validate all inputs
- Database queries use typed results
- API responses have consistent structure
- Error handling with proper typing

## Next Steps

1. Set SendGrid API key in environment
2. Test each endpoint manually
3. Monitor email deliverability
4. Set up scheduled job in Vercel
5. Add frontend subscription form
