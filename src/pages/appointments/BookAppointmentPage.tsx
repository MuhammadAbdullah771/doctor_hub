import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PublicLayout } from '@/layouts/PublicLayout'
import { useDoctor } from '@/features/doctors/hooks/use-doctors'
import { useAuth } from '@/hooks/use-auth'
import { BookAppointmentForm } from '@/features/appointments/components/BookAppointmentForm'
import { ErrorState } from '@/components/common/ErrorState'
import { PageSkeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/format'
import { getDashboardRoute } from '@/constants/roles'

export function BookAppointmentPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile, isLoading: authLoading, isAuthenticated } = useAuth()
  const { data: doctor, isLoading, isError, refetch } = useDoctor(id)

  if (authLoading) return <PageSkeleton />

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: `/doctors/${id}/book` }} replace />
  }

  if (profile && profile.role !== 'patient') {
    return <Navigate to={getDashboardRoute(profile.role)} replace />
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-6 -ml-2" asChild>
          <Link to={`/doctors/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </Link>
        </Button>

        {isLoading && <PageSkeleton />}

        {isError && (
          <ErrorState
            title="Doctor not found"
            message="Cannot book appointment for this doctor."
            onRetry={() => refetch()}
          />
        )}

        {doctor && (
          <>
            <div className="glass rounded-2xl p-6 mb-8 flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={doctor.avatar_url ?? undefined} />
                <AvatarFallback name={doctor.full_name} className="text-lg" />
              </Avatar>
              <div>
                <h1 className="text-xl font-bold">Book Appointment</h1>
                <p className="text-muted-foreground">{doctor.full_name} · {doctor.specialty}</p>
                <Badge variant="outline" className="mt-2">{formatCurrency(doctor.consultation_fee)}</Badge>
              </div>
            </div>

            <BookAppointmentForm doctor={doctor} patientId={user.id} />
          </>
        )}
      </div>
    </PublicLayout>
  )
}
