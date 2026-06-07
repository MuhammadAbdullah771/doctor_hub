export interface PlatformSettings {
  id: number
  app_name: string
  country: string
  locale: string
  currency: string
  support_email: string
  support_phone: string
  headquarters: string
  tagline: string
  payment_bank_name: string
  payment_account_title: string
  payment_account_number: string
  payment_iban: string
  payment_jazzcash_number: string
  payment_easypaisa_number: string
  payment_instructions: string
  updated_at: string
  updated_by: string | null
}

export type PlatformSettingsInput = Omit<
  PlatformSettings,
  'id' | 'updated_at' | 'updated_by'
>

export interface UserDetailsInput {
  full_name: string
  phone?: string
  city?: string
  role: 'patient' | 'doctor' | 'assistant' | 'admin' | 'super_admin'
  is_active: boolean
  specialty?: string
  consultation_fee?: number
  experience_years?: number
  is_verified?: boolean
}

export interface CreateUserInput {
  email: string
  password: string
  full_name: string
  role: UserDetailsInput['role']
  phone?: string
  city?: string
  specialty?: string
  consultation_fee?: number
  experience_years?: number
  is_verified?: boolean
}

export interface AdminUserRow {
  id: string
  email: string
  full_name: string
  phone: string | null
  city: string | null
  role: UserDetailsInput['role']
  is_active: boolean
  created_at: string
  doctors?: {
    specialty: string
    consultation_fee: number
    experience_years: number
    is_verified: boolean
  } | null
}
