import { Link } from 'react-router-dom'
import {
  Shield,
  Settings,
  Users,
  Stethoscope,
  Building,
  CreditCard,
  BarChart3,
  CheckCircle,
  Bell,
  ArrowRight,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuditLogs } from '@/features/audit/hooks/use-audit-logs'
import { formatDate } from '@/utils/format'

const PLATFORM_LINKS = [
  {
    title: 'Platform Details',
    description: 'Contact info, payment accounts, currency, and branding',
    href: '/dashboard/super-admin/system',
    icon: Settings,
  },
  {
    title: 'User Management',
    description: 'Create users, ban accounts, edit roles & doctor verification',
    href: '/dashboard/super-admin/users',
    icon: Users,
  },
  {
    title: 'Audit Logs',
    description: 'System and detail change compliance trail',
    href: '/dashboard/super-admin/audit-logs',
    icon: Shield,
  },
]

const ADMIN_LINKS = [
  { title: 'Users', href: '/dashboard/admin/users', icon: Users },
  { title: 'Doctors', href: '/dashboard/admin/doctors', icon: Stethoscope },
  { title: 'Clinics', href: '/dashboard/admin/clinics', icon: Building },
  { title: 'Payments', href: '/dashboard/admin/payments', icon: CreditCard },
  { title: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
  { title: 'Verifications', href: '/dashboard/assistant/verifications', icon: CheckCircle },
  { title: 'Notifications', href: '/dashboard/super-admin/notifications', icon: Bell },
]

export function SuperAdminDashboardPage() {
  const { data: auditLogs } = useAuditLogs()
  const recentLogs = (auditLogs ?? []).slice(0, 5)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Super Admin"
        title="Platform Control Center"
        description="Full access to platform settings, user management, admin modules, and audit trail"
      />

      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Platform</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {PLATFORM_LINKS.map((link) => (
            <Card key={link.href} className="card-interactive border-gradient">
              <CardContent className="p-6">
                <link.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold">{link.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{link.description}</p>
                <Button variant="secondary" size="sm" asChild>
                  <Link to={link.href}>
                    Open
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Administration</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ADMIN_LINKS.map((link) => (
            <Button key={link.href} variant="secondary" asChild className="h-auto py-4 justify-start">
              <Link to={link.href} className="flex flex-col items-start gap-2">
                <link.icon className="h-5 w-5 text-primary" />
                <span className="font-semibold">{link.title}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <Card className="card-elevated border-gradient">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent detail changes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/super-admin/audit-logs">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit events yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentLogs.map((log) => (
                <li
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <span className="font-medium">{log.action}</span>
                  <span className="text-muted-foreground">
                    {log.actor_name ?? 'System'} · {formatDate(log.created_at, 'MMM d, h:mm a')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
