import { supabase } from '@/lib/supabase'
import { doctorService } from '@/features/doctors/services/doctor.service'
import type {
  AppointmentDetail,
  BookAppointmentInput,
  AppointmentSummary,
  PatientAppointmentStats,
  DoctorAppointmentStats,
} from '@/types/appointment'
import type { PaymentStatus } from '@/types'

const appointmentSelect = `
  *,
  doctor:doctors(id, specialty, consultation_fee, profile:profiles(full_name)),
  clinic:clinics(name, address, city),
  patient:patients(profile:profiles(full_name, email)),
  payment:payments(*)
`

function mapSupabaseAppointment(row: Record<string, unknown>): AppointmentDetail {
  const doctor = row.doctor as { specialty: string; consultation_fee: number; profile: { full_name: string } }
  const clinic = row.clinic as { name: string; address: string; city: string }
  const patient = row.patient as { profile: { full_name: string; email: string } } | null
  const paymentRow = row.payment as Record<string, unknown> | Record<string, unknown>[] | null
  const payment = Array.isArray(paymentRow) ? paymentRow[0] : paymentRow

  return {
    id: row.id as string,
    patient_id: row.patient_id as string,
    patient_name: patient?.profile?.full_name ?? 'Patient',
    patient_email: patient?.profile?.email ?? null,
    doctor_id: row.doctor_id as string,
    clinic_id: row.clinic_id as string,
    appointment_date: row.appointment_date as string,
    appointment_time: row.appointment_time as string,
    status: row.status as AppointmentDetail['status'],
    symptoms: row.symptoms as string | null,
    notes: row.notes as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    doctor_name: doctor?.profile?.full_name ?? 'Doctor',
    doctor_specialty: doctor?.specialty ?? '',
    clinic_name: clinic?.name ?? '',
    clinic_address: clinic?.address ?? '',
    clinic_city: clinic?.city ?? '',
    consultation_fee: Number(doctor?.consultation_fee ?? 0),
    payment: payment
      ? {
          id: payment.id as string,
          appointment_id: payment.appointment_id as string,
          patient_id: payment.patient_id as string,
          amount: Number(payment.amount),
          status: payment.status as PaymentStatus,
          screenshot_url: payment.screenshot_url as string | null,
          remarks: payment.remarks as string | null,
          submitted_at: payment.submitted_at as string | null,
          verified_at: payment.verified_at as string | null,
          created_at: payment.created_at as string,
        }
      : null,
  }
}

async function fetchPatientAppointmentsFromSupabase(patientId: string): Promise<AppointmentDetail[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select(appointmentSelect)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapSupabaseAppointment(row as Record<string, unknown>))
}

async function fetchDoctorAppointmentsFromSupabase(doctorId: string, date?: string): Promise<AppointmentDetail[]> {
  let query = supabase
    .from('appointments')
    .select(appointmentSelect)
    .eq('doctor_id', doctorId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  if (date) {
    query = query.eq('appointment_date', date)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((row) => mapSupabaseAppointment(row as Record<string, unknown>))
}

export const appointmentService = {
  async getPatientAppointments(patientId: string): Promise<AppointmentSummary[]> {
    const details = await fetchPatientAppointmentsFromSupabase(patientId)
    return details.map((d) => ({
      id: d.id,
      appointment_date: d.appointment_date,
      appointment_time: d.appointment_time,
      status: d.status,
      doctor_name: d.doctor_name,
      clinic_name: d.clinic_name,
      consultation_fee: d.consultation_fee,
      payment_status: d.payment?.status ?? null,
    }))
  },

  async getDoctorAppointments(doctorId: string, date?: string): Promise<AppointmentDetail[]> {
    return fetchDoctorAppointmentsFromSupabase(doctorId, date)
  },

  async getAppointmentById(id: string, patientId: string): Promise<AppointmentDetail | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select(appointmentSelect)
      .eq('id', id)
      .eq('patient_id', patientId)
      .single()

    if (error) return null
    return mapSupabaseAppointment(data as Record<string, unknown>)
  },

  async bookAppointment(
    patientId: string,
    input: BookAppointmentInput,
  ): Promise<AppointmentDetail> {
    const doctor = await doctorService.getDoctorById(input.doctor_id)
    if (!doctor) throw new Error('Doctor not found')

    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .insert({
        patient_id: patientId,
        doctor_id: input.doctor_id,
        clinic_id: input.clinic_id,
        appointment_date: input.appointment_date,
        appointment_time: input.appointment_time,
        symptoms: input.symptoms ?? null,
        status: 'pending',
      })
      .select('*')
      .single()

    if (apptError) throw apptError

    const { error: payError } = await supabase.from('payments').insert({
      appointment_id: appointment.id,
      patient_id: patientId,
      amount: doctor.consultation_fee,
      status: 'pending',
    })

    if (payError) throw payError

    const detail = await this.getAppointmentById(appointment.id, patientId)
    if (!detail) throw new Error('Failed to load appointment')
    return detail
  },

  async getPatientStats(patientId: string): Promise<PatientAppointmentStats> {
    const appointments = await fetchPatientAppointmentsFromSupabase(patientId)
    const upcoming = appointments.filter((a) => !['completed', 'cancelled'].includes(a.status)).length
    const pendingPayments = appointments.filter(
      (a) => a.status === 'pending' || a.payment?.status === 'submitted',
    ).length

    return { upcoming, pendingPayments, total: appointments.length }
  },

  async getDoctorStats(doctorId: string): Promise<DoctorAppointmentStats> {
    const appointments = await fetchDoctorAppointmentsFromSupabase(doctorId)
    const today = new Date().toISOString().split('T')[0]
    const monthStart = today.slice(0, 7)

    const todayCount = appointments.filter(
      (a) => a.appointment_date === today && !['cancelled'].includes(a.status),
    ).length
    const upcomingCount = appointments.filter(
      (a) => !['completed', 'cancelled'].includes(a.status),
    ).length

    const patientIds = new Set(appointments.map((a) => a.patient_id))
    const monthRevenue = appointments
      .filter(
        (a) =>
          a.appointment_date.startsWith(monthStart) &&
          a.payment?.status === 'verified' &&
          !['cancelled'].includes(a.status),
      )
      .reduce((sum, a) => sum + (a.payment?.amount ?? 0), 0)

    return {
      todayCount,
      upcomingCount,
      totalPatients: patientIds.size,
      monthRevenue,
    }
  },

  async cancelAppointment(id: string, patientId: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('patient_id', patientId)

    if (error) throw error
  },

  async updateDoctorAppointmentStatus(
    doctorId: string,
    appointmentId: string,
    status: AppointmentDetail['status'],
    notes?: string,
  ): Promise<void> {
    const update: { status: AppointmentDetail['status']; notes?: string } = { status }
    if (notes !== undefined) update.notes = notes

    const { error } = await supabase
      .from('appointments')
      .update(update)
      .eq('id', appointmentId)
      .eq('doctor_id', doctorId)

    if (error) throw error
  },
}
