import { useState, type ReactNode } from 'react'
import { ArrowLeft, KeyRound, Pencil, Trash2, X, type LucideIcon } from 'lucide-react'

import type { AdminUser, AdminUserRole } from '../../utils/adminUsers'
import type { CorrectionTicket } from '../../types/attendance'
import type { PasswordResetRequest } from '../../utils/passwordReset'
import type { LocalSession } from '../../types/auth'

export type DeleteConfirmation = {
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void | Promise<void>
}

const adminDeletePin = '1234'

export const purple = '#5c3386'
export const maroon = '#7d2228'
export const amber = '#edae36'

type AdminView =
  | 'dashboard'
  | 'users'
  | 'schedule'
  | 'attendance'
  | 'reports'
  | 'tickets'
  | 'notifications'

export function AdminSidebar({
  activeView,
  onViewChange,
  onLogout,
  session,
}: {
  activeView: AdminView
  onViewChange: (view: AdminView) => void
  onLogout: () => void
  session: LocalSession
}) {
  const items: Array<{ id: AdminView; label: string }> = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Pengguna' },
    { id: 'schedule', label: 'Jadwal' },
    { id: 'attendance', label: 'Presensi' },
    { id: 'reports', label: 'Laporan' },
    { id: 'tickets', label: 'Tiket' },
    { id: 'notifications', label: 'Notifikasi' },
  ]

  return (
    <aside className="bg-[#5c3386] text-white p-6">
      <div className="mb-6">
        <img
          src="/logo-fti.png"
          alt="Logo FTI UNTAR"
          className="w-full max-w-[180px]"
        />
      </div>

      <div className="mb-6">
        <p className="font-bold">{session.name}</p>
        <p className="text-sm opacity-80">{session.role}</p>
      </div>

      <nav className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onViewChange(item.id)}
            className={`block w-full rounded-lg px-4 py-3 text-left ${
              activeView === item.id
                ? 'bg-[#7d2228]'
                : 'hover:bg-white/10'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="mt-6 w-full rounded-lg border border-white/20 px-4 py-3 text-left hover:bg-white/10"
      >
        Keluar
      </button>
    </aside>
  )
}

export function AdminNoticeBanner({
  notice,
  onClose,
}: {
  notice: { message: string; tone: 'danger' | 'success' | 'warning' } | null
  onClose: () => void
}) {
  if (!notice) return null

  const bgColor =
    notice.tone === 'danger'
      ? 'bg-[#7d2228]'
      : notice.tone === 'success'
        ? 'bg-emerald-600'
        : 'bg-[#edae36]'

  return (
    <div className={`mb-6 flex items-center justify-between rounded-[8px] px-5 py-4 text-white shadow-md ${bgColor}`}>
      <p className="text-sm font-black">{notice.message}</p>
      <button 
        type="button" 
        onClick={onClose} 
        className="rounded-full p-1 transition hover:bg-white/20"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}

export function AdminStatCard({
  icon: Icon,
  label,
  tone = 'purple',
  value,
}: {
  icon: LucideIcon
  label: string
  tone?: 'purple' | 'green' | 'red' | 'blue'
  value: number | string
}) {
  const colors = {
    purple: 'bg-[#5c3386]/10 text-[#5c3386]',
    green: 'bg-emerald-100 text-emerald-600',
    red: 'bg-[#7d2228]/10 text-[#7d2228]',
    blue: 'bg-blue-100 text-blue-600',
  }

  return (
    <div className="admin-surface rounded-[8px] border border-white bg-white p-6 shadow-lg shadow-slate-900/8">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${colors[tone]}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  )
}

export function AdminCard({
  children,
  className = '',
  title,
}: {
  children: React.ReactNode
  className?: string
  title?: string
}) {
  return (
    <section
      className={`admin-surface rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/8 sm:p-6 ${className}`}
    >
      {title ? <h2 className="mb-5 text-xl font-black text-slate-950">{title}</h2> : null}
      {children}
    </section>
  )
}

export function SimpleStat({
  label,
  tone = 'default',
  value,
}: {
  label: string
  tone?: 'default' | 'blue' | 'green' | 'purple' | 'red' | 'yellow'
  value: number
}) {
  const color =
    tone === 'blue'
      ? 'text-blue-600'
      : tone === 'green'
        ? 'text-emerald-600'
        : tone === 'purple'
          ? 'text-[#5c3386]'
          : tone === 'red'
            ? 'text-red-600'
            : tone === 'yellow'
              ? 'text-[#c28a08]'
              : 'text-slate-950'

  return (
    <div className="admin-surface min-h-28 rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/8">
      <p className="text-base font-semibold text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-black ${color}`}>{value}</p>
    </div>
  )
}

export function TrendStat({
  label,
  tone = 'green',
  trend,
  value,
}: {
  label: string
  tone?: 'green' | 'yellow' | 'red'
  trend: string
  value: string
}) {
  const color =
    tone === 'green'
      ? 'text-emerald-600'
      : tone === 'yellow'
        ? 'text-[#c28a08]'
        : 'text-red-600'

  return (
    <div className="admin-surface rounded-[8px] border border-white bg-white p-6 shadow-lg shadow-slate-900/8">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-5 text-3xl font-black text-slate-950">{value}</p>
      <p className={`mt-2 text-sm font-semibold ${color}`}>{trend}</p>
    </div>
  )
}

