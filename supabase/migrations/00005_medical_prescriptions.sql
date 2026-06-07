-- Doctor Hub: Medical History and Prescriptions (immutable records)

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
