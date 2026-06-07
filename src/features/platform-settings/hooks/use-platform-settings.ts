import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { platformSettingsService } from '@/features/platform-settings/services/platform-settings.service'
import type { CreateUserInput, PlatformSettingsInput, UserDetailsInput } from '@/types/platform.types'
import { useAuth } from '@/hooks/use-auth'

export function usePlatformSettings() {
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: () => platformSettingsService.getSettings(),
    staleTime: 60_000,
  })
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()

  return useMutation({
    mutationFn: (input: PlatformSettingsInput) => {
      if (!profile?.id) throw new Error('Not authenticated')
      return platformSettingsService.updateSettings(input, profile.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] })
    },
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users', 'details'],
    queryFn: () => platformSettingsService.getUsersForAdmin(),
  })
}

export function useUpdateUserDetails() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UserDetailsInput }) => {
      if (!profile?.id) throw new Error('Not authenticated')
      return platformSettingsService.updateUserDetails(userId, input, profile.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'details'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors'] })
    },
  })
}

export function useSetUserStatus() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()

  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      if (!profile?.id) throw new Error('Not authenticated')
      return platformSettingsService.setUserStatus(userId, isActive)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'details'] })
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()

  return useMutation({
    mutationFn: (input: CreateUserInput) => {
      if (!profile?.id) throw new Error('Not authenticated')
      return platformSettingsService.createUser(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'details'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors'] })
    },
  })
}
