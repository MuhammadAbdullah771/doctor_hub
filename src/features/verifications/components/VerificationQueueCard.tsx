import { Calendar, Clock, User, MapPin, Banknote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PaymentScreenshot } from '@/components/common/PaymentScreenshot'
import { formatCurrency, formatDate, formatTime, formatRelative } from '@/utils/format'
import type { PaymentVerificationItem } from '@/types/appointment'

interface VerificationQueueCardProps {
  item: PaymentVerificationItem
  onReview: (appointmentId: string) => void
}

export function VerificationQueueCard({ item, onReview }: VerificationQueueCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex gap-4">
            <PaymentScreenshot
              url={item.screenshot_url}
              className="h-20 w-20 rounded-lg border border-border object-cover shrink-0 bg-white"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{item.patient_name}</h3>
                <Badge variant="secondary">Awaiting Review</Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                Dr. {item.doctor_name} · {item.doctor_specialty}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {item.clinic_name}
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(item.appointment_date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(item.appointment_time)}
                </span>
                <span className="flex items-center gap-1 font-medium text-primary">
                  <Banknote className="h-3.5 w-3.5" />
                  {formatCurrency(item.amount)}
                </span>
              </div>
              {item.submitted_at && (
                <p className="text-xs text-muted-foreground">
                  Submitted {formatRelative(item.submitted_at)}
                </p>
              )}
            </div>
          </div>
          <Button onClick={() => onReview(item.appointment_id)} className="shrink-0">
            Review Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
