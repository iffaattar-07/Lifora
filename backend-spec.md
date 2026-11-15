# Backend Architecture & Implementation Specification

## 1. Executive Summary & System Overview

### Core Purpose

LIFORA is an elderly-care coordination platform for an elderly care recipient, family members, home-care professionals, and physicians. The backend must provide a secure source of truth for:

- Care-recipient profiles, conditions, allergies, emergency contacts, and primary clinician data.
- Medication regimens, schedule times, dose status, adherence metrics, refill status, and clinician instructions.
- Doctor appointments, preparation notes, clinic contacts, and assigned escorts.
- Care-circle membership, permissions, presence, invitations, and notification preferences.
- In-app notifications, missed-dose escalation, emergency broadcasts, SMS/email delivery, and read state.
- A context-aware care assistant that answers from server-side care data and refuses diagnosis, dosage changes, or unsafe missed-dose advice.
- Role/view preferences, accessibility preferences, audit history, and real-time updates.

The current frontend uses `CareContext`, mock data, and browser `localStorage`. The production backend must replace that persistence while preserving the current UI model where practical. The existing `/api/assistant` response shape should remain available as a compatibility endpoint during migration.

### Proposed Tech Stack

- **Application/API:** Next.js 15 Route Handlers as a same-origin backend-for-frontend (BFF), organized as a modular monolith. This avoids unnecessary CORS and authentication changes for the current frontend. A separate NestJS/Fastify service can be extracted later if workload requires it.
- **Database:** PostgreSQL through Supabase, with migrations, foreign keys, constraints, database functions, and Row Level Security (RLS).
- **Authentication:** Supabase Auth with secure cookie sessions, email/password or magic link, optional OAuth, and optional MFA for caregivers and staff.
- **Database access:** Supabase SSR client for request-scoped authentication and typed SQL/RPC for RLS-protected access. Drizzle ORM is recommended for migrations and server-side typed queries if the team prefers a local schema layer; do not bypass RLS with the service-role key in request handlers.
- **Validation:** Zod schemas at every API boundary, including assistant input, form payloads, query strings, webhook payloads, and environment variables.
- **Real-time:** Supabase Realtime channels scoped to a care recipient. Never expose an unfiltered global table channel.
- **Jobs:** Supabase scheduled functions/cron for dose generation and reminders, plus a durable queue such as Upstash QStash or BullMQ/Redis for notification delivery and retries.
- **Messaging:** Resend for email and Twilio Verify/Messaging for SMS, with user consent, opt-out handling, delivery status, and idempotency keys.
- **Assistant:** Deterministic server-side intent/rules for medication safety and care lookups, optionally augmented by OpenAI or Gemini for natural-language formatting. The model must never be the source of medication dosage or clinical decisions.
- **Observability:** Sentry for exceptions, structured JSON logs, OpenTelemetry-compatible tracing, and database audit logs.
- **Hosting:** Vercel for the Next.js BFF, Supabase for Postgres/Auth/Realtime/Storage, and Upstash or a managed worker platform for jobs. Use a HIPAA-appropriate Supabase plan/BAA and compliant vendors before handling real PHI.

### Frontend Compatibility and Required Changes

The backend can preserve the existing visual UI, but these structural changes are required for production behavior:

1. `CareProvider` must load dashboard state from authenticated API endpoints rather than seed all state from `mockData.ts` and `localStorage`.
2. Dose, medication, appointment, care-circle, notification, and emergency actions must call mutation endpoints and then reconcile the returned server state.
3. The current `/api/assistant` endpoint must ignore client-supplied care context and derive context from the authenticated user and selected care recipient.
4. The frontend should send an `X-Care-Recipient-Id` header or route parameter when a caregiver has access to multiple recipients.
5. The font-size selector must apply `document.body.dataset.fontSize` and persist the preference through the user-preferences endpoint.
6. Assistant suggested actions must become explicit typed actions. They currently submit plain text and do not actually mark doses taken, call contacts, or navigate reliably.

## 2. Entity-Relationship & Database Schema Design

All identifiers use UUID. All timestamps are `timestamptz` in UTC. A care recipient has an IANA timezone, used when generating daily schedules and displaying dates. PHI fields should be encrypted at rest by the managed database and access must be audited.

