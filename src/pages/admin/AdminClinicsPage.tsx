import { Building2, MapPin, Stethoscope } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { useAdminClinics } from '@/features/clinics/hooks/use-clinics'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AdminClinicsPage() {
  const { data: clinics, isLoading, isError, refetch } = useAdminClinics()

  return (
    <div>
      <PageHeader
        title="All Clinics"
        description="Monitor clinic locations across the platform (Supabase)"
      />

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState title="Failed to load clinics" onRetry={() => refetch()} />}

      {!isLoading && clinics?.length === 0 && (
        <EmptyState title="No clinics registered" description="Doctors can add clinics from their dashboard." />
      )}

      {!isLoading && clinics && clinics.length > 0 && (
        <div className="space-y-4">
          {clinics.map((clinic) => (
            <Card key={clinic.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{clinic.name}</h3>
                      {clinic.is_primary && <Badge variant="accent">Primary</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {clinic.address}, {clinic.city}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {clinic.doctor_name} · {clinic.doctor_specialty}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
