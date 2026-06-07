import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy'): string {
  const value = typeof date === 'string' ? parseISO(date) : date
  return format(value, pattern)
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

import { APP_REGION } from '@/constants/region'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(APP_REGION.locale, {
    style: 'currency',
    currency: APP_REGION.currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatRelative(date: string): string {
  return formatDistanceToNow(parseISO(date), { addSuffix: true })
}
