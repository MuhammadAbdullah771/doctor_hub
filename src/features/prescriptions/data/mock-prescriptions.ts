import type { Prescription, CreatePrescriptionInput } from '@/types/clinical'

const STORAGE_KEY = 'doctor-hub-prescriptions'

function readStore(): Prescription[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Prescription[]) : []
  } catch {
    return []
  }
}

function writeStore(records: Prescription[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const mockPrescriptionStore = {
  getByPatient(patientId: string): Prescription[] {
    return readStore()
      .filter((r) => r.patient_id === patientId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  },

  getByDoctor(doctorId: string): Prescription[] {
    return readStore()
      .filter((r) => r.doctor_id === doctorId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  },

  getById(id: string): Prescription | null {
    return readStore().find((r) => r.id === id) ?? null
  },

  create(
    doctorId: string,
    doctorName: string,
    doctorSpecialty: string | null,
    input: CreatePrescriptionInput,
    patientName: string,
  ): Prescription {
    const prescription: Prescription = {
      id: generateId('rx'),
      patient_id: input.patient_id,
      patient_name: patientName,
      doctor_id: doctorId,
      doctor_name: doctorName,
      doctor_specialty: doctorSpecialty,
      appointment_id: input.appointment_id ?? null,
      diagnosis: input.diagnosis ?? null,
      instructions: input.instructions ?? null,
      medicines: input.medicines.map((m) => ({
        id: generateId('med'),
        medicine_name: m.medicine_name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions ?? null,
      })),
      created_at: new Date().toISOString(),
    }

    const records = readStore()
    records.push(prescription)
    writeStore(records)
    return prescription
  },

  countByPatient(patientId: string): number {
    return this.getByPatient(patientId).length
  },

  countByDoctor(doctorId: string): number {
    return this.getByDoctor(doctorId).length
  },
}
