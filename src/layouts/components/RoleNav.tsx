import type { UserRole, NavItem } from '@/types'
import { ROUTES } from '@/constants/routes'

const ADMIN_MODULE_NAV: NavItem[] = [
  { label: 'Users', href: '/dashboard/admin/users', icon: 'users', section: 'Administration' },
  { label: 'Doctors', href: '/dashboard/admin/doctors', icon: 'stethoscope', section: 'Administration' },
  { label: 'Clinics', href: '/dashboard/admin/clinics', icon: 'building', section: 'Administration' },
  { label: 'Payments', href: '/dashboard/admin/payments', icon: 'credit-card', section: 'Administration' },
  { label: 'Analytics', href: '/dashboard/admin/analytics', icon: 'bar-chart', section: 'Administration' },
  { label: 'Verifications', href: '/dashboard/assistant/verifications', icon: 'check-circle', section: 'Administration' },
]

export function getNavByRole(role: UserRole): NavItem[] {
  const patientNav: NavItem[] = [
    { label: 'Overview', href: ROUTES.DASHBOARD.PATIENT, icon: 'layout-dashboard', section: 'Patient' },
    { label: 'Appointments', href: '/dashboard/patient/appointments', icon: 'calendar', section: 'Patient' },
    { label: 'Medical History', href: '/dashboard/patient/medical-history', icon: 'file-text', section: 'Patient' },
    { label: 'Prescriptions', href: '/dashboard/patient/prescriptions', icon: 'pill', section: 'Patient' },
    { label: 'Payments', href: '/dashboard/patient/payments', icon: 'credit-card', section: 'Patient' },
    { label: 'Notifications', href: '/dashboard/patient/notifications', icon: 'bell', section: 'Patient' },
  ]

  const doctorNav: NavItem[] = [
    { label: 'Overview', href: ROUTES.DASHBOARD.DOCTOR, icon: 'layout-dashboard', section: 'Doctor' },
    { label: 'Appointments', href: '/dashboard/doctor/appointments', icon: 'calendar', section: 'Doctor' },
    { label: 'Patients', href: '/dashboard/doctor/patients', icon: 'users', section: 'Doctor' },
    { label: 'Prescriptions', href: '/dashboard/doctor/prescriptions', icon: 'pill', section: 'Doctor' },
    { label: 'Clinics', href: '/dashboard/doctor/clinics', icon: 'building', section: 'Doctor' },
    { label: 'Schedule', href: '/dashboard/doctor/schedule', icon: 'clock', section: 'Doctor' },
    { label: 'Notifications', href: '/dashboard/doctor/notifications', icon: 'bell', section: 'Doctor' },
  ]

  const assistantNav: NavItem[] = [
    { label: 'Overview', href: ROUTES.DASHBOARD.ASSISTANT, icon: 'layout-dashboard', section: 'Assistant' },
    { label: 'Verifications', href: '/dashboard/assistant/verifications', icon: 'check-circle', section: 'Assistant' },
    { label: 'Notifications', href: '/dashboard/assistant/notifications', icon: 'bell', section: 'Assistant' },
  ]

  const adminNav: NavItem[] = [
    { label: 'Overview', href: ROUTES.DASHBOARD.ADMIN, icon: 'layout-dashboard', section: 'Admin' },
    ...ADMIN_MODULE_NAV,
    { label: 'Notifications', href: '/dashboard/admin/notifications', icon: 'bell', section: 'Admin' },
  ]

  const superAdminNav: NavItem[] = [
    { label: 'Overview', href: ROUTES.DASHBOARD.SUPER_ADMIN, icon: 'layout-dashboard', section: 'Platform' },
    { label: 'Platform Details', href: '/dashboard/super-admin/system', icon: 'settings', section: 'Platform' },
    { label: 'User Management', href: '/dashboard/super-admin/users', icon: 'users', section: 'Platform' },
    { label: 'Audit Logs', href: '/dashboard/super-admin/audit-logs', icon: 'shield', section: 'Platform' },
    ...ADMIN_MODULE_NAV,
    { label: 'Notifications', href: '/dashboard/super-admin/notifications', icon: 'bell', section: 'Platform' },
  ]

  const navMap: Record<UserRole, NavItem[]> = {
    patient: patientNav,
    doctor: doctorNav,
    assistant: assistantNav,
    admin: adminNav,
    super_admin: superAdminNav,
  }

  return navMap[role]
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true

  const overviewRoutes: string[] = [
    ROUTES.DASHBOARD.PATIENT,
    ROUTES.DASHBOARD.DOCTOR,
    ROUTES.DASHBOARD.ASSISTANT,
    ROUTES.DASHBOARD.ADMIN,
    ROUTES.DASHBOARD.SUPER_ADMIN,
  ]

  if (overviewRoutes.includes(href)) return false
  return pathname.startsWith(`${href}/`)
}
