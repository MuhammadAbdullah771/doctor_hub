import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { queryClient } from '@/app/query-client'
import { router } from '@/routes'
import { SupabaseConfigBanner } from '@/components/common/SupabaseConfigBanner'

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseConfigBanner />
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" closeButton />
    </QueryClientProvider>
  )
}
