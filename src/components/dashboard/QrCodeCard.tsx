import { generateQrMatrix } from '../../utils/qr'
import type { QrPayload } from '../../types/attendance'

type QrCodeCardProps = {
  payload: QrPayload
  secondsLeft: number
}

export function QrCodeCard({ payload, secondsLeft }: QrCodeCardProps) {
  const matrix = generateQrMatrix(payload.token)
  const progress = Math.max(0, Math.min(100, (secondsLeft / 15) * 100))

  return (
    <div className="rounded-[8px] border border-[#5c3386]/12 bg-white p-5 shadow-xl shadow-slate-900/8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="mx-auto rounded-[8px] border border-slate-200 bg-white p-4 shadow-inner">
          <div
            className="grid h-64 w-64 gap-[2px]"
            style={{ gridTemplateColumns: `repeat(${matrix.length}, 1fr)` }}
            aria-label="QR presensi dinamis"
          >
            {matrix.flatMap((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <span
                  key={`${rowIndex}-${colIndex}`}
                  className={cell ? 'rounded-[1px] bg-slate-950' : 'bg-white'}
                />
              )),
            )}
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
            QR Presensi Aktif
          </p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">
            {payload.courseTitle}
          </h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {payload.room} - Token berubah otomatis setiap 15 detik.
          </p>

          <div className="mt-5 rounded-[8px] bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-slate-500">
                Sisa waktu
              </span>
              <span className="text-2xl font-black text-[#5c3386]">
                {secondsLeft}s
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#5c3386] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-6 text-emerald-800">
            QR ini hanya valid untuk akun {payload.studentName}. Jangan
            screenshot atau bagikan QR karena token akan kedaluwarsa.
          </div>
        </div>
      </div>
    </div>
  )
}
