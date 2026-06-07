import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react'
import { DoctorHubLogo } from '@/components/common/DoctorHubLogo'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { usePlatformSettings } from '@/features/platform-settings/hooks/use-platform-settings'
import { APP_REGION } from '@/constants/region'

export function FooterSection() {
  const { data: settings, isLoading } = usePlatformSettings()

  const appName = settings?.app_name ?? 'Doctor Hub'
  const tagline = settings?.tagline ?? 'Your trusted healthcare consultation platform. Connect with top doctors, manage records, and take control of your health.'
  const supportEmail = settings?.support_email ?? APP_REGION.supportEmail
  const supportPhone = settings?.support_phone ?? APP_REGION.supportPhone
  const headquarters = settings?.headquarters ?? APP_REGION.headquarters

  return (
    <footer className="relative overflow-hidden">
      <div className="gradient-cta relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"
          >
            <div className="max-w-xl">
              <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Ready to take control of your health?
              </h3>
              <p className="mt-4 text-lg text-white/85 leading-relaxed">
                Join thousands of patients across Pakistan booking trusted doctors online.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button size="lg" variant="secondary" asChild className="bg-white text-primary hover:bg-white/90 shadow-xl">
                <Link to="/doctors">
                  Find Doctors
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/40 text-white hover:bg-white/10 bg-transparent">
                <Link to="/register">Get Started Free</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="bg-[#0f172a] text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-white mb-5">
                <DoctorHubLogo size="md" className="shadow-lg" />
                {appName}
              </Link>
              <p className="text-sm leading-relaxed text-slate-400">{tagline}</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-5">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/doctors" className="hover:text-white transition-colors">Find Doctors</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Book Appointment</Link></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-5">For Doctors</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/register" className="hover:text-white transition-colors">Join as Doctor</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Doctor Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-5">Contact</h4>
              {isLoading ? (
                <Skeleton className="h-24 w-full bg-slate-700/50" />
              ) : (
                <ul className="space-y-4 text-sm">
                  <li className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                      <Mail className="h-4 w-4 text-secondary" />
                    </div>
                    {supportEmail}
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                      <Phone className="h-4 w-4 text-secondary" />
                    </div>
                    {supportPhone}
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                      <MapPin className="h-4 w-4 text-secondary" />
                    </div>
                    {headquarters}
                  </li>
                </ul>
              )}
            </div>
          </div>

          <Separator className="my-10 bg-slate-700/50" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} {appName}. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
