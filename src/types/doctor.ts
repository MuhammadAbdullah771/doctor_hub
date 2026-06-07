import type { DoctorType } from '@/types'

export interface Clinic {
  id: string
  doctor_id: string
  name: string
  address: string
  city: string
  phone: string | null
  is_primary: boolean
}

export interface ClinicSchedule {
  id: string
  clinic_id: string
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration_minutes: number
  is_active: boolean
}

export interface Disease {
  id: string
  name: string
  slug: string
}

export interface TreatmentType {
  id: string
  name: string
  slug: string
}

export interface Review {
  id: string
  doctor_id: string
  patient_name: string
  rating: number
  comment: string | null
  created_at: string
}

export interface DoctorListItem {
  id: string
  full_name: string
  avatar_url: string | null
  doctor_type: DoctorType
  specialty: string
  experience_years: number
  consultation_fee: number
  rating_avg: number
  rating_count: number
  is_verified: boolean
  city: string
  clinic_name: string
  diseases: string[]
  treatments: string[]
  available_today: boolean
}

export interface DoctorDetail extends DoctorListItem {
  bio: string | null
  qualifications: string[]
  email: string | null
  phone: string | null
  clinics: Clinic[]
  schedules: ClinicSchedule[]
  reviews: Review[]
}

export interface DoctorFilters {
  search?: string
  disease?: string
  specialty?: string
  treatment?: string
  experience?: number
  rating?: number
  clinic?: string
  city?: string
  doctor_type?: DoctorType
}

export interface CreateClinicInput {
  name: string
  address: string
  city: string
  phone?: string
  is_primary?: boolean
}

export interface UpdateClinicInput {
  name?: string
  address?: string
  city?: string
  phone?: string
  is_primary?: boolean
}

export interface CreateScheduleInput {
  clinic_id: string
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration_minutes?: number
  is_active?: boolean
}

export interface AdminClinicRecord extends Clinic {
  doctor_name: string
  doctor_specialty: string
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
