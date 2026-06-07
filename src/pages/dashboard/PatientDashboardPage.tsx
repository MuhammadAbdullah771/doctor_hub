import { Link } from 'react-router-dom'
import { Calendar, FileText, Pill, CreditCard, Plus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AppointmentCard } from '@/features/appointments/components/AppointmentCard'
import { usePatientAppointments, usePatientAppointmentStats } from '@/features/appointments/hooks/use-appointments'
import { usePatientClinicalStats } from '@/features/medical-history/hooks/use-medical-history'
import { useAuth } from '@/hooks/use-auth'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'

export function PatientDashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading } = usePatientAppointmentStats(user?.id)
  const { data: clinicalStats, isLoading: clinicalLoading } = usePatientClinicalStats(user?.id)
  const { data: appointments, isLoading: apptsLoading } = usePatientAppointments(user?.id)

  const upcoming = appointments?.filter((a) => !['completed', 'cancelled'].includes(a.status)).slice(0, 3) ?? []
  const pendingPayments = appointments?.filter((a) => a.status === 'pending' || a.payment_status === 'submitted').slice(0, 3) ?? []

  const statCards = [
    { label: 'Upcoming Appointments', value: String(stats?.upcoming ?? 0), icon: Calendar, accent: 'primary' as const, loading: statsLoading },
    { label: 'Medical Records', value: String(clinicalStats?.medicalRecords ?? 0), icon: FileText, accent: 'secondary' as const, loading: clinicalLoading },
    { label: 'Prescriptions', value: String(clinicalStats?.prescriptions ?? 0), icon: Pill, accent: 'accent' as const, loading: clinicalLoading },
    { label: 'Pending Payments', value: String(stats?.pendingPayments ?? 0), icon: CreditCard, accent: 'success' as const, loading: statsLoading },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Patient Portal"
        title="Your Health Dashboard"
        description="Manage appointments, records, and prescriptions in one place"
        action={
          <Button asChild>
            <Link to="/doctors">
              <Plus className="h-4 w-4" />
              Book Appointment
            </Link>
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="card-elevated border-gradient">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/patient/appointments">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {apptsLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : upcoming.length === 0 ? (
              <EmptyState
                title="No upcoming appointments"
                description="Book a consultation with a doctor to get started."
                action={
                  <Button size="sm" asChild>
                    <Link to="/doctors">Find Doctors</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {upcoming.map((appt) => (
                  <AppointmentCard key={appt.id} appointment={appt} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated border-gradient">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Payment Status</CardTitle>
            <div className="flex items-center gap-2">
              {(stats?.pendingPayments ?? 0) > 0 && (
                <Badge variant="destructive">{stats?.pendingPayments} pending</Badge>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/patient/payments">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {apptsLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : pendingPayments.length === 0 ? (
              <EmptyState
                title="No pending payments"
                description="Your payment verifications will appear here."
              />
            ) : (
              <div className="space-y-3">
                {pendingPayments.map((appt) => (
                  <AppointmentCard key={appt.id} appointment={appt} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
