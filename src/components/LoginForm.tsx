import type { FormEvent } from 'react'

import { roleOptions, type RoleOption } from '../lib/roleOptions'
import type { HelpPanel, Role } from '../types/auth'
import { getPasswordRules } from '../utils/password'

type LoginFormProps = {
  selectedRole: Role
  activeRole: RoleOption
  identity: string
  name: string
  password: string
  showPassword: boolean
  error: string
  helpPanel: HelpPanel
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onRoleChange: (role: Role) => void
  onIdentityChange: (value: string) => void
  onNameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onTogglePassword: () => void
  onHelpPanelChange: (panel: HelpPanel) => void
}

export function LoginForm({
  selectedRole,
  activeRole,
  identity,
  name,
  password,
  showPassword,
  error,
  helpPanel,
  onSubmit,
  onRoleChange,
  onIdentityChange,
  onNameChange,
  onPasswordChange,
  onTogglePassword,
  onHelpPanelChange,
}: LoginFormProps) {
  const toggleHelpPanel = (panel: Exclude<HelpPanel, null>) => {
    onHelpPanelChange(helpPanel === panel ? null : panel)
  }
  const passwordRules = getPasswordRules(password)

  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7d2228]">
          Portal Presensi
        </p>
        <h2 className="mt-3 text-3xl font-black text-[#5c3386] sm:text-4xl">
          Masuk ke akun kamu
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Pilih peran sesuai akun supaya form dan aksesnya langsung
          menyesuaikan.
        </p>
      </div>

      <div
        className="grid grid-cols-3 rounded-[8px] bg-slate-100 p-1"
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
              className={`flex min-h-12 items-center justify-center gap-2 rounded-[7px] px-2 text-sm font-bold transition duration-300 sm:text-base ${
                isActive
                  ? 'bg-[#5c3386] text-white shadow-lg shadow-[#5c3386]/25'
                  : 'text-slate-500 hover:bg-white hover:text-[#5c3386]'
              }`}
            >
              {role.icon}
              <span className="hidden sm:inline">{role.label}</span>
            </button>
          )
        })}
      </div>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div>
          <label
            htmlFor="identity"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            {activeRole.fieldLabel}
          </label>
          <input
            id="identity"
            name="identity"
            type="text"
            value={identity}
            onChange={(event) => onIdentityChange(event.target.value)}
            placeholder={activeRole.placeholder}
            className="h-14 w-full rounded-[8px] border border-slate-200 bg-white px-4 text-base font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
          />
        </div>

        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            {activeRole.nameLabel}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={activeRole.namePlaceholder}
            className="h-14 w-full rounded-[8px] border border-slate-200 bg-white px-4 text-base font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
          />
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
              className="h-14 w-full rounded-[8px] border border-slate-200 bg-white px-4 pr-14 text-base font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[8px] text-slate-500 transition hover:bg-slate-100 hover:text-[#5c3386]"
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
                className={`rounded-[8px] px-3 py-2 text-xs font-black ${
                  rule.isValid
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {rule.isValid ? 'OK ' : ''}{rule.label}
              </div>
            ))}
          </div>
        </div>

        {error ? (
          <p className="rounded-[8px] border border-[#7d2228]/20 bg-[#7d2228]/8 px-4 py-3 text-sm font-semibold text-[#7d2228]">
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
            onClick={() => toggleHelpPanel('forgot-password')}
            className="text-sm font-bold text-[#7d2228] transition hover:text-[#5c3386]"
          >
            Lupa password?
          </button>
        </div>

        <button
          type="submit"
          className="mt-2 flex h-14 w-full items-center justify-center rounded-[8px] bg-[#5c3386] px-5 text-base font-black text-white shadow-xl shadow-[#5c3386]/25 transition duration-300 hover:-translate-y-0.5 hover:bg-[#4f2b73] focus:outline-none focus:ring-4 focus:ring-[#5c3386]/20"
        >
          Masuk sebagai {activeRole.label}
        </button>
      </form>

      {helpPanel ? (
        <HelpPanelContent
          panel={helpPanel}
          activeRole={activeRole}
          identity={identity}
          name={name}
          onClose={() => onHelpPanelChange(null)}
        />
      ) : null}

      <p className="mt-8 text-center text-sm font-semibold text-slate-500">
        Butuh bantuan akses?{' '}
        <button
          type="button"
          onClick={() => toggleHelpPanel('contact-admin')}
          className="font-bold text-[#5c3386] transition hover:text-[#7d2228]"
        >
          Hubungi Admin Fakultas
        </button>
      </p>
    </>
  )
}

type HelpPanelContentProps = {
  panel: Exclude<HelpPanel, null>
  activeRole: RoleOption
  identity: string
  name: string
  onClose: () => void
}

function HelpPanelContent({
  panel,
  activeRole,
  identity,
  name,
  onClose,
}: HelpPanelContentProps) {
  const cleanIdentity = identity.trim()
  const cleanName = name.trim()

  return (
    <div className="help-panel mt-5 rounded-[8px] border border-[#5c3386]/12 bg-[#5c3386]/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7d2228]">
            Bantuan Akses
          </p>
          <h3 className="mt-1 text-lg font-black text-[#5c3386]">
            {panel === 'forgot-password'
              ? 'Reset password'
              : 'Hubungi Admin Fakultas'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-slate-500 transition hover:bg-white hover:text-[#7d2228]"
          aria-label="Tutup bantuan"
        >
          x
        </button>
      </div>

      {panel === 'forgot-password' ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm leading-6 text-slate-600">
            Untuk sementara, permintaan reset belum dikirim ke backend. Isi{' '}
            {activeRole.fieldLabel} dan nama di form, lalu gunakan data ini saat
            menghubungi admin.
          </p>
          <div className="grid gap-3 rounded-[8px] bg-white p-4 text-sm sm:grid-cols-2">
            <HelpField label={activeRole.fieldLabel} value={cleanIdentity} />
            <HelpField label="Nama" value={cleanName} />
          </div>
          <p className="rounded-[8px] bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
            Format pesan: Halo Admin Fakultas FTI, saya {cleanName || '[nama]'}{' '}
            ({activeRole.label}) dengan {activeRole.fieldLabel}{' '}
            {cleanIdentity || '[nomor]'} ingin meminta reset password akun
            ScanIn.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="text-sm leading-6 text-slate-600">
            Bagian ini disiapkan untuk bantuan manual sebelum fitur backend
            aktif. Admin bisa verifikasi dari role, identitas, dan nama
            pengguna.
          </p>
          <div className="space-y-3 rounded-[8px] bg-white p-4 text-sm">
            <ContactRow label="Tujuan" value="Admin Fakultas FTI" />
            <ContactRow
              label="Siapkan"
              value={`${activeRole.fieldLabel}, nama lengkap, dan bukti akun`}
            />
            <ContactRow label="Status" value="Kontak resmi menyusul" highlight />
          </div>
        </div>
      )}
    </div>
  )
}

type HelpFieldProps = {
  label: string
  value: string
}

function HelpField({ label, value }: HelpFieldProps) {
  return (
    <div>
      <p className="font-bold text-slate-400">{label}</p>
      <p className="mt-1 font-black text-slate-800">{value || 'Belum diisi'}</p>
    </div>
  )
}

type ContactRowProps = {
  label: string
  value: string
  highlight?: boolean
}

function ContactRow({ label, value, highlight = false }: ContactRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="font-bold text-slate-400">{label}</span>
      <span
        className={`text-right font-black ${
          highlight ? 'text-[#7d2228]' : 'text-slate-800'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
