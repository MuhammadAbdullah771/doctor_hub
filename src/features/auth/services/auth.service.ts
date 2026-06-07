import { supabase } from '@/lib/supabase'
import type { LoginFormData, RegisterFormData, ForgotPasswordFormData, ResetPasswordFormData } from '@/features/auth/schemas/auth.schema'

export const authService = {
  async signIn(data: LoginFormData) {
    const { data: result, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) throw error

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, is_active, role, full_name')
      .eq('id', result.user.id)
      .single()

    if (profileError || !profile) {
      await supabase.auth.signOut()
      throw new Error('Account profile not found. Contact support.')
    }

    if (!profile.is_active) {
      await supabase.auth.signOut()
      throw new Error('Your account has been suspended. Contact support.')
    }

    return result
  },

  async signUp(data: RegisterFormData) {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          role: data.role,
        },
      },
    })
    if (error) throw error
    return result
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async forgotPassword(data: ForgotPasswordFormData) {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  },

  async resetPassword(data: ResetPasswordFormData) {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })
    if (error) throw error
  },
}
