import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { PublicLayout } from '@/layouts/PublicLayout'
import { useDoctor } from '@/features/doctors/hooks/use-doctors'
import { DoctorProfileHeader } from '@/features/doctors/components/DoctorProfileHeader'
import { DoctorAboutSection } from '@/features/doctors/components/DoctorAboutSection'
import { DoctorClinicsSection } from '@/features/doctors/components/DoctorClinicsSection'
import { DoctorReviewsSection } from '@/features/doctors/components/DoctorReviewsSection'
import { DoctorScheduleSection } from '@/features/doctors/components/DoctorScheduleSection'
import { ErrorState } from '@/components/common/ErrorState'
import { PageSkeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { getDashboardRoute } from '@/constants/roles'

export function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, profile } = useAuth()
  const { data: doctor, isLoading, isError, refetch } = useDoctor(id)

  const handleBook = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to book an appointment')
      navigate('/login', { state: { from: `/doctors/${id}/book` } })
      return
    }
    if (!profile || profile.role !== 'patient') {
      toast.info('Only patients can book appointments')
      navigate(getDashboardRoute(profile?.role ?? 'patient'))
      return
    }
    navigate(`/doctors/${id}/book`)
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-6 -ml-2" asChild>
          <Link to="/doctors">
            <ArrowLeft className="h-4 w-4" />
            Back to doctors
          </Link>
        </Button>

        {isLoading && <PageSkeleton />}

        {isError && (
          <ErrorState
            title="Doctor not found"
            message="We couldn't load this doctor's profile."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && !doctor && (
          <ErrorState
            title="Doctor not found"
            message="This doctor profile does not exist."
            onRetry={() => navigate('/doctors')}
          />
        )}

        {doctor && (
          <div className="space-y-8">
            <DoctorProfileHeader doctor={doctor} onBookClick={handleBook} />
            <DoctorAboutSection doctor={doctor} />
            <DoctorScheduleSection doctor={doctor} />
            <DoctorClinicsSection doctor={doctor} />
            <DoctorReviewsSection doctorId={doctor.id} fallbackRating={doctor.rating_avg} />
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
