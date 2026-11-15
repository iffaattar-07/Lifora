# Backend Architecture & Implementation Specification

## 1. Executive Summary & System Overview

### Core Purpose
**LIFORA** is an intelligent, compassionate healthcare and wellness ecosystem designed to bridge elderly individuals, their family members, and professional caretakers. The backend provides a secure, highly reliable, and reactive foundation that:
1. **Synchronizes Medication Regimens & Dosing Schedules**: Manages recurring prescription definitions, generates daily dose schedules, records real-time taken/missed confirmations, and aggregates rolling adherence statistics.
2. **Maintains a Collaborative Care Circle**: Supports role-segregated access (`elderly`, `family`, `caretaker`) around a central care recipient, enabling multi-party visibility, permission gating, and emergency contact registries.
3. **Automates Critical Notifications & Escalations**: Triggers automated, multi-channel alerts (SMS, transactional email via Resend, push notifications) when critical medications are missed or when an elderly user triggers an SOS distress call.
4. **Coordinates Clinical Visits & Escorts**: Manages medical appointments, preparation directives, clinic contacts, and family escort transport assignments.
5. **Powers a Context-Aware Intelligent Care Assistant**: Feeds a live snapshot of prescriptions, daily schedules, physician guidelines, and emergency contacts into an LLM context engine backed by strict clinical safety guardrails (preventing dosage alteration recommendations or unauthorized medical diagnoses).

### Proposed Tech Stack

| Tier / Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Runtime & Framework** | **Node.js (v20+ LTS) with Next.js 15 API Routes / Express / NestJS** | Native compatibility with the existing TypeScript codebase; zero serialization overhead between frontend and backend contracts. |
| **Language** | **TypeScript 5.7+ (Strict Mode)** | End-to-end type safety sharing `src/types/index.ts` across client and server boundaries. |
| **Primary Database** | **PostgreSQL 15+ (via Supabase)** | Relational rigor required for healthcare audit trails, ACID transactions on dose logs, and native support for JSONB (physician/emergency payloads) and UUIDs. |
| **Database Access / ORM** | **Prisma ORM / Supabase Client (@supabase/ssr)** | Type-safe migrations, auto-generated TypeScript queries, connection pooling, and seamless declarative schema synchronization. |
| **Authentication & IAM** | **Supabase Auth (GoTrue) + Row-Level Security (RLS)** | Secure JWT handling, refresh token rotation, multi-factor support, and PostgreSQL-level policy enforcement preventing data leakage between care circles. |
| **Queue & Scheduling** | **Redis + BullMQ (or Supabase pg_cron + Edge Functions)** | Low-latency scheduling for cron-based missed dose detectors (e.g., checking doses at $T + 30\text{min}$), daily dose batch generators, and asynchronous notification workers. |
| **Email Delivery** | **Resend API** | High-deliverability transactional healthcare alerts for missed doses, invitation flows, and daily care digests. |
| **SMS / Voice Fallback** | **Twilio Messaging API** | Instant cellular fallback for SOS emergency events and critical medication warnings for family circles without active web sessions. |
| **AI Orchestration** | **Vercel AI SDK / LangChain + Anthropic Claude 3.5 Sonnet or OpenAI GPT-4o-mini** | Deterministic function-calling, structured JSON outputs, prompt guardrail boundaries, and low-latency streaming responses. |
| **Deployment & Hosting** | **Vercel (Compute / Serverless) + Supabase Managed PostgreSQL** | Instant CI/CD integration, edge-optimized routing, automatic HTTPS, and isolated database connection pooling via PgBouncer. |

---

## 2. Entity-Relationship & Database Schema Design

### Conceptual ER Diagram

```mermaid
erDiagram
    PROFILES ||--o{ MEDICATIONS : "prescribed_for"
    PROFILES ||--o{ DOSE_LOGS : "schedules_and_records"
    PROFILES ||--o{ APPOINTMENTS : "attends"
    PROFILES ||--o{ CARE_CIRCLE_MEMBERS : "care_recipient"
    PROFILES ||--o{ CARE_NOTIFICATIONS : "receives"
    PROFILES ||--o{ ASSISTANT_THREADS : "interacts_with"
    
    MEDICATIONS ||--o{ DOSE_LOGS : "generates"
    CARE_CIRCLE_MEMBERS }o--|| PROFILES : "linked_user_account"
    ASSISTANT_THREADS ||--o{ ASSISTANT_MESSAGES : "contains"
```

---

### Detailed Table Specifications

