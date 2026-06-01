import type { FormEvent } from 'react'

import { roleOptions, type RoleOption } from '../lib/roleOptions'
import type { Role } from '../types/auth'
import { getAccountDomainHelp, getAccountPlaceholder } from '../utils/accounts'
import { getPasswordRules } from '../utils/password'

type LoginFormProps = {
  selectedRole: Role
  activeRole: RoleOption
  account: string
  password: string
  showPassword: boolean
  error: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onRoleChange: (role: Role) => void
  onAccountChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onTogglePassword: () => void
  onForgotPassword: () => void
  onOpenHelp: () => void
}

export function LoginForm({
  selectedRole,
  activeRole,
  account,
  password,
  showPassword,
  error,
  onSubmit,
  onRoleChange,
  onAccountChange,
  onPasswordChange,
  onTogglePassword,
  onForgotPassword,
  onOpenHelp,
}: LoginFormProps) {
  const passwordRules = getPasswordRules(password)
  const submitLabel =
    selectedRole === 'admin'
      ? 'Masuk ke Panel Administrasi'
      : selectedRole === 'pengajar'
        ? 'Masuk ke Portal Pengajar'
        : 'Masuk ke Portal Mahasiswa'

  return (
    <>
      <div className="mb-5 sm:mb-7 xl:mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7d2228] sm:text-sm">
          Portal Presensi
        </p>
        <h2 className="mt-2 text-2xl font-black leading-tight text-[#5c3386] sm:mt-3 sm:text-3xl xl:text-4xl">
          Masuk ke akun kamu
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:mt-3">
          Pilih peran sesuai akun supaya akses dashboard langsung menyesuaikan.
        </p>
      </div>

      <div
        className="login-role-tabs grid grid-cols-3 rounded-[12px] bg-slate-100 p-1"
        role="tablist"
        aria-label="Pilih peran login"
      >
        {roleOptions.map((role) => {
          const isActive = role.id === selectedRole

          return (
            <button
              key={role.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onRoleChange(role.id)}
              className={`flex min-h-[46px] flex-col items-center justify-center gap-1 rounded-[9px] px-1.5 text-[11px] font-black leading-tight transition duration-300 sm:min-h-12 sm:flex-row sm:gap-2 sm:px-3 sm:text-sm md:text-base ${
                isActive
                  ? 'bg-[#5c3386] text-white shadow-lg shadow-[#5c3386]/25'
                  : 'text-slate-500 hover:bg-white hover:text-[#5c3386]'
              }`}
            >
              {role.icon}
              <span>{role.label}</span>
            </button>
          )
        })}
      </div>

      <form className="mt-5 space-y-4 sm:mt-7 sm:space-y-5 xl:mt-8" onSubmit={onSubmit}>
        <div>
          <label
            htmlFor="account"
            className="mb-2 block text-sm font-black text-slate-700"
          >
            Email UNTAR
          </label>
          <input
            id="account"
            name="account"
            type="email"
            value={account}
            onChange={(event) => onAccountChange(event.target.value)}
            placeholder={getAccountPlaceholder(activeRole.id)}
            className="h-[52px] w-full rounded-[10px] border border-slate-200 bg-white px-4 text-[15px] font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12 sm:h-14 sm:text-base"
          />
          <p className="mt-2 rounded-[9px] bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-500">
            {getAccountDomainHelp(activeRole.id)}
          </p>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-black text-slate-700"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Masukkan password"
              className="h-[52px] w-full rounded-[10px] border border-slate-200 bg-white px-4 pr-14 text-[15px] font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12 sm:h-14 sm:text-base"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[9px] text-slate-500 transition hover:bg-slate-100 hover:text-[#5c3386]"
              aria-label={
                showPassword ? 'Sembunyikan password' : 'Tampilkan password'
              }
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                <path
                  d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {passwordRules.map((rule) => (
              <div
                key={rule.id}
                className={`flex min-h-10 items-center rounded-[9px] px-3 py-2 text-[11px] font-black leading-tight sm:text-xs ${
                  rule.isValid
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {rule.isValid ? 'OK ' : ''}
                {rule.label}
              </div>
            ))}
          </div>
        </div>

        {error ? (
          <p className="rounded-[10px] border border-[#7d2228]/20 bg-[#7d2228]/8 px-4 py-3 text-sm font-bold leading-6 text-[#7d2228]">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3 pt-1 sm:pt-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 shrink-0 rounded border-slate-300 text-[#5c3386] focus:ring-[#5c3386]"
            />
            Ingat saya
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="shrink-0 text-sm font-black text-[#7d2228] transition hover:text-[#5c3386]"
          >
            Lupa password?
          </button>
        </div>

        <button
          type="submit"
          className="mt-1 flex h-[52px] w-full items-center justify-center rounded-[10px] bg-[#5c3386] px-5 text-sm font-black text-white shadow-xl shadow-[#5c3386]/25 transition duration-300 hover:-translate-y-0.5 hover:bg-[#4f2b73] focus:outline-none focus:ring-4 focus:ring-[#5c3386]/20 sm:mt-2 sm:h-14 sm:text-base"
        >
          {submitLabel}
        </button>
      </form>

      <p className="mt-6 text-center text-sm font-semibold leading-6 text-slate-500 sm:mt-8">
        Butuh bantuan akses?{' '}
        <button
          type="button"
          onClick={onOpenHelp}
          className="font-bold text-[#5c3386] transition hover:text-[#7d2228]"
        >
          Hubungi Admin Fakultas
        </button>
      </p>
    </>
  )
}
