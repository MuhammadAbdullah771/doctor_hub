import { Link } from 'react-router-dom'
import { Pill, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelative } from '@/utils/format'
import type { Prescription } from '@/types/clinical'

interface PrescriptionCardProps {
  prescription: Prescription
  viewHref: string
}

export function PrescriptionCard({ prescription, viewHref }: PrescriptionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-semibold">Dr. {prescription.doctor_name}</h3>
                {prescription.doctor_specialty && (
                  <Badge variant="outline">{prescription.doctor_specialty}</Badge>
                )}
              </div>
              {prescription.diagnosis && (
                <p className="text-sm text-muted-foreground">{prescription.diagnosis}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {prescription.medicines.length} medicine{prescription.medicines.length !== 1 ? 's' : ''} ·{' '}
                {formatRelative(prescription.created_at)}
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to={viewHref}>
              View
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