#### 1. `profiles`
Stores user identity, role classification, and demographic/clinical metadata.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PK**, FK -> `auth.users.id` ON DELETE CASCADE | Matches Supabase Auth user UUID. |
| `role` | `VARCHAR(20)` | NOT NULL, CHECK (`role` IN ('elderly', 'family', 'caretaker')) | Active operational role in the platform. |
| `full_name` | `TEXT` | NOT NULL | Complete legal name (e.g., "Margaret Vance"). |
| `preferred_name` | `TEXT` | NOT NULL | Friendly display name (e.g., "Margaret"). |
| `age` | `INT` | CHECK (`age` >= 0 AND `age` <= 130) | Age in years. |
| `dob` | `DATE` | NULLABLE | Date of birth. |
| `blood_type` | `VARCHAR(10)` | NULLABLE | Blood group (e.g., "O+", "A-", "AB+"). |
| `avatar_url` | `TEXT` | NULLABLE | HTTPS URL to hosted avatar image. |
| `phone` | `VARCHAR(30)` | NULLABLE | Contact telephone number with country code. |
| `address` | `TEXT` | NULLABLE | Primary residential address. |
| `primary_conditions`| `TEXT[]` | NOT NULL DEFAULT '{}' | Array of clinical conditions (e.g., "Hypertension"). |
| `known_allergies` | `TEXT[]` | NOT NULL DEFAULT '{}' | Drug and food allergies (e.g., "Penicillin", "Sulfa"). |
| `emergency_contact` | `JSONB` | NOT NULL DEFAULT '{}'::jsonb | Fallback emergency contact object: `{ name, relationship, phone }`. |
| `primary_physician` | `JSONB` | NOT NULL DEFAULT '{}'::jsonb | Primary clinic details: `{ name, clinic, phone }`. |
| `created_at` | `TIMESTAMPTZ`| NOT NULL DEFAULT NOW() | Record creation timestamp. |
| `updated_at` | `TIMESTAMPTZ`| NOT NULL DEFAULT NOW() | Timestamp of last modification. |

*Indexes:*
- `CREATE INDEX idx_profiles_role ON profiles(role);`
- `CREATE INDEX idx_profiles_phone ON profiles(phone);`

---

