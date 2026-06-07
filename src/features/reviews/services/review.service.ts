import { supabase } from '@/lib/supabase'
import type { Review } from '@/types/doctor'

export interface CreateReviewInput {
  doctor_id: string
  appointment_id: string
  rating: number
  comment?: string
}

function mapReview(row: Record<string, unknown>): Review {
  const patient = row.patient as { profile: { full_name: string } } | null

  return {
    id: row.id as string,
    doctor_id: row.doctor_id as string,
    patient_name: patient?.profile?.full_name ?? 'Patient',
    rating: row.rating as number,
    comment: row.comment as string | null,
    created_at: row.created_at as string,
  }
}

export const reviewService = {
  async getDoctorReviews(doctorId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        patient:patients(profile:profiles(full_name))
      `)
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []).map((row) => mapReview(row as Record<string, unknown>))
  },

  async getAppointmentReview(appointmentId: string, patientId: string): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        patient:patients(profile:profiles(full_name))
      `)
      .eq('appointment_id', appointmentId)
      .eq('patient_id', patientId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    return mapReview(data as Record<string, unknown>)
  },

  async createReview(patientId: string, input: CreateReviewInput): Promise<Review> {
    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .select('id, patient_id, doctor_id, status')
      .eq('id', input.appointment_id)
      .eq('patient_id', patientId)
      .single()

    if (apptError || !appointment) {
      throw new Error('Appointment not found')
    }

    if (appointment.status !== 'completed') {
      throw new Error('You can only review completed appointments')
    }

    if (appointment.doctor_id !== input.doctor_id) {
      throw new Error('Doctor does not match this appointment')
    }

    const existing = await this.getAppointmentReview(input.appointment_id, patientId)
    if (existing) {
      throw new Error('You have already reviewed this appointment')
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        doctor_id: input.doctor_id,
        patient_id: patientId,
        appointment_id: input.appointment_id,
        rating: input.rating,
        comment: input.comment?.trim() || null,
      })
      .select(`
        *,
        patient:patients(profile:profiles(full_name))
      `)
      .single()

    if (error) throw error
    return mapReview(data as Record<string, unknown>)
  },
}
