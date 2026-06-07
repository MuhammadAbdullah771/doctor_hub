import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { clinicSchema, type ClinicFormValues } from '@/features/clinics/schemas/clinic.schema'
import { useCreateClinic, useUpdateClinic } from '@/features/clinics/hooks/use-clinics'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Clinic } from '@/types/doctor'

interface ClinicFormProps {
  doctorId: string
  clinic?: Clinic
  onSuccess?: () => void
  onCancel?: () => void
}

export function ClinicForm({ doctorId, clinic, onSuccess, onCancel }: ClinicFormProps) {
  const createMutation = useCreateClinic(doctorId)
  const updateMutation = useUpdateClinic(doctorId)
  const isEditing = !!clinic

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: clinic?.name ?? '',
      address: clinic?.address ?? '',
      city: clinic?.city ?? '',
      phone: clinic?.phone ?? '',
      is_primary: clinic?.is_primary ?? false,
    },
  })

  const onSubmit = async (data: ClinicFormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ clinicId: clinic.id, input: data })
        toast.success('Clinic updated')
      } else {
        await createMutation.mutateAsync(data)
        toast.success('Clinic added')
      }
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save clinic')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Clinic' : 'Add New Clinic'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Clinic Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
            {errors.address && <p className="text-sm text-destructive mt-1">{errors.address.message}</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} />
              {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} placeholder="Optional" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_primary')} className="rounded border-border" />
            Set as primary clinic
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? 'Save Changes' : 'Add Clinic'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