#### 2. `medications`
Prescription registry detailing drugs, strengths, intake schedules, and refill logistics.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PK**, DEFAULT `uuid_generate_v4()` | Unique prescription identifier. |
| `user_id` | `UUID` | **FK** -> `profiles.id` ON DELETE CASCADE, NOT NULL | Care recipient owning the prescription. |
| `name` | `TEXT` | NOT NULL | Brand or trade name (e.g., "Lisinopril"). |
| `generic_name` | `TEXT` | NULLABLE | Scientific / generic name (e.g., "Prinivil / Zestril"). |
| `dosage` | `TEXT` | NOT NULL | Strength with units (e.g., "10 mg", "500 mg"). |
| `form` | `VARCHAR(30)` | NOT NULL, CHECK (`form` IN ('tablet', 'capsule', 'liquid', 'inhaler', 'injection', 'drops', 'topical')) | Physical form factor. |
| `color` | `VARCHAR(20)` | DEFAULT '#2E847D' | Hex color token for accessible visual identification. |
| `purpose` | `TEXT` | NOT NULL | Therapeutic goal (e.g., "Blood Pressure Management"). |
| `frequency` | `VARCHAR(30)` | NOT NULL, CHECK (`frequency` IN ('daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'weekly', 'as_needed')) | Prescribed cadence. |
| `schedule_times` | `TEXT[]` | NOT NULL DEFAULT '{"08:00 AM"}' | Daily administration times in 12h or 24h format. |
| `with_food` | `VARCHAR(20)` | NOT NULL, CHECK (`with_food` IN ('before', 'with', 'after', 'anytime')) | Dietary relationship. |
| `instructions` | `TEXT` | NOT NULL DEFAULT '' | Specific patient guidance. |
| `prescribing_doctor`| `TEXT` | NOT NULL DEFAULT '' | Prescribing clinician's name. |
| `refill_count` | `INT` | NOT NULL DEFAULT 0, CHECK (`refill_count` >= 0) | Remaining days of medication on hand. |
| `total_quantity` | `INT` | NOT NULL DEFAULT 30 | Initial count in bottle/dispenser. |
| `active` | `BOOLEAN` | NOT NULL DEFAULT TRUE | Soft flag for current active prescriptions. |
| `start_date` | `DATE` | NOT NULL DEFAULT CURRENT_DATE | Date prescription starts. |
| `end_date` | `DATE` | NULLABLE | Date prescription terminates (if finite). |
| `created_at` | `TIMESTAMPTZ`| NOT NULL DEFAULT NOW() | Timestamp of record creation. |
| `updated_at` | `TIMESTAMPTZ`| NOT NULL DEFAULT NOW() | Timestamp of last modification. |

*Indexes:*
- `CREATE INDEX idx_medications_user_id ON medications(user_id);`
- `CREATE INDEX idx_medications_active ON medications(user_id, active);`

---

#### 3. `dose_logs`
Chronological records of every scheduled dose instance and its administration state.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PK**, DEFAULT `uuid_generate_v4()` | Unique dose schedule instance. |
| `medication_id` | `UUID` | **FK** -> `medications.id` ON DELETE CASCADE, NOT NULL | Parent prescription. |
| `user_id` | `UUID` | **FK** -> `profiles.id` ON DELETE CASCADE, NOT NULL | Care recipient for whom dose is scheduled. |
| `scheduled_date` | `DATE` | NOT NULL | Calendar date (e.g., `2026-11-15`). |
| `scheduled_time` | `TEXT` | NOT NULL | Target time string (e.g., `08:00 AM`). |
| `status` | `VARCHAR(20)` | NOT NULL DEFAULT 'pending', CHECK (`status` IN ('pending', 'taken', 'missed', 'snoozed')) | Dose status. |
| `taken_at` | `TIMESTAMPTZ`| NULLABLE | Exact wall-clock timestamp when taken. |
| `taken_by` | `UUID` | **FK** -> `profiles.id` ON DELETE SET NULL, NULLABLE | User who verified administration. |
| `missed_reason` | `TEXT` | NULLABLE | Justification if marked as missed. |
| `snooze_until` | `TIMESTAMPTZ`| NULLABLE | Timestamp for deferred reminder. |
| `created_at` | `TIMESTAMPTZ`| NOT NULL DEFAULT NOW() | Timestamp when dose slot was generated. |
| `updated_at` | `TIMESTAMPTZ`| NOT NULL DEFAULT NOW() | Timestamp of status change. |

*Indexes:*
- `CREATE INDEX idx_dose_logs_user_date ON dose_logs(user_id, scheduled_date);`
- `CREATE INDEX idx_dose_logs_status ON dose_logs(status);`
- `CREATE UNIQUE INDEX uq_dose_instance ON dose_logs(medication_id, scheduled_date, scheduled_time);`

---

#### 4. `care_circle_members`
Association between a care recipient (elderly user) and their monitoring network.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PK**, DEFAULT `uuid_generate_v4()` | Association record UUID. |
| `elderly_user_id` | `UUID` | **FK** -> `profiles.id` ON DELETE CASCADE, NOT NULL | The patient being cared for. |
| `member_user_id` | `UUID` | **FK** -> `profiles.id` ON DELETE SET NULL, NULLABLE | Auth user account of the family/caretaker. |
| `name` | `TEXT` | NOT NULL | Full name of the member. |
| `relation` | `VARCHAR(40)` | NOT NULL, CHECK (`relation` IN ('Daughter', 'Son', 'Spouse', 'Primary Caregiver', 'Home Nurse', 'Physician', 'Neighbor')) | Relationship to patient. |
| `role` | `VARCHAR(20)` | NOT NULL, CHECK (`role` IN ('family', 'caretaker')) | Operational role. |
| `phone` | `VARCHAR(30)` | NOT NULL | Contact telephone for direct calls & SMS. |
| `email` | `TEXT` | NOT NULL | Email address for alerts and invites. |
| `is_emergency_contact`| `BOOLEAN` | NOT NULL DEFAULT FALSE | Whether this member is primary for SOS calls. |
| `can_manage_meds` | `BOOLEAN` | NOT NULL DEFAULT TRUE | Permission flag allowing write access to prescriptions. |
| `receive_instant_alerts`| `BOOLEAN` | NOT NULL DEFAULT TRUE | Subscribed to critical push/SMS alerts. |
| `avatar_url` | `TEXT` | NULLABLE | Profile picture. |
| `invite_status` | `VARCHAR(20)` | NOT NULL DEFAULT 'accepted', CHECK (`invite_status` IN ('invited', 'accepted', 'declined')) | Onboarding state. |
| `last_active_at` | `TIMESTAMPTZ`| NOT NULL DEFAULT NOW() | Real-time presence indicator. |
| `created_at` | `TIMESTAMPTZ`| NOT NULL DEFAULT NOW() | Link establishment date. |

*Indexes:*
- `CREATE INDEX idx_care_circle_elderly ON care_circle_members(elderly_user_id);`
- `CREATE INDEX idx_care_circle_member_user ON care_circle_members(member_user_id);`
- `CREATE UNIQUE INDEX uq_circle_membership ON care_circle_members(elderly_user_id, email);`

---

#### 5. `appointments`
Clinical visits, checkups, and associated escort logistics.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PK**, DEFAULT `uuid_generate_v4()` | Unique appointment UUID. |
| `user_id` | `UUID` | **FK** -> `profiles.id` ON DELETE CASCADE, NOT NULL | Patient attending appointment. |
| `doctor_name` | `TEXT` | NOT NULL | Physician or specialist name. |
| `specialty` | `TEXT` | NOT NULL | Clinical field (e.g., "Geriatric Cardiology"). |
| `facility` | `TEXT` | NOT NULL | Hospital or clinic building name. |
| `address` | `TEXT` | NOT NULL DEFAULT '' | Physical facility location. |
| `contact_number` | `VARCHAR(30)` | NOT NULL DEFAULT '' | Clinic reception phone number. |
| `appointment_date` | `DATE` | NOT NULL | Date of consultation. |
| `appointment_time` | `TEXT` | NOT NULL | Time string (e.g., "10:30 AM"). |
| `notes` | `TEXT` | NULLABLE | Prep notes (e.g., fasting, medical records). |
| `requires_escort` | `BOOLEAN` | NOT NULL DEFAULT TRUE | Whether physical transport assistance is needed. |
| `assigned_escort` | `TEXT` | NULLABLE | Designated family member or driver. |
| `status` | `VARCHAR(20)` | NOT NULL DEFAULT 'upcoming', CHECK (`status` IN ('upcoming', 'completed', 'rescheduled', 'cancelled')) | State of appointment. |
| `created_at` | `TIMESTAMPTZ`| NOT NULL DEFAULT NOW() | Record creation date. |
| `updated_at` | `TIMESTAMPTZ`| NOT NULL DEFAULT NOW() | Last update date. |

*Indexes:*
- `CREATE INDEX idx_appointments_user_date ON appointments(user_id, appointment_date);`

---

#### 6. `care_notifications`
In-app and broadcast event stream for alerts, reminders, and updates.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PK**, DEFAULT `uuid_generate_v4()` | Notification event UUID. |
| `user_id` | `UUID` | **FK** -> `profiles.id` ON DELETE CASCADE, NOT NULL | Subject care recipient. |
| `type` | `VARCHAR(40)` | NOT NULL, CHECK (`type` IN ('medication_reminder', 'medication_missed', 'appointment', 'circle_update', 'system')) | Domain event category. |
| `severity` | `VARCHAR(20)` | NOT NULL, CHECK (`severity` IN ('urgent', 'warning', 'info', 'success')) | Visual and alert level. |
| `title` | `TEXT` | NOT NULL | High-level header. |
| `message` | `TEXT` | NOT NULL | Descriptive narrative body. |
| `is_read` | `BOOLEAN` | NOT NULL DEFAULT FALSE | Read/unread state. |
| `action_url` | `TEXT` | NULLABLE | Deep link route (e.g., `/medications`). |
| `action_label` | `TEXT` | NULLABLE | Button callout (e.g., "View Dose"). |
| `created_at` | `TIMESTAMPTZ`| NOT NULL DEFAULT NOW() | Emission timestamp. |

*Indexes:*
- `CREATE INDEX idx_notifications_user_unread ON care_notifications(user_id, is_read, created_at DESC);`

---

## 3. API Endpoints & Contract Specification

All JSON responses follow a standardized API envelope:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

---

### Module 1: Authentication & User Profile

#### `POST /api/v1/auth/signup`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123!",
    "fullName": "Margaret Vance",
    "preferredName": "Margaret",
    "role": "elderly",
    "phone": "(503) 555-0192"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "c1f75b92-4f32-4d32-b7e5-1c7b8d8e3a2b",
        "email": "user@example.com",
        "role": "elderly",
        "profile": {
          "fullName": "Margaret Vance",
          "preferredName": "Margaret"
        }
      },
      "session": {
        "accessToken": "eyJhbGciOi...",
        "refreshToken": "v1.MrQ3..."
      }
    }
  }
  ```

#### `GET /api/v1/profile`
- **Auth**: Protected (`Bearer JWT`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "c1f75b92-4f32-4d32-b7e5-1c7b8d8e3a2b",
      "name": "Margaret Vance",
      "preferredName": "Margaret",
      "age": 78,
      "dob": "1948-04-12",
      "bloodType": "O+",
      "role": "elderly",
      "avatar": "https://images.unsplash.com/...",
      "primaryCondition": ["Hypertension", "Type 2 Diabetes (Managed)", "Mild Osteoarthritis"],
      "allergies": ["Penicillin", "Sulfa drugs"],
      "address": "428 Whispering Oaks Lane, Apt 3B, Portland, OR",
      "emergencyContact": {
        "name": "Sarah Vance",
        "relationship": "Daughter",
        "phone": "(503) 555-0192"
      },
      "primaryDoctor": {
        "name": "Dr. Robert Hayes, MD",
        "clinic": "St. Jude Geriatric Health Center",
        "phone": "(503) 555-0144"
      }
    }
  }
  ```

