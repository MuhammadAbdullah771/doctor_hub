import { FileText, Download, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatRelative } from '@/utils/format'
import { downloadMedicalRecordJson } from '@/lib/pdf/prescription-print'
import type { MedicalHistoryRecord } from '@/types/clinical'

interface MedicalTimelineProps {
  records: MedicalHistoryRecord[]
}

export function MedicalTimeline({ records }: MedicalTimelineProps) {
  if (records.length === 0) return null

  return (
    <div className="relative space-y-0">
      <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-border hidden sm:block" />
      {records.map((record) => (
        <div key={record.id} className="relative flex gap-4 pb-8 last:pb-0">
          <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div className="flex-1 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <div>
                <h3 className="font-semibold text-lg">{record.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Dr. {record.doctor_name} · {formatRelative(record.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="muted" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Immutable
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadMedicalRecordJson(record)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </div>

            {record.diagnosis && (
              <p className="text-sm mb-2">
                <span className="font-medium">Diagnosis:</span>{' '}
                <span className="text-muted-foreground">{record.diagnosis}</span>
              </p>
            )}

            {record.notes && (
              <p className="text-sm text-muted-foreground mb-3">{record.notes}</p>
            )}

            {record.report_urls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {record.report_urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Report {i + 1}
                  </a>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-3">
              Recorded on {formatDate(record.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
