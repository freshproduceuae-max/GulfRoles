# Admin Moderation System Implementation

## Overview
Complete rule-based job moderation system with automatic flagging and admin queue UI.

## Files Created

### 1. **lib/moderation.ts** - Rule Engine
Core moderation logic with four rule engines:
- **Keyword Blocklist** (0.9 confidence): Detects suspicious phrases like "work from home no experience", "free money", "make money fast", "guaranteed income"
- **Unverified Employer** (0.5 confidence): Flags jobs from employers without verification
- **Posting Velocity** (0.85 confidence): Detects spam pattern (10+ jobs from same employer in 1 hour)
- **Suspicious Links** (0.85 confidence): Checks for phishing domains (bit.ly, tinyurl.com, short.link, goo.gl)

Key exports:
- `flagJob(job)` - Check job against all rules, returns highest-confidence flag or null
- `createModerationFlag(jobId, flag)` - Save flag to database
- `getFlaggedJobs(limit, offset)` - Fetch paginated flagged jobs
- `reviewFlaggedJob(flagId, decision, notes, reviewer)` - Approve/reject with audit trail
- `getFlaggedJobDetails(jobId)` - Get full job details for preview

### 2. **app/api/jobs/route.ts** - Job Creation with Moderation
Enhanced POST endpoint:
```
POST /api/jobs
Body: {
  title, description, company_name, location, region, job_type,
  employer_email, salary_min?, salary_max?, salary_currency?,
  source_url?, benefits?, employer_verified?
}
Response: {
  success: true,
  job_id: string,
  status: "published" | "flagged",
  flag?: { rule, reason, confidence }
}
```
- Creates job as draft, checks all moderation rules
- If flagged, sets status to "flagged" and creates moderation_flags record
- If clean, sets status to "published" immediately
- Always uses transaction for data consistency

### 3. **app/api/moderation/queue/route.ts** - GET Flagged Jobs Queue
```
GET /api/moderation/queue?page=1&limit=20
Response: {
  jobs: Array<{
    id, title, company_name, employer_email,
    rule_triggered, confidence, reason, flag_id,
    posted_at, created_at
  }>,
  total: number,
  page: number,
  pages: number
}
```
- Returns all jobs with status='flagged'
- Paginated with confidence-based sorting
- Requires authentication

### 4. **app/api/moderation/review/route.ts** - POST Review Decision
```
POST /api/moderation/review
Body: {
  flag_id: string,
  decision: "approve" | "reject",
  admin_notes?: string
}
Response: {
  success: true,
  flag_id: string,
  decision: string
}
```
- Approve: Sets job status to "published", flag status to "approved"
- Reject: Sets job status to "rejected", flag status to "rejected"
- Logs admin reviewer email and timestamp
- Requires authentication

### 5. **app/api/moderation/job/[jobId]/route.ts** - GET Job Details
```
GET /api/moderation/job/[jobId]
Response: {
  id, title, description, company_name, location, region,
  employer_email, employer_verified, job_type,
  salary_min, salary_max, posted_at,
  flag_id, rule_triggered, confidence, admin_notes
}
```
- Full job details for preview modal
- Requires authentication

### 6. **app/(admin)/moderation/page.tsx** - Moderation Queue Page
- Main admin interface at `/admin/moderation`
- Requires NextAuth session (redirects to login if not authenticated)
- Displays ModerationQueue component
- Supports job detail preview via modal

### 7. **components/admin/ModerationQueue.tsx** - Queue Component
Features:
- Table display with sortable columns
- Real-time filtering by rule type
- Single-job actions (Approve/Reject buttons)
- Batch actions (select multiple, approve/reject all)
- Confidence score visualization (color-coded bars)
- Pagination with configurable page size
- Loading and error states

### 8. **components/admin/JobPreviewModal.tsx** - Job Preview Modal
Features:
- Modal overlay with job details
- Flag information with confidence visualization
- 2-column grid for key job info
- Full description preview
- Employer verification status
- Admin notes display
- Clean, readable layout

### 9. **app/(admin)/layout.tsx** - Admin Route Group Layout
- Shared layout for admin pages
- Consistent header and navigation
- Links to Dashboard and Moderation
- Mobile-responsive design

## Database Schema

