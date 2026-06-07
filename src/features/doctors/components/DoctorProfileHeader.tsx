import { Star, MapPin, BadgeCheck, Clock, Banknote } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/UserAvatar'
import { formatCurrency } from '@/utils/format'
import { DOCTOR_TYPES } from '@/constants/doctor-types'
import type { DoctorDetail } from '@/types/doctor'

interface DoctorProfileHeaderProps {
  doctor: DoctorDetail
  onBookClick?: () => void
}

export function DoctorProfileHeader({ doctor, onBookClick }: DoctorProfileHeaderProps) {
  const typeLabel = DOCTOR_TYPES.find((t) => t.value === doctor.doctor_type)?.label

  return (
    <div className="glass rounded-2xl p-6 md:p-8 border-gradient overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 gradient-cta" />
      <div className="flex flex-col md:flex-row gap-6 pt-2">
        <UserAvatar
          name={doctor.full_name}
          avatarUrl={doctor.avatar_url}
          className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-primary/15 ring-offset-4 ring-offset-transparent"
          fallbackClassName="text-2xl"
        />

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">{doctor.full_name}</h1>
            {doctor.is_verified && (
              <Badge variant="default" className="gap-1">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified
              </Badge>
            )}
          </div>

          <p className="text-lg text-muted-foreground">{doctor.specialty}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {typeLabel && <Badge variant="outline">{typeLabel}</Badge>}
            <Badge variant={doctor.available_today ? 'accent' : 'muted'}>
              {doctor.available_today ? 'Available Today' : 'Not Available Today'}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <strong>{doctor.rating_avg.toFixed(1)}</strong>
              <span className="text-muted-foreground">({doctor.rating_count} reviews)</span>
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {doctor.experience_years} years experience
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {doctor.city}
            </span>
            <span className="flex items-center gap-1 font-semibold text-primary">
              <Banknote className="h-4 w-4" />
              {formatCurrency(doctor.consultation_fee)} consultation
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-1">
            {doctor.diseases.map((d) => (
              <Badge key={d} variant="muted">{d}</Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          <Button size="lg" id="book" onClick={onBookClick}>
            Book Appointment
          </Button>
          <p className="text-xs text-muted-foreground text-center md:text-right">
            Next available slot based on schedule
          </p>
        </div>
      </div>
    </div>
  )
}
