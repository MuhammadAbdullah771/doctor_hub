-- Doctor Hub: Row Level Security Policies

create or replace function public.get_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Profiles
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles for select
using (
  id = auth.uid()
  or public.get_user_role() in ('admin', 'super_admin')
);

create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- Patients
alter table public.patients enable row level security;

create policy "patients_select"
on public.patients for select
using (
  id = auth.uid()
  or public.get_user_role() in ('doctor', 'admin', 'super_admin')
);

create policy "patients_update_own"
on public.patients for update
using (id = auth.uid());

-- Doctors (public read for listing)
alter table public.doctors enable row level security;

create policy "doctors_select_all"
on public.doctors for select
using (true);

create policy "doctors_update_own"
on public.doctors for update
using (id = auth.uid());

-- Appointments
alter table public.appointments enable row level security;

create policy "appointments_select"
on public.appointments for select
using (
  patient_id = auth.uid()
  or doctor_id = auth.uid()
  or public.get_user_role() in ('assistant', 'admin', 'super_admin')
);

create policy "appointments_insert_patient"
on public.appointments for insert
with check (patient_id = auth.uid());

create policy "appointments_update_involved"
on public.appointments for update
using (
  patient_id = auth.uid()
  or doctor_id = auth.uid()
  or public.get_user_role() in ('assistant', 'admin', 'super_admin')
);

-- Payments
alter table public.payments enable row level security;

create policy "payments_select"
on public.payments for select
using (
  patient_id = auth.uid()
  or public.get_user_role() in ('assistant', 'admin', 'super_admin')
);

create policy "payments_insert_patient"
on public.payments for insert
with check (patient_id = auth.uid());

create policy "payments_update_assistant"
on public.payments for update
using (public.get_user_role() in ('assistant', 'admin', 'super_admin'));

-- Medical History: NO DELETE policies (immutable)
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
with check (
  doctor_id = auth.uid()
  and public.get_user_role() = 'doctor'
);

-- Prescriptions: insert only, no update/delete
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
with check (
  doctor_id = auth.uid()
  and public.get_user_role() = 'doctor'
);

-- Clinics
alter table public.clinics enable row level security;

create policy "clinics_select_all"
on public.clinics for select
using (true);

create policy "clinics_manage_doctor"
on public.clinics for all
using (
  doctor_id = auth.uid()
  or public.get_user_role() in ('admin', 'super_admin')
);

-- Notifications
alter table public.notifications enable row level security;

create policy "notifications_own"
on public.notifications for all
using (user_id = auth.uid());

-- Audit logs (super admin only)
alter table public.audit_logs enable row level security;

create policy "audit_logs_super_admin"
on public.audit_logs for select
using (public.get_user_role() = 'super_admin');

create policy "audit_logs_insert"
on public.audit_logs for insert
with check (public.get_user_role() in ('admin', 'super_admin'));

-- Storage buckets (run in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values
--   ('avatars', 'avatars', true),
--   ('payment-screenshots', 'payment-screenshots', false),
--   ('medical-reports', 'medical-reports', false),
--   ('prescriptions-pdf', 'prescriptions-pdf', false);
