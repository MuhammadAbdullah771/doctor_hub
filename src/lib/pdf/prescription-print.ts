import type { Prescription } from '@/types/clinical'
import { formatDate } from '@/utils/format'

export function buildPrescriptionHtml(prescription: Prescription): string {
  const medicinesRows = prescription.medicines
    .map(
      (m, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${m.medicine_name}</strong></td>
        <td>${m.dosage}</td>
        <td>${m.frequency}</td>
        <td>${m.duration}</td>
        <td>${m.instructions ?? '—'}</td>
      </tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Prescription - ${prescription.patient_name}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #111; }
    .header { border-bottom: 3px solid #2563EB; padding-bottom: 16px; margin-bottom: 24px; }
    .logo { color: #2563EB; font-size: 24px; font-weight: bold; }
    .doctor-info { text-align: right; font-size: 14px; color: #555; }
    h1 { font-size: 20px; margin: 24px 0 8px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
    th { background: #f1f5f9; }
    .instructions { background: #f8fafc; padding: 16px; border-radius: 8px; margin-top: 16px; }
    .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 16px; font-size: 12px; color: #666; }
    .signature { margin-top: 48px; text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div class="logo">Doctor Hub</div>
      <div class="doctor-info">
        <strong>${prescription.doctor_name}</strong><br/>
        ${prescription.doctor_specialty ?? 'Physician'}<br/>
        Reg. Medical Practitioner
      </div>
    </div>
  </div>

  <h1>Medical Prescription</h1>

  <div class="meta">
    <div>
      <strong>Patient:</strong> ${prescription.patient_name}<br/>
      <strong>Date:</strong> ${formatDate(prescription.created_at)}
    </div>
    <div>
      <strong>Rx ID:</strong> ${prescription.id.slice(0, 12).toUpperCase()}
    </div>
  </div>

  ${prescription.diagnosis ? `<p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>` : ''}

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Medicine</th>
        <th>Dosage</th>
        <th>Frequency</th>
        <th>Duration</th>
        <th>Instructions</th>
      </tr>
    </thead>
    <tbody>${medicinesRows}</tbody>
  </table>

  ${prescription.instructions ? `<div class="instructions"><strong>General Instructions:</strong><br/>${prescription.instructions}</div>` : ''}

  <div class="signature">
    <p>_________________________</p>
    <p><strong>${prescription.doctor_name}</strong></p>
  </div>

  <div class="footer">
    This is a computer-generated prescription from Doctor Hub. Records cannot be altered after issuance.
  </div>
</body>
</html>`
}

export function printPrescription(prescription: Prescription) {
  const html = buildPrescriptionHtml(prescription)
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.onload = () => {
    win.print()
  }
}

export function downloadPrescriptionHtml(prescription: Prescription) {
  const html = buildPrescriptionHtml(prescription)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `prescription-${prescription.id.slice(0, 8)}.html`
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadMedicalRecordJson(record: {
  title: string
  diagnosis: string | null
  notes: string | null
  doctor_name: string
  created_at: string
  report_urls: string[]
}) {
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `medical-record-${record.title.replace(/\s+/g, '-').toLowerCase()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
