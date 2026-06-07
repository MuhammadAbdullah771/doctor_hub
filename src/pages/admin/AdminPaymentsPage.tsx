import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { useAdminPayments } from '@/features/verifications/hooks/use-verifications'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PaymentScreenshot } from '@/components/common/PaymentScreenshot'
import { Select } from '@/components/ui/select'
import { APPOINTMENT_STATUS_LABELS } from '@/constants/appointment-status'
import { formatCurrency, formatDate } from '@/utils/format'
import type { PaymentStatus } from '@/types'

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: 'Awaiting Upload',
  submitted: 'Under Review',
  verified: 'Verified',
  rejected: 'Rejected',
}

const PAYMENT_VARIANT: Record<PaymentStatus, 'outline' | 'secondary' | 'accent' | 'destructive'> = {
  pending: 'outline',
  submitted: 'secondary',
  verified: 'accent',
  rejected: 'destructive',
}

export function AdminPaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { data: payments, isLoading, isError, refetch } = useAdminPayments()

  const filtered = useMemo(() => {
    if (!payments) return []
    if (statusFilter === 'all') return payments
    return payments.filter((p) => p.payment_status === statusFilter)
  }, [payments, statusFilter])

  const stats = useMemo(() => {
    if (!payments) return { total: 0, submitted: 0, verified: 0, rejected: 0 }
    return {
      total: payments.length,
      submitted: payments.filter((p) => p.payment_status === 'submitted').length,
      verified: payments.filter((p) => p.payment_status === 'verified').length,
      rejected: payments.filter((p) => p.payment_status === 'rejected').length,
    }
  }, [payments])

  return (
    <div>
      <PageHeader
        title="Payment Monitoring"
        description="Monitor all patient payment submissions across the platform"
      />

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Payments', value: stats.total },
          { label: 'Under Review', value: stats.submitted },
          { label: 'Verified', value: stats.verified },
          { label: 'Rejected', value: stats.rejected },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{isLoading ? '—' : s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6 max-w-xs">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="All statuses"
          options={[
            { value: 'pending', label: 'Awaiting Upload' },
            { value: 'submitted', label: 'Under Review' },
            { value: 'verified', label: 'Verified' },
            { value: 'rejected', label: 'Rejected' },
          ]}
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState title="Failed to load payments" onRetry={() => refetch()} />}

      {!isLoading && filtered.length === 0 && (
        <EmptyState title="No payments found" description="Try changing the filter." />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((payment) => (
            <Card key={payment.payment_id}>
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PaymentScreenshot
                  url={payment.screenshot_url}
                  className="h-16 w-16 rounded-lg border border-border object-cover shrink-0 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium">{payment.patient_name}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-sm">{payment.doctor_name}</span>
                  </div>
                  <p className="text-sm font-medium text-primary">{formatCurrency(payment.amount)}</p>
                  {payment.remarks && (
                    <p className="text-sm text-muted-foreground mt-1">{payment.remarks}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={PAYMENT_VARIANT[payment.payment_status]}>
                    {PAYMENT_LABELS[payment.payment_status]}
                  </Badge>
                  <Badge variant="muted">
                    {APPOINTMENT_STATUS_LABELS[payment.appointment_status]}
                  </Badge>
                  {payment.submitted_at && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(payment.submitted_at)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
