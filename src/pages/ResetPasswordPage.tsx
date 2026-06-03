import { useState, type FormEvent } from 'react'
import { completePasswordReset } from '../utils/passwordReset'
import { validatePassword } from '../utils/password'

type ResetPasswordPageProps = {
  token: string
  onBack: () => void
}

export function ResetPasswordPage({ token, onBack }: ResetPasswordPageProps) {
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!otp.trim()) {
      setError('Kode OTP wajib diisi.')
      return
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.')
      return
    }

    if (!validatePassword(password).isValid) {
      setError(
        'Password minimal 8 karakter dan wajib punya huruf besar, huruf kecil, serta simbol.',
      )
      return
    }

    setIsLoading(true)
    try {
      await completePasswordReset(token, otp, password)
      setSuccess(true)
      setError('')
    } catch {
      setError('Gagal mereset password. Token mungkin tidak valid atau sudah kedaluwarsa.')
    } finally {
      setIsLoading(false)
    }
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
      <div className="mx-auto max-w-xl mt-12">
        <section className="rounded-[8px] border border-white/80 bg-white/95 p-6 shadow-2xl shadow-[#2f1d45]/25 backdrop-blur sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7d2228]">
            Keamanan Akun
          </p>
          <h1 className="mt-3 text-3xl font-black text-[#5c3386]">Buat Password Baru</h1>

          {success ? (
            <div className="mt-6">
              <p className="rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-700">
                Password berhasil diperbarui! Silakan login menggunakan password baru Anda.
              </p>
              <button type="button" onClick={onBack} className="mt-6 h-14 w-full rounded-[8px] bg-[#5c3386] px-5 text-base font-black text-white transition hover:bg-[#4f2b73]">
                Kembali ke halaman Login
              </button>
            </div>
          ) : (
            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-black text-slate-700">Kode OTP (dari Email)</span>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value); setError('') }}
                  className="mt-2 h-14 w-full rounded-[8px] border border-slate-200 px-4 font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
                />
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-700">Password Baru</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  className="mt-2 h-14 w-full rounded-[8px] border border-slate-200 px-4 font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-700">Konfirmasi Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                  className="mt-2 h-14 w-full rounded-[8px] border border-slate-200 px-4 font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
                />
              </label>

              {error ? (
                <p className="rounded-[8px] border border-[#7d2228]/20 bg-[#7d2228]/8 px-4 py-3 text-sm font-bold text-[#7d2228]">
                  {error}
                </p>
              ) : null}

              <button type="submit" disabled={isLoading} className="mt-2 h-14 rounded-[8px] bg-[#5c3386] px-5 text-base font-black text-white transition hover:bg-[#4f2b73] disabled:opacity-50">
                {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}
