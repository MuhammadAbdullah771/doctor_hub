import { getInitials } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const BROKEN_IMAGE_HOSTS = ['placehold.co', 'via.placeholder.com', 'placeholder.com']
const DEMO_IMAGE_PATH = '/images/payment-screenshot-demo.svg'

const PAYMENT_DEMO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" rx="16" fill="#EFF6FF"/><rect x="48" y="48" width="504" height="304" rx="12" fill="#FFFFFF" stroke="#2563EB" stroke-width="2" stroke-dasharray="8 6"/><rect x="180" y="120" width="240" height="56" rx="8" fill="#2563EB"/><text x="300" y="155" text-anchor="middle" fill="#FFFFFF" font-family="Inter,Arial,sans-serif" font-size="20" font-weight="600">Payment Screenshot</text><text x="300" y="220" text-anchor="middle" fill="#64748B" font-family="Inter,Arial,sans-serif" font-size="16">Doctor Hub Pakistan - Demo</text><text x="300" y="252" text-anchor="middle" fill="#94A3B8" font-family="Inter,Arial,sans-serif" font-size="14">PKR bank transfer receipt placeholder</text></svg>`

/** Inline demo image — always loads without relying on public asset paths. */
export const PAYMENT_DEMO_IMAGE = `data:image/svg+xml,${encodeURIComponent(PAYMENT_DEMO_SVG)}`

export function isBrokenMediaUrl(url: string | null | undefined): boolean {
  if (!url) return true
  return BROKEN_IMAGE_HOSTS.some((host) => url.includes(host))
}

function isDemoPaymentImagePath(url: string): boolean {
  return url === DEMO_IMAGE_PATH || url.endsWith('/payment-screenshot-demo.svg')
}

function extractStorageObjectPath(url: string, bucket: string): string | null {
  const marker = `${bucket}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length).split('?')[0] ?? '')
}

function buildPublicStorageUrl(bucket: string, objectPath: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath)
  return data.publicUrl
}

export function resolveMediaUrl(url: string | null | undefined, bucket?: string): string | null {
  if (!url || isBrokenMediaUrl(url)) return null

  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }

  if (isDemoPaymentImagePath(url)) {
    return PAYMENT_DEMO_IMAGE
  }

  if (bucket) {
    if (url.startsWith('http')) {
      const objectPath = extractStorageObjectPath(url, bucket)
      if (objectPath) {
        return buildPublicStorageUrl(bucket, objectPath)
      }
      return url
    }

    if (url.startsWith('/')) {
      return url
    }

    return buildPublicStorageUrl(bucket, url)
  }

  if (url.startsWith('http') || url.startsWith('/')) {
    return url
  }

  return url
}

export function resolvePaymentScreenshotUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (isBrokenMediaUrl(url)) return PAYMENT_DEMO_IMAGE

  const resolved = resolveMediaUrl(url, 'payment-screenshots')
  if (resolved) return resolved

  return PAYMENT_DEMO_IMAGE
}

export function getAvatarUrl(name: string, avatarUrl?: string | null): string {
  const resolved = resolveMediaUrl(avatarUrl, 'avatars')
  if (resolved) return resolved
  return generateInitialsAvatarDataUrl(name)
}

function generateInitialsAvatarDataUrl(name: string): string {
  const initials = getInitials(name || 'User')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2563EB"/><stop offset="100%" stop-color="#06B6D4"/></linearGradient></defs><rect fill="url(#g)" width="128" height="128" rx="64"/><text x="64" y="76" text-anchor="middle" fill="#FFFFFF" font-family="Inter,Arial,sans-serif" font-size="42" font-weight="700">${initials}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
