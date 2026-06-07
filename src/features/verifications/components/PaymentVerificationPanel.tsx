import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react'
import {
  verifyPaymentSchema,
  rejectPaymentSchema,
  type VerifyPaymentFormData,
  type RejectPaymentFormData,
} from '@/features/verifications/schemas/verification.schema'
import { useVerifyPayment, useRejectPayment } from '@/features/verifications/hooks/use-verifications'
import type { PaymentVerificationItem } from '@/types/appointment'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate, formatTime } from '@/utils/format'
import { PaymentScreenshot } from '@/components/common/PaymentScreenshot'

interface PaymentVerificationPanelProps {
  item: PaymentVerificationItem
  assistantId: string
  onComplete: () => void
}

export function PaymentVerificationPanel({
  item,
  assistantId,
  onComplete,
}: PaymentVerificationPanelProps) {
  const [mode, setMode] = useState<'view' | 'verify' | 'reject'>('view')
  const verifyMutation = useVerifyPayment(assistantId)
  const rejectMutation = useRejectPayment(assistantId)

  const verifyForm = useForm<VerifyPaymentFormData>({
    resolver: zodResolver(verifyPaymentSchema),
    defaultValues: { remarks: '' },
  })

  const rejectForm = useForm<RejectPaymentFormData>({
    resolver: zodResolver(rejectPaymentSchema),
    defaultValues: { remarks: '' },
  })

  const handleVerify = async (data: VerifyPaymentFormData) => {
    try {
      await verifyMutation.mutateAsync({
        appointmentId: item.appointment_id,
        remarks: data.remarks || undefined,
      })
      toast.success('Payment verified successfully')
      onComplete()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed')
    }
  }

  const handleReject = async (data: RejectPaymentFormData) => {
    try {
      await rejectMutation.mutateAsync({
        appointmentId: item.appointment_id,
        remarks: data.remarks,
      })
      toast.success('Payment rejected. Patient will be notified to re-upload.')
      onComplete()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Rejection failed')
    }
  }

  const isPending = verifyMutation.isPending || rejectMutation.isPending

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{item.patient_name}</h3>
            {item.patient_email && (
              <p className="text-sm text-muted-foreground">{item.patient_email}</p>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Doctor:</span> {item.doctor_name}</p>
            <p><span className="text-muted-foreground">Specialty:</span> {item.doctor_specialty}</p>
            <p><span className="text-muted-foreground">Clinic:</span> {item.clinic_name}</p>
            <p>
              <span className="text-muted-foreground">Appointment:</span>{' '}
              {formatDate(item.appointment_date)} at {formatTime(item.appointment_time)}
            </p>
            <p>
              <span className="text-muted-foreground">Amount:</span>{' '}
              <Badge variant="default">{formatCurrency(item.amount)}</Badge>
            </p>
          </div>

          {item.symptoms && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium mb-1">Symptoms</p>
              <p className="text-muted-foreground">{item.symptoms}</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Payment Screenshot
          </p>
          <PaymentScreenshot
            url={item.screenshot_url}
            className="w-full max-h-80 rounded-xl border border-border object-contain bg-white"
          />
        </div>
      </div>

      <Separator />

      {mode === 'view' && (
        <div className="flex flex-wrap gap-3">
          <Button
            variant="default"
            className="bg-accent hover:bg-accent/90"
            onClick={() => setMode('verify')}
          >
            <CheckCircle className="h-4 w-4" />
            Verify Payment
          </Button>
          <Button variant="destructive" onClick={() => setMode('reject')}>
            <XCircle className="h-4 w-4" />
            Reject Payment
          </Button>
        </div>
      )}

      {mode === 'verify' && (
        <form onSubmit={verifyForm.handleSubmit(handleVerify)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verify-remarks">Remarks (optional)</Label>
            <textarea
              id="verify-remarks"
              className="flex min-h-[80px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Payment verified successfully"
              {...verifyForm.register('remarks')}
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending} className="bg-accent hover:bg-accent/90">
              {isPending ? 'Verifying...' : 'Confirm Verification'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setMode('view')}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {mode === 'reject' && (
        <form onSubmit={rejectForm.handleSubmit(handleReject)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reject-remarks">Rejection Reason *</Label>
            <textarea
              id="reject-remarks"
              className="flex min-h-[80px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Explain why the payment was rejected..."
              {...rejectForm.register('remarks')}
            />
            {rejectForm.formState.errors.remarks && (
              <p className="text-sm text-destructive">
                {rejectForm.formState.errors.remarks.message}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setMode('view')}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
