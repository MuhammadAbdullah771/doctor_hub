import { usePageSeo } from '@/hooks/use-page-seo'
import { useAuth } from '@/hooks/use-auth'
import { UserManagementPanel } from '@/features/platform-settings/components/UserManagementPanel'

export function AdminUsersPage() {
  usePageSeo({ title: 'Users', description: 'Manage platform users in Pakistan.' })

  const { user, profile } = useAuth()

  return (
    <UserManagementPanel
      title="Users"
      description="View all users and ban or activate patient, doctor, and assistant accounts"
      currentUserId={user?.id}
      currentUserRole={profile?.role}
    />
  )
}