---

### Module 2: Medications Management

#### `GET /api/v1/medications`
- **Auth**: Protected (Elderly or Care Circle member with `can_manage_meds` or read access)
- **Query Params**: `?active=true`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "med-1",
        "name": "Lisinopril",
        "genericName": "Prinivil / Zestril",
        "dosage": "10 mg",
        "form": "tablet",
        "color": "#3B82F6",
        "purpose": "Blood Pressure Management",
        "frequency": "daily",
        "scheduleTimes": ["08:00 AM"],
        "withFood": "with",
        "instructions": "Take 1 tablet every morning with breakfast and water.",
        "prescribingDoctor": "Dr. Robert Hayes",
        "refillCount": 6,
        "totalQuantity": 30,
        "active": true,
        "startDate": "2024-01-15"
      }
    ]
  }
  ```

#### `POST /api/v1/medications`
- **Auth**: Protected (Elderly or Care Circle member with `can_manage_meds = true`)
- **Request Body**:
  ```json
  {
    "name": "Metformin HCl",
    "genericName": "Glucophage",
    "dosage": "500 mg",
    "form": "tablet",
    "color": "#10B981",
    "purpose": "Blood Glucose Regulation",
    "frequency": "twice_daily",
    "scheduleTimes": ["08:00 AM", "07:30 PM"],
    "withFood": "with",
    "instructions": "Take with meals to prevent stomach upset.",
    "prescribingDoctor": "Dr. Anita Lin",
    "refillCount": 14,
    "totalQuantity": 60,
    "startDate": "2026-11-15"
  }
  ```
- **Response (201 Created)**: Returns the newly persisted `Medication` object and automatically triggers dose creation for the current date.

#### `PATCH /api/v1/medications/:id`
- **Auth**: Protected
- **Request Body**: Partial `Medication` object (e.g. `{ "refillCount": 20 }`).
- **Response (200 OK)**: Returns updated medication.

#### `DELETE /api/v1/medications/:id`
- **Auth**: Protected
- **Response (200 OK)**: `{ "success": true, "message": "Medication deactivated and future pending doses removed." }`

---

### Module 3: Daily Dosing & Adherence

#### `GET /api/v1/doses/today`
- **Auth**: Protected
- **Query Params**: `?date=2026-11-15` (Defaults to current server date in user's timezone)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "schedule": [
        {
          "id": "dose-1",
          "medicationId": "med-1",
          "medicationName": "Lisinopril",
          "dosage": "10 mg",
          "form": "tablet",
          "color": "#3B82F6",
          "scheduledTime": "08:00 AM",
          "scheduledDate": "2026-11-15",
          "status": "taken",
          "takenAt": "2026-11-15T08:14:22Z",
          "withFood": "with",
          "instructions": "Take with breakfast & water",
          "purpose": "Blood Pressure"
        },
        {
          "id": "dose-3",
          "medicationId": "med-3",
          "medicationName": "Glucosamine Sulfate",
          "dosage": "750 mg",
          "form": "capsule",
          "color": "#F59E0B",
          "scheduledTime": "01:00 PM",
          "scheduledDate": "2026-11-15",
          "status": "pending",
          "withFood": "after",
          "instructions": "Take after midday lunch",
          "purpose": "Joint Support"
        }
      ],
      "adherence": {
        "todayPercentage": 50,
        "weeklyPercentage": 92,
        "monthlyPercentage": 88,
        "consecutiveStreakDays": 5,
        "totalTakenToday": 1,
        "totalScheduledToday": 2
      }
    }
  }
  ```

