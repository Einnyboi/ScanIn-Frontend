import { QRCodeSVG } from 'qrcode.react'

import type { QrPayload } from '../../types/attendance'

type QrCodeCardProps = {
  payload: QrPayload
  secondsLeft: number
}

export function QrCodeCard({ payload, secondsLeft }: QrCodeCardProps) {
  const qrValue = JSON.stringify({
    type: 'SCANIN_ATTENDANCE',
    token: payload.token,
    courseId: payload.courseId,
    courseTitle: payload.courseTitle,
    room: payload.room,
    studentId: payload.studentId,
    studentName: payload.studentName,
    issuedAt: payload.issuedAt,
    expiresAt: payload.expiresAt,
  })
  const progress = Math.max(0, Math.min(100, (secondsLeft / 15) * 100))

  return (
    <div className="rounded-lg border border-[#5c3386]/12 bg-white p-4 shadow-xl shadow-slate-900/8 sm:p-5">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="mx-auto w-full max-w-[292px] rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-inner sm:max-w-[320px]">
          <div className="rounded-lg bg-white p-3 shadow-lg shadow-slate-900/10 sm:p-4">
            <QRCodeSVG
              value={qrValue}
              size={244}
              level="M"
              marginSize={2}
              fgColor="#5c3386"
              bgColor="#ffffff"
              className="h-auto w-full"
              aria-label="QR presensi dinamis"
            />
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
            QR Presensi Aktif
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
            {payload.courseTitle}
          </h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {payload.room} - Token berubah otomatis setiap 15 detik.
          </p>

          <div className="mt-5 rounded-lg bg-slate-50 p-4">
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

          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-6 text-emerald-800">
            QR ini hanya valid untuk akun {payload.studentName}. Jangan
            screenshot atau bagikan QR karena token akan kedaluwarsa.
          </div>
          <p className="mt-3 break-all rounded-lg bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">
            Token: {payload.token}
          </p>
        </div>
      </div>
    </div>
  )
}
