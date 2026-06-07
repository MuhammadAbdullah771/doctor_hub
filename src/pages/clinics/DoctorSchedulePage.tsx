import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { ScheduleEditor } from '@/features/clinics/components/ScheduleEditor'
import {
  useDoctorClinics,
  useDoctorSchedules,
  useDeleteSchedule,
} from '@/features/clinics/hooks/use-clinics'
import { useAuth } from '@/hooks/use-auth'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DAY_NAMES, type ClinicSchedule } from '@/types/doctor'
import { formatTime } from '@/utils/format'

export function DoctorSchedulePage() {
  const { user } = useAuth()
  const { data: clinics, isLoading: clinicsLoading } = useDoctorClinics(user?.id)
  const { data: schedules, isLoading, isError, refetch } = useDoctorSchedules(user?.id)
  const deleteMutation = useDeleteSchedule(user?.id)

  const clinicMap = Object.fromEntries((clinics ?? []).map((c) => [c.id, c.name]))

  const grouped = (schedules ?? [])
    .filter((s) => s.is_active)
    .reduce<Record<number, ClinicSchedule[]>>((acc, schedule) => {
      if (!acc[schedule.day_of_week]) acc[schedule.day_of_week] = []
      acc[schedule.day_of_week].push(schedule)
      return acc
    }, {})

  const sortedDays = Object.keys(grouped ?? {}).map(Number).sort()

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Remove this schedule slot?')) return
    try {
      await deleteMutation.mutateAsync(scheduleId)
      toast.success('Schedule slot removed')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove slot')
    }
  }

  return (
    <div>
      <PageHeader
        title="Weekly Schedule"
        description="Set your availability at each clinic — synced to Supabase"
      />

      {user?.id && (
        <div className="mb-8">
          <ScheduleEditor doctorId={user.id} clinics={clinics ?? []} />
        </div>
      )}

      {isLoading || clinicsLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : isError ? (
        <ErrorState title="Failed to load schedule" onRetry={() => refetch()} />
      ) : sortedDays.length === 0 ? (
        <EmptyState
          title="No schedule set"
          description="Add time slots above to show availability on your profile."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Current Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedDays.map((day) => (
              <div
                key={day}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-xl border border-border p-4"
              >
                <div className="w-28 font-medium">{DAY_NAMES[day]}</div>
                <div className="flex flex-wrap gap-2 flex-1">
                  {grouped[day]?.map((slot) => (
                    <Badge key={slot.id} variant="outline" className="py-1.5 gap-2">
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                      <span className="text-muted-foreground">· {clinicMap[slot.clinic_id] ?? 'Clinic'}</span>
                      <button
                        type="button"
                        className="ml-1 text-destructive hover:opacity-80"
                        onClick={() => handleDelete(slot.id)}
                        aria-label="Remove slot"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
