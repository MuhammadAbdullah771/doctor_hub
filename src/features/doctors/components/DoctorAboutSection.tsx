import { GraduationCap, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DoctorDetail } from '@/types/doctor'

export function DoctorAboutSection({ doctor }: { doctor: DoctorDetail }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {doctor.bio ?? 'No biography available.'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Qualifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {doctor.qualifications.map((q) => (
              <li key={q} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {q}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
