import { useCallback, useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

import type { CourseSchedule, QrPayload } from '../types/attendance'
import { apiRequest } from '../utils/api'
import {
  getAutoCloseSecondsLeft,
  getSessionAutoCloseAt,
} from '../utils/schedule'

type LecturerSessionPageProps = {
  course: CourseSchedule
  sessionId: string
  scannerMessage: string
  onBack: () => void
  onCloseSession: () => void
}

type ScanToast = {
  success: boolean
  title: string
  message: string
}

type StudentPresensi = {
  mahasiswaId: string
  nim: string
  nama: string
  statusKehadiran: string
  waktuAbsen: string | null
}

export function LecturerSessionPage({
  course,
  sessionId,
  scannerMessage: initialScannerMessage,
  onBack,
  onCloseSession,
}: LecturerSessionPageProps) {
  const [now, setNow] = useState(() => new Date())
  const [mode, setMode] = useState<'qr' | 'manual'>('qr')
  const [isScannerActive, setIsScannerActive] = useState(false)
  const [cameraMessage, setCameraMessage] = useState('')
  const [scannerMessage, setScannerMessage] = useState(initialScannerMessage)
  const [scanToast, setScanToast] = useState<ScanToast | null>(null)
  const [students, setStudents] = useState<StudentPresensi[]>([])

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const lastScannedTokenRef = useRef('')
  const secondsLeft = getAutoCloseSecondsLeft(course, now)
  const autoCloseAt = getSessionAutoCloseAt(course, now)

  const fetchPresensi = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await apiRequest<any[]>(`/presensi/sesi/${sessionId}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = data.map((item: any) => ({
        mahasiswaId: item.mahasiswaId,
        nim: item.mahasiswa?.nim || '',
        nama: item.mahasiswa?.pengguna?.nama || '',
        statusKehadiran: item.statusKehadiran,
        waktuAbsen: item.waktuAbsen,
      }))
      setStudents(mapped)
    } catch (err) {
      console.error(err)
    }
  }, [sessionId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPresensi()
    const timer = setInterval(() => { void fetchPresensi() }, 3000)
    return () => clearInterval(timer)
  }, [fetchPresensi])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (secondsLeft === 0) {
      onCloseSession()
    }
  }, [onCloseSession, secondsLeft])

  useEffect(() => {
    return () => {
      const scanner = html5QrCodeRef.current
      html5QrCodeRef.current = null

      if (scanner?.isScanning) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(console.error)
      }
    }
  }, [])

  const presentCount = students.filter(
    (s) => s.statusKehadiran === 'HADIR',
  ).length
  const lateCount = students.filter(
    (s) => s.statusKehadiran === 'TERLAMBAT',
  ).length
  const absentCount = students.filter(
    (s) => s.statusKehadiran === 'TIDAK_HADIR' || s.statusKehadiran === 'BELUM_ADA_KETERANGAN',
  ).length
  const attendedCount = presentCount + lateCount
  const progress = students.length ? Math.round((attendedCount / students.length) * 100) : 0

  const playScanFeedback = useCallback((success: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const browserWindow = window as any
    const AudioContextConstructor =
      window.AudioContext ?? browserWindow.webkitAudioContext

    if (!AudioContextConstructor) return

    const audioContext = new AudioContextConstructor()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()

    oscillator.type = success ? 'sine' : 'square'
    oscillator.frequency.value = success ? 880 : 300
    gain.gain.setValueAtTime(0.001, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.22, audioContext.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.16)
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.18)
  }, [])

  const attemptCameraScan = useCallback(
    async (decodedText?: string) => {
      if (!decodedText) return
      let payload: QrPayload | null = null
      try {
        const parsed = JSON.parse(decodedText)
        if (parsed.type === 'SCANIN_ATTENDANCE' || parsed.type === 'QR_PRESENSI') {
          payload = parsed as QrPayload
        } else {
          setCameraMessage('QR terbaca, tapi format tidak dikenali.')
          return
        }
      } catch {
        setCameraMessage('QR terbaca (bukan JSON): ' + decodedText.slice(0, 30))
        return
      }

      if (payload.token === lastScannedTokenRef.current) {
        return // debounce
      }

      lastScannedTokenRef.current = payload.token

      try {
        const res = await apiRequest<{ pesan: string, status: string }>('/presensi/scan', {
          method: 'POST',
          body: JSON.stringify({ sesiId: sessionId, qrToken: payload.token }),
        })
        
        playScanFeedback(true)
        setScanToast({
          success: true,
          title: 'Presensi berhasil',
          message: res.pesan,
        })
        fetchPresensi()
      } catch (err) {
        const error = err as Error
        playScanFeedback(false)
        setScanToast({
          success: false,
          title: 'QR tidak valid',
          message: error.message || 'Terjadi kesalahan',
        })
      }
    },
    [sessionId, fetchPresensi, playScanFeedback],
  )

  const handleStartCamera = async () => {
    if (html5QrCodeRef.current?.isScanning) return

    try {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop()
        }
        html5QrCodeRef.current.clear()
      }

      const html5QrCode = new Html5Qrcode('qr-reader')
      html5QrCodeRef.current = html5QrCode
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
            const size = Math.max(200, Math.floor(minEdge * 0.85))
            return { height: size, width: size }
          },
          aspectRatio: 1,
          disableFlip: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        } as any,
        (decodedText: string) => {
          void attemptCameraScan(decodedText)
        },
        undefined,
      )
      setIsScannerActive(true)
      setCameraMessage('Kamera aktif. Scanner akan membaca QR secara otomatis.')
    } catch (err) {
      const error = err as Error
      console.error(error)
      setCameraMessage('Gagal menyalakan kamera: ' + (error?.message || 'Izin ditolak.'))
    }

  }

  const handleToggleCamera = async () => {
    if (isScannerActive) {
      if (html5QrCodeRef.current?.isScanning) {
        await html5QrCodeRef.current.stop()
      }
      html5QrCodeRef.current?.clear()
      setIsScannerActive(false)
      setCameraMessage('')
    } else {
      await handleStartCamera()
    }
  }

  const handleManualMark = async (student: StudentPresensi, status: string) => {
    try {
      await apiRequest('/presensi/manual', {
        method: 'POST',
        body: JSON.stringify({
          sesiId: sessionId,
          daftarHadir: [{ mahasiswaId: student.nim, status }],
        })
      });
      void fetchPresensi();
      setScannerMessage(`Mahasiswa ${student.nama} ditandai ${status} manual.`);
    } catch (err) {
      const error = err as Error
      setScannerMessage(`Gagal mark manual: ${error.message}`);
    }
  }

  if (mode === 'manual') {
    return (
      <main className="min-h-screen bg-white text-slate-950">
        <section className="px-4 py-5 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <PeopleIcon />
              <div>
                <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">Mode Manual</h1>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  {course.title} - {course.room}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMode('qr')}
              className="flex h-12 w-full items-center justify-center rounded-[8px] border border-[#5c3386] px-5 text-sm font-black text-[#5c3386] transition hover:bg-[#5c3386] hover:text-white sm:w-auto"
            >
              Kembali ke Mode QR
            </button>
          </div>

          <div className="mt-8 grid gap-3 md:hidden">
            {students.map((student) => {
              const status = student.statusKehadiran
              const time = student.waktuAbsen ? new Date(student.waktuAbsen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'

              return (
                <article
                  key={student.mahasiswaId}
                  className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-slate-950">
                        {student.nama}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {student.nim} - {time}
                      </p>
                    </div>
                    <SessionStatusPill status={status} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleManualMark(student, 'HADIR')}
                      className="h-10 rounded-[8px] bg-emerald-600 px-3 text-sm font-black text-white transition hover:bg-emerald-700"
                    >
                      Hadir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleManualMark(student, 'TERLAMBAT')}
                      className="h-10 rounded-[8px] bg-[#c28a08] px-3 text-sm font-black text-white transition hover:bg-[#a87607]"
                    >
                      Telat
                    </button>
                    <button
                      type="button"
                      onClick={() => handleManualMark(student, 'TIDAK_HADIR')}
                      className="h-10 rounded-[8px] border border-[#7d2228] px-3 text-sm font-black text-[#7d2228] transition hover:bg-[#7d2228] hover:text-white"
                    >
                      Alpa
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="mt-8 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-4 text-sm font-black text-slate-600">
                    NIM
                  </th>
                  <th className="px-4 py-4 text-sm font-black text-slate-600">
                    Nama
                  </th>
                  <th className="px-4 py-4 text-sm font-black text-slate-600">
                    Waktu
                  </th>
                  <th className="px-4 py-4 text-sm font-black text-slate-600">
                    Status
                  </th>
                  <th className="px-4 py-4 text-sm font-black text-slate-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const status = student.statusKehadiran
                  const time = student.waktuAbsen ? new Date(student.waktuAbsen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'

                  return (
                    <tr key={student.mahasiswaId} className="even:bg-slate-50">
                      <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                        {student.nim}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                        {student.nama}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {time}
                      </td>
                      <td className="px-4 py-4">
                        <SessionStatusPill status={status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleManualMark(student, 'HADIR')}
                            className="h-9 rounded-[8px] bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-700"
                          >
                            Hadir
                          </button>
                          <button
                            type="button"
                            onClick={() => handleManualMark(student, 'TERLAMBAT')}
                            className="h-9 rounded-[8px] bg-[#c28a08] px-4 text-sm font-black text-white transition hover:bg-[#a87607]"
                          >
                            Telat
                          </button>
                          <button
                            type="button"
                            onClick={() => handleManualMark(student, 'TIDAK_HADIR')}
                            className="h-9 rounded-[8px] border border-[#7d2228] px-4 text-sm font-black text-[#7d2228] transition hover:bg-[#7d2228] hover:text-white"
                          >
                            Alpa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="bg-[#5c3386] px-4 py-6 text-white sm:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-3 text-sm font-black text-white/90 transition hover:text-white sm:text-base"
        >
          <span aria-hidden="true" className="text-2xl leading-none">
            &larr;
          </span>
          Kembali ke Dashboard
        </button>
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              {course.title}
            </h1>
            <p className="mt-2 text-lg font-bold text-white/80">
              {course.room} - {course.time}
            </p>
          </div>
          <div className="rounded-[8px] bg-white/10 px-5 py-4 text-left md:text-right">
            <p className="text-sm font-bold text-white/80">Auto-close dalam</p>
            <p className="mt-1 font-mono text-3xl font-black text-[#7d2228] sm:text-4xl">
              {formatDuration(secondsLeft)}
            </p>
            <p className="mt-1 text-xs font-bold text-white/70">
              Ditutup otomatis {formatClock(autoCloseAt)}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-8">
        <section className="grid gap-4 md:grid-cols-3">
          <SessionStatCard label="Hadir" value={`${presentCount}`} tone="green" />
          <SessionStatCard label="Terlambat" value={`${lateCount}`} tone="yellow" />
          <SessionStatCard label="Tidak Hadir" value={`${absentCount}`} tone="red" />
        </section>

        <section className="rounded-[8px] border border-white bg-white p-5 text-center shadow-lg shadow-slate-900/8 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
            Scanner QR
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
            Scan QR Mahasiswa
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Aktifkan kamera untuk scan QR. Pada prototipe lokal ini, hasil scan
            membaca QR aktif yang dibuat mahasiswa di browser yang sama.
          </p>

          <div className="mx-auto mt-7 max-w-md rounded-[8px] bg-slate-100 p-4">
            <div className="scanner-frame relative aspect-square overflow-hidden rounded-[8px] bg-slate-950 text-white shadow-inner">
              <div id="qr-reader" className="scanin-qr-reader absolute inset-0" />
              {!isScannerActive ? (
                <div className="absolute inset-0 z-10 flex h-full items-center justify-center bg-slate-950 px-8 text-center">
                  <div>
                    <div className="mx-auto grid h-40 w-40 grid-cols-2 gap-7">
                      <ScanCorner />
                      <ScanCorner />
                      <ScanCorner />
                      <ScanCorner />
                    </div>
                    <p className="mt-6 text-sm font-bold text-white/70">
                      Kamera belum aktif
                    </p>
                  </div>
                </div>
              ) : null}
              <div className="pointer-events-none absolute inset-8 z-20 rounded-[8px] border-2 border-white/70" />
            </div>
          </div>

          <p className="mx-auto mt-5 max-w-2xl rounded-[8px] bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-slate-600">
            {scannerMessage}
          </p>
          {cameraMessage ? (
            <p className="mx-auto mt-3 max-w-2xl rounded-[8px] bg-[#5c3386]/8 px-4 py-3 text-sm font-bold leading-6 text-[#5c3386]">
              {cameraMessage}
            </p>
          ) : null}
          {scanToast ? (
            <div
              className={`scan-success-toast mx-auto mt-3 max-w-2xl rounded-[8px] border px-4 py-3 text-left ${
                scanToast.success
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-[#7d2228]/20 bg-[#7d2228]/8 text-[#7d2228]'
              }`}
              role="status"
            >
              <p className="text-sm font-black">{scanToast.title}</p>
              <p className="mt-1 text-sm font-semibold leading-6">
                {scanToast.message}
              </p>
            </div>
          ) : null}

          <div className="mt-7 text-left">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black text-slate-700">
              <span>Progress Kehadiran</span>
              <span>
                {attendedCount}/{students.length} Mahasiswa
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#5c3386] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <button
              type="button"
              onClick={handleToggleCamera}
              className={`flex h-12 items-center justify-center rounded-[8px] border px-4 text-sm font-black transition ${
                isScannerActive
                  ? 'border-[#7d2228] bg-[#7d2228] text-white hover:bg-[#691c21]'
                  : 'border-[#5c3386] bg-white text-[#5c3386] hover:bg-[#5c3386] hover:text-white'
              }`}
            >
              {isScannerActive ? 'Matikan Kamera' : 'Aktifkan Kamera'}
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className="flex h-12 items-center justify-center rounded-[8px] border border-[#5c3386] bg-white px-4 text-sm font-black text-[#5c3386] transition hover:bg-[#5c3386] hover:text-white"
            >
              Mode Manual
            </button>
            <button
              type="button"
              onClick={onCloseSession}
              className="flex h-12 items-center justify-center rounded-[8px] bg-[#7d2228] px-4 text-sm font-black text-white transition hover:bg-[#691c21]"
            >
              Tutup Sesi
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

function SessionStatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'green' | 'yellow' | 'red'
}) {
  const toneClass = {
    green: 'bg-emerald-100 text-emerald-700',
    yellow: 'bg-amber-100 text-amber-700',
    red: 'bg-[#7d2228]/12 text-[#7d2228]',
  }[tone]

  return (
    <div className="flex items-center gap-5 rounded-[8px] border border-white bg-white p-6 shadow-lg shadow-slate-900/8">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-[8px] ${toneClass}`}
      >
        {tone === 'green' ? <CheckIcon /> : tone === 'yellow' ? <ClockIcon /> : <XIcon />}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-500">{label}</p>
        <p className="mt-1 text-4xl font-black text-slate-950">{value}</p>
      </div>
    </div>
  )
}

function SessionStatusPill({ status }: { status: string }) {
  const tone =
    status === 'HADIR'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'TERLAMBAT'
        ? 'bg-amber-100 text-amber-700'
        : status === 'TIDAK_HADIR'
          ? 'bg-[#7d2228]/10 text-[#7d2228]'
          : 'bg-slate-100 text-slate-500'

  const label = status === 'BELUM_ADA_KETERANGAN' ? 'Belum Ada Keterangan' : status

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}>
      {label}
    </span>
  )
}

function ScanCorner() {
  return <div className="rounded-[8px] border-[10px] border-[#5c3386] bg-white" />
}


function PeopleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-12 w-12 text-[#5c3386]"
    >
      <path
        d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a5 5 0 0 1 10 0M11 20a5 5 0 0 1 10 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8">
      <path
        d="m5 12 4 4L19 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8">
      <path
        d="M12 6v6l4 2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
      <path
        d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8">
      <path
        d="m8 8 8 8M16 8l-8 8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
    </svg>
  )
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return [hours, minutes, remainingSeconds]
    .map((part) => String(part).padStart(2, '0'))
    .join(':')
}

const formatClock = (date: Date) =>
  date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
