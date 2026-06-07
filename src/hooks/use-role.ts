import { useAuth } from '@/hooks/use-auth'
import type { UserRole } from '@/types'
import { hasAnyRole } from '@/utils/permissions'

export function useRole() {
  const { profile } = useAuth()
  const role = profile?.role ?? null

  const checkRole = (allowed: UserRole[]) => {
    if (!role) return false
    return hasAnyRole(role, allowed)
  }

  return { role, checkRole }
}
