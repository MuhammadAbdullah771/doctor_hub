import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  prescriptionSchema,
  type PrescriptionFormData,
} from '@/features/prescriptions/schemas/prescription.schema'
import { useCreatePrescription } from '@/features/prescriptions/hooks/use-prescriptions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CreatePrescriptionFormProps {
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  doctorSpecialty: string | null
}

export function CreatePrescriptionForm({
  patientId,
  patientName,
  doctorId,
  doctorName,
  doctorSpecialty,
}: CreatePrescriptionFormProps) {
  const navigate = useNavigate()
  const createMutation = useCreatePrescription(doctorId, doctorName, doctorSpecialty)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patient_id: patientId,
      diagnosis: '',
      instructions: '',
      medicines: [{ medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'medicines' })

  const onSubmit = async (data: PrescriptionFormData) => {
    try {
      const rx = await createMutation.mutateAsync({ ...data, patientName })
      toast.success('Prescription created successfully')
      navigate(`/dashboard/doctor/prescriptions/${rx.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create prescription')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prescription for {patientName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="hidden" {...register('patient_id')} />

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input id="diagnosis" placeholder="Primary diagnosis" {...register('diagnosis')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">General Instructions</Label>
            <textarea
              id="instructions"
              className="flex min-h-[80px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Diet, lifestyle, follow-up advice..."
              {...register('instructions')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Medicines</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' })}
          >
            <Plus className="h-4 w-4" />
            Add Medicine
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.medicines?.message && (
            <p className="text-sm text-destructive">{errors.medicines.message}</p>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Medicine {index + 1}</span>
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <Label>Medicine Name *</Label>
                  <Input placeholder="e.g. Amoxicillin 500mg" {...register(`medicines.${index}.medicine_name`)} />
                </div>
                <div className="space-y-1">
                  <Label>Dosage *</Label>
                  <Input placeholder="1 tablet" {...register(`medicines.${index}.dosage`)} />
                </div>
                <div className="space-y-1">
                  <Label>Frequency *</Label>
                  <Input placeholder="Twice daily" {...register(`medicines.${index}.frequency`)} />
                </div>
                <div className="space-y-1">
                  <Label>Duration *</Label>
                  <Input placeholder="7 days" {...register(`medicines.${index}.duration`)} />
                </div>
                <div className="space-y-1">
                  <Label>Instructions</Label>
                  <Input placeholder="After meals" {...register(`medicines.${index}.instructions`)} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Prescriptions cannot be edited after creation.
      </p>

      <Button type="submit" size="lg" disabled={isSubmitting || createMutation.isPending}>
        {isSubmitting ? 'Creating...' : 'Create Prescription'}
      </Button>
    </form>
  )
}
