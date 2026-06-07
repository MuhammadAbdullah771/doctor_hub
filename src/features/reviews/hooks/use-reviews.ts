import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { reviewService, type CreateReviewInput } from '@/features/reviews/services/review.service'

export function useDoctorReviews(doctorId: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['reviews', doctorId],
    queryFn: () => reviewService.getDoctorReviews(doctorId!),
    enabled: !!doctorId,
  })

  useEffect(() => {
    if (!doctorId) return

    const channel = supabase
      .channel(`reviews-live-${doctorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `doctor_id=eq.${doctorId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['reviews', doctorId] })
          queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] })
          queryClient.invalidateQueries({ queryKey: ['doctors'] })
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'doctors',
          filter: `id=eq.${doctorId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] })
          queryClient.invalidateQueries({ queryKey: ['doctors'] })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [doctorId, queryClient])

  return query
}

export function useAppointmentReview(appointmentId: string | undefined, patientId: string | undefined) {
  return useQuery({
    queryKey: ['review', appointmentId, patientId],
    queryFn: () => reviewService.getAppointmentReview(appointmentId!, patientId!),
    enabled: !!appointmentId && !!patientId,
  })
}

export function useCreateReview(patientId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateReviewInput) => reviewService.createReview(patientId!, input),
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', review.doctor_id] })
      queryClient.invalidateQueries({ queryKey: ['review'] })
      queryClient.invalidateQueries({ queryKey: ['doctor', review.doctor_id] })
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
    },
  })
}
