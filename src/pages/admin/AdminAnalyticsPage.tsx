import { Star, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { usePageSeo } from '@/hooks/use-page-seo'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { useAdminAnalytics } from '@/features/analytics/hooks/use-analytics'
import { formatCurrency } from '@/utils/format'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const PIE_COLORS = ['#2563eb', '#0d9488', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6']

export function AdminAnalyticsPage() {
  usePageSeo({ title: 'Analytics', description: 'Platform analytics for Doctor Hub Pakistan.' })

  const { data, isLoading, isError, refetch } = useAdminAnalytics()

  if (isError) {
    return <ErrorState title="Failed to load analytics" onRetry={() => refetch()} />
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Analytics"
        description="Detailed metrics powered by Supabase"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Revenue"
          value={formatCurrency(data?.totalRevenue ?? 0)}
          icon={TrendingUp}
          loading={isLoading}
        />
        <StatCard
          label="Appointments"
          value={String(data?.totalAppointments ?? 0)}
          icon={TrendingUp}
          loading={isLoading}
          accent="secondary"
        />
        <StatCard
          label="Doctors"
          value={String(data?.totalDoctors ?? 0)}
          icon={TrendingUp}
          loading={isLoading}
          accent="accent"
        />
        <StatCard
          label="Reviews-driven visits"
          value={String(data?.completedAppointments ?? 0)}
          icon={Star}
          loading={isLoading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[260px] rounded-xl" />
            ) : (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.monthlyGrowth ?? []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Appointments by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[260px] rounded-xl" />
            ) : (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.appointmentsByStatus ?? []}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {(data?.appointmentsByStatus ?? []).map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Top Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (data?.topDoctors.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No doctor data yet.</p>
          ) : (
            <div className="space-y-3">
              {data?.topDoctors.map((doctor, index) => (
                <div
                  key={doctor.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <p className="font-semibold">{doctor.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{doctor.specialty}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span>{doctor.appointments} appointments</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {doctor.rating_avg.toFixed(1)} ({doctor.rating_count})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
