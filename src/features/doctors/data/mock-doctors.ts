import type { DoctorDetail } from '@/types/doctor'

/** Fallback mock data — Pakistan only. Production uses Supabase. */
export const MOCK_DOCTORS: DoctorDetail[] = [
  {
    id: 'doc-1',
    full_name: 'Dr. Hassan Raza',
    avatar_url: null,
    doctor_type: 'allopathic',
    specialty: 'Cardiologist',
    experience_years: 15,
    consultation_fee: 3500,
    rating_avg: 4.8,
    rating_count: 2,
    is_verified: true,
    city: 'Karachi',
    clinic_name: 'Karachi Heart Institute',
    diseases: ['Hypertension', 'Diabetes'],
    treatments: ['Consultation', 'Follow-up', 'Lab Review'],
    available_today: true,
    bio: 'Senior cardiologist in Karachi. Specialist in hypertension, heart disease and preventive cardiac care.',
    qualifications: ['MBBS - Aga Khan University', 'FCPS Cardiology - CPSP', 'MRCP UK'],
    email: 'doctor1@demo.com',
    phone: '+92 333 1112233',
    clinics: [
      {
        id: 'clinic-1',
        doctor_id: 'doc-1',
        name: 'Karachi Heart Institute',
        address: 'Plot 15-C, 7th Commercial Street, Phase 2 DHA',
        city: 'Karachi',
        phone: '+92 21 3587 4100',
        is_primary: true,
      },
      {
        id: 'clinic-2',
        doctor_id: 'doc-1',
        name: 'Clifton Cardiac Clinic',
        address: 'Block 5, Clifton, near Boat Basin',
        city: 'Karachi',
        phone: '+92 21 3583 2200',
        is_primary: false,
      },
    ],
    schedules: [
      { id: 's1', clinic_id: 'clinic-1', day_of_week: 1, start_time: '09:00', end_time: '13:00', slot_duration_minutes: 30, is_active: true },
      { id: 's2', clinic_id: 'clinic-1', day_of_week: 3, start_time: '14:00', end_time: '18:00', slot_duration_minutes: 30, is_active: true },
    ],
    reviews: [
      { id: 'r1', doctor_id: 'doc-1', patient_name: 'Ahmed Hassan', rating: 5, comment: 'Dr. Hassan Raza explained everything clearly. Highly recommend for cardiac care in Karachi.', created_at: '2025-05-10T10:00:00Z' },
      { id: 'r2', doctor_id: 'doc-1', patient_name: 'Fatima Malik', rating: 4, comment: 'Thorough second opinion at Clifton clinic. Booking via Doctor Hub was smooth.', created_at: '2025-04-22T14:30:00Z' },
    ],
  },
  {
    id: 'doc-2',
    full_name: 'Dr. Ayesha Malik',
    avatar_url: null,
    doctor_type: 'allopathic',
    specialty: 'Dermatologist',
    experience_years: 10,
    consultation_fee: 2500,
    rating_avg: 5,
    rating_count: 2,
    is_verified: true,
    city: 'Lahore',
    clinic_name: 'Glow Skin Clinic Lahore',
    diseases: ['Skin Allergy', 'Migraine'],
    treatments: ['Consultation', 'Preventive Care'],
    available_today: true,
    bio: 'Leading dermatologist in Lahore. Treats eczema, acne, skin allergies and cosmetic concerns.',
    qualifications: ['MBBS - King Edward Medical University', 'FCPS Dermatology - CPSP'],
    email: 'doctor2@demo.com',
    phone: '+92 345 5566778',
    clinics: [
      {
        id: 'clinic-3',
        doctor_id: 'doc-2',
        name: 'Glow Skin Clinic Lahore',
        address: '47-A Main Boulevard, Gulberg III',
        city: 'Lahore',
        phone: '+92 42 3578 9100',
        is_primary: true,
      },
    ],
    schedules: [
      { id: 's4', clinic_id: 'clinic-3', day_of_week: 2, start_time: '10:00', end_time: '16:00', slot_duration_minutes: 30, is_active: true },
      { id: 's5', clinic_id: 'clinic-3', day_of_week: 4, start_time: '10:00', end_time: '16:00', slot_duration_minutes: 30, is_active: true },
    ],
    reviews: [
      { id: 'r3', doctor_id: 'doc-2', patient_name: 'Fatima Malik', rating: 5, comment: 'Best dermatologist in Lahore! Fixed my eczema within weeks.', created_at: '2025-05-01T09:00:00Z' },
      { id: 'r4', doctor_id: 'doc-2', patient_name: 'Ahmed Hassan', rating: 5, comment: 'Excellent skin specialist at Gulberg clinic. Fair PKR consultation fee.', created_at: '2025-04-15T11:00:00Z' },
    ],
  },
  {
    id: 'doc-3',
    full_name: 'Dr. Usman Ali',
    avatar_url: null,
    doctor_type: 'homeopathic',
    specialty: 'General Physician',
    experience_years: 8,
    consultation_fee: 1500,
    rating_avg: 4,
    rating_count: 1,
    is_verified: true,
    city: 'Islamabad',
    clinic_name: 'Health First Islamabad',
    diseases: ['Diabetes', 'Thyroid', 'Anxiety'],
    treatments: ['Consultation', 'Follow-up', 'Therapy Session'],
    available_today: false,
    bio: 'General physician in Islamabad with holistic approach to diabetes, thyroid and lifestyle diseases.',
    qualifications: ['MBBS - Rawalpindi Medical University', 'DHMS Homeopathy'],
    email: 'doctor3@demo.com',
    phone: '+92 312 4455667',
    clinics: [
      {
        id: 'clinic-4',
        doctor_id: 'doc-3',
        name: 'Health First Islamabad',
        address: 'Office 12, F-10 Markaz, Islamabad',
        city: 'Islamabad',
        phone: '+92 51 226 7788',
        is_primary: true,
      },
    ],
    schedules: [
      { id: 's7', clinic_id: 'clinic-4', day_of_week: 1, start_time: '09:00', end_time: '17:00', slot_duration_minutes: 30, is_active: true },
      { id: 's8', clinic_id: 'clinic-4', day_of_week: 3, start_time: '09:00', end_time: '17:00', slot_duration_minutes: 30, is_active: true },
    ],
    reviews: [
      { id: 'r5', doctor_id: 'doc-3', patient_name: 'Fatima Malik', rating: 4, comment: 'Patient and thorough with my thyroid concerns at F-10 Markaz.', created_at: '2025-03-15T11:00:00Z' },
    ],
  },
]

export function getMockDoctorById(id: string): DoctorDetail | undefined {
  return MOCK_DOCTORS.find((d) => d.id === id)
}

export function getMockFilterOptions() {
  const diseases = [...new Set(MOCK_DOCTORS.flatMap((d) => d.diseases))].sort()
  const specialties = [...new Set(MOCK_DOCTORS.map((d) => d.specialty))].sort()
  const treatments = [...new Set(MOCK_DOCTORS.flatMap((d) => d.treatments))].sort()
  const cities = [...new Set(MOCK_DOCTORS.map((d) => d.city))].sort()
  const clinics = [...new Set(MOCK_DOCTORS.map((d) => d.clinic_name))].sort()

  return { diseases, specialties, treatments, cities, clinics }
}
