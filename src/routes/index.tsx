import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardLayout, DashboardRoleRedirect } from '@/layouts/DashboardLayout'
import { ProtectedRoute, GuestRoute } from '@/routes/guards'
import { RootLayout } from '@/components/auth/AuthSessionSync'
import { ROUTES } from '@/constants/routes'
import { getDashboardRoute } from '@/constants/roles'

const LandingPage = lazy(() =>
  import('@/pages/landing/LandingPage').then((m) => ({ default: m.LandingPage })),
)
const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
)
const ResetPasswordPage = lazy(() =>
  import('@/pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)
const UnauthorizedPage = lazy(() =>
  import('@/pages/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage })),
)
const PatientDashboardPage = lazy(() =>
  import('@/pages/dashboard/PatientDashboardPage').then((m) => ({ default: m.PatientDashboardPage })),
)
const DoctorDashboardPage = lazy(() =>
  import('@/pages/dashboard/DoctorDashboardPage').then((m) => ({ default: m.DoctorDashboardPage })),
)
const AssistantDashboardPage = lazy(() =>
  import('@/pages/dashboard/AssistantDashboardPage').then((m) => ({ default: m.AssistantDashboardPage })),
)
const AdminDashboardPage = lazy(() =>
  import('@/pages/dashboard/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const SuperAdminDashboardPage = lazy(() =>
  import('@/pages/dashboard/SuperAdminDashboardPage').then((m) => ({ default: m.SuperAdminDashboardPage })),
)
const DoctorsListingPage = lazy(() =>
  import('@/pages/doctors/DoctorsListingPage').then((m) => ({ default: m.DoctorsListingPage })),
)
const DoctorProfilePage = lazy(() =>
  import('@/pages/doctors/DoctorProfilePage').then((m) => ({ default: m.DoctorProfilePage })),
)
const BookAppointmentPage = lazy(() =>
  import('@/pages/appointments/BookAppointmentPage').then((m) => ({ default: m.BookAppointmentPage })),
)
const PatientAppointmentsPage = lazy(() =>
  import('@/pages/appointments/PatientAppointmentsPage').then((m) => ({ default: m.PatientAppointmentsPage })),
)
const AppointmentDetailPage = lazy(() =>
  import('@/pages/appointments/AppointmentDetailPage').then((m) => ({ default: m.AppointmentDetailPage })),
)
const PatientPaymentsPage = lazy(() =>
  import('@/pages/appointments/PatientPaymentsPage').then((m) => ({ default: m.PatientPaymentsPage })),
)
const AssistantVerificationsPage = lazy(() =>
  import('@/pages/verifications/AssistantVerificationsPage').then((m) => ({ default: m.AssistantVerificationsPage })),
)
const AdminPaymentsPage = lazy(() =>
  import('@/pages/admin/AdminPaymentsPage').then((m) => ({ default: m.AdminPaymentsPage })),
)
const PatientMedicalHistoryPage = lazy(() =>
  import('@/pages/medical-history/PatientMedicalHistoryPage').then((m) => ({ default: m.PatientMedicalHistoryPage })),
)
const PatientPrescriptionsPage = lazy(() =>
  import('@/pages/prescriptions/PatientPrescriptionsPage').then((m) => ({ default: m.PatientPrescriptionsPage })),
)
const PrescriptionDetailPage = lazy(() =>
  import('@/pages/prescriptions/PrescriptionDetailPage').then((m) => ({ default: m.PrescriptionDetailPage })),
)
const DoctorPrescriptionsPage = lazy(() =>
  import('@/pages/prescriptions/DoctorPrescriptionsPage').then((m) => ({ default: m.DoctorPrescriptionsPage })),
)
const DoctorCreatePrescriptionPage = lazy(() =>
  import('@/pages/prescriptions/DoctorCreatePrescriptionPage').then((m) => ({ default: m.DoctorCreatePrescriptionPage })),
)
const DoctorAppointmentsPage = lazy(() =>
  import('@/pages/appointments/DoctorAppointmentsPage').then((m) => ({ default: m.DoctorAppointmentsPage })),
)
const DoctorClinicsPage = lazy(() =>
  import('@/pages/clinics/DoctorClinicsPage').then((m) => ({ default: m.DoctorClinicsPage })),
)
const DoctorSchedulePage = lazy(() =>
  import('@/pages/clinics/DoctorSchedulePage').then((m) => ({ default: m.DoctorSchedulePage })),
)
const AdminAnalyticsPage = lazy(() =>
  import('@/pages/admin/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage })),
)
const AdminUsersPage = lazy(() =>
  import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
)
const AdminDoctorsPage = lazy(() =>
  import('@/pages/admin/AdminDoctorsPage').then((m) => ({ default: m.AdminDoctorsPage })),
)
const NotificationsPage = lazy(() =>
  import('@/pages/notifications/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
)
const AdminClinicsPage = lazy(() =>
  import('@/pages/admin/AdminClinicsPage').then((m) => ({ default: m.AdminClinicsPage })),
)
const DoctorPatientsPage = lazy(() =>
  import('@/pages/doctors/DoctorPatientsPage').then((m) => ({ default: m.DoctorPatientsPage })),
)
const AuditLogsPage = lazy(() =>
  import('@/pages/super-admin/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })),
)
const SuperAdminSystemPage = lazy(() =>
  import('@/pages/super-admin/SuperAdminSystemPage').then((m) => ({ default: m.SuperAdminSystemPage })),
)
const SuperAdminUsersPage = lazy(() =>
  import('@/pages/super-admin/SuperAdminUsersPage').then((m) => ({ default: m.SuperAdminUsersPage })),
)

function DashboardRedirect() {
  return <DashboardRoleRedirect />
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
  { path: ROUTES.HOME, element: <LandingPage /> },
  { path: ROUTES.LOGIN, element: <GuestRoute><LoginPage /></GuestRoute> },
  { path: ROUTES.REGISTER, element: <GuestRoute><RegisterPage /></GuestRoute> },
  { path: ROUTES.FORGOT_PASSWORD, element: <GuestRoute><ForgotPasswordPage /></GuestRoute> },
  { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage /> },
  { path: ROUTES.UNAUTHORIZED, element: <UnauthorizedPage /> },
  { path: ROUTES.DOCTORS, element: <DoctorsListingPage /> },
  { path: ROUTES.DOCTOR_PROFILE, element: <DoctorProfilePage /> },
  { path: ROUTES.BOOK_APPOINTMENT, element: <BookAppointmentPage /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardRedirect /> },
      { path: 'patient', element: <PatientDashboardPage /> },
      { path: 'patient/appointments', element: <PatientAppointmentsPage /> },
      { path: 'patient/appointments/:id', element: <AppointmentDetailPage /> },
      { path: 'patient/payments', element: <PatientPaymentsPage /> },
      { path: 'patient/notifications', element: <NotificationsPage /> },
      { path: 'patient/medical-history', element: <PatientMedicalHistoryPage /> },
      { path: 'patient/prescriptions', element: <PatientPrescriptionsPage /> },
      { path: 'patient/prescriptions/:id', element: <PrescriptionDetailPage /> },
      { path: 'doctor', element: <DoctorDashboardPage /> },
      { path: 'doctor/patients', element: <DoctorPatientsPage /> },
      { path: 'doctor/prescriptions', element: <DoctorPrescriptionsPage /> },
      { path: 'doctor/prescriptions/new', element: <DoctorCreatePrescriptionPage /> },
      { path: 'doctor/prescriptions/:id', element: <PrescriptionDetailPage /> },
      { path: 'doctor/appointments', element: <DoctorAppointmentsPage /> },
      { path: 'doctor/clinics', element: <DoctorClinicsPage /> },
      { path: 'doctor/schedule', element: <DoctorSchedulePage /> },
      { path: 'doctor/notifications', element: <NotificationsPage /> },
      { path: 'assistant', element: <AssistantDashboardPage /> },
      { path: 'assistant/verifications', element: <AssistantVerificationsPage /> },
      { path: 'assistant/notifications', element: <NotificationsPage /> },
      { path: 'admin', element: <AdminDashboardPage /> },
      { path: 'admin/payments', element: <AdminPaymentsPage /> },
      { path: 'admin/clinics', element: <AdminClinicsPage /> },
      { path: 'admin/analytics', element: <AdminAnalyticsPage /> },
      { path: 'admin/users', element: <AdminUsersPage /> },
      { path: 'admin/doctors', element: <AdminDoctorsPage /> },
      { path: 'admin/notifications', element: <NotificationsPage /> },
      { path: 'super-admin', element: <SuperAdminDashboardPage /> },
      { path: 'super-admin/system', element: <SuperAdminSystemPage /> },
      { path: 'super-admin/users', element: <SuperAdminUsersPage /> },
      { path: 'super-admin/audit-logs', element: <AuditLogsPage /> },
      { path: 'super-admin/notifications', element: <NotificationsPage /> },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
    ],
  },
])

export { getDashboardRoute }
