import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useUnreadNotificationCount } from '@/features/notifications/hooks/use-notifications'
import { getNotificationsRoute } from '@/utils/navigation'

export function NotificationBell() {
  const { profile } = useAuth()
  const { data: unread = 0 } = useUnreadNotificationCount(profile?.id)

  if (!profile) return null

  const href = getNotificationsRoute(profile.role)

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link to={href} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center"
          >
            {unread > 9 ? '9+' : unread}
          </Badge>
        )}
      </Link>
    </Button>
  )
}
