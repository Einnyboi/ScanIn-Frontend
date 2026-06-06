import {
  CalendarDays,
  Clock,
  Bell,
  Menu,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState
} from 'react'

import type { CorrectionTicket, CourseSchedule } from '../types/attendance'
import type { LocalSession } from '../types/auth'
import {
  buildAdminAnalytics,
  formatAdminDate,
  formatAdminTime
} from '../utils/adminDashboard'
import {
  fetchAdminUsersFromBackend,
  saveAdminUsers,
  type AdminUser
} from '../utils/adminUsers'
import {
  fetchScanRecordsFromBackend,
  loadStoredScanRecords,
  scanRecordsChangedEvent,
} from '../utils/attendanceStorage'
import {
  fetchSupportComplaintsFromBackend,
  loadSupportComplaints,
  supportComplaintsChangedEvent,
  type SupportComplaint,
} from '../utils/complaints'
import { isPasswordResetActionable } from '../utils/adminDashboard'
import {
  createGeneratedReport,
  fetchReportsFromBackend,
  loadGeneratedReports,
  reportsChangedEvent,
  saveGeneratedReports,
  type GeneratedReport,
  type ReportKind
} from '../utils/reports'
import {
  fetchSchedulesFromBackend,
  loadSchedules,
  saveSchedules,
  scheduleChangedEvent
} from '../utils/schedules'
import {
  fetchTicketsFromBackend,
  ticketsChangedEvent,
  updateStoredTicket,
} from '../utils/tickets'
import { AttendanceView } from './admin-dashboard/AttendanceView'
import { DashboardView } from './admin-dashboard/DashboardView'
import { NotificationsView } from './admin-dashboard/NotificationsView'
import { ReportsView } from './admin-dashboard/ReportsView'
import { ScheduleView } from './admin-dashboard/ScheduleView'
import { TicketsView } from './admin-dashboard/TicketsView'
import { UsersView } from './admin-dashboard/UsersView'
import { AdminSidebar, AdminNoticeBanner } from './admin-dashboard/shared'
import {
  fetchPasswordResetSmtpStatus,
  fetchPasswordResetRequestsFromBackend,
  loadPasswordResetRequests,
  markPasswordResetAsSent,
  passwordResetChangedEvent,
  type PasswordResetRequest,
} from '../utils/passwordReset'

type AdminDashboardProps = {
  session: LocalSession
  onLogout: () => void
}

type AdminView =
  | 'dashboard'
  | 'users'
  | 'schedule'
  | 'attendance'
  | 'reports'
  | 'tickets'
  | 'notifications'

type AdminNotice = {
  message: string
  tone: 'danger' | 'success' | 'warning'
}

const pageMeta: Record<
  AdminView,
  { breadcrumb: string; title: string; subtitle: string }
> = {
  dashboard: {
    breadcrumb: 'Dashboard',
    title: 'Dashboard',
    subtitle: 'Ringkasan sistem presensi FTI UNTAR',
  },
  users: {
    breadcrumb: 'Pengguna',
    title: 'Manajemen Pengguna',
    subtitle: 'Kelola data mahasiswa, pengajar, dan admin',
  },
  schedule: {
    breadcrumb: 'Jadwal',
    title: 'Manajemen Jadwal',
    subtitle: 'Kelola jadwal perkuliahan',
  },
  attendance: {
    breadcrumb: 'Presensi',
    title: 'Data Presensi',
    subtitle: 'Lihat dan kelola data kehadiran mahasiswa',
  },
  reports: {
    breadcrumb: 'Laporan',
    title: 'Laporan & Analitik',
    subtitle: 'Statistik dan laporan sistem presensi',
  },
  tickets: {
    breadcrumb: 'Tiket',
    title: 'Manajemen Tiket',
    subtitle: 'Kelola permohonan koreksi kehadiran mahasiswa',
  },
  notifications: {
    breadcrumb: 'Notifikasi',
    title: 'Pusat Notifikasi',
    subtitle: 'Pantau tiket, permintaan reset password, dan pengaduan akun',
  },
}

