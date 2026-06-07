import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { verificationService } from '@/features/verifications/services/verification.service'
import type { RejectPaymentInput, VerifyPaymentInput } from '@/types/appointment'

export function usePendingVerifications() {
  return useQuery({
    queryKey: ['verifications', 'pending'],
    queryFn: () => verificationService.getPendingVerifications(),
    refetchInterval: 30000,
  })
}

export function useCompletedVerifications() {
  return useQuery({
    queryKey: ['verifications', 'completed'],
    queryFn: () => verificationService.getCompletedVerifications(),
  })
}

export function useAssistantStats() {
  return useQuery({
    queryKey: ['verifications', 'stats'],
    queryFn: () => verificationService.getAssistantStats(),
  })
}

export function useAdminPayments() {
  return useQuery({
    queryKey: ['payments', 'admin'],
    queryFn: () => verificationService.getAllPaymentsForAdmin(),
  })
}

export function useVerifyPayment(assistantId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: VerifyPaymentInput) =>
      verificationService.verifyPayment(assistantId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verifications'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useRejectPayment(assistantId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RejectPaymentInput) =>
      verificationService.rejectPayment(assistantId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verifications'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