### 2.1 `profiles`

One row per authenticated human account. The Supabase-managed `auth.users` row is the identity source.

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | uuid | PK; FK to `auth.users.id` with cascade delete |
| `display_name` | text | Required |
| `preferred_name` | text | Optional |
| `avatar_url` | text | Optional; validate approved storage host |
| `phone` | text | Optional; normalized E.164 when present |
| `email` | text | Read from Auth or synchronized; unique through Auth |
| `created_at`, `updated_at` | timestamptz | Required defaults |

Indexes: primary key; optional normalized phone index. Do not store passwords.

### 2.2 `user_roles`

Supports one account having more than one role.

| Field | Type | Constraints / Notes |
|---|---|---|
| `user_id` | uuid | FK `profiles.id`, part of PK |
| `role` | text | PK component; enum `elderly`, `family`, `caretaker`, `physician`, `admin` |
| `created_at` | timestamptz | Required |

PK: (`user_id`, `role`). Index by `role`.

### 2.3 `care_recipients`

The patient/care subject represented by the current `mockUserProfile`.

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | uuid | PK |
| `primary_user_id` | uuid | FK `profiles.id`; unique for an independently signed-in senior account, nullable for a managed profile |
| `full_name` | text | Required |
| `preferred_name` | text | Required |
| `date_of_birth` | date | Optional; derive age server-side |
| `blood_type` | text | Optional; controlled value |
| `avatar_url` | text | Optional |
| `address_line1`, `address_line2`, `city`, `region`, `postal_code`, `country` | text | Optional; encrypt or minimize where appropriate |
| `timezone` | text | Required; IANA timezone, default `UTC` |
| `primary_conditions` | text[] | Default empty array |
| `known_allergies` | text[] | Default empty array |
| `status` | text | Required enum `active`, `archived` |
| `created_at`, `updated_at` | timestamptz | Required defaults |

Indexes: `primary_user_id`, status, lower(full_name). One-to-many to medications, dose logs, appointments, notifications, and members.

### 2.4 `care_recipient_memberships`

Many-to-many relationship between authenticated users and care recipients. This replaces the current flat `careCircleMember` model.

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | uuid | PK |
| `care_recipient_id` | uuid | FK `care_recipients.id` |
| `user_id` | uuid | FK `profiles.id`, nullable until invitation is accepted |
| `name` | text | Required invitation/display snapshot |
| `email` | citext | Required |
| `relationship` | text | Enum: `Daughter`, `Son`, `Spouse`, `Primary Caregiver`, `Home Nurse`, `Physician`, `Neighbor` |
| `role` | text | Enum `family`, `caretaker`, `physician` |
| `phone` | text | Optional |
| `is_emergency_contact` | boolean | Default false; at most one primary contact per recipient unless explicitly supported |
| `can_manage_medications` | boolean | Default false; must not grant clinical prescribing privileges |
| `receive_instant_alerts` | boolean | Default true |
| `invite_status` | text | Enum `invited`, `accepted`, `declined`, `revoked` |
| `invited_by`, `accepted_at`, `last_active_at` | uuid/timestamptz | Nullable; audit invitation lifecycle |
| `created_at`, `updated_at` | timestamptz | Required defaults |

Unique constraints: (`care_recipient_id`, `user_id`) when user exists; (`care_recipient_id`, lower(email)). Index recipient, user, status, and emergency flag.

### 2.5 `clinicians` and `facilities`

Normalize recurring doctor and clinic data instead of storing it only inside JSON.

`clinicians`: `id`, `display_name`, `specialty`, `license_region` (optional), `phone`, `email`, `created_at`, `updated_at`.

`facilities`: `id`, `name`, address fields, `phone`, `timezone`, `created_at`, `updated_at`.

These tables are optional for an initial migration but recommended because appointments and medication prescriptions refer to clinicians repeatedly.

### 2.6 `medications`

