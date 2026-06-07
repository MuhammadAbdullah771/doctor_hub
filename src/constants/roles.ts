import type { UserRole } from '@/types'

export const ROLES: Record<UserRole, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  assistant: 'Assistant',
  admin: 'Admin',
  super_admin: 'Super Admin',
}

export const ROLE_HIERARCHY: UserRole[] = [
  'patient',
  'doctor',
  'assistant',
  'admin',
  'super_admin',
]

export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  patient: '/dashboard/patient',
  doctor: '/dashboard/doctor',
  assistant: '/dashboard/assistant',
  admin: '/dashboard/admin',
  super_admin: '/dashboard/super-admin',
}

export function getDashboardRoute(role: UserRole): string {
  return DASHBOARD_ROUTES[role]
}
