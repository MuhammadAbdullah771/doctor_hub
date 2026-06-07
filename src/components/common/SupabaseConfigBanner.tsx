import { AlertTriangle } from 'lucide-react'
import { isSupabaseConfigured } from '@/lib/supabase'

export function SupabaseConfigBanner() {
  if (isSupabaseConfigured) return null

  return (
    <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
      <div className="mx-auto max-w-7xl flex items-start gap-3 text-sm">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-destructive">Supabase not configured</p>
          <p className="text-muted-foreground mt-0.5">
            Copy <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.example</code> to{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> and set{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>.
            All app data is stored in Supabase.
          </p>
        </div>
      </div>
    </div>
  )
}
