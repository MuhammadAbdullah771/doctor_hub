import { supabase } from '@/lib/supabase'
import type { Prescription, CreatePrescriptionInput } from '@/types/clinical'

function mapPrescriptionRow(
  row: Record<string, unknown>,
  medicines: Prescription['medicines'],
): Prescription {
  const doctor = row.doctor as { specialty: string; profile: { full_name: string } } | null
  const patient = row.patient as { profile: { full_name: string } } | null

  return {
    id: row.id as string,
    patient_id: row.patient_id as string,
    patient_name: patient?.profile?.full_name ?? 'Patient',
    doctor_id: row.doctor_id as string,
    doctor_name: doctor?.profile?.full_name ?? 'Doctor',
    doctor_specialty: doctor?.specialty ?? null,
    appointment_id: row.appointment_id as string | null,
    diagnosis: row.diagnosis as string | null,
    instructions: row.instructions as string | null,
    medicines,
    created_at: row.created_at as string,
  }
}

export const prescriptionService = {
  async getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:doctors(specialty, profile:profiles(full_name)),
        patient:patients(profile:profiles(full_name)),
        prescription_medicines(*)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data ?? []).map((row) => {
      const r = row as Record<string, unknown>
      const meds = (r.prescription_medicines as Prescription['medicines']) ?? []
      return mapPrescriptionRow(r, meds)
    })
  },

  async getDoctorPrescriptions(doctorId: string): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:doctors(specialty, profile:profiles(full_name)),
        patient:patients(profile:profiles(full_name)),
        prescription_medicines(*)
      `)
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data ?? []).map((row) => {
      const r = row as Record<string, unknown>
      const meds = (r.prescription_medicines as Prescription['medicines']) ?? []
      return mapPrescriptionRow(r, meds)
    })
  },

  async getPrescriptionById(id: string): Promise<Prescription | null> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:doctors(specialty, profile:profiles(full_name)),
        patient:patients(profile:profiles(full_name)),
        prescription_medicines(*)
      `)
      .eq('id', id)
      .single()

    if (error) return null
    const r = data as Record<string, unknown>
    return mapPrescriptionRow(r, (r.prescription_medicines as Prescription['medicines']) ?? [])
  },

  async createPrescription(
    doctorId: string,
    _doctorName: string,
    _doctorSpecialty: string | null,
    input: CreatePrescriptionInput,
    _patientName: string,
  ): Promise<Prescription> {
    const { data: rx, error: rxError } = await supabase
      .from('prescriptions')
      .insert({
        patient_id: input.patient_id,
        doctor_id: doctorId,
        appointment_id: input.appointment_id ?? null,
        diagnosis: input.diagnosis ?? null,
        instructions: input.instructions ?? null,
        is_finalized: true,
      })
      .select('*')
      .single()

    if (rxError) throw rxError

    const medicinesInsert = input.medicines.map((m) => ({
      prescription_id: rx.id,
      medicine_name: m.medicine_name,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      instructions: m.instructions ?? null,
    }))

    const { error: medError } = await supabase.from('prescription_medicines').insert(medicinesInsert)
    if (medError) throw medError

    const detail = await this.getPrescriptionById(rx.id)
    if (!detail) throw new Error('Failed to load prescription')
    return detail
  },

  async countByDoctor(doctorId: string): Promise<number> {
    const { count } = await supabase
      .from('prescriptions')
      .select('id', { count: 'exact', head: true })
      .eq('doctor_id', doctorId)
    return count ?? 0
  },
}
