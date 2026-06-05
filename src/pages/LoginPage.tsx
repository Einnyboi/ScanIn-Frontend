import { type FormEvent, useEffect, useMemo, useState } from 'react'

import { BrandPanel } from '../components/BrandPanel'
import { LoginForm } from '../components/LoginForm'
import { ForgotPasswordPage } from './ForgotPasswordPage'
import { LoginHelpPage } from './LoginHelpPage'
<<<<<<< HEAD
import { saveSession } from '../lib/localSession'
=======
import { ResetPasswordPage } from './ResetPasswordPage'
import { clearSession, loadSession, saveSession } from '../lib/localSession'
>>>>>>> ff10712493193fee493d2c3e6d43c02c39282d2e
import { getRoleOption } from '../lib/roleOptions'
import type { LocalSession, Role } from '../types/auth'
import { isUntarAccount } from '../utils/accounts'
import { loginWithBackend } from '../utils/authApi'
import { validatePassword } from '../utils/password'

type LoginPageProps = {
  onLogin: (session: LocalSession) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<Role>('mahasiswa')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authView, setAuthView] = useState<'login' | 'forgot' | 'help' | 'reset'>('login')
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    
    if (window.location.pathname === '/reset-password' && token) {
      setResetToken(token)
      setAuthView('reset')
    }
  }, [])

  const activeRole = useMemo(() => getRoleOption(selectedRole), [selectedRole])

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role)
    setError('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedAccount = account.trim().toLowerCase()

    if (!trimmedAccount || !password.trim()) {
      setError('Akun UNTAR dan password wajib diisi.')
      return
    }

    if (!isUntarAccount(trimmedAccount, selectedRole)) {
      setError(
        selectedRole === 'mahasiswa'
          ? 'Mahasiswa wajib memakai email @stu.untar.ac.id.'
          : 'Pengajar dan admin wajib memakai email @untar.ac.id.',
      )
      return
    }

    if (!validatePassword(password).isValid) {
      setError(
        'Password minimal 8 karakter dan wajib punya huruf besar, huruf kecil, serta simbol.',
      )
      return
    }

    const backendProfile = await loginWithBackend(trimmedAccount, password)

    if (!backendProfile) {
      setError('Akun belum ada di backend. Jalankan seed database dulu.')
      return
    }

    if (backendProfile.role !== selectedRole) {
      setError(
        `Akun ini terdaftar sebagai ${getRoleOption(backendProfile.role).label}. Pilih role yang sesuai.`,
      )
      return
    }

    const nextSession: LocalSession = {
      role: selectedRole,
      identity: backendProfile.identity,
      name: backendProfile.name,
      email: backendProfile.email,
      loggedAt: new Date().toISOString(),
    }

    saveSession(nextSession)
    onLogin(nextSession)
    setError('')
    setPassword('')
  }

  if (authView === 'forgot') {
    return (
      <ForgotPasswordPage
        initialRole={selectedRole}
        onBack={() => setAuthView('login')}
      />
    )
  }

  if (authView === 'help') {
    return (
      <LoginHelpPage
        initialRole={selectedRole}
        onBack={() => setAuthView('login')}
      />
    )
  }

  if (authView === 'reset' && resetToken) {
    return (
      <ResetPasswordPage
        token={resetToken}
        onBack={() => {
          window.history.replaceState({}, '', '/')
          setAuthView('login')
        }}
      />
    )
  }

  return (
    <div className="min-h-[100svh] overflow-x-hidden bg-[#f7f4ef] text-slate-900">
      <main className="login-main grid min-h-[100svh] xl:grid-cols-[1.05fr_0.95fr]">
        <BrandPanel />

        <section className="login-side relative z-10 flex items-start justify-center px-0 pb-0 pt-0 xl:items-center xl:px-12 xl:py-10">
          <div className="login-card w-full max-w-none rounded-none border-y border-white/80 bg-white/96 p-5 shadow-2xl shadow-[#2f1d45]/12 backdrop-blur sm:p-7 md:p-10 xl:max-w-[520px] xl:rounded-[18px] xl:border xl:p-10">
            <LoginForm
              selectedRole={selectedRole}
              activeRole={activeRole}
              account={account}
              password={password}
              showPassword={showPassword}
              error={error}
              onSubmit={handleSubmit}
              onRoleChange={handleRoleChange}
              onAccountChange={setAccount}
              onPasswordChange={setPassword}
              onTogglePassword={() => setShowPassword((current) => !current)}
              onForgotPassword={() => setAuthView('forgot')}
              onOpenHelp={() => setAuthView('help')}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
