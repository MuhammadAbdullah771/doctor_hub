import type { MedicalHistoryRecord, CreateMedicalHistoryInput } from '@/types/clinical'

const STORAGE_KEY = 'doctor-hub-medical-history'

function readStore(): MedicalHistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as MedicalHistoryRecord[]) : []
  } catch {
    return []
  }
}

function writeStore(records: MedicalHistoryRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function generateId() {
  return `mh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const SEED: MedicalHistoryRecord[] = []

export const mockMedicalHistoryStore = {
  getByPatient(patientId: string): MedicalHistoryRecord[] {
    const records = [...readStore(), ...SEED.filter((s) => s.patient_id === patientId)]
    return records
      .filter((r) => r.patient_id === patientId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  },

  getByDoctor(doctorId: string): MedicalHistoryRecord[] {
    return readStore()
      .filter((r) => r.doctor_id === doctorId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  },

  getById(id: string): MedicalHistoryRecord | null {
    return readStore().find((r) => r.id === id) ?? null
  },

  create(
    doctorId: string,
    doctorName: string,
    input: CreateMedicalHistoryInput,
    patientName: string,
  ): MedicalHistoryRecord {
    const record: MedicalHistoryRecord = {
      id: generateId(),
      patient_id: input.patient_id,
      patient_name: patientName,
      doctor_id: doctorId,
      doctor_name: doctorName,
      appointment_id: input.appointment_id ?? null,
      title: input.title,
      diagnosis: input.diagnosis ?? null,
      notes: input.notes ?? null,
      report_urls: input.report_urls ?? [],
      created_at: new Date().toISOString(),
    }

    const records = readStore()
    records.push(record)
    writeStore(records)
    return record
  },

  countByPatient(patientId: string): number {
    return this.getByPatient(patientId).length
  },

  countByDoctor(doctorId: string): number {
    return this.getByDoctor(doctorId).length
  },

  search(patientId: string, query: string): MedicalHistoryRecord[] {
    const q = query.toLowerCase()
    return this.getByPatient(patientId).filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.diagnosis?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q) ||
        r.doctor_name.toLowerCase().includes(q),
    )
  },
}