#### `POST /api/v1/doses/:id/take`
- **Auth**: Protected (Elderly or Authorized Caregiver)
- **Request Body**:
  ```json
  {
    "takenAt": "2026-11-15T13:02:10Z"
  }
  ```
- **Response (200 OK)**: Updates status to `taken`, logs audit actor (`taken_by`), decrements medication inventory count, checks for streak updates, and dispatches a positive notification.

#### `POST /api/v1/doses/:id/miss`
- **Auth**: Protected
- **Request Body**:
  ```json
  {
    "reason": "Patient felt mildly nauseous"
  }
  ```
- **Response (200 OK)**: Updates status to `missed`, records clinical reasoning, and dispatches an advisory notification to Care Circle members.

---

### Module 4: Family & Care Circle

#### `GET /api/v1/care-circle`
- **Auth**: Protected
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "member-1",
        "name": "Sarah Vance",
        "relation": "Daughter",
        "role": "family",
        "phone": "(503) 555-0192",
        "email": "sarah.vance@example.com",
        "isEmergencyContact": true,
        "canManageMeds": true,
        "receiveInstantAlerts": true,
        "avatarUrl": "https://images.unsplash.com/...",
        "lastActive": "12 minutes ago"
      }
    ]
  }
  ```

#### `POST /api/v1/care-circle/invite`
- **Auth**: Protected (Elderly or Family Admin)
- **Request Body**:
  ```json
  {
    "name": "David Vance",
    "relation": "Son",
    "role": "family",
    "phone": "(503) 555-0163",
    "email": "david.vance@example.com",
    "isEmergencyContact": false,
    "canManageMeds": true,
    "receiveInstantAlerts": true
  }
  ```
- **Response (201 Created)**: Creates member record with `invite_status: 'invited'` and triggers an invitation email via Resend.

#### `POST /api/v1/care-circle/emergency-broadcast`
- **Auth**: Protected
- **Request Body**:
  ```json
  {
    "reason": "Direct SOS button triggered from application banner",
    "latitude": 45.5152,
    "longitude": -122.6784
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "alertId": "urgent-98721",
      "dispatchedSmsCount": 3,
      "dispatchedEmailsCount": 3,
      "timestamp": "2026-11-15T12:05:00Z"
    }
  }
  ```

---

### Module 5: Appointments & Clinical Logistics

#### `GET /api/v1/appointments`
- **Auth**: Protected
- **Query Params**: `?status=upcoming`
- **Response (200 OK)**: Returns list of `Appointment` objects ordered by `appointment_date ASC`.

#### `POST /api/v1/appointments`
- **Auth**: Protected
- **Request Body**:
  ```json
  {
    "doctorName": "Dr. Robert Hayes, MD",
    "specialty": "Geriatric Cardiology",
    "facility": "St. Jude Health & Wellness Pavilion",
    "address": "1100 NW Medical Dr, Suite 304, Portland, OR",
    "date": "2026-11-19",
    "time": "10:30 AM",
    "notes": "Routine blood pressure checkup. Bring pill organizer.",
    "contactNumber": "(503) 555-0144",
    "requiresEscort": true,
    "assignedEscort": "Sarah Vance (Daughter)"
  }
  ```
- **Response (201 Created)**: Returns created appointment record.

---

### Module 6: Context-Aware Intelligent Care Assistant

#### `POST /api/v1/assistant/chat`
- **Auth**: Protected
- **Request Body**:
  ```json
  {
    "message": "What pills do I have left to take today?",
    "stream": false
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "reply": "Margaret, you have 1 medication remaining today: Glucosamine Sulfate (750 mg) scheduled for 1:00 PM after lunch.",
      "suggestedActions": [
        { "label": "I Took This Now", "action": "mark_dose_taken", "payload": { "doseId": "dose-3" } }
      ],
      "contextSnapshot": {
        "pendingDoseCount": 1,
        "nextDoseTime": "01:00 PM",
        "nextAppointmentDate": "2026-11-19"
      }
    }
  }
  ```

---

## 4. Authentication, Authorization & Security

### 1. Authentication Strategy
- **Mechanism**: JSON Web Tokens (JWT) powered by Supabase Auth (or standalone GoTrue instance).
- **Tokens**:
  - `access_token`: Short-lived (15 minutes), digitally signed with `HMAC-SHA256` or `RS256`. Contains `sub` (User UUID), `role` (`elderly`, `family`, `caretaker`), and `aud` (`authenticated`).
  - `refresh_token`: Long-lived (30 days), stored with `HttpOnly`, `SameSite=Lax`, `Secure` cookies. Revocable in PostgreSQL session store.
- **Header Format**: `Authorization: Bearer <access_token>`.

---

### 2. Role-Based Access Control (RBAC) Matrix

| Domain / Resource | Action | Elderly Recipient | Family Member | Professional Caretaker |
| :--- | :--- | :---: | :---: | :---: |
| **Own Profile** | Read / Update | **ALLOW** | **ALLOW** | Read Only |
| **Medications** | View Prescriptions | **ALLOW** | **ALLOW** | **ALLOW** |
| **Medications** | Add / Edit / Delete | **ALLOW** | If `can_manage_meds` | If `can_manage_meds` |
| **Dose Schedules** | Mark Taken / Missed | **ALLOW** | **ALLOW** | **ALLOW** |
| **Care Circle** | View Members | **ALLOW** | **ALLOW** | **ALLOW** |
| **Care Circle** | Invite / Remove | **ALLOW** | **ALLOW** (Admin) | **DENY** |
| **Emergency SOS** | Trigger Alert Broadcast | **ALLOW** | **ALLOW** | **ALLOW** |
| **Appointments** | Create / Reschedule | **ALLOW** | **ALLOW** | **ALLOW** |
| **AI Assistant** | Query Context Engine | **ALLOW** | **ALLOW** | **ALLOW** |

---

### 3. PostgreSQL Row-Level Security (RLS) Implementation

To ensure database-level isolation between care groups:

```sql
-- Enable RLS across healthcare tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 1. Helper function: Returns all elderly user IDs accessible by current auth user
CREATE OR REPLACE FUNCTION public.accessible_elderly_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
    SELECT elderly_user_id 
    FROM public.care_circle_members
    WHERE member_user_id = auth.uid()
    UNION
    SELECT auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Medication Policy: Access only if own medication or in verified Care Circle
