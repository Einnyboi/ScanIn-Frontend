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
      <div className="mb-6 sm:mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7d2228]">
          Portal Presensi
        </p>
        <h2 className="mt-3 text-2xl font-black leading-tight text-[#5c3386] sm:text-4xl">
          Masuk ke akun kamu
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Pilih peran sesuai akun supaya akses dashboard langsung menyesuaikan.
        </p>
      </div>

      <div
        className="grid grid-cols-3 rounded-lg bg-slate-100 p-1"
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
          className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-[7px] px-2 text-[11px] font-bold transition duration-300 sm:flex-row sm:gap-2 sm:text-base ${
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

      <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-5" onSubmit={onSubmit}>
        <div>
          <label
            htmlFor="account"
            className="mb-2 block text-sm font-bold text-slate-700"
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
            className="h-14 w-full rounded-lg border border-slate-200 bg-white px-4 text-base font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
          />
          <p className="mt-2 text-xs font-semibold text-slate-500">
            {getAccountDomainHelp(activeRole.id)}
          </p>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-bold text-slate-700"
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
              className="h-14 w-full rounded-lg border border-slate-200 bg-white px-4 pr-14 text-base font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#5c3386]"
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
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {passwordRules.map((rule) => (
              <div
                key={rule.id}
                className={`rounded-lg px-3 py-2 text-xs font-black ${
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
          <p className="rounded-lg border border-[#7d2228]/20 bg-[#7d2228]/8 px-4 py-3 text-sm font-semibold text-[#7d2228]">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-[#5c3386] focus:ring-[#5c3386]"
            />
            Ingat saya
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-bold text-[#7d2228] transition hover:text-[#5c3386]"
          >
            Lupa password?
          </button>
        </div>

        <button
          type="submit"
          className="mt-2 flex h-14 w-full items-center justify-center rounded-lg bg-[#5c3386] px-5 text-base font-black text-white shadow-xl shadow-[#5c3386]/25 transition duration-300 hover:-translate-y-0.5 hover:bg-[#4f2b73] focus:outline-none focus:ring-4 focus:ring-[#5c3386]/20"
        >
          {submitLabel}
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-semibold text-slate-500">
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
