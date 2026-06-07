import { supabase } from '@/lib/supabase'

export const storageService = {
  async uploadPaymentScreenshot(file: File, appointmentId: string) {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${appointmentId}/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('payment-screenshots')
      .upload(path, file, {
        upsert: true,
        contentType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        cacheControl: '3600',
      })

    if (error) throw new Error(error.message)

    // Store the storage path so URLs stay valid if the project domain changes.
    return data.path
  },

  async uploadMedicalReport(file: File, patientId: string) {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
    const path = `${patientId}/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('medical-reports')
      .upload(path, file, {
        upsert: true,
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600',
      })

    if (error) throw new Error(error.message)

    const { data: urlData } = supabase.storage
      .from('medical-reports')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  },
}
