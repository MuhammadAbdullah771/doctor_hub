import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Star, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/UserAvatar'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/utils/format'
import { DOCTOR_TYPES } from '@/constants/doctor-types'
import { useDoctors } from '@/features/doctors/hooks/use-doctors'
import { SectionShell } from '@/components/common/SectionShell'
import { fadeUp, staggerContainer } from '@/lib/motion'

export function FeaturedDoctorsSection() {
  const { data: doctors, isLoading } = useDoctors({})
  const featured = (doctors ?? []).slice(0, 4)

  return (
    <SectionShell variant="gradient">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 md:mb-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Top Rated</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Featured Doctors</h2>
          <p className="mt-4 text-lg text-muted-foreground">Verified healthcare professionals across Pakistan</p>
        </div>
        <Button variant="secondary" asChild className="shrink-0 self-start lg:self-auto">
          <Link to="/doctors">View All Doctors</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      ) : featured.length === 0 ? (
        <Card className="glass">
          <CardContent className="p-10 text-center text-muted-foreground">
            No verified doctors yet. Run seed-demo.sql in Supabase.
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {featured.map((doctor) => {
            const typeLabel = DOCTOR_TYPES.find((t) => t.value === doctor.doctor_type)?.label
            return (
              <motion.div key={doctor.id} variants={fadeUp}>
                <div className="premium-card h-full p-6 border-gradient">
                  <div className="flex items-start justify-between mb-5">
                    <UserAvatar
                      name={doctor.full_name}
                      avatarUrl={doctor.avatar_url}
                      className="h-16 w-16 ring-2 ring-primary/10"
                      fallbackClassName="text-lg font-bold"
                    />
                    <Badge variant={doctor.available_today ? 'accent' : 'muted'}>
                      {doctor.available_today ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                  <Link to={`/doctors/${doctor.id}`} className="hover:text-primary transition-colors">
                    <h3 className="font-bold text-lg">{doctor.full_name}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">{doctor.specialty}</p>
                  {typeLabel && <Badge variant="outline" className="mt-2">{typeLabel}</Badge>}

                  <div className="mt-4 flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{doctor.rating_avg}</span>
                    <span className="text-muted-foreground">({doctor.rating_count})</span>
                  </div>

                  <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {doctor.city}
                  </div>

                  <div className="mt-5 flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="font-bold text-primary text-lg">{formatCurrency(doctor.consultation_fee)}</span>
                    <Button size="sm" asChild>
                      <Link to={`/doctors/${doctor.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </SectionShell>
  )
}
