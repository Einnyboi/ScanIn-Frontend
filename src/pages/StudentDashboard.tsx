import { useEffect, useMemo, useState } from 'react'

import { DashboardShell } from '../components/dashboard/DashboardShell'
import { QrCodeCard } from '../components/dashboard/QrCodeCard'
import { StatCard } from '../components/dashboard/StatCard'
import { attendanceHistory, correctionTickets } from '../data/mockAttendance'
import {
  type StatisticsMode,
  StatisticsPage,
} from './StatisticsPage'
import type { CourseSchedule, QrPayload } from '../types/attendance'
import type { LocalSession } from '../types/auth'
import {
  type StudentNotification,
  loadStudentNotifications,
  markStudentNotificationsRead,
} from '../utils/notifications'
import { createQrPayload, saveActiveQrPayload } from '../utils/qr'
import {
  getRuntimeLabel,
  getRuntimeStatus,
  isCourseActiveNow,
  type RuntimeStatus,
} from '../utils/schedule'
import {
  fetchSchedulesFromBackend,
  loadSchedules,
  scheduleChangedEvent,
} from '../utils/schedules'
import {
  loadCorrectionTickets,
  saveCorrectionTicket,
} from '../utils/tickets'

type StudentDashboardProps = {
  session: LocalSession
  onLogout: () => void
}

type StudentMetric =
  | Extract<
      StatisticsMode,
      'student-attendance' | 'student-late' | 'student-ticket'
    >
  | null

