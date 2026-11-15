# LIFORA
### Intelligent Elderly Care & Wellness Platform
**Tagline:** *Making every day healthier, together.*

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)

---

## 🌟 Overview

**LIFORA** is a healthcare platform built to connect elderly individuals, their families, and dedicated caretakers. It simplifies medication adherence, appointment coordination, and daily wellness through an intelligent, context-aware digital companion.

### The Problem
Elderly individuals frequently face cognitive and physical friction managing complex multi-drug regimens, remembering doctor visits, and communicating daily status. Meanwhile, family members and home health aides often carry chronic worry due to a lack of real-time visibility into their loved one's day-to-day well-being.

### The LIFORA Solution
LIFORA bridges this gap with:
1. **Senior-Optimized Usability**: Large typography, accessible contrast, voice read-aloud cues, tactile "I Took This" dose confirmation, and dynamic font scale toggles (`A`, `A+`, `A++`).
2. **Synchronized Care Circle**: Real-time family and caretaker visibility with automated SMS/email alerts for missed doses and emergency contacts.
3. **Context-Aware Care Assistant**: An intelligent digital assistant that queries the patient's live schedule, doctor notes, and prescriptions rather than serving as a generic chatbot—while strictly respecting medical safety guardrails.

---

## 🚀 Core Features

### 1. Personalized Dashboard
- **Empathetic Greeting**: Time-aware, personalized greeting reflecting current daily adherence and weather context.
- **Next Dose Highlight**: Prominently highlights the immediate upcoming medication dose with single-click confirmation, pill form/color badges, food instructions, and speech synthesis.
- **Today's Medication Schedule**: Filterable timeline (All, Pending, Taken) with real-time status and celebration confetti upon completing daily doses.
- **Care Adherence Ring**: Visual metrics calculating daily completion rate, 7-day rolling average, and consecutive consistency streaks.
- **Doctor Appointments**: Upcoming clinical visits with escort assignment status and one-touch clinic phone lines.
- **Emergency SOS & Family Circle**: Instant emergency broadcast trigger to designated family members.

### 2. Medication Management (`/medications`)
- Add, edit, filter, and delete active prescriptions.
- Comprehensive tracking: Dosage, form (tablet, capsule, liquid, inhaler), frequency, schedule times, meal requirements (*before/with/after/anytime*), prescribing physician, and remaining refill quantities with low-supply warning tags.

### 3. Family & Care Circle (`/care-circle`)
- Multi-role support: **Senior View** vs. **Family & Caregiver View**.
- Dedicated profiles for children, spouses, home nurses, and physicians.
- Emergency contact prioritization with direct phone links.
- Granular permission flags (*manage medications*, *receive instant missed-dose alerts*).

### 4. Doctor Visits & Transport (`/appointments`)
- Schedule and manage clinical consultations.
- Record facility address, preparation notes (e.g., *fasting rules, bring current medication list*), and assign family escorts for transportation.

### 5. Intelligent Care Assistant (`/assistant`)
- Differentiating context engine connecting user queries directly to live schedule state:
  - *"What pills do I have left for today?"*
  - *"When is my next cardiology visit?"*
  - *"Should I take my medications with food?"*
  - *"Who is my emergency contact?"*
- **Strict Medical Safety Guardrails**: Built-in safeguards prevent medical diagnoses, dosage tampering, or double-dose recommendations, automatically steering the user to their prescribing physician.

---

## 🎨 Design System & Accessibility

LIFORA rejects generic AI templates and repetitive floating bubbles in favor of a calm, compassionate, and trustworthy healthcare aesthetic:

- **Soft Sage Green** (`#69957F`, `#E7EFEA`): Evokes health, calm, and organic healing.
- **Deep Healthcare Teal** (`#134440`, `#17544F`): Anchors clinical trust and legibility.
- **Warm Ivory / Cream** (`#FCFAF7`, `#F8F5EE`): Reduces optical strain compared to harsh stark-white backgrounds.
- **Status Indicators**:
  - Taken: `#16A34A` (Soft Emerald)
  - Pending: `#D97706` (Warm Amber)
  - Missed: `#DC2626` (Gentle Coral)
- **Accessibility Controls**:
  - AAA high-contrast text ratios.
  - Multi-tier font sizing (`Normal`, `Large`, `Extra Large`).
  - Tactile buttons with ample click targets for seniors with motor tremors.
  - Speech synthesis audio read-aloud for dosage instructions and assistant responses.

---

## 🏗️ Technical Architecture

```
lifora/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with CareProvider & accessibility headers
│   │   ├── page.tsx               # Main Intelligent Dashboard
│   │   ├── medications/page.tsx   # Medication Management module
│   │   ├── appointments/page.tsx  # Doctor Appointments & Companion module
│   │   ├── care-circle/page.tsx   # Family & Caregiver Circle module
│   │   ├── assistant/page.tsx     # Context-Aware AI Assistant
│   │   ├── globals.css            # Palette variables & senior accessibility scales
│   │   └── api/
│   │       ├── assistant/route.ts # Context engine & medical safety guardrails
│   │       └── notify/route.ts    # Notification dispatcher
│   ├── components/
│   │   ├── dashboard/             # Greeting, NextDose, Schedule, Adherence, Appointments
│   │   ├── layout/                # Navbar, SOS Banner, Accessibility text toggle
│   │   └── common/                # Buttons, cards, modals
│   ├── context/
│   │   └── CareContext.tsx        # Central reactive state & local storage persistence
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Supabase browser client
│   │   │   ├── server.ts          # Supabase server client
│   │   │   └── schema.sql         # Production PostgreSQL schema with Row Level Security (RLS)
│   │   ├── email/
│   │   │   └── resend.ts          # Resend notification dispatcher
│   │   ├── mockData.ts            # Clinically realistic elder care seed dataset
│   │   └── utils.ts               # Date formatters, clsx & tailwind-merge helper
│   └── types/
│       └── index.ts               # Full TypeScript interface definitions
├── .env.example                   # Environment variable documentation
├── tailwind.config.ts             # Custom palette and typography configuration
└── tsconfig.json
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ (tested with v24.19)
- `pnpm` (recommended) or `npm`

### Installation
```bash
# Clone the repository
git clone https://github.com/iffaattar-07/Lifora.git
cd Lifora

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Run development server
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database & Backend Integration (Supabase)

LIFORA includes a complete, production-ready PostgreSQL schema with Row Level Security (RLS) policies in `src/lib/supabase/schema.sql`.

To link a Supabase project:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard and paste the contents of `src/lib/supabase/schema.sql`.
3. Copy your Project URL and Anon Key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Configure Resend for email notifications:
   ```env
   RESEND_API_KEY=re_your_api_key
   RESEND_FROM_EMAIL=notifications@yourdomain.com
   ```

*Note: In local and preview environments without Supabase credentials, LIFORA automatically falls back to reactive local storage with zero runtime crashes.*

---

## 🛡️ Medical Disclaimer
LIFORA is a care coordination and reminder platform. It does not provide medical diagnoses, treatment plans, or alter clinical prescriptions. Patients and caretakers should always consult licensed healthcare professionals for medical decisions.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
