import { Link } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { PrescriptionCard } from '@/features/prescriptions/components/PrescriptionCard'
import { useDoctorPrescriptions } from '@/features/prescriptions/hooks/use-prescriptions'
import { useAuth } from '@/hooks/use-auth'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export function DoctorPrescriptionsPage() {
  const { user } = useAuth()
  const { data: prescriptions, isLoading, isError, refetch } = useDoctorPrescriptions(user?.id)

  return (
    <div>
      <PageHeader
        title="Prescriptions"
        description="Create and manage patient prescriptions"
        action={
          <Button asChild>
            <Link to="/dashboard/doctor/patients">
              <Plus className="h-4 w-4" />
              New Prescription
            </Link>
          </Button>
        }
      />

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState title="Failed to load prescriptions" onRetry={() => refetch()} />}

      {!isLoading && prescriptions?.length === 0 && (
        <EmptyState
          title="No prescriptions yet"
          description="Select a patient to create your first prescription."
          action={
            <Button asChild>
              <Link to="/dashboard/doctor/patients">
                <Users className="h-4 w-4" />
                View Patients
              </Link>
            </Button>
          }
        />
      )}

      {!isLoading && prescriptions && prescriptions.length > 0 && (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <PrescriptionCard
              key={rx.id}
              prescription={rx}
              viewHref={`/dashboard/doctor/prescriptions/${rx.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