Represents the current prescription/regimen visible in the medication-management page.

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | uuid | PK |
| `care_recipient_id` | uuid | FK `care_recipients.id` |
| `name` | text | Required |
| `generic_name` | text | Optional |
| `dosage` | text | Required; stored as entered, not interpreted by frontend |
| `form` | text | Required enum `tablet`, `capsule`, `liquid`, `inhaler`, `injection`, `drops`, `topical` |
| `color` | text | Optional validated hex color for UI only |
| `purpose` | text | Required |
| `frequency` | text | Required enum `daily`, `twice_daily`, `three_times_daily`, `four_times_daily`, `weekly`, `as_needed` |
| `with_food` | text | Required enum `before`, `with`, `after`, `anytime` |
| `instructions` | text | Optional; clinician-authored text should be distinguished from user notes |
| `prescribing_clinician_id` | uuid | FK `clinicians.id`, nullable |
| `prescribing_doctor_snapshot` | text | Required during migration; preserves display value |
| `refill_count` | integer | Required, non-negative; define whether this means doses or days |
| `total_quantity` | integer | Required, non-negative |
| `active` | boolean | Required default true |
| `start_date`, `end_date` | date | Required start; end nullable and must be >= start |
| `created_by`, `updated_by` | uuid | FK `profiles.id` |
| `created_at`, `updated_at` | timestamptz | Required defaults |
| `version` | integer | Optimistic concurrency counter |

Indexes: (`care_recipient_id`, `active`), lower(name), start/end dates. Soft-delete/archive rather than hard delete if referenced by dose logs.

### 2.7 `medication_schedule_times`

Replaces the frontend `scheduleTimes: string[]` array with queryable schedule rows.

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | uuid | PK |
| `medication_id` | uuid | FK `medications.id` cascade |
| `local_time` | time | Required |
| `days_of_week` | smallint[] | Optional; 0-6, required for weekly schedules |
| `is_active` | boolean | Default true |
| `created_at`, `updated_at` | timestamptz | Required |

Unique: (`medication_id`, `local_time`, `days_of_week`). Index medication and active state.

### 2.8 `dose_logs`

One immutable schedule occurrence plus its status transitions. This powers the dashboard, adherence, notifications, and assistant context.

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | uuid | PK |
| `care_recipient_id` | uuid | FK `care_recipients.id` |
| `medication_id` | uuid | FK `medications.id` |
| `scheduled_date` | date | Required in recipient timezone |
| `scheduled_time` | time | Required local time |
| `status` | text | Enum `pending`, `taken`, `missed`, `snoozed` |
| `taken_at` | timestamptz | Nullable |
| `taken_by` | uuid | FK `profiles.id`, nullable |
| `missed_reason` | text | Nullable |
| `instructions_snapshot` | text | Preserve the instruction at schedule-generation time |
| `dosage_snapshot`, `medication_name_snapshot`, `form_snapshot`, `purpose_snapshot`, `with_food_snapshot` | text | Required display snapshots |
| `created_at`, `updated_at` | timestamptz | Required |

Unique: (`medication_id`, `scheduled_date`, `scheduled_time`). Index (`care_recipient_id`, `scheduled_date`, `status`) and pending reminder lookup. Status updates must be transactional and idempotent.

### 2.9 `appointments`

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | uuid | PK |
| `care_recipient_id` | uuid | FK `care_recipients.id` |
| `clinician_id` | uuid | FK nullable |
| `doctor_name_snapshot` | text | Required for compatibility |
| `specialty` | text | Required |
| `facility_id` | uuid | FK nullable |
| `facility_snapshot`, `address_snapshot` | text | Required/optional snapshots |
| `appointment_date` | date | Required |
| `appointment_time` | time | Required |
| `timezone` | text | Required |
| `notes` | text | Optional |
| `contact_number` | text | Optional |
| `requires_escort` | boolean | Default false |
| `assigned_escort_membership_id` | uuid | FK nullable |
| `status` | text | Enum `upcoming`, `completed`, `rescheduled`, `cancelled` |
| `created_by`, `created_at`, `updated_at` | uuid/timestamptz | Required |

Index recipient/status/date. The “next appointment” query must filter `upcoming` and sort by date/time, not use array position.

### 2.10 `notifications`

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | uuid | PK |
| `care_recipient_id` | uuid | FK |
| `recipient_user_id` | uuid | FK `profiles.id`, nullable for broadcast rows |
| `type` | text | Enum `medication_reminder`, `medication_missed`, `appointment`, `circle_update`, `system`, `emergency` |
| `severity` | text | Enum `urgent`, `warning`, `info`, `success` |
| `title`, `message` | text | Required |
| `action_url`, `action_label` | text | Optional, validate internal routes |
| `is_read` | boolean | Default false |
| `read_at` | timestamptz | Nullable |
| `created_at`, `expires_at` | timestamptz | Required/optional |

