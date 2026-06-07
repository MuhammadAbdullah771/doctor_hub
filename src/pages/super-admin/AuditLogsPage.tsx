import { Shield } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { usePageSeo } from '@/hooks/use-page-seo'
import { useAuditLogs } from '@/features/audit/hooks/use-audit-logs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate } from '@/utils/format'

export function AuditLogsPage() {
  usePageSeo({ title: 'Audit Logs', description: 'System audit trail for Doctor Hub Pakistan.' })

  const { data, isLoading, isError, refetch } = useAuditLogs()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Security and compliance events across the platform"
      />

      {isLoading && <Skeleton className="h-64 rounded-xl" />}
      {isError && <ErrorState title="Failed to load audit logs" onRetry={() => refetch()} />}

      {!isLoading && data && data.length === 0 && (
        <EmptyState
          icon={<Shield className="h-8 w-8 text-muted-foreground" />}
          title="No audit events"
          description="System actions will appear here as they occur."
        />
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((log) => (
            <Card key={log.id} className="card-elevated">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{log.action}</p>
                    <Badge variant="outline">{log.entity_type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {log.actor_name ?? 'System'} · {formatDate(log.created_at, 'MMM d, yyyy h:mm a')}
                  </p>
                  {Object.keys(log.metadata).length > 0 && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {JSON.stringify(log.metadata)}
                    </p>
                  )}
                </div>
                {log.entity_id && (
                  <Badge variant="secondary" className="shrink-0 font-mono text-xs">
                    {log.entity_id.slice(0, 8)}…
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
