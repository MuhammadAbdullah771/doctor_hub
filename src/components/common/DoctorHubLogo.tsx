import { cn } from '@/lib/utils'

interface DoctorHubLogoProps {
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const sizeMap = {
  xs: 'h-7 w-7',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

export function DoctorHubLogo({ className, size = 'md' }: DoctorHubLogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn('shrink-0', sizeMap[size], className)}
    >
      <rect width="32" height="32" rx="8" fill="#2563EB" />
      <path d="M16 8v16M8 16h16" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
