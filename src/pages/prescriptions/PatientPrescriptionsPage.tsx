import { PageHeader } from '@/components/common/PageHeader'
import { PrescriptionCard } from '@/features/prescriptions/components/PrescriptionCard'
import { usePatientPrescriptions } from '@/features/prescriptions/hooks/use-prescriptions'
import { useAuth } from '@/hooks/use-auth'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Lock } from 'lucide-react'

export function PatientPrescriptionsPage() {
  const { user } = useAuth()
  const { data: prescriptions, isLoading, isError, refetch } = usePatientPrescriptions(user?.id)

  return (
    <div>
      <PageHeader
        title="My Prescriptions"
        description="View and download prescriptions from your doctors"
      />

      <Card className="mb-6 glass">
        <CardContent className="p-4 flex items-start gap-3">
          <Lock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Prescriptions are final and cannot be edited. You can print or download them for your records.
          </p>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState title="Failed to load prescriptions" onRetry={() => refetch()} />}

      {!isLoading && prescriptions?.length === 0 && (
        <EmptyState title="No prescriptions yet" description="Prescriptions from your doctors will appear here." />
      )}

      {!isLoading && prescriptions && prescriptions.length > 0 && (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <PrescriptionCard
              key={rx.id}
              prescription={rx}
              viewHref={`/dashboard/patient/prescriptions/${rx.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
