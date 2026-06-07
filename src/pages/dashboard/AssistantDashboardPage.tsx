import { Link } from 'react-router-dom'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { usePendingVerifications, useAssistantStats } from '@/features/verifications/hooks/use-verifications'
import { EmptyState } from '@/components/common/EmptyState'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate, formatTime } from '@/utils/format'

export function AssistantDashboardPage() {
  const { data: stats, isLoading } = useAssistantStats()
  const { data: pending, isLoading: queueLoading } = usePendingVerifications()

  const statCards = [
    { label: 'Pending Verifications', value: String(stats?.pending ?? 0), icon: Clock, accent: 'secondary' as const, loading: isLoading },
    { label: 'Verified Today', value: String(stats?.verifiedToday ?? 0), icon: CheckCircle, accent: 'success' as const, loading: isLoading },
    { label: 'Rejected Today', value: String(stats?.rejectedToday ?? 0), icon: XCircle, accent: 'primary' as const, loading: isLoading },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Assistant Portal"
        title="Payment Verifications"
        description="Review and verify patient payment submissions"
        action={
          <Button asChild>
            <Link to="/dashboard/assistant/verifications">Open Verifications</Link>
          </Button>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      <Card className="card-elevated border-gradient">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg">Pending Queue</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/assistant/verifications">View all</Link>
            </Button>
          </div>

          {queueLoading ? (
            <Skeleton className="h-24 rounded-xl" />
          ) : pending?.length === 0 ? (
            <EmptyState
              title="No pending verifications"
              description="Payment submissions awaiting review will appear here."
            />
          ) : (
            <div className="space-y-3">
              {pending?.slice(0, 3).map((item) => (
                <div
                  key={item.payment_id}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-semibold">{item.patient_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.doctor_name} · {formatDate(item.appointment_date)} at {formatTime(item.appointment_time)}
                    </p>
                  </div>
                  <Badge variant="secondary">{formatCurrency(item.amount)}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
