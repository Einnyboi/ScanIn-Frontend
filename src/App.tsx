import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import ProtectedRoute from './components/ProtectedRoute'

// Pages — temenmu tinggal bikin file-file ini
// import LoginPage from './pages/LoginPage'
// import DashboardMahasiswa from './pages/mahasiswa/Dashboard'
// import DashboardPengajar from './pages/pengajar/Dashboard'
// import DashboardAdmin from './pages/admin/Dashboard'

export default function App() {
  const { isAuthenticated, user } = useAuthStore()

  // Redirect ke dashboard sesuai role setelah login
  const getDashboardByRole = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'MAHASISWA': return '/mahasiswa/dashboard'
      case 'DOSEN':
      case 'ASDOS': return '/pengajar/dashboard'
      case 'ADMIN': return '/admin/dashboard'
      default: return '/login'
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        {/* <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={getDashboardByRole()} replace /> : <LoginPage />}
        /> */}

        {/* Mahasiswa */}
        {/* <Route path="/mahasiswa/dashboard" element={
          <ProtectedRoute allowedRoles={['MAHASISWA']}>
            <DashboardMahasiswa />
          </ProtectedRoute>
        }/> */}

        {/* Pengajar */}
        {/* <Route path="/pengajar/dashboard" element={
          <ProtectedRoute allowedRoles={['DOSEN', 'ASDOS']}>
            <DashboardPengajar />
          </ProtectedRoute>
        }/>

        {/* Admin */}
        {/* <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardAdmin />
          </ProtectedRoute>
        }/> */}

        {/* Fallback */}
        <Route path="/" element={<Navigate to={isAuthenticated ? getDashboardByRole() : '/login'} replace />}/>
        <Route path="/unauthorized" element={
          <div className="flex h-screen items-center justify-center">
            <p className="text-red-500 text-lg">Kamu tidak punya akses ke halaman ini.</p>
          </div>
        }/>
        <Route path="*" element={<Navigate to="/" replace />}/>
      </Routes>
    </BrowserRouter>
  )
}