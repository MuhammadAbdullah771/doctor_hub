-- =============================================================================
-- Doctor Hub — UPDATE EXISTING DATABASE (safe to re-run)
-- =============================================================================
-- Use this when setup-all.sql fails with "type user_role already exists"
-- or you already ran the schema once.
--
-- Run order in Supabase SQL Editor:
--   1. This file  (update-existing-db.sql)  — creates demo users incl. super admin
--   2. seed-demo-pakistan.sql  (optional sample appointments/data)
--
-- Legacy users like patient2@demo.com are RENAMED to fatima@demo.com (same UUID),
-- NOT deleted — this avoids FK errors with existing appointments.
-- =============================================================================

-- =============================================================================
-- A. Platform settings + super admin policies (00011)
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
-- B. Reviews rating trigger + Realtime (00009) — skip if already exists
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

do $$ begin
  alter publication supabase_realtime add table public.reviews;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.doctors;
exception when duplicate_object then null;
end $$;

-- =============================================================================
-- C. Notifications Realtime + auto-alerts (00010)
-- =============================================================================
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
end $$;

create or replace function public.notify_on_payment_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_name text;
begin
  if tg_op = 'UPDATE' and new.status = 'submitted' and old.status is distinct from 'submitted' then
    insert into public.notifications (user_id, type, title, body, metadata)
    select a.id, 'payment', 'Payment Pending Review', 'A patient submitted a payment screenshot for verification.',
      jsonb_build_object('appointment_id', new.appointment_id, 'payment_id', new.id)
    from public.assistants a;
  end if;

  if tg_op = 'UPDATE' and new.status = 'verified' and old.status is distinct from 'verified' then
    select pr.full_name into v_patient_name from public.profiles pr where pr.id = new.patient_id;
    insert into public.notifications (user_id, type, title, body, metadata)
    values (new.patient_id, 'payment', 'Payment Verified',
      'Your payment has been verified. Your appointment will be confirmed shortly.',
      jsonb_build_object('appointment_id', new.appointment_id, 'payment_id', new.id));
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
    values (new.patient_id, 'appointment', 'Appointment Confirmed',
      'Your appointment is confirmed. Please arrive 10 minutes early.',
      jsonb_build_object('appointment_id', new.id));
  end if;
  if tg_op = 'UPDATE' and new.status = 'completed' and old.status is distinct from 'completed' then
    insert into public.notifications (user_id, type, title, body, metadata)
    values (new.patient_id, 'appointment', 'Visit Completed',
      'Your consultation is complete. You can leave a review from your appointment details.',
      jsonb_build_object('appointment_id', new.id));
  end if;
  return new;
end;
$$;

drop trigger if exists appointments_notify_status on public.appointments;
create trigger appointments_notify_status
after update on public.appointments
for each row execute function public.notify_on_appointment_status_change();

-- =============================================================================
-- D. Helper functions — legacy cleanup & FK-safe demo data purge
-- =============================================================================

