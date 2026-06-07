-- Doctor Hub: Appointments and Payments

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
