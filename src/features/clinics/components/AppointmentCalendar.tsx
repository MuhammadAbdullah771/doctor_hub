import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, MapPin, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { APPOINTMENT_STATUS_LABELS } from '@/constants/appointment-status'
import { formatDate, formatTime } from '@/utils/format'
import type { AppointmentDetail } from '@/types/appointment'
import { cn } from '@/lib/utils'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'accent' | 'muted' | 'outline' | 'destructive'> = {
  pending: 'outline',
  payment_submitted: 'secondary',
  verified: 'default',
  confirmed: 'accent',
  completed: 'muted',
  cancelled: 'destructive',
}

interface DoctorAppointmentCardProps {
  appointment: AppointmentDetail
  onConfirm?: (id: string) => void
  onComplete?: (id: string) => void
  isUpdating?: boolean
}

export function DoctorAppointmentCard({
  appointment,
  onConfirm,
  onComplete,
  isUpdating,
}: DoctorAppointmentCardProps) {
  const canConfirm = appointment.status === 'verified'
  const canComplete = appointment.status === 'confirmed'

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                {appointment.patient_name}
              </h3>
              <Badge variant={STATUS_VARIANT[appointment.status] ?? 'outline'}>
                {APPOINTMENT_STATUS_LABELS[appointment.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {appointment.clinic_name}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(appointment.appointment_time)}
            </p>
            {appointment.symptoms && (
              <p className="text-sm text-muted-foreground line-clamp-2">{appointment.symptoms}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {canConfirm && onConfirm && (
              <Button size="sm" disabled={isUpdating} onClick={() => onConfirm(appointment.id)}>
                Confirm
              </Button>
            )}
            {canComplete && onComplete && (
              <Button size="sm" variant="outline" disabled={isUpdating} onClick={() => onComplete(appointment.id)}>
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AppointmentCalendarProps {
  appointments: AppointmentDetail[]
  selectedDate: string
  onDateChange: (date: string) => void
  onConfirm?: (id: string) => void
  onComplete?: (id: string) => void
  isUpdating?: boolean
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function getWeekDates(centerDate: string): string[] {
  const d = new Date(centerDate + 'T12:00:00')
  const day = d.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = addDays(centerDate, mondayOffset)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

export function AppointmentCalendar({
  appointments,
  selectedDate,
  onDateChange,
  onConfirm,
  onComplete,
  isUpdating,
}: AppointmentCalendarProps) {
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate])

  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.appointment_date === selectedDate && a.status !== 'cancelled')
        .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time)),
    [appointments, selectedDate],
  )

  const countByDate = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of appointments) {
      if (a.status === 'cancelled') continue
      map[a.appointment_date] = (map[a.appointment_date] ?? 0) + 1
    }
    return map
  }, [appointments])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" size="icon" onClick={() => onDateChange(addDays(selectedDate, -7))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="font-medium">{formatDate(selectedDate, 'MMMM yyyy')}</p>
        <Button variant="outline" size="icon" onClick={() => onDateChange(addDays(selectedDate, 7))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => {
          const isSelected = date === selectedDate
          const isToday = date === new Date().toISOString().split('T')[0]
          const count = countByDate[date] ?? 0
          const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })

          return (
            <button
              key={date}
              type="button"
              onClick={() => onDateChange(date)}
              className={cn(
                'rounded-xl border p-3 text-center transition-colors',
                isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50',
                isToday && !isSelected && 'border-primary/40',
              )}
            >
              <p className="text-xs text-muted-foreground">{dayLabel}</p>
              <p className="text-lg font-semibold">{new Date(date + 'T12:00:00').getDate()}</p>
              {count > 0 && (
                <span className="inline-block mt-1 text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div>
        <h3 className="font-semibold mb-4">
          {formatDate(selectedDate)} — {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
        </h3>
        {dayAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No appointments scheduled for this day.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {dayAppointments.map((appt) => (
              <DoctorAppointmentCard
                key={appt.id}
                appointment={appt}
                onConfirm={onConfirm}
                onComplete={onComplete}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function useSelectedDate(initial?: string) {
  return useState(initial ?? new Date().toISOString().split('T')[0])
}
