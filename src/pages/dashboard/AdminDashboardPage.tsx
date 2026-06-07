import { Link } from 'react-router-dom'
import {
  Users,
  Stethoscope,
  Building,
  Calendar,
  Banknote,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { usePageSeo } from '@/hooks/use-page-seo'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { useAdminStats, useAdminAnalytics } from '@/features/analytics/hooks/use-analytics'
import { formatCurrency } from '@/utils/format'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function AdminDashboardPage() {
  usePageSeo({ title: 'Admin Dashboard', description: 'Manage Doctor Hub Pakistan platform.' })

  const { data: stats, isLoading, isError, refetch } = useAdminStats()
  const { data: analytics } = useAdminAnalytics()

  if (isError) {
    return <ErrorState title="Failed to load dashboard" onRetry={() => refetch()} />
  }

  const chartData = analytics?.monthlyGrowth ?? []

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin Portal"
        title="Admin Dashboard"
        description="Live platform overview from Supabase"
        action={
          <Button asChild>
            <Link to="/dashboard/admin/analytics">Full Analytics</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Users', href: '/dashboard/admin/users' },
          { label: 'Doctors', href: '/dashboard/admin/doctors' },
          { label: 'Clinics', href: '/dashboard/admin/clinics' },
          { label: 'Payments', href: '/dashboard/admin/payments' },
          { label: 'Verifications', href: '/dashboard/assistant/verifications' },
          { label: 'Notifications', href: '/dashboard/admin/notifications' },
        ].map((link) => (
          <Button key={link.href} variant="secondary" size="sm" asChild>
            <Link to={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={String(stats?.totalUsers ?? 0)}
          icon={Users}
          loading={isLoading}
          accent="primary"
        />
        <StatCard
          label="Doctors"
          value={String(stats?.totalDoctors ?? 0)}
          icon={Stethoscope}
          loading={isLoading}
          accent="secondary"
        />
        <StatCard
          label="Clinics"
          value={String(stats?.totalClinics ?? 0)}
          icon={Building}
          loading={isLoading}
          accent="default"
        />
        <StatCard
          label="Appointments"
          value={String(stats?.totalAppointments ?? 0)}
          icon={Calendar}
          loading={isLoading}
          accent="accent"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          icon={Banknote}
          loading={isLoading}
          accent="primary"
        />
        <StatCard
          label="Completed Visits"
          value={String(stats?.completedAppointments ?? 0)}
          icon={CheckCircle}
          loading={isLoading}
          accent="accent"
        />
        <StatCard
          label="Pending Verifications"
          value={String(stats?.pendingVerifications ?? 0)}
          icon={AlertCircle}
          loading={isLoading}
          accent="secondary"
          trend={stats?.pendingVerifications ? 'Needs assistant review' : 'All clear'}
        />
      </div>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Platform Growth (6 months)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[280px] w-full rounded-xl" />
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    name="Appointments"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="New Users"
                    stroke="#0d9488"
                    fill="#0d9488"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
