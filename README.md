# Doctor Hub

Production-ready healthcare consultation platform built with React 19, TypeScript, Vite, Tailwind CSS, ShadCN UI, and Supabase.

## Features (Phase 1–11 Complete)

- Feature-based architecture with clean separation of concerns
- **Pakistan-first** — PKR currency, +92 phones, Karachi/Lahore/Islamabad addresses
- **Supabase-only data layer** — all doctors, appointments, clinics, medical history, and prescriptions stored in PostgreSQL
- Supabase schema with RLS policies (10 migration files)
- Authentication (login, register, forgot/reset password)
- RBAC with 5 roles and protected route guards
- Premium landing page with all sections
- Role-based dashboard layouts (Patient, Doctor, Assistant, Admin, Super Admin)
- **Doctor listing with filters** (disease, specialty, treatment, experience, rating, clinic, city, type)
- **Doctor profile pages** (about, qualifications, clinics, schedule, reviews)
- **Appointment booking** with clinic/date/time slot selection
- **Payment screenshot upload** with drag-and-drop
- **Appointment progress timeline** (pending → payment → verified → confirmed → completed)
- **Patient appointments & payments dashboards**
- **Assistant payment verification** (approve/reject with remarks)
- **Admin payment monitoring** dashboard
- **Medical history** — doctors add records; patients view, search, and download
- **Prescriptions** — doctors create immutable prescriptions; patients view, print, and download
- **Doctor patient list** — manage patients from appointments, add records, prescribe
- **Clinic management** — doctors CRUD clinics; admin monitors all clinics
- **Weekly schedule editor** — per-clinic availability synced to Supabase
- **Doctor appointments calendar** — week view, confirm/complete appointments
- **Realtime reviews** — patients submit after completed visits; live feed on doctor profiles
- **Admin analytics dashboard** — revenue, growth charts, appointment breakdown, top doctors
- **Realtime notifications** — payment/appointment alerts with bell icon in dashboard
- **Admin user & doctor management** pages
- **Super Admin audit logs** — compliance trail at `/dashboard/super-admin/audit-logs`
- **SEO** — Pakistan meta tags, page titles, `robots.txt`, `sitemap.xml`
- Refreshed clean white background theme with improved dark mode
- Dark/light mode, toast notifications, skeleton loaders

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, ShadCN-style UI
- **State:** TanStack Query, React Hook Form, Zod
- **Routing:** React Router v7
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Backend:** Supabase (Auth, PostgreSQL, Storage, RLS)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase (required)

All data lives in Supabase. The app shows a banner if credentials are missing.

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env` and add your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Run the full setup script in the Supabase SQL Editor:

**Existing database** (already ran setup before):

```
supabase/update-existing-db.sql
supabase/seed-demo.sql
```

**Brand new empty project:**

```
supabase/setup-all.sql
supabase/seed-demo.sql
```

**Demo accounts** (password for all: `Demo@123456`):

| Email | Role |
|-------|------|
| `patient@demo.com` | Patient (Karachi) |
| `fatima@demo.com` | Patient (Lahore) |
| `doctor1@demo.com` | Cardiologist (Karachi) |
| `doctor2@demo.com` | Dermatologist (Lahore) |
| `doctor3@demo.com` | General Physician (Islamabad) |
| `assistant@demo.com` | Assistant |
| `admin@demo.com` | Admin |
| `superadmin@demo.com` | Super Admin |

Clinics use real-style Pakistan addresses (DHA Karachi, Gulberg Lahore, F-10 Islamabad). All fees are in **PKR**.

Alternatively, run migrations individually (`00001` … `00010`) plus `seed.sql`.

5. Register additional users via the app. To promote roles, update `profiles.role` in the Supabase Table Editor.

### 3. Start dev server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## Project Structure

```
src/
├── app/           # Providers, query client
├── components/    # Shared UI and common components
├── constants/     # Roles, routes, statuses
├── features/      # Domain modules (auth, doctors, clinics, etc.)
├── hooks/         # Shared React hooks
├── layouts/       # Page layouts and navigation
├── pages/         # Route page components
├── routes/        # Router config and guards
├── services/      # API and storage services
├── store/         # Client state (theme)
├── types/         # TypeScript types
└── utils/         # Helpers
```

## User Roles

| Role | Dashboard Route |
|------|----------------|
| Patient | `/dashboard/patient` |
| Doctor | `/dashboard/doctor` |
| Assistant | `/dashboard/assistant` |
| Admin | `/dashboard/admin` |
| Super Admin | `/dashboard/super-admin` |

### Clinical routes (Phase 8)

| Role | Route | Description |
|------|-------|-------------|
| Patient | `/dashboard/patient/medical-history` | View medical timeline, search records |
| Patient | `/dashboard/patient/prescriptions` | List prescriptions |
| Patient | `/dashboard/patient/prescriptions/:id` | View/print/download prescription |
| Doctor | `/dashboard/doctor/patients` | Patient list from appointments |
| Doctor | `/dashboard/doctor/prescriptions` | List issued prescriptions |
| Doctor | `/dashboard/doctor/prescriptions/new` | Create prescription (`?patientId=&patientName=`) |
| Doctor | `/dashboard/doctor/prescriptions/:id` | View prescription detail |

### Clinic & calendar routes (Phase 9)

| Role | Route | Description |
|------|-------|-------------|
| Doctor | `/dashboard/doctor/appointments` | Weekly calendar, confirm/complete |
| Doctor | `/dashboard/doctor/clinics` | Add, edit, delete clinics |
| Doctor | `/dashboard/doctor/schedule` | Weekly availability per clinic |
| Admin | `/dashboard/admin/clinics` | Monitor all registered clinics |
| Admin | `/dashboard/admin/analytics` | Full platform analytics |

### Notifications & audit (Phase 11)

| Role | Route | Description |
|------|-------|-------------|
| All roles | `.../notifications` | Realtime notification inbox |
| Super Admin | `/dashboard/super-admin/audit-logs` | System audit trail |

## SQL scripts

| File | Purpose |
|------|---------|
| `supabase/setup-all.sql` | Full schema + RLS + storage + realtime (run first) |
| `supabase/seed-demo.sql` | Pakistan demo users, clinics, appointments, PKR data |
| `supabase/seed-demo-pakistan.sql` | Same as `seed-demo.sql` |
| `supabase/migrations/00009_reviews_realtime.sql` | Reviews trigger (included in setup-all) |
| `supabase/migrations/00010_notifications_realtime.sql` | Notification triggers (included in setup-all) |
