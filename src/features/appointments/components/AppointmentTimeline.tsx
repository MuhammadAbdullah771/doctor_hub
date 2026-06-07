import { Check, Circle, X } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  APPOINTMENT_TIMELINE_STEPS,
  APPOINTMENT_STATUS_LABELS,
  getAppointmentStepIndex,
} from '@/constants/appointment-status'
import { cn } from '@/lib/utils'
import type { AppointmentStatus } from '@/types'

interface AppointmentTimelineProps {
  status: AppointmentStatus
  className?: string
}

export function AppointmentTimeline({ status, className }: AppointmentTimelineProps) {
  const currentIndex = getAppointmentStepIndex(status)
  const isCancelled = status === 'cancelled'

  return (
    <div className={cn('w-full', className)}>
      {isCancelled ? (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <X className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="font-medium text-destructive">Appointment Cancelled</p>
            <p className="text-sm text-muted-foreground">This appointment is no longer active.</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border hidden sm:block" />
          <div className="space-y-6">
            {APPOINTMENT_TIMELINE_STEPS.map((step, index) => {
              const isComplete = index < currentIndex
              const isCurrent = index === currentIndex
              const isUpcoming = index > currentIndex

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start gap-4"
                >
                  <div
                    className={cn(
                      'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      isComplete && 'border-accent bg-accent text-white',
                      isCurrent && 'border-primary bg-primary text-white shadow-lg shadow-primary/25',
                      isUpcoming && 'border-border bg-card text-muted-foreground',
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-5 w-5" />
                    ) : isCurrent ? (
                      <Circle className="h-4 w-4 fill-current" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>

                  <div className="pt-1.5 pb-2">
                    <p
                      className={cn(
                        'font-medium',
                        isCurrent && 'text-primary',
                        isComplete && 'text-accent',
                        isUpcoming && 'text-muted-foreground',
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {APPOINTMENT_STATUS_LABELS[step.key]}
                      {isCurrent && ' — Current step'}
                      {isComplete && ' — Done'}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
