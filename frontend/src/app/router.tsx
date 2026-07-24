import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { LandingPage } from '../pages/public/LandingPage';
import { AboutPage } from '../pages/public/AboutPage';
import { AcademicsPage } from '../pages/public/AcademicsPage';
import { AdmissionsPage } from '../pages/public/AdmissionsPage';
import { ApplicationWizardPage } from '../pages/public/ApplicationWizardPage';
import { NewsPage } from '../pages/public/NewsPage';
import { EventsPage } from '../pages/public/EventsPage';
import { GalleryPage } from '../pages/public/GalleryPage';
import { ContactPage } from '../pages/public/ContactPage';

import { LoginPage } from '../pages/auth/LoginPage';
import { PortalSelectionPage } from '../pages/auth/PortalSelectionPage';
import { StudentLoginPage } from '../pages/auth/StudentLoginPage';
import { ParentLoginPage } from '../pages/auth/ParentLoginPage';
import { EmployeeLoginPage } from '../pages/auth/EmployeeLoginPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

import { ApplicantPortalDashboard } from '../pages/applicant/ApplicantPortalDashboard';

import { DashboardLayout } from '../layouts/DashboardLayout';
import { SuperAdminDashboard } from '../pages/admin/SuperAdminDashboard';
import { StudentManagementPage } from '../pages/admin/StudentManagementPage';
import { TeacherManagementPage } from '../pages/admin/TeacherManagementPage';
import { EmployeeManagementPage } from '../pages/admin/EmployeeManagementPage';
import { SubjectManagementPage } from '../pages/admin/SubjectManagementPage';
import { FinanceManagementPage } from '../pages/admin/FinanceManagementPage';
import { SystemSettingsPage } from '../pages/admin/SystemSettingsPage';
import { AdmissionSettingsPage } from '../pages/admin/AdmissionSettingsPage';
import { GradeManagementPage } from '../pages/admin/GradeManagementPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';
import { ReportsAnalyticsPage } from '../pages/admin/ReportsAnalyticsPage';
import { RolesPermissionsPage } from '../pages/admin/RolesPermissionsPage';
import { AnnouncementsPage } from '../pages/admin/AnnouncementsPage';
import { SectionAllocationsPage } from '../pages/admin/SectionAllocationsPage';

import { RegistrarDashboard } from '../pages/registrar/RegistrarDashboard';
import { EnrollmentManagementPage } from '../pages/registrar/EnrollmentManagementPage';
import { ApplicantManagementPage } from '../pages/registrar/ApplicantManagementPage';
import { StudentDirectoryPage } from '../pages/registrar/StudentDirectoryPage';

import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { AttendanceManagementPage } from '../pages/teacher/AttendanceManagementPage';

import { StudentDashboard } from '../pages/student/StudentDashboard';
import { ParentDashboard } from '../pages/parent/ParentDashboard';
import { ForbiddenPage } from '../pages/feedback/ForbiddenPage';
import { NotFoundPage } from '../pages/feedback/NotFoundPage';
import { ProfilePage } from '../pages/account/ProfilePage';
import { ChangePasswordPage } from '../pages/account/ChangePasswordPage';
import { AuthGuard } from '../guards/AuthGuard';
import { RoleGuard } from '../guards/RoleGuard';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';

