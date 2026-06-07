import type { DoctorDetail, DoctorFilters, DoctorListItem } from '@/types/doctor'
import { supabase } from '@/lib/supabase'
import { mergePakistanCityOptions, normalizePakistanCity } from '@/constants/pakistan-cities'

function toListItem(doctor: DoctorDetail): DoctorListItem {
  return {
    id: doctor.id,
    full_name: doctor.full_name,
    avatar_url: doctor.avatar_url,
    doctor_type: doctor.doctor_type,
    specialty: doctor.specialty,
    experience_years: doctor.experience_years,
    consultation_fee: doctor.consultation_fee,
    rating_avg: doctor.rating_avg,
    rating_count: doctor.rating_count,
    is_verified: doctor.is_verified,
    city: doctor.city,
    clinic_name: doctor.clinic_name,
    diseases: doctor.diseases,
    treatments: doctor.treatments,
    available_today: doctor.available_today,
  }
}

export function applyDoctorFilters(doctors: DoctorListItem[], filters: DoctorFilters): DoctorListItem[] {
  return doctors.filter((doctor) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const matchesSearch =
        doctor.full_name.toLowerCase().includes(q) ||
        doctor.specialty.toLowerCase().includes(q) ||
        doctor.diseases.some((d) => d.toLowerCase().includes(q)) ||
        doctor.city.toLowerCase().includes(q)
      if (!matchesSearch) return false
    }

    if (filters.disease && !doctor.diseases.some((d) => d.toLowerCase() === filters.disease!.toLowerCase())) {
      return false
    }

    if (filters.specialty && doctor.specialty.toLowerCase() !== filters.specialty.toLowerCase()) {
      return false
    }

    if (filters.treatment && !doctor.treatments.some((t) => t.toLowerCase() === filters.treatment!.toLowerCase())) {
      return false
    }

    if (filters.experience && doctor.experience_years < filters.experience) {
      return false
    }

    if (filters.rating && doctor.rating_avg < filters.rating) {
      return false
    }

    if (filters.clinic && doctor.clinic_name.toLowerCase() !== filters.clinic.toLowerCase()) {
      return false
    }

    if (filters.city && doctor.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false
    }

    if (filters.doctor_type && doctor.doctor_type !== filters.doctor_type) {
      return false
    }

    return true
  })
}

async function fetchDoctorsFromSupabase(filters: DoctorFilters): Promise<DoctorListItem[]> {
  let query = supabase
    .from('doctors')
    .select(`
      *,
      profile:profiles(full_name, avatar_url, city),
      clinics(name, city),
      doctor_diseases(disease:diseases(name)),
      doctor_treatments(treatment:treatment_types(name))
    `)
    .eq('is_verified', true)

  if (filters.doctor_type) {
    query = query.eq('doctor_type', filters.doctor_type)
  }

  if (filters.experience) {
    query = query.gte('experience_years', filters.experience)
  }

  if (filters.rating) {
    query = query.gte('rating_avg', filters.rating)
  }

  const { data, error } = await query

  if (error) throw error

  const mapped: DoctorListItem[] = (data ?? []).map((row: Record<string, unknown>) => {
    const profile = row.profile as { full_name: string; avatar_url: string | null; city: string | null } | null
    const clinics = (row.clinics as { name: string; city: string }[]) ?? []
    const primaryClinic = clinics[0]
    const diseases = ((row.doctor_diseases as { disease: { name: string } }[]) ?? []).map((d) => d.disease?.name).filter(Boolean)
    const treatments = ((row.doctor_treatments as { treatment: { name: string } }[]) ?? []).map((t) => t.treatment?.name).filter(Boolean)

    return {
      id: row.id as string,
      full_name: profile?.full_name ?? 'Doctor',
      avatar_url: profile?.avatar_url ?? null,
      doctor_type: row.doctor_type as DoctorListItem['doctor_type'],
      specialty: row.specialty as string,
      experience_years: row.experience_years as number,
      consultation_fee: Number(row.consultation_fee),
      rating_avg: Number(row.rating_avg),
      rating_count: row.rating_count as number,
      is_verified: row.is_verified as boolean,
      city: normalizePakistanCity(primaryClinic?.city ?? profile?.city),
      clinic_name: primaryClinic?.name ?? '',
      diseases,
      treatments,
      available_today: true,
    }
  })

  return applyDoctorFilters(mapped, filters)
}

