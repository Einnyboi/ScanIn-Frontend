import { useMemo, useState } from 'react'

import { roleOptions } from '../lib/roleOptions'
import type { Role } from '../types/auth'
import { isUntarAccount } from '../utils/accounts'
import { saveSupportComplaint } from '../utils/complaints'

type LoginHelpPageProps = {
  initialRole: Role
  onBack: () => void
}

type SupportRole = 'mahasiswa' | 'pengajar'

const supportRoleOptions = roleOptions.filter(
  (option) => option.id !== 'admin',
) as Array<(typeof roleOptions)[number] & { id: SupportRole }>

const getInitialSupportRole = (role: Role): SupportRole =>
  role === 'pengajar' ? 'pengajar' : 'mahasiswa'

const categories: Record<SupportRole, string[]> = {
  mahasiswa: [
    'Tidak bisa login akun mahasiswa',
    'Email @stu.untar.ac.id tidak dikenali',
    'Jadwal mahasiswa tidak muncul',
    'QR presensi bermasalah',
  ],
  pengajar: [
    'Tidak bisa login akun pengajar',
    'Email pengajar tidak dikenali',
    'Jadwal mengajar tidak muncul',
    'Scanner QR bermasalah',
  ],
}

export function LoginHelpPage({ initialRole, onBack }: LoginHelpPageProps) {
  const initialSupportRole = getInitialSupportRole(initialRole)
  const [role, setRole] = useState<SupportRole>(initialSupportRole)
  const [email, setEmail] = useState('')
  const [identity, setIdentity] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState(categories[initialSupportRole][0])
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState('')
  const activeRole = useMemo(
    () => roleOptions.find((option) => option.id === role) ?? roleOptions[0],
    [role],
  )

  const handleRoleChange = (nextRole: SupportRole) => {
    setRole(nextRole)
    setCategory(categories[nextRole][0])
    setNotice('')
  }

  const handleSubmit = () => {
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !identity.trim() || !name.trim() || !message.trim()) {
      setNotice('Lengkapi email, identitas, nama, dan detail kendala dulu.')
      return
    }

    if (!isUntarAccount(cleanEmail, role)) {
      setNotice(
        role === 'mahasiswa'
          ? 'Mahasiswa wajib memakai email @stu.untar.ac.id.'
          : 'Pengajar wajib memakai email @untar.ac.id.',
      )
      return
    }

    saveSupportComplaint(
      {
        role,
        identity: identity.trim(),
        name: name.trim(),
        email: cleanEmail,
        loggedAt: new Date().toISOString(),
      },
      category,
      message.trim(),
    )

    setNotice('Kendala berhasil dikirim ke panel admin.')
    setEmail('')
    setIdentity('')
    setName('')
    setMessage('')
  }

  return (
    <main
      className="min-h-screen bg-[#1f1232] bg-cover bg-center px-5 py-8 text-slate-950"
      style={{
        backgroundImage:
          'linear-gradient(120deg, rgba(31, 18, 50, 0.92), rgba(92, 51, 134, 0.56)), url(/untar-campus.jpg)',
      }}
    >
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={onBack}
          className="rounded-[8px] bg-white/92 px-4 py-2 text-sm font-black text-[#5c3386] shadow-lg shadow-slate-950/15 transition hover:bg-white hover:text-[#7d2228]"
        >
          Kembali ke login
        </button>

        <section className="mt-6 rounded-[8px] border border-white/70 bg-white/96 p-6 shadow-2xl shadow-[#120b1d]/35 backdrop-blur sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7d2228]">
            Bantuan Admin Fakultas
          </p>
          <h1 className="mt-3 text-3xl font-black text-[#5c3386]">
            Laporkan kendala akses akun
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
            Form ini khusus untuk mahasiswa dan pengajar. Laporan akan masuk ke
            panel admin fakultas untuk ditindaklanjuti.
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-[8px] bg-slate-100 p-1">
            {supportRoleOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleRoleChange(option.id)}
                className={`rounded-[7px] px-3 py-3 text-sm font-black transition ${
                  option.id === role
                    ? 'bg-[#5c3386] text-white shadow-lg shadow-[#5c3386]/20'
                    : 'text-slate-500 hover:bg-white hover:text-[#5c3386]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4">
            <label>
              <span className="text-sm font-black text-slate-700">
                Kategori Kendala
              </span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 h-14 w-full rounded-[8px] border border-slate-200 px-4 font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
              >
                {categories[role].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="sm:col-span-1">
                <span className="text-sm font-black text-slate-700">
                  {activeRole.fieldLabel}
                </span>
                <input
                  value={identity}
                  onChange={(event) => setIdentity(event.target.value)}
                  placeholder={activeRole.placeholder}
                  className="mt-2 h-14 w-full rounded-[8px] border border-slate-200 px-4 font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="text-sm font-black text-slate-700">
                  Email UNTAR
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={
                    role === 'mahasiswa'
                      ? 'contoh: naisya@stu.untar.ac.id'
                      : 'contoh: ahmad.santoso@untar.ac.id'
                  }
                  className="mt-2 h-14 w-full rounded-[8px] border border-slate-200 px-4 font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
                />
              </label>
            </div>

            <label>
              <span className="text-sm font-black text-slate-700">Nama</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={activeRole.namePlaceholder}
                className="mt-2 h-14 w-full rounded-[8px] border border-slate-200 px-4 font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
              />
            </label>

            <label>
              <span className="text-sm font-black text-slate-700">
                Detail Kendala
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ceritakan kendalanya supaya admin bisa cek lebih cepat."
                className="mt-2 min-h-32 w-full resize-none rounded-[8px] border border-slate-200 px-4 py-3 font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
              />
            </label>

            {notice ? (
              <p className="rounded-[8px] bg-[#5c3386]/8 px-4 py-3 text-sm font-bold text-[#5c3386]">
                {notice}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleSubmit}
              className="h-14 rounded-[8px] bg-[#5c3386] px-5 text-base font-black text-white transition hover:bg-[#4f2b73]"
            >
              Kirim ke Admin
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
