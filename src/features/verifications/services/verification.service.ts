import { supabase } from '@/lib/supabase'
import type {
  PaymentVerificationItem,
  CompletedVerificationItem,
  AssistantVerificationStats,
  AdminPaymentRecord,
  VerifyPaymentInput,
  RejectPaymentInput,
} from '@/types/appointment'

function mapAppointmentToVerification(row: Record<string, unknown>): PaymentVerificationItem | null {
  const payment = row.payment as Record<string, unknown> | null
  if (!payment || payment.status !== 'submitted') return null

  const patient = row.patient as { profile: { full_name: string; email: string } } | null
  const doctor = row.doctor as { specialty: string; profile: { full_name: string } } | null
  const clinic = row.clinic as { name: string } | null

  return {
    payment_id: payment.id as string,
    appointment_id: row.id as string,
    patient_id: row.patient_id as string,
    patient_name: patient?.profile?.full_name ?? 'Patient',
    patient_email: patient?.profile?.email ?? null,
    doctor_name: doctor?.profile?.full_name ?? 'Doctor',
    doctor_specialty: doctor?.specialty ?? '',
    clinic_name: clinic?.name ?? '',
    appointment_date: row.appointment_date as string,
    appointment_time: row.appointment_time as string,
    amount: Number(payment.amount),
    screenshot_url: payment.screenshot_url as string | null,
    submitted_at: payment.submitted_at as string | null,
    symptoms: row.symptoms as string | null,
  }
}

export const verificationService = {
  async getPendingVerifications(): Promise<PaymentVerificationItem[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        payment:payments!inner(*),
        patient:patients(profile:profiles(full_name, email)),
        doctor:doctors(specialty, profile:profiles(full_name)),
        clinic:clinics(name)
      `)
      .eq('status', 'payment_submitted')
      .eq('payment.status', 'submitted')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data ?? [])
      .map((row) => mapAppointmentToVerification(row as Record<string, unknown>))
      .filter((v): v is PaymentVerificationItem => v !== null)
  },

  async getCompletedVerifications(): Promise<CompletedVerificationItem[]> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        appointment:appointments(
          *,
          patient:patients(profile:profiles(full_name, email)),
          doctor:doctors(specialty, profile:profiles(full_name)),
          clinic:clinics(name)
        )
      `)
      .in('status', ['verified', 'rejected'])
      .order('verified_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return (data ?? []).map((payment: Record<string, unknown>) => {
      const appt = payment.appointment as Record<string, unknown>
      const patient = appt.patient as { profile: { full_name: string; email: string } }
      const doctor = appt.doctor as { specialty: string; profile: { full_name: string } }
      const clinic = appt.clinic as { name: string }

      return {
        payment_id: payment.id as string,
        appointment_id: appt.id as string,
        patient_id: appt.patient_id as string,
        patient_name: patient?.profile?.full_name ?? 'Patient',
        patient_email: patient?.profile?.email ?? null,
        doctor_name: doctor?.profile?.full_name ?? 'Doctor',
        doctor_specialty: doctor?.specialty ?? '',
        clinic_name: clinic?.name ?? '',
        appointment_date: appt.appointment_date as string,
        appointment_time: appt.appointment_time as string,
        amount: Number(payment.amount),
        screenshot_url: payment.screenshot_url as string | null,
        submitted_at: payment.submitted_at as string | null,
        symptoms: appt.symptoms as string | null,
        payment_status: payment.status as CompletedVerificationItem['payment_status'],
        appointment_status: appt.status as CompletedVerificationItem['appointment_status'],
        remarks: payment.remarks as string | null,
        verified_at: payment.verified_at as string | null,
      }
    })
  },

  async getAssistantStats(): Promise<AssistantVerificationStats> {
    const [pending, completed] = await Promise.all([
      this.getPendingVerifications(),
      this.getCompletedVerifications(),
    ])

    const today = new Date().toDateString()
    const isToday = (d: string | null) => d && new Date(d).toDateString() === today

    return {
      pending: pending.length,
      verifiedToday: completed.filter(
        (c) => c.payment_status === 'verified' && isToday(c.verified_at),
      ).length,
      rejectedToday: completed.filter(
        (c) => c.payment_status === 'rejected' && isToday(c.verified_at),
      ).length,
    }
  },

  async verifyPayment(assistantId: string, input: VerifyPaymentInput): Promise<void> {
    const now = new Date().toISOString()

    const { error: payError } = await supabase
      .from('payments')
      .update({
        status: 'verified',
        verified_by: assistantId,
        remarks: input.remarks ?? 'Payment verified successfully',
        verified_at: now,
      })
      .eq('appointment_id', input.appointmentId)

    if (payError) throw payError

    const { error: apptError } = await supabase
      .from('appointments')
      .update({ status: 'verified' })
      .eq('id', input.appointmentId)

    if (apptError) throw apptError
  },

  async rejectPayment(assistantId: string, input: RejectPaymentInput): Promise<void> {
    const now = new Date().toISOString()

    const { error: payError } = await supabase
      .from('payments')
      .update({
        status: 'rejected',
        verified_by: assistantId,
        remarks: input.remarks,
        verified_at: now,
      })
      .eq('appointment_id', input.appointmentId)

    if (payError) throw payError

    const { error: apptError } = await supabase
      .from('appointments')
      .update({ status: 'pending' })
      .eq('id', input.appointmentId)

    if (apptError) throw apptError
  },

  async getAllPaymentsForAdmin(): Promise<AdminPaymentRecord[]> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        appointment:appointments(
          status,
          patient:patients(profile:profiles(full_name)),
          doctor:doctors(profile:profiles(full_name))
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data ?? []).map((payment: Record<string, unknown>) => {
      const appt = payment.appointment as Record<string, unknown>
      const patient = appt.patient as { profile: { full_name: string } }
      const doctor = appt.doctor as { profile: { full_name: string } }

      return {
        payment_id: payment.id as string,
        appointment_id: payment.appointment_id as string,
        patient_name: patient?.profile?.full_name ?? 'Patient',
        doctor_name: doctor?.profile?.full_name ?? 'Doctor',
        amount: Number(payment.amount),
        payment_status: payment.status as AdminPaymentRecord['payment_status'],
        appointment_status: appt.status as AdminPaymentRecord['appointment_status'],
        screenshot_url: payment.screenshot_url as string | null,
        submitted_at: payment.submitted_at as string | null,
        verified_at: payment.verified_at as string | null,
        remarks: payment.remarks as string | null,
      }
    })
  },
}
