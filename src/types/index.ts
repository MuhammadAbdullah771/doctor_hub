export type UserRole = 'patient' | 'doctor' | 'assistant' | 'admin' | 'super_admin'

export type DoctorType = 'allopathic' | 'homeopathic' | 'herbal'

export type AppointmentStatus =
  | 'pending'
  | 'payment_submitted'
  | 'verified'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'submitted' | 'verified' | 'rejected'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: UserRole
  city: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Doctor {
  id: string
  doctor_type: DoctorType
  specialty: string
  experience_years: number
  consultation_fee: number
  bio: string | null
  qualifications: string[]
  rating_avg: number
  rating_count: number
  is_verified: boolean
  profile?: Profile
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  clinic_id: string
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus
  symptoms: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface NavItem {
  label: string
  href: string
  icon: string
  section?: string
}
