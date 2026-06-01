import { useMemo, useState, type FormEvent } from 'react'

import { roleOptions } from '../lib/roleOptions'
import type { Role } from '../types/auth'
import { isUntarAccount } from '../utils/accounts'
import { createPasswordResetRequest } from '../utils/passwordReset'

type ForgotPasswordPageProps = {
  initialRole: Role
  onBack: () => void
}

export function ForgotPasswordPage({
  initialRole,
  onBack,
}: ForgotPasswordPageProps) {
  const [role, setRole] = useState<Role>(initialRole)
  const [email, setEmail] = useState('')
  const [identity, setIdentity] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const activeRole = useMemo(
    () => roleOptions.find((option) => option.id === role) ?? roleOptions[0],
    [role],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !identity.trim() || !name.trim()) {
      setError('Email UNTAR, identitas, dan nama wajib diisi.')
      setMessage('')
      return
    }

    if (!isUntarAccount(cleanEmail, role)) {
      setError(
        role === 'mahasiswa'
          ? 'Mahasiswa wajib memakai email @stu.untar.ac.id.'
          : 'Pengajar wajib memakai email @untar.ac.id.',
      )
      setMessage('')
      return
    }

    setIsSubmitting(true)

    const result = await createPasswordResetRequest({
      email: cleanEmail,
      identity,
      name,
      role,
    })

    setIsSubmitting(false)
    setError('')

    if (result.synced) {
      setMessage(
        `Permintaan reset password sudah masuk ke admin. Setelah disetujui, kode OTP dan link reset akan dikirim ke ${cleanEmail}.`,
      )
      setEmail('')
      setIdentity('')
      setName('')
      return
    }

    setMessage(
      'Permintaan tersimpan di perangkat ini, tapi backend belum bisa dihubungi. Jalankan backend agar admin menerima permintaan dan bisa mengirim OTP ke email.',
    )
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-5 py-8 text-slate-950">
      <div
        className="absolute inset-0 -z-20 scale-105 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(31, 18, 50, 0.9), rgba(92, 51, 134, 0.58), rgba(15, 23, 42, 0.78)), url('/untar-campus.jpg')",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-black/20" />
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-black text-white transition hover:text-white/75"
        >
          Kembali ke login
        </button>

        <section className="mt-6 rounded-[8px] border border-white/80 bg-white/95 p-6 shadow-2xl shadow-[#2f1d45]/25 backdrop-blur sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7d2228]">
            Reset Password
          </p>
          <h1 className="mt-3 text-3xl font-black text-[#5c3386]">
            Kirim permintaan reset ke admin
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
            Masukkan email resmi, {activeRole.fieldLabel}, dan nama agar admin
            bisa memverifikasi akun sebelum kode OTP dikirim ke email resmi.
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-[8px] bg-slate-100 p-1">
            {roleOptions
              .filter((option) => option.id !== 'admin')
              .map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setRole(option.id)
                    setError('')
                    setMessage('')
                  }}
                  className={`col-span-1 rounded-[7px] px-3 py-3 text-sm font-black transition ${
                    option.id === role
                      ? 'bg-[#5c3386] text-white shadow-lg shadow-[#5c3386]/20'
                      : 'text-slate-500 hover:bg-white hover:text-[#5c3386]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
          </div>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-black text-slate-700">
                Email UNTAR
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setError('')
                  setMessage('')
                }}
                placeholder={
                  role === 'mahasiswa'
                    ? 'contoh: naisya@stu.untar.ac.id'
                    : 'contoh: ahmad.santoso@untar.ac.id'
                }
                className="mt-2 h-14 w-full rounded-[8px] border border-slate-200 px-4 font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black text-slate-700">
                  {activeRole.fieldLabel}
                </span>
                <input
                  value={identity}
                  onChange={(event) => {
                    setIdentity(event.target.value)
                    setError('')
                    setMessage('')
                  }}
                  placeholder={activeRole.placeholder}
                  className="mt-2 h-14 w-full rounded-[8px] border border-slate-200 px-4 font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
                />
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-700">Nama</span>
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setError('')
                    setMessage('')
                  }}
                  placeholder={activeRole.namePlaceholder}
                  className="mt-2 h-14 w-full rounded-[8px] border border-slate-200 px-4 font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
                />
              </label>
            </div>

            {error ? (
              <p className="rounded-[8px] border border-[#7d2228]/20 bg-[#7d2228]/8 px-4 py-3 text-sm font-bold text-[#7d2228]">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-700">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-14 rounded-[8px] bg-[#5c3386] px-5 text-base font-black text-white transition hover:bg-[#4f2b73] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? 'Mengirim permintaan...' : 'Kirim Permintaan Reset Password'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
