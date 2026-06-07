import type {
  AppointmentDetail,
  BookAppointmentInput,
  AppointmentSummary,
  PatientAppointmentStats,
  PaymentVerificationItem,
  CompletedVerificationItem,
  AssistantVerificationStats,
  AdminPaymentRecord,
} from '@/types/appointment'
import type { AppointmentStatus, PaymentStatus } from '@/types'
import { getMockDoctorById } from '@/features/doctors/data/mock-doctors'

const STORAGE_KEY = 'doctor-hub-appointments'

interface StoredRecord {
  appointment: AppointmentDetail
}

function normalizeAppointment(appt: AppointmentDetail): AppointmentDetail {
  return {
    ...appt,
    patient_name: appt.patient_name ?? 'Patient',
    patient_email: appt.patient_email ?? null,
  }
}

function readStore(): StoredRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const records = raw ? (JSON.parse(raw) as StoredRecord[]) : []
    return records.map((r) => ({
      appointment: normalizeAppointment(r.appointment),
    }))
  } catch {
    return []
  }
}

function writeStore(records: StoredRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function isToday(isoDate: string): boolean {
  const date = new Date(isoDate)
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

function toVerificationItem(appt: AppointmentDetail): PaymentVerificationItem | null {
  if (!appt.payment || appt.payment.status !== 'submitted') return null
  return {
    payment_id: appt.payment.id,
    appointment_id: appt.id,
    patient_id: appt.patient_id,
    patient_name: appt.patient_name,
    patient_email: appt.patient_email,
    doctor_name: appt.doctor_name,
    doctor_specialty: appt.doctor_specialty,
    clinic_name: appt.clinic_name,
    appointment_date: appt.appointment_date,
    appointment_time: appt.appointment_time,
    amount: appt.payment.amount,
    screenshot_url: appt.payment.screenshot_url,
    submitted_at: appt.payment.submitted_at,
    symptoms: appt.symptoms,
  }
}

function toCompletedItem(appt: AppointmentDetail): CompletedVerificationItem | null {
  if (!appt.payment) return null
  if (!['verified', 'rejected'].includes(appt.payment.status)) return null
  const base = toVerificationItem({ ...appt, payment: { ...appt.payment, status: 'submitted' } })
  if (!base) {
    return {
      payment_id: appt.payment.id,
      appointment_id: appt.id,
      patient_id: appt.patient_id,
      patient_name: appt.patient_name,
      patient_email: appt.patient_email,
      doctor_name: appt.doctor_name,
      doctor_specialty: appt.doctor_specialty,
      clinic_name: appt.clinic_name,
      appointment_date: appt.appointment_date,
      appointment_time: appt.appointment_time,
      amount: appt.payment.amount,
      screenshot_url: appt.payment.screenshot_url,
      submitted_at: appt.payment.submitted_at,
      symptoms: appt.symptoms,
      payment_status: appt.payment.status,
      appointment_status: appt.status,
      remarks: appt.payment.remarks,
      verified_at: appt.payment.verified_at,
    }
  }
  return {
    ...base,
    payment_status: appt.payment.status,
    appointment_status: appt.status,
    remarks: appt.payment.remarks,
    verified_at: appt.payment.verified_at,
  }
}

export const mockAppointmentStore = {
  getAllRecords(): AppointmentDetail[] {
    return readStore().map((r) => r.appointment)
  },

  getAll(patientId: string): AppointmentDetail[] {
    return readStore()
      .map((r) => r.appointment)
      .filter((a) => a.patient_id === patientId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  },

  getById(id: string, patientId?: string): AppointmentDetail | null {
    const record = readStore().find((r) => r.appointment.id === id)
    if (!record) return null
    if (patientId && record.appointment.patient_id !== patientId) return null
    return record.appointment
  },

  getByIdForStaff(id: string): AppointmentDetail | null {
    return readStore().find((r) => r.appointment.id === id)?.appointment ?? null
  },

  create(
    patientId: string,
    input: BookAppointmentInput,
    patientName = 'Patient',
    patientEmail: string | null = null,
  ): AppointmentDetail {
    const doctor = getMockDoctorById(input.doctor_id)
    if (!doctor) throw new Error('Doctor not found')

    const clinic = doctor.clinics.find((c) => c.id === input.clinic_id)
    if (!clinic) throw new Error('Clinic not found')

    const now = new Date().toISOString()
    const appointmentId = generateId('appt')
    const paymentId = generateId('pay')

    const appointment: AppointmentDetail = {
      id: appointmentId,
      patient_id: patientId,
      patient_name: patientName,
      patient_email: patientEmail,
      doctor_id: input.doctor_id,
      clinic_id: input.clinic_id,
      appointment_date: input.appointment_date,
      appointment_time: input.appointment_time,
      status: 'pending',
      symptoms: input.symptoms ?? null,
      notes: null,
      created_at: now,
      updated_at: now,
      doctor_name: doctor.full_name,
      doctor_specialty: doctor.specialty,
      clinic_name: clinic.name,
      clinic_address: clinic.address,
      clinic_city: clinic.city,
      consultation_fee: doctor.consultation_fee,
      payment: {
        id: paymentId,
        appointment_id: appointmentId,
        patient_id: patientId,
        amount: doctor.consultation_fee,
        status: 'pending',
        screenshot_url: null,
        remarks: null,
        submitted_at: null,
        verified_at: null,
        created_at: now,
      },
    }

    const records = readStore()
    records.push({ appointment })
    writeStore(records)
    return appointment
  },

  submitPayment(appointmentId: string, patientId: string, screenshotUrl: string): AppointmentDetail {
    const records = readStore()
    const index = records.findIndex((r) => r.appointment.id === appointmentId)
    if (index === -1) throw new Error('Appointment not found')

    const appt = records[index].appointment
    if (appt.patient_id !== patientId) throw new Error('Unauthorized')
    if (!appt.payment) throw new Error('Payment record not found')
    if (appt.payment.status === 'submitted') throw new Error('Payment already under review')
    if (appt.payment.status === 'verified') throw new Error('Payment already verified')
    if (appt.status !== 'pending') throw new Error('Cannot upload payment at this stage')
    if (!['pending', 'rejected'].includes(appt.payment.status)) throw new Error('Cannot upload payment')

    const now = new Date().toISOString()
    appt.status = 'payment_submitted'
    appt.updated_at = now
    appt.payment = {
      ...appt.payment,
      status: 'submitted',
      screenshot_url: screenshotUrl,
      submitted_at: now,
      remarks: null,
      verified_at: null,
    }

    records[index] = { appointment: appt }
    writeStore(records)
    return appt
  },

  verifyPayment(appointmentId: string, _assistantId: string, remarks?: string): AppointmentDetail {
    const records = readStore()
    const index = records.findIndex((r) => r.appointment.id === appointmentId)
    if (index === -1) throw new Error('Appointment not found')

    const appt = records[index].appointment
    if (appt.status !== 'payment_submitted' || appt.payment?.status !== 'submitted') {
      throw new Error('Payment is not pending verification')
    }

    const now = new Date().toISOString()
    appt.status = 'verified'
    appt.updated_at = now
    appt.payment = {
      ...appt.payment,
      status: 'verified',
      remarks: remarks ?? 'Payment verified successfully',
      verified_at: now,
    }

    records[index] = { appointment: appt }
    writeStore(records)
    return appt
  },

  rejectPayment(appointmentId: string, _assistantId: string, remarks: string): AppointmentDetail {
    const records = readStore()
    const index = records.findIndex((r) => r.appointment.id === appointmentId)
    if (index === -1) throw new Error('Appointment not found')

    const appt = records[index].appointment
    if (appt.status !== 'payment_submitted' || appt.payment?.status !== 'submitted') {
      throw new Error('Payment is not pending verification')
    }

    const now = new Date().toISOString()
    appt.status = 'pending'
    appt.updated_at = now
    appt.payment = {
      ...appt.payment,
      status: 'rejected',
      remarks,
      verified_at: now,
    }

    records[index] = { appointment: appt }
    writeStore(records)
    return appt
  },

  updateStatus(appointmentId: string, status: AppointmentStatus, paymentStatus?: PaymentStatus, remarks?: string): AppointmentDetail {
    const records = readStore()
    const index = records.findIndex((r) => r.appointment.id === appointmentId)
    if (index === -1) throw new Error('Appointment not found')

    const appt = records[index].appointment
    const now = new Date().toISOString()
    appt.status = status
    appt.updated_at = now

    if (appt.payment && paymentStatus) {
      appt.payment = {
        ...appt.payment,
        status: paymentStatus,
        remarks: remarks ?? appt.payment.remarks,
        verified_at: paymentStatus === 'verified' || paymentStatus === 'rejected' ? now : appt.payment.verified_at,
      }
    }

    records[index] = { appointment: appt }
    writeStore(records)
    return appt
  },

  getPendingVerifications(): PaymentVerificationItem[] {
    return this.getAllRecords()
      .filter((a) => a.status === 'payment_submitted' && a.payment?.status === 'submitted')
      .map(toVerificationItem)
      .filter((v): v is PaymentVerificationItem => v !== null)
      .sort((a, b) => (b.submitted_at ?? '').localeCompare(a.submitted_at ?? ''))
  },

  getCompletedVerifications(): CompletedVerificationItem[] {
    return this.getAllRecords()
      .map(toCompletedItem)
      .filter((v): v is CompletedVerificationItem => v !== null)
      .sort((a, b) => (b.verified_at ?? '').localeCompare(a.verified_at ?? ''))
  },

  getAssistantStats(): AssistantVerificationStats {
    const completed = this.getCompletedVerifications()
    return {
      pending: this.getPendingVerifications().length,
      verifiedToday: completed.filter(
        (c) => c.payment_status === 'verified' && c.verified_at && isToday(c.verified_at),
      ).length,
      rejectedToday: completed.filter(
        (c) => c.payment_status === 'rejected' && c.verified_at && isToday(c.verified_at),
      ).length,
    }
  },

  getAllPaymentsForAdmin(): AdminPaymentRecord[] {
    return this.getAllRecords()
      .filter((a) => a.payment)
      .map((a) => ({
        payment_id: a.payment!.id,
        appointment_id: a.id,
        patient_name: a.patient_name,
        doctor_name: a.doctor_name,
        amount: a.payment!.amount,
        payment_status: a.payment!.status,
        appointment_status: a.status,
        screenshot_url: a.payment!.screenshot_url,
        submitted_at: a.payment!.submitted_at,
        verified_at: a.payment!.verified_at,
        remarks: a.payment!.remarks,
      }))
      .sort((a, b) => (b.submitted_at ?? '').localeCompare(a.submitted_at ?? ''))
  },

  getStats(patientId: string): PatientAppointmentStats {
    const appointments = this.getAll(patientId)
    const upcoming = appointments.filter(
      (a) => !['completed', 'cancelled'].includes(a.status),
    ).length
    const pendingPayments = appointments.filter(
      (a) => a.status === 'pending' || a.payment?.status === 'submitted',
    ).length

    return { upcoming, pendingPayments, total: appointments.length }
  },

  toSummary(appointment: AppointmentDetail): AppointmentSummary {
    return {
      id: appointment.id,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      status: appointment.status,
      doctor_name: appointment.doctor_name,
      clinic_name: appointment.clinic_name,
      consultation_fee: appointment.consultation_fee,
      payment_status: appointment.payment?.status ?? null,
    }
  },
}
