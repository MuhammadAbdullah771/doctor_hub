import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { AppointmentCard } from '@/features/appointments/components/AppointmentCard'
import { usePatientAppointments } from '@/features/appointments/hooks/use-appointments'
import { useAuth } from '@/hooks/use-auth'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export function PatientAppointmentsPage() {
  const { user } = useAuth()
  const { data: appointments, isLoading, isError, refetch } = usePatientAppointments(user?.id)

  return (
    <div>
      <PageHeader
        title="My Appointments"
        description="View and manage your scheduled consultations"
        action={
          <Button asChild>
            <Link to="/doctors">
              <Plus className="h-4 w-4" />
              Book New
            </Link>
          </Button>
        }
      />

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          title="Failed to load appointments"
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && appointments?.length === 0 && (
        <EmptyState
          title="No appointments yet"
          description="Book a consultation with a doctor to get started."
          action={
            <Button asChild>
              <Link to="/doctors">Find Doctors</Link>
            </Button>
          }
        />
      )}

      {!isLoading && appointments && appointments.length > 0 && (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <AppointmentCard key={appt.id} appointment={appt} />
          ))}
        </div>
      )}
    </div>
  )
}
