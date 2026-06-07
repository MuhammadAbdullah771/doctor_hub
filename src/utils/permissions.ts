import type { UserRole } from '@/types'

const PERMISSIONS: Record<string, UserRole[]> = {
  'appointments:book': ['patient'],
  'payments:upload': ['patient'],
  'payments:verify': ['assistant', 'admin', 'super_admin'],
  'medical-history:add': ['doctor'],
  'prescriptions:create': ['doctor'],
  'clinics:manage': ['doctor', 'admin', 'super_admin'],
  'users:manage': ['admin', 'super_admin'],
  'users:create': ['super_admin'],
  'audit:view': ['super_admin'],
  'analytics:view': ['admin', 'super_admin'],
}

export function hasPermission(role: UserRole, permission: string): boolean {
  return PERMISSIONS[permission]?.includes(role) ?? false
}

export function hasAnyRole(role: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(role)
}
