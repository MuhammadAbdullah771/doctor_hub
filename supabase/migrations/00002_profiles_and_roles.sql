-- Doctor Hub: Profiles and Role Tables

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

-- Auto-create profile on signup
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

-- Updated_at trigger
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
