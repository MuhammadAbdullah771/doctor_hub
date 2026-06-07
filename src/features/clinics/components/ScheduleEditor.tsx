import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { scheduleSchema, type ScheduleFormValues } from '@/features/clinics/schemas/clinic.schema'
import { useCreateSchedule } from '@/features/clinics/hooks/use-clinics'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DAY_NAMES, type Clinic } from '@/types/doctor'

interface ScheduleEditorProps {
  doctorId: string
  clinics: Clinic[]
  onSuccess?: () => void
}

const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7
  const min = i % 2 === 0 ? '00' : '30'
  const value = `${String(hour).padStart(2, '0')}:${min}`
  return { value, label: value }
})

const SLOT_OPTIONS = [15, 20, 30, 45, 60].map((m) => ({
  value: String(m),
  label: `${m} min`,
}))

export function ScheduleEditor({ doctorId, clinics, onSuccess }: ScheduleEditorProps) {
  const createMutation = useCreateSchedule(doctorId)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      clinic_id: clinics[0]?.id ?? '',
      day_of_week: 1,
      start_time: '09:00',
      end_time: '17:00',
      slot_duration_minutes: 30,
      is_active: true,
    },
  })

  const onSubmit = async (data: ScheduleFormValues) => {
    try {
      await createMutation.mutateAsync(data)
      toast.success('Schedule slot added')
      reset({
        clinic_id: data.clinic_id,
        day_of_week: data.day_of_week,
        start_time: '09:00',
        end_time: '17:00',
        slot_duration_minutes: 30,
        is_active: true,
      })
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add schedule')
    }
  }

  if (clinics.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Add a clinic first before setting your schedule.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Schedule Slot</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div>
            <Label>Clinic</Label>
            <Select
              value={watch('clinic_id')}
              onChange={(e) => setValue('clinic_id', e.target.value, { shouldValidate: true })}
              options={clinics.map((c) => ({
                value: c.id,
                label: `${c.name} — ${c.city}`,
              }))}
            />
            <input type="hidden" {...register('clinic_id')} />
            {errors.clinic_id && <p className="text-sm text-destructive mt-1">{errors.clinic_id.message}</p>}
          </div>
          <div>
            <Label>Day</Label>
            <Select
              value={String(watch('day_of_week'))}
              onChange={(e) => setValue('day_of_week', Number(e.target.value), { shouldValidate: true })}
              options={DAY_NAMES.map((day, index) => ({ value: String(index), label: day }))}
            />
            <input type="hidden" {...register('day_of_week')} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>Start Time</Label>
              <Select
                value={watch('start_time')}
                onChange={(e) => setValue('start_time', e.target.value, { shouldValidate: true })}
                options={TIME_OPTIONS}
              />
              <input type="hidden" {...register('start_time')} />
            </div>
            <div>
              <Label>End Time</Label>
              <Select
                value={watch('end_time')}
                onChange={(e) => setValue('end_time', e.target.value, { shouldValidate: true })}
                options={TIME_OPTIONS}
              />
              <input type="hidden" {...register('end_time')} />
            </div>
            <div>
              <Label>Slot Duration</Label>
              <Select
                value={String(watch('slot_duration_minutes'))}
                onChange={(e) =>
                  setValue('slot_duration_minutes', Number(e.target.value), { shouldValidate: true })
                }
                options={SLOT_OPTIONS}
              />
              <input type="hidden" {...register('slot_duration_minutes')} />
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>Add Slot</Button>
        </CardContent>
      </form>
    </Card>
  )
}
