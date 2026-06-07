-- Doctor Hub: Clinic schedules RLS + prescription medicines policies

alter table public.clinic_schedules enable row level security;

create policy "clinic_schedules_select_all"
on public.clinic_schedules for select
using (true);

create policy "clinic_schedules_manage_doctor"
on public.clinic_schedules for all
using (
  exists (
    select 1 from public.clinics c
    where c.id = clinic_id
    and (
      c.doctor_id = auth.uid()
      or public.get_user_role() in ('admin', 'super_admin')
    )
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
