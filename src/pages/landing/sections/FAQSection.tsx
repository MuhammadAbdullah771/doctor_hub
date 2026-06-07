import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeader, SectionShell } from '@/components/common/SectionShell'
import { fadeUp } from '@/lib/motion'

const FAQS = [
  {
    q: 'How do I book an appointment?',
    a: 'Search for a doctor by disease or specialty, select an available time slot, and confirm your booking. Upload your payment screenshot to complete the process.',
  },
  {
    q: 'How long does payment verification take?',
    a: 'Our assistants typically verify payments within 2-4 hours during business hours. You will receive a notification once verified.',
  },
  {
    q: 'Can I access my medical history?',
    a: 'Yes! All your medical records, prescriptions, and reports are securely stored in your patient dashboard.',
  },
  {
    q: 'What types of doctors are available?',
    a: 'Doctor Hub features Allopathic, Homeopathic, and Herbal medicine practitioners across various specialties in Pakistan.',
  },
  {
    q: 'Is my health data secure?',
    a: 'Absolutely. We use enterprise-grade encryption and Row Level Security to ensure your medical data is protected.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <SectionShell id="faq" variant="white">
      <SectionHeader
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        description="Everything you need to know about Doctor Hub Pakistan"
      />

      <div className="max-w-3xl mx-auto space-y-3">
        {FAQS.map((faq, index) => (
          <motion.div
            key={faq.q}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="glass rounded-xl overflow-hidden border border-white/60"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between p-5 md:p-6 text-left font-semibold hover:bg-primary/5 transition-colors"
            >
              {faq.q}
              <ChevronDown
                className={cn(
                  'h-5 w-5 text-primary shrink-0 ml-4 transition-transform duration-300',
                  openIndex === index && 'rotate-180',
                )}
              />
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="px-5 md:px-6 pb-5 md:pb-6 text-muted-foreground leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
}
