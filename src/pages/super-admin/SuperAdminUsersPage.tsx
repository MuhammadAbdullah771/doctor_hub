import { usePageSeo } from '@/hooks/use-page-seo'
import { useAuth } from '@/hooks/use-auth'
import { UserManagementPanel } from '@/features/platform-settings/components/UserManagementPanel'

export function SuperAdminUsersPage() {
  usePageSeo({
    title: 'User Management',
    description: 'Create users, ban accounts, and manage roles on Doctor Hub.',
  })

  const { user, profile } = useAuth()

  return (
    <UserManagementPanel
      title="User Management"
      description="Super Admin controls — create accounts, ban any user, edit roles and doctor verification"
      currentUserId={user?.id}
      currentUserRole={profile?.role}
    />
  )
}