Index recipient/user/read/created date. Use an outbox rather than relying on UI state for delivery.

### 2.11 `notification_deliveries`

Tracks email/SMS/in-app delivery and retries: `id`, `notification_id`, `recipient_user_id`, `channel`, `destination`, `provider_message_id`, `status` (`queued`, `sent`, `delivered`, `failed`, `opted_out`), `attempt_count`, `last_error`, `sent_at`, `delivered_at`, `created_at`, `updated_at`. Unique notification/recipient/channel/provider idempotency key.

### 2.12 `emergency_alerts`

Tracks an SOS event independently from ordinary notifications: `id`, `care_recipient_id`, `triggered_by`, `reason`, `status` (`created`, `broadcasting`, `sent`, `acknowledged`, `resolved`, `failed`), `created_at`, `resolved_at`, `resolved_by`. Child delivery rows record each contacted member and acknowledgement.

### 2.13 `user_preferences`

Stores `user_id`, `font_size` (`normal`, `large`, `xlarge`), `active_role`, locale, timezone, notification preferences, SMS consent, email consent, reduced-motion preference, and timestamps. PK: `user_id`.

### 2.14 Assistant and audit tables

- `assistant_conversations`: `id`, `care_recipient_id`, `user_id`, `created_at`, `closed_at`.
- `assistant_messages`: `id`, conversation FK, sender, user message or safe assistant response, intent, model/provider metadata, refusal flag, created_at. Encrypt or redact message content according to retention policy.
- `audit_logs`: `id`, actor user, care recipient, action, entity type/id, before/after JSONB where permitted, request ID, IP hash, user agent hash, created_at. Append-only; restrict access to compliance administrators.

### Relationships

- One `care_recipient` has many medications, schedule times through medications, dose logs, appointments, notifications, memberships, and emergency alerts.
- Profiles and care recipients are many-to-many through `care_recipient_memberships`.
- A medication has many schedule-time rows and dose logs.
- An appointment may reference one clinician, one facility, and one escort membership.
- A notification has many channel delivery attempts.
- Assistant conversations/messages and audit records always reference the authenticated actor and, where relevant, a care recipient.

## 3. API Endpoints & Contract Specification

### 3.1 Common contract

Authenticated API responses use:

```json
{
  "data": {},
  "meta": { "requestId": "uuid", "timestamp": "ISO-8601" }
}
```

