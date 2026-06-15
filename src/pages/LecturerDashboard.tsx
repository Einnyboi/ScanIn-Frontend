import { useEffect, useMemo, useState } from 'react'

import { DashboardShell } from '../components/dashboard/DashboardShell'
import { StatCard } from '../components/dashboard/StatCard'
import {
  type StatisticsMode,
  StatisticsPage,
} from './StatisticsPage'
import { LecturerSessionPage } from './LecturerSessionPage'
import type {
  CourseSchedule,
  ScanRecord,
} from '../types/attendance'
import type { LocalSession } from '../types/auth'
import {
  fetchScanRecordsFromBackend,
  saveStoredScanRecord,
  scanRecordsChangedEvent,
} from '../utils/attendanceStorage'
import {
  saveAttendanceNotification,
} from '../utils/notifications'
import { isQrExpired, loadActiveQrPayload } from '../utils/qr'
import { apiRequest } from '../utils/api'
import {
  getRuntimeLabel,
  getRuntimeStatus,
  isSessionWindowOpen,
  type RuntimeStatus,
} from '../utils/schedule'
import {
  fetchSchedulesFromBackend,
  scheduleChangedEvent,
} from '../utils/schedules'

type LecturerDashboardProps = {
  session: LocalSession
  onLogout: () => void
}

type LecturerMetric =
  | Extract<
      StatisticsMode,
      'lecturer-present' | 'lecturer-session'
    >
  | null

type LocalScanResult = {
  success: boolean
  title: string
  message: string
  studentName?: string
  studentId?: string
}

