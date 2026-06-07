import { Star } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { usePageSeo } from '@/hooks/use-page-seo'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { formatCurrency } from '@/utils/format'

export function AdminDoctorsPage() {
  usePageSeo({ title: 'Doctors', description: 'Verified doctors across Pakistan.' })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id, specialty, experience_years, consultation_fee, rating_avg, rating_count, is_verified,
          profile:profiles(full_name, city, email),
          clinics(name, city)
        `)
        .order('rating_avg', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Doctors" description="Healthcare providers registered on the platform" />

      {isLoading && <Skeleton className="h-64 rounded-xl" />}
      {isError && <ErrorState title="Failed to load doctors" onRetry={() => refetch()} />}

      {!isLoading && data && (
        <div className="space-y-3">
          {data.map((row) => {
            const doctor = row as Record<string, unknown>
            const profile = doctor.profile as { full_name: string; city: string | null; email: string }
            const clinics = (doctor.clinics as { name: string; city: string }[]) ?? []
            const primary = clinics[0]

            return (
              <Card key={doctor.id as string} className="card-elevated">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{profile.full_name}</p>
                      {(doctor.is_verified as boolean) && <Badge variant="accent">Verified</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{doctor.specialty as string}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {primary ? `${primary.name}, ${primary.city}` : profile.city ?? 'Pakistan'}
                    </p>
                  </div>
                  <div className="text-sm text-right space-y-1">
                    <p className="font-semibold text-primary">{formatCurrency(Number(doctor.consultation_fee))}</p>
                    <p className="flex items-center justify-end gap-1 text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {Number(doctor.rating_avg).toFixed(1)} ({doctor.rating_count as number})
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
