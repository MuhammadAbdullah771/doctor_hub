import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  medicalHistorySchema,
  type MedicalHistoryFormData,
} from '@/features/medical-history/schemas/medical-history.schema'
import { useCreateMedicalRecord } from '@/features/medical-history/hooks/use-medical-history'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AddMedicalRecordFormProps {
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  onSuccess?: () => void
}

export function AddMedicalRecordForm({
  patientId,
  patientName,
  doctorId,
  doctorName,
  onSuccess,
}: AddMedicalRecordFormProps) {
  const createMutation = useCreateMedicalRecord(doctorId, doctorName)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MedicalHistoryFormData>({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: { patient_id: patientId },
  })

  const onSubmit = async (data: MedicalHistoryFormData) => {
    try {
      await createMutation.mutateAsync({ ...data, patientName })
      toast.success('Medical record added successfully')
      reset({ patient_id: patientId, title: '', diagnosis: '', notes: '' })
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add record')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Medical Record for {patientName}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <input type="hidden" {...register('patient_id')} />

          <div className="space-y-2">
            <Label htmlFor="title">Record Title *</Label>
            <Input id="title" placeholder="e.g. Initial Consultation" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input id="diagnosis" placeholder="Primary diagnosis" {...register('diagnosis')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Clinical Notes</Label>
            <textarea
              id="notes"
              className="flex min-h-[100px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Examination findings, observations..."
              {...register('notes')}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Medical records cannot be deleted or edited once saved.
          </p>

          <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
            {isSubmitting ? 'Saving...' : 'Save Record'}
          </Button>
        </CardContent>
      </form>
    </Card>
  )
}