export function LecturerDashboard({ session, onLogout }: LecturerDashboardProps) {
  const [now, setNow] = useState(() => new Date())
  const [schedules, setSchedules] = useState<CourseSchedule[]>([])
  const [sessionCourse, setSessionCourse] = useState<CourseSchedule | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [scanRecords, setScanRecords] = useState<ScanRecord[]>([])
  const [scannerMessage, setScannerMessage] = useState(
    'Buka sesi kelas untuk menampilkan halaman scanner QR.',
  )
  const [activeMetric, setActiveMetric] = useState<LecturerMetric>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const reload = () => {
      void fetchScanRecordsFromBackend().then((backendRecords) => {
        setScanRecords(backendRecords ?? [])
      })
    }
    reload()
    window.addEventListener('storage', reload)
    window.addEventListener(scanRecordsChangedEvent, reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener(scanRecordsChangedEvent, reload)
    }
  }, [])

  useEffect(() => {
    const reload = () => {
      void fetchSchedulesFromBackend().then((backendSchedules) => {
        setSchedules(backendSchedules ?? [])
      })
    }
    reload()
    window.addEventListener('storage', reload)
    window.addEventListener(scheduleChangedEvent, reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener(scheduleChangedEvent, reload)
    }
  }, [])

  const activeStudents = useMemo(
    () =>
      scanRecords.filter(
        (record) =>
          record.status === 'Terverifikasi' || record.status === 'Terlambat',
      ).length,
    [scanRecords],
  )

  const handleOpenCourse = async (course: CourseSchedule) => {
    if (!isSessionWindowOpen(course, now)) {
      setScannerMessage(
        'Sesi hanya bisa dibuka saat jam kelas berlangsung sampai 30 menit setelah kelas selesai.',
      )
      return
    }

    try {
      const sesi = await apiRequest<{ id: string }>('/sesi', {
        method: 'POST',
        body: JSON.stringify({ jadwalId: course.id }),
      });
      setActiveSessionId(sesi.id);
      setSessionCourse(course);
      setScannerMessage(`Sesi ${course.title} aktif. Scanner siap membaca QR.`);
    } catch (err: any) {
      setScannerMessage('Gagal membuka sesi: ' + (err.message || 'Error dari server.'));
    }
  }

  const handleLocalScan = (): LocalScanResult => {
    const payload = loadActiveQrPayload()

    if (!payload) {
      const message = 'Belum ada QR mahasiswa aktif yang bisa dibaca.'
      setScannerMessage(message)
      return {
        success: false,
        title: 'QR belum ditemukan',
        message,
      }
    }

    if (!sessionCourse || payload.courseId !== sessionCourse.id) {
      addScanRecord({
        studentName: payload.studentName,
        studentId: payload.studentId,
        courseTitle: payload.courseTitle,
        method: 'QR Code',
        status: 'Tidak Valid',
      })
      const message = 'QR tidak cocok dengan sesi kelas yang dibuka.'
      setScannerMessage(message)
      return {
        success: false,
        title: 'QR tidak valid',
        message,
        studentName: payload.studentName,
        studentId: payload.studentId,
      }
    }

    if (isQrExpired(payload)) {
      addScanRecord({
        studentName: payload.studentName,
        studentId: payload.studentId,
        courseTitle: payload.courseTitle,
        method: 'QR Code',
        status: 'Kedaluwarsa',
      })
      const message = 'QR sudah kedaluwarsa. Minta mahasiswa tampilkan QR baru.'
      setScannerMessage(message)
      return {
        success: false,
        title: 'QR kedaluwarsa',
        message,
        studentName: payload.studentName,
        studentId: payload.studentId,
      }
    }

    const alreadyRecorded = scanRecords.some(
      (record) =>
        record.studentId === payload.studentId &&
        record.courseTitle === payload.courseTitle &&
        (record.status === 'Terverifikasi' || record.status === 'Terlambat'),
    )

    if (alreadyRecorded) {
      const message = `${payload.studentName} sudah tercatat hadir untuk sesi ini.`
      setScannerMessage(message)
      return {
        success: true,
        title: 'Presensi sudah tercatat',
        message,
        studentName: payload.studentName,
        studentId: payload.studentId,
      }
    }

    addScanRecord({
      studentName: payload.studentName,
      studentId: payload.studentId,
      courseTitle: payload.courseTitle,
      method: 'QR Code',
      status: 'Terverifikasi',
    })
    saveAttendanceNotification(payload.studentId, payload.courseTitle, 'Hadir')
    const message = `${payload.studentName} (${payload.studentId}) berhasil diabsen hadir.`
    setScannerMessage(message)
    return {
      success: true,
      title: 'Presensi berhasil',
      message,
      studentName: payload.studentName,
      studentId: payload.studentId,
    }
  }

  const addScanRecord = (
    record: Omit<ScanRecord, 'id' | 'scannedAt' | 'recordedAt'>,
  ) => {
    const scanTime = new Date()
    const nextRecord: ScanRecord = {
      ...record,
      id: `scan-${scanTime.getTime()}`,
      recordedAt: scanTime.toISOString(),
      scannedAt: scanTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }

    saveStoredScanRecord(nextRecord)
    setScanRecords((records) => [nextRecord, ...records])
  }

  const handleManualMark = (
    student: { studentId: string; studentName: string },
    status: 'Terverifikasi' | 'Terlambat' | 'Tidak Hadir',
  ) => {
    if (!sessionCourse) {
      setScannerMessage('Buka sesi kelas dulu sebelum input manual.')
      return
    }

    addScanRecord({
      studentName: student.studentName,
      studentId: student.studentId,
      courseTitle: sessionCourse.title,
      method: 'Manual',
      status,
    })
    saveAttendanceNotification(
      student.studentId,
      sessionCourse.title,
      status === 'Terverifikasi' ? 'Hadir' : status,
    )
    setScannerMessage(
      `${student.studentName} ditandai ${
        status === 'Terverifikasi' ? 'hadir' : status.toLowerCase()
      } lewat mode manual.`,
    )
  }

  const handleCloseSession = async () => {
    if (activeSessionId) {
      try {
        await apiRequest(`/sesi/${activeSessionId}/tutup`, { method: 'PATCH' });
      } catch (err) {
        console.error(err);
      }
    }
    setScannerMessage('Sesi ditutup. Kamu bisa buka sesi lain sesuai jadwal.')
    setSessionCourse(null)
    setActiveSessionId(null)
  }

  if (activeMetric) {
    return (
      <StatisticsPage
        mode={activeMetric}
        onBack={() => setActiveMetric(null)}
      />
    )
  }

  if (sessionCourse) {
    return (
      <LecturerSessionPage
        course={sessionCourse}
        sessionId={activeSessionId!}
        scannerMessage={scannerMessage}
        scanRecords={scanRecords}
        onBack={() => setSessionCourse(null)}
        onCloseSession={handleCloseSession}
        onLocalScan={handleLocalScan}
        onManualMark={handleManualMark}
      />
    )
  }

  return (
    <DashboardShell
      onLogout={onLogout}
      session={session}
    >
      <div className="space-y-6">
        <section className="grid grid-cols-2 gap-2 sm:gap-4">
          <StatCard
            label="Mahasiswa Hadir"
            value={`${activeStudents}`}
            tone="green"
            icon={<PeopleIcon />}
            onClick={() => setActiveMetric('lecturer-present')}
          />
          <StatCard
            label="Sesi Dibuka"
            value={sessionCourse ? '1' : '0'}
            icon={<CalendarIcon />}
            onClick={() => setActiveMetric('lecturer-session')}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
                  Jadwal Hari Ini
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Kelola Sesi Presensi
                </h2>
              </div>
              <p className="text-sm font-semibold text-slate-500">
                Scanner aktif setelah sesi dibuka
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {schedules.map((course) => {
                const status = getRuntimeStatus(course, now)
                const canOpenSession = isSessionWindowOpen(course, now)

                return (
                  <div
                    key={course.id}
                    className="rounded-[8px] border border-slate-200 bg-white p-5 transition hover:border-[#5c3386]/30"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-slate-950">
                            {course.title}
                          </h3>
                          <StatusBadge status={status} />
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                          {course.time} - {course.room} - {course.students}{' '}
                          Mahasiswa
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenCourse(course)}
                        disabled={!canOpenSession}
                        className={`flex h-11 w-full items-center justify-center rounded-[8px] px-4 text-sm font-black transition sm:w-auto ${
                          canOpenSession
                            ? 'bg-[#5c3386] text-white hover:bg-[#4f2b73]'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {canOpenSession ? 'Buka Sesi' : getRuntimeLabel(status)}
                      </button>
                    </div>
                    <p className="mt-3 rounded-[8px] bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-slate-500">
                      Sesi otomatis tertutup 30 menit setelah jam kelas selesai.
                    </p>
                  </div>
                )
              })}
              {!schedules.length ? (
                <p className="rounded-[8px] bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">
                  Belum ada jadwal dari admin.
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
              Alur Sesi
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              Scanner ada di halaman terpisah
            </h2>
            <div className="mt-5 space-y-3 text-sm font-bold leading-6 text-slate-600">
              <p className="rounded-[8px] bg-[#5c3386]/6 px-4 py-3">
                Tekan Buka Sesi pada jadwal yang tersedia. Setelah itu dosen akan
                masuk ke halaman scanner QR.
              </p>
              <p className="rounded-[8px] bg-slate-50 px-4 py-3">
                Di halaman sesi, dosen bisa scan QR, pakai Mode Manual, atau
                menutup sesi sebelum auto-close.
              </p>
              <p className="rounded-[8px] bg-[#7d2228]/8 px-4 py-3 text-[#7d2228]">
                {scannerMessage}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6">
          <div className="rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/6">
            <h2 className="text-2xl font-black text-slate-950">
              Hasil Scan Terbaru
            </h2>
            <div className="mt-5 space-y-3">
              {scanRecords.length ? (
                scanRecords.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-[8px] border border-slate-200 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-black text-slate-950">
                          {record.studentName}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {record.studentId} - {record.courseTitle}
                        </p>
                      </div>
                      <StatusPill status={record.status} />
                    </div>
                    <p className="mt-2 text-sm font-bold text-slate-400">
                      {record.scannedAt}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-[8px] bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">
                  Belum ada hasil scan.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

type StatusPillProps = {
  status: ScanRecord['status']
}

function StatusPill({ status }: StatusPillProps) {
  const tone = getStatusPillTone(status)
  const label = status === 'Terverifikasi' ? 'Hadir' : status

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}>
      {label}
    </span>
  )
}

const getStatusPillTone = (status: ScanRecord['status']) => {
  if (status === 'Terverifikasi') {
    return 'bg-emerald-100 text-emerald-700'
  }

  if (status === 'Terlambat' || status === 'Kedaluwarsa') {
    return 'bg-amber-100 text-amber-700'
  }

  return 'bg-[#7d2228]/10 text-[#7d2228]'
}

type StatusBadgeProps = {
  status: RuntimeStatus
}

function StatusBadge({ status }: StatusBadgeProps) {
  const tone =
    status === 'active'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'upcoming'
        ? 'bg-slate-100 text-slate-500'
        : 'bg-[#7d2228]/10 text-[#7d2228]'

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}>
      {getRuntimeLabel(status)}
    </span>
  )
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        d="M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}