CREATE POLICY "Medication Access Policy" 
ON public.medications FOR ALL
USING (user_id IN (SELECT public.accessible_elderly_ids()));

-- 3. Dose Logs Policy: Read & Write for authorized users
CREATE POLICY "Dose Log Access Policy"
ON public.dose_logs FOR ALL
USING (user_id IN (SELECT public.accessible_elderly_ids()));
```

---

### 4. Security Hardening Measures
1. **Clinical AI Guardrails**:
   - The AI Assistant system prompt injects strict medical directives:
     ```text
     CRITICAL MEDICAL SAFEGUARD:
     1. Never advise altering prescribed drug dosages.
     2. Never advise doubling up on missed doses.
     3. Never offer a diagnostic opinion or symptom prognosis.
     4. For any adverse reaction or doubt, direct the patient to their primary physician or emergency contact.
     ```
   - Pre-computation classifier regex flags queries containing terms like `double dose`, `change mg`, `stop pill`, intercepting and returning compliant fallback recommendations before triggering the LLM.
2. **Rate Limiting**:
   - Tiered sliding-window rate limiting via Redis / Upstash:
     - Public Auth Endpoints: 10 requests / minute per IP.
     - Assistant Chat: 20 requests / minute per user.
     - General Core APIs: 120 requests / minute per user.
3. **Data Sanitization & Input Validation**:
   - All inbound payloads validated via **Zod** schemas matching TypeScript interfaces.
   - HTML injection stripped from notes, instructions, and messages using DOMPurify / sanitize-html.
4. **Audit Trail Logging**:
   - Every medication change, dose marking, and emergency trigger writes an immutable record to an `audit_events` table documenting `{ actor_id, target_id, action, ip_address, timestamp }`.

---

## 5. State Synchronization, Real-time & WebSockets

### 1. Real-Time Architecture

```mermaid
flowchart TD
    Client["Next.js Frontend (Senior / Family)"]
    SupabaseRealtime["Supabase Realtime (WebSocket)"]
    PostgresDB[(PostgreSQL Database)]
    CronWorker["Background Cron Worker (BullMQ / pg_cron)"]
    ResendTwilio["Resend Email & Twilio SMS"]

    Client -->|1. Mark Dose Taken / SOS| PostgresDB
    PostgresDB -->|2. WAL Replication| SupabaseRealtime
    SupabaseRealtime -->|3. Broadcast State Change| Client
    
    CronWorker -->|4. Detect Missed Dose (T + 30m)| PostgresDB
    PostgresDB -->|5. Insert Notification Event| PostgresDB
    CronWorker -->|6. Trigger Escalation| ResendTwilio
