import { useState } from 'react'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { VerificationQueueCard } from '@/features/verifications/components/VerificationQueueCard'
import { PaymentVerificationPanel } from '@/features/verifications/components/PaymentVerificationPanel'
import {
  usePendingVerifications,
  useCompletedVerifications,
  useAssistantStats,
} from '@/features/verifications/hooks/use-verifications'
import { useAuth } from '@/hooks/use-auth'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency, formatDate } from '@/utils/format'

type Tab = 'pending' | 'completed'

export function AssistantVerificationsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('pending')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: stats } = useAssistantStats()
  const { data: pending, isLoading: pendingLoading, isError, refetch } = usePendingVerifications()
  const { data: completed, isLoading: completedLoading } = useCompletedVerifications()

  const selectedItem = pending?.find((p) => p.appointment_id === selectedId)

  const statCards = [
    { label: 'Pending', value: stats?.pending ?? 0, icon: Clock, color: 'text-orange-500' },
    { label: 'Verified Today', value: stats?.verifiedToday ?? 0, icon: CheckCircle, color: 'text-accent' },
    { label: 'Rejected Today', value: stats?.rejectedToday ?? 0, icon: XCircle, color: 'text-destructive' },
  ]

  return (
    <div>
      <PageHeader
        title="Payment Verifications"
        description="Review patient payment screenshots and approve or reject submissions"
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {(['pending', 'completed'] as Tab[]).map((t) => (
          <Button
            key={t}
            variant={tab === t ? 'default' : 'outline'}
            onClick={() => setTab(t)}
            className="capitalize"
          >
            {t}
            {t === 'pending' && (stats?.pending ?? 0) > 0 && (
              <Badge variant="secondary" className="ml-2">{stats?.pending}</Badge>
            )}
          </Button>
        ))}
      </div>

      {tab === 'pending' && (
        <>
          {pendingLoading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          )}

          {isError && (
            <ErrorState title="Failed to load verifications" onRetry={() => refetch()} />
          )}

          {!pendingLoading && !isError && pending?.length === 0 && (
            <EmptyState
              title="No pending verifications"
              description="All payment submissions have been reviewed."
            />
          )}

          {!pendingLoading && pending && pending.length > 0 && (
            <div className="space-y-4">
              {pending.map((item) => (
                <VerificationQueueCard
                  key={item.payment_id}
                  item={item}
                  onReview={setSelectedId}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'completed' && (
        <>
          {completedLoading && <Skeleton className="h-48 rounded-xl" />}

          {!completedLoading && completed?.length === 0 && (
            <EmptyState title="No completed verifications yet" />
          )}

          {!completedLoading && completed && completed.length > 0 && (
            <div className="space-y-3">
              {completed.map((item) => (
                <Card key={item.payment_id}>
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium">{item.patient_name}</span>
                        <Badge variant={item.payment_status === 'verified' ? 'accent' : 'destructive'}>
                          {item.payment_status === 'verified' ? 'Verified' : 'Rejected'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.doctor_name} · {formatDate(item.appointment_date)} · {formatCurrency(item.amount)}
                      </p>
                      {item.remarks && (
                        <p className="text-sm text-muted-foreground mt-1 italic">&ldquo;{item.remarks}&rdquo;</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">
                      {item.verified_at ? formatDate(item.verified_at) : '—'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Payment</DialogTitle>
            <DialogDescription>
              Verify or reject this payment submission
            </DialogDescription>
          </DialogHeader>
          {selectedItem && user && (
            <PaymentVerificationPanel
              item={selectedItem}
              assistantId={user.id}
              onComplete={() => setSelectedId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
