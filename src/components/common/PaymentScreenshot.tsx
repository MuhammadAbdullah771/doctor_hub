import { useEffect, useState } from 'react'
import { MediaImage } from '@/components/common/MediaImage'
import { supabase } from '@/lib/supabase'
import { PAYMENT_DEMO_IMAGE, resolvePaymentScreenshotUrl } from '@/utils/media'

interface PaymentScreenshotProps {
  url: string | null | undefined
  src?: string | null
  alt?: string
  className?: string
}

function isStorageObjectPath(url: string): boolean {
  return !url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:')
}

export function PaymentScreenshot({
  url,
  src,
  alt = 'Payment screenshot',
  className,
}: PaymentScreenshotProps) {
  const [resolved, setResolved] = useState(
    () => src ?? resolvePaymentScreenshotUrl(url) ?? PAYMENT_DEMO_IMAGE,
  )

  useEffect(() => {
    if (src) {
      setResolved(src)
      return
    }

    const sync = resolvePaymentScreenshotUrl(url)
    setResolved(sync ?? PAYMENT_DEMO_IMAGE)

    if (!url || !isStorageObjectPath(url)) return

    let cancelled = false

    supabase.storage
      .from('payment-screenshots')
      .createSignedUrl(url, 3600)
      .then(({ data, error }) => {
        if (cancelled || error || !data?.signedUrl) return
        setResolved(data.signedUrl)
      })

    return () => {
      cancelled = true
    }
  }, [url, src])

  return <MediaImage src={resolved} alt={alt} className={className} />
}
