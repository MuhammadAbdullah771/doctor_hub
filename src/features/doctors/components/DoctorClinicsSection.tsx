import { Building, MapPin, Phone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DoctorDetail } from '@/types/doctor'

export function DoctorClinicsSection({ doctor }: { doctor: DoctorDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          Clinics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {doctor.clinics.map((clinic) => (
          <div
            key={clinic.id}
            className="rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{clinic.name}</h4>
              {clinic.is_primary && <Badge variant="secondary">Primary</Badge>}
            </div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              {clinic.address}, {clinic.city}
            </p>
            {clinic.phone && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Phone className="h-4 w-4 shrink-0" />
                {clinic.phone}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
