import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedCounter } from '@/components/common/AnimatedCounter'
import { HeroDashboardPreview } from '@/pages/landing/sections/HeroDashboardPreview'
import { fadeUp, staggerContainer } from '@/lib/motion'

const TRUST_STATS = [
  { value: 50000, suffix: '+', label: 'Patients' },
  { value: 500, suffix: '+', label: 'Doctors' },
  { value: 100, suffix: '+', label: 'Clinics' },
  { value: 99, suffix: '%', label: 'Satisfaction' },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero min-h-[90vh] flex items-center">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="absolute top-20 right-[10%] h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-float" />
      <div className="absolute bottom-20 left-[5%] h-64 w-64 rounded-full bg-secondary/10 blur-3xl animate-float-delayed" />

      <div className="relative page-shell w-full py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.div variants={fadeUp}>
              <Badge className="mb-6 gap-2 px-4 py-1.5 text-sm font-medium border-primary/20 bg-primary/10 text-primary hover:bg-primary/10">
                <Sparkles className="h-3.5 w-3.5" />
                Pakistan&apos;s #1 Healthcare Platform
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.08]"
            >
              Find Trusted Doctors{' '}
              <span className="gradient-text">Across Pakistan</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
            >
              Book appointments, manage medical records, and consult healthcare experts seamlessly.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/doctors">
                  Find Doctors
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/register">Book Appointment</Link>
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                HIPAA-grade security
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                4.9 average rating
              </span>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {TRUST_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="glass rounded-xl p-4 text-center border border-white/50 hover:scale-[1.03] transition-transform duration-300"
                >
                  <p className="text-2xl md:text-3xl font-bold gradient-text">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <div className="hidden lg:block">
            <HeroDashboardPreview />
          </div>
        </div>
      </div>
    </section>
  )
}
