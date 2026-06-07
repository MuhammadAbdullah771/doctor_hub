import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { reviewSchema, type ReviewFormData } from '@/features/reviews/schemas/review.schema'
import { useCreateReview } from '@/features/reviews/hooks/use-reviews'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ReviewFormProps {
  patientId: string
  doctorId: string
  doctorName: string
  appointmentId: string
  onSuccess?: () => void
}

export function ReviewForm({
  patientId,
  doctorId,
  doctorName,
  appointmentId,
  onSuccess,
}: ReviewFormProps) {
  const createMutation = useCreateReview(patientId)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: '' },
  })

  const rating = watch('rating')

  const onSubmit = async (data: ReviewFormData) => {
    try {
      await createMutation.mutateAsync({
        doctor_id: doctorId,
        appointment_id: appointmentId,
        rating: data.rating,
        comment: data.comment,
      })
      toast.success('Review submitted — it appears instantly for everyone')
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit review')
    }
  }

  return (
    <Card className="card-elevated border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">Rate your visit with {doctorName}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Your rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('rating', value, { shouldValidate: true })}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                  aria-label={`Rate ${value} stars`}
                >
                  <Star
                    className={cn(
                      'h-7 w-7 transition-colors',
                      value <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/40',
                    )}
                  />
                </button>
              ))}
            </div>
            <input type="hidden" {...register('rating')} />
            {errors.rating && (
              <p className="text-sm text-destructive mt-1">{errors.rating.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="comment" className="text-sm text-muted-foreground">
              Share your experience (optional)
            </label>
            <textarea
              id="comment"
              rows={4}
              placeholder="What went well? How was the consultation?"
              className="mt-2 flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('comment')}
            />
            {errors.comment && (
              <p className="text-sm text-destructive mt-1">{errors.comment.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
            {isSubmitting || createMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </CardContent>
      </form>
    </Card>
  )
}
