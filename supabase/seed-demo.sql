-- =============================================================================
-- Doctor Hub — Demo Data Seed (PAKISTAN)
-- =============================================================================
-- Run AFTER setup-all.sql + migrations 00009 & 00010
--
-- DEMO LOGIN (password for all: Demo@123456)
-- ┌─────────────────────┬────────────────────────┬─────────────────────┐
-- │ Email               │ Role                   │ Name                │
-- ├─────────────────────┼────────────────────────┼─────────────────────┤
-- │ patient@demo.com    │ patient (Karachi)      │ Ahmed Hassan        │
-- │ fatima@demo.com     │ patient (Lahore)       │ Fatima Malik        │
-- │ doctor1@demo.com    │ doctor (Cardiology)    │ Dr. Hassan Raza     │
-- │ doctor2@demo.com    │ doctor (Dermatology)   │ Dr. Ayesha Malik    │
-- │ doctor3@demo.com    │ doctor (General)       │ Dr. Usman Ali       │
-- │ assistant@demo.com  │ assistant              │ Zainab Ahmed        │
-- │ admin@demo.com      │ admin                  │ Platform Admin      │
-- │ superadmin@demo.com │ super_admin            │ Super Admin         │
-- └─────────────────────┴────────────────────────┴─────────────────────┘
-- All fees in PKR. Clinics in Karachi, Lahore & Islamabad.
-- Run AFTER setup-all.sql. If you still see Indian cities, run fix-pakistan-locations.sql first.
-- Run AFTER update-existing-db.sql (or run section 0 below which creates helpers).
-- =============================================================================

-- Helper functions (safe to re-run — same as update-existing-db.sql section D)
create or replace function public.purge_clinical_data(p_user_ids uuid[])
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_user_ids is null or coalesce(array_length(p_user_ids, 1), 0) = 0 then return; end if;
  update public.payments set verified_by = null where verified_by = any(p_user_ids);
  update public.audit_logs set actor_id = null where actor_id = any(p_user_ids);
  delete from public.reviews where patient_id = any(p_user_ids) or doctor_id = any(p_user_ids);
  delete from public.medical_history where patient_id = any(p_user_ids) or doctor_id = any(p_user_ids);
  delete from public.prescriptions where patient_id = any(p_user_ids) or doctor_id = any(p_user_ids);
  delete from public.appointments where patient_id = any(p_user_ids) or doctor_id = any(p_user_ids);
  delete from public.notifications where user_id = any(p_user_ids);
end; $$;

create or replace function public.migrate_legacy_demo_email(p_old_email text, p_new_email text, p_full_name text default null)
returns void language plpgsql security definer set search_path = public, auth as $$
declare v_old_id uuid; v_new_id uuid;
begin
  select id into v_old_id from auth.users where email = p_old_email;
  if v_old_id is null then return; end if;
  select id into v_new_id from auth.users where email = p_new_email;
  if v_new_id is not null and v_new_id <> v_old_id then
    perform public.purge_clinical_data(array[v_old_id]);
    delete from auth.users where id = v_old_id;
    return;
  end if;
  update auth.users set email = p_new_email,
    raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
      || jsonb_build_object('full_name', coalesce(p_full_name, raw_user_meta_data->>'full_name', 'User'))
  where id = v_old_id;
  update public.profiles set email = p_new_email, full_name = coalesce(p_full_name, full_name) where id = v_old_id;
  update auth.identities set identity_data = jsonb_set(coalesce(identity_data, '{}'::jsonb), '{email}', to_jsonb(p_new_email))
  where user_id = v_old_id and provider = 'email';
end; $$;

