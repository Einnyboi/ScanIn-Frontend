import { getRoleOption } from '../../lib/roleOptions'
import type { LocalSession } from '../../types/auth'

type SupportPanelProps = {
  session: LocalSession
  isOpen: boolean
  onClose: () => void
}

export function SupportPanel({ session, isOpen, onClose }: SupportPanelProps) {
  const role = getRoleOption(session.role)

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
      <div className="support-panel ml-auto flex h-full max-w-md flex-col rounded-[8px] bg-white shadow-2xl shadow-slate-950/20">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7d2228]">
                Bantuan Admin
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#5c3386]">
                Pusat Bantuan ScanIn
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-[8px] text-slate-500 transition hover:bg-slate-100 hover:text-[#7d2228]"
              aria-label="Tutup bantuan"
            >
              x
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-[8px] border border-[#5c3386]/12 bg-[#5c3386]/5 p-4">
            <p className="text-sm leading-6 text-slate-600">
              Kirim data ini ke admin kalau akun, QR, atau sesi presensi
              bermasalah.
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <SupportRow label="Nama" value={session.name} />
              <SupportRow label={role.fieldLabel} value={session.identity} />
              <SupportRow label="Role" value={role.label} />
            </div>
          </div>

          <div className="rounded-[8px] border border-slate-200 p-4">
            <h3 className="text-base font-black text-slate-900">
              Format pesan cepat
            </h3>
            <p className="mt-3 rounded-[8px] bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
              Halo Admin Fakultas FTI, saya {session.name} ({role.label}) dengan{' '}
              {role.fieldLabel} {session.identity}. Saya butuh bantuan terkait
              akun presensi ScanIn.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              'QR tidak berubah atau tidak muncul',
              'Gagal scan QR di device pengajar',
              'Akun tidak sesuai data akademik',
              'Ajukan koreksi presensi',
            ].map((item) => (
              <div
                key={item}
                className="rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600"
              >
                {item}
              </div>
            ))}
          </div>
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

