-- Doctor Hub: Platform settings + super admin profile/doctor updates

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
