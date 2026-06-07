import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReviewsList, ReviewsListHeader } from '@/features/reviews/components/ReviewsList'
import { useDoctorReviews } from '@/features/reviews/hooks/use-reviews'

interface DoctorReviewsSectionProps {
  doctorId: string
  fallbackRating?: number
}

export function DoctorReviewsSection({ doctorId, fallbackRating }: DoctorReviewsSectionProps) {
  const { data: reviews, isLoading } = useDoctorReviews(doctorId)

  const list = reviews ?? []
  const average =
    list.length > 0
      ? list.reduce((sum, r) => sum + r.rating, 0) / list.length
      : fallbackRating

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle>
          <ReviewsListHeader
            count={list.length}
            averageRating={average}
            live
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReviewsList reviews={list} isLoading={isLoading} live />
      </CardContent>
    </Card>
  )
}