create or replace function public.remove_legacy_demo_accounts()
returns void language plpgsql security definer set search_path = public, auth as $$
declare
  v_demo_ids uuid[] := array[
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccc0001'::uuid,
    'cccccccc-cccc-cccc-cccc-cccccccc0002'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccc0003'::uuid
  ];
  v_legacy_emails text[] := array[
    'priya@demo.com', 'patient2@demo.com', 'dr.patel@demo.com', 'dr.sharma@demo.com',
    'dr.kumar@demo.com', 'sarah.mitchell@doctorhub.com', 'rajesh.kumar@doctorhub.com',
    'priya.sharma@doctorhub.com', 'emily.chen@doctorhub.com', 'vikram.singh@doctorhub.com'
  ];
  v_delete_ids uuid[];
begin
  perform public.migrate_legacy_demo_email('patient2@demo.com', 'fatima@demo.com', 'Fatima Malik');
  perform public.migrate_legacy_demo_email('priya@demo.com', 'patient@demo.com', 'Ahmed Hassan');
  perform public.migrate_legacy_demo_email('dr.patel@demo.com', 'doctor1@demo.com', 'Dr. Hassan Raza');
  perform public.migrate_legacy_demo_email('dr.sharma@demo.com', 'doctor2@demo.com', 'Dr. Ayesha Malik');
  perform public.migrate_legacy_demo_email('dr.kumar@demo.com', 'doctor3@demo.com', 'Dr. Usman Ali');
  select coalesce(array_agg(u.id), '{}') into v_delete_ids from auth.users u
  where u.email = any(v_legacy_emails) and u.id <> all(v_demo_ids);
  if coalesce(array_length(v_delete_ids, 1), 0) = 0 then return; end if;
  perform public.purge_clinical_data(v_delete_ids);
  delete from auth.users where id = any(v_delete_ids);
end; $$;

-- Quick in-seed location fix (same logic as fix-pakistan-locations.sql)
update public.profiles set city = 'Karachi'
where lower(trim(city)) in ('mumbai','chennai','hyderabad','kolkata','pune','ahmedabad');
update public.profiles set city = 'Lahore'
where lower(trim(city)) in ('delhi','new delhi','gurgaon','noida','chandigarh');
update public.profiles set city = 'Islamabad'
where lower(trim(city)) in ('bangalore','bengaluru','mysore','coimbatore');
update public.clinics set city = 'Karachi'
where lower(trim(city)) in ('mumbai','chennai','hyderabad','kolkata','pune');
update public.clinics set city = 'Lahore'
where lower(trim(city)) in ('delhi','new delhi','gurgaon','noida');
update public.clinics set city = 'Islamabad'
where lower(trim(city)) in ('bangalore','bengaluru');

-- -----------------------------------------------------------------------------
-- 0. Legacy cleanup (requires functions from update-existing-db.sql section D)
--     Migrates patient2→fatima etc. instead of deleting demo UUIDs.
-- -----------------------------------------------------------------------------
select public.remove_legacy_demo_accounts();

-- -----------------------------------------------------------------------------
-- 1. Lookup tables (safe if already seeded)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 2. Helper: create or update auth user + profile (safe to re-run)
-- -----------------------------------------------------------------------------
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
    return;
  end if;

  if not exists (select 1 from auth.users where id = p_id) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', p_id, 'authenticated', 'authenticated', p_email,
      extensions.crypt(p_password, extensions.gen_salt('bf')),
      now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      v_meta, now(), now(), '', '', '', ''
    );

    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), p_id,
      jsonb_build_object('sub', p_id::text, 'email', p_email),
      'email', p_id::text, now(), now(), now()
    );
  else
    update auth.users set
      email = p_email,
      encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
      raw_user_meta_data = v_meta,
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now()
    where id = p_id;

    update auth.identities set
      identity_data = jsonb_build_object('sub', p_id::text, 'email', p_email),
      updated_at = now()
    where user_id = p_id and provider = 'email';
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

-- -----------------------------------------------------------------------------
-- 3. Demo users
-- -----------------------------------------------------------------------------
select public.seed_demo_user(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
  'patient@demo.com',
  'Demo@123456',
  'Ahmed Hassan',
  'patient'
);