```

### 2. Automated Background Jobs

#### Job A: Daily Dose Generation (`00:01 AM User Local Time`)
- **Worker**: `generateDailyDoseSlots`
- **Schedule**: Cron `1 0 * * *`
- **Logic**:
  1. Iterates over active prescriptions in `medications` where `active = TRUE` and current date is between `start_date` and `end_date`.
  2. For each time in `schedule_times`, verifies no duplicate exists and inserts a `dose_logs` row with status `pending`.

#### Job B: Missed Dose Evaluation Engine (`Every 10 Minutes`)
- **Worker**: `evaluateMissedDoses`
- **Schedule**: Cron `*/10 * * * *`
- **Logic**:
  1. Queries all `dose_logs` where `status = 'pending'`, `scheduled_date = CURRENT_DATE`, and `scheduled_time < NOW() - INTERVAL '30 MINUTES'`.
  2. Transitions status from `pending` -> `missed`.
  3. Inserts an urgent notification in `care_notifications`.
  4. Triggers `sendCareNotificationEmail` to Care Circle members with `receive_instant_alerts = TRUE`.
  5. If flagged as high-risk cardiac/diabetic medication, sends Twilio SMS to primary emergency contact.

#### Job C: Low-Supply Refill Monitor (`Daily at 08:00 AM`)
- **Worker**: `checkPrescriptionRefills`
- **Logic**: Identifies medications where `refill_count <= 7`. Emits warning notification to Care Circle to order pharmacy replenishment.

---

## 6. Environment Variables & Configuration

Below is the definitive environment variable matrix required for production deployment:

```bash
# ==========================================
# APPLICATION & SERVER
# ==========================================
NODE_ENV=production
PORT=3005
NEXT_PUBLIC_APP_URL=https://lifora.care
API_BASE_URL=https://lifora.care/api/v1

