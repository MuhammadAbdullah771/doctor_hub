import { z } from 'zod'

export const medicineSchema = z.object({
  medicine_name: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  instructions: z.string().optional(),
})

export const prescriptionSchema = z.object({
  patient_id: z.string().min(1),
  appointment_id: z.string().optional(),
  diagnosis: z.string().max(500).optional(),
  instructions: z.string().max(1000).optional(),
  medicines: z.array(medicineSchema).min(1, 'Add at least one medicine'),
})

export type PrescriptionFormData = z.infer<typeof prescriptionSchema>
