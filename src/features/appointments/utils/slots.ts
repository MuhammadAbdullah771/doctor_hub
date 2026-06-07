import type { ClinicSchedule } from '@/types/doctor'

export function generateTimeSlots(
  schedules: ClinicSchedule[],
  clinicId: string,
  dateStr: string,
): string[] {
  const date = new Date(`${dateStr}T00:00:00`)
  const dayOfWeek = date.getDay()

  const daySchedules = schedules.filter(
    (s) => s.clinic_id === clinicId && s.day_of_week === dayOfWeek && s.is_active,
  )

  const slots: string[] = []

  for (const schedule of daySchedules) {
    const [startH, startM] = schedule.start_time.split(':').map(Number)
    const [endH, endM] = schedule.end_time.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    for (let m = startMinutes; m + schedule.slot_duration_minutes <= endMinutes; m += schedule.slot_duration_minutes) {
      const h = Math.floor(m / 60)
      const min = m % 60
      slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
    }
  }

  return [...new Set(slots)].sort()
}

export function isDateAvailable(
  schedules: ClinicSchedule[],
  clinicId: string,
  dateStr: string,
): boolean {
  return generateTimeSlots(schedules, clinicId, dateStr).length > 0
}

export function getMinBookingDate(): string {
  return new Date().toISOString().split('T')[0]
}

export function getMaxBookingDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}
