import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DOCTOR_TYPES } from '@/constants/doctor-types'
import { cn } from '@/lib/utils'

interface DoctorFiltersPanelProps {
  filters: {
    search?: string
    disease?: string
    specialty?: string
    treatment?: string
    experience?: number
    rating?: number
    clinic?: string
    city?: string
    doctor_type?: string
  }
  options: {
    diseases: string[]
    specialties: string[]
    treatments: string[]
    cities: string[]
    clinics: string[]
  }
  onFilterChange: (key: string, value: string | number | undefined) => void
  onClear: () => void
  activeCount: number
}

const EXPERIENCE_OPTIONS = [
  { value: '5', label: '5+ years' },
  { value: '10', label: '10+ years' },
  { value: '15', label: '15+ years' },
  { value: '20', label: '20+ years' },
]

const RATING_OPTIONS = [
  { value: '4', label: '4+ stars' },
  { value: '4.5', label: '4.5+ stars' },
  { value: '4.8', label: '4.8+ stars' },
]

export function DoctorFiltersPanel({
  filters,
  options,
  onFilterChange,
  onClear,
  activeCount,
}: DoctorFiltersPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const filterFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Name, specialty, disease..."
          value={filters.search ?? ''}
          onChange={(e) => onFilterChange('search', e.target.value || undefined)}
        />
      </div>

      <div className="space-y-2">
        <Label>Disease</Label>
        <Select
          placeholder="All diseases"
          value={filters.disease ?? 'all'}
          onChange={(e) => onFilterChange('disease', e.target.value === 'all' ? undefined : e.target.value)}
          options={options.diseases.map((d) => ({ value: d, label: d }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Specialty</Label>
        <Select
          placeholder="All specialties"
          value={filters.specialty ?? 'all'}
          onChange={(e) => onFilterChange('specialty', e.target.value === 'all' ? undefined : e.target.value)}
          options={options.specialties.map((s) => ({ value: s, label: s }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Treatment Type</Label>
        <Select
          placeholder="All treatments"
          value={filters.treatment ?? 'all'}
          onChange={(e) => onFilterChange('treatment', e.target.value === 'all' ? undefined : e.target.value)}
          options={options.treatments.map((t) => ({ value: t, label: t }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Doctor Type</Label>
        <Select
          placeholder="All types"
          value={filters.doctor_type ?? 'all'}
          onChange={(e) => onFilterChange('type', e.target.value === 'all' ? undefined : e.target.value)}
          options={DOCTOR_TYPES.map((t) => ({ value: t.value, label: t.label }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Experience</Label>
        <Select
          placeholder="Any experience"
          value={filters.experience?.toString() ?? 'all'}
          onChange={(e) => onFilterChange('experience', e.target.value === 'all' ? undefined : Number(e.target.value))}
          options={EXPERIENCE_OPTIONS}
        />
      </div>

      <div className="space-y-2">
        <Label>Minimum Rating</Label>
        <Select
          placeholder="Any rating"
          value={filters.rating?.toString() ?? 'all'}
          onChange={(e) => onFilterChange('rating', e.target.value === 'all' ? undefined : Number(e.target.value))}
          options={RATING_OPTIONS}
        />
      </div>

      <div className="space-y-2">
        <Label>Clinic</Label>
        <Select
          placeholder="All clinics"
          value={filters.clinic ?? 'all'}
          onChange={(e) => onFilterChange('clinic', e.target.value === 'all' ? undefined : e.target.value)}
          options={options.clinics.map((c) => ({ value: c, label: c }))}
        />
      </div>

      <div className="space-y-2">
        <Label>City</Label>
        <Select
          placeholder="All cities"
          value={filters.city ?? 'all'}
          onChange={(e) => onFilterChange('city', e.target.value === 'all' ? undefined : e.target.value)}
          options={options.cities.map((c) => ({ value: c, label: c }))}
        />
      </div>

      {activeCount > 0 && (
        <Button variant="outline" className="w-full" onClick={onClear}>
          <X className="h-4 w-4" />
          Clear all filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <Badge variant="default" className="ml-2">{activeCount}</Badge>
          )}
        </Button>
        {mobileOpen && (
          <div className="mt-4 glass rounded-xl p-4">{filterFields}</div>
        )}
      </div>

      <div className={cn('hidden lg:block glass rounded-xl p-5 sticky top-20')}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </h3>
          {activeCount > 0 && (
            <Badge variant="secondary">{activeCount} active</Badge>
          )}
        </div>
        {filterFields}
      </div>
    </>
  )
}
