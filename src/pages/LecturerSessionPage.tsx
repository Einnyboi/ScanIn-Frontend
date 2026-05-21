import { useEffect, useMemo, useState } from 'react'

import type { CourseSchedule, ScanRecord } from '../types/attendance'
import {
  getAutoCloseSecondsLeft,
  getSessionAutoCloseAt,
} from '../utils/schedule'

type LecturerSessionPageProps = {
  course: CourseSchedule
  scannerMessage: string
  scanRecords: ScanRecord[]
  onBack: () => void
  onCloseSession: () => void
  onLocalScan: () => void
  onManualMark: (
    student: ManualStudent,
    status: 'Terverifikasi' | 'Terlambat' | 'Tidak Hadir',
  ) => void
}

type ManualStudent = {
  studentId: string
  studentName: string
  defaultTime: string
}

const manualStudents: ManualStudent[] = [
  { studentId: '535240187', studentName: "Naisya Yuen Ra'af", defaultTime: '08:02' },
  { studentId: '535240156', studentName: 'Ahmad Rizki', defaultTime: '08:03' },
  { studentId: '535240145', studentName: 'Siti Nurhaliza', defaultTime: '08:01' },
  { studentId: '535240132', studentName: 'Budi Santoso', defaultTime: '08:04' },
  { studentId: '535240178', studentName: 'Dewi Lestari', defaultTime: '08:05' },
  { studentId: '535240165', studentName: 'Eko Prasetyo', defaultTime: '08:17' },
  { studentId: '535240189', studentName: 'Fitri Handayani', defaultTime: '08:03' },
  { studentId: '535240123', studentName: 'Gani Wijaya', defaultTime: '08:02' },
  { studentId: '535240198', studentName: 'Hendra Gunawan', defaultTime: '-' },
  { studentId: '535240167', studentName: 'Indah Permata', defaultTime: '08:06' },
]

export function LecturerSessionPage({
  course,
  scannerMessage,
  scanRecords,
  onBack,
  onCloseSession,
  onLocalScan,
  onManualMark,
}: LecturerSessionPageProps) {
  const [now, setNow] = useState(() => new Date())
  const [mode, setMode] = useState<'qr' | 'manual'>('qr')
  const secondsLeft = getAutoCloseSecondsLeft(course, now)
  const autoCloseAt = getSessionAutoCloseAt(course, now)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (secondsLeft === 0) {
      onCloseSession()
    }
  }, [onCloseSession, secondsLeft])

  const latestRecordByStudent = useMemo(() => {
    const latestRecords = new Map<string, ScanRecord>()

    scanRecords
      .filter((record) => record.courseTitle === course.title)
      .forEach((record) => {
        if (!latestRecords.has(record.studentId)) {
          latestRecords.set(record.studentId, record)
        }
      })

    return latestRecords
  }, [course.title, scanRecords])

  const presentCount = [...latestRecordByStudent.values()].filter(
    (record) => record.status === 'Terverifikasi',
  ).length
  const lateCount = [...latestRecordByStudent.values()].filter(
    (record) => record.status === 'Terlambat',
  ).length
  const absentCount = manualStudents.length - presentCount - lateCount
  const attendedCount = presentCount + lateCount
  const progress = Math.round((attendedCount / manualStudents.length) * 100)

  if (mode === 'manual') {
    return (
      <main className="min-h-screen bg-white text-slate-950">
        <section className="px-4 py-5 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <PeopleIcon />
              <div>
                <h1 className="text-3xl font-black text-slate-950">Mode Manual</h1>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  {course.title} - {course.room}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMode('qr')}
              className="flex h-12 items-center justify-center rounded-[8px] border border-[#5c3386] px-5 text-sm font-black text-[#5c3386] transition hover:bg-[#5c3386] hover:text-white"
            >
              Kembali ke Mode QR
            </button>
          </div>

          <div className="mt-8 overflow-x-auto">
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
                {manualStudents.map((student) => {
                  const record = latestRecordByStudent.get(student.studentId)
                  const status = record?.status ?? 'Tidak Hadir'
                  const time = record?.scannedAt.slice(0, 5) ?? student.defaultTime

                  return (
                    <tr key={student.studentId} className="even:bg-slate-50">
                      <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                        {student.studentId}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                        {student.studentName}
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
                            onClick={() => onManualMark(student, 'Terverifikasi')}
                            className="h-9 rounded-[8px] bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-700"
                          >
                            Hadir
                          </button>
                          <button
                            type="button"
                            onClick={() => onManualMark(student, 'Terlambat')}
                            className="h-9 rounded-[8px] bg-[#c28a08] px-4 text-sm font-black text-white transition hover:bg-[#a87607]"
                          >
                            Telat
                          </button>
                          <button
                            type="button"
                            onClick={() => onManualMark(student, 'Tidak Hadir')}
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
            <p className="mt-1 font-mono text-4xl font-black text-[#7d2228]">
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
          <h2 className="mt-2 text-3xl font-black text-slate-950">
            Scan QR Mahasiswa
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Scanner langsung aktif setelah sesi dibuka. Untuk prototipe lokal,
            tombol scan membaca QR aktif dari localStorage.
          </p>

          <div className="mx-auto mt-7 max-w-md rounded-[8px] bg-slate-100 p-6">
            <div className="scanner-frame flex aspect-square items-center justify-center rounded-[8px] bg-slate-950 text-white shadow-inner">
              <div>
                <div className="mx-auto grid h-40 w-40 grid-cols-2 gap-7">
                  <ScanCorner />
                  <ScanCorner />
                  <ScanCorner />
                  <ScanCorner />
                </div>
                <p className="mt-6 text-sm font-bold text-white/70">
                  Arahkan kamera ke QR mahasiswa
                </p>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-5 max-w-2xl rounded-[8px] bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-slate-600">
            {scannerMessage}
          </p>

          <div className="mt-7 text-left">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black text-slate-700">
              <span>Progress Kehadiran</span>
              <span>
                {attendedCount}/{manualStudents.length} Mahasiswa
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#5c3386] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={onLocalScan}
              className="flex h-12 items-center justify-center rounded-[8px] bg-[#5c3386] px-4 text-sm font-black text-white transition hover:bg-[#4f2b73]"
            >
              Scan QR Lokal
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

function SessionStatusPill({ status }: { status: ScanRecord['status'] }) {
  const tone =
    status === 'Terverifikasi'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'Terlambat'
        ? 'bg-amber-100 text-amber-700'
        : status === 'Tidak Hadir'
          ? 'bg-[#7d2228]/10 text-[#7d2228]'
          : 'bg-slate-100 text-slate-500'

  const label = status === 'Terverifikasi' ? 'Hadir' : status

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
