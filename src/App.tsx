import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { LoginPage } from './pages/LoginPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginHelpPage } from './pages/LoginHelpPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import AdminDashboard from './pages/AdminDashboard'
import { LecturerDashboard } from './pages/LecturerDashboard'
import { LecturerSessionPage } from './pages/LecturerSessionPage'
import { StudentDashboard } from './pages/StudentDashboard'
import { StatisticsPage } from './pages/StatisticsPage'

import { loadSession, clearSession } from './lib/localSession'

export default function App() {
  const session = loadSession()
  const role = session?.role?.toLowerCase()

  const getDashboardByRole = () => {
    if (!role) return '/'

    if (role === 'admin') return '/admin'
    if (role === 'lecturer' || role === 'dosen' || role === 'asdos') {
      return '/lecturer'
    }
    if (role === 'student' || role === 'mahasiswa') {
      return '/student'
    }

    return '/'
  }

  const handleLogout = () => {
    clearSession()
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/'
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
              <LoginPage />
            )
          }
        />

        <Route
          path="/login"
          element={
            session ? (
              <Navigate to={getDashboardByRole()} replace />
            ) : (
              <LoginPage />
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
            (role === 'lecturer' || role === 'dosen' || role === 'asdos') &&
              session ? (
              <LecturerDashboard session={session} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/lecturer/session/:sessionId"
          element={
            (role === 'lecturer' || role === 'dosen' || role === 'asdos') &&
              session ? (
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
            (role === 'student' || role === 'mahasiswa') && session ? (
              <StudentDashboard session={session} onLogout={handleLogout} />
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
