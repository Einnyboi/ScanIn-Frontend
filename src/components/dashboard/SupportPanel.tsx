import { useState } from 'react'

import { getRoleOption } from '../../lib/roleOptions'
import type { LocalSession } from '../../types/auth'
import { saveSupportComplaint } from '../../utils/complaints'

type SupportPanelProps = {
  session: LocalSession
  isOpen: boolean
  onClose: () => void
}

const supportCategories = {
  mahasiswa: [
    'QR tidak muncul saat jam kelas',
    'Gagal scan QR di device pengajar',
    'Jadwal kelas tidak sesuai',
    'Tiket koreksi presensi bermasalah',
    'Notifikasi presensi tidak masuk',
  ],
  pengajar: [
    'Kamera scanner tidak aktif',
    'Tidak bisa buka atau tutup sesi',
    'Mode manual presensi bermasalah',
    'Jadwal mengajar tidak sesuai',
    'Data mahasiswa kelas tidak muncul',
  ],
  admin: [
    'Data dashboard tidak sinkron',
    'CRUD pengguna bermasalah',
    'Laporan tidak bisa dibuat',
  ],
}

const supportPlaceholder = {
  mahasiswa:
    'Contoh: QR saya tidak muncul saat kelas Basis Data Lanjut, padahal sudah masuk jam kuliah.',
  pengajar:
    'Contoh: kamera scanner tidak aktif saat saya membuka sesi Basis Data Lanjut.',
  admin:
    'Contoh: data jadwal yang sudah diedit belum muncul di dashboard pengguna.',
}

export function SupportPanel({ session, isOpen, onClose }: SupportPanelProps) {
  const role = getRoleOption(session.role)
  const categories = supportCategories[session.role]
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [message, setMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  if (!isOpen) {
    return null
  }

  const handleSubmit = () => {
    if (!message.trim()) {
      setStatusMessage('Tulis keluhannya dulu supaya admin bisa bantu dengan jelas.')
      return
    }

    saveSupportComplaint(session, selectedCategory, message.trim())
    setMessage('')
    setStatusMessage('Keluhan berhasil dikirim ke panel admin.')
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
      <div className="support-panel ml-auto flex h-full max-w-md flex-col rounded-lg bg-white shadow-2xl shadow-slate-950/20">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7d2228]">
                Bantuan Admin
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#5c3386]">
                Kirim Keluhan
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#7d2228]"
              aria-label="Tutup bantuan"
            >
              x
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-lg border border-[#5c3386]/12 bg-[#5c3386]/5 p-4">
            <p className="text-sm leading-6 text-slate-600">
              Pilih kategori masalah sesuai akses {role.label.toLowerCase()},
              isi detailnya, lalu kirim. Admin bisa melihat keluhan ini dari
              panel admin.
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <SupportRow label="Nama" value={session.name} />
              <SupportRow label={role.fieldLabel} value={session.identity} />
              <SupportRow label="Role" value={role.label} />
            </div>
          </div>

          <div className="grid gap-3">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setSelectedCategory(item)
                  setStatusMessage('')
                }}
                className={`rounded-lg border px-4 py-3 text-left text-sm font-black transition ${
                  selectedCategory === item
                    ? 'border-[#5c3386] bg-[#5c3386] text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#5c3386]/40'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-sm font-black text-slate-700">
              Detail keluhan
            </span>
            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value)
                setStatusMessage('')
              }}
              placeholder={supportPlaceholder[session.role]}
              className="mt-2 min-h-32 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
            />
          </label>

          {statusMessage ? (
            <p className="rounded-lg bg-[#5c3386]/8 px-4 py-3 text-sm font-bold text-[#5c3386]">
              {statusMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-[#5c3386] px-4 text-sm font-black text-white transition hover:bg-[#4f2b73]"
          >
            Kirim ke Admin
          </button>
        </div>
      </div>
    </div>
  )
}

type SupportRowProps = {
  label: string
  value: string
}

function SupportRow({ label, value }: SupportRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="font-bold text-slate-400">{label}</span>
      <span className="text-right font-black text-slate-800">{value}</span>
    </div>
  )
}
