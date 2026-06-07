-- Seed data for development

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
