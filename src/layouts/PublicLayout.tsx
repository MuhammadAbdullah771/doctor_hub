import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DoctorHubLogo } from '@/components/common/DoctorHubLogo'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { useAuth } from '@/hooks/use-auth'
import { getDashboardRoute } from '@/constants/roles'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, profile } = useAuth()
  const location = useLocation()

  const navLinks = [
    { href: '/#search', label: 'Find Doctors' },
    { href: '/#categories', label: 'Categories' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/#faq', label: 'FAQ' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-nav">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <DoctorHubLogo size="md" className="shadow-lg shadow-blue-500/25 transition-transform duration-300 group-hover:scale-105" />
            <span className="font-bold text-xl tracking-tight">Doctor Hub</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-primary/5"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/doctors"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-primary/5"
            >
              Browse
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated && profile ? (
              <Button asChild>
                <Link to={getDashboardRoute(profile.role)}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-muted/80 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden border-t border-border/60 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block py-3 px-3 text-sm font-medium rounded-lg hover:bg-primary/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  to="/doctors"
                  className="block py-3 px-3 text-sm font-medium rounded-lg hover:bg-primary/5"
                  onClick={() => setMobileOpen(false)}
                >
                  Browse Doctors
                </Link>
                <div className="flex items-center gap-3 pt-4 border-t border-border/60 mt-2">
                  <ThemeToggle />
                  {isAuthenticated ? (
                    <Button asChild className="flex-1">
                      <Link to={profile ? getDashboardRoute(profile.role) : '/dashboard'}>Dashboard</Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="secondary" asChild className="flex-1">
                        <Link to="/login">Sign In</Link>
                      </Button>
                      <Button asChild className="flex-1">
                        <Link to="/register">Register</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {children}
      </motion.main>
    </div>
  )
}
