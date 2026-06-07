export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          role: 'patient' | 'doctor' | 'assistant' | 'admin' | 'super_admin'
          city: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'patient' | 'doctor' | 'assistant' | 'admin' | 'super_admin'
          city?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'doctors_id_fkey',
            columns: ['id'],
            isOneToOne: true,
            referencedRelation: 'doctors',
            referencedColumns: ['id'],
          },
        ]
      }
      doctors: {
        Row: {
          id: string
          doctor_type: 'allopathic' | 'homeopathic' | 'herbal'
          specialty: string
          experience_years: number
          consultation_fee: number
          bio: string | null
          qualifications: Json
          rating_avg: number
          rating_count: number
          is_verified: boolean
        }
        Insert: Partial<Database['public']['Tables']['doctors']['Row']> & {
          id: string
          doctor_type: 'allopathic' | 'homeopathic' | 'herbal'
          specialty: string
        }
        Update: Partial<Database['public']['Tables']['doctors']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'clinics_doctor_id_fkey',
            columns: ['id'],
            isOneToOne: false,
            referencedRelation: 'clinics',
            referencedColumns: ['doctor_id'],
          },
        ]
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          clinic_id: string
          appointment_date: string
          appointment_time: string
          status: 'pending' | 'payment_submitted' | 'verified' | 'confirmed' | 'completed' | 'cancelled'
          symptoms: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          clinic_id: string
          appointment_date: string
          appointment_time: string
          status?: 'pending' | 'payment_submitted' | 'verified' | 'confirmed' | 'completed' | 'cancelled'
          symptoms?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'payment_submitted' | 'verified' | 'confirmed' | 'completed' | 'cancelled'
          symptoms?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          appointment_id: string
          patient_id: string
          amount: number
          status: 'pending' | 'submitted' | 'verified' | 'rejected'
          screenshot_url: string | null
          verified_by: string | null
          remarks: string | null
          submitted_at: string | null
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          patient_id: string
          amount: number
          status?: 'pending' | 'submitted' | 'verified' | 'rejected'
          screenshot_url?: string | null
          verified_by?: string | null
          remarks?: string | null
          submitted_at?: string | null
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'submitted' | 'verified' | 'rejected'
          screenshot_url?: string | null
          verified_by?: string | null
          remarks?: string | null
          submitted_at?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      medical_history: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_id: string | null
          title: string
          diagnosis: string | null
          notes: string | null
          report_urls: Json
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_id?: string | null
          title: string
          diagnosis?: string | null
          notes?: string | null
          report_urls?: Json
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      prescriptions: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_id: string | null
          diagnosis: string | null
          instructions: string | null
          is_finalized: boolean
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_id?: string | null
          diagnosis?: string | null
          instructions?: string | null
          is_finalized?: boolean
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      prescription_medicines: {
        Row: {
          id: string
          prescription_id: string
          medicine_name: string
          dosage: string
          frequency: string
          duration: string
          instructions: string | null
        }
        Insert: {
          id?: string
          prescription_id: string
          medicine_name: string
          dosage: string
          frequency: string
          duration: string
          instructions?: string | null
        }
        Update: never
        Relationships: []
      }
      clinics: {
        Row: {
          id: string
          doctor_id: string
          name: string
          address: string
          city: string
          phone: string | null
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          name: string
          address: string
          city: string
          phone?: string | null
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          address?: string
          city?: string
          phone?: string | null
          is_primary?: boolean
        }
        Relationships: []
      }
      clinic_schedules: {
        Row: {
          id: string
          clinic_id: string
          day_of_week: number
          start_time: string
          end_time: string
          slot_duration_minutes: number
          is_active: boolean
        }
        Insert: {
          id?: string
          clinic_id: string
          day_of_week: number
          start_time: string
          end_time: string
          slot_duration_minutes?: number
          is_active?: boolean
        }
        Update: {
          day_of_week?: number
          start_time?: string
          end_time?: string
          slot_duration_minutes?: number
          is_active?: boolean
        }
        Relationships: []
      }
      patients: {
        Row: {
          id: string
          date_of_birth: string | null
          gender: string | null
          blood_group: string | null
          emergency_contact: string | null
        }
        Insert: {
          id: string
          date_of_birth?: string | null
          gender?: string | null
          blood_group?: string | null
          emergency_contact?: string | null
        }
        Update: Partial<Database['public']['Tables']['patients']['Insert']>
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          doctor_id: string
          patient_id: string
          appointment_id: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          patient_id: string
          appointment_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'appointment' | 'payment' | 'prescription' | 'system'
          title: string
          body: string
          is_read: boolean
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'appointment' | 'payment' | 'prescription' | 'system'
          title: string
          body: string
          is_read?: boolean
          metadata?: Json
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      platform_settings: {
        Row: {
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
        Insert: {
          id?: number
          app_name?: string
          country?: string
          locale?: string
          currency?: string
          support_email?: string
          support_phone?: string
          headquarters?: string
          tagline?: string
          payment_bank_name?: string
          payment_account_title?: string
          payment_account_number?: string
          payment_iban?: string
          payment_jazzcash_number?: string
          payment_easypaisa_number?: string
          payment_instructions?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          app_name?: string
          country?: string
          locale?: string
          currency?: string
          support_email?: string
          support_phone?: string
          headquarters?: string
          tagline?: string
          payment_bank_name?: string
          payment_account_title?: string
          payment_account_number?: string
          payment_iban?: string
          payment_jazzcash_number?: string
          payment_easypaisa_number?: string
          payment_instructions?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      admin_set_user_status: {
        Args: {
          p_user_id: string
          p_is_active: boolean
        }
        Returns: undefined
      }
      admin_create_user: {
        Args: {
          p_email: string
          p_password: string
          p_full_name: string
          p_role: Database['public']['Enums']['user_role']
          p_phone: string | null
          p_city: string | null
          p_meta: Json
        }
        Returns: string
      }
    }
    Enums: {
      user_role: 'patient' | 'doctor' | 'assistant' | 'admin' | 'super_admin'
      doctor_type: 'allopathic' | 'homeopathic' | 'herbal'
      appointment_status: 'pending' | 'payment_submitted' | 'verified' | 'confirmed' | 'completed' | 'cancelled'
      payment_status: 'pending' | 'submitted' | 'verified' | 'rejected'
      notification_type: 'appointment' | 'payment' | 'prescription' | 'system'
    }
  }
}
