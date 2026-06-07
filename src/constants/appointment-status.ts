import type { AppointmentStatus } from '@/types'

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pending',
  payment_submitted: 'Payment Submitted',
  verified: 'Verified',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const APPOINTMENT_TIMELINE_STEPS: {
  key: AppointmentStatus
  label: string
}[] = [
  { key: 'pending', label: 'Booked' },
  { key: 'payment_submitted', label: 'Payment Submitted' },
  { key: 'verified', label: 'Verified' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
]

export function getAppointmentStepIndex(status: AppointmentStatus): number {
  const index = APPOINTMENT_TIMELINE_STEPS.findIndex((s) => s.key === status)
  return index === -1 ? 0 : index
}
