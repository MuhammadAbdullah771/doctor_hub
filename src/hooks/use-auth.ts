import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

async function fetchSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data as Profile
}

export function useAuth() {
  const queryClient = useQueryClient()
  const [isAuthReady, setIsAuthReady] = useState(false)

  const sessionQuery = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    staleTime: Infinity,
  })

  const profileQuery = useQuery({
    queryKey: ['profile', sessionQuery.data?.user?.id],
    queryFn: () => fetchProfile(sessionQuery.data!.user.id),
    enabled: !!sessionQuery.data?.user,
  })

  useEffect(() => {
    if (profileQuery.data && !profileQuery.data.is_active && sessionQuery.data?.user) {
      void supabase.auth.signOut()
      queryClient.setQueryData(['session'], null)
      queryClient.removeQueries({ queryKey: ['profile'] })
    }
  }, [profileQuery.data, sessionQuery.data?.user, queryClient])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      queryClient.setQueryData(['session'], session)
      setIsAuthReady(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(['session'], session)
      if (session?.user) {
        queryClient.invalidateQueries({ queryKey: ['profile', session.user.id] })
      } else {
        queryClient.removeQueries({ queryKey: ['profile'] })
      }
      setIsAuthReady(true)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [queryClient])

  const signOut = async () => {
    await supabase.auth.signOut()
    queryClient.clear()
  }

  const isAuthenticated = !!sessionQuery.data?.user
  const isLoading =
    !isAuthReady ||
    sessionQuery.isLoading ||
    (isAuthenticated && profileQuery.isLoading)

  return {
    session: sessionQuery.data,
    user: sessionQuery.data?.user ?? null,
    profile: profileQuery.data ?? null,
    isAuthReady,
    isLoading,
    isAuthenticated,
    signOut,
  }
}