Uses existing `moderation_flags` table (created in 001_init_schema.sql):
```sql
CREATE TABLE moderation_flags (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id),
  rule_triggered VARCHAR(100),  -- keyword_blocklist, unverified_employer, posting_velocity, suspicious_link
  confidence DECIMAL(3, 2),     -- 0.0 to 1.0
  status VARCHAR(50),           -- flagged, approved, rejected, investigating
  admin_notes TEXT,
  admin_reviewed_by VARCHAR(255),
  admin_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
);
```

Job statuses used:
- `draft` - Initial status before moderation
- `flagged` - Pending moderation review
- `published` - Approved by admin or passed moderation
- `rejected` - Rejected by admin
- `expired` - Job posting expired

## Usage Flow

### Creating a Job with Moderation
1. POST /api/jobs with job details
2. System checks all 4 rules
3. If any rule triggers, job gets status="flagged" and record added to moderation_flags
4. If clean, job gets status="published" immediately
5. Admin can see flagged jobs at /admin/moderation

### Reviewing Flagged Jobs
1. Admin logs in → redirected to /admin/moderation
2. Views queue of flagged jobs, sorted by confidence
3. Can filter by rule type
4. Click job title to open preview modal
5. Click Approve/Reject buttons
6. Optionally add admin notes
7. Job status changes, flag status recorded with timestamp and reviewer email

### Batch Operations
1. Select multiple jobs with checkboxes
2. Click "Approve (N)" or "Reject (N)" to act on all selected
3. All jobs reviewed in batch without individual notes

## Testing

### Manual API Testing
```bash
# Create a flagged job
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "work from home no experience",
    "description": "Make money fast with guaranteed income",
    "company_name": "Suspicious Inc",
    "location": "Remote",
    "region": "USA",
    "job_type": "full-time",
    "employer_email": "test@example.com"
  }'

# Expected response:
# {
#   "success": true,
#   "job_id": "uuid",
#   "status": "flagged",
#   "flag": {
#     "rule": "keyword_blocklist",
#     "reason": "Suspicious keyword detected: \"work from home no experience\"",
#     "confidence": 0.9
#   }
# }

# Get moderation queue
curl http://localhost:3000/api/moderation/queue \
  -H "Authorization: Bearer <session_token>"

# Approve a job
curl -X POST http://localhost:3000/api/moderation/review \
  -H "Content-Type: application/json" \
  -d '{
    "flag_id": "uuid",
    "decision": "approve",
    "admin_notes": "Job looks legitimate after review"
  }'
```

## Security Considerations

1. **Authentication**: All moderation endpoints require NextAuth session
2. **Authorization**: Future enhancement to add role-based access (moderator vs admin vs superadmin)
3. **Audit Trail**: admin_notes, admin_reviewed_by, admin_reviewed_at logged for all decisions
4. **Transaction Safety**: Job creation and flagging wrapped in database transaction
5. **Input Validation**: All API inputs validated before use
6. **Server-side Checks**: No client-side moderation rules; all checks happen server-side

## Performance

- **Confidence-based Sorting**: Queue shows highest-risk jobs first
- **Pagination**: 20 jobs per page by default, max 100
- **Indexes**: Optimized queries on status, confidence, created_at
- **Batch Operations**: Approve/reject multiple jobs without full page reload

## Extensibility

To add new moderation rules:
1. Add rule function to lib/moderation.ts
2. Call from flagJob() and add to flags array
3. Update ModerationQueue.tsx filterRule options
4. Update getRuleDescription() switch statement

Example:
```typescript
function checkNewRule(job: JobToModerate): ModerationFlag | null {
  // Check your condition
  return {
    shouldFlag: true,
    reason: "Description of what was flagged",
    confidence: 0.75,
    rule: "new_rule_name"
  };
}
```

## Future Enhancements

1. Email notifications to employers (approved/rejected)
2. Appeal system for rejected jobs
3. Manual flag management (admin can flag clean jobs)
4. Rule fine-tuning (adjust confidence thresholds)
5. Historical analytics (flag statistics, trends)
6. Webhook notifications to external systems
7. AI-based content analysis for additional rules

## Status

✅ Implementation complete
✅ Type-safe (TypeScript strict mode)
✅ Mobile-responsive UI
✅ Database schema supports all operations
✅ API endpoints functional
✅ Admin UI complete with filtering and batch operations
✅ Transaction safety for data consistency
