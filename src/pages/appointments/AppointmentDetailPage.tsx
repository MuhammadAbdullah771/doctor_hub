import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, MapPin, User, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { AppointmentTimeline } from '@/features/appointments/components/AppointmentTimeline'
import { PaymentUploadSection } from '@/features/appointments/components/PaymentUploadSection'
import { ReviewForm } from '@/features/reviews/components/ReviewForm'
import { ReviewsList } from '@/features/reviews/components/ReviewsList'
import { useAppointment, useCancelAppointment } from '@/features/appointments/hooks/use-appointments'
import { useAppointmentReview } from '@/features/reviews/hooks/use-reviews'
import { useAuth } from '@/hooks/use-auth'
import { APPOINTMENT_STATUS_LABELS } from '@/constants/appointment-status'
import { ErrorState } from '@/components/common/ErrorState'
import { PageSkeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, formatTime } from '@/utils/format'

export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: appointment, isLoading, isError, refetch } = useAppointment(id, user?.id)
  const { data: existingReview, refetch: refetchReview } = useAppointmentReview(id, user?.id)
  const cancelMutation = useCancelAppointment(user?.id)

  const canReview = appointment?.status === 'completed' && !existingReview

  const canCancel = appointment && ['pending', 'payment_submitted'].includes(appointment.status)

  const handleCancel = async () => {
    if (!appointment || !window.confirm('Are you sure you want to cancel this appointment?')) return
    try {
      await cancelMutation.mutateAsync(appointment.id)
      toast.success('Appointment cancelled')
      refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cancellation failed')
    }
  }

  if (isLoading) return <PageSkeleton />

  if (isError || !appointment) {
    return (
      <ErrorState
        title="Appointment not found"
        message="This appointment does not exist or you don't have access."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div>
      <Button variant="ghost" className="mb-4 -ml-2" asChild>
        <Link to="/dashboard/patient/appointments">
          <ArrowLeft className="h-4 w-4" />
          Back to appointments
        </Link>
      </Button>

      <PageHeader
        title="Appointment Details"
        description={`${appointment.doctor_name} · ${formatDate(appointment.appointment_date)}`}
        action={
          canCancel ? (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
          ) : undefined
        }
      />

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentTimeline status={appointment.status} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle>Appointment Info</CardTitle>
                <Badge>{APPOINTMENT_STATUS_LABELS[appointment.status]}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Doctor</p>
                    <p className="font-medium">{appointment.doctor_name}</p>
                    <p className="text-sm text-muted-foreground">{appointment.doctor_specialty}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Clinic</p>
                    <p className="font-medium">{appointment.clinic_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.clinic_address}, {appointment.clinic_city}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(appointment.appointment_date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{formatTime(appointment.appointment_time)}</p>
                  </div>
                </div>
              </div>

              {appointment.symptoms && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium mb-1">Symptoms / Reason</p>
                  <p className="text-sm text-muted-foreground">{appointment.symptoms}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Consultation Fee</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(appointment.consultation_fee)}
                </span>
              </div>
            </CardContent>
          </Card>

          {appointment.status !== 'cancelled' && user && (
            <PaymentUploadSection appointment={appointment} patientId={user.id} />
          )}

          {canReview && user && (
            <ReviewForm
              patientId={user.id}
              doctorId={appointment.doctor_id}
              doctorName={appointment.doctor_name}
              appointmentId={appointment.id}
              onSuccess={() => refetchReview()}
            />
          )}

          {existingReview && (
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Your Review</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewsList reviews={[existingReview]} live={false} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
