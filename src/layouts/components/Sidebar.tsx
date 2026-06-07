import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Pill,
  CreditCard,
  Users,
  Building,
  Clock,
  CheckCircle,
  Stethoscope,
  BarChart3,
  Settings,
  Shield,
  Bell,
  LogOut,
  Menu,
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DoctorHubLogo } from '@/components/common/DoctorHubLogo'
import { useAuth } from '@/hooks/use-auth'
import { getNavByRole, isNavItemActive } from '@/layouts/components/RoleNav'
import { ROLES } from '@/constants/roles'
import { UserAvatar } from '@/components/common/UserAvatar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { Skeleton } from '@/components/ui/skeleton'
import type { NavItem } from '@/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'layout-dashboard': LayoutDashboard,
  calendar: Calendar,
  'file-text': FileText,
  pill: Pill,
  'credit-card': CreditCard,
  users: Users,
  building: Building,
  clock: Clock,
  'check-circle': CheckCircle,
  stethoscope: Stethoscope,
  'bar-chart': BarChart3,
  settings: Settings,
  shield: Shield,
  bell: Bell,
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const location = useLocation()
  const Icon = iconMap[item.icon] ?? LayoutDashboard
  const isActive = isNavItemActive(location.pathname, item.href)

  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300',
        isActive
          ? 'gradient-cta text-white shadow-lg shadow-blue-500/20'
          : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  )
}

function NavSections({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const sections = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    const key = item.section ?? 'Menu'
    acc[key] = acc[key] ?? []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {Object.entries(sections).map(([section, sectionItems]) => (
        <div key={section}>
          {Object.keys(sections).length > 1 && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
              {section}
            </p>
          )}
          <div className="space-y-1">
            {sectionItems.map((item) => (
              <NavLink key={item.href} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { profile, signOut, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-4 gap-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col h-full p-6 justify-center text-center">
        <p className="text-sm font-semibold text-destructive">Profile not found</p>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Your account exists but has no profile row. Re-run{' '}
          <code className="text-[10px] bg-muted px-1 rounded">seed-demo.sql</code> in Supabase.
        </p>
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Sign out
        </button>
      </div>
    )
  }

  const navItems = getNavByRole(profile.role)

  return (
    <>
      <div className="flex h-16 items-center gap-2.5 border-b border-border/50 px-6 shrink-0">
        <DoctorHubLogo size="sm" className="shadow-md" />
        <div className="min-w-0">
          <span className="font-bold tracking-tight">Doctor Hub</span>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">
            {ROLES[profile.role]}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <NavSections items={navItems} onNavigate={onNavigate} />
      </div>

      <div className="border-t border-border/50 p-4 shrink-0">
        <div className="glass rounded-xl p-3 mb-4">
          <div className="flex items-center gap-3">
            <UserAvatar name={profile.full_name} avatarUrl={profile.avatar_url} className="h-10 w-10 ring-2 ring-primary/20" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            </div>
          </div>
        </div>
        <Separator className="mb-4" />
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => signOut()}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </>
  )
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/50 glass lg:flex">
      <SidebarContent />
    </aside>
  )
}

export function Topbar() {
  const { profile } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between glass-nav px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 hover:bg-muted/80 transition-colors shrink-0"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary hidden sm:block">
              {profile ? ROLES[profile.role] : 'Dashboard'}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              Welcome, <span className="font-semibold text-foreground">{profile?.full_name?.split(' ')[0] ?? 'User'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col glass lg:hidden shadow-2xl"
            >
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
