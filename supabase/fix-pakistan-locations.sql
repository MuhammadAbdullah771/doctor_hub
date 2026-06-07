-- =============================================================================
-- Doctor Hub — Fix Indian locations → Pakistan
-- =============================================================================
-- Run in Supabase SQL Editor when doctors still show Mumbai, Bangalore, Delhi, etc.
-- Safe to run multiple times.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Remove legacy Indian demo auth accounts (FK-safe)
-- -----------------------------------------------------------------------------
do $$
declare
  v_legacy_emails text[] := array[
    'priya@demo.com', 'patient2@demo.com', 'dr.patel@demo.com', 'dr.sharma@demo.com',
    'dr.kumar@demo.com', 'sarah.mitchell@doctorhub.com', 'rajesh.kumar@doctorhub.com',
    'priya.sharma@doctorhub.com', 'emily.chen@doctorhub.com', 'vikram.singh@doctorhub.com'
  ];
  v_pakistan_demo_emails text[] := array[
    'patient@demo.com', 'fatima@demo.com', 'doctor1@demo.com', 'doctor2@demo.com',
    'doctor3@demo.com', 'assistant@demo.com', 'admin@demo.com', 'superadmin@demo.com'
  ];
  v_legacy_ids uuid[];
begin
  select coalesce(array_agg(u.id), '{}')
  into v_legacy_ids
  from auth.users u
  where u.email = any(v_legacy_emails)
    and u.email <> all(v_pakistan_demo_emails);

  if coalesce(array_length(v_legacy_ids, 1), 0) = 0 then
    return;
  end if;

  update public.payments set verified_by = null where verified_by = any(v_legacy_ids);
  update public.audit_logs set actor_id = null where actor_id = any(v_legacy_ids);

  delete from public.reviews
  where patient_id = any(v_legacy_ids) or doctor_id = any(v_legacy_ids);

  delete from public.medical_history
  where patient_id = any(v_legacy_ids) or doctor_id = any(v_legacy_ids);

  delete from public.prescriptions
  where patient_id = any(v_legacy_ids) or doctor_id = any(v_legacy_ids);

  delete from public.appointments
  where patient_id = any(v_legacy_ids) or doctor_id = any(v_legacy_ids);

  delete from public.notifications where user_id = any(v_legacy_ids);

  delete from auth.users where id = any(v_legacy_ids);
end $$;

-- -----------------------------------------------------------------------------
-- 2. Map Indian cities → Pakistan cities (profiles)
-- -----------------------------------------------------------------------------
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

-- Default any remaining India-like profile city to Karachi
update public.profiles set city = 'Karachi'
where city is not null
  and lower(trim(city)) not in (
    'karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad',
    'multan', 'peshawar', 'quetta', 'hyderabad', 'sialkot', 'gujranwala'
  )
  and (
    city ~* '(mumbai|delhi|bangalore|chennai|india|maharashtra|karnataka|tamil|gujarat|andhra|punjab, india)'
    or phone like '+91%'
  );

-- -----------------------------------------------------------------------------
-- 3. Map Indian cities → Pakistan cities (clinics)
-- -----------------------------------------------------------------------------
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
where lower(trim(city)) in (
  'bangalore', 'bengaluru', 'mysore', 'coimbatore', 'mangalore'
);

-- Fix clinic addresses with Indian location keywords
update public.clinics set
  address = 'Plot 15-C, Phase 2 DHA, Karachi',
  city = 'Karachi'
where address ~* '(mumbai|marine drive|andheri|colaba|maharashtra|bandra)';

update public.clinics set
  address = '47-A Main Boulevard, Gulberg III, Lahore',
  city = 'Lahore'
where address ~* '(delhi|connaught|gurgaon|noida|punjab, india|king edward)';

update public.clinics set
  address = 'Office 12, F-10 Markaz, Islamabad',
  city = 'Islamabad'
where address ~* '(bangalore|bengaluru|mg road|indiranagar|karnataka|hyderabad|banjara)';

update public.clinics set
  address = 'Clifton Block 5, Karachi',
  city = 'Karachi'
where address ~* '(chennai|anna salai|tnagar|tamil)';

update public.clinics set
  address = 'Gulberg III, Lahore',
  city = 'Lahore'
where address ~* '(pune|senapati|bapat|maharashtra)';

-- Rename Indian-style clinic names
update public.clinics set name = replace(name, 'Mumbai', 'Karachi') where name ~* 'mumbai';
update public.clinics set name = replace(name, 'Delhi', 'Lahore') where name ~* 'delhi';
update public.clinics set name = replace(name, 'Bangalore', 'Islamabad') where name ~* 'bangalore';

-- -----------------------------------------------------------------------------
-- 4. Fix doctor bios & qualifications mentioning Indian institutions
-- -----------------------------------------------------------------------------
update public.doctors set bio = replace(bio, 'Mumbai', 'Karachi') where bio ~* 'mumbai';
update public.doctors set bio = replace(bio, 'Delhi', 'Lahore') where bio ~* 'delhi';
update public.doctors set bio = replace(bio, 'Bangalore', 'Islamabad') where bio ~* 'bangalore';

-- -----------------------------------------------------------------------------
-- 5. Normalize Pakistani phone format (+91 → +92) for demo data
-- -----------------------------------------------------------------------------
update public.profiles set phone = '+92' || substring(phone from 4)
where phone like '+91%';

update public.clinics set phone = '+92' || substring(phone from 4)
where phone like '+91%';

-- -----------------------------------------------------------------------------
-- 6. Deactivate unverified doctors with no Pakistan clinic (optional cleanup)
-- -----------------------------------------------------------------------------
update public.profiles p set is_active = false
from public.doctors d
where p.id = d.id
  and d.is_verified = false
  and not exists (
    select 1 from public.clinics c
    where c.doctor_id = d.id
      and lower(c.city) in ('karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar')
  );

-- -----------------------------------------------------------------------------
-- 7. Ensure demo Pakistan doctors are verified (re-run safe)
-- -----------------------------------------------------------------------------
update public.doctors set is_verified = true
where id in (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003'
);

-- =============================================================================
-- Done! Refresh the app — doctors should show Karachi, Lahore, Islamabad only.
-- For fresh demo data also run: supabase/seed-demo.sql
-- =============================================================================
