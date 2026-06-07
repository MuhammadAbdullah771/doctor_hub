import { Link } from 'react-router-dom'
import { Calendar, Users, Pill, Banknote } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useDoctorPrescriptionCount } from '@/features/prescriptions/hooks/use-prescriptions'
import {
  useDoctorAppointments,
  useDoctorAppointmentStats,
} from '@/features/appointments/hooks/use-appointments'
import { useAuth } from '@/hooks/use-auth'
import { formatCurrency, formatTime } from '@/utils/format'
import { APPOINTMENT_STATUS_LABELS } from '@/constants/appointment-status'

export function DoctorDashboardPage() {
  const { user } = useAuth()
  const today = new Date().toISOString().split('T')[0]
  const { data: rxCount, isLoading: rxLoading } = useDoctorPrescriptionCount(user?.id)
  const { data: stats, isLoading: statsLoading } = useDoctorAppointmentStats(user?.id)
  const { data: appointments, isLoading: apptLoading } = useDoctorAppointments(user?.id)

  const todayAppointments = (appointments ?? [])
    .filter((a) => a.appointment_date === today && a.status !== 'cancelled')
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))

  const statsCards = [
    { label: "Today's Appointments", value: String(stats?.todayCount ?? 0), icon: Calendar, accent: 'primary' as const, loading: statsLoading },
    { label: 'Total Patients', value: String(stats?.totalPatients ?? 0), icon: Users, accent: 'secondary' as const, loading: statsLoading },
    { label: 'Prescriptions', value: String(rxCount ?? 0), icon: Pill, accent: 'accent' as const, loading: rxLoading },
    { label: 'Revenue (Month)', value: formatCurrency(stats?.monthRevenue ?? 0), icon: Banknote, accent: 'success' as const, loading: statsLoading },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Doctor Portal"
        title="Practice Overview"
        description="Your schedule, patients, and revenue at a glance"
        action={
          <Button asChild>
            <Link to="/dashboard/doctor/appointments">View Calendar</Link>
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="card-elevated border-gradient">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Today&apos;s Appointments</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/doctor/appointments">See all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {apptLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : todayAppointments.length === 0 ? (
              <EmptyState
                title="No appointments today"
                description="Your scheduled consultations will appear here."
              />
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold">{appt.patient_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(appt.appointment_time)} · {appt.clinic_name}
                      </p>
                    </div>
                    <Badge variant="outline">{APPOINTMENT_STATUS_LABELS[appt.status]}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated border-gradient">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <Button asChild className="h-12">
              <Link to="/dashboard/doctor/patients">View Patients</Link>
            </Button>
            <Button variant="secondary" asChild className="h-12">
              <Link to="/dashboard/doctor/prescriptions">Prescriptions</Link>
            </Button>
            <Button variant="secondary" asChild className="h-12">
              <Link to="/dashboard/doctor/clinics">Manage Clinics</Link>
            </Button>
            <Button variant="secondary" asChild className="h-12">
              <Link to="/dashboard/doctor/schedule">Edit Schedule</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
