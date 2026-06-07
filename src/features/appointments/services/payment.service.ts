import { supabase } from '@/lib/supabase'
import { storageService } from '@/services/storage.service'
import { appointmentService } from '@/features/appointments/services/appointment.service'
import type { AppointmentDetail } from '@/types/appointment'

export const paymentService = {
  async uploadPaymentScreenshot(
    appointmentId: string,
    patientId: string,
    file: File,
  ): Promise<AppointmentDetail> {
    const screenshotUrl = await storageService.uploadPaymentScreenshot(file, appointmentId)

    const { error: payError } = await supabase
      .from('payments')
      .update({
        status: 'submitted',
        screenshot_url: screenshotUrl,
        submitted_at: new Date().toISOString(),
      })
      .eq('appointment_id', appointmentId)
      .eq('patient_id', patientId)

    if (payError) throw payError

    const { error: apptError } = await supabase
      .from('appointments')
      .update({ status: 'payment_submitted' })
      .eq('id', appointmentId)
      .eq('patient_id', patientId)

    if (apptError) throw apptError

    const detail = await appointmentService.getAppointmentById(appointmentId, patientId)
    if (!detail) throw new Error('Failed to load appointment')
    return detail
  },
}
