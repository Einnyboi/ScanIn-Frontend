import { useMemo, useState, type FormEvent } from 'react'

import { getPasswordRules, validatePassword } from '../utils/password'
import { resetPasswordWithOtp } from '../utils/passwordReset'

type ResetPasswordPageProps = {
  onBack: () => void
}

export function ResetPasswordPage({ onBack }: ResetPasswordPageProps) {
  const token = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return new URLSearchParams(window.location.search).get('token') ?? ''
  }, [])
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const passwordRules = getPasswordRules(password)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    if (!token) {
      setError('Token reset tidak ditemukan. Buka link dari email OTP.')
      return
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Masukkan kode OTP 6 angka dari email.')
      return
    }

    if (!validatePassword(password).isValid) {
      setError(
        'Password minimal 8 karakter dan wajib punya huruf besar, huruf kecil, serta simbol.',
      )
      return
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password belum sama.')
      return
    }

    try {
      setIsSubmitting(true)
      await resetPasswordWithOtp({
        token,
        otp: otp.trim(),
        newPassword: password,
      })
      setError('')
      setMessage('Password berhasil diperbarui. Kamu bisa login dengan password baru.')
      setOtp('')
      setPassword('')
      setConfirmPassword('')
    } catch {
      setError(
        'Reset password gagal. Pastikan OTP benar, belum kedaluwarsa, dan akun sudah ada di backend.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 text-slate-950 sm:px-6">
      <div
        className="absolute inset-0 -z-20 scale-105 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(31, 18, 50, 0.88), rgba(92, 51, 134, 0.6), rgba(15, 23, 42, 0.72)), url('/untar-campus.jpg')",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-black/20" />

      <section className="login-card w-full max-w-[560px] rounded-[14px] border border-white/70 bg-white/96 p-5 shadow-2xl shadow-[#1f1232]/25 backdrop-blur sm:p-8">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-black text-[#5c3386] transition hover:text-[#7d2228]"
        >
          Kembali ke login
        </button>

        <div className="mt-5 text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7d2228]">
            Reset Password
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-[#5c3386] sm:text-4xl">
            Masukkan OTP dari email
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-6 text-slate-500">
            Gunakan kode 6 angka yang dikirim admin, lalu buat password baru
            untuk akun ScanIn kamu.
          </p>
        </div>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-black text-slate-700">Kode OTP</span>
            <input
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                setError('')
                setMessage('')
              }}
              placeholder="000000"
              className="mt-2 h-16 w-full rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-center text-2xl font-black tracking-[0.45em] text-[#5c3386] outline-none transition placeholder:text-slate-300 focus:border-[#5c3386] focus:bg-white focus:ring-4 focus:ring-[#5c3386]/12"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-black text-slate-700">
                Password Baru
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                  setMessage('')
                }}
                className="mt-2 h-14 w-full rounded-[10px] border border-slate-200 px-4 font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
              />
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-700">
                Konfirmasi Password
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  setError('')
                  setMessage('')
                }}
                className="mt-2 h-14 w-full rounded-[10px] border border-slate-200 px-4 font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
              />
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
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

          {error ? (
            <p className="rounded-[10px] border border-[#7d2228]/20 bg-[#7d2228]/8 px-4 py-3 text-sm font-bold leading-6 text-[#7d2228]">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-700">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-14 w-full rounded-[10px] bg-[#5c3386] px-5 text-base font-black text-white shadow-xl shadow-[#5c3386]/25 transition hover:-translate-y-0.5 hover:bg-[#4f2b73] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {isSubmitting ? 'Memproses...' : 'Simpan Password Baru'}
          </button>
        </form>
      </section>
    </main>
  )
}
