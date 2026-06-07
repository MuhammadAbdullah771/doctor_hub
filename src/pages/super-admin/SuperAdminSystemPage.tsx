import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Save, Globe, Banknote } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { PaymentInstructionsCard } from '@/components/common/PaymentInstructionsCard'
import { usePageSeo } from '@/hooks/use-page-seo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { APP_REGION } from '@/constants/region'
import {
  usePlatformSettings,
  useUpdatePlatformSettings,
} from '@/features/platform-settings/hooks/use-platform-settings'
import {
  platformSettingsSchema,
  type PlatformSettingsFormValues,
} from '@/features/platform-settings/schemas/platform.schema'
import { formatDate } from '@/utils/format'

const PAYMENT_DEFAULTS = {
  payment_bank_name: APP_REGION.paymentBankName,
  payment_account_title: APP_REGION.paymentAccountTitle,
  payment_account_number: APP_REGION.paymentAccountNumber,
  payment_iban: APP_REGION.paymentIban,
  payment_jazzcash_number: APP_REGION.paymentJazzcashNumber,
  payment_easypaisa_number: APP_REGION.paymentEasypaisaNumber,
  payment_instructions: APP_REGION.paymentInstructions,
}

export function SuperAdminSystemPage() {
  usePageSeo({
    title: 'Platform Details',
    description: 'Manage Doctor Hub platform contact, payment accounts, and region settings.',
  })

  const { data, isLoading, isError, refetch } = usePlatformSettings()
  const updateSettings = useUpdatePlatformSettings()

  const form = useForm<PlatformSettingsFormValues>({
    resolver: zodResolver(platformSettingsSchema),
    defaultValues: {
      app_name: 'Doctor Hub',
      country: 'Pakistan',
      locale: 'en-PK',
      currency: 'PKR',
      support_email: '',
      support_phone: '',
      headquarters: '',
      tagline: '',
      ...PAYMENT_DEFAULTS,
    },
  })

  useEffect(() => {
    if (!data) return
    form.reset({
      app_name: data.app_name,
      country: data.country,
      locale: data.locale,
      currency: data.currency,
      support_email: data.support_email,
      support_phone: data.support_phone,
      headquarters: data.headquarters,
      tagline: data.tagline,
      payment_bank_name: data.payment_bank_name,
      payment_account_title: data.payment_account_title,
      payment_account_number: data.payment_account_number,
      payment_iban: data.payment_iban,
      payment_jazzcash_number: data.payment_jazzcash_number,
      payment_easypaisa_number: data.payment_easypaisa_number,
      payment_instructions: data.payment_instructions,
    })
  }, [data, form])

  async function onSubmit(values: PlatformSettingsFormValues) {
    try {
      await updateSettings.mutateAsync(values)
      toast.success('Platform details saved')
    } catch {
      toast.error('Failed to save platform details')
    }
  }

  if (isError) {
    return <ErrorState title="Failed to load platform settings" onRetry={() => refetch()} />
  }

  const previewSettings = form.watch()

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Platform Details"
        description="Update contact info, payment accounts patients use, and regional branding"
      />

      {isLoading && <Skeleton className="h-96 rounded-xl" />}

      {!isLoading && data && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Regional & contact settings
              </CardTitle>
              {data.updated_at && (
                <p className="text-xs text-muted-foreground">
                  Last updated {formatDate(data.updated_at, 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="app_name">App name</Label>
                <Input id="app_name" {...form.register('app_name')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" {...form.register('tagline')} />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" {...form.register('country')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locale">Locale</Label>
                  <Input id="locale" {...form.register('locale')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" {...form.register('currency')} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="support_email">Support email</Label>
                  <Input id="support_email" type="email" {...form.register('support_email')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support_phone">Support phone</Label>
                  <Input id="support_phone" {...form.register('support_phone')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headquarters">Headquarters address</Label>
                <Input id="headquarters" {...form.register('headquarters')} />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                Payment accounts
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Shown to patients when booking and uploading payment screenshots
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="payment_instructions">Instructions for patients</Label>
                <textarea
                  id="payment_instructions"
                  className="flex min-h-[88px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...form.register('payment_instructions')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_bank_name">Bank name</Label>
                <Input id="payment_bank_name" {...form.register('payment_bank_name')} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_account_title">Account title</Label>
                  <Input id="payment_account_title" {...form.register('payment_account_title')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_account_number">Account number</Label>
                  <Input id="payment_account_number" {...form.register('payment_account_number')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_iban">IBAN (optional)</Label>
                <Input id="payment_iban" {...form.register('payment_iban')} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_jazzcash_number">JazzCash number</Label>
                  <Input id="payment_jazzcash_number" {...form.register('payment_jazzcash_number')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_easypaisa_number">EasyPaisa number</Label>
                  <Input id="payment_easypaisa_number" {...form.register('payment_easypaisa_number')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <PaymentInstructionsCard settings={previewSettings} compact />

          <Button type="submit" disabled={updateSettings.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {updateSettings.isPending ? 'Saving…' : 'Save platform details'}
          </Button>
        </form>
      )}
    </div>
  )
}
