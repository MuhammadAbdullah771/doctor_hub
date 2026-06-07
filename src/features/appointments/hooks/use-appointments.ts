import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { appointmentService } from '@/features/appointments/services/appointment.service'
import { paymentService } from '@/features/appointments/services/payment.service'
import type { BookAppointmentInput } from '@/types/appointment'
import type { AppointmentStatus } from '@/types'

export function usePatientAppointments(patientId: string | undefined) {
  return useQuery({
    queryKey: ['appointments', 'patient', patientId],
    queryFn: () => appointmentService.getPatientAppointments(patientId!),
    enabled: !!patientId,
  })
}

export function useAppointment(id: string | undefined, patientId: string | undefined) {
  return useQuery({
    queryKey: ['appointment', id, patientId],
    queryFn: () => appointmentService.getAppointmentById(id!, patientId!),
    enabled: !!id && !!patientId,
  })
}

export function usePatientAppointmentStats(patientId: string | undefined) {
  return useQuery({
    queryKey: ['appointments', 'stats', patientId],
    queryFn: () => appointmentService.getPatientStats(patientId!),
    enabled: !!patientId,
  })
}

export function useBookAppointment(patientId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: BookAppointmentInput) =>
      appointmentService.bookAppointment(patientId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useUploadPayment(patientId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ appointmentId, file }: { appointmentId: string; file: File }) =>
      paymentService.uploadPaymentScreenshot(appointmentId, patientId!, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] })
    },
  })
}

export function useCancelAppointment(patientId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (appointmentId: string) =>
      appointmentService.cancelAppointment(appointmentId, patientId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useDoctorAppointments(doctorId: string | undefined) {
  return useQuery({
    queryKey: ['appointments', 'doctor', doctorId],
    queryFn: () => appointmentService.getDoctorAppointments(doctorId!),
    enabled: !!doctorId,
  })
}

export function useDoctorAppointmentStats(doctorId: string | undefined) {
  return useQuery({
    queryKey: ['appointments', 'doctor-stats', doctorId],
    queryFn: () => appointmentService.getDoctorStats(doctorId!),
    enabled: !!doctorId,
  })
}

export function useUpdateDoctorAppointmentStatus(doctorId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      appointmentId,
      status,
      notes,
    }: {
      appointmentId: string
      status: AppointmentStatus
      notes?: string
    }) => appointmentService.updateDoctorAppointmentStatus(doctorId!, appointmentId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
