-- Doctor Hub: Platform payment account details (bank / JazzCash / EasyPaisa)

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
