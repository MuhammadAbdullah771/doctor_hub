import { motion } from 'framer-motion'
import { Search, Calendar, Upload, CheckCircle } from 'lucide-react'
import { SectionHeader, SectionShell } from '@/components/common/SectionShell'
import { fadeUp, staggerContainer } from '@/lib/motion'

const STEPS = [
  { icon: Search, title: 'Search Doctor', description: 'Find doctors by disease, specialty, or city across Pakistan.' },
  { icon: Calendar, title: 'Book Appointment', description: 'Choose a convenient time slot and book instantly.' },
  { icon: Upload, title: 'Upload Payment', description: 'Submit your payment screenshot for quick verification.' },
  { icon: CheckCircle, title: 'Get Confirmed', description: 'Once verified, receive confirmation and visit your doctor.' },
]

export function HowItWorksSection() {
  return (
    <SectionShell id="how-it-works" variant="accent">
      <SectionHeader
        eyebrow="Simple Process"
        title="How It Works"
        description="Book your consultation in four simple steps"
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6"
      >
        {STEPS.map((step, index) => (
          <motion.div key={step.title} variants={fadeUp} className="relative text-center group">
            {index < STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-10 left-[55%] w-[90%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
            )}
            <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-2xl gradient-cta text-white mb-5 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-400">
              <step.icon className="h-8 w-8" />
              <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold shadow-md">
                {index + 1}
              </span>
            </div>
            <h3 className="font-bold text-lg mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </SectionShell>
  )
}
