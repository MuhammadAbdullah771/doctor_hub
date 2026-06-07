import { supabase } from '@/lib/supabase'
import { APP_REGION } from '@/constants/region'
import type { Json } from '@/types/database.types'
import type {
  AdminUserRow,
  CreateUserInput,
  PlatformSettings,
  PlatformSettingsInput,
  UserDetailsInput,
} from '@/types/platform.types'

const DEFAULT_SETTINGS: PlatformSettings = {
  id: 1,
  app_name: 'Doctor Hub',
  country: APP_REGION.country,
  locale: APP_REGION.locale,
  currency: APP_REGION.currency,
  support_email: APP_REGION.supportEmail,
  support_phone: APP_REGION.supportPhone,
  headquarters: APP_REGION.headquarters,
  tagline: 'Your trusted healthcare consultation platform across Pakistan.',
  payment_bank_name: APP_REGION.paymentBankName,
  payment_account_title: APP_REGION.paymentAccountTitle,
  payment_account_number: APP_REGION.paymentAccountNumber,
  payment_iban: APP_REGION.paymentIban,
  payment_jazzcash_number: APP_REGION.paymentJazzcashNumber,
  payment_easypaisa_number: APP_REGION.paymentEasypaisaNumber,
  payment_instructions: APP_REGION.paymentInstructions,
  updated_at: new Date().toISOString(),
  updated_by: null,
}

function mapSettings(row: Record<string, unknown>): PlatformSettings {
  return {
    id: row.id as number,
    app_name: row.app_name as string,
    country: row.country as string,
    locale: row.locale as string,
    currency: row.currency as string,
    support_email: row.support_email as string,
    support_phone: row.support_phone as string,
    headquarters: row.headquarters as string,
    tagline: row.tagline as string,
    payment_bank_name: (row.payment_bank_name as string | undefined) ?? APP_REGION.paymentBankName,
    payment_account_title: (row.payment_account_title as string | undefined) ?? APP_REGION.paymentAccountTitle,
    payment_account_number: (row.payment_account_number as string | undefined) ?? APP_REGION.paymentAccountNumber,
    payment_iban: (row.payment_iban as string | undefined) ?? APP_REGION.paymentIban,
    payment_jazzcash_number: (row.payment_jazzcash_number as string | undefined) ?? APP_REGION.paymentJazzcashNumber,
    payment_easypaisa_number: (row.payment_easypaisa_number as string | undefined) ?? APP_REGION.paymentEasypaisaNumber,
    payment_instructions: (row.payment_instructions as string | undefined) ?? APP_REGION.paymentInstructions,
    updated_at: row.updated_at as string,
    updated_by: (row.updated_by as string | null) ?? null,
  }
}

async function logAudit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown>,
) {
  await supabase.from('audit_logs').insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: metadata as Json,
  })
}

export const platformSettingsService = {
  async getSettings(): Promise<PlatformSettings> {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (error) throw error
    return data ? mapSettings(data as Record<string, unknown>) : DEFAULT_SETTINGS
  },

  async updateSettings(
    input: PlatformSettingsInput,
    actorId: string,
  ): Promise<PlatformSettings> {
    const { data, error } = await supabase
      .from('platform_settings')
      .update({ ...input, updated_by: actorId })
      .eq('id', 1)
      .select('*')
      .single()

    if (error) throw error

    await logAudit(actorId, 'platform_settings.updated', 'platform_settings', '1', { ...input })

    return mapSettings(data as Record<string, unknown>)
  },

  async getUsersForAdmin(): Promise<AdminUserRow[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, email, full_name, phone, city, role, is_active, created_at,
        doctors ( specialty, consultation_fee, experience_years, is_verified )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    type ProfileRow = {
      id: string
      email: string
      full_name: string
      phone: string | null
      city: string | null
      role: AdminUserRow['role']
      is_active: boolean
      created_at: string
      doctors:
        | { specialty: string; consultation_fee: number; experience_years: number; is_verified: boolean }
        | { specialty: string; consultation_fee: number; experience_years: number; is_verified: boolean }[]
        | null
    }

    return ((data ?? []) as unknown as ProfileRow[]).map((row) => {
      const doctor = Array.isArray(row.doctors) ? row.doctors[0] : row.doctors
      return {
        id: row.id,
        email: row.email,
        full_name: row.full_name,
        phone: row.phone,
        city: row.city,
        role: row.role,
        is_active: row.is_active,
        created_at: row.created_at,
        doctors: doctor ?? null,
      }
    })
  },

  async updateUserDetails(
    userId: string,
    input: UserDetailsInput,
    actorId: string,
  ): Promise<void> {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: input.full_name,
        phone: input.phone || null,
        city: input.city || null,
        role: input.role,
        is_active: input.is_active,
      })
      .eq('id', userId)

    if (profileError) throw profileError

    if (input.role === 'doctor' && input.specialty !== undefined) {
      const { error: doctorError } = await supabase
        .from('doctors')
        .update({
          specialty: input.specialty,
          consultation_fee: input.consultation_fee ?? 0,
          experience_years: input.experience_years ?? 0,
          is_verified: input.is_verified ?? false,
        })
        .eq('id', userId)

      if (doctorError) throw doctorError
    }

    await logAudit(actorId, 'user.details_updated', 'profile', userId, {
      full_name: input.full_name,
      role: input.role,
      is_active: input.is_active,
    })
  },

  async setUserStatus(userId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase.rpc('admin_set_user_status', {
      p_user_id: userId,
      p_is_active: isActive,
    })

    if (error) throw error
  },

  async createUser(input: CreateUserInput): Promise<string> {
    const meta: Record<string, unknown> = {}

    if (input.role === 'doctor') {
      meta.doctor_type = 'allopathic'
      if (input.specialty) meta.specialty = input.specialty
      if (input.consultation_fee !== undefined) meta.consultation_fee = input.consultation_fee
      if (input.experience_years !== undefined) meta.experience_years = input.experience_years
      if (input.is_verified !== undefined) meta.is_verified = input.is_verified
    }

    const { data, error } = await supabase.rpc('admin_create_user', {
      p_email: input.email.trim().toLowerCase(),
      p_password: input.password,
      p_full_name: input.full_name,
      p_role: input.role,
      p_phone: input.phone ?? null,
      p_city: input.city ?? null,
      p_meta: meta as Json,
    })

    if (error) throw error
    return data as string
  },
}
