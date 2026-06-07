import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clinicService } from '@/features/clinics/services/clinic.service'
import type { CreateClinicInput, CreateScheduleInput, UpdateClinicInput } from '@/types/doctor'

export function useDoctorClinics(doctorId: string | undefined) {
  return useQuery({
    queryKey: ['clinics', 'doctor', doctorId],
    queryFn: () => clinicService.getDoctorClinics(doctorId!),
    enabled: !!doctorId,
  })
}

export function useDoctorSchedules(doctorId: string | undefined) {
  return useQuery({
    queryKey: ['clinic-schedules', doctorId],
    queryFn: () => clinicService.getDoctorSchedules(doctorId!),
    enabled: !!doctorId,
  })
}

export function useAdminClinics() {
  return useQuery({
    queryKey: ['clinics', 'admin'],
    queryFn: () => clinicService.getAllClinicsForAdmin(),
  })
}

export function useCreateClinic(doctorId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateClinicInput) => clinicService.createClinic(doctorId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] })
      queryClient.invalidateQueries({ queryKey: ['doctor'] })
    },
  })
}

export function useUpdateClinic(doctorId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clinicId, input }: { clinicId: string; input: UpdateClinicInput }) =>
      clinicService.updateClinic(doctorId!, clinicId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] })
      queryClient.invalidateQueries({ queryKey: ['doctor'] })
    },
  })
}

export function useDeleteClinic(doctorId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (clinicId: string) => clinicService.deleteClinic(doctorId!, clinicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] })
      queryClient.invalidateQueries({ queryKey: ['clinic-schedules'] })
      queryClient.invalidateQueries({ queryKey: ['doctor'] })
    },
  })
}

export function useCreateSchedule(doctorId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateScheduleInput) => clinicService.createSchedule(doctorId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-schedules'] })
      queryClient.invalidateQueries({ queryKey: ['doctor'] })
    },
  })
}

export function useDeleteSchedule(doctorId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (scheduleId: string) => clinicService.deleteSchedule(doctorId!, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-schedules'] })
      queryClient.invalidateQueries({ queryKey: ['doctor'] })
    },
  })
}
