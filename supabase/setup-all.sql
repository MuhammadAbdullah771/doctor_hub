-- =============================================================================
-- Doctor Hub — Full Supabase Setup
-- =============================================================================
-- NEW empty project  → run this entire file once
-- ALREADY has schema → run supabase/update-existing-db.sql instead (avoids errors)
-- =============================================================================

-- =============================================================================
-- 00001 — Enums and Extensions (skip if already created)
-- =============================================================================
create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum (
    'patient', 'doctor', 'assistant', 'admin', 'super_admin'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.doctor_type as enum ('allopathic', 'homeopathic', 'herbal');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.appointment_status as enum (
    'pending', 'payment_submitted', 'verified', 'confirmed', 'completed', 'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'submitted', 'verified', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_type as enum (
    'appointment', 'payment', 'prescription', 'system'
  );
exception when duplicate_object then null;
end $$;

-- =============================================================================
-- 00002 — Profiles and Role Tables
-- =============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  phone text,
  avatar_url text,
  role public.user_role not null default 'patient',
  city text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patients (
  id uuid primary key references public.profiles(id) on delete cascade,
  date_of_birth date,
  gender text,
  blood_group text,
  emergency_contact text
);

create table public.doctors (
  id uuid primary key references public.profiles(id) on delete cascade,
  doctor_type public.doctor_type not null,
  specialty text not null,
  experience_years int not null default 0 check (experience_years >= 0),
  consultation_fee numeric(10,2) not null check (consultation_fee >= 0),
  bio text,
  qualifications jsonb not null default '[]'::jsonb,
  rating_avg numeric(3,2) not null default 0 check (rating_avg >= 0 and rating_avg <= 5),
  rating_count int not null default 0 check (rating_count >= 0),
  is_verified boolean not null default false
);

create table public.assistants (
  id uuid primary key references public.profiles(id) on delete cascade,
  assigned_admin_id uuid references public.profiles(id)
);

create index idx_profiles_role on public.profiles(role);
create index idx_profiles_city on public.profiles(city);
create index idx_profiles_email on public.profiles(email);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role public.user_role;
begin
  user_role := coalesce(
    (new.raw_user_meta_data->>'role')::public.user_role,
    'patient'::public.user_role
  );

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    user_role
  );

  if user_role = 'patient' then
    insert into public.patients (id) values (new.id);
  elsif user_role = 'doctor' then
    insert into public.doctors (id, doctor_type, specialty, consultation_fee)
    values (
      new.id,
      coalesce((new.raw_user_meta_data->>'doctor_type')::public.doctor_type, 'allopathic'),
      coalesce(new.raw_user_meta_data->>'specialty', 'General Physician'),
      coalesce((new.raw_user_meta_data->>'consultation_fee')::numeric, 500)
    );
  elsif user_role = 'assistant' then
    insert into public.assistants (id) values (new.id);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =============================================================================
-- 00003 — Clinics, Diseases, Treatments
-- =============================================================================
create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  name text not null,
  address text not null,
  city text not null,
  phone text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.clinic_schedules (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_duration_minutes int not null default 30 check (slot_duration_minutes > 0),
  is_active boolean not null default true,
  check (end_time > start_time)
);

create table public.diseases (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table public.treatment_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table public.doctor_diseases (
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  disease_id uuid not null references public.diseases(id) on delete cascade,
  primary key (doctor_id, disease_id)
);

create table public.doctor_treatments (
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  treatment_id uuid not null references public.treatment_types(id) on delete cascade,
  primary key (doctor_id, treatment_id)
);

create index idx_clinics_doctor on public.clinics(doctor_id);
create index idx_clinics_city on public.clinics(city);
create index idx_clinic_schedules_clinic on public.clinic_schedules(clinic_id);

-- =============================================================================
-- 00004 — Appointments and Payments
-- =============================================================================
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id),
  doctor_id uuid not null references public.doctors(id),
  clinic_id uuid not null references public.clinics(id),
  appointment_date date not null,
  appointment_time time not null,
  status public.appointment_status not null default 'pending',
  symptoms text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  patient_id uuid not null references public.patients(id),
  amount numeric(10,2) not null check (amount >= 0),
  status public.payment_status not null default 'pending',
  screenshot_url text,
  verified_by uuid references public.assistants(id),
  remarks text,
  submitted_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_appointments_patient on public.appointments(patient_id);
