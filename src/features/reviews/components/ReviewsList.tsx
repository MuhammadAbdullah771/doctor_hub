import { motion, AnimatePresence } from 'framer-motion'
import { Star, Radio } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelative } from '@/utils/format'
import type { Review } from '@/types/doctor'

interface ReviewsListProps {
  reviews: Review[]
  isLoading?: boolean
  live?: boolean
}

export function ReviewsList({ reviews, isLoading, live = true }: ReviewsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        description="Completed patients can leave a review — new ones appear here instantly."
      />
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border border-border/70 bg-gradient-to-br from-card to-muted/30 p-4 hover:border-primary/25 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-background">
                <AvatarFallback name={review.patient_name} />
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{review.patient_name}</p>
                  <span className="text-xs text-muted-foreground">{formatRelative(review.created_at)}</span>
                </div>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {live && reviews.length > 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
          <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
          Live updates enabled
        </p>
      )}
    </div>
  )
}

export function ReviewsListHeader({
  count,
  averageRating,
  live,
}: {
  count: number
  averageRating?: number
  live?: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
      <span className="font-semibold">Reviews ({count})</span>
      {averageRating !== undefined && count > 0 && (
        <Badge variant="outline" className="gap-1">
          {averageRating.toFixed(1)} avg
        </Badge>
      )}
      {live && (
        <Badge variant="accent" className="gap-1 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </Badge>
      )}
    </div>
  )
}
