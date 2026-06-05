import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { LoginPage } from './pages/LoginPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginHelpPage } from './pages/LoginHelpPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import AdminDashboard from './pages/AdminDashboard'
import { LecturerDashboard } from './pages/LecturerDashboard'
import { LecturerNotificationsPage } from './pages/LecturerNotificationsPage'
import { LecturerSessionPage } from './pages/LecturerSessionPage'
import { StudentDashboard } from './pages/StudentDashboard'
import { StudentNotificationsPage } from './pages/StudentNotificationsPage'
import { StudentTicketPage } from './pages/StudentTicketPage'
import { StatisticsPage } from './pages/StatisticsPage'

import { loadSession, clearSession } from './lib/localSession'
import type { LocalSession } from './types/auth'

export default function App() {
  const [session, setSession] = useState<LocalSession | null>(() => loadSession())
  const role = session?.role?.toLowerCase()
  const isLecturerRole =
    role === 'pengajar' ||
    role === 'lecturer' ||
    role === 'dosen' ||
    role === 'asdos'
  const isStudentRole = role === 'student' || role === 'mahasiswa'

  const getDashboardByRole = () => {
    if (!role) return '/'

    if (role === 'admin') return '/admin'
    if (isLecturerRole) return '/lecturer'
    if (isStudentRole) return '/student'

    return '/'
  }

  const handleLogout = () => {
    clearSession()
    localStorage.clear()
    sessionStorage.clear()
    setSession(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            session ? (
              <Navigate to={getDashboardByRole()} replace />
            ) : (
              <LoginPage onLogin={setSession} />
            )
          }
        />

        <Route
          path="/login"
          element={
            session ? (
              <Navigate to={getDashboardByRole()} replace />
            ) : (
              <LoginPage onLogin={setSession} />
            )
          }
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordPage
              initialRole="mahasiswa"
              onBack={() => {
                window.location.href = '/'
              }}
            />
          }
        />

        <Route
          path="/login-help"
          element={
            <LoginHelpPage
              initialRole="mahasiswa"
              onBack={() => {
                window.location.href = '/'
              }}
            />
          }
        />

        <Route
          path="/reset-password"
          element={
            <ResetPasswordPage
              onBack={() => {
                window.location.href = '/'
              }}
            />
          }
        />

        <Route
          path="/admin"
          element={
            role === 'admin' && session ? (
              <AdminDashboard session={session} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/lecturer"
          element={
            isLecturerRole && session ? (
              <LecturerDashboard session={session} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/lecturer/notifications"
          element={
            isLecturerRole && session ? (
              <LecturerNotificationsPage
                session={session}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/lecturer/session/:sessionId"
          element={
            isLecturerRole && session ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <LecturerSessionPage {...({} as any)} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/student"
          element={
            isStudentRole && session ? (
              <StudentDashboard session={session} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/student/notifications"
          element={
            isStudentRole && session ? (
              <StudentNotificationsPage
                session={session}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/student/tickets/new"
          element={
            isStudentRole && session ? (
              <StudentTicketPage session={session} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/statistics"
          element={
            <StatisticsPage
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              mode={'admin' as any}
              onBack={() => {
                window.location.href = '/'
              }}
            />
          }
        />

        <Route
          path="/unauthorized"
          element={
            <div className="flex h-screen items-center justify-center">
              <p className="text-lg text-red-500">
                Kamu tidak punya akses ke halaman ini.
              </p>
            </div>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