select public.seed_demo_user(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
  'fatima@demo.com',
  'Demo@123456',
  'Fatima Malik',
  'patient'
);

select public.seed_demo_user(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
  'doctor1@demo.com',
  'Demo@123456',
  'Dr. Hassan Raza',
  'doctor',
  '{"doctor_type":"allopathic","specialty":"Cardiologist","consultation_fee":3500}'::jsonb
);

select public.seed_demo_user(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
  'doctor2@demo.com',
  'Demo@123456',
  'Dr. Ayesha Malik',
  'doctor',
  '{"doctor_type":"allopathic","specialty":"Dermatologist","consultation_fee":2500}'::jsonb
);

select public.seed_demo_user(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003',
  'doctor3@demo.com',
  'Demo@123456',
  'Dr. Usman Ali',
  'doctor',
  '{"doctor_type":"homeopathic","specialty":"General Physician","consultation_fee":1500}'::jsonb
);

select public.seed_demo_user(
  'cccccccc-cccc-cccc-cccc-cccccccc0001',
  'assistant@demo.com',
  'Demo@123456',
  'Zainab Ahmed',
  'assistant'
);

select public.seed_demo_user(
  'cccccccc-cccc-cccc-cccc-cccccccc0002',
  'admin@demo.com',
  'Demo@123456',
  'Platform Admin',
  'admin'
);

select public.seed_demo_user(
  'cccccccc-cccc-cccc-cccc-cccccccc0003',
  'superadmin@demo.com',
  'Demo@123456',
  'Super Admin',
  'super_admin'
);

-- -----------------------------------------------------------------------------
-- 4. Enrich profiles & doctors
-- -----------------------------------------------------------------------------
update public.profiles set city = 'Karachi', phone = '+92 300 1234567'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001';

update public.profiles set city = 'Lahore', phone = '+92 321 9876543'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002';

update public.profiles set city = 'Karachi', phone = '+92 333 1112233'
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001';

update public.profiles set city = 'Lahore', phone = '+92 345 5566778'
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002';

update public.profiles set city = 'Islamabad', phone = '+92 312 4455667'
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003';

-- Ensure demo roles & emails (fixes wrong role after legacy migrations)
update public.profiles set role = 'patient'
where id in ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002');
update public.profiles set role = 'doctor'
where id in ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003');
update public.profiles set role = 'assistant' where id = 'cccccccc-cccc-cccc-cccc-cccccccc0001';
update public.profiles set role = 'admin' where id = 'cccccccc-cccc-cccc-cccc-cccccccc0002';
update public.profiles set role = 'super_admin' where id = 'cccccccc-cccc-cccc-cccc-cccccccc0003';
update public.profiles set email = 'patient@demo.com', full_name = 'Ahmed Hassan' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001';
update public.profiles set email = 'fatima@demo.com', full_name = 'Fatima Malik' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002';
update public.profiles set email = 'doctor1@demo.com', full_name = 'Dr. Hassan Raza' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001';
update public.profiles set email = 'doctor2@demo.com', full_name = 'Dr. Ayesha Malik' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002';
update public.profiles set email = 'doctor3@demo.com', full_name = 'Dr. Usman Ali' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003';
update public.profiles set email = 'assistant@demo.com', full_name = 'Zainab Ahmed' where id = 'cccccccc-cccc-cccc-cccc-cccccccc0001';
update public.profiles set email = 'admin@demo.com', full_name = 'Platform Admin' where id = 'cccccccc-cccc-cccc-cccc-cccccccc0002';
update public.profiles set email = 'superadmin@demo.com', full_name = 'Super Admin' where id = 'cccccccc-cccc-cccc-cccc-cccccccc0003';

