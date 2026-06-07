export interface AdminStats {
  totalUsers: number
  totalDoctors: number
  totalClinics: number
  totalAppointments: number
  totalRevenue: number
  pendingVerifications: number
  completedAppointments: number
}

export interface MonthlyMetric {
  month: string
  label: string
  users: number
  appointments: number
  revenue: number
}

export interface StatusMetric {
  status: string
  label: string
  count: number
}

export interface TopDoctorMetric {
  id: string
  name: string
  specialty: string
  appointments: number
  rating_avg: number
  rating_count: number
}

export interface AdminAnalytics extends AdminStats {
  appointmentsByStatus: StatusMetric[]
  monthlyGrowth: MonthlyMetric[]
  topDoctors: TopDoctorMetric[]
}
