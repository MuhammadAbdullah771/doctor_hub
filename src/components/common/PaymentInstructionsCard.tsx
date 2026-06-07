import { Banknote, Copy, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/format'
import type { PlatformSettings } from '@/types/platform.types'

type PaymentInstructionsProps = {
  settings: Pick<
    PlatformSettings,
    | 'payment_bank_name'
    | 'payment_account_title'
    | 'payment_account_number'
    | 'payment_iban'
    | 'payment_jazzcash_number'
    | 'payment_easypaisa_number'
    | 'payment_instructions'
  >
  amount?: number
  compact?: boolean
}

function copyValue(label: string, value: string) {
  void navigator.clipboard.writeText(value)
  toast.success(`${label} copied`)
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium break-all">{value}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={() => copyValue(label, value)}
        aria-label={`Copy ${label}`}
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function PaymentInstructionsCard({ settings, amount, compact = false }: PaymentInstructionsProps) {
  const hasMobileWallet =
    settings.payment_jazzcash_number.trim() || settings.payment_easypaisa_number.trim()

  return (
    <Card className={compact ? 'border-primary/20 bg-primary/5' : 'card-elevated border-gradient'}>
      <CardHeader className={compact ? 'pb-3' : undefined}>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Banknote className="h-5 w-5 text-primary" />
          Where to send payment
        </CardTitle>
        <CardDescription>
          {amount !== undefined ? (
            <>
              Transfer exactly <span className="font-semibold text-foreground">{formatCurrency(amount)}</span> to one of the accounts below.
            </>
          ) : (
            'Use one of these Doctor Hub payment accounts for consultation fees.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{settings.payment_instructions}</p>

        <div className="space-y-2">
          <p className="text-sm font-medium">Bank transfer</p>
          <DetailRow label="Bank" value={settings.payment_bank_name} />
          <DetailRow label="Account title" value={settings.payment_account_title} />
          <DetailRow label="Account number" value={settings.payment_account_number} />
          {settings.payment_iban.trim() && (
            <DetailRow label="IBAN" value={settings.payment_iban} />
          )}
        </div>

        {hasMobileWallet && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              Mobile wallets
            </p>
            {settings.payment_jazzcash_number.trim() && (
              <DetailRow label="JazzCash" value={settings.payment_jazzcash_number} />
            )}
            {settings.payment_easypaisa_number.trim() && (
              <DetailRow label="EasyPaisa" value={settings.payment_easypaisa_number} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