update auth.users set email = 'patient@demo.com' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001';
update auth.users set email = 'fatima@demo.com' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002';
update auth.users set email = 'doctor1@demo.com' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001';
update auth.users set email = 'doctor2@demo.com' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002';
update auth.users set email = 'doctor3@demo.com' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003';
update auth.users set email = 'assistant@demo.com' where id = 'cccccccc-cccc-cccc-cccc-cccccccc0001';
update auth.users set email = 'admin@demo.com' where id = 'cccccccc-cccc-cccc-cccc-cccccccc0002';
update auth.users set email = 'superadmin@demo.com' where id = 'cccccccc-cccc-cccc-cccc-cccccccc0003';

update public.patients set
  date_of_birth = '1990-05-15',
  gender = 'male',
  blood_group = 'B+'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001';

update public.patients set
  date_of_birth = '1995-08-22',
  gender = 'female',
  blood_group = 'O+'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002';

update public.doctors set
  experience_years = 15,
  bio = 'Senior cardiologist at Karachi. Specialist in hypertension, heart disease & preventive cardiac care.',
  qualifications = '["MBBS - Aga Khan University", "FCPS Cardiology - CPSP", "MRCP UK"]'::jsonb,
  is_verified = true
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001';

update public.doctors set
  experience_years = 10,
  bio = 'Leading dermatologist in Lahore. Treats eczema, acne, skin allergies & cosmetic concerns.',
  qualifications = '["MBBS - King Edward Medical University", "FCPS Dermatology - CPSP"]'::jsonb,
  is_verified = true
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002';

update public.doctors set
  experience_years = 8,
  bio = 'General physician in Islamabad with holistic approach to diabetes, thyroid & lifestyle diseases.',
  qualifications = '["MBBS - Rawalpindi Medical University", "DHMS Homeopathy"]'::jsonb,
  is_verified = true
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003';

-- -----------------------------------------------------------------------------
-- 5. Clinics & schedules
-- -----------------------------------------------------------------------------
insert into public.clinics (id, doctor_id, name, address, city, phone, is_primary) values
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001', 'Karachi Heart Institute', 'Plot 15-C, 7th Commercial Street, Phase 2 DHA', 'Karachi', '+92 21 3587 4100', true),
  ('dddddddd-dddd-dddd-dddd-dddddddd0002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001', 'Clifton Cardiac Clinic', 'Block 5, Clifton, near Boat Basin', 'Karachi', '+92 21 3583 2200', false),
  ('dddddddd-dddd-dddd-dddd-dddddddd0003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002', 'Glow Skin Clinic Lahore', '47-A Main Boulevard, Gulberg III', 'Lahore', '+92 42 3578 9100', true),
  ('dddddddd-dddd-dddd-dddd-dddddddd0004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003', 'Health First Islamabad', 'Office 12, F-10 Markaz, Islamabad', 'Islamabad', '+92 51 226 7788', true)
on conflict (id) do nothing;

insert into public.clinic_schedules (id, clinic_id, day_of_week, start_time, end_time, slot_duration_minutes, is_active) values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0001', 'dddddddd-dddd-dddd-dddd-dddddddd0001', 1, '09:00', '13:00', 30, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0002', 'dddddddd-dddd-dddd-dddd-dddddddd0001', 3, '14:00', '18:00', 30, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0003', 'dddddddd-dddd-dddd-dddd-dddddddd0001', 5, '09:00', '12:00', 30, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0004', 'dddddddd-dddd-dddd-dddd-dddddddd0003', 2, '10:00', '16:00', 30, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0005', 'dddddddd-dddd-dddd-dddd-dddddddd0003', 4, '10:00', '16:00', 30, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0006', 'dddddddd-dddd-dddd-dddd-dddddddd0004', 1, '09:00', '17:00', 30, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0007', 'dddddddd-dddd-dddd-dddd-dddddddd0004', 3, '09:00', '17:00', 30, true)
on conflict (id) do nothing;

-- Doctor specialties mapping
insert into public.doctor_diseases (doctor_id, disease_id)
select 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001', id from public.diseases where slug in ('hypertension', 'diabetes')
on conflict do nothing;

