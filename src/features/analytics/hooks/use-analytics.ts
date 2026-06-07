import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/features/analytics/services/analytics.service'

export function useAdminStats() {
  return useQuery({
    queryKey: ['analytics', 'admin-stats'],
    queryFn: () => analyticsService.getAdminStats(),
    staleTime: 1000 * 60,
  })
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'admin-full'],
    queryFn: () => analyticsService.getAdminAnalytics(),
    staleTime: 1000 * 60,
  })
}
