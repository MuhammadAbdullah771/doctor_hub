import { Link } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { getDashboardRoute } from '@/constants/roles'

export function UnauthorizedPage() {
  const { profile } = useAuth()
  const dashboard = profile ? getDashboardRoute(profile.role) : '/'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <ShieldOff className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        You don&apos;t have permission to access this page. Use the sidebar to open modules for your role.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button asChild>
          <Link to={dashboard}>{profile ? 'Go to My Dashboard' : 'Go Home'}</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/">Home</Link>
        </Button>
      </div>
    </div>
  )
}
