import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { PrescriptionViewer } from '@/features/prescriptions/components/PrescriptionViewer'
import { usePrescription } from '@/features/prescriptions/hooks/use-prescriptions'
import { useAuth } from '@/hooks/use-auth'
import { ErrorState } from '@/components/common/ErrorState'
import { PageSkeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const { data: prescription, isLoading, isError, refetch } = usePrescription(id)

  const isPatient = profile?.role === 'patient'
  const isDoctor = profile?.role === 'doctor'
  const backHref = isPatient
    ? '/dashboard/patient/prescriptions'
    : '/dashboard/doctor/prescriptions'

  const hasAccess =
    prescription &&
    user &&
    (prescription.patient_id === user.id || prescription.doctor_id === user.id || profile?.role === 'admin')

  if (isLoading) return <PageSkeleton />

  if (isError || !prescription || !hasAccess) {
    return (
      <ErrorState
        title="Prescription not found"
        message="This prescription does not exist or you don't have access."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div>
      <Button variant="ghost" className="mb-4 -ml-2" asChild>
        <Link to={backHref}>
          <ArrowLeft className="h-4 w-4" />
          Back to prescriptions
        </Link>
      </Button>

      <PageHeader
        title="Prescription Details"
        description={`Issued by Dr. ${prescription.doctor_name}`}
      />

      <PrescriptionViewer prescription={prescription} showActions={isPatient || isDoctor} />
    </div>
  )
}
