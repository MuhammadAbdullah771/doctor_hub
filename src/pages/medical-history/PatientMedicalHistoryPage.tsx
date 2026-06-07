import { useState } from 'react'
import { Search, Shield } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { MedicalTimeline } from '@/features/medical-history/components/MedicalTimeline'
import { usePatientMedicalHistory } from '@/features/medical-history/hooks/use-medical-history'
import { useAuth } from '@/hooks/use-auth'
import { useDebounce } from '@/hooks/use-debounce'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export function PatientMedicalHistoryPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const { data: records, isLoading, isError, refetch } = usePatientMedicalHistory(user?.id, debouncedSearch || undefined)

  return (
    <div>
      <PageHeader
        title="Medical History"
        description="Your complete medical timeline — records cannot be deleted"
      />

      <Card className="mb-6 glass">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Medical records are permanent and can only be added by your doctor. You can view, search, and download your history at any time.
          </p>
        </CardContent>
      </Card>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, diagnosis, doctor..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState title="Failed to load medical history" onRetry={() => refetch()} />}

      {!isLoading && !isError && records?.length === 0 && (
        <EmptyState
          title="No medical records yet"
          description="Records will appear here after your doctor adds them during consultations."
        />
      )}

      {!isLoading && records && records.length > 0 && (
        <MedicalTimeline records={records} />
      )}
    </div>
  )
}