async function fetchDoctorFromSupabase(id: string): Promise<DoctorDetail | null> {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      profile:profiles(full_name, avatar_url, city, email, phone),
      clinics(*, clinic_schedules(*)),
      doctor_diseases(disease:diseases(name)),
      doctor_treatments(treatment:treatment_types(name)),
      reviews(rating, comment, created_at, id, patient:patients(id, profile:profiles(full_name)))
    `)
    .eq('id', id)
    .single()

  if (error) return null

  const row = data as Record<string, unknown>
  const profile = row.profile as { full_name: string; avatar_url: string | null; city: string | null; email: string; phone: string | null }
  const clinicsRaw = (row.clinics as Array<Record<string, unknown>>) ?? []
  const clinics = clinicsRaw.map((c) => ({
    id: c.id as string,
    doctor_id: c.doctor_id as string,
    name: c.name as string,
    address: c.address as string,
    city: normalizePakistanCity(c.city as string),
    phone: c.phone as string | null,
    is_primary: c.is_primary as boolean,
  }))
  const schedules = clinicsRaw.flatMap((c) => {
    const clinicSchedules = (c.clinic_schedules as Record<string, unknown>[]) ?? []
    return clinicSchedules.map((s) => ({
      id: s.id as string,
      clinic_id: s.clinic_id as string,
      day_of_week: s.day_of_week as number,
      start_time: (s.start_time as string).slice(0, 5),
      end_time: (s.end_time as string).slice(0, 5),
      slot_duration_minutes: s.slot_duration_minutes as number,
      is_active: s.is_active as boolean,
    }))
  })
  const primaryClinic = clinics.find((c) => c.is_primary) ?? clinics[0]
  const diseases = ((row.doctor_diseases as { disease: { name: string } }[]) ?? []).map((d) => d.disease?.name).filter(Boolean) as string[]
  const treatments = ((row.doctor_treatments as { treatment: { name: string } }[]) ?? []).map((t) => t.treatment?.name).filter(Boolean) as string[]
  const qualifications = Array.isArray(row.qualifications) ? (row.qualifications as string[]) : []

  const reviewsRaw = (row.reviews as { id: string; rating: number; comment: string | null; created_at: string; patient: { profile: { full_name: string } } }[]) ?? []

  return {
    id: row.id as string,
    full_name: profile?.full_name ?? 'Doctor',
    avatar_url: profile?.avatar_url ?? null,
    doctor_type: row.doctor_type as DoctorDetail['doctor_type'],
    specialty: row.specialty as string,
    experience_years: row.experience_years as number,
    consultation_fee: Number(row.consultation_fee),
    rating_avg: Number(row.rating_avg),
    rating_count: row.rating_count as number,
    is_verified: row.is_verified as boolean,
    city: normalizePakistanCity(primaryClinic?.city ?? profile?.city),
    clinic_name: primaryClinic?.name ?? '',
    diseases,
    treatments,
    available_today: true,
    bio: row.bio as string | null,
    qualifications,
    email: profile?.email ?? null,
    phone: profile?.phone ?? null,
    clinics,
    schedules,
    reviews: reviewsRaw.map((r) => ({
      id: r.id,
      doctor_id: row.id as string,
      patient_name: r.patient?.profile?.full_name ?? 'Patient',
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
    })),
  }
}

export const doctorService = {
  async getDoctors(filters: DoctorFilters = {}): Promise<DoctorListItem[]> {
    return fetchDoctorsFromSupabase(filters)
  },

  async getDoctorById(id: string): Promise<DoctorDetail | null> {
    return fetchDoctorFromSupabase(id)
  },

  async getFilterOptions() {
    const [diseasesRes, treatmentsRes, doctorsRes] = await Promise.all([
      supabase.from('diseases').select('name').order('name'),
      supabase.from('treatment_types').select('name').order('name'),
      supabase.from('doctors').select('specialty, clinics(name, city)'),
    ])

    type DoctorFilterRow = { specialty: string; clinics: { city: string; name: string }[] }
    const doctorRows = (doctorsRes.data ?? []) as unknown as DoctorFilterRow[]

    const diseases = (diseasesRes.data ?? []).map((d: { name: string }) => d.name)
    const treatments = (treatmentsRes.data ?? []).map((t: { name: string }) => t.name)
    const specialties = [...new Set(doctorRows.map((d) => d.specialty))]
    const cities = mergePakistanCityOptions(
      [...new Set(
        doctorRows.flatMap((d) =>
          d.clinics?.map((c) => normalizePakistanCity(c.city)) ?? [],
        ),
      )],
    )
    const clinics = [...new Set(
      doctorRows.flatMap((d) => d.clinics?.map((c) => c.name) ?? []),
    )]

    return { diseases, specialties, treatments, cities, clinics }
  },
}

export { toListItem }