insert into public.doctor_diseases (doctor_id, disease_id)
select 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002', id from public.diseases where slug in ('skin-allergy', 'migraine')
on conflict do nothing;

insert into public.doctor_diseases (doctor_id, disease_id)
select 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003', id from public.diseases where slug in ('diabetes', 'thyroid', 'anxiety')
on conflict do nothing;

insert into public.doctor_treatments (doctor_id, treatment_id)
select 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001', id from public.treatment_types where slug in ('consultation', 'follow-up', 'lab-review')
on conflict do nothing;

insert into public.doctor_treatments (doctor_id, treatment_id)
select 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002', id from public.treatment_types where slug in ('consultation', 'preventive-care')
on conflict do nothing;

insert into public.doctor_treatments (doctor_id, treatment_id)
select 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003', id from public.treatment_types where slug in ('consultation', 'follow-up', 'therapy-session')
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- 6. Appointments (various statuses for full workflow demo)
-- Clear old demo appointments first so re-runs never hit FK errors.
-- -----------------------------------------------------------------------------
select public.purge_clinical_data(array[
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001'::uuid,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003'::uuid
]);

insert into public.appointments (
  id, patient_id, doctor_id, clinic_id,
  appointment_date, appointment_time, status, symptoms, notes
) values
  (
    'ffffffff-ffff-ffff-ffff-ffffffffff01',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
    'dddddddd-dddd-dddd-dddd-dddddddd0001',
    current_date + 5,
    '10:00',
    'pending',
    'Chest discomfort and mild breathlessness',
    null
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffff02',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
    'dddddddd-dddd-dddd-dddd-dddddddd0003',
    current_date + 3,
    '11:30',
    'payment_submitted',
    'Persistent skin rash on arms',
    null
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffff03',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003',
    'dddddddd-dddd-dddd-dddd-dddddddd0004',
    current_date + 2,
    '14:00',
    'verified',
    'General fatigue and sleep issues',
    null
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffff04',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
    'dddddddd-dddd-dddd-dddd-dddddddd0001',
    current_date + 1,
    '09:30',
    'confirmed',
    'Follow-up for blood pressure',
    'Patient prefers morning slot'
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffff05',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
    'dddddddd-dddd-dddd-dddd-dddddddd0001',
    current_date - 10,
    '10:30',
    'completed',
    'Routine cardiac checkup',
    'Consultation completed successfully'
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffff06',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003',
    'dddddddd-dddd-dddd-dddd-dddddddd0004',
    current_date - 5,
    '15:00',
    'completed',
    'Thyroid consultation',
    null
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffff07',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
    'dddddddd-dddd-dddd-dddd-dddddddd0003',
    current_date - 14,
    '11:00',
    'completed',
    'Eczema and skin allergy treatment',
    'Prescribed topical treatment plan'
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffff08',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
    'dddddddd-dddd-dddd-dddd-dddddddd0003',
    current_date - 21,
    '16:30',
    'completed',
    'Follow-up for skin rash',
    null
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffff09',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
    'dddddddd-dddd-dddd-dddd-dddddddd0002',
    current_date - 30,
    '09:00',
    'completed',
    'Cardiology second opinion at Clifton clinic',
    null
  )
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 7. Payments
-- -----------------------------------------------------------------------------
insert into public.payments (
  id, appointment_id, patient_id, amount, status,
  screenshot_url, verified_by, remarks, submitted_at, verified_at
) values
  (
    '99999999-9999-9999-9999-999999990001',
    'ffffffff-ffff-ffff-ffff-ffffffffff01',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
    3500,
    'pending',
    null, null, null, null, null
  ),
  (
    '99999999-9999-9999-9999-999999990002',
    'ffffffff-ffff-ffff-ffff-ffffffffff02',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    2500,
    'submitted',
    '/images/payment-screenshot-demo.svg',
    null, null, now() - interval '2 hours', null
  ),
  (
    '99999999-9999-9999-9999-999999990003',
    'ffffffff-ffff-ffff-ffff-ffffffffff03',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
    1500,
    'verified',
    '/images/payment-screenshot-demo.svg',
    'cccccccc-cccc-cccc-cccc-cccccccc0001',
    'Payment verified successfully',
    now() - interval '1 day',
    now() - interval '20 hours'
  ),
  (
    '99999999-9999-9999-9999-999999990004',
    'ffffffff-ffff-ffff-ffff-ffffffffff04',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    3500,
    'verified',
    '/images/payment-screenshot-demo.svg',
    'cccccccc-cccc-cccc-cccc-cccccccc0001',
    'Verified',
    now() - interval '2 days',
    now() - interval '1 day'
  ),
  (
    '99999999-9999-9999-9999-999999990005',
    'ffffffff-ffff-ffff-ffff-ffffffffff05',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
    3500,
    'verified',
    '/images/payment-screenshot-demo.svg',
    'cccccccc-cccc-cccc-cccc-cccccccc0001',
    'Verified',
    now() - interval '12 days',
    now() - interval '11 days'
  ),
  (
    '99999999-9999-9999-9999-999999990006',
    'ffffffff-ffff-ffff-ffff-ffffffffff06',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    1500,
    'verified',
    '/images/payment-screenshot-demo.svg',
    'cccccccc-cccc-cccc-cccc-cccccccc0001',
    'Verified',
    now() - interval '6 days',
    now() - interval '5 days'
  )
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 8. Medical history
-- -----------------------------------------------------------------------------
insert into public.medical_history (
  id, patient_id, doctor_id, appointment_id, title, diagnosis, notes, report_urls
) values
  (
    '88888888-8888-8888-8888-888888880001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
    'ffffffff-ffff-ffff-ffff-ffffffffff05',
    'Cardiac Checkup',
    'Mild hypertension — lifestyle modification advised',
    'BP 130/85. ECG normal. Follow up in 3 months.',
    '[]'::jsonb
  ),
  (
    '88888888-8888-8888-8888-888888880002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003',
    'ffffffff-ffff-ffff-ffff-ffffffffff06',
    'Thyroid Evaluation',
    'Subclinical hypothyroidism',
    'TSH slightly elevated. Diet and monitoring recommended.',
    '[]'::jsonb
  )
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 9. Prescriptions
-- -----------------------------------------------------------------------------
insert into public.prescriptions (
  id, patient_id, doctor_id, appointment_id, diagnosis, instructions, is_finalized
) values
  (
    '77777777-7777-7777-7777-777777770001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
    'ffffffff-ffff-ffff-ffff-ffffffffff05',
    'Hypertension management',
    'Take medicines after food. Monitor BP daily. Reduce salt intake.',
    true
  ),
  (
    '77777777-7777-7777-7777-777777770002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003',
    'ffffffff-ffff-ffff-ffff-ffffffffff06',
    'Thyroid support',
    'Regular follow-up after 6 weeks.',
    true
  )
