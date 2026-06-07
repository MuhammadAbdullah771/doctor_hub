import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { CreatePrescriptionForm } from '@/features/prescriptions/components/CreatePrescriptionForm'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/EmptyState'

export function DoctorCreatePrescriptionPage() {
  const { user, profile } = useAuth()
  const [params] = useSearchParams()
  const patientId = params.get('patientId')
  const patientName = params.get('patientName') ?? 'Patient'

  if (!patientId || !user) {
    return (
      <EmptyState
        title="No patient selected"
        description="Select a patient from the patients list to create a prescription."
        action={
          <Button asChild>
            <Link to="/dashboard/doctor/patients">Go to Patients</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div>
      <Button variant="ghost" className="mb-4 -ml-2" asChild>
        <Link to="/dashboard/doctor/patients">
          <ArrowLeft className="h-4 w-4" />
          Back to patients
        </Link>
      </Button>

      <PageHeader
        title="Create Prescription"
        description={`New prescription for ${patientName}`}
      />

      <CreatePrescriptionForm
        patientId={patientId}
        patientName={patientName}
        doctorId={user.id}
        doctorName={profile?.full_name ?? 'Doctor'}
        doctorSpecialty={null}
      />
    </div>
  )
}
