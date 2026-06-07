-- Doctor Hub: Enums and Extensions
create extension if not exists "pgcrypto";

create type public.user_role as enum (
  'patient', 'doctor', 'assistant', 'admin', 'super_admin'
);

create type public.doctor_type as enum ('allopathic', 'homeopathic', 'herbal');

create type public.appointment_status as enum (
  'pending', 'payment_submitted', 'verified', 'confirmed', 'completed', 'cancelled'
);

create type public.payment_status as enum ('pending', 'submitted', 'verified', 'rejected');

create type public.notification_type as enum (
  'appointment', 'payment', 'prescription', 'system'
);
