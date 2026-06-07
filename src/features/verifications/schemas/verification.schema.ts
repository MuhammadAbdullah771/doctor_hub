import { z } from 'zod'

export const verifyPaymentSchema = z.object({
  remarks: z.string().max(500).optional(),
})

export const rejectPaymentSchema = z.object({
  remarks: z.string().min(5, 'Please provide a reason for rejection (min 5 characters)').max(500),
})

export type VerifyPaymentFormData = z.infer<typeof verifyPaymentSchema>
export type RejectPaymentFormData = z.infer<typeof rejectPaymentSchema>
