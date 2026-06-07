import { PublicLayout } from '@/layouts/PublicLayout'
import { usePageSeo } from '@/hooks/use-page-seo'
import { DoctorCard } from '@/features/doctors/components/DoctorCard'
import { DoctorFiltersPanel } from '@/features/doctors/components/DoctorFiltersPanel'
import { useDoctors, useDoctorFilterOptions } from '@/features/doctors/hooks/use-doctors'
import { useDoctorFiltersFromUrl } from '@/features/doctors/hooks/use-doctor-filters'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Search, Stethoscope } from 'lucide-react'

export function DoctorsListingPage() {
  usePageSeo({
    title: 'Find Doctors',
    description: 'Search verified doctors in Karachi, Lahore, Islamabad and other cities across Pakistan.',
  })

  const { filters, setFilter, clearFilters, activeFilterCount } = useDoctorFiltersFromUrl()
  const { data: doctors, isLoading, isError, refetch } = useDoctors(filters)
  const { data: options } = useDoctorFilterOptions()

  const filterOptions = options ?? {
    diseases: [],
    specialties: [],
    treatments: [],
    cities: [],
    clinics: [],
  }

  return (
    <PublicLayout>
      <section className="relative overflow-hidden gradient-hero border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.15),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-4 py-1.5 text-sm font-semibold text-primary mb-6 backdrop-blur-sm">
              <Stethoscope className="h-4 w-4" />
              Pakistan Healthcare Network
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Find trusted doctors in{' '}
              <span className="gradient-text">Karachi, Lahore & Islamabad</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Search and filter by disease, specialty, treatment, experience, rating, clinic, and city across Pakistan.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          <DoctorFiltersPanel
            filters={filters}
            options={filterOptions}
            onFilterChange={setFilter}
            onClear={clearFilters}
            activeCount={activeFilterCount}
          />

          <div>
            {!isLoading && doctors && (
              <div className="flex items-center gap-2 mb-6 glass rounded-xl px-4 py-3">
                <Search className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">
                  <span className="text-primary font-bold">{doctors.length}</span>
                  {' '}doctor{doctors.length !== 1 ? 's' : ''} found
                </p>
              </div>
            )}

            {isLoading && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 rounded-xl" />
                ))}
              </div>
            )}

            {isError && (
              <ErrorState
                title="Failed to load doctors"
                message="Could not fetch doctor listings. Please try again."
                onRetry={() => refetch()}
              />
            )}

            {!isLoading && !isError && doctors?.length === 0 && (
              <EmptyState
                title="No doctors found"
                description="Try adjusting your filters or search terms."
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            )}

            {!isLoading && !isError && doctors && doctors.length > 0 && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {doctors.map((doctor, index) => (
                  <DoctorCard key={doctor.id} doctor={doctor} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