on conflict (id) do nothing;

insert into public.prescription_medicines (
  id, prescription_id, medicine_name, dosage, frequency, duration, instructions
) values
  ('66666666-6666-6666-6666-666666660001', '77777777-7777-7777-7777-777777770001', 'Amlodipine', '5mg', 'Once daily', '30 days', 'Morning after breakfast'),
  ('66666666-6666-6666-6666-666666660002', '77777777-7777-7777-7777-777777770001', 'Atorvastatin', '10mg', 'Once daily', '30 days', 'At night'),
  ('66666666-6666-6666-6666-666666660003', '77777777-7777-7777-7777-777777770002', 'Levothyroxine', '25mcg', 'Once daily', '60 days', 'Empty stomach in morning')
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 10. Patient reviews (from completed visits — Ahmed Hassan & Fatima Malik)
-- -----------------------------------------------------------------------------
insert into public.reviews (
  id, doctor_id, patient_id, appointment_id, rating, comment, created_at
) values
  (
    '55555555-5555-5555-5555-555555550001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
    'ffffffff-ffff-ffff-ffff-ffffffffff05',
    5,
    'Dr. Hassan Raza explained everything clearly. DHA clinic was clean and professional. Highly recommend for cardiac care in Karachi.',
    now() - interval '10 days'
  ),
  (
    '55555555-5555-5555-5555-555555550002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    'ffffffff-ffff-ffff-ffff-ffffffffff06',
    4,
    'Good consultation at F-10 Islamabad. Dr. Usman Ali was patient and thorough with my thyroid concerns.',
    now() - interval '5 days'
  ),
  (
    '55555555-5555-5555-5555-555555550003',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    'ffffffff-ffff-ffff-ffff-ffffffffff07',
    5,
    'Best dermatologist in Lahore! Dr. Ayesha Malik fixed my eczema within weeks. Gulberg clinic is very convenient.',
    now() - interval '14 days'
  ),
  (
    '55555555-5555-5555-5555-555555550004',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
    'ffffffff-ffff-ffff-ffff-ffffffffff08',
    5,
    'Excellent skin specialist. Friendly staff at Glow Skin Clinic and fair PKR consultation fee.',
    now() - interval '21 days'
  ),
  (
    '55555555-5555-5555-5555-555555550005',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    'ffffffff-ffff-ffff-ffff-ffffffffff09',
    4,
    'Visited Clifton Cardiac Clinic from Lahore. Dr. Hassan Raza gave a thorough second opinion. Booking via Doctor Hub was smooth.',
    now() - interval '30 days'
  )
