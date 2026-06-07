import { Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { PageSkeleton } from '@/components/ui/skeleton'
import { getPostLoginRedirect } from '@/utils/navigation'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, profile, signOut } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated && profile && !profile.is_active) {
      void signOut()
    }
  }, [isAuthenticated, profile, signOut])

  if (isLoading) return <PageSkeleton />

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`
    return <Navigate to="/login" state={{ from }} replace />
  }

  if (profile && !profile.is_active) {
    return <Navigate to="/login" state={{ banned: true }} replace />
  }

  return <>{children}</>
}

interface GuestRouteProps {
  children: React.ReactNode
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading, profile } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageSkeleton />

  if (isAuthenticated && profile?.is_active) {
    return (
      <Navigate
        to={getPostLoginRedirect(location.state?.from, profile.role)}
        replace
      />
    )
  }

  return <>{children}</>
}
