import { z } from 'zod'

export const platformSettingsSchema = z.object({
  app_name: z.string().min(2, 'App name is required'),
  country: z.string().min(2, 'Country is required'),
  locale: z.string().min(2, 'Locale is required'),
  currency: z.string().min(3).max(3, 'Use 3-letter currency code'),
  support_email: z.string().email('Valid email required'),
  support_phone: z.string().min(8, 'Phone number is required'),
  headquarters: z.string().min(5, 'Address is required'),
  tagline: z.string().min(10, 'Tagline is required'),
  payment_bank_name: z.string().min(2, 'Bank name is required'),
  payment_account_title: z.string().min(2, 'Account title is required'),
  payment_account_number: z.string().min(5, 'Account number is required'),
  payment_iban: z.string(),
  payment_jazzcash_number: z.string(),
  payment_easypaisa_number: z.string(),
  payment_instructions: z.string().min(10, 'Payment instructions are required'),
})

export type PlatformSettingsFormValues = z.infer<typeof platformSettingsSchema>

export const userDetailsSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  city: z.string().optional(),
  role: z.enum(['patient', 'doctor', 'assistant', 'admin', 'super_admin']),
  is_active: z.boolean(),
  specialty: z.string().optional(),
  consultation_fee: z.number().min(0).optional(),
  experience_years: z.number().min(0).optional(),
  is_verified: z.boolean().optional(),
})

export type UserDetailsFormValues = z.infer<typeof userDetailsSchema>

export const createUserSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name is required'),
  role: z.enum(['patient', 'doctor', 'assistant', 'admin', 'super_admin']),
  phone: z.string().optional(),
  city: z.string().optional(),
  specialty: z.string().optional(),
  consultation_fee: z.number().min(0).optional(),
  experience_years: z.number().min(0).optional(),
  is_verified: z.boolean().optional(),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
