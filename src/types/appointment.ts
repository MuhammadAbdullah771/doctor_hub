import type { AppointmentStatus, PaymentStatus } from '@/types'

export interface PaymentDetail {
  id: string
  appointment_id: string
  patient_id: string
  amount: number
  status: PaymentStatus
  screenshot_url: string | null
  remarks: string | null
  submitted_at: string | null
  verified_at: string | null
  created_at: string
}

export interface AppointmentDetail {
  id: string
  patient_id: string
  patient_name: string
  patient_email: string | null
  doctor_id: string
  clinic_id: string
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus
  symptoms: string | null
  notes: string | null
  created_at: string
  updated_at: string
  doctor_name: string
  doctor_specialty: string
  clinic_name: string
  clinic_address: string
  clinic_city: string
  consultation_fee: number
  payment: PaymentDetail | null
}

export interface BookAppointmentInput {
  doctor_id: string
  clinic_id: string
  appointment_date: string
  appointment_time: string
  symptoms?: string
}

export interface AppointmentSummary {
  id: string
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus
  doctor_name: string
  clinic_name: string
  consultation_fee: number
  payment_status: PaymentStatus | null
}

export interface PatientAppointmentStats {
  upcoming: number
  pendingPayments: number
  total: number
}

export interface DoctorAppointmentStats {
  todayCount: number
  upcomingCount: number
  totalPatients: number
  monthRevenue: number
}

export interface PaymentVerificationItem {
  payment_id: string
  appointment_id: string
  patient_id: string
  patient_name: string
  patient_email: string | null
  doctor_name: string
  doctor_specialty: string
  clinic_name: string
  appointment_date: string
  appointment_time: string
  amount: number
  screenshot_url: string | null
  submitted_at: string | null
  symptoms: string | null
}

export interface CompletedVerificationItem extends PaymentVerificationItem {
  payment_status: PaymentStatus
  appointment_status: AppointmentStatus
  remarks: string | null
  verified_at: string | null
}

export interface AssistantVerificationStats {
  pending: number
  verifiedToday: number
  rejectedToday: number
}

export interface AdminPaymentRecord {
  payment_id: string
  appointment_id: string
  patient_name: string
  doctor_name: string
  amount: number
  payment_status: PaymentStatus
  appointment_status: AppointmentStatus
  screenshot_url: string | null
  submitted_at: string | null
  verified_at: string | null
  remarks: string | null
}

export interface VerifyPaymentInput {
  appointmentId: string
  remarks?: string
}

export interface RejectPaymentInput {
  appointmentId: string
  remarks: string
}