create or replace function public.purge_clinical_data(p_user_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_ids is null or coalesce(array_length(p_user_ids, 1), 0) = 0 then
    return;
  end if;

  update public.payments set verified_by = null where verified_by = any(p_user_ids);
  update public.audit_logs set actor_id = null where actor_id = any(p_user_ids);

  delete from public.reviews
  where patient_id = any(p_user_ids) or doctor_id = any(p_user_ids);

  delete from public.medical_history
  where patient_id = any(p_user_ids) or doctor_id = any(p_user_ids);

  delete from public.prescriptions
  where patient_id = any(p_user_ids) or doctor_id = any(p_user_ids);

  delete from public.appointments
  where patient_id = any(p_user_ids) or doctor_id = any(p_user_ids);

  delete from public.notifications where user_id = any(p_user_ids);
end;
$$;

create or replace function public.migrate_legacy_demo_email(
  p_old_email text,
  p_new_email text,
  p_full_name text default null
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_old_id uuid;
  v_new_id uuid;
begin
  select id into v_old_id from auth.users where email = p_old_email;
  if v_old_id is null then
    return;
  end if;

  select id into v_new_id from auth.users where email = p_new_email;

  if v_new_id is not null and v_new_id <> v_old_id then
    perform public.purge_clinical_data(array[v_old_id]);
    delete from auth.users where id = v_old_id;
    return;
  end if;

  update auth.users
  set
    email = p_new_email,
    raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
      || jsonb_build_object('full_name', coalesce(p_full_name, raw_user_meta_data->>'full_name', 'User'))
  where id = v_old_id;

  update public.profiles
  set
    email = p_new_email,
    full_name = coalesce(p_full_name, full_name)
  where id = v_old_id;

  update auth.identities
  set identity_data = jsonb_set(
    coalesce(identity_data, '{}'::jsonb),
    '{email}',
    to_jsonb(p_new_email)
  )
  where user_id = v_old_id and provider = 'email';
end;
$$;

create or replace function public.remove_legacy_demo_accounts()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_demo_ids uuid[] := array[
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003'::uuid,
    'cccccccc-cccc-cccc-cccc-cccccccc0001'::uuid,
    'cccccccc-cccc-cccc-cccc-cccccccc0002'::uuid,
    'cccccccc-cccc-cccc-cccc-cccccccc0003'::uuid
  ];
  v_legacy_emails text[] := array[
    'priya@demo.com', 'patient2@demo.com', 'dr.patel@demo.com', 'dr.sharma@demo.com',
    'dr.kumar@demo.com', 'sarah.mitchell@doctorhub.com', 'rajesh.kumar@doctorhub.com',
    'priya.sharma@doctorhub.com', 'emily.chen@doctorhub.com', 'vikram.singh@doctorhub.com'
  ];
  v_delete_ids uuid[];
begin
  -- Rename legacy demo emails → Pakistan demo emails (keeps UUID + appointments safe)
  perform public.migrate_legacy_demo_email('patient2@demo.com', 'fatima@demo.com', 'Fatima Malik');
  perform public.migrate_legacy_demo_email('priya@demo.com', 'patient@demo.com', 'Ahmed Hassan');
  perform public.migrate_legacy_demo_email('dr.patel@demo.com', 'doctor1@demo.com', 'Dr. Hassan Raza');
  perform public.migrate_legacy_demo_email('dr.sharma@demo.com', 'doctor2@demo.com', 'Dr. Ayesha Malik');
  perform public.migrate_legacy_demo_email('dr.kumar@demo.com', 'doctor3@demo.com', 'Dr. Usman Ali');

  -- Delete remaining legacy accounts that are NOT Pakistan demo UUIDs
  select coalesce(array_agg(u.id), '{}')
  into v_delete_ids
  from auth.users u
  where u.email = any(v_legacy_emails)
    and u.id <> all(v_demo_ids);

  if coalesce(array_length(v_delete_ids, 1), 0) = 0 then
    return;
  end if;

  perform public.purge_clinical_data(v_delete_ids);
  delete from auth.users where id = any(v_delete_ids);
end;
$$;

select public.remove_legacy_demo_accounts();

-- Creates auth.users + profiles if missing; updates role/email/password if present.
create or replace function public.ensure_demo_user(
  p_id uuid,
  p_email text,
  p_password text,
  p_full_name text,
  p_role text,
  p_meta jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_meta jsonb;
  v_role public.user_role;
begin
  v_meta := jsonb_build_object('full_name', p_full_name, 'role', p_role) || p_meta;
  v_role := p_role::public.user_role;

  if exists (select 1 from auth.users where email = p_email and id <> p_id) then
    raise notice 'ensure_demo_user: email % is used by another account; skipping id %', p_email, p_id;
    return;
  end if;

  if not exists (select 1 from auth.users where id = p_id) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      p_id,
      'authenticated',
      'authenticated',
      p_email,
      extensions.crypt(p_password, extensions.gen_salt('bf')),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      v_meta,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      p_id,
      jsonb_build_object('sub', p_id::text, 'email', p_email),
      'email',
      p_id::text,
      now(),
      now(),
      now()
    );
  else
    update auth.users
    set
      email = p_email,
      encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
      raw_user_meta_data = v_meta,
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now()
    where id = p_id;

    update auth.identities
    set
      identity_data = jsonb_build_object('sub', p_id::text, 'email', p_email),
      updated_at = now()
    where user_id = p_id and provider = 'email';

    if not found then
      insert into auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) values (
        gen_random_uuid(),
        p_id,
        jsonb_build_object('sub', p_id::text, 'email', p_email),
        'email',
        p_id::text,
        now(),
        now(),
        now()
      );
    end if;
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (p_id, p_email, p_full_name, v_role)
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role;

  if v_role = 'patient' then
    insert into public.patients (id) values (p_id) on conflict (id) do nothing;
  elsif v_role = 'doctor' then
    insert into public.doctors (id, doctor_type, specialty, consultation_fee)
    values (
      p_id,
      coalesce((p_meta->>'doctor_type')::public.doctor_type, 'allopathic'),
      coalesce(p_meta->>'specialty', 'General Physician'),
      coalesce((p_meta->>'consultation_fee')::numeric, 500)
    )
    on conflict (id) do nothing;
  elsif v_role = 'assistant' then
    insert into public.assistants (id) values (p_id) on conflict (id) do nothing;
  end if;
end;
$$;

-- Backward-compatible alias used by seed scripts
create or replace function public.seed_demo_user(
  p_id uuid,
  p_email text,
  p_password text,
  p_full_name text,
  p_role text,
  p_meta jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  perform public.ensure_demo_user(p_id, p_email, p_password, p_full_name, p_role, p_meta);
end;
$$;

update public.profiles set city = 'Karachi'
where lower(trim(city)) in (
  'mumbai', 'chennai', 'hyderabad', 'kolkata', 'calcutta', 'ahmedabad',
  'surat', 'pune', 'kochi', 'cochin', 'nagpur', 'indore', 'bhopal',
  'visakhapatnam', 'vizag', 'jaipur', 'lucknow', 'kanpur', 'patna'
);

update public.profiles set city = 'Lahore'
where lower(trim(city)) in (
  'delhi', 'new delhi', 'gurgaon', 'gurugram', 'noida', 'faridabad',
  'chandigarh', 'amritsar', 'faisalabad', 'multan'
);

update public.profiles set city = 'Islamabad'
where lower(trim(city)) in (
  'bangalore', 'bengaluru', 'mysore', 'mysuru', 'coimbatore', 'mangalore',
  'rawalpindi', 'peshawar', 'quetta'
);

update public.profiles set city = 'Karachi'
where city is not null
  and lower(trim(city)) not in (
    'karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad',
    'multan', 'peshawar', 'quetta', 'hyderabad', 'sialkot', 'gujranwala'
  )
  and (city ~* '(mumbai|delhi|bangalore|chennai|india)' or phone like '+91%');

update public.clinics set city = 'Karachi'
where lower(trim(city)) in (
  'mumbai', 'chennai', 'hyderabad', 'kolkata', 'calcutta', 'ahmedabad',
  'surat', 'pune', 'kochi', 'nagpur', 'indore', 'bhopal', 'jaipur', 'lucknow'
);

update public.clinics set city = 'Lahore'
where lower(trim(city)) in (
  'delhi', 'new delhi', 'gurgaon', 'gurugram', 'noida', 'chandigarh', 'amritsar'
);

update public.clinics set city = 'Islamabad'
where lower(trim(city)) in ('bangalore', 'bengaluru', 'mysore', 'coimbatore', 'mangalore');

update public.clinics set address = 'Plot 15-C, Phase 2 DHA, Karachi', city = 'Karachi'
where address ~* '(mumbai|marine drive|andheri|colaba|maharashtra|bandra)';

update public.clinics set address = '47-A Main Boulevard, Gulberg III, Lahore', city = 'Lahore'
where address ~* '(delhi|connaught|gurgaon|noida|punjab, india)';

update public.clinics set address = 'Office 12, F-10 Markaz, Islamabad', city = 'Islamabad'
where address ~* '(bangalore|bengaluru|mg road|indiranagar|karnataka|banjara)';

update public.clinics set address = 'Clifton Block 5, Karachi', city = 'Karachi'
where address ~* '(chennai|anna salai|tnagar|tamil)';

update public.clinics set name = replace(name, 'Mumbai', 'Karachi') where name ~* 'mumbai';
update public.clinics set name = replace(name, 'Delhi', 'Lahore') where name ~* 'delhi';
update public.clinics set name = replace(name, 'Bangalore', 'Islamabad') where name ~* 'bangalore';

update public.doctors set bio = replace(bio, 'Mumbai', 'Karachi') where bio ~* 'mumbai';
update public.doctors set bio = replace(bio, 'Delhi', 'Lahore') where bio ~* 'delhi';
update public.doctors set bio = replace(bio, 'Bangalore', 'Islamabad') where bio ~* 'bangalore';

update public.profiles set phone = '+92' || substring(phone from 4) where phone like '+91%';
update public.clinics set phone = '+92' || substring(phone from 4) where phone like '+91%';

update public.doctors set is_verified = true
where id in (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003'
);

-- =============================================================================
-- E. Ensure demo accounts exist (creates super admin in auth + profiles)
-- =============================================================================
select public.ensure_demo_user(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
  'patient@demo.com',
  'Demo@123456',
  'Ahmed Hassan',
  'patient'
);

select public.ensure_demo_user(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
  'fatima@demo.com',
  'Demo@123456',
  'Fatima Malik',
  'patient'
);

select public.ensure_demo_user(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
  'doctor1@demo.com',
  'Demo@123456',
  'Dr. Hassan Raza',
  'doctor',
  '{"doctor_type":"allopathic","specialty":"Cardiologist","consultation_fee":3500}'::jsonb
);

select public.ensure_demo_user(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
  'doctor2@demo.com',
  'Demo@123456',
  'Dr. Ayesha Malik',
  'doctor',
  '{"doctor_type":"allopathic","specialty":"Dermatologist","consultation_fee":2500}'::jsonb
);

select public.ensure_demo_user(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003',
  'doctor3@demo.com',
  'Demo@123456',
  'Dr. Usman Ali',
  'doctor',
  '{"doctor_type":"homeopathic","specialty":"General Physician","consultation_fee":1500}'::jsonb
);

select public.ensure_demo_user(
  'cccccccc-cccc-cccc-cccc-cccccccc0001',
  'assistant@demo.com',
  'Demo@123456',
  'Zainab Ahmed',
  'assistant'
);

select public.ensure_demo_user(
  'cccccccc-cccc-cccc-cccc-cccccccc0002',
  'admin@demo.com',
  'Demo@123456',
  'Platform Admin',
  'admin'
);

select public.ensure_demo_user(
  'cccccccc-cccc-cccc-cccc-cccccccc0003',
  'superadmin@demo.com',
  'Demo@123456',
  'Super Admin',
  'super_admin'
);

-- Force correct roles/emails (safe to re-run)
update public.profiles set role = 'patient'
where id in (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002'
);

update public.profiles set role = 'doctor'
where id in (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003'
);

update public.profiles set role = 'assistant' where id = 'cccccccc-cccc-cccc-cccc-cccccccc0001';
update public.profiles set role = 'admin' where id = 'cccccccc-cccc-cccc-cccc-cccccccc0002';
update public.profiles set role = 'super_admin' where id = 'cccccccc-cccc-cccc-cccc-cccccccc0003';

-- Ensure demo emails match Pakistan accounts
update public.profiles set email = 'patient@demo.com', full_name = 'Ahmed Hassan'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001';
update public.profiles set email = 'fatima@demo.com', full_name = 'Fatima Malik'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002';
update public.profiles set email = 'doctor1@demo.com', full_name = 'Dr. Hassan Raza'
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001';
update public.profiles set email = 'doctor2@demo.com', full_name = 'Dr. Ayesha Malik'
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002';
update public.profiles set email = 'doctor3@demo.com', full_name = 'Dr. Usman Ali'
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003';
update public.profiles set email = 'assistant@demo.com', full_name = 'Zainab Ahmed'
where id = 'cccccccc-cccc-cccc-cccc-cccccccc0001';
update public.profiles set email = 'admin@demo.com', full_name = 'Platform Admin'
where id = 'cccccccc-cccc-cccc-cccc-cccccccc0002';
update public.profiles set email = 'superadmin@demo.com', full_name = 'Super Admin'
where id = 'cccccccc-cccc-cccc-cccc-cccccccc0003';

update auth.users set email = 'patient@demo.com' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001';
update auth.users set email = 'fatima@demo.com' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002';
update auth.users set email = 'doctor1@demo.com' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001';
update auth.users set email = 'doctor2@demo.com' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002';
update auth.users set email = 'doctor3@demo.com' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003';
update auth.users set email = 'assistant@demo.com' where id = 'cccccccc-cccc-cccc-cccc-cccccccc0001';
update auth.users set email = 'admin@demo.com' where id = 'cccccccc-cccc-cccc-cccc-cccccccc0002';
update auth.users set email = 'superadmin@demo.com' where id = 'cccccccc-cccc-cccc-cccc-cccccccc0003';

-- Verify admin + super admin exist (check results panel in SQL Editor)
select id, email, role, full_name
from public.profiles
where email in ('admin@demo.com', 'superadmin@demo.com')
order by email;

-- =============================================================================
-- F. Storage buckets + patient payment upload policy (fixes image uploads)
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('payment-screenshots', 'payment-screenshots', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('medical-reports', 'medical-reports', true, 20971520, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('prescriptions-pdf', 'prescriptions-pdf', true, 10485760, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "avatars_auth_upload" on storage.objects;
create policy "avatars_auth_upload" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_auth_update_own" on storage.objects;
create policy "avatars_auth_update_own" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_auth_delete_own" on storage.objects;
create policy "avatars_auth_delete_own" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "payment_screenshots_public_read" on storage.objects;
create policy "payment_screenshots_public_read" on storage.objects for select using (bucket_id = 'payment-screenshots');

drop policy if exists "payment_screenshots_patient_upload" on storage.objects;
create policy "payment_screenshots_patient_upload" on storage.objects for insert to authenticated
with check (bucket_id = 'payment-screenshots' and public.get_user_role() = 'patient');

drop policy if exists "payment_screenshots_patient_update" on storage.objects;
create policy "payment_screenshots_patient_update" on storage.objects for update to authenticated
using (bucket_id = 'payment-screenshots' and public.get_user_role() = 'patient');

drop policy if exists "medical_reports_public_read" on storage.objects;
create policy "medical_reports_public_read" on storage.objects for select using (bucket_id = 'medical-reports');

drop policy if exists "medical_reports_doctor_upload" on storage.objects;
create policy "medical_reports_doctor_upload" on storage.objects for insert to authenticated
with check (bucket_id = 'medical-reports' and public.get_user_role() in ('doctor', 'admin', 'super_admin'));

drop policy if exists "prescriptions_pdf_public_read" on storage.objects;
create policy "prescriptions_pdf_public_read" on storage.objects for select using (bucket_id = 'prescriptions-pdf');

drop policy if exists "prescriptions_pdf_doctor_upload" on storage.objects;
create policy "prescriptions_pdf_doctor_upload" on storage.objects for insert to authenticated
with check (bucket_id = 'prescriptions-pdf' and public.get_user_role() in ('doctor', 'admin', 'super_admin'));

-- Allow patients to submit payment screenshots (was assistant-only — blocked uploads)
drop policy if exists "payments_update_patient" on public.payments;
create policy "payments_update_patient"
on public.payments for update
using (patient_id = auth.uid() and status in ('pending', 'rejected'))
with check (patient_id = auth.uid() and status = 'submitted');

-- Replace broken external placeholder URLs
update public.payments
set screenshot_url = '/images/payment-screenshot-demo.svg'
where screenshot_url like '%placehold.co%' or screenshot_url like '%placeholder.com%';

-- Normalize full Supabase storage URLs to object paths (more reliable in the app)
update public.payments
set screenshot_url = regexp_replace(screenshot_url, '^.*payment-screenshots/', '')
where screenshot_url like '%payment-screenshots/%'
  and screenshot_url not like '/images/%';

-- =============================================================================
-- G. Super Admin / Admin user management (create, ban, audit)
-- =============================================================================

create or replace function public.admin_set_user_status(
  p_user_id uuid,
  p_is_active boolean
)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_actor_role public.user_role;
  v_target_role public.user_role;
begin
  v_actor_role := public.get_user_role();

  if v_actor_role not in ('admin', 'super_admin') then
    raise exception 'Forbidden: admin access required';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot change your own account status';
  end if;

  select role into v_target_role from public.profiles where id = p_user_id;
  if v_target_role is null then
    raise exception 'User not found';
  end if;

  if v_actor_role = 'admin' and v_target_role in ('admin', 'super_admin') then
    raise exception 'Admins cannot ban or activate admin accounts';
  end if;

  update public.profiles
  set is_active = p_is_active
  where id = p_user_id;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    case when p_is_active then 'user.activated' else 'user.banned' end,
    'profile',
    p_user_id::text,
    jsonb_build_object('is_active', p_is_active, 'target_role', v_target_role)
  );
end;
$$;

create or replace function public.admin_create_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_role public.user_role,
  p_phone text default null,
  p_city text default null,
  p_meta jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_id uuid := gen_random_uuid();
  v_meta jsonb;
begin
  if public.get_user_role() <> 'super_admin' then
    raise exception 'Forbidden: super admin access required';
  end if;

  if p_email is null or trim(p_email) = '' then
    raise exception 'Email is required';
  end if;

  if p_password is null or length(p_password) < 8 then
    raise exception 'Password must be at least 8 characters';
  end if;

  if exists (select 1 from auth.users where lower(email) = lower(trim(p_email))) then
    raise exception 'A user with this email already exists';
  end if;

  v_meta := jsonb_build_object(
    'full_name', p_full_name,
    'role', p_role::text
  ) || coalesce(p_meta, '{}'::jsonb);

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_id,
    'authenticated',
    'authenticated',
    lower(trim(p_email)),
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    v_meta,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(),
    v_id,
    jsonb_build_object('sub', v_id::text, 'email', lower(trim(p_email))),
    'email',
    v_id::text,
    now(),
    now(),
    now()
  );

  update public.profiles
  set
    phone = nullif(trim(p_phone), ''),
    city = nullif(trim(p_city), ''),
    is_active = true
  where id = v_id;

  if p_role = 'doctor' then
    update public.doctors
    set
      specialty = coalesce(p_meta->>'specialty', specialty, 'General Physician'),
      consultation_fee = coalesce((p_meta->>'consultation_fee')::numeric, consultation_fee, 500),
      experience_years = coalesce((p_meta->>'experience_years')::int, experience_years, 0),
      is_verified = coalesce((p_meta->>'is_verified')::boolean, is_verified, false)
    where id = v_id;
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    'user.created',
    'profile',
    v_id::text,
    jsonb_build_object('email', lower(trim(p_email)), 'role', p_role::text, 'full_name', p_full_name)
  );

  return v_id;
end;
$$;

grant execute on function public.admin_set_user_status(uuid, boolean) to authenticated;
grant execute on function public.admin_create_user(text, text, text, public.user_role, text, text, jsonb) to authenticated;

-- =============================================================================
-- H. Payment account details (00013)
-- =============================================================================
alter table public.platform_settings
  add column if not exists payment_bank_name text not null default 'HBL - Habib Bank Limited',
  add column if not exists payment_account_title text not null default 'Doctor Hub Pakistan',
  add column if not exists payment_account_number text not null default '1234-56789012345-6',
  add column if not exists payment_iban text not null default 'PK00HABB1234567890123456',
  add column if not exists payment_jazzcash_number text not null default '0300-1234567',
  add column if not exists payment_easypaisa_number text not null default '0312-7654321',
  add column if not exists payment_instructions text not null default 'Send the exact consultation fee to one of the accounts below. Include your full name in the transfer note, then upload your payment screenshot in the app.';

update public.platform_settings
set
  payment_bank_name = coalesce(nullif(trim(payment_bank_name), ''), 'HBL - Habib Bank Limited'),
  payment_account_title = coalesce(nullif(trim(payment_account_title), ''), 'Doctor Hub Pakistan'),
  payment_account_number = coalesce(nullif(trim(payment_account_number), ''), '1234-56789012345-6'),
  payment_iban = coalesce(nullif(trim(payment_iban), ''), 'PK00HABB1234567890123456'),
  payment_jazzcash_number = coalesce(nullif(trim(payment_jazzcash_number), ''), '0300-1234567'),
  payment_easypaisa_number = coalesce(nullif(trim(payment_easypaisa_number), ''), '0312-7654321'),
  payment_instructions = coalesce(nullif(trim(payment_instructions), ''), 'Send the exact consultation fee to one of the accounts below. Include your full name in the transfer note, then upload your payment screenshot in the app.')
where id = 1;

-- =============================================================================
-- Success! Demo logins (password for all: Demo@123456)
--   admin@demo.com
--   superadmin@demo.com  ← Super Admin role
-- Then run supabase/seed-demo-pakistan.sql for sample appointments/data.
-- =============================================================================
