import { Printer, Download, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/utils/format'
import { printPrescription, downloadPrescriptionHtml } from '@/lib/pdf/prescription-print'
import type { Prescription } from '@/types/clinical'

interface PrescriptionViewerProps {
  prescription: Prescription
  showActions?: boolean
}

export function PrescriptionViewer({ prescription, showActions = true }: PrescriptionViewerProps) {
  return (
    <div className="space-y-6">
      {showActions && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => printPrescription(prescription)}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={() => downloadPrescriptionHtml(prescription)}>
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Badge variant="muted" className="gap-1 ml-auto">
            <Lock className="h-3 w-3" />
            Read-only · Cannot be edited
          </Badge>
        </div>
      )}

      <Card id="prescription-print" className="overflow-hidden">
        <div className="bg-primary px-6 py-4 text-primary-foreground">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-lg font-bold">Doctor Hub</p>
              <p className="text-sm opacity-90">Medical Prescription</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold">{prescription.doctor_name}</p>
              <p className="opacity-90">{prescription.doctor_specialty ?? 'Physician'}</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Patient</p>
              <p className="font-semibold">{prescription.patient_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-semibold">{formatDate(prescription.created_at)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Prescription ID</p>
              <p className="font-mono text-xs">{prescription.id.slice(0, 16).toUpperCase()}</p>
            </div>
          </div>

          {prescription.diagnosis && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Diagnosis</p>
                <p>{prescription.diagnosis}</p>
              </div>
            </>
          )}

          <Separator />

          <div>
            <CardTitle className="text-base mb-4">Medicines</CardTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium">#</th>
                    <th className="text-left py-2 pr-4 font-medium">Medicine</th>
                    <th className="text-left py-2 pr-4 font-medium">Dosage</th>
                    <th className="text-left py-2 pr-4 font-medium">Frequency</th>
                    <th className="text-left py-2 pr-4 font-medium">Duration</th>
                    <th className="text-left py-2 font-medium">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.medicines.map((med, i) => (
                    <tr key={med.id} className="border-b border-border/50">
                      <td className="py-3 pr-4">{i + 1}</td>
                      <td className="py-3 pr-4 font-medium">{med.medicine_name}</td>
                      <td className="py-3 pr-4">{med.dosage}</td>
                      <td className="py-3 pr-4">{med.frequency}</td>
                      <td className="py-3 pr-4">{med.duration}</td>
                      <td className="py-3">{med.instructions ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {prescription.instructions && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium mb-1">General Instructions</p>
                <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
              </div>
            </>
          )}

          <div className="pt-8 text-right">
            <div className="inline-block text-sm">
              <div className="border-t border-foreground w-48 mb-2" />
              <p className="font-semibold">{prescription.doctor_name}</p>
              <p className="text-muted-foreground">Authorized Signature</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
