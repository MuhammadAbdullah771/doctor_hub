import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeUp, staggerContainer } from '@/lib/motion'

type SectionVariant = 'white' | 'gradient' | 'blue' | 'glass' | 'accent'

const variantClasses: Record<SectionVariant, string> = {
  white: 'section-white',
  gradient: 'section-gradient',
  blue: 'section-blue',
  glass: 'section-glass',
  accent: 'section-accent-band',
}

interface SectionShellProps {
  children: React.ReactNode
  variant?: SectionVariant
  className?: string
  id?: string
  animate?: boolean
}

export function SectionShell({
  children,
  variant = 'white',
  className,
  id,
  animate = true,
}: SectionShellProps) {
  const content = (
    <div className={cn('relative py-20 md:py-24 lg:py-28', variantClasses[variant], className)}>
      <div className="page-shell relative z-10">{children}</div>
    </div>
  )

  if (!animate) {
    return (
      <section id={id} className="relative overflow-hidden">
        {content}
      </section>
    )
  }

  return (
    <motion.section
      id={id}
      className="relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={staggerContainer}
    >
      {content}
    </motion.section>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'center' | 'left'
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn('mb-12 md:mb-16', align === 'center' && 'text-center mx-auto max-w-3xl')}
    >
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">{eyebrow}</p>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">{title}</h2>
      {description && (
        <p className="mt-4 text-lg md:text-xl text-muted-foreground leading-relaxed">{description}</p>
      )}
    </motion.div>
  )
}
