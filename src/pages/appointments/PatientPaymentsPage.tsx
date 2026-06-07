import { Link } from 'react-router-dom'
import { CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { usePatientAppointments } from '@/features/appointments/hooks/use-appointments'
import { useAuth } from '@/hooks/use-auth'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { APPOINTMENT_STATUS_LABELS } from '@/constants/appointment-status'
import { formatCurrency, formatDate, formatTime } from '@/utils/format'

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Awaiting Upload',
  submitted: 'Under Review',
  verified: 'Verified',
  rejected: 'Rejected',
}

const PAYMENT_VARIANT: Record<string, 'outline' | 'secondary' | 'accent' | 'destructive' | 'muted'> = {
  pending: 'outline',
  submitted: 'secondary',
  verified: 'accent',
  rejected: 'destructive',
}

export function PatientPaymentsPage() {
  const { user } = useAuth()
  const { data: appointments, isLoading, isError, refetch } = usePatientAppointments(user?.id)

  const paymentItems = appointments?.filter((a) => a.payment_status !== null) ?? []
  const pendingUpload = paymentItems.filter((a) => a.status === 'pending')
  const underReview = paymentItems.filter((a) => a.payment_status === 'submitted')

  return (
    <div>
      <PageHeader
        title="Payment Status"
        description="Track your payment uploads and verification status"
      />

      {!isLoading && (
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{pendingUpload.length}</p>
                <p className="text-sm text-muted-foreground">Awaiting Upload</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{underReview.length}</p>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{paymentItems.length - pendingUpload.length - underReview.length}</p>
                <p className="text-sm text-muted-foreground">Verified / Complete</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState title="Failed to load payments" onRetry={() => refetch()} />}

      {!isLoading && paymentItems.length === 0 && (
        <EmptyState
          title="No payments yet"
          description="Payment records appear here after you book an appointment."
        />
      )}

      {!isLoading && paymentItems.length > 0 && (
        <div className="space-y-3">
          {paymentItems.map((appt) => (
            <Card key={appt.id}>
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium">{appt.doctor_name}</p>
                    {appt.payment_status && (
                      <Badge variant={PAYMENT_VARIANT[appt.payment_status] ?? 'outline'}>
                        {PAYMENT_STATUS_LABELS[appt.payment_status]}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(appt.appointment_date)} at {formatTime(appt.appointment_time)}
                  </p>
                  <p className="text-sm font-medium text-primary mt-1">
                    {formatCurrency(appt.consultation_fee)}
                  </p>
                  <Badge variant="muted" className="mt-2">
                    {APPOINTMENT_STATUS_LABELS[appt.status]}
                  </Badge>
                </div>
                <Button variant={appt.status === 'pending' ? 'default' : 'outline'} asChild>
                  <Link to={`/dashboard/patient/appointments/${appt.id}`}>
                    {appt.status === 'pending' ? 'Upload Payment' : 'View Details'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
