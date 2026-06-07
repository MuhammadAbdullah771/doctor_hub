import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { APPOINTMENT_STATUS_LABELS } from '@/constants/appointment-status'
import { formatCurrency, formatDate, formatTime } from '@/utils/format'
import type { AppointmentSummary } from '@/types/appointment'
import { cn } from '@/lib/utils'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'accent' | 'muted' | 'outline' | 'destructive'> = {
  pending: 'outline',
  payment_submitted: 'secondary',
  verified: 'default',
  confirmed: 'accent',
  completed: 'muted',
  cancelled: 'destructive',
}

interface AppointmentCardProps {
  appointment: AppointmentSummary
  showAction?: boolean
}

export function AppointmentCard({ appointment, showAction = true }: AppointmentCardProps) {
  const needsPayment = appointment.status === 'pending'

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.3 }}>
      <Card className={cn(
        'overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5',
        needsPayment && 'ring-1 ring-destructive/20',
      )}>
        {needsPayment && <div className="h-1 bg-gradient-to-r from-destructive/80 to-orange-500/80" />}
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold tracking-tight">{appointment.doctor_name}</h3>
                <Badge variant={STATUS_VARIANT[appointment.status] ?? 'outline'}>
                  {APPOINTMENT_STATUS_LABELS[appointment.status]}
                </Badge>
                {needsPayment && (
                  <Badge variant="destructive" className="animate-pulse">Payment Required</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-secondary" />
                {appointment.clinic_name}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(appointment.appointment_date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(appointment.appointment_time)}
                </span>
                <span className="font-bold text-primary">
                  {formatCurrency(appointment.consultation_fee)}
                </span>
              </div>
            </div>

            {showAction && (
              <Button variant={needsPayment ? 'default' : 'secondary'} size="sm" asChild className="shrink-0">
                <Link to={`/dashboard/patient/appointments/${appointment.id}`}>
                  {needsPayment ? 'Upload Payment' : 'View Details'}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
