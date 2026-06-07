import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, FileText, Pill, ChevronDown, ChevronUp } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { useDoctorPatients } from '@/features/medical-history/hooks/use-medical-history'
import { AddMedicalRecordForm } from '@/features/medical-history/components/AddMedicalRecordForm'
import { useAuth } from '@/hooks/use-auth'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils/format'

export function DoctorPatientsPage() {
  const { user, profile } = useAuth()
  const { data: patients, isLoading, isError, refetch } = useDoctorPatients(user?.id)
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null)
  const [addRecordFor, setAddRecordFor] = useState<string | null>(null)

  return (
    <div>
      <PageHeader
        title="My Patients"
        description="Manage patient records and create prescriptions"
      />

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState title="Failed to load patients" onRetry={() => refetch()} />}

      {!isLoading && patients?.length === 0 && (
        <EmptyState
          title="No patients yet"
          description="Patients appear here after they book appointments with you."
        />
      )}

      {!isLoading && patients && patients.length > 0 && (
        <div className="space-y-4">
          {patients.map((patient) => {
            const isExpanded = expandedPatient === patient.patient_id
            const showAddForm = addRecordFor === patient.patient_id

            return (
              <Card key={patient.patient_id}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{patient.patient_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {patient.appointment_count} appointment{patient.appointment_count !== 1 ? 's' : ''}
                          {patient.last_visit && ` · Last visit ${formatDate(patient.last_visit)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAddRecordFor(showAddForm ? null : patient.patient_id)
                          setExpandedPatient(patient.patient_id)
                        }}
                      >
                        <FileText className="h-4 w-4" />
                        Add Record
                      </Button>
                      <Button size="sm" asChild>
                        <Link
                          to={`/dashboard/doctor/prescriptions/new?patientId=${patient.patient_id}&patientName=${encodeURIComponent(patient.patient_name)}`}
                        >
                          <Pill className="h-4 w-4" />
                          Prescribe
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedPatient(isExpanded ? null : patient.patient_id)
                        }
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {patient.patient_email && (
                          <Badge variant="muted">{patient.patient_email}</Badge>
                        )}
                        <Badge variant="outline">ID: {patient.patient_id.slice(0, 8)}...</Badge>
                      </div>

                      {showAddForm && user && profile && (
                        <AddMedicalRecordForm
                          patientId={patient.patient_id}
                          patientName={patient.patient_name}
                          doctorId={user.id}
                          doctorName={profile.full_name}
                          onSuccess={() => setAddRecordFor(null)}
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
