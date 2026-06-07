import { supabase } from '@/lib/supabase'
import type {
  AdminClinicRecord,
  Clinic,
  ClinicSchedule,
  CreateClinicInput,
  CreateScheduleInput,
  UpdateClinicInput,
} from '@/types/doctor'

function mapClinic(row: Record<string, unknown>): Clinic {
  return {
    id: row.id as string,
    doctor_id: row.doctor_id as string,
    name: row.name as string,
    address: row.address as string,
    city: row.city as string,
    phone: row.phone as string | null,
    is_primary: row.is_primary as boolean,
  }
}

function mapSchedule(row: Record<string, unknown>): ClinicSchedule {
  return {
    id: row.id as string,
    clinic_id: row.clinic_id as string,
    day_of_week: row.day_of_week as number,
    start_time: (row.start_time as string).slice(0, 5),
    end_time: (row.end_time as string).slice(0, 5),
    slot_duration_minutes: row.slot_duration_minutes as number,
    is_active: row.is_active as boolean,
  }
}

export const clinicService = {
  async getDoctorClinics(doctorId: string): Promise<Clinic[]> {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('is_primary', { ascending: false })
      .order('name')

    if (error) throw error
    return (data ?? []).map((row) => mapClinic(row as Record<string, unknown>))
  },

  async createClinic(doctorId: string, input: CreateClinicInput): Promise<Clinic> {
    if (input.is_primary) {
      await supabase.from('clinics').update({ is_primary: false }).eq('doctor_id', doctorId)
    }

    const { data, error } = await supabase
      .from('clinics')
      .insert({
        doctor_id: doctorId,
        name: input.name,
        address: input.address,
        city: input.city,
        phone: input.phone ?? null,
        is_primary: input.is_primary ?? false,
      })
      .select('*')
      .single()

    if (error) throw error
    return mapClinic(data as Record<string, unknown>)
  },

  async updateClinic(doctorId: string, clinicId: string, input: UpdateClinicInput): Promise<Clinic> {
    if (input.is_primary) {
      await supabase.from('clinics').update({ is_primary: false }).eq('doctor_id', doctorId)
    }

    const { data, error } = await supabase
      .from('clinics')
      .update(input)
      .eq('id', clinicId)
      .eq('doctor_id', doctorId)
      .select('*')
      .single()

    if (error) throw error
    return mapClinic(data as Record<string, unknown>)
  },

  async deleteClinic(doctorId: string, clinicId: string): Promise<void> {
    const { error } = await supabase.from('clinics').delete().eq('id', clinicId).eq('doctor_id', doctorId)
    if (error) throw error
  },

  async getDoctorSchedules(doctorId: string): Promise<ClinicSchedule[]> {
    const clinics = await this.getDoctorClinics(doctorId)
    if (clinics.length === 0) return []

    const { data, error } = await supabase
      .from('clinic_schedules')
      .select('*')
      .in(
        'clinic_id',
        clinics.map((c) => c.id),
      )
      .order('day_of_week')
      .order('start_time')

    if (error) throw error
    return (data ?? []).map((row) => mapSchedule(row as Record<string, unknown>))
  },

  async createSchedule(doctorId: string, input: CreateScheduleInput): Promise<ClinicSchedule> {
    const clinics = await this.getDoctorClinics(doctorId)
    if (!clinics.some((c) => c.id === input.clinic_id)) {
      throw new Error('Clinic not found')
    }

    const { data, error } = await supabase
      .from('clinic_schedules')
      .insert({
        clinic_id: input.clinic_id,
        day_of_week: input.day_of_week,
        start_time: input.start_time,
        end_time: input.end_time,
        slot_duration_minutes: input.slot_duration_minutes ?? 30,
        is_active: input.is_active ?? true,
      })
      .select('*')
      .single()

    if (error) throw error
    return mapSchedule(data as Record<string, unknown>)
  },

  async updateSchedule(
    doctorId: string,
    scheduleId: string,
    input: {
      day_of_week?: number
      start_time?: string
      end_time?: string
      slot_duration_minutes?: number
      is_active?: boolean
    },
  ): Promise<ClinicSchedule> {
    const schedules = await this.getDoctorSchedules(doctorId)
    if (!schedules.some((s) => s.id === scheduleId)) {
      throw new Error('Schedule not found')
    }

    const { data, error } = await supabase
      .from('clinic_schedules')
      .update(input)
      .eq('id', scheduleId)
      .select('*')
      .single()

    if (error) throw error
    return mapSchedule(data as Record<string, unknown>)
  },

  async deleteSchedule(doctorId: string, scheduleId: string): Promise<void> {
    const schedules = await this.getDoctorSchedules(doctorId)
    if (!schedules.some((s) => s.id === scheduleId)) {
      throw new Error('Schedule not found')
    }

    const { error } = await supabase.from('clinic_schedules').delete().eq('id', scheduleId)
    if (error) throw error
  },

  async getAllClinicsForAdmin(): Promise<AdminClinicRecord[]> {
    const { data, error } = await supabase
      .from('clinics')
      .select(`
        *,
        doctor:doctors(specialty, profile:profiles(full_name))
      `)
      .order('city')
      .order('name')

    if (error) throw error

    return (data ?? []).map((row) => {
      const r = row as Record<string, unknown>
      const doctor = r.doctor as { specialty: string; profile: { full_name: string } } | null
      return {
        ...mapClinic(r),
        doctor_name: doctor?.profile?.full_name ?? 'Doctor',
        doctor_specialty: doctor?.specialty ?? '',
      }
    })
  },
}