create index idx_appointments_doctor on public.appointments(doctor_id);
create index idx_appointments_status on public.appointments(status);
create index idx_appointments_date on public.appointments(appointment_date);
create index idx_payments_status on public.payments(status);
create index idx_payments_patient on public.payments(patient_id);

create trigger appointments_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- =============================================================================
-- 00005 — Medical History and Prescriptions
-- =============================================================================
create table public.medical_history (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id),
  doctor_id uuid not null references public.doctors(id),
  appointment_id uuid references public.appointments(id),
  title text not null,
  diagnosis text,
  notes text,
  report_urls jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id),
  doctor_id uuid not null references public.doctors(id),
  appointment_id uuid references public.appointments(id),
  diagnosis text,
  instructions text,
  is_finalized boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.prescription_medicines (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references public.prescriptions(id) on delete cascade,
  medicine_name text not null,
  dosage text not null,
  frequency text not null,
  duration text not null,
  instructions text
);

create index idx_medical_history_patient on public.medical_history(patient_id);
create index idx_medical_history_doctor on public.medical_history(doctor_id);
create index idx_prescriptions_patient on public.prescriptions(patient_id);
create index idx_prescriptions_doctor on public.prescriptions(doctor_id);

-- =============================================================================
-- 00006 — Reviews, Notifications, Audit Logs
-- =============================================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  patient_id uuid not null references public.patients(id),
  appointment_id uuid references public.appointments(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (appointment_id, patient_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_reviews_doctor on public.reviews(doctor_id);
create index idx_notifications_user on public.notifications(user_id, is_read);
create index idx_audit_logs_created on public.audit_logs(created_at desc);

-- =============================================================================
-- 00007 — Row Level Security (public tables)
-- =============================================================================
create or replace function public.get_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

alter table public.profiles enable row level security;
create policy "profiles_select_own_or_admin"
on public.profiles for select
using (id = auth.uid() or public.get_user_role() in ('admin', 'super_admin'));
create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid()) with check (id = auth.uid());

alter table public.patients enable row level security;
create policy "patients_select"
on public.patients for select
using (id = auth.uid() or public.get_user_role() in ('doctor', 'admin', 'super_admin'));
create policy "patients_update_own"
on public.patients for update using (id = auth.uid());

alter table public.doctors enable row level security;
create policy "doctors_select_all" on public.doctors for select using (true);
create policy "doctors_update_own" on public.doctors for update using (id = auth.uid());

alter table public.appointments enable row level security;
create policy "appointments_select"
on public.appointments for select
using (
  patient_id = auth.uid()
  or doctor_id = auth.uid()
  or public.get_user_role() in ('assistant', 'admin', 'super_admin')
);
create policy "appointments_insert_patient"
on public.appointments for insert with check (patient_id = auth.uid());
create policy "appointments_update_involved"
on public.appointments for update
using (
  patient_id = auth.uid()
  or doctor_id = auth.uid()
  or public.get_user_role() in ('assistant', 'admin', 'super_admin')
);

alter table public.payments enable row level security;
create policy "payments_select"
on public.payments for select
using (patient_id = auth.uid() or public.get_user_role() in ('assistant', 'admin', 'super_admin'));
create policy "payments_insert_patient"
on public.payments for insert with check (patient_id = auth.uid());
create policy "payments_update_assistant"
on public.payments for update
using (public.get_user_role() in ('assistant', 'admin', 'super_admin'));

create policy "payments_update_patient"
on public.payments for update
using (patient_id = auth.uid() and status in ('pending', 'rejected'))
with check (patient_id = auth.uid() and status = 'submitted');

alter table public.medical_history enable row level security;
create policy "medical_history_select"
on public.medical_history for select
using (
  patient_id = auth.uid()
  or doctor_id = auth.uid()
  or public.get_user_role() in ('admin', 'super_admin')
);
create policy "medical_history_insert_doctor"
on public.medical_history for insert
with check (doctor_id = auth.uid() and public.get_user_role() = 'doctor');

alter table public.prescriptions enable row level security;
create policy "prescriptions_select"
on public.prescriptions for select
using (
  patient_id = auth.uid()
  or doctor_id = auth.uid()
  or public.get_user_role() in ('assistant', 'admin', 'super_admin')
);
create policy "prescriptions_insert_doctor"
on public.prescriptions for insert
with check (doctor_id = auth.uid() and public.get_user_role() = 'doctor');

alter table public.clinics enable row level security;
create policy "clinics_select_all" on public.clinics for select using (true);
create policy "clinics_manage_doctor"
on public.clinics for all
using (doctor_id = auth.uid() or public.get_user_role() in ('admin', 'super_admin'))
with check (doctor_id = auth.uid() or public.get_user_role() in ('admin', 'super_admin'));

alter table public.notifications enable row level security;
create policy "notifications_own"
on public.notifications for all using (user_id = auth.uid());

alter table public.audit_logs enable row level security;
create policy "audit_logs_super_admin"
on public.audit_logs for select using (public.get_user_role() = 'super_admin');
create policy "audit_logs_insert"
on public.audit_logs for insert
with check (public.get_user_role() in ('admin', 'super_admin'));

-- Public read for filter tables
alter table public.diseases enable row level security;
create policy "diseases_select_all" on public.diseases for select using (true);

alter table public.treatment_types enable row level security;
create policy "treatment_types_select_all" on public.treatment_types for select using (true);

alter table public.reviews enable row level security;
create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_patient"
on public.reviews for insert
with check (patient_id = auth.uid() and public.get_user_role() = 'patient');

-- =============================================================================
-- 00008 — Clinic Schedules + Prescription Medicines RLS
-- =============================================================================
alter table public.clinic_schedules enable row level security;
create policy "clinic_schedules_select_all"
on public.clinic_schedules for select using (true);
create policy "clinic_schedules_manage_doctor"
on public.clinic_schedules for all
using (
  exists (
    select 1 from public.clinics c
    where c.id = clinic_id
    and (c.doctor_id = auth.uid() or public.get_user_role() in ('admin', 'super_admin'))
  )
)
with check (
  exists (
    select 1 from public.clinics c
    where c.id = clinic_id
    and (c.doctor_id = auth.uid() or public.get_user_role() in ('admin', 'super_admin'))
  )
);

alter table public.prescription_medicines enable row level security;
create policy "prescription_medicines_select"
on public.prescription_medicines for select
using (
  exists (
    select 1 from public.prescriptions p
    where p.id = prescription_id
    and (
      p.patient_id = auth.uid()
      or p.doctor_id = auth.uid()
      or public.get_user_role() in ('assistant', 'admin', 'super_admin')
    )
  )
);
create policy "prescription_medicines_insert_doctor"
on public.prescription_medicines for insert
with check (
  exists (
    select 1 from public.prescriptions p
    where p.id = prescription_id
    and p.doctor_id = auth.uid()
    and public.get_user_role() = 'doctor'
  )
);

-- =============================================================================
-- SEED — Diseases & treatment types
-- =============================================================================
insert into public.diseases (name, slug) values
  ('Diabetes', 'diabetes'),
  ('Hypertension', 'hypertension'),
  ('Asthma', 'asthma'),
  ('Arthritis', 'arthritis'),
  ('Migraine', 'migraine'),
  ('Skin Allergy', 'skin-allergy'),
  ('Thyroid', 'thyroid'),
  ('Anxiety', 'anxiety')
on conflict (slug) do nothing;

insert into public.treatment_types (name, slug) values
  ('Consultation', 'consultation'),
  ('Follow-up', 'follow-up'),
  ('Lab Review', 'lab-review'),
  ('Therapy Session', 'therapy-session'),
  ('Surgery Consultation', 'surgery-consultation'),
  ('Preventive Care', 'preventive-care')
on conflict (slug) do nothing;

-- =============================================================================
-- STORAGE — Buckets (created by SQL, no dashboard needed)
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'payment-screenshots',
    'payment-screenshots',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'medical-reports',
    'medical-reports',
    true,
    20971520,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  ),
  (
    'prescriptions-pdf',
    'prescriptions-pdf',
    true,
    10485760,
    array['application/pdf']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- =============================================================================
-- STORAGE — Policies
-- =============================================================================

-- Avatars
create policy "avatars_public_read"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "avatars_auth_upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_auth_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_auth_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Payment screenshots (path: {appointmentId}/filename)
create policy "payment_screenshots_public_read"
on storage.objects for select
using (bucket_id = 'payment-screenshots');

create policy "payment_screenshots_patient_upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'payment-screenshots'
  and public.get_user_role() = 'patient'
);

