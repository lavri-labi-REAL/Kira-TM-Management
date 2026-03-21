# Kirkira TM Management — Backend API Specification

**Version:** 1.0
**Audience:** Backend engineers implementing the REST API for the Kirkira Trademark Management frontend.
**Base URL:** `https://api.kirkira.com/v1` (or your chosen domain)
**Auth:** All endpoints require a valid JWT bearer token unless noted otherwise.

---

## Table of Contents

1. [General Conventions](#1-general-conventions)
2. [Authentication](#2-authentication)
3. [Trademarks](#3-trademarks)
4. [Deadlines](#4-deadlines)
5. [Documents](#5-documents)
6. [Timeline Events](#6-timeline-events)
7. [Renewals](#7-renewals)
8. [Map / Analytics](#8-map--analytics)
9. [Data Models](#9-data-models)
10. [Implementation Notes](#10-implementation-notes)

---

## 1. General Conventions

### Request / Response format
- All bodies: `application/json`
- File uploads: `multipart/form-data`
- All dates: ISO 8601 string `YYYY-MM-DD`
- All IDs: UUIDs (v4)

### Standard response envelope
```json
{
  "data": { ... },
  "meta": { "page": 1, "perPage": 50, "total": 120 }
}
```

### Standard error envelope
```json
{
  "error": {
    "code": "TRADEMARK_NOT_FOUND",
    "message": "Trademark with id 'abc' does not exist.",
    "field": null
  }
}
```

### HTTP status codes used
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No content (DELETE) |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (wrong tenant) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable entity |
| 500 | Internal server error |

### Pagination
Query params: `?page=1&perPage=50`
Sorting: `?sortBy=markName&sortDir=asc`
Search: `?search=kirkira`

---

## 2. Authentication

### POST `/auth/login`
Authenticate a user and return a JWT.

**Request**
```json
{ "email": "admin@kirkira.com", "password": "..." }
```

**Response 200**
```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 3600,
    "user": { "id": "uuid", "email": "admin@kirkira.com", "name": "Admin User", "role": "admin" }
  }
}
```

### POST `/auth/refresh`
Exchange a refresh token for a new access token.

### POST `/auth/logout`
Invalidate the current refresh token.

**Implementation notes**
- Use short-lived access tokens (1h) with long-lived refresh tokens (30d)
- Tokens must include `tenantId` claim to enforce multi-tenant data isolation
- Recommended: `HS256` or `RS256` signing

---

## 3. Trademarks

### GET `/trademarks`
Return a paginated list of all trademarks for the authenticated tenant.

**Query params**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Filter by markName or jurisdiction (case-insensitive) |
| `status` | string | One of: `Filed`, `Published`, `Registered`, `Opposed`, `Expired` |
| `jurisdiction` | string | Filter by jurisdiction name |
| `niceClass` | integer | Filter by Nice class number |
| `owner` | string | Filter by owner name |
| `sortBy` | string | Field name (default: `markName`) |
| `sortDir` | string | `asc` or `desc` |
| `page` | integer | Default: 1 |
| `perPage` | integer | Default: 50, max: 200 |

**Response 200**
```json
{
  "data": [ { ...Trademark }, ... ],
  "meta": { "page": 1, "perPage": 50, "total": 21 }
}
```

---

### GET `/trademarks/:id`
Return a single trademark by ID.

**Response 200** — full `Trademark` object (see Data Models)
**Response 404** — trademark not found

---

### POST `/trademarks`
Create a new trademark.

**Request body** — `TrademarkInput` (see Data Models)
**Response 201** — created `Trademark` object

**Validation rules**
- `markName`: required, max 255 chars
- `markType`: required, one of `Word | Figurative | Combined | Sound | 3D`
- `status`: required, one of `Filed | Published | Registered | Opposed | Expired`
- `niceClasses`: array of integers 1–45, min 1 item
- `jurisdiction`: required, must match allowed jurisdiction list
- Dates must be chronologically consistent: `filingDate ≤ publicationDate ≤ registrationDate ≤ renewalDate`

---

### PATCH `/trademarks/:id`
Partially update a trademark. Only provided fields are updated.

**Request body** — partial `TrademarkInput`
**Response 200** — updated `Trademark` object

---

### DELETE `/trademarks/:id`
Permanently delete a trademark and all linked documents, deadlines, and timeline events (cascade).

**Response 204**
**Implementation note:** Use a soft-delete (`deletedAt` timestamp) rather than hard delete. Hard-delete only after a grace period or explicit purge.

---

## 4. Deadlines

### GET `/deadlines`
Return all deadlines for the tenant.

**Query params**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Filter by markName or jurisdiction |
| `deadlineType` | string | Filter by type |
| `trademarkId` | uuid | Filter by linked trademark |
| `status` | string | `Upcoming` or `Overdue` |
| `dueBefore` | date | ISO date upper bound on dueDate |
| `dueAfter` | date | ISO date lower bound on dueDate |

**Implementation note:** The `status` field (`Upcoming` / `Overdue`) should be **computed dynamically** on the server by comparing `dueDate` to `NOW()` — do not store it statically.

---

### GET `/deadlines/:id`
Return a single deadline.

---

### POST `/deadlines`
Create a manual deadline entry.

**Request body**
```json
{
  "trademarkId": "uuid",
  "deadlineType": "Renewal",
  "dueDate": "2030-01-10",
  "notes": "10-year renewal due",
  "emailNotification": true
}
```

**Validation:** `trademarkId` must exist and belong to the same tenant.

---

### PATCH `/deadlines/:id`
Update a deadline (e.g. toggle `emailNotification`, update `dueDate`).

---

### DELETE `/deadlines/:id`
Delete a deadline entry.

---

### GET `/deadlines/summary`
Return aggregated stats for the dashboard stat cards.

**Response 200**
```json
{
  "data": {
    "overdue": 2,
    "dueThisWeek": 3,
    "dueThisMonth": 5,
    "allUpcoming": 18
  }
}
```

**Implementation note:** Compute all four values in a single SQL query using conditional aggregation (`COUNT(CASE WHEN ... END)`). This avoids N+1 queries from the frontend calling the list endpoint and counting client-side.

---

### POST `/deadlines/auto-generate/:trademarkId`
Auto-calculate and create standard deadlines for a trademark based on its dates and jurisdiction rules.

**Logic to implement:**
- If `registrationDate` exists → create a Renewal deadline at `registrationDate + 10 years` (adjust per jurisdiction; some are 7y)
- If `publicationDate` exists and `registrationDate` is null → create an Opposition Window deadline at `publicationDate + 3 months`
- Idempotent: skip if a deadline of the same type already exists for the trademark

---

## 5. Documents

### GET `/documents`
Return all documents for the tenant.

**Query params:** `search`, `fileType`, `trademarkId`, `page`, `perPage`

---

### GET `/documents/:id`
Return a single document record (metadata only — not the file binary).

---

### POST `/documents/upload`
Upload a new document file and create a document record.

**Request:** `multipart/form-data`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `file` | binary | ✅ | PDF, JPEG, PNG, DOCX accepted |
| `trademarkId` | uuid | ✅ | Must belong to same tenant |
| `fileType` | string | ✅ | `Office Action \| Certificate \| Invoice \| Correspondence \| Other` |

**Response 201**
```json
{
  "data": {
    "id": "uuid",
    "trademarkId": "uuid",
    "fileName": "Kirkira_US_Certificate.pdf",
    "fileType": "Certificate",
    "uploadedDate": "2025-01-10",
    "size": "245 KB",
    "url": "https://storage.kirkira.com/docs/uuid/filename.pdf",
    "extractedText": "CERTIFICATE OF REGISTRATION...",
    "ocrStatus": "completed"
  }
}
```

**Implementation notes:**
- Store files in object storage (S3, GCS, Azure Blob). Never store binaries in the database.
- Generate a pre-signed URL with a short TTL (e.g. 1 hour) for the `url` field on every response.
- Trigger OCR asynchronously after upload (use a job queue — SQS, BullMQ, etc.). Return `ocrStatus: "pending"` immediately; update to `"completed"` when done.
- Accepted MIME types: `application/pdf`, `image/jpeg`, `image/png`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Max file size: 25 MB
- Virus-scan uploads before making them accessible.

---

### GET `/documents/:id/url`
Return a fresh pre-signed download URL for a document (avoids storing long-lived URLs in the database).

**Response 200**
```json
{ "data": { "url": "https://...", "expiresAt": "2025-01-10T14:00:00Z" } }
```

---

### DELETE `/documents/:id`
Delete the document record and the underlying file from object storage.

---

### GET `/trademarks/:id/documents`
Shorthand — return all documents linked to a specific trademark.

---

## 6. Timeline Events

### GET `/trademarks/:id/timeline`
Return all timeline events for a trademark, sorted by `date` ascending.

**Response 200**
```json
{
  "data": [
    {
      "id": "uuid",
      "trademarkId": "uuid",
      "date": "2019-03-15",
      "type": "Filing",
      "description": "Application filed with USPTO.",
      "documentId": null
    }
  ]
}
```

---

### POST `/trademarks/:id/timeline`
Add a manual timeline event.

**Request body**
```json
{
  "date": "2025-06-01",
  "type": "Correspondence",
  "description": "Response to office action submitted.",
  "documentId": "uuid"
}
```

**Validation:** `type` must be one of `Filing | Publication | Opposition | Registration | Renewal | Correspondence`. `documentId` if provided must belong to the same trademark.

---

### DELETE `/trademarks/:id/timeline/:eventId`
Delete a timeline event.

---

## 7. Renewals

### GET `/renewals`
Return trademarks with upcoming renewals within a given horizon.

**Query params**

| Param | Type | Description |
|-------|------|-------------|
| `horizonMonths` | integer | 6, 12, or 24 (default: 12) |
| `jurisdiction` | string | Filter by jurisdiction |

**Response 200**
```json
{
  "data": [
    {
      "trademarkId": "uuid",
      "markName": "Kirkira",
      "jurisdiction": "United States",
      "niceClassCount": 3,
      "renewalDate": "2030-01-10",
      "daysUntilRenewal": 1390,
      "estimatedFee": 550,
      "decision": null,
      "status": "Registered"
    }
  ],
  "meta": {
    "totalDue": 8,
    "totalEstimatedFees": 4820,
    "decidedRenew": 2,
    "decidedLapse": 1
  }
}
```

**Implementation note:** `estimatedFee` is computed server-side from a `jurisdiction_fees` lookup table (base fee + per-class surcharge). Store the fee schedule in the database so it can be updated without code changes.

---

### POST `/renewals/:trademarkId/decision`
Record a renewal decision.

**Request body**
```json
{
  "decision": "renew",
  "confirmedFee": 550,
  "notes": "Approved by legal team"
}
```

**`decision`:** `"renew"` or `"lapse"`

**Side effects on `"lapse"`:**
- Update trademark `status` to `"Expired"`
- Close any open deadlines of type `"Renewal"` for this trademark

---

### POST `/renewals/:trademarkId/confirmation`
Upload a renewal confirmation document (receipt/invoice).

**Request:** `multipart/form-data` with `file` field — same constraints as `/documents/upload`.
**Side effect:** Creates a `Document` record with `fileType = "Invoice"` and links it to the trademark.

---

## 8. Map / Analytics

### GET `/analytics/map`
Return per-jurisdiction trademark counts for the world map.

**Query params:** `status`, `niceClass`, `owner`, `year` (filing year)

**Response 200**
```json
{
  "data": [
    {
      "jurisdiction": "United States",
      "total": 5,
      "breakdown": {
        "Filed": 1, "Registered": 3, "Opposed": 1, "Expired": 0, "Published": 0
      }
    }
  ]
}
```

**Implementation note:** Run as a single `GROUP BY` query. Cache the result for 60 seconds (Redis) since it is called on every map interaction.

---

### GET `/analytics/summary`
Return global portfolio KPIs for a potential future dashboard home page.

**Response 200**
```json
{
  "data": {
    "totalTrademarks": 21,
    "activeJurisdictions": 14,
    "byStatus": { "Registered": 12, "Filed": 5, "Published": 2, "Opposed": 1, "Expired": 1 },
    "overdueDeadlines": 2,
    "renewalsDueIn12Months": 3,
    "estimatedRenewalFees": 4820
  }
}
```

---

## 9. Data Models

### Trademark
```typescript
{
  id:                 string (UUID)
  tenantId:           string (UUID)          // multi-tenant isolation
  markName:           string                 // required
  markType:           "Word" | "Figurative" | "Combined" | "Sound" | "3D"
  niceClasses:        number[]               // array of integers 1–45
  jurisdiction:       string                 // country / region name
  filingDate:         string | null          // YYYY-MM-DD
  publicationDate:    string | null
  registrationDate:   string | null
  renewalDate:        string | null
  status:             "Filed" | "Published" | "Registered" | "Opposed" | "Expired"
  owner:              string
  notes:              string
  applicationNumber:  string
  createdAt:          string (ISO 8601)
  updatedAt:          string (ISO 8601)
  deletedAt:          string | null          // soft-delete
}
```

### Deadline
```typescript
{
  id:                 string (UUID)
  tenantId:           string (UUID)
  trademarkId:        string (UUID)
  markName:           string                 // denormalised for display performance
  jurisdiction:       string                 // denormalised
  deadlineType:       "Renewal" | "Opposition Response" | "Examination Response" | "Opposition Window" | "Payment" | "Other"
  dueDate:            string                 // YYYY-MM-DD
  notes:              string
  emailNotification:  boolean
  status:             computed              // "Overdue" if dueDate < today, else "Upcoming"
  createdAt:          string
  updatedAt:          string
}
```

### Document
```typescript
{
  id:             string (UUID)
  tenantId:       string (UUID)
  trademarkId:    string (UUID)
  fileName:       string
  fileType:       "Office Action" | "Certificate" | "Invoice" | "Correspondence" | "Other"
  uploadedDate:   string                    // YYYY-MM-DD
  sizeBytes:      number
  storageKey:     string                    // internal S3/GCS object key — never expose to client
  extractedText:  string | null             // populated after OCR job completes
  ocrStatus:      "pending" | "completed" | "failed"
  createdAt:      string
  updatedAt:      string
}
```

### TimelineEvent
```typescript
{
  id:           string (UUID)
  tenantId:     string (UUID)
  trademarkId:  string (UUID)
  date:         string                      // YYYY-MM-DD
  type:         "Filing" | "Publication" | "Opposition" | "Registration" | "Renewal" | "Correspondence"
  description:  string
  documentId:   string | null               // optional linked document
  createdAt:    string
  updatedAt:    string
}
```

### RenewalDecision
```typescript
{
  id:           string (UUID)
  tenantId:     string (UUID)
  trademarkId:  string (UUID)
  decision:     "renew" | "lapse"
  confirmedFee: number | null
  notes:        string
  decidedBy:    string (UUID)               // user who made the decision
  decidedAt:    string (ISO 8601)
}
```

---

## 10. Implementation Notes

### Multi-tenancy
- Every table must have a `tenantId` column with a foreign key to a `tenants` table.
- Apply Row-Level Security (RLS) if using PostgreSQL, or enforce `tenantId` in every query at the ORM/repository layer.
- JWT must contain `tenantId`; the API must reject requests where the JWT `tenantId` does not match the resource's `tenantId`.

### Recommended stack
| Concern | Recommendation |
|---------|---------------|
| Language | Node.js (TypeScript) or Python (FastAPI) |
| Database | PostgreSQL 15+ |
| ORM | Prisma (Node) / SQLAlchemy (Python) |
| File storage | AWS S3 or Cloudflare R2 |
| OCR | AWS Textract or Google Cloud Document AI |
| Job queue | BullMQ (Redis-backed) or AWS SQS |
| Cache | Redis (deadline summaries, map analytics) |
| Auth | JWT + refresh tokens, bcrypt for passwords |
| Email notifications | SendGrid or Postmark (for deadline alerts) |

### Frontend integration — replacing mock fetchers
When the backend is ready, update `src/hooks/` to replace the mock fetcher functions with Axios calls:

```js
// Before (mock)
queryFn: async () => {
  await delay(300)
  return getTrademarks()
}

// After (real API)
queryFn: async () => {
  const { data } = await axios.get('/trademarks', { params: filters })
  return data.data
}
```

Axios base URL and auth headers should be configured once in `src/utils/axiosClient.js`:

```js
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
```

### Email notification system
The `emailNotification` boolean per deadline should trigger a scheduled job (cron) that:
1. Runs daily at 08:00 tenant local time
2. Queries all deadlines where `emailNotification = true` AND `dueDate` is in {1, 7, 30, 90} days
3. Sends a digest email per tenant summarising all upcoming items

### OCR pipeline
```
Upload → S3 → SQS message → Worker → Textract/Document AI → update document.extractedText + ocrStatus → (optional) webhook to frontend
```
The frontend currently polls for `ocrStatus` implicitly via React Query refetch. Consider adding a WebSocket or Server-Sent Events channel to push OCR completion events so the UI updates without polling.

### Database indexes to create
```sql
CREATE INDEX idx_trademarks_tenant        ON trademarks (tenant_id);
CREATE INDEX idx_trademarks_status        ON trademarks (status);
CREATE INDEX idx_trademarks_jurisdiction  ON trademarks (jurisdiction);
CREATE INDEX idx_trademarks_renewal_date  ON trademarks (renewal_date);
CREATE INDEX idx_deadlines_tenant         ON deadlines (tenant_id);
CREATE INDEX idx_deadlines_due_date       ON deadlines (due_date);
CREATE INDEX idx_deadlines_trademark      ON deadlines (trademark_id);
CREATE INDEX idx_documents_trademark      ON documents (trademark_id);
CREATE INDEX idx_timeline_trademark       ON timeline_events (trademark_id, date);
```

### CORS
Allow origins matching your Vercel deployment URL and any custom domain. In development allow `http://localhost:5173`.

---

*Generated from the Kirkira TM Management frontend codebase — March 2026.*