export function StudentDashboard({ session, onLogout }: StudentDashboardProps) {
  const [now, setNow] = useState(() => new Date())
  const [schedules, setSchedules] = useState<CourseSchedule[]>(() =>
    loadSchedules(),
  )
  const activeCourse = schedules.find((course) =>
    isCourseActiveNow(course, now),
  )
  const [selectedCourse, setSelectedCourse] = useState<CourseSchedule>(
    activeCourse ?? schedules[0],
  )
  const [payload, setPayload] = useState<QrPayload | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(15)
  const [isQrVisible, setIsQrVisible] = useState(false)
  const [isTicketOpen, setIsTicketOpen] = useState(false)
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const [ticketReason, setTicketReason] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')
  const [studentTickets, setStudentTickets] = useState(() =>
    loadCorrectionTickets(correctionTickets).filter(
      (ticket) => ticket.studentId === session.identity,
    ),
  )
  const [activeMetric, setActiveMetric] = useState<StudentMetric>(null)
  const [notifications, setNotifications] = useState<StudentNotification[]>(() =>
    loadStudentNotifications(session.identity),
  )

  const selectedStatus = getRuntimeStatus(selectedCourse, now)
  const canShowQr = selectedStatus === 'active'

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const applySchedules = (nextSchedules: CourseSchedule[]) => {
      setSchedules(nextSchedules)
      setSelectedCourse((currentCourse) => {
        const matchingCourse = nextSchedules.find(
          (course) => course.id === currentCourse.id,
        )

        return matchingCourse ?? nextSchedules[0] ?? currentCourse
      })
    }
    const reloadSchedules = () => applySchedules(loadSchedules())

    void fetchSchedulesFromBackend().then((backendSchedules) => {
      if (backendSchedules) {
        applySchedules(backendSchedules)
      }
    })

    window.addEventListener('storage', reloadSchedules)
    window.addEventListener(scheduleChangedEvent, reloadSchedules)
    return () => {
      window.removeEventListener('storage', reloadSchedules)
      window.removeEventListener(scheduleChangedEvent, reloadSchedules)
    }
  }, [])

  useEffect(() => {
    const reloadNotifications = () =>
      setNotifications(loadStudentNotifications(session.identity))

    reloadNotifications()
    window.addEventListener('storage', reloadNotifications)
    return () => window.removeEventListener('storage', reloadNotifications)
  }, [session.identity])

  useEffect(() => {
    if (!isQrVisible || !canShowQr) {
      return
    }

    const refreshPayload = () => {
      const nextPayload = createPayload(session, selectedCourse)
      setPayload(nextPayload)
      saveActiveQrPayload(nextPayload)
      setSecondsLeft(15)
    }

    refreshPayload()
    const payloadTimer = window.setInterval(refreshPayload, 15_000)
    const countdownTimer = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 1 ? 15 : current - 1))
    }, 1_000)

    return () => {
      window.clearInterval(payloadTimer)
      window.clearInterval(countdownTimer)
    }
  }, [canShowQr, isQrVisible, selectedCourse, session])

  const attendanceRate = useMemo(() => {
    const present = attendanceHistory.filter((item) => item.status === 'Hadir').length
    return Math.round((present / attendanceHistory.length) * 100)
  }, [])

  const lateCount = attendanceHistory.filter((item) => item.status === 'Terlambat')
    .length
  const activeTicketCount = studentTickets.filter(
    (ticket) => ticket.status === 'Menunggu',
  ).length
  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length

  const handleSubmitTicket = () => {
    if (!ticketReason.trim()) {
      setTicketMessage('Isi alasan koreksi dulu ya.')
      return
    }

    const newTicket = {
      id: `ticket-${session.identity}-${Date.now()}`,
      studentName: session.name,
      studentId: session.identity,
      courseTitle: selectedCourse.title,
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      reason: ticketReason.trim(),
      status: 'Menunggu' as const,
    }

    saveCorrectionTicket(newTicket)
    setStudentTickets((currentTickets) => [newTicket, ...currentTickets])
    setTicketMessage(
      'Tiket koreksi tersimpan dan sudah masuk ke panel pengajar serta admin.',
    )
    setTicketReason('')
  }

  const handleMarkNotificationsRead = () => {
    markStudentNotificationsRead(session.identity)
    setNotifications(loadStudentNotifications(session.identity))
  }

  const handleOpenQrPage = () => {
    if (!canShowQr) {
      return
    }

    const nextPayload = createPayload(session, selectedCourse)
    setPayload(nextPayload)
    saveActiveQrPayload(nextPayload)
    setSecondsLeft(15)
    setIsQrVisible(true)
  }

  const handleNotificationShortcut = () => {
    setIsNotificationPanelOpen(true)
    window.setTimeout(() => {
      const notificationPanel = document.getElementById('student-notifications')

      if (notificationPanel) {
        notificationPanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
        notificationPanel.focus({ preventScroll: true })
      }
    }, 0)
  }

  if (activeMetric) {
    return (
      <StatisticsPage
        mode={activeMetric}
        onBack={() => setActiveMetric(null)}
      />
    )
  }

  if (isQrVisible) {
    return (
      <StudentQrPage
        canShowQr={canShowQr}
        course={selectedCourse}
        onBack={() => {
          setIsQrVisible(false)
          setPayload(null)
          setSecondsLeft(15)
        }}
        payload={payload}
        secondsLeft={secondsLeft}
        selectedStatus={selectedStatus}
        session={session}
      />
    )
  }

  return (
    <DashboardShell
      notificationCount={unreadNotificationCount}
      notificationLabel="Notifikasi"
      onLogout={onLogout}
      onNotificationClick={handleNotificationShortcut}
      session={session}
    >
      <div className="space-y-6">
        {notifications.length || isNotificationPanelOpen ? (
          <section
            id="student-notifications"
            tabIndex={-1}
            className="rounded-[8px] border border-[#5c3386]/15 bg-white p-5 shadow-lg shadow-slate-900/6 outline-none focus:ring-4 focus:ring-[#5c3386]/12"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
                  Notifikasi
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Update dari pengajar
                </h2>
              </div>
              {unreadNotificationCount ? (
                <button
                  type="button"
                  onClick={handleMarkNotificationsRead}
                  className="flex h-10 items-center justify-center rounded-[8px] border border-[#5c3386] px-4 text-sm font-black text-[#5c3386] transition hover:bg-[#5c3386] hover:text-white"
                >
                  Tandai dibaca
                </button>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3">
              {notifications.length ? (
                notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-[8px] border px-4 py-3 ${
                      notification.isRead
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-[#5c3386]/20 bg-[#5c3386]/6'
                    }`}
                  >
                    <p className="font-black text-slate-900">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                      {notification.message}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-[8px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">
                  Belum ada notifikasi baru dari pengajar.
                </p>
              )}
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Kehadiran"
            value={`${attendanceRate}%`}
            icon={<CircleIcon />}
            onClick={() => setActiveMetric('student-attendance')}
          />
          <StatCard
            label="Terlambat"
            value={`${lateCount}x`}
            tone="yellow"
            icon={<ClockIcon />}
            onClick={() => setActiveMetric('student-late')}
          />
          <StatCard
            label="Tiket Aktif"
            value={`${activeTicketCount}`}
            tone="red"
            icon={<TicketIcon />}
            onClick={() => setActiveMetric('student-ticket')}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
                  Jadwal Hari Ini
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Pilih kelas untuk presensi
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsTicketOpen((current) => !current)}
                className="flex h-11 items-center justify-center rounded-[8px] border border-[#5c3386] bg-white px-4 text-sm font-black text-[#5c3386] transition hover:bg-[#5c3386] hover:text-white"
              >
                Ajukan Tiket
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {schedules.map((course) => {
                const status = getRuntimeStatus(course, now)
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => {
                      setSelectedCourse(course)
                      setTicketMessage('')
                      setIsQrVisible(false)
                      setPayload(null)
                      setSecondsLeft(15)
                    }}
                    className={`w-full rounded-[8px] border p-4 text-left transition ${
                      selectedCourse.id === course.id
                        ? 'border-[#5c3386] bg-[#5c3386]/5 shadow-lg shadow-[#5c3386]/10'
                        : 'border-slate-200 bg-white hover:border-[#5c3386]/30'
                    }`}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-slate-950">
                            {course.title}
                          </h3>
                          <StatusBadge status={status} />
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                          {course.time} - {course.room} - {course.lecturer}
                        </p>
                      </div>
                      <span className="text-sm font-black text-[#5c3386]">
                        {status === 'active'
                          ? 'Bisa tampilkan QR'
                          : getRuntimeLabel(status)}
                      </span>
                    </div>
                  </button>
                )
              })}
              {!schedules.length ? (
                <p className="rounded-[8px] bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">
                  Belum ada jadwal dari admin.
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
                Presensi QR
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">
                {selectedCourse.title}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                QR hanya bisa ditampilkan saat jam kelas sedang berlangsung.
              </p>

              <button
                type="button"
                onClick={handleOpenQrPage}
                disabled={!canShowQr}
                className={`mt-5 flex h-12 w-full items-center justify-center rounded-[8px] px-4 text-sm font-black transition ${
                  canShowQr
                    ? 'bg-[#5c3386] text-white hover:bg-[#4f2b73]'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {canShowQr ? 'Buka Halaman QR Presensi' : 'QR belum tersedia'}
              </button>

              {!canShowQr ? (
                <p className="mt-3 rounded-[8px] bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-slate-500">
                  Status kelas: {getRuntimeLabel(selectedStatus)}. QR akan aktif
                  sesuai jadwal {selectedCourse.time}.
                </p>
              ) : null}
            </div>

            {isTicketOpen ? (
              <div className="rounded-[8px] border border-[#7d2228]/14 bg-white p-5 shadow-lg shadow-slate-900/6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
                  Koreksi Presensi
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-950">
                  Ajukan tiket untuk {selectedCourse.title}
                </h3>
                <textarea
                  value={ticketReason}
                  onChange={(event) => setTicketReason(event.target.value)}
                  placeholder="Contoh: QR tidak bisa discan karena kamera perangkat pengajar bermasalah."
                  className="mt-4 min-h-28 w-full resize-none rounded-[8px] border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
                />
                {ticketMessage ? (
                  <p className="mt-3 rounded-[8px] bg-[#5c3386]/8 px-4 py-3 text-sm font-bold text-[#5c3386]">
                    {ticketMessage}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={handleSubmitTicket}
                  className="mt-4 flex h-11 w-full items-center justify-center rounded-[8px] bg-[#5c3386] px-4 text-sm font-black text-white transition hover:bg-[#4f2b73]"
                >
                  Simpan Tiket Lokal
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
                Riwayat
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Riwayat Presensi
              </h2>
            </div>
            <p className="text-sm font-semibold text-slate-500">
              Data sementara untuk demo UI
            </p>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {attendanceHistory.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-lg font-black text-slate-950">
                    {item.courseTitle}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {item.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500">
                    {item.time}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-black ${
                      item.status === 'Terlambat'
                        ? 'bg-[#7d2228]/10 text-[#7d2228]'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

function StudentQrPage({
  canShowQr,
  course,
  onBack,
  payload,
  secondsLeft,
  selectedStatus,
  session,
}: {
  canShowQr: boolean
  course: CourseSchedule
  onBack: () => void
  payload: QrPayload | null
  secondsLeft: number
  selectedStatus: RuntimeStatus
  session: LocalSession
}) {
  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-3 text-sm font-black text-slate-600 transition hover:text-[#5c3386]"
            >
              <span aria-hidden="true" className="text-2xl leading-none">
                &larr;
              </span>
              Kembali ke Dashboard
            </button>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              QR Presensi
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {session.name} - {session.identity}
            </p>
          </div>

          <div className="rounded-[8px] border border-[#5c3386]/15 bg-[#5c3386]/8 px-4 py-3 text-sm font-black text-[#5c3386]">
            Token berubah tiap 15 detik
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-6 lg:py-8">
        <section className="mb-5 rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
            Sesi Aktif
          </p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                {course.title}
              </h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {course.time} - {course.room} - {course.lecturer}
              </p>
            </div>
            <StatusBadge status={selectedStatus} />
          </div>
        </section>

        {canShowQr && payload ? (
          <QrCodeCard payload={payload} secondsLeft={secondsLeft} />
        ) : (
          <section className="rounded-[8px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-lg shadow-slate-900/6">
            <h2 className="text-2xl font-black text-slate-950">
              QR belum tersedia
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              QR hanya tampil saat jadwal kelas sedang aktif. Status kelas saat
              ini: {getRuntimeLabel(selectedStatus)}.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-[8px] bg-[#5c3386] px-5 text-sm font-black text-white transition hover:bg-[#4f2b73]"
            >
              Pilih Jadwal Lain
            </button>
          </section>
        )}
      </div>
    </main>
  )
}

const createPayload = (session: LocalSession, course: CourseSchedule) =>
  createQrPayload({
    courseId: course.id,
    courseTitle: course.title,
    room: course.room,
    studentName: session.name,
    studentId: session.identity,
  })

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

function CircleIcon() {
  return <span className="h-6 w-6 rounded-full bg-current" />
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        d="M12 6v6l4 2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6V7Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}
