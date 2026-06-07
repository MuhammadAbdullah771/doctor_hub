import type { DoctorType } from '@/types'

export const DOCTOR_TYPES: { value: DoctorType; label: string; description: string }[] = [
  {
    value: 'allopathic',
    label: 'Allopathic',
    description: 'Modern medicine and evidence-based treatments',
  },
  {
    value: 'homeopathic',
    label: 'Homeopathic',
    description: 'Natural remedies and holistic healing approaches',
  },
  {
    value: 'herbal',
    label: 'Herbal',
    description: 'Plant-based traditional and herbal medicine',
  },
]

export const FEATURED_DISEASES = [
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Arthritis',
  'Migraine',
  'Skin Allergy',
  'Thyroid',
  'Anxiety',
]

export const TREATMENT_TYPES = [
  'Consultation',
  'Follow-up',
  'Lab Review',
  'Therapy Session',
  'Surgery Consultation',
  'Preventive Care',
]
