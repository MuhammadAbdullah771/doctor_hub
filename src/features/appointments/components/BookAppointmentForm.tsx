import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Calendar, Clock, Building } from 'lucide-react'
import {
  bookAppointmentSchema,
  type BookAppointmentFormData,
} from '@/features/appointments/schemas/book-appointment.schema'
import { useBookAppointment } from '@/features/appointments/hooks/use-appointments'
import {
  generateTimeSlots,
  getMinBookingDate,
  getMaxBookingDate,
  isDateAvailable,
} from '@/features/appointments/utils/slots'
import type { DoctorDetail } from '@/types/doctor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PaymentInstructionsCard } from '@/components/common/PaymentInstructionsCard'
import { usePlatformSettings } from '@/features/platform-settings/hooks/use-platform-settings'
import { formatCurrency } from '@/utils/format'

interface BookAppointmentFormProps {
  doctor: DoctorDetail
  patientId: string
}

export function BookAppointmentForm({ doctor, patientId }: BookAppointmentFormProps) {
  const navigate = useNavigate()
  const bookMutation = useBookAppointment(patientId)
  const { data: platformSettings } = usePlatformSettings()
  const [selectedClinicId, setSelectedClinicId] = useState(doctor.clinics[0]?.id ?? '')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookAppointmentFormData>({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues: {
      clinic_id: doctor.clinics[0]?.id ?? '',
      appointment_date: '',
      appointment_time: '',
      symptoms: '',
    },
  })

  const clinicId = watch('clinic_id') || selectedClinicId
  const appointmentDate = watch('appointment_date')

  useEffect(() => {
    if (selectedClinicId) {
      setValue('clinic_id', selectedClinicId, { shouldValidate: true })
    }
  }, [selectedClinicId, setValue])

  useEffect(() => {
    setValue('appointment_time', '')
  }, [clinicId, appointmentDate, setValue])

  const timeSlots = useMemo(() => {
    if (!clinicId || !appointmentDate) return []
    return generateTimeSlots(doctor.schedules, clinicId, appointmentDate)
  }, [doctor.schedules, clinicId, appointmentDate])

  const selectedClinic = doctor.clinics.find((c) => c.id === clinicId)

  const onSubmit = async (data: BookAppointmentFormData) => {
    try {
      const appointment = await bookMutation.mutateAsync({
        doctor_id: doctor.id,
        clinic_id: data.clinic_id,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        symptoms: data.symptoms,
      })
      toast.success('Appointment booked! Please upload your payment screenshot.')
      navigate(`/dashboard/patient/appointments/${appointment.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Booking failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Select Clinic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Clinic</Label>
            <Select
              value={clinicId}
              onChange={(e) => {
                setSelectedClinicId(e.target.value)
                setValue('clinic_id', e.target.value, { shouldValidate: true })
              }}
              options={doctor.clinics.map((c) => ({
                value: c.id,
                label: `${c.name} — ${c.city}`,
              }))}
            />
            <input type="hidden" {...register('clinic_id')} />
            {errors.clinic_id && (
              <p className="text-sm text-destructive">{errors.clinic_id.message}</p>
            )}
          </div>
          {selectedClinic && (
            <p className="text-sm text-muted-foreground">
              {selectedClinic.address}, {selectedClinic.city}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appointment_date">Appointment Date</Label>
            <Input
              id="appointment_date"
              type="date"
              min={getMinBookingDate()}
              max={getMaxBookingDate()}
              {...register('appointment_date')}
            />
            {errors.appointment_date && (
              <p className="text-sm text-destructive">{errors.appointment_date.message}</p>
            )}
            {appointmentDate && clinicId && !isDateAvailable(doctor.schedules, clinicId, appointmentDate) && (
              <p className="text-sm text-destructive">Doctor is not available on this date at the selected clinic.</p>
            )}
          </div>

          {timeSlots.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Available Time Slots
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlots.map((slot) => (
                  <label
                    key={slot}
                    className="cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={slot}
                      className="peer sr-only"
                      {...register('appointment_time')}
                    />
                    <Badge
                      variant="outline"
                      className="w-full justify-center py-2 peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary hover:bg-muted transition-colors"
                    >
                      {slot}
                    </Badge>
                  </label>
                ))}
              </div>
              {errors.appointment_time && (
                <p className="text-sm text-destructive">{errors.appointment_time.message}</p>
              )}
            </div>
          )}

          {appointmentDate && clinicId && timeSlots.length === 0 && isDateAvailable(doctor.schedules, clinicId, appointmentDate) === false && (
            <p className="text-sm text-muted-foreground">No slots available. Please choose another date.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Symptoms / Reason for Visit</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="flex min-h-[100px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Describe your symptoms or reason for consultation (optional)"
            {...register('symptoms')}
          />
        </CardContent>
      </Card>

      {platformSettings && (
        <PaymentInstructionsCard
          settings={platformSettings}
          amount={doctor.consultation_fee}
        />
      )}

      <Card className="glass">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Consultation Fee</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(doctor.consultation_fee)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Payment screenshot required after booking
            </p>
          </div>
          <Button type="submit" size="lg" disabled={isSubmitting || bookMutation.isPending}>
            {isSubmitting || bookMutation.isPending ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
