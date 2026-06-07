import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Sidebar, Topbar } from '@/layouts/components/Sidebar'
import { useAuth } from '@/hooks/use-auth'
import { getDashboardRoute } from '@/constants/roles'
import { canAccessRoute } from '@/utils/navigation'
import { PageSkeleton } from '@/components/ui/skeleton'

export function DashboardRoleRedirect() {
  const { profile, isLoading } = useAuth()

  if (isLoading) return <PageSkeleton />

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={getDashboardRoute(profile.role)} replace />
}

function DashboardAccessGuard() {
  const { profile, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageSkeleton />

  if (!profile) return null

  if (
    location.pathname !== '/dashboard' &&
    location.pathname !== '/dashboard/' &&
    !canAccessRoute(profile.role, location.pathname)
  ) {
    return <Navigate to={getDashboardRoute(profile.role)} replace />
  }

  return <Outlet />
}

export function DashboardLayout() {
  const { isLoading, isAuthenticated, profile } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dashboard-bg">
        <PageSkeleton />
      </div>
    )
  }

  if (isAuthenticated && !profile) {
    return (
      <div className="min-h-screen bg-background dashboard-bg flex items-center justify-center p-6">
        <div className="max-w-md text-center glass rounded-2xl p-8">
          <h1 className="text-xl font-bold">Account setup incomplete</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            You are signed in but your profile is missing in Supabase. Run{' '}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">update-existing-db.sql</code>{' '}
            then <code className="text-xs bg-muted px-1.5 py-0.5 rounded">seed-demo.sql</code> in the SQL Editor.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dashboard-bg">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="p-4 md:p-6 lg:p-8">
          <DashboardAccessGuard />
        </main>
      </div>
    </div>
  )
}
