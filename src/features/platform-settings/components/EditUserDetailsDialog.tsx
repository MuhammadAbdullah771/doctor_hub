import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { ROLES } from '@/constants/roles'
import { useUpdateUserDetails } from '@/features/platform-settings/hooks/use-platform-settings'
import {
  userDetailsSchema,
  type UserDetailsFormValues,
} from '@/features/platform-settings/schemas/platform.schema'
import type { AdminUserRow } from '@/types/platform.types'

interface EditUserDetailsDialogProps {
  user: AdminUserRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditUserDetailsDialog({ user, open, onOpenChange }: EditUserDetailsDialogProps) {
  const updateUser = useUpdateUserDetails()

  const form = useForm<UserDetailsFormValues>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      city: '',
      role: 'patient',
      is_active: true,
    },
  })

  const selectedRole = form.watch('role')
  const isDoctor = selectedRole === 'doctor'

  useEffect(() => {
    if (!user) return
    form.reset({
      full_name: user.full_name,
      phone: user.phone ?? '',
      city: user.city ?? '',
      role: user.role,
      is_active: user.is_active,
      specialty: user.doctors?.specialty ?? '',
      consultation_fee: user.doctors?.consultation_fee ?? 0,
      experience_years: user.doctors?.experience_years ?? 0,
      is_verified: user.doctors?.is_verified ?? false,
    })
  }, [user, form])

  async function onSubmit(values: UserDetailsFormValues) {
    if (!user) return

    try {
      await updateUser.mutateAsync({ userId: user.id, input: values })
      toast.success('User details updated')
      onOpenChange(false)
    } catch {
      toast.error('Failed to update user details')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User Details</DialogTitle>
          <DialogDescription>
            {user?.email} — changes are logged in audit trail
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" {...form.register('full_name')} />
            {form.formState.errors.full_name && (
              <p className="text-xs text-destructive">{form.formState.errors.full_name.message}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+92 300 1234567" {...form.register('phone')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Karachi" {...form.register('city')} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                id="role"
                options={Object.entries(ROLES).map(([value, label]) => ({ value, label }))}
                {...form.register('role')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select
                id="is_active"
                options={[
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Banned' },
                ]}
                value={form.watch('is_active') ? 'true' : 'false'}
                onChange={(e) => form.setValue('is_active', e.target.value === 'true')}
              />
            </div>
          </div>

          {isDoctor && user?.doctors && (
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4 space-y-4">
              <p className="text-sm font-medium">Doctor details</p>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input id="specialty" {...form.register('specialty')} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consultation_fee">Fee (PKR)</Label>
                  <Input
                    id="consultation_fee"
                    type="number"
                    {...form.register('consultation_fee', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Experience (years)</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    {...form.register('experience_years', { valueAsNumber: true })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register('is_verified')} className="rounded" />
                Verified doctor (visible in public listing)
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
