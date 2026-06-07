-- Doctor Hub: Clinics, Diseases, Treatments

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
