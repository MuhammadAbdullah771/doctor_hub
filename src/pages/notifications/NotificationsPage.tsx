import { Bell, CheckCheck } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { usePageSeo } from '@/hooks/use-page-seo'
import { useAuth } from '@/hooks/use-auth'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/features/notifications/hooks/use-notifications'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelative } from '@/utils/format'

const TYPE_LABELS = {
  appointment: 'Appointment',
  payment: 'Payment',
  prescription: 'Prescription',
  system: 'System',
} as const

export function NotificationsPage() {
  const { user } = useAuth()
  const { data: notifications, isLoading, isError, refetch } = useNotifications(user?.id)
  const markRead = useMarkNotificationRead(user?.id)
  const markAll = useMarkAllNotificationsRead(user?.id)

  usePageSeo({
    title: 'Notifications',
    description: 'Your Doctor Hub alerts and updates in real time.',
  })

  const unread = notifications?.filter((n) => !n.is_read).length ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Real-time alerts from appointments, payments, and prescriptions"
        action={
          unread > 0 ? (
            <Button
              variant="outline"
              size="sm"
              disabled={markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState title="Failed to load notifications" onRetry={() => refetch()} />}

      {!isLoading && notifications?.length === 0 && (
        <EmptyState
          icon={<Bell className="h-8 w-8 text-muted-foreground" />}
          title="No notifications"
          description="Updates about appointments and payments will appear here instantly."
        />
      )}

      {!isLoading && notifications && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((item) => (
            <Card
              key={item.id}
              className={`card-elevated transition-colors ${!item.is_read ? 'border-primary/30 bg-primary/5' : ''}`}
            >
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    <Badge variant="outline">{TYPE_LABELS[item.type]}</Badge>
                    {!item.is_read && <Badge variant="accent">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                  <p className="text-xs text-muted-foreground">{formatRelative(item.created_at)}</p>
                </div>
                {!item.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={markRead.isPending}
                    onClick={() => markRead.mutate(item.id)}
                  >
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