Errors use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Readable safe message",
    "fields": { "fieldName": ["Reason"] }
  },
  "meta": { "requestId": "uuid" }
}
```

Never return stack traces, provider secrets, database errors, or hidden PHI. List endpoints support `limit`, `cursor`, `q`, `sort`, and `status` where applicable.

### 3.2 Authentication and current user

| Method & route | Auth | Request | Response |
|---|---|---|---|
| `GET /api/v1/me` | Protected | None | `200 { data: { profile, roles, preferences, careRecipients } }` |
| `POST /api/v1/auth/invite/accept` | Authenticated/invite token | `{ token }` | `200 { data: membership }` |
| `POST /api/v1/auth/logout` | Protected | None | `204` |
| `PATCH /api/v1/me/preferences` | Protected | `{ fontSize, activeRole, locale, timezone, notificationPreferences }` | `200` updated preferences |

Supabase Auth handles signup, login, password reset, magic links, OAuth, refresh, and MFA. If a server-side wrapper is required, it must use secure cookies and never expose service-role credentials.

### 3.3 Care recipients and dashboard

| Method & route | Auth | Request/query | Response |
|---|---|---|---|
| `GET /api/v1/care-recipients` | Protected | Optional `role`, `status`, cursor | `200` accessible recipients |
| `GET /api/v1/care-recipients/:recipientId` | Membership | None | `200` profile plus clinician/contact summaries |
| `PATCH /api/v1/care-recipients/:recipientId` | Recipient or authorized caregiver | Profile fields | `200` updated recipient |
| `GET /api/v1/care-recipients/:recipientId/dashboard` | Membership | `date=YYYY-MM-DD` optional | `200` `{ profile, medications, todaySchedule, adherenceStats, appointments, careCircle, notifications }` |

Dashboard aggregation should return the frontend-compatible names (`preferredName`, `todaySchedule`, `careCircle`) while the database remains normalized.

### 3.4 Medications and doses

| Method & route | Auth | Request/query | Response |
|---|---|---|---|
| `GET /api/v1/care-recipients/:recipientId/medications` | Membership | `q`, `active`, `limit`, `cursor` | `200 { data: Medication[] }` |
| `POST /api/v1/care-recipients/:recipientId/medications` | Recipient or membership with `can_manage_medications` | Name, dosage, form, purpose, frequency, `scheduleTimes`, food requirement, instructions, prescriber, refill values, dates | `201` medication plus schedule times |
| `GET /api/v1/medications/:medicationId` | Membership | None | `200` medication |
| `PATCH /api/v1/medications/:medicationId` | Authorized medication manager | Partial fields plus optional `version` | `200` updated medication |
| `DELETE /api/v1/medications/:medicationId` | Authorized medication manager | None | `204`; archive only |
| `GET /api/v1/care-recipients/:recipientId/doses/today` | Membership | `date`, `timezone` optional | `200 { data: DoseScheduleItem[], meta: adherence }` |
| `POST /api/v1/doses/:doseId/taken` | Recipient/member | Optional `{ takenAt, note, idempotencyKey }` | `200` updated dose and notification summary |
| `POST /api/v1/doses/:doseId/missed` | Recipient/member | `{ reason, idempotencyKey }` | `200` updated dose and escalation status |
| `POST /api/v1/doses/:doseId/snooze` | Recipient/member | `{ until, idempotencyKey }` | `200` updated dose |
| `GET /api/v1/care-recipients/:recipientId/adherence` | Membership | `from`, `to`, `granularity` | `200` daily/weekly/monthly metrics |

Dose mutation endpoints must enforce allowed state transitions, use transactions, use idempotency keys, and calculate adherence from persisted logs rather than trusting client percentages.

### 3.5 Appointments

| Method & route | Auth | Request/query | Response |
|---|---|---|---|
| `GET /api/v1/care-recipients/:recipientId/appointments` | Membership | `status`, `from`, `to`, cursor | `200` appointments sorted by date/time |
| `POST /api/v1/care-recipients/:recipientId/appointments` | Recipient/authorized caregiver | Physician, specialty, facility, address, date, time, timezone, notes, phone, escort | `201` appointment |
| `GET /api/v1/appointments/:appointmentId` | Membership | None | `200` appointment |
| `PATCH /api/v1/appointments/:appointmentId` | Recipient/authorized caregiver | Partial appointment fields plus version | `200` appointment |
| `POST /api/v1/appointments/:appointmentId/cancel` | Recipient/authorized caregiver | `{ reason }` | `200` cancelled appointment |
| `POST /api/v1/appointments/:appointmentId/complete` | Authorized caregiver | None | `200` completed appointment |

Date/time inputs must be validated in the care recipient timezone and converted to UTC for jobs.

### 3.6 Care circle

| Method & route | Auth | Request/query | Response |
|---|---|---|---|
| `GET /api/v1/care-recipients/:recipientId/members` | Membership | None | `200` members with permitted fields |
| `POST /api/v1/care-recipients/:recipientId/members/invite` | Recipient/admin | Name, email, relationship, role, phone, permissions, emergency flag | `201` pending membership; queues invite |
| `POST /api/v1/memberships/:membershipId/accept` | Invitee | Token | `200` accepted membership |
| `PATCH /api/v1/memberships/:membershipId` | Recipient/admin | Permissions, phone, alert preferences, emergency flag | `200` membership |
| `DELETE /api/v1/memberships/:membershipId` | Recipient/admin | None | `204` revoked membership |
| `GET /api/v1/care-recipients/:recipientId/presence` | Membership | None | `200` last-active summaries; never exact location |

Permission changes require audit records and cannot allow a family member to edit clinical orders unless explicitly configured by policy.

### 3.7 Notifications and emergency alerts

| Method & route | Auth | Request/query | Response |
|---|---|---|---|
| `GET /api/v1/care-recipients/:recipientId/notifications` | Membership | `unread`, `limit`, cursor | `200` notification list |
| `POST /api/v1/notifications/:notificationId/read` | Notification recipient | None | `200` notification |
| `POST /api/v1/care-recipients/:recipientId/notifications/read-all` | Notification recipient | None | `204` |
| `POST /api/v1/care-recipients/:recipientId/emergency-alerts` | Recipient/member | `{ reason, channels, idempotencyKey }` | `202` alert with delivery status |
| `GET /api/v1/emergency-alerts/:alertId` | Membership | None | `200` alert and delivery status |
| `POST /api/v1/emergency-alerts/:alertId/acknowledge` | Recipient/member | None | `200` acknowledgement |
| `POST /api/v1/emergency-alerts/:alertId/resolve` | Authorized member | `{ note }` | `200` resolved alert |

An SOS endpoint must return quickly with `202`; provider delivery happens asynchronously. The API must clearly state that it does not replace local emergency services.

### 3.8 Assistant

#### Compatibility endpoint

`POST /api/assistant` remains available for the current frontend.

Authentication: Protected. The request may contain `{ message, context }` for backward compatibility, but the server must ignore `context` for authorization and retrieve all care data from the authenticated session and selected recipient.

Request:

```json
{
  "message": "What pills are left for today?",
  "careRecipientId": "uuid"
}
```

Response must preserve the current shape:

```json
{
  "reply": "You have two pending doses...",
  "suggestedActions": [
    { "label": "View today's doses", "action": "view_meds", "payload": { "route": "/medications" } }
  ]
}
```

Return `200` for a safe assistant response, `400` for malformed input, `401` for unauthenticated requests, `403` for inaccessible recipients, `429` for rate limits, and `503` only when no safe fallback response is available.

#### Versioned endpoint

`POST /api/v1/care-recipients/:recipientId/assistant/messages` accepts `{ conversationId?, message }` and returns `{ data: { conversationId, message, suggestedActions } }`. It must log intent/refusal metadata, not unnecessarily retain raw PHI.

Supported safe intents: pending doses, dose instructions, upcoming appointments, care-circle contacts, notification status, and navigation. Safety intents including diagnosis, changing/stopping medication, double dosing, or interpreting symptoms must return a refusal with clinician/emergency escalation guidance.

### 3.9 Health and operations

- `GET /api/health/live` — public/internal liveness, no secrets.
- `GET /api/health/ready` — internal readiness for database/queue dependencies.
- `POST /api/webhooks/resend` — provider-signed delivery webhook.
- `POST /api/webhooks/twilio` — provider-authenticated delivery/status webhook.
- `POST /api/jobs/generate-doses` — internal cron only, authenticated by `CRON_SECRET`; idempotently creates dose logs.

## 4. Authentication, Authorization & Security

### Authentication strategy

Use Supabase Auth with server-managed secure cookies. The request pipeline should:

1. Resolve the session using `@supabase/ssr`.
2. Reject expired or missing sessions with `401`.
3. Resolve the requested care recipient and active membership.
4. Apply endpoint-specific policy checks.
5. Write an audit event for sensitive reads and all mutations.

Do not place service-role keys in browser code. Use the service-role client only inside isolated jobs/admin operations, with explicit recipient scoping and audit logging.

### RBAC and policy rules

- **Elderly/recipient:** View and confirm own doses; manage own preferences; trigger SOS; manage appointments and medications if enabled by policy.
- **Family member:** View assigned recipient data; call contacts; confirm doses only if membership permits; manage medications only when `can_manage_medications=true`; receive configured notifications.
- **Caretaker/nurse:** View assigned care plans, record dose status, manage medication records when authorized, record appointment updates; no prescription changes without explicit permission.
- **Physician:** View assigned recipient records and clinician notes only within a consented relationship; write prescription instructions through a separate audited workflow if implemented.
- **Admin/compliance:** Operational support with least privilege, break-glass access requiring reason and enhanced audit logging.

RLS policies must be deny-by-default and based on accepted memberships. Every query must constrain by `care_recipient_id`; never trust a client-provided role or recipient ID without checking membership.

### Security hardening

- Zod validation and canonicalization on every input; reject unknown fields for sensitive mutations.
- Parameterized SQL/ORM queries; never interpolate user input into SQL or provider URLs.
- CSRF protection for cookie-authenticated state-changing requests; same-origin checks and CSRF token where required.
- Strict CORS allowlist if any separate origin is introduced; otherwise same-origin only.
- Security headers: CSP, HSTS in production, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and frame protection.
- Rate limits by user/IP/recipient for login, assistant, invitations, SMS, and SOS. Add abuse controls without blocking emergency escalation.
- Encrypt sensitive fields where required, redact PHI from logs, and configure retention/deletion policies.
- Verify Resend/Twilio webhook signatures and make webhook processing idempotent.
- Require explicit SMS/email consent, unsubscribe handling, and quiet hours except for configured urgent alerts.
- Use optimistic concurrency/version checks for medication and appointment edits.
- Never let AI output alter medication data or clinical instructions.
- Configure backups, point-in-time recovery, incident response, access reviews, and dependency scanning.

## 5. State Synchronization, Real-time & WebSockets (If Applicable)

### Initial load and mutation flow

1. `CareProvider` requests `/dashboard` after session resolution.
2. The server returns normalized records mapped to the existing frontend shape.
3. Mutations call the corresponding endpoint with an idempotency key.
4. The server commits the transaction, writes an audit event, enqueues notifications, and returns authoritative state.
5. The frontend replaces or merges local state using the response; localStorage must not be the source of truth for PHI.

### Real-time channels

Use authenticated Supabase Realtime channels:

- `care-recipient:{recipientId}:doses` — dose status changes and adherence changes.
- `care-recipient:{recipientId}:notifications:{userId}` — recipient-specific notifications.
- `care-recipient:{recipientId}:appointments` — appointment create/update/cancel.
- `care-recipient:{recipientId}:members` — invitation, permission, and presence changes.
- `care-recipient:{recipientId}:alerts` — emergency alert status and acknowledgements.

RLS/channel authorization must ensure a member can subscribe only to recipients they are allowed to view. Send minimal event payloads and refetch the authoritative record when needed.

### Background jobs

- Generate daily dose logs from active medications in each recipient timezone; unique constraints make retries safe.
- Send upcoming-dose reminders according to notification preferences.
- Detect overdue/missed doses using a grace period and create one escalation event per dose.
- Send refill reminders when remaining supply crosses a configured threshold.
- Send appointment reminders at configured intervals and update completed/cancelled state.
- Retry provider failures with exponential backoff and dead-letter handling.
- Purge expired assistant content and old delivery payloads according to retention policy.

### Event/outbox pattern

Every notification-worthy transaction writes an outbox row in the same database transaction. A worker claims outbox rows with a lease, sends provider messages, records delivery results, and publishes a Realtime event. This prevents a successful dose mutation from losing its alert because a provider was temporarily unavailable.

## 6. Environment Variables & Configuration

### Application and database

```env
NODE_ENV=development|test|production
NEXT_PUBLIC_APP_URL=http://localhost:3005
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key
DATABASE_URL=postgresql://application-user:password@host:5432/postgres
DIRECT_URL=postgresql://migration-user:password@host:5432/postgres
```

`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, and `DIRECT_URL` must never be exposed to the client. Use a restricted application DB role where possible.

