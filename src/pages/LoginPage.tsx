import { type FormEvent, useMemo, useState } from 'react'

import { AdminDashboard } from './AdminDashboard'
import { BrandPanel } from '../components/BrandPanel'
import { LoginForm } from '../components/LoginForm'
import { LecturerDashboard } from './LecturerDashboard'
import { StudentDashboard } from './StudentDashboard'
import { clearSession, loadSession, saveSession } from '../lib/localSession'
import { getRoleOption } from '../lib/roleOptions'
import type { HelpPanel, LocalSession, Role } from '../types/auth'
import { validatePassword } from '../utils/password'

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>('mahasiswa')
  const [identity, setIdentity] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [helpPanel, setHelpPanel] = useState<HelpPanel>(null)
  const [error, setError] = useState('')
  const [session, setSession] = useState<LocalSession | null>(() => loadSession())

  const activeRole = useMemo(() => getRoleOption(selectedRole), [selectedRole])

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role)
    setError('')
    setHelpPanel(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedIdentity = identity.trim()
    const trimmedName = name.trim()

    if (!trimmedIdentity || !trimmedName || !password.trim()) {
      setError(`${activeRole.fieldLabel}, nama, dan password wajib diisi.`)
      return
    }

    if (!validatePassword(password).isValid) {
      setError(
        'Password minimal 8 karakter dan wajib punya huruf besar, huruf kecil, serta simbol.',
      )
      return
    }

    const nextSession: LocalSession = {
      role: selectedRole,
      identity: trimmedIdentity,
      name: trimmedName,
      loggedAt: new Date().toISOString(),
    }

    saveSession(nextSession)
    setSession(nextSession)
    setError('')
    setHelpPanel(null)
    setPassword('')
  }

  const handleLogout = () => {
    clearSession()
    setSession(null)
    setIdentity('')
    setName('')
    setPassword('')
    setError('')
    setHelpPanel(null)
  }

  if (session?.role === 'mahasiswa') {
    return <StudentDashboard session={session} onLogout={handleLogout} />
  }

  if (session?.role === 'pengajar') {
    return <LecturerDashboard session={session} onLogout={handleLogout} />
  }

  if (session?.role === 'admin') {
    return <AdminDashboard session={session} onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f4ef] text-slate-900">
      <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <BrandPanel />

        <section className="login-side flex items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="login-card w-full max-w-[520px] rounded-[8px] border border-white bg-white/95 p-6 shadow-2xl shadow-[#2f1d45]/12 sm:p-8 lg:p-10">
            <LoginForm
              selectedRole={selectedRole}
              activeRole={activeRole}
              identity={identity}
              name={name}
              password={password}
              showPassword={showPassword}
              error={error}
              helpPanel={helpPanel}
              onSubmit={handleSubmit}
              onRoleChange={handleRoleChange}
              onIdentityChange={setIdentity}
              onNameChange={setName}
              onPasswordChange={setPassword}
              onTogglePassword={() => setShowPassword((current) => !current)}
              onHelpPanelChange={setHelpPanel}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
