import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { medicalHistoryService } from '@/features/medical-history/services/medical-history.service'
import type { CreateMedicalHistoryInput } from '@/types/clinical'

export function usePatientMedicalHistory(patientId: string | undefined, search?: string) {
  return useQuery({
    queryKey: ['medical-history', patientId, search],
    queryFn: () => medicalHistoryService.getPatientHistory(patientId!, search),
    enabled: !!patientId,
  })
}

export function useMedicalRecord(id: string | undefined) {
  return useQuery({
    queryKey: ['medical-history', 'record', id],
    queryFn: () => medicalHistoryService.getRecordById(id!),
    enabled: !!id,
  })
}

export function useDoctorPatients(doctorId: string | undefined) {
  return useQuery({
    queryKey: ['doctor-patients', doctorId],
    queryFn: () => medicalHistoryService.getDoctorPatients(doctorId!),
    enabled: !!doctorId,
  })
}

export function usePatientClinicalStats(patientId: string | undefined) {
  return useQuery({
    queryKey: ['clinical-stats', patientId],
    queryFn: () => medicalHistoryService.getPatientClinicalStats(patientId!),
    enabled: !!patientId,
  })
}

export function useCreateMedicalRecord(
  doctorId: string | undefined,
  doctorName: string | undefined,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateMedicalHistoryInput & { patientName: string }) =>
      medicalHistoryService.createRecord(
        doctorId!,
        doctorName!,
        input,
        input.patientName,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-history'] })
      queryClient.invalidateQueries({ queryKey: ['clinical-stats'] })
    },
  })
}
