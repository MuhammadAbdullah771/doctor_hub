import { supabase } from '@/lib/supabase'
import { APPOINTMENT_STATUS_LABELS } from '@/constants/appointment-status'
import type {
  AdminAnalytics,
  AdminStats,
  MonthlyMetric,
  StatusMetric,
  TopDoctorMetric,
} from '@/types/analytics'
import type { AppointmentStatus } from '@/types'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getLastSixMonths(): { key: string; label: string }[] {
  const months: { key: string; label: string }[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months.push({ key, label: MONTH_NAMES[d.getMonth()] })
  }

  return months
}

export const analyticsService = {
  async getAdminStats(): Promise<AdminStats> {
    const [users, doctors, clinics, appointments, revenue, pending] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('doctors').select('id', { count: 'exact', head: true }),
      supabase.from('clinics').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('amount').eq('status', 'verified'),
      supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
    ])

    const completed = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed')

    const totalRevenue = (revenue.data ?? []).reduce(
      (sum, row: { amount: number }) => sum + Number(row.amount),
      0,
    )

    return {
      totalUsers: users.count ?? 0,
      totalDoctors: doctors.count ?? 0,
      totalClinics: clinics.count ?? 0,
      totalAppointments: appointments.count ?? 0,
      totalRevenue,
      pendingVerifications: pending.count ?? 0,
      completedAppointments: completed.count ?? 0,
    }
  },

  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const stats = await this.getAdminStats()

    const [statusRes, profilesRes, appointmentsRes, paymentsRes, doctorsRes, apptByDoctorRes] =
      await Promise.all([
      supabase.from('appointments').select('status'),
      supabase.from('profiles').select('created_at'),
      supabase.from('appointments').select('created_at, status'),
      supabase.from('payments').select('amount, verified_at, status').eq('status', 'verified'),
      supabase
        .from('doctors')
        .select(`
          id,
          rating_avg,
          rating_count,
          specialty,
          profile:profiles(full_name)
        `)
        .order('rating_avg', { ascending: false })
        .limit(5),
      supabase.from('appointments').select('doctor_id'),
    ])

    const apptCountMap = new Map<string, number>()
    for (const row of apptByDoctorRes.data ?? []) {
      const doctorId = (row as { doctor_id: string }).doctor_id
      apptCountMap.set(doctorId, (apptCountMap.get(doctorId) ?? 0) + 1)
    }

    const statusCounts = new Map<string, number>()
    for (const row of statusRes.data ?? []) {
      const status = (row as { status: string }).status
      statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1)
    }

    const appointmentsByStatus: StatusMetric[] = Array.from(statusCounts.entries()).map(
      ([status, count]) => ({
        status,
        label: APPOINTMENT_STATUS_LABELS[status as AppointmentStatus] ?? status,
        count,
      }),
    )

    const monthBuckets = getLastSixMonths()
    const monthlyGrowth: MonthlyMetric[] = monthBuckets.map(({ key, label }) => ({
      month: key,
      label,
      users: 0,
      appointments: 0,
      revenue: 0,
    }))

    for (const profile of profilesRes.data ?? []) {
      const created = (profile as { created_at: string }).created_at.slice(0, 7)
      const bucket = monthlyGrowth.find((m) => m.month === created)
      if (bucket) bucket.users += 1
    }

    for (const appt of appointmentsRes.data ?? []) {
      const created = (appt as { created_at: string }).created_at.slice(0, 7)
      const bucket = monthlyGrowth.find((m) => m.month === created)
      if (bucket) bucket.appointments += 1
    }

    for (const payment of paymentsRes.data ?? []) {
      const verifiedAt = (payment as { verified_at: string | null }).verified_at
      if (!verifiedAt) continue
      const key = verifiedAt.slice(0, 7)
      const bucket = monthlyGrowth.find((m) => m.month === key)
      if (bucket) bucket.revenue += Number((payment as { amount: number }).amount)
    }

    const topDoctors: TopDoctorMetric[] = (doctorsRes.data ?? []).map((row) => {
      const r = row as Record<string, unknown>
      const profile = r.profile as { full_name: string } | null
      const id = r.id as string

      return {
        id,
        name: profile?.full_name ?? 'Doctor',
        specialty: r.specialty as string,
        appointments: apptCountMap.get(id) ?? 0,
        rating_avg: Number(r.rating_avg),
        rating_count: r.rating_count as number,
      }
    })

    return {
      ...stats,
      appointmentsByStatus,
      monthlyGrowth,
      topDoctors,
    }
  },
}