export function ActivityTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] bg-slate-50 p-4">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  )
}

export function PasswordResetItem({
  onSend,
  request,
}: {
  onSend: () => void | Promise<void>
  request: PasswordResetRequest
}) {
  const isEmailSent = request.emailStatus === 'SENT'
  const hasEmailIssue =
    request.emailStatus === 'FAILED' || request.emailStatus === 'SMTP_NOT_CONFIGURED'
  const buttonText = isEmailSent
    ? 'Sudah dikirim'
    : hasEmailIssue
      ? 'Coba Kirim Lagi'
      : 'Kirim Email Reset'
      
  let helperText = ''
  if (request.emailStatus === 'SMTP_NOT_CONFIGURED') {
    helperText = request.resetUrl 
      ? `SMTP belum aktif. Link manual: ${request.resetUrl}` 
      : 'SMTP backend belum aktif.'
  } else if (request.emailStatus === 'FAILED') {
    helperText = 'Email gagal dikirim.'
  } else if (request.emailStatus === 'SENT') {
    helperText = 'Email berhasil dikirim.'
  }

  return (
    <article className="rounded-[8px] border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-slate-950">{request.name}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {request.identity} - {request.role}
          </p>
        </div>
        <KeyRound className="h-5 w-5 text-[#5c3386]" />
      </div>
      <p className="mt-3 rounded-[8px] bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
        {request.registeredEmail}
      </p>
      <button
        type="button"
        onClick={onSend}
        disabled={isEmailSent}
        className={`mt-3 h-10 w-full rounded-[8px] text-sm font-black ${
          isEmailSent
            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
            : 'bg-[#5c3386] text-white'
        }`}
      >
        {buttonText}
      </button>
      {helperText ? <p className="mt-2 text-xs font-bold text-slate-500">{helperText}</p> : null}
    </article>
  )
}

export function AdminSubPageHeader({
  onBack,
  subtitle,
  title,
}: {
  onBack: () => void
  subtitle: string
  title: string
}) {
  return (
    <section className="admin-surface rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/8 sm:p-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-black text-[#5c3386] transition hover:text-[#7d2228]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke Daftar
      </button>
      <h2 className="mt-4 text-2xl font-black text-slate-950 sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
        {subtitle}
      </p>
    </section>
  )
}

