import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

function isProtectedPath(pathname: string): boolean {
  if (pathname.startsWith('/dashboard')) return true
  return pathname.includes('/book')
}

function AuthSessionSync() {
  const { isAuthReady, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthReady || isAuthenticated) return
    if (!isProtectedPath(location.pathname)) return

    const from = `${location.pathname}${location.search}`
    navigate('/login', { state: { from }, replace: true })
  }, [isAuthReady, isAuthenticated, location.pathname, location.search, navigate])

  return null
}

export function RootLayout() {
  return (
    <>
      <AuthSessionSync />
      <Outlet />
    </>
  )
}
