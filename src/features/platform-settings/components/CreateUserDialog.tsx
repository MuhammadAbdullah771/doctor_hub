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
import { useCreateUser } from '@/features/platform-settings/hooks/use-platform-settings'
import {
  createUserSchema,
  type CreateUserFormValues,
} from '@/features/platform-settings/schemas/platform.schema'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const createUser = useCreateUser()

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      role: 'patient',
      phone: '',
      city: '',
      specialty: '',
      consultation_fee: 1500,
      experience_years: 0,
      is_verified: false,
    },
  })

  const selectedRole = form.watch('role')
  const isDoctor = selectedRole === 'doctor'

  async function onSubmit(values: CreateUserFormValues) {
    try {
      await createUser.mutateAsync(values)
      toast.success(`User ${values.email} created successfully`)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Super Admin only — creates login + profile. Action is logged in audit trail.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="create_email">Email</Label>
              <Input id="create_email" type="email" placeholder="user@example.com" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="create_password">Temporary password</Label>
              <Input id="create_password" type="password" placeholder="Min. 8 characters" {...form.register('password')} />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="create_full_name">Full name</Label>
              <Input id="create_full_name" {...form.register('full_name')} />
              {form.formState.errors.full_name && (
                <p className="text-xs text-destructive">{form.formState.errors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create_role">Role</Label>
              <Select
                id="create_role"
                options={Object.entries(ROLES).map(([value, label]) => ({ value, label }))}
                {...form.register('role')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create_city">City</Label>
              <Input id="create_city" placeholder="Karachi" {...form.register('city')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="create_phone">Phone</Label>
              <Input id="create_phone" placeholder="+92 300 1234567" {...form.register('phone')} />
            </div>
          </div>

          {isDoctor && (
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4 space-y-4">
              <p className="text-sm font-medium">Doctor details</p>
              <div className="space-y-2">
                <Label htmlFor="create_specialty">Specialty</Label>
                <Input id="create_specialty" placeholder="Cardiologist" {...form.register('specialty')} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create_fee">Fee (PKR)</Label>
                  <Input
                    id="create_fee"
                    type="number"
                    {...form.register('consultation_fee', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create_exp">Experience (years)</Label>
                  <Input
                    id="create_exp"
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
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? 'Creating…' : 'Create user'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
