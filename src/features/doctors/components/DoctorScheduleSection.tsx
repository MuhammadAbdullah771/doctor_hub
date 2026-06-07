import { Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DAY_NAMES } from '@/types/doctor'
import { formatTime } from '@/utils/format'
import type { DoctorDetail } from '@/types/doctor'

export function DoctorScheduleSection({ doctor }: { doctor: DoctorDetail }) {
  const clinicMap = Object.fromEntries(doctor.clinics.map((c) => [c.id, c.name]))

  const grouped = doctor.schedules
    .filter((s) => s.is_active)
    .reduce<Record<number, typeof doctor.schedules>>((acc, schedule) => {
      if (!acc[schedule.day_of_week]) acc[schedule.day_of_week] = []
      acc[schedule.day_of_week].push(schedule)
      return acc
    }, {})

  const sortedDays = Object.keys(grouped).map(Number).sort()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Weekly Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedDays.length === 0 ? (
          <p className="text-sm text-muted-foreground">Schedule not available.</p>
        ) : (
          <div className="space-y-3">
            {sortedDays.map((day) => (
              <div
                key={day}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-xl border border-border p-4"
              >
                <div className="w-28 font-medium">{DAY_NAMES[day]}</div>
                <div className="flex flex-wrap gap-2">
                  {grouped[day].map((slot) => (
                    <Badge key={slot.id} variant="outline" className="py-1.5">
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                      <span className="mx-1 text-muted-foreground">·</span>
                      {clinicMap[slot.clinic_id] ?? 'Clinic'}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