### Auth, security, and jobs

```env
SESSION_COOKIE_NAME=lifora-session
CSRF_SECRET=long-random-secret
ENCRYPTION_KEY=32-byte-key-for-application-field-encryption
CRON_SECRET=long-random-cron-secret
INTERNAL_API_SECRET=internal-service-auth-secret
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Messaging

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=notifications@verified-domain.example
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=server-only-token
TWILIO_MESSAGING_SERVICE_SID=MG...
TWILIO_WEBHOOK_AUTH_TOKEN=...
```

### Assistant and observability

```env
OPENAI_API_KEY=optional-server-only-key
OPENAI_MODEL=optional-approved-model
GEMINI_API_KEY=optional-server-only-key
SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=server-only-token
OTEL_EXPORTER_OTLP_ENDPOINT=https://...
LOG_LEVEL=info
```

### Feature and compliance configuration

```env
ASSISTANT_PROVIDER=rules|openai|gemini
ASSISTANT_MAX_REQUESTS_PER_MINUTE=20
DOSE_REMINDER_GRACE_MINUTES=60
REFILL_WARNING_DAYS=7
PHI_RETENTION_DAYS=3650
ENABLE_SMS_NOTIFICATIONS=false
ENABLE_REALTIME=true
```

Secrets must be stored in the deployment secret manager, rotated regularly, and separately configured for development, staging, and production. `.env.example` may contain names and safe placeholders only.

