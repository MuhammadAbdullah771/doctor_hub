import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/auth.schema'
import { authService } from '@/features/auth/services/auth.service'
import { getPostLoginRedirect } from '@/utils/navigation'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const redirectTo = (location.state as { from?: unknown; banned?: boolean } | null)?.from
  const wasBanned = (location.state as { banned?: boolean } | null)?.banned

  useEffect(() => {
    if (wasBanned) {
      toast.error('Your account has been suspended. Contact support.')
    }
  }, [wasBanned])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await authService.signIn(data)
      await queryClient.invalidateQueries({ queryKey: ['session'] })

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', result.user.id)
        .single()

      if (profileError || !profile) {
        toast.error('Signed in but profile not found. Run seed-demo.sql in Supabase.')
        navigate('/login', { replace: true })
        return
      }

      queryClient.setQueryData(['profile', result.user.id], profile as Profile)

      toast.success(`Welcome back, ${(profile as Profile).full_name.split(' ')[0]}!`)
      navigate(getPostLoginRedirect(redirectTo, (profile as Profile).role), { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
    }
  }

  return (
    <Card className="glass border-0 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your Doctor Hub account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Register
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
