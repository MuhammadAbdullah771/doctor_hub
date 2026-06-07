import { z } from 'zod'

export const bookAppointmentSchema = z.object({
  clinic_id: z.string().min(1, 'Please select a clinic'),
  appointment_date: z.string().min(1, 'Please select a date'),
  appointment_time: z.string().min(1, 'Please select a time slot'),
  symptoms: z.string().max(500).optional(),
})

export type BookAppointmentFormData = z.infer<typeof bookAppointmentSchema>
