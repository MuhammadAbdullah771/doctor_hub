import { motion } from 'framer-motion'
import { Calendar, CheckCircle2, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DoctorHubLogo } from '@/components/common/DoctorHubLogo'

export function HeroDashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, rotateY: -8 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="relative"
    >
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 blur-2xl" />
      <div className="relative glass glow-primary rounded-2xl border border-white/50 p-5 md:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <DoctorHubLogo size="sm" />
            <div>
              <p className="text-sm font-bold">Doctor Hub</p>
              <p className="text-xs text-muted-foreground">Patient Dashboard</p>
            </div>
          </div>
          <Badge className="gradient-cta border-0">Live</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Appointments', value: '12', icon: Calendar, color: 'text-primary' },
            { label: 'Verified', value: '98%', icon: CheckCircle2, color: 'text-success' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-muted/50 p-3 border border-border/50">
              <item.icon className={`h-4 w-4 ${item.color} mb-2`} />
              <p className="text-xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {['Dr. Hassan Raza — Cardiology', 'Dr. Ayesha Malik — Dermatology'].map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-card/80 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                <div>
                  <p className="text-xs font-semibold">{name.split(' — ')[0]}</p>
                  <p className="text-[10px] text-muted-foreground">{name.split(' — ')[1]}</p>
                </div>
              </div>
              <TrendingUp className="h-3.5 w-3.5 text-success" />
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-4 top-8 glass rounded-xl px-4 py-3 shadow-lg border border-white/60 hidden sm:block"
      >
        <p className="text-2xl font-bold text-primary">99%</p>
        <p className="text-xs text-muted-foreground">Satisfaction</p>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -right-2 bottom-12 glass rounded-xl px-4 py-3 shadow-lg border border-white/60 hidden sm:block"
      >
        <p className="text-2xl font-bold text-secondary">500+</p>
        <p className="text-xs text-muted-foreground">Doctors</p>
      </motion.div>
    </motion.div>
  )
}
