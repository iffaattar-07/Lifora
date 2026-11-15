# LIFORA - Zero-Cost Production Deployment Guide
### Target Architecture: Vercel (Next.js Serverless) + Supabase (Managed Postgres, Auth & Realtime)

This guide provides step-by-step instructions to deploy **LIFORA** to 100% free-tier online hosting in under 5 minutes. No Docker containers, paid Redis clusters, or persistent VPS instances required.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │             Vercel Edge                │
                      │  Next.js 15 App Router + Serverless   │
                      │  Static Pages + REST API (/api/v1/*)   │
                      └──────────────┬─────────────────────────┘
                                     │
                 ┌───────────────────┼───────────────────┐
                 │                   │                   │
                 ▼                   ▼                   ▼
    ┌─────────────────────────┐ ┌─────────────┐ ┌───────────────────┐
    │     Supabase Managed    │ │ Vercel Cron │ │      Resend       │
    │  PostgreSQL (Database)  │ │  Schedules  │ │   Transactional   │
    │  Auth (JWT Sessions)    │ │ /api/cron/* │ │   Email Alerts    │
    │  Realtime (WebSockets)  │ └─────────────┘ └───────────────────┘
    └─────────────────────────┘
```

---

## 1. Supabase Setup (2 Minutes)

1. **Create Free Project**:
   - Go to [supabase.com](https://supabase.com) and create a new project (e.g. `lifora-prod`).
   - Select the region closest to your target audience.
   - Choose a secure database password and save it.

2. **Retrieve Connection Strings**:
   - Navigate to **Project Settings** -> **Database**.
   - Under **Connection String**, copy:
     - **Transaction Mode (Pooler, port 6543)**: Use this for `DATABASE_URL` (optimized for Vercel Serverless).
     - **Session Mode (Direct, port 5432)**: Use this for `DIRECT_URL` (used by Prisma during migrations).

3. **Retrieve API Keys**:
   - Navigate to **Project Settings** -> **API**:
     - `Project URL`: Set as `NEXT_PUBLIC_SUPABASE_URL`
     - `anon / public`: Set as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` (secret): Set as `SUPABASE_SERVICE_ROLE_KEY`

4. **Run Schema Migration & RLS**:
   Run the Prisma database push command locally to create all tables:
   ```bash
   pnpm prisma db push
   ```
   Next, go to Supabase **SQL Editor** -> **New Query**, paste the contents of `supabase/rls.sql`, and click **Run**. This enables Row Level Security (RLS) and sets up the Realtime replication publication:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE profiles, medications, dose_logs, appointments, care_notifications;
   ```

5. **Seed Hackathon Demo Data**:
   Populate the database with rich clinical data (Margaret Vance, Sarah Vance, prescriptions, dose logs, appointments, and care circle):
   ```bash
   pnpm db:seed
   ```

---

## 2. Vercel Deployment (2 Minutes)

1. **Import Repository**:
   - Go to [vercel.com](https://vercel.com/new).
   - Import your GitHub repository (`Lifora`).
   - Framework Preset: **Next.js**.

2. **Configure Environment Variables**:
   Add the following environment variables in the Vercel dashboard (**Settings** -> **Environment Variables**):

   | Variable Name | Value / Description | Example |
   |---|---|---|
   | `DATABASE_URL` | Supabase Postgres (Transaction Pooler port 6543) | `postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true` |
   | `DIRECT_URL` | Supabase Postgres (Direct Connection port 5432) | `postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres` |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://[REF].supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anonymous key | `eyJhbGciOi...` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase private service role key | `eyJhbGciOi...` |
   | `CRON_SECRET` | 32-character random string | `f83b27e9104ad5c678a90123ef456789` |
   | `RESEND_API_KEY` | Resend API key for alerts (optional) | `re_123456789...` |
   | `RESEND_FROM_EMAIL` | Sender email address | `notifications@lifora.care` |
   | `NEXT_PUBLIC_APP_URL` | Your live Vercel URL | `https://lifora.vercel.app` |

3. **Deploy**:
   - Click **Deploy**. Vercel will build the Next.js frontend, generate serverless API routes, and link Vercel Cron jobs automatically via `vercel.json`.

---

## 3. Automated Background Cron Jobs

LIFORA uses native **Vercel Cron Jobs** declared in `vercel.json`:

- **Daily Dose Slot Generator (`/api/cron/daily-doses`)**:
  - Runs daily at `18:30 UTC` (`30 18 * * *`, 00:00 IST) so the day's dose logs are generated at the start of the day for Indian users.
  - Automatically iterates through all active prescriptions and generates today's dose logs (`pending` status).
- **Missed-Dose Watchdog (`/api/cron/missed-dose-check`)**:
  - Runs daily at `15:30 UTC` (`30 15 * * *`, 21:00 IST) to evaluate overdue doses once per day in the evening for Indian users (Vercel Hobby plan allows at most one cron execution per day per job).
  - Scans for overdue doses past their grace period, marks them missed, and escalates alerts to designated care circle members.

> **Security Note**: Vercel Cron requests automatically pass the `CRON_SECRET` in the `Authorization: Bearer <CRON_SECRET>` header, ensuring cron endpoints cannot be invoked by external parties.

---

## 4. Judge & Demo Verification Checklist

Once deployed, judges can immediately test the following flows:

1. **Role Switcher**:
   - Toggle between **Senior View** (large accessible typography, 1-tap "I Took This" actions, read-aloud TTS, SOS trigger) and **Family & Caregiver View** (clinical adherence breakdown, dose timeline with caregiver audit attribution, appointment manager).
2. **Context-Aware Care Assistant (`/assistant`)**:
   - Ask: *"What pills do I take next?"* -> Assistant identifies today's pending doses from the database.
   - Ask: *"Can I take a double dose?"* -> Assistant triggers the **Clinical Medical Safeguard Filter**, refuses dosage tampering, and recommends calling Dr. Robert Hayes.
   - Ask: *"When is my next doctor visit?"* -> Assistant retrieves upcoming Cardiology appointment with Dr. Robert Hayes.
3. **Emergency SOS Trigger**:
   - Click the **SOS button** on the Senior Dashboard or mobile bar.
   - Dispatches emergency notification, logs compliance audit event, and broadcasts alert across the care circle.
4. **Prescription Management (`/medications`)**:
   - Add a new medication (e.g. *Vitamin D3 2000 IU*). Today's dose slots are generated instantaneously.
   - Mark a dose taken -> Decrements pill inventory and computes real-time adherence.

---

## 5. Troubleshooting & Tips

- **Prisma in Vercel Serverless**:
  Ensure `DATABASE_URL` uses the **Transaction Pooler** (port 6543) with `?pgbouncer=true`. Serverless functions spin up dynamically, and connection pooling prevents exhausting Postgres connection limits.
- **Offline / Local Demo Resilience**:
  If Supabase is not configured or offline during evaluation, LIFORA includes an automatic in-memory mock fallback. Endpoints gracefully return demo data for Margaret and Sarah Vance rather than throwing unhandled 500 errors.