create policy "payment_screenshots_patient_update"
on storage.objects for update to authenticated
using (
  bucket_id = 'payment-screenshots'
  and public.get_user_role() = 'patient'
);

-- Medical reports (path: {patientId}/filename)
create policy "medical_reports_public_read"
on storage.objects for select
using (bucket_id = 'medical-reports');

create policy "medical_reports_doctor_upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'medical-reports'
  and public.get_user_role() in ('doctor', 'admin', 'super_admin')
);

create policy "medical_reports_doctor_delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'medical-reports'
  and public.get_user_role() in ('doctor', 'admin', 'super_admin')
);

-- Prescription PDFs (path: {prescriptionId}/filename)
create policy "prescriptions_pdf_public_read"
on storage.objects for select
using (bucket_id = 'prescriptions-pdf');

create policy "prescriptions_pdf_doctor_upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'prescriptions-pdf'
  and public.get_user_role() in ('doctor', 'admin', 'super_admin')
);

-- =============================================================================
-- 00009 — Review rating trigger + Realtime
-- =============================================================================
create or replace function public.update_doctor_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.doctors
  set
    rating_avg = coalesce((
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where doctor_id = coalesce(new.doctor_id, old.doctor_id)
    ), 0),
    rating_count = (
      select count(*)::int
      from public.reviews
      where doctor_id = coalesce(new.doctor_id, old.doctor_id)
    )
  where id = coalesce(new.doctor_id, old.doctor_id);

  return coalesce(new, old);
