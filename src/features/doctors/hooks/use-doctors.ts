import { useQuery } from '@tanstack/react-query'
import { doctorService } from '@/features/doctors/services/doctor.service'
import type { DoctorFilters } from '@/types/doctor'

export function useDoctors(filters: DoctorFilters) {
  return useQuery({
    queryKey: ['doctors', filters],
    queryFn: () => doctorService.getDoctors(filters),
  })
}

export function useDoctor(id: string | undefined) {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => doctorService.getDoctorById(id!),
    enabled: !!id,
  })
}

export function useDoctorFilterOptions() {
  return useQuery({
    queryKey: ['doctor-filter-options'],
    queryFn: () => doctorService.getFilterOptions(),
    staleTime: 1000 * 60 * 10,
  })
}