# ==========================================
# DATABASE (PostgreSQL / Supabase)
# ==========================================
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# ==========================================
# AUTHENTICATION & SECURITY
# ==========================================
JWT_SECRET=super-secure-high-entropy-jwt-secret-key-32-chars-min
SESSION_SECRET=super-secure-cookie-encryption-key
CORS_ALLOWED_ORIGINS=https://lifora.care,http://localhost:3005

# ==========================================
# NOTIFICATION SERVICES
# ==========================================
RESEND_API_KEY=re_123456789_abcdefghijk
RESEND_FROM_EMAIL=LIFORA Care Alerts <alerts@lifora.care>

TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+15035550199

# ==========================================
# CACHE & QUEUE (Redis / Upstash)
# ==========================================
REDIS_URL=rediss://default:[PASSWORD]@[HOST].upstash.io:6379

# ==========================================
# INTELLIGENT CARE ASSISTANT (LLM)
# ==========================================
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXX
# Or Anthropic Claude:
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXXXXXX
AI_MODEL_NAME=gpt-4o-mini
```

---

## 7. Recommended Repository File Structure

A clean, modular, production-ready directory tree for the backend service:

```
lifora/
├── prisma/
│   ├── schema.prisma                  # Complete declarative Prisma schema
│   ├── migrations/                    # Versioned SQL migration files
│   └── seed.ts                        # Clinically realistic Margaret Vance seed script
│
├── src/
│   ├── app/                           # Next.js 15 App Router presentation & APIs
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth/              # Signup, login, refresh, session routes
│   │   │   │   │   ├── login/route.ts
│   │   │   │   │   └── signup/route.ts
│   │   │   │   ├── medications/       # CRUD endpoints for prescriptions
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/route.ts
│   │   │   │   ├── doses/             # Dosing logs, mark taken/missed endpoints
│   │   │   │   │   ├── today/route.ts
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── take/route.ts
│   │   │   │   │       └── miss/route.ts
│   │   │   │   ├── appointments/      # Clinical consultation manager
│   │   │   │   │   └── route.ts
│   │   │   │   ├── care-circle/       # Member management & emergency broadcasts
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── invite/route.ts
│   │   │   │   │   └── emergency-broadcast/route.ts
│   │   │   │   ├── notifications/     # Notification streams and read markers
│   │   │   │   │   └── route.ts
│   │   │   │   └── assistant/         # Context-aware chat with medical safeguards
│   │   │   │       └── chat/route.ts
│   │   │   └── cron/                  # Scheduled background task trigger webhooks
│   │   │       ├── daily-doses/route.ts
│   │   │       └── missed-dose-check/route.ts
│   │   └── (frontend pages & layouts)
│   │
│   ├── server/                        # Encapsulated backend business logic
│   │   ├── services/                  # Domain services
│   │   │   ├── medication.service.ts  # Medication business rules & refills
│   │   │   ├── dose.service.ts        # Dose evaluation & streak calculations
│   │   │   ├── notification.service.ts# Multi-channel routing (Email, SMS, Push)
│   │   │   ├── appointment.service.ts # Scheduling & escort coordination
│   │   │   └── assistant.service.ts   # LLM orchestration & medical safeguards
│   │   ├── repositories/              # Direct database abstraction layer
│   │   │   ├── medication.repo.ts
│   │   │   ├── dose.repo.ts
│   │   │   └── user.repo.ts
│   │   ├── security/                  # RBAC, rate-limiting & validation guardrails
│   │   │   ├── rbac.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── medicalGuardrails.ts
│   │   └── jobs/                      # BullMQ / Queue definitions
│   │       ├── queue.ts
│   │       └── workers/
│   │           ├── missedDoseWorker.ts
│   │           └── reminderWorker.ts
│   │
│   ├── lib/                           # Shared infrastructure clients
│   │   ├── db.ts                      # Prisma client singleton
│   │   ├── supabase/                  # Supabase clients & raw SQL schemas
│   │   ├── email/                     # Resend API email templates
│   │   │   ├── resend.ts
│   │   │   └── templates/
│   │   │       ├── MissedDoseAlert.tsx
│   │   │       └── CareInvite.tsx
│   │   ├── sms/                       # Twilio SMS client
│   │   │   └── twilio.ts
│   │   └── utils.ts
│   │
│   └── types/                         # Shared TypeScript definitions
│       ├── index.ts                   # Core domain types
│       └── api.ts                     # API request/response contracts
│
├── tests/                             # Automated testing suites
│   ├── unit/                          # Business logic & safeguard unit tests
│   │   └── medicalGuardrails.test.ts
│   └── integration/                   # API endpoint integration tests
│       ├── medications.test.ts
│       └── doses.test.ts
│
├── .env.example                       # Verified environment template
├── backend-spec.md                    # This architecture specification
├── tsconfig.json
└── package.json
```