end;
$$;

drop trigger if exists reviews_update_doctor_rating on public.reviews;
create trigger reviews_update_doctor_rating
after insert or delete on public.reviews
for each row execute function public.update_doctor_rating();

alter publication supabase_realtime add table public.reviews;
alter publication supabase_realtime add table public.doctors;

-- =============================================================================
-- 00010 — Notifications Realtime + auto-alerts
-- =============================================================================
alter publication supabase_realtime add table public.notifications;

create or replace function public.notify_on_payment_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_doctor_name text;
  v_patient_name text;
begin
  if tg_op = 'UPDATE' and new.status = 'submitted' and old.status is distinct from 'submitted' then
    insert into public.notifications (user_id, type, title, body, metadata)
    select a.id, 'payment', 'Payment Pending Review', 'A patient submitted a payment screenshot for verification.',
      jsonb_build_object('appointment_id', new.appointment_id, 'payment_id', new.id)
    from public.assistants a;
  end if;

  if tg_op = 'UPDATE' and new.status = 'verified' and old.status is distinct from 'verified' then
    select pr.full_name into v_patient_name
    from public.profiles pr where pr.id = new.patient_id;

    insert into public.notifications (user_id, type, title, body, metadata)
    values (
      new.patient_id,
      'payment',
      'Payment Verified',
      'Your payment has been verified. Your appointment will be confirmed shortly.',
      jsonb_build_object('appointment_id', new.appointment_id, 'payment_id', new.id)
    );

    select p.full_name into v_doctor_name
    from public.appointments ap
    join public.profiles p on p.id = ap.doctor_id
    where ap.id = new.appointment_id;

    insert into public.notifications (user_id, type, title, body, metadata)
    select ap.doctor_id, 'appointment', 'Payment Verified',
      coalesce(v_patient_name, 'A patient') || '''s payment was verified.',
      jsonb_build_object('appointment_id', ap.id)
    from public.appointments ap where ap.id = new.appointment_id;
  end if;

  return new;
end;
$$;

drop trigger if exists payments_notify_status on public.payments;
create trigger payments_notify_status
after update on public.payments
for each row execute function public.notify_on_payment_status_change();

create or replace function public.notify_on_appointment_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.status = 'confirmed' and old.status is distinct from 'confirmed' then
    insert into public.notifications (user_id, type, title, body, metadata)
    values (
      new.patient_id,
      'appointment',
      'Appointment Confirmed',
      'Your appointment is confirmed. Please arrive 10 minutes early.',
      jsonb_build_object('appointment_id', new.id)
    );
  end if;

  if tg_op = 'UPDATE' and new.status = 'completed' and old.status is distinct from 'completed' then
    insert into public.notifications (user_id, type, title, body, metadata)
    values (
      new.patient_id,
      'appointment',
      'Visit Completed',
      'Your consultation is complete. You can leave a review from your appointment details.',
      jsonb_build_object('appointment_id', new.id)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists appointments_notify_status on public.appointments;
create trigger appointments_notify_status
after update on public.appointments
for each row execute function public.notify_on_appointment_status_change();

-- =============================================================================
-- 00011 — Platform settings + super admin detail updates
-- =============================================================================
create table if not exists public.platform_settings (
  id int primary key default 1 check (id = 1),
  app_name text not null default 'Doctor Hub',
  country text not null default 'Pakistan',
  locale text not null default 'en-PK',
  currency text not null default 'PKR',
  support_email text not null default 'support@doctorhub.pk',
  support_phone text not null default '+92 21 111 000 456',
  headquarters text not null default 'Clifton, Karachi, Pakistan',
  tagline text not null default 'Your trusted healthcare consultation platform across Pakistan.',
  payment_bank_name text not null default 'HBL - Habib Bank Limited',
  payment_account_title text not null default 'Doctor Hub Pakistan',
  payment_account_number text not null default '1234-56789012345-6',
  payment_iban text not null default 'PK00HABB1234567890123456',
  payment_jazzcash_number text not null default '0300-1234567',
  payment_easypaisa_number text not null default '0312-7654321',
  payment_instructions text not null default 'Send the exact consultation fee to one of the accounts below. Include your full name in the transfer note, then upload your payment screenshot in the app.',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

insert into public.platform_settings (id) values (1)
on conflict (id) do nothing;

alter table public.platform_settings enable row level security;

drop policy if exists "platform_settings_select_all" on public.platform_settings;
create policy "platform_settings_select_all"
on public.platform_settings for select using (true);

drop policy if exists "platform_settings_update_super_admin" on public.platform_settings;
create policy "platform_settings_update_super_admin"
on public.platform_settings for update
using (public.get_user_role() = 'super_admin')
with check (public.get_user_role() = 'super_admin');

drop policy if exists "profiles_update_super_admin" on public.profiles;
create policy "profiles_update_super_admin"
on public.profiles for update
using (public.get_user_role() = 'super_admin')
with check (public.get_user_role() = 'super_admin');

drop policy if exists "doctors_update_super_admin" on public.doctors;
create policy "doctors_update_super_admin"
on public.doctors for update
using (public.get_user_role() = 'super_admin')
with check (public.get_user_role() = 'super_admin');

-- =============================================================================
-- Done. Next steps:
--   1. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env
--   2. Run supabase/seed-demo.sql for Pakistan demo users & sample data
--   3. Demo login: any *@demo.com email with password Demo@123456
-- =============================================================================
