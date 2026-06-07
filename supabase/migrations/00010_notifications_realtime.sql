-- Doctor Hub: Notifications Realtime + auto-alerts

alter publication supabase_realtime add table public.notifications;

create or replace function public.notify_on_payment_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_doctor_name text;
  v_patient_name text;
begin
  if tg_op = 'UPDATE' and new.status = 'submitted' and old.status is distinct from 'submitted' then
    insert into public.notifications (user_id, type, title, body, metadata)
    select a.id, 'payment', 'Payment Pending Review', 'A patient submitted a payment screenshot for verification.',
      jsonb_build_object('appointment_id', new.appointment_id, 'payment_id', new.id)
    from public.assistants a;
  end if;

  if tg_op = 'UPDATE' and new.status = 'verified' and old.status is distinct from 'verified' then
    select pr.full_name into v_patient_name
    from public.profiles pr where pr.id = new.patient_id;

    insert into public.notifications (user_id, type, title, body, metadata)
    values (
      new.patient_id,
      'payment',
      'Payment Verified',
      'Your payment has been verified. Your appointment will be confirmed shortly.',
      jsonb_build_object('appointment_id', new.appointment_id, 'payment_id', new.id)
    );

    select p.full_name into v_doctor_name
    from public.appointments ap
    join public.profiles p on p.id = ap.doctor_id
    where ap.id = new.appointment_id;

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
    values (
      new.patient_id,
      'appointment',
      'Appointment Confirmed',
      'Your appointment is confirmed. Please arrive 10 minutes early.',
      jsonb_build_object('appointment_id', new.id)
    );
  end if;

  if tg_op = 'UPDATE' and new.status = 'completed' and old.status is distinct from 'completed' then
    insert into public.notifications (user_id, type, title, body, metadata)
    values (
      new.patient_id,
      'appointment',
      'Visit Completed',
      'Your consultation is complete. You can leave a review from your appointment details.',
      jsonb_build_object('appointment_id', new.id)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists appointments_notify_status on public.appointments;
create trigger appointments_notify_status
after update on public.appointments
for each row execute function public.notify_on_appointment_status_change();
