import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Upload, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { FileDropzone } from '@/components/common/FileDropzone'
import { PaymentScreenshot } from '@/components/common/PaymentScreenshot'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUploadPayment } from '@/features/appointments/hooks/use-appointments'
import { PaymentInstructionsCard } from '@/components/common/PaymentInstructionsCard'
import { usePlatformSettings } from '@/features/platform-settings/hooks/use-platform-settings'
import { formatCurrency } from '@/utils/format'
import { resolvePaymentScreenshotUrl } from '@/utils/media'
import type { AppointmentDetail } from '@/types/appointment'

interface PaymentUploadSectionProps {
  appointment: AppointmentDetail
  patientId: string
}

export function PaymentUploadSection({ appointment, patientId }: PaymentUploadSectionProps) {
  const uploadMutation = useUploadPayment(patientId)
  const { data: platformSettings } = usePlatformSettings()
  const payment = appointment.payment
  const storedScreenshot = resolvePaymentScreenshotUrl(payment?.screenshot_url)
  const [preview, setPreview] = useState<string | null>(storedScreenshot)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (!selectedFile) {
      setPreview(resolvePaymentScreenshotUrl(payment?.screenshot_url))
    }
  }, [payment?.screenshot_url, selectedFile])

  const canUpload =
    appointment.status === 'pending' &&
    (payment?.status === 'pending' || payment?.status === 'rejected')
  const isSubmitted = payment?.status === 'submitted' || appointment.status === 'payment_submitted'
  const isVerified = payment?.status === 'verified' || ['verified', 'confirmed', 'completed'].includes(appointment.status)
  const isRejected = payment?.status === 'rejected'

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreview(storedScreenshot)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a payment screenshot')
      return
    }
    try {
      const updated = await uploadMutation.mutateAsync({
        appointmentId: appointment.id,
        file: selectedFile,
      })
      setSelectedFile(null)
      setPreview(resolvePaymentScreenshotUrl(updated.payment?.screenshot_url))
      toast.success('Payment screenshot submitted for verification')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  if (!payment) return null

  const showScreenshot = isSubmitted || isVerified || isRejected

  return (
    <div className="space-y-4">
      {platformSettings && canUpload && (
        <PaymentInstructionsCard
          settings={platformSettings}
          amount={payment.amount}
          compact
        />
      )}

      <Card className="card-elevated border-gradient">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Payment Verification
            </CardTitle>
            <CardDescription>
              Amount due: {formatCurrency(payment.amount)}
            </CardDescription>
          </div>
          {isVerified && (
            <Badge variant="accent" className="gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              Verified
            </Badge>
          )}
          {isSubmitted && !isVerified && (
            <Badge variant="secondary" className="gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              Awaiting Verification
            </Badge>
          )}
          {isRejected && (
            <Badge variant="destructive">Rejected</Badge>
          )}
          {canUpload && (
            <Badge variant="outline">Upload Required</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isRejected && canUpload && (
          <p className="text-sm text-destructive">
            Your payment was rejected. Please upload a new screenshot.
          </p>
        )}

        {canUpload && (
          <>
            <FileDropzone
              onFileSelect={handleFileSelect}
              preview={preview}
              onClear={handleClear}
              label="Drag & drop your payment screenshot here"
            />
            <Button
              className="w-full sm:w-auto"
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Submit Payment Screenshot'}
            </Button>
          </>
        )}

        {showScreenshot && (
          <div className="rounded-xl border border-border/60 p-4 bg-muted/20">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Submitted Screenshot
            </p>
            <PaymentScreenshot
              url={payment.screenshot_url}
              src={preview}
              className="max-h-72 w-full rounded-lg border border-border object-contain mx-auto bg-white"
            />
          </div>
        )}

        {isSubmitted && !isVerified && (
          <p className="text-sm text-muted-foreground">
            Your payment is being reviewed by our assistant team. You will be notified once verified.
          </p>
        )}

        {payment.remarks && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">Remarks</p>
            <p className="text-muted-foreground">{payment.remarks}</p>
          </div>
        )}

        {isVerified && (
          <p className="text-sm text-accent font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Payment verified. Your appointment will be confirmed shortly.
          </p>
        )}
      </CardContent>
    </Card>
    </div>
  )
}