export default function AdminDashboard({
  session,
  onLogout,
}: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<AdminView>('dashboard')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [schedules, setSchedules] = useState<CourseSchedule[]>(() =>
    loadSchedules(),
  )
  const [tickets, setTickets] = useState<CorrectionTicket[]>(() =>
    [],
  )
  const [reports, setReports] = useState<GeneratedReport[]>(() =>
    loadGeneratedReports(),
  )
  const [complaints, setComplaints] = useState<SupportComplaint[]>(() =>
    loadSupportComplaints(),
  )
  const [passwordRequests, setPasswordRequests] = useState<
    PasswordResetRequest[]
  >(() => loadPasswordResetRequests())
  const [scanRecords, setScanRecords] = useState(() => loadStoredScanRecords())
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [adminNotice, setAdminNotice] = useState<AdminNotice | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const analytics = useMemo(
    () => buildAdminAnalytics(scanRecords, schedules, currentTime),
    [currentTime, scanRecords, schedules],
  )

  const meta = pageMeta[activeView]
  const adminNotificationCount =
    tickets.filter((ticket) => ticket.status === 'Menunggu').length +
    passwordRequests.filter(isPasswordResetActionable).length +
    complaints.filter((complaint) => complaint.status === 'Baru').length

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [activeView])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = ''
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    void fetchAdminUsersFromBackend().then((backendUsers) => {
      if (backendUsers) {
        setUsers(backendUsers)
      }
    })
  }, [])

  useEffect(() => {
    const reload = () => setSchedules(loadSchedules())

    void fetchSchedulesFromBackend().then((backendSchedules) => {
      if (backendSchedules) {
        setSchedules(backendSchedules)
      }
    })

    window.addEventListener('storage', reload)
    window.addEventListener(scheduleChangedEvent, reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener(scheduleChangedEvent, reload)
    }
  }, [])

  useEffect(() => {
    const reload = () => {
      void fetchTicketsFromBackend([]).then((backendTickets) => {
        if (backendTickets) {
          setTickets(backendTickets)
        }
      })
    }

    reload()

    window.addEventListener('storage', reload)
    window.addEventListener(ticketsChangedEvent, reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener(ticketsChangedEvent, reload)
    }
  }, [])

  useEffect(() => {
    const reload = () => setReports(loadGeneratedReports())

    void fetchReportsFromBackend().then((backendReports) => {
      if (backendReports) {
        setReports(backendReports)
      }
    })

    window.addEventListener('storage', reload)
    window.addEventListener(reportsChangedEvent, reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener(reportsChangedEvent, reload)
    }
  }, [])

  useEffect(() => {
    const reload = () => setComplaints(loadSupportComplaints())

    void fetchSupportComplaintsFromBackend().then((backendComplaints) => {
      if (backendComplaints) {
        setComplaints(backendComplaints)
      }
    })

    window.addEventListener('storage', reload)
    window.addEventListener(supportComplaintsChangedEvent, reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener(supportComplaintsChangedEvent, reload)
    }
  }, [])

  useEffect(() => {
    const reload = () => setPasswordRequests(loadPasswordResetRequests())

    void fetchPasswordResetRequestsFromBackend().then((backendRequests) => {
      if (backendRequests) {
        setPasswordRequests(backendRequests)
      }
    })

    window.addEventListener('storage', reload)
    window.addEventListener(passwordResetChangedEvent, reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener(passwordResetChangedEvent, reload)
    }
  }, [])

  useEffect(() => {
    const reload = () => setScanRecords(loadStoredScanRecords())

    void fetchScanRecordsFromBackend().then((backendRecords) => {
      if (backendRecords) {
        setScanRecords(backendRecords)
      }
    })

    window.addEventListener('storage', reload)
    window.addEventListener(scanRecordsChangedEvent, reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener(scanRecordsChangedEvent, reload)
    }
  }, [])

  const handleUsersChange = async (nextUsers: AdminUser[], sync = true) => {
    if (sync) {
      // This path is no longer recommended, but kept for safety.
      const backendUsers = await saveAdminUsers(nextUsers)
      setUsers(backendUsers)
    } else {
      setUsers(nextUsers)
    }
  }

  const handleSchedulesChange = (nextSchedules: CourseSchedule[], sync = true) => {
    setSchedules(nextSchedules)
    if (sync) {
      saveSchedules(nextSchedules)
    }
  }

  const handleTicketAction = async (
    ticketId: string,
    status: CorrectionTicket['status'],
  ) => {
    const selectedTicket = tickets.find((ticket) => ticket.id === ticketId)
    if (!selectedTicket) return

    const updatedTicket = { ...selectedTicket, status }

    try {
      const savedTicket = await updateStoredTicket(updatedTicket)
      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === savedTicket.id ? savedTicket : ticket,
        ),
      )
    } catch {
      setAdminNotice({
        tone: 'danger',
        message: 'Gagal memperbarui tiket ke backend. Coba lagi.',
      })
    }
  }

  const handleGenerateReport = (kind: ReportKind = 'attendance') => {
    const nextReport = createGeneratedReport(kind)
    const nextReports = [nextReport, ...reports]
    setReports(nextReports)
    saveGeneratedReports(nextReports)
  }

  const handleSendReset = async (requestId: string) => {
    const nextRequests = await markPasswordResetAsSent(requestId)
    const request = nextRequests.find((item) => item.id === requestId)

    setPasswordRequests(nextRequests)

    if (!request) {
      setAdminNotice({
        tone: 'danger',
        message: 'Permintaan reset tidak ditemukan. Coba muat ulang data admin.',
      })
      return
    }

    if (request.emailStatus === 'SENT') {
      setAdminNotice({
        tone: 'success',
        message: `Kode OTP reset berhasil dikirim ke ${request.registeredEmail}.`,
      })
      return
    }

    if (request.emailStatus === 'SMTP_NOT_CONFIGURED') {
      const smtpStatus = await fetchPasswordResetSmtpStatus().catch(() => null)
      const missingConfig = smtpStatus?.missing?.length
        ? ` Lengkapi ${smtpStatus.missing.join(', ')} di file .env backend, lalu restart backend.`
        : ''

      setAdminNotice({
        tone: 'warning',
        message:
          request.resetUrl ? `SMTP belum aktif. Namun link reset berhasil dibuat: ${request.resetUrl}.${missingConfig}` : `Permintaan tercatat, tapi SMTP backend belum dikonfigurasi jadi email asli belum terkirim.${missingConfig}`,
      })
      return
    }

    setAdminNotice({
      tone: 'danger',
      message:
        request.emailError
          ? `Backend gagal mengirim email reset: ${request.emailError}`
          : 'Backend gagal mengirim email reset. Cek konfigurasi SMTP dan koneksi email.',
    })
  }

  return (
    <div className="admin-shell min-h-screen bg-[#f5f6fa] text-slate-950 md:grid md:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
      <AdminSidebar
        activeView={activeView}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onLogout={onLogout}
        onViewChange={setActiveView}
        session={session}
      />

      <main className="min-w-0">
        <div className="z-20 border-b border-slate-200/80 bg-white/95 px-5 py-3 backdrop-blur sm:px-7 md:sticky md:top-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-[#5c3386] shadow-sm shadow-slate-900/5 transition hover:border-[#5c3386]/40 hover:bg-[#f4eff9] md:hidden"
                aria-label="Buka menu admin"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <nav
                className="flex min-w-0 items-center gap-2 text-sm font-black text-slate-400 sm:gap-3"
                aria-label="Breadcrumb admin"
              >
                <span className="hidden h-9 w-32 items-center sm:flex">
                  <img
                    src="/logo-fti.png"
                    alt="Logo FTI UNTAR"
                    className="max-h-full w-full object-contain"
                  />
                </span>
                <span className="shrink-0 text-slate-500">Admin</span>
                <span className="min-w-0 truncate text-[#5c3386]">
                  {meta.breadcrumb}
                </span>
              </nav>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div
                className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-600 sm:min-w-fit sm:gap-2"
                aria-label={`${formatAdminDate(currentTime)} ${formatAdminTime(currentTime)}`}
              >
                <CalendarDays
                  className="hidden h-4 w-4 text-[#5c3386] sm:block"
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">
                  {formatAdminDate(currentTime)}
                </span>
                <Clock className="h-4 w-4 text-[#7d2228]" aria-hidden="true" />
                <span className="tabular-nums">{formatAdminTime(currentTime)}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('notifications')}
                className="relative flex h-11 w-11 items-center justify-center rounded-[8px] border border-slate-200 bg-white px-0 text-sm font-black text-slate-600 transition hover:border-[#5c3386]/40 hover:text-[#5c3386] sm:w-auto sm:px-3"
                aria-label={`${adminNotificationCount} notifikasi admin`}
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                <span className="ml-2 hidden sm:inline">Notifikasi</span>
                {adminNotificationCount ? (
                  <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#7d2228] px-1.5 text-[11px] font-black text-white">
                    {adminNotificationCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 pb-20 sm:px-7 lg:px-8 xl:px-10">
          {adminNotice ? (
            <AdminNoticeBanner
              notice={adminNotice}
              onClose={() => setAdminNotice(null)}
            />
          ) : null}

          <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {meta.title}
              </h1>
              <p className="mt-2 text-base font-semibold text-slate-500">
                {meta.subtitle}
              </p>
            </div>
          </header>

          <div className="mt-6">
            {activeView === 'dashboard' ? (
              <DashboardView
                analytics={analytics}
                onSendReset={handleSendReset}
                passwordRequests={passwordRequests}
                schedules={schedules}
                scanRecordsCount={scanRecords.length}
                tickets={tickets}
                users={users}
              />
            ) : null}
            {activeView === 'users' ? (
              <UsersView users={users} onUsersChange={handleUsersChange} />
            ) : null}
            {activeView === 'schedule' ? (
              <ScheduleView
                schedules={schedules}
                users={users}
                onSchedulesChange={handleSchedulesChange}
              />
            ) : null}
            {activeView === 'attendance' ? (
              <AttendanceView scanRecords={scanRecords} />
            ) : null}
            {activeView === 'reports' ? (
              <ReportsView
                analytics={analytics}
                onGenerateReport={handleGenerateReport}
                reports={reports}
              />
            ) : null}
            {activeView === 'tickets' ? (
              <TicketsView tickets={tickets} onTicketAction={handleTicketAction} />
            ) : null}
            {activeView === 'notifications' ? (
              <NotificationsView
                complaints={complaints}
                onSendReset={handleSendReset}
                onTicketAction={handleTicketAction}
                passwordRequests={passwordRequests}
                tickets={tickets}
              />
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