## 7. Recommended Repository File Structure

```text
lifora/
├── backend-spec.md
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── assistant/
│   │   │   │   └── route.ts                 # Backward-compatible assistant contract
│   │   │   ├── v1/
│   │   │   │   ├── auth/
│   │   │   │   ├── me/
│   │   │   │   ├── care-recipients/
│   │   │   │   │   └── [recipientId]/
│   │   │   │   │       ├── route.ts
│   │   │   │   │       ├── dashboard/route.ts
│   │   │   │   │       ├── medications/route.ts
│   │   │   │   │       ├── doses/today/route.ts
│   │   │   │   │       ├── appointments/route.ts
│   │   │   │   │       ├── members/route.ts
│   │   │   │   │       ├── notifications/route.ts
│   │   │   │   │       ├── emergency-alerts/route.ts
│   │   │   │   │       └── assistant/messages/route.ts
│   │   │   │   ├── medications/[medicationId]/route.ts
│   │   │   │   ├── doses/[doseId]/taken/route.ts
│   │   │   │   ├── doses/[doseId]/missed/route.ts
│   │   │   │   ├── appointments/[appointmentId]/route.ts
│   │   │   │   ├── memberships/[membershipId]/route.ts
│   │   │   │   ├── notifications/[notificationId]/read/route.ts
│   │   │   │   ├── emergency-alerts/[alertId]/route.ts
│   │   │   │   └── health/
│   │   │   └── webhooks/
│   │   │       ├── resend/route.ts
│   │   │       └── twilio/route.ts
│   │   └── jobs/
│   │       └── generate-doses/route.ts
│   ├── server/
│   │   ├── config.ts                         # Zod-validated environment
│   │   ├── auth/
│   │   │   ├── session.ts
│   │   │   ├── permissions.ts
│   │   │   └── rbac.ts
│   │   ├── db/
│   │   │   ├── client.ts
│   │   │   ├── repositories/
│   │   │   └── types.ts
│   │   ├── validation/
│   │   ├── services/
│   │   │   ├── dashboard.service.ts
│   │   │   ├── medication.service.ts
│   │   │   ├── dose.service.ts
│   │   │   ├── appointment.service.ts
│   │   │   ├── care-circle.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── emergency.service.ts
│   │   │   └── assistant.service.ts
│   │   ├── jobs/
│   │   │   ├── outbox.worker.ts
│   │   │   ├── reminder.worker.ts
│   │   │   └── refill.worker.ts
│   │   ├── integrations/
│   │   │   ├── resend.ts
│   │   │   ├── twilio.ts
│   │   │   ├── supabase-realtime.ts
│   │   │   └── ai-provider.ts
│   │   ├── audit/
│   │   └── http/
│   │       ├── errors.ts
│   │       ├── request-id.ts
│   │       └── rate-limit.ts
│   ├── lib/
│   │   └── supabase/
│   │       ├── browser.ts
│   │       └── server.ts
│   └── types/
│       ├── api.ts
│       └── domain.ts
├── supabase/
│   ├── migrations/
│   │   ├── 0001_extensions_and_types.sql
│   │   ├── 0002_profiles_and_recipients.sql
│   │   ├── 0003_medications_and_doses.sql
│   │   ├── 0004_appointments_and_circle.sql
│   │   ├── 0005_notifications_and_audit.sql
│   │   └── 0006_rls_and_functions.sql
│   ├── seed.sql
│   └── functions/
│       ├── generate-doses/
│       └── notify-outbox/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   ├── security/
│   └── e2e/
├── .env.example
├── openapi.yaml
└── package.json
```

The implementation should ship with OpenAPI-generated contracts, database migration tests, RLS policy tests, assistant safety tests, idempotency tests for dose mutations, provider webhook tests, and end-to-end tests covering senior, family, and caretaker permissions.
