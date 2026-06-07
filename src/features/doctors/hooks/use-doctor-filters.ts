import { useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import type { DoctorFilters } from '@/types/doctor'
import type { DoctorType } from '@/types'

export function useDoctorFiltersFromUrl() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters: DoctorFilters = useMemo(() => ({
    search: searchParams.get('search') || undefined,
    disease: searchParams.get('disease') || undefined,
    specialty: searchParams.get('specialty') || undefined,
    treatment: searchParams.get('treatment') || undefined,
    experience: searchParams.get('experience') ? Number(searchParams.get('experience')) : undefined,
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    clinic: searchParams.get('clinic') || undefined,
    city: searchParams.get('city') || undefined,
    doctor_type: (searchParams.get('type') as DoctorType) || undefined,
  }), [searchParams])

  const debouncedSearch = useDebounce(filters.search ?? '', 300)

  const debouncedFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  )

  const setFilter = (key: string, value: string | number | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (value === undefined || value === '' || value === 'all') {
      next.delete(key)
    } else {
      next.set(key, String(value))
    }
    setSearchParams(next, { replace: true })
  }

  const clearFilters = () => setSearchParams({}, { replace: true })

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return { filters: debouncedFilters, setFilter, clearFilters, activeFilterCount, searchParams }
}
