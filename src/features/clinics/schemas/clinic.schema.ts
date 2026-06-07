import { z } from 'zod'

export const clinicSchema = z.object({
  name: z.string().min(2, 'Clinic name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  phone: z.string().optional(),
  is_primary: z.boolean().optional(),
})

export const scheduleSchema = z.object({
  clinic_id: z.string().uuid('Select a clinic'),
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid start time'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid end time'),
  slot_duration_minutes: z.number().min(10).max(120),
  is_active: z.boolean().optional(),
})

export type ClinicFormValues = z.infer<typeof clinicSchema>
export type ScheduleFormValues = z.infer<typeof scheduleSchema>
