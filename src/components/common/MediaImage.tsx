import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { PAYMENT_DEMO_IMAGE } from '@/utils/media'

interface MediaImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
  fallbackClassName?: string
}

export function MediaImage({
  src,
  alt,
  className,
  fallbackSrc = PAYMENT_DEMO_IMAGE,
  fallbackClassName,
  onError,
  ...props
}: MediaImageProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const displaySrc = !src || failed ? fallbackSrc : src

  if (!displaySrc) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-xs text-muted-foreground',
          className,
          fallbackClassName,
        )}
      >
        Image unavailable
      </div>
    )
  }

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(event) => {
        setFailed(true)
        onError?.(event)
      }}
      {...props}
    />
  )
}
