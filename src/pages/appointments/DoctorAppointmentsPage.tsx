import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import {
  AppointmentCalendar,
  useSelectedDate,
} from '@/features/clinics/components/AppointmentCalendar'
import {
  useDoctorAppointments,
  useUpdateDoctorAppointmentStatus,
} from '@/features/appointments/hooks/use-appointments'
import { useAuth } from '@/hooks/use-auth'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'

export function DoctorAppointmentsPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useSelectedDate()
  const { data: appointments, isLoading, isError, refetch } = useDoctorAppointments(user?.id)
  const updateMutation = useUpdateDoctorAppointmentStatus(user?.id)

  const handleConfirm = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ appointmentId: id, status: 'confirmed' })
      toast.success('Appointment confirmed')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to confirm')
    }
  }

  const handleComplete = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ appointmentId: id, status: 'completed' })
      toast.success('Appointment marked complete')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update')
    }
  }

  return (
    <div>
      <PageHeader
        title="Appointments Calendar"
        description="View and manage your consultations from Supabase"
      />

      {isLoading && <Skeleton className="h-96 rounded-xl" />}
      {isError && <ErrorState title="Failed to load appointments" onRetry={() => refetch()} />}

      {!isLoading && appointments && (
        <AppointmentCalendar
          appointments={appointments}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onConfirm={handleConfirm}
          onComplete={handleComplete}
          isUpdating={updateMutation.isPending}
        />
      )}
    </div>
  )
}
