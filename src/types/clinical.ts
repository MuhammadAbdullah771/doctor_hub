export interface MedicalHistoryRecord {
  id: string
  patient_id: string
  patient_name: string
  doctor_id: string
  doctor_name: string
  appointment_id: string | null
  title: string
  diagnosis: string | null
  notes: string | null
  report_urls: string[]
  created_at: string
}

export interface CreateMedicalHistoryInput {
  patient_id: string
  appointment_id?: string
  title: string
  diagnosis?: string
  notes?: string
  report_urls?: string[]
}

export interface PrescriptionMedicine {
  id: string
  medicine_name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string | null
}

export interface Prescription {
  id: string
  patient_id: string
  patient_name: string
  doctor_id: string
  doctor_name: string
  doctor_specialty: string | null
  appointment_id: string | null
  diagnosis: string | null
  instructions: string | null
  medicines: PrescriptionMedicine[]
  created_at: string
}

export interface CreatePrescriptionInput {
  patient_id: string
  appointment_id?: string
  diagnosis?: string
  instructions?: string
  medicines: {
    medicine_name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }[]
}

export interface DoctorPatientSummary {
  patient_id: string
  patient_name: string
  patient_email: string | null
  last_visit: string | null
  appointment_count: number
}

export interface ClinicalStats {
  medicalRecords: number
  prescriptions: number
}
