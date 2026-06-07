import { useMemo, useState } from 'react'
import { Ban, CheckCircle, Pencil, Search, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { ROLES } from '@/constants/roles'
import {
  useAdminUsers,
  useSetUserStatus,
} from '@/features/platform-settings/hooks/use-platform-settings'
import { EditUserDetailsDialog } from '@/features/platform-settings/components/EditUserDetailsDialog'
import { CreateUserDialog } from '@/features/platform-settings/components/CreateUserDialog'
import { hasPermission } from '@/utils/permissions'
import type { AdminUserRow } from '@/types/platform.types'
import type { UserRole } from '@/types'

interface UserManagementPanelProps {
  title?: string
  description?: string
  currentUserId?: string
  currentUserRole?: UserRole
}

export function UserManagementPanel({
  title = 'User Management',
  description = 'Create accounts, ban users, and edit roles & profiles',
  currentUserId,
  currentUserRole,
}: UserManagementPanelProps) {
  const { data, isLoading, isError, refetch } = useAdminUsers()
  const setUserStatus = useSetUserStatus()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const canCreate = currentUserRole ? hasPermission(currentUserRole, 'users:create') : false
  const canBan = currentUserRole ? hasPermission(currentUserRole, 'users:manage') : false
  const canEdit = currentUserRole === 'super_admin'

  const filtered = useMemo(() => {
    if (!data) return []
    return data.filter((user) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        user.full_name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.city?.toLowerCase().includes(q) ?? false)
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'banned' && !user.is_active)
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [data, search, roleFilter, statusFilter])

  const stats = useMemo(() => {
    if (!data) return { total: 0, active: 0, banned: 0 }
    return {
      total: data.length,
      active: data.filter((u) => u.is_active).length,
      banned: data.filter((u) => !u.is_active).length,
    }
  }, [data])

  const canModifyUser = (user: AdminUserRow) => {
    if (!canBan || user.id === currentUserId) return false
    if (currentUserRole === 'admin' && (user.role === 'admin' || user.role === 'super_admin')) {
      return false
    }
    return true
  }

  const handleToggleStatus = async (user: AdminUserRow) => {
    if (!canModifyUser(user)) return

    const nextActive = !user.is_active
    const action = nextActive ? 'activate' : 'ban'

    if (!window.confirm(`${nextActive ? 'Activate' : 'Ban'} ${user.full_name}?`)) return

    try {
      await setUserStatus.mutateAsync({ userId: user.id, isActive: nextActive })
      toast.success(nextActive ? 'User activated' : 'User banned')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${action} user`)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        action={
          canCreate ? (
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Create user
            </Button>
          ) : undefined
        }
      />

      {!isLoading && data && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Total users', value: stats.total },
            { label: 'Active', value: stats.active },
            { label: 'Banned', value: stats.banned },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold mt-1">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, email, or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="lg:w-44"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All roles' },
            ...Object.entries(ROLES).map(([value, label]) => ({ value, label })),
          ]}
        />
        <Select
          className="lg:w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All status' },
            { value: 'active', label: 'Active' },
            { value: 'banned', label: 'Banned' },
          ]}
        />
      </div>

      {isLoading && <Skeleton className="h-64 rounded-xl" />}
      {isError && <ErrorState title="Failed to load users" onRetry={() => refetch()} />}

      {!isLoading && filtered.length === 0 && (
        <EmptyState title="No users found" description="Try changing search or filters." />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((user) => (
            <Card key={user.id} className={`card-interactive ${!user.is_active ? 'opacity-80' : ''}`}>
              <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{user.full_name}</p>
                    <Badge variant="outline">{ROLES[user.role as UserRole]}</Badge>
                    {!user.is_active ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="accent">Active</Badge>
                    )}
                    {user.doctors?.is_verified && <Badge variant="secondary">Verified Doctor</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {[user.city, user.phone].filter(Boolean).join(' · ') || 'No location set'}
                    {user.doctors && ` · ${user.doctors.specialty} · PKR ${user.doctors.consultation_fee}`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setEditingUser(user)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  )}
                  {canModifyUser(user) && (
                    <Button
                      variant={user.is_active ? 'destructive' : 'default'}
                      size="sm"
                      className="gap-2"
                      disabled={setUserStatus.isPending}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.is_active ? (
                        <>
                          <Ban className="h-3.5 w-3.5" />
                          Ban user
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          Activate
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditUserDetailsDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      />
    </div>
  )
}
