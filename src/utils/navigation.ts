import type { UserRole } from '@/types'
import { getDashboardRoute } from '@/constants/roles'

const AUTH_PATHS = new Set(['/login', '/register', '/forgot-password', '/reset-password'])

export function isSafeRedirectPath(path: string | null | undefined): path is string {
  if (!path) return false
  if (!path.startsWith('/') || path.startsWith('//')) return false
  if (AUTH_PATHS.has(path.split('?')[0] ?? path)) return false
  return true
}

export function getRedirectPath(from: unknown): string | null {
  if (typeof from === 'string') {
    return isSafeRedirectPath(from) ? from : null
  }

  if (from && typeof from === 'object' && 'pathname' in from) {
    const location = from as { pathname?: string; search?: string }
    const path = `${location.pathname ?? ''}${location.search ?? ''}`
    return isSafeRedirectPath(path) ? path : null
  }

  return null
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  if (pathname === '/dashboard' || pathname === '/dashboard/') return true

  if (pathname.startsWith('/dashboard/patient')) return role === 'patient'
  if (pathname.startsWith('/dashboard/doctor')) return role === 'doctor'

  if (pathname.startsWith('/dashboard/assistant')) {
    return role === 'assistant' || role === 'admin' || role === 'super_admin'
  }

  if (pathname.startsWith('/dashboard/admin')) {
    return role === 'admin' || role === 'super_admin'
  }

  if (pathname.startsWith('/dashboard/super-admin')) {
    return role === 'super_admin'
  }

  if (pathname.startsWith('/doctors/') && pathname.endsWith('/book')) {
    return role === 'patient'
  }

  return true
}

export function getPostLoginRedirect(from: unknown, role: UserRole): string {
  const redirect = getRedirectPath(from)
  if (redirect && canAccessRoute(role, redirect)) {
    return redirect
  }
  return getDashboardRoute(role)
}

export function getNotificationsRoute(role: UserRole): string {
  return `${getDashboardRoute(role)}/notifications`
}
