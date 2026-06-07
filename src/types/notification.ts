export type NotificationType = 'appointment' | 'payment' | 'prescription' | 'system'

export interface AppNotification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  is_read: boolean
  metadata: Record<string, unknown>
  created_at: string
}
