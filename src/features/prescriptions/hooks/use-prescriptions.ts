import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { prescriptionService } from '@/features/prescriptions/services/prescription.service'
import type { CreatePrescriptionInput } from '@/types/clinical'

export function usePatientPrescriptions(patientId: string | undefined) {
  return useQuery({
    queryKey: ['prescriptions', 'patient', patientId],
    queryFn: () => prescriptionService.getPatientPrescriptions(patientId!),
    enabled: !!patientId,
  })
}

export function useDoctorPrescriptions(doctorId: string | undefined) {
  return useQuery({
    queryKey: ['prescriptions', 'doctor', doctorId],
    queryFn: () => prescriptionService.getDoctorPrescriptions(doctorId!),
    enabled: !!doctorId,
  })
}

export function usePrescription(id: string | undefined) {
  return useQuery({
    queryKey: ['prescription', id],
    queryFn: () => prescriptionService.getPrescriptionById(id!),
    enabled: !!id,
  })
}

export function useDoctorPrescriptionCount(doctorId: string | undefined) {
  return useQuery({
    queryKey: ['prescriptions', 'count', doctorId],
    queryFn: () => prescriptionService.countByDoctor(doctorId!),
    enabled: !!doctorId,
  })
}

export function useCreatePrescription(
  doctorId: string | undefined,
  doctorName: string | undefined,
  doctorSpecialty: string | null,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePrescriptionInput & { patientName: string }) =>
      prescriptionService.createPrescription(
        doctorId!,
        doctorName!,
        doctorSpecialty,
        input,
        input.patientName,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
      queryClient.invalidateQueries({ queryKey: ['clinical-stats'] })
    },
  })
}
