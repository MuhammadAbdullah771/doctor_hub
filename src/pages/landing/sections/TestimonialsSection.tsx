import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SectionHeader, SectionShell } from '@/components/common/SectionShell'
import { fadeUp, staggerContainer } from '@/lib/motion'

const TESTIMONIALS = [
  {
    name: 'Ahmed Hassan',
    city: 'Karachi',
    text: 'Booked Dr. Hassan Raza in DHA within minutes. Payment verification was quick and my records are all in one place.',
    rating: 5,
  },
  {
    name: 'Fatima Malik',
    city: 'Lahore',
    text: 'Found an excellent dermatologist in Gulberg. The whole process felt professional and trustworthy.',
    rating: 5,
  },
  {
    name: 'Zainab Ahmed',
    city: 'Karachi',
    text: 'Verifying payments through the dashboard saves our clinic team hours every week. Enterprise-grade platform.',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <SectionShell variant="blue">
      <SectionHeader
        eyebrow="Testimonials"
        title="Trusted by Patients Nationwide"
        description="Real feedback from patients across Pakistan"
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-6 lg:gap-8"
      >
        {TESTIMONIALS.map((item) => (
          <motion.div key={item.name} variants={fadeUp}>
            <div className="premium-card h-full p-8 border-gradient">
              <Quote className="h-10 w-10 text-primary/30 mb-4" />
              <p className="text-muted-foreground leading-relaxed mb-6">&ldquo;{item.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <Avatar className="ring-2 ring-primary/20">
                  <AvatarFallback name={item.name} />
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Patient · {item.city}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </SectionShell>
  )
}
