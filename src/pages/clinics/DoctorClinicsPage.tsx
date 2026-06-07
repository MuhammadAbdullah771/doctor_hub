import { useState } from 'react'
import { Building2, MapPin, Phone, Star, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { ClinicForm } from '@/features/clinics/components/ClinicForm'
import {
  useDoctorClinics,
  useDeleteClinic,
} from '@/features/clinics/hooks/use-clinics'
import { useAuth } from '@/hooks/use-auth'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Clinic } from '@/types/doctor'

export function DoctorClinicsPage() {
  const { user } = useAuth()
  const { data: clinics, isLoading, isError, refetch } = useDoctorClinics(user?.id)
  const deleteMutation = useDeleteClinic(user?.id)
  const [showForm, setShowForm] = useState(false)
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null)

  const handleDelete = async (clinic: Clinic) => {
    if (!confirm(`Delete "${clinic.name}"? This will remove its schedule too.`)) return
    try {
      await deleteMutation.mutateAsync(clinic.id)
      toast.success('Clinic deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete clinic')
    }
  }

  return (
    <div>
      <PageHeader
        title="My Clinics"
        description="Manage your clinic locations stored in Supabase"
        action={
          !showForm && !editingClinic ? (
            <Button onClick={() => setShowForm(true)}>Add Clinic</Button>
          ) : undefined
        }
      />

      {(showForm || editingClinic) && user?.id && (
        <div className="mb-8">
          <ClinicForm
            doctorId={user.id}
            clinic={editingClinic ?? undefined}
            onSuccess={() => {
              setShowForm(false)
              setEditingClinic(null)
            }}
            onCancel={() => {
              setShowForm(false)
              setEditingClinic(null)
            }}
          />
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState title="Failed to load clinics" onRetry={() => refetch()} />}

      {!isLoading && clinics?.length === 0 && !showForm && (
        <EmptyState
          title="No clinics yet"
          description="Add your first clinic to start accepting appointments."
          action={<Button onClick={() => setShowForm(true)}>Add Clinic</Button>}
        />
      )}

      {!isLoading && clinics && clinics.length > 0 && (
        <div className="space-y-4">
          {clinics.map((clinic) => (
            <Card key={clinic.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{clinic.name}</h3>
                      {clinic.is_primary && <Badge variant="accent"><Star className="h-3 w-3 mr-1" />Primary</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {clinic.address}, {clinic.city}
                    </p>
                    {clinic.phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {clinic.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingClinic(clinic)
                        setShowForm(false)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => handleDelete(clinic)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
