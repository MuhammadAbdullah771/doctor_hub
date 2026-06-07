import { motion } from 'framer-motion'
import { TREATMENT_TYPES } from '@/constants/doctor-types'
import { SectionHeader, SectionShell } from '@/components/common/SectionShell'
import { fadeUp, staggerContainer } from '@/lib/motion'

export function TreatmentTypesSection() {
  return (
    <SectionShell variant="glass">
      <SectionHeader
        eyebrow="Treatments"
        title="Treatment Types"
        description="Find specialists for every healthcare need"
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-wrap justify-center gap-3 md:gap-4"
      >
        {TREATMENT_TYPES.map((treatment) => (
          <motion.div key={treatment} variants={fadeUp}>
            <span className="inline-flex items-center rounded-full border border-primary/15 bg-card/90 px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:gradient-cta hover:text-white hover:border-transparent hover:scale-105 transition-all duration-300 cursor-default">
              {treatment}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </SectionShell>
  )
}