export const AppRouter: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Institutional Website Experience */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/academics" element={<AcademicsPage />} />
            <Route path="/admissions" element={<AdmissionsPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Public Admissions Wizard */}
          <Route path="/admissions/apply" element={<ApplicationWizardPage />} />

          {/* Applicant Portal Self-Service */}
          <Route path="/applicant" element={<ApplicantPortalDashboard />} />
          <Route path="/applicant/dashboard" element={<ApplicantPortalDashboard />} />

          {/* Dedicated Portal Selection & Authentication Screens */}
          <Route path="/portal" element={<PortalSelectionPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/student/login" element={<StudentLoginPage />} />
          <Route path="/parent/login" element={<ParentLoginPage />} />
          <Route path="/employee/login" element={<EmployeeLoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/403" element={<ForbiddenPage />} />

          {/* Authenticated Enterprise Portal Experience */}
          <Route
            element={
              <AuthGuard>
                <DashboardLayout />
              </AuthGuard>
            }
          >
            {/* Super Admin Module */}
            <Route
              path="/admin/dashboard"
              element={
                <RoleGuard allowedRoles={['SuperAdministrator', 'Administrator', 'Principal']}>
                  <SuperAdminDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/students"
              element={
                <RoleGuard allowedRoles={['SuperAdministrator', 'Administrator', 'Registrar']}>
                  <StudentManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <RoleGuard allowedRoles={['SuperAdministrator', 'Administrator', 'Principal']}>
                  <TeacherManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/employees"
              element={
                <RoleGuard allowedRoles={['SuperAdministrator', 'Administrator']}>
                  <EmployeeManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/subjects"
              element={
                <RoleGuard allowedRoles={['SuperAdministrator', 'Administrator', 'Registrar']}>
                  <SubjectManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/grades"
              element={
                <RoleGuard allowedRoles={['SuperAdministrator', 'Administrator', 'Principal']}>
                  <GradeManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/accounting"
              element={
                <RoleGuard allowedRoles={['SuperAdministrator', 'Administrator', 'Accountant']}>
                  <FinanceManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <RoleGuard allowedRoles={['SuperAdministrator', 'Administrator', 'Principal', 'Registrar']}>
                  <ReportsAnalyticsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <RoleGuard allowedRoles={['SuperAdministrator']}>
                  <RolesPermissionsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <RoleGuard allowedRoles={['SuperAdministrator']}>
                  <AuditLogsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <RoleGuard allowedRoles={['SuperAdministrator', 'Administrator']}>
                  <AnnouncementsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <RoleGuard allowedRoles={['SuperAdministrator', 'Administrator']}>
                  <SystemSettingsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/admissions-settings"
              element={
                <RoleGuard allowedRoles={['SuperAdministrator', 'Administrator']}>
                  <AdmissionSettingsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/sections"
              element={
                <RoleGuard allowedRoles={['SuperAdministrator', 'Administrator', 'Registrar']}>
                  <SectionAllocationsPage />
                </RoleGuard>
              }
            />

            {/* Registrar Module */}
            <Route
              path="/registrar/dashboard"
              element={
                <RoleGuard allowedRoles={['Registrar', 'SuperAdministrator', 'Administrator']}>
                  <RegistrarDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/registrar/enrollment"
              element={
                <RoleGuard allowedRoles={['Registrar', 'SuperAdministrator', 'Administrator']}>
                  <EnrollmentManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/registrar/applicants"
              element={
                <RoleGuard allowedRoles={['Registrar', 'SuperAdministrator', 'Administrator']}>
                  <ApplicantManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/registrar/students"
              element={
                <RoleGuard allowedRoles={['Registrar', 'SuperAdministrator', 'Administrator']}>
                  <StudentDirectoryPage />
                </RoleGuard>
              }
            />

            {/* Teacher Module */}
            <Route
              path="/teacher/dashboard"
              element={
                <RoleGuard allowedRoles={['Teacher', 'SuperAdministrator']}>
                  <TeacherDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/attendance"
              element={
                <RoleGuard allowedRoles={['Teacher', 'SuperAdministrator']}>
                  <AttendanceManagementPage />
                </RoleGuard>
              }
            />

            {/* Student Module */}
            <Route
              path="/student/*"
              element={
                <RoleGuard allowedRoles={['Student', 'SuperAdministrator']}>
                  <StudentDashboard />
                </RoleGuard>
              }
            />

            {/* Parent Module */}
            <Route
              path="/parent/*"
              element={
                <RoleGuard allowedRoles={['Parent', 'SuperAdministrator']}>
                  <ParentDashboard />
                </RoleGuard>
              }
            />

            {/* Account — universal to every authenticated role */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
