import { motion } from 'framer-motion'
import { Leaf, FlaskConical, Heart, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DOCTOR_TYPES } from '@/constants/doctor-types'
import { SectionHeader, SectionShell } from '@/components/common/SectionShell'
import { fadeUp, staggerContainer } from '@/lib/motion'

const icons = {
  allopathic: FlaskConical,
  homeopathic: Heart,
  herbal: Leaf,
}

const gradients = {
  allopathic: 'from-blue-500 to-cyan-500',
  homeopathic: 'from-teal-500 to-emerald-500',
  herbal: 'from-green-500 to-lime-500',
}

export function CategoriesSection() {
  return (
    <SectionShell id="categories" variant="white">
      <SectionHeader
        eyebrow="Specializations"
        title="Doctor Categories"
        description="Choose from multiple medical approaches — all verified and trusted across Pakistan."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-6 lg:gap-8"
      >
        {DOCTOR_TYPES.map((type) => {
          const Icon = icons[type.value]
          const gradient = gradients[type.value]
          return (
            <motion.div key={type.value} variants={fadeUp}>
              <Link to="/doctors" className="block h-full group">
                <div className="premium-card h-full p-8 border-gradient">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-400`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{type.label}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{type.description}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                    Explore doctors
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </SectionShell>
  )
}
