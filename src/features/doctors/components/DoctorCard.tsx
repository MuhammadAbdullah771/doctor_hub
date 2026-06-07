import { Link } from 'react-router-dom'
import { Star, MapPin, BadgeCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/UserAvatar'
import { formatCurrency } from '@/utils/format'
import { DOCTOR_TYPES } from '@/constants/doctor-types'
import type { DoctorListItem } from '@/types/doctor'

interface DoctorCardProps {
  doctor: DoctorListItem
  index?: number
}

export function DoctorCard({ doctor, index = 0 }: DoctorCardProps) {
  const typeLabel = DOCTOR_TYPES.find((t) => t.value === doctor.doctor_type)?.label ?? doctor.doctor_type

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -8 }}
    >
      <Card className="h-full card-interactive group overflow-hidden border-gradient">
        <div className="h-1.5 gradient-cta opacity-80 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-5">
            <UserAvatar
              name={doctor.full_name}
              avatarUrl={doctor.avatar_url}
              className="h-16 w-16 ring-2 ring-primary/15 ring-offset-2 ring-offset-card"
              fallbackClassName="text-lg font-bold"
            />
            <div className="flex flex-col items-end gap-1.5">
              <Badge variant={doctor.available_today ? 'accent' : 'muted'}>
                {doctor.available_today ? 'Available Today' : 'Busy'}
              </Badge>
              {doctor.is_verified && (
                <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>
          </div>

          <Link to={`/doctors/${doctor.id}`} className="group-hover:text-primary transition-colors">
            <h3 className="font-bold text-xl tracking-tight">{doctor.full_name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground mt-1">{doctor.specialty}</p>
          <Badge variant="outline" className="mt-3">{typeLabel}</Badge>

          <div className="mt-4 flex items-center gap-1.5 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-bold">{doctor.rating_avg.toFixed(1)}</span>
            <span className="text-muted-foreground">({doctor.rating_count} reviews)</span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary" />
            <span className="truncate">{doctor.clinic_name}, {doctor.city}</span>
          </div>

          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {doctor.experience_years} years experience
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {doctor.diseases.slice(0, 2).map((d) => (
              <Badge key={d} variant="muted" className="text-xs">{d}</Badge>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-5">
            <div>
              <p className="text-xs text-muted-foreground">Consultation</p>
              <span className="text-xl font-bold text-primary">{formatCurrency(doctor.consultation_fee)}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" asChild>
                <Link to={`/doctors/${doctor.id}`}>View</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={`/doctors/${doctor.id}/book`}>Book</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
