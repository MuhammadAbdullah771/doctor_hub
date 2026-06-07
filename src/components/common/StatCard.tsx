import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  trend?: string
  accent?: 'primary' | 'secondary' | 'accent' | 'success' | 'default'
  loading?: boolean
  index?: number
}

const accentStyles = {
  primary: 'bg-gradient-to-br from-blue-500/15 to-blue-600/5 text-primary ring-1 ring-blue-500/10',
  secondary: 'bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 text-secondary ring-1 ring-cyan-500/10',
  accent: 'bg-gradient-to-br from-teal-500/15 to-teal-600/5 text-accent ring-1 ring-teal-500/10',
  success: 'bg-gradient-to-br from-green-500/15 to-green-600/5 text-success ring-1 ring-green-500/10',
  default: 'bg-muted text-muted-foreground',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = 'primary',
  loading,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="premium-card border-gradient rounded-xl p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-10 w-24" />
          ) : (
            <p className="text-3xl md:text-4xl font-bold tracking-tight">{value}</p>
          )}
          {trend && !loading && (
            <p className="text-xs font-medium text-success">{trend}</p>
          )}
        </div>
        <div className={cn('rounded-xl p-3.5 shrink-0', accentStyles[accent])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  )
}
