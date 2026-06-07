import { z } from 'zod'

export const medicalHistorySchema = z.object({
  patient_id: z.string().min(1),
  appointment_id: z.string().optional(),
  title: z.string().min(2, 'Title is required'),
  diagnosis: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
})

export type MedicalHistoryFormData = z.infer<typeof medicalHistorySchema>
