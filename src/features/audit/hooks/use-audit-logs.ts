import { useQuery } from '@tanstack/react-query'
import { auditService } from '@/features/audit/services/audit.service'

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => auditService.getAuditLogs(),
  })
}