export function DeletePinModal({
  onClose,
  target,
}: {
  onClose: () => void
  target: DeleteConfirmation
}) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const pinDots = Array.from({ length: 4 }, (_, index) => pin.length > index)
  const isPinComplete = pin.length === 4

  const handleConfirm = () => {
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN wajib 4 angka.')
      return
    }

    if (pin !== adminDeletePin) {
      setError('PIN tidak sesuai. Data belum dihapus.')
      return
    }

    target.onConfirm()
    setPin('')
    setError('')
    onClose()
  }

  const handleKeypadDigit = (digit: string) => {
    if (pin.length >= 4) return
    setPin((currentPin) => `${currentPin}${digit}`.slice(0, 4))
    setError('')
  }

  const handleBackspace = () => {
    setPin((currentPin) => currentPin.slice(0, -1))
    setError('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="admin-surface relative w-full max-w-md rounded-[8px] bg-white p-5 shadow-2xl shadow-slate-950/35 sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-[8px] text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          aria-label="Tutup konfirmasi PIN"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="mx-auto flex w-fit items-center gap-3 pt-2">
          <img
            src="/logo-fti.png"
            alt="Logo FTI UNTAR"
            className="h-16 w-44 object-contain drop-shadow-sm"
          />
        </div>

        <div className="mt-5 text-center">
          <h2 className="text-2xl font-black text-slate-950">Masukkan PIN Admin</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-slate-500">
            {target.description} Masukkan 4 digit PIN untuk melanjutkan aksi
            penghapusan.
          </p>
        </div>

        <div className="mt-7 rounded-[8px] border border-slate-200 bg-white px-5 py-5 shadow-inner">
          <div className="flex items-center justify-center gap-7">
            {pinDots.map((isFilled, index) => (
              <span
                key={index}
                className={`h-3 w-3 rounded-full transition ${
                  isFilled ? 'scale-125 bg-[#5c3386]' : 'bg-slate-300'
                }`}
                aria-label={`Digit PIN ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {error ? (
          <p className="mt-5 rounded-[8px] bg-[#7d2228]/8 px-4 py-3 text-center text-sm font-bold text-[#7d2228]">
            {error}
          </p>
        ) : (
          <p className="mt-5 rounded-[8px] bg-slate-50 px-4 py-3 text-center text-xs font-bold text-slate-500">
            Aksi hapus baru diproses setelah keempat digit PIN benar. PIN demo:
            1234.
          </p>
        )}

        <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeypadDigit(digit)}
              className="flex aspect-square items-center justify-center rounded-full bg-slate-50 text-2xl font-black text-slate-950 shadow-sm transition hover:bg-[#5c3386]/10 active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setPin('')
              setError('')
            }}
            className="flex aspect-square items-center justify-center rounded-full bg-slate-50 text-sm font-black text-slate-500 shadow-sm transition hover:bg-slate-100 active:scale-95"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => handleKeypadDigit('0')}
            className="flex aspect-square items-center justify-center rounded-full bg-slate-50 text-2xl font-black text-slate-950 shadow-sm transition hover:bg-[#5c3386]/10 active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="flex aspect-square items-center justify-center rounded-full bg-slate-50 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95"
            aria-label="Hapus satu digit PIN"
          >
            Hapus
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-[8px] border border-slate-300 px-4 text-sm font-black text-slate-700 transition hover:border-[#5c3386] hover:text-[#5c3386]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isPinComplete}
            className={`h-12 rounded-[8px] px-4 text-sm font-black text-white shadow-lg transition ${
              isPinComplete
                ? 'bg-[#7d2228] shadow-[#7d2228]/20 hover:bg-[#691c21]'
                : 'cursor-not-allowed bg-slate-300 shadow-slate-200'
            }`}
          >
            {target.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ActionButtons({
  onDelete,
  onEdit,
}: {
  onDelete: () => void
  onEdit: () => void
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="flex h-10 w-10 items-center justify-center rounded-[8px] text-blue-600 hover:bg-blue-50"
        aria-label="Edit"
      >
        <Pencil className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="flex h-10 w-10 items-center justify-center rounded-[8px] text-red-600 hover:bg-red-50"
        aria-label="Hapus"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  )
}

export function AdminRoleBadge({ role }: { role: AdminUserRole }) {
  const tone =
    role === 'Mahasiswa'
      ? 'bg-blue-100 text-blue-700'
      : role === 'Pengajar'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-[#5c3386]/10 text-[#5c3386]'

  return (
    <span className={`inline-flex min-w-20 items-center justify-center rounded-full px-3 py-1.5 text-xs font-black ${tone}`}>
      {role}
    </span>
  )
}

export function AdminStatusBadge({ status }: { status: AdminUser['status'] }) {
  const tone = status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'

  return (
    <span className={`inline-flex min-w-18 items-center justify-center rounded-full px-3 py-1.5 text-xs font-black ${tone}`}>
      {status}
    </span>
  )
}

export function StatusBadge({ status }: { status: CorrectionTicket['status'] }) {
  const tone =
    status === 'Disetujui'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'Ditolak'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-[#9b6b07]'

  return <span className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}>{status}</span>
}

export function NotificationTypeBadge({
  label,
  tone = 'yellow',
}: {
  label: string
  tone?: 'purple' | 'red' | 'yellow'
}) {
  const color =
    tone === 'purple'
      ? 'bg-[#5c3386]/10 text-[#5c3386]'
      : tone === 'red'
        ? 'bg-[#7d2228]/10 text-[#7d2228]'
        : 'bg-amber-100 text-[#9b6b07]'

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${color}`}>{label}</span>
}

export function TimeInput({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <div className="relative mt-3">
        <input
          type="time"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-16 w-full rounded-[8px] border border-slate-300 px-4 text-base font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/10 sm:text-lg"
        />
      </div>
    </label>
  )
}

export function Input({
  className = '',
  inputClassName = '',
  label,
  onChange,
  placeholder,
  type = 'text',
  value,
}: {
  className?: string
  inputClassName?: string
  label: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  value: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-3 h-12 w-full rounded-[8px] border border-slate-300 px-4 text-sm font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/10 ${inputClassName}`}
      />
    </label>
  )
}

export function Select({
  className = '',
  label,
  onChange,
  options,
  placeholder,
  selectClassName = '',
  value,
}: {
  className?: string
  label: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  selectClassName?: string
  value: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-black text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-3 h-12 w-full rounded-[8px] border border-slate-300 px-4 text-sm font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/10 ${selectClassName}`}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export function DataTable({
  columns,
  flush = false,
  rows,
}: {
  columns: string[]
  flush?: boolean
  rows: ReactNode[][]
}) {
  return (
    <>
      <div className={`${flush ? '' : 'mt-5'} grid gap-3 md:hidden`}>
        {rows.map((row, rowIndex) => (
          <article key={rowIndex} className="rounded-[8px] border border-slate-200 bg-white p-4">
            <div className="grid gap-3">
              {row.map((cell, index) => (
                <div
                  key={columns[index]}
                  className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                    {columns[index]}
                  </span>
                  <div className="max-w-[60%] text-right text-sm font-bold text-slate-700">
                    {cell}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className={`${flush ? '' : 'mt-5'} hidden overflow-x-auto md:block`}>
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-50">
              {columns.map((column) => (
                <th key={column} className="px-5 py-4 text-sm font-black text-slate-600">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="transition hover:bg-slate-50">
                {row.map((cell, index) => (
                  <td key={index} className="px-5 py-4 text-sm font-semibold leading-6 text-slate-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function EmptyState({ text }: { text: string }) {
  return <p className="rounded-[8px] bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">{text}</p>
}
