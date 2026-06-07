import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarUrl } from '@/utils/media'

interface UserAvatarProps {
  name: string
  avatarUrl?: string | null
  className?: string
  fallbackClassName?: string
}

export function UserAvatar({ name, avatarUrl, className, fallbackClassName }: UserAvatarProps) {
  const src = getAvatarUrl(name, avatarUrl)

  return (
    <Avatar className={className}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback name={name} className={fallbackClassName} />
    </Avatar>
  )
}