on conflict (id) do update set
  rating = excluded.rating,
  comment = excluded.comment,
  created_at = excluded.created_at;

-- -----------------------------------------------------------------------------
-- 11. Notifications (sample)
-- -----------------------------------------------------------------------------
insert into public.notifications (id, user_id, type, title, body, is_read) values
  (
    '44444444-4444-4444-4444-444444440001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
    'appointment',
    'Appointment Confirmed',
    'Your appointment with Dr. Usman Ali is verified and awaiting confirmation.',
    false
  ),
  (
    '44444444-4444-4444-4444-444444440002',
    'cccccccc-cccc-cccc-cccc-cccccccc0001',
    'payment',
    'Payment Pending Review',
    'A new payment screenshot needs your verification.',
    false
  )
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 12. Audit logs (super admin demo)
-- -----------------------------------------------------------------------------
insert into public.audit_logs (id, actor_id, action, entity_type, entity_id, metadata) values
  (
    '33333333-3333-3333-3333-333333330001',
    'cccccccc-cccc-cccc-cccc-cccccccc0001',
    'payment.verified',
    'payment',
    '99999999-9999-9999-9999-999999990001',
    '{"patient":"Ahmed Hassan","amount_pkr":3500}'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333330002',
    'cccccccc-cccc-cccc-cccc-cccccccc0002',
    'doctor.verified',
    'doctor',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
    '{"doctor":"Dr. Hassan Raza","city":"Karachi"}'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333330003',
    'cccccccc-cccc-cccc-cccc-cccccccc0002',
    'appointment.completed',
    'appointment',
    'ffffffff-ffff-ffff-ffff-ffffffffff05',
    '{"doctor":"Dr. Hassan Raza","clinic":"Karachi Heart Institute"}'::jsonb
  )
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Cleanup helper (optional — keeps function in DB for re-seeding other envs)
-- -----------------------------------------------------------------------------
-- drop function if exists public.seed_demo_user(uuid, text, text, text, text, jsonb);

-- =============================================================================
-- Done! Log in with any demo email above using password: Demo@123456
-- =============================================================================
