-- Super Admin / Admin user management RPCs

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
