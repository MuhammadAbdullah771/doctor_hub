import { supabase } from '@/lib/supabase'
import type {
  MedicalHistoryRecord,
  CreateMedicalHistoryInput,
  DoctorPatientSummary,
  ClinicalStats,
} from '@/types/clinical'

function mapMedicalRow(row: Record<string, unknown>): MedicalHistoryRecord {
  const doctor = row.doctor as { profile: { full_name: string } } | null
  const patient = row.patient as { profile: { full_name: string } } | null

  return {
    id: row.id as string,
    patient_id: row.patient_id as string,
    patient_name: patient?.profile?.full_name ?? 'Patient',
    doctor_id: row.doctor_id as string,
    doctor_name: doctor?.profile?.full_name ?? 'Doctor',
    appointment_id: row.appointment_id as string | null,
    title: row.title as string,
    diagnosis: row.diagnosis as string | null,
    notes: row.notes as string | null,
    report_urls: Array.isArray(row.report_urls) ? (row.report_urls as string[]) : [],
    created_at: row.created_at as string,
  }
}

export const medicalHistoryService = {
  async getPatientHistory(patientId: string, search?: string): Promise<MedicalHistoryRecord[]> {
    const { data, error } = await supabase
      .from('medical_history')
      .select(`
        *,
        doctor:doctors(profile:profiles(full_name)),
        patient:patients(profile:profiles(full_name))
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) throw error

    let records = (data ?? []).map((row) => mapMedicalRow(row as Record<string, unknown>))

    if (search) {
      const q = search.toLowerCase()
      records = records.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.diagnosis?.toLowerCase().includes(q) ||
          r.notes?.toLowerCase().includes(q) ||
          r.doctor_name.toLowerCase().includes(q),
      )
    }

    return records
  },

  async getRecordById(id: string): Promise<MedicalHistoryRecord | null> {
    const { data, error } = await supabase
      .from('medical_history')
      .select(`
        *,
        doctor:doctors(profile:profiles(full_name)),
        patient:patients(profile:profiles(full_name))
      `)
      .eq('id', id)
      .single()

    if (error) return null
    return mapMedicalRow(data as Record<string, unknown>)
  },

  async createRecord(
    doctorId: string,
    doctorName: string,
    input: CreateMedicalHistoryInput,
    patientName: string,
  ): Promise<MedicalHistoryRecord> {
    const { data, error } = await supabase
      .from('medical_history')
      .insert({
        patient_id: input.patient_id,
        doctor_id: doctorId,
        appointment_id: input.appointment_id ?? null,
        title: input.title,
        diagnosis: input.diagnosis ?? null,
        notes: input.notes ?? null,
        report_urls: input.report_urls ?? [],
      })
      .select('*')
      .single()

    if (error) throw error
    return mapMedicalRow({
      ...data,
      doctor: { profile: { full_name: doctorName } },
      patient: { profile: { full_name: patientName } },
    } as Record<string, unknown>)
  },

  async getDoctorPatients(doctorId: string): Promise<DoctorPatientSummary[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        patient_id,
        appointment_date,
        patient:patients(profile:profiles(full_name, email))
      `)
      .eq('doctor_id', doctorId)

    if (error) throw error

    const map = new Map<string, DoctorPatientSummary>()
    for (const row of data ?? []) {
      const r = row as Record<string, unknown>
      const patientId = r.patient_id as string
      const patient = r.patient as { profile: { full_name: string; email: string } }
      const date = r.appointment_date as string
      const existing = map.get(patientId)
      if (!existing) {
        map.set(patientId, {
          patient_id: patientId,
          patient_name: patient?.profile?.full_name ?? 'Patient',
          patient_email: patient?.profile?.email ?? null,
          last_visit: date,
          appointment_count: 1,
        })
      } else {
        existing.appointment_count += 1
        if (date > (existing.last_visit ?? '')) existing.last_visit = date
      }
    }

    return Array.from(map.values()).sort((a, b) => (b.last_visit ?? '').localeCompare(a.last_visit ?? ''))
  },

  async getPatientClinicalStats(patientId: string): Promise<ClinicalStats> {
    const [medRes, rxRes] = await Promise.all([
      supabase.from('medical_history').select('id', { count: 'exact', head: true }).eq('patient_id', patientId),
      supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('patient_id', patientId),
    ])

    return {
      medicalRecords: medRes.count ?? 0,
      prescriptions: rxRes.count ?? 0,
    }
  },
}
