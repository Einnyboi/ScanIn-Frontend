import {
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Ticket as TicketIcon,
  Users,
  type LucideIcon
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState
} from 'react'

import type { CorrectionTicket, CourseSchedule } from '../types/attendance'
import type { LocalSession } from '../types/auth'
import { buildAdminAnalytics } from '../utils/adminDashboard'
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
import {
  fetchPasswordResetRequestsFromBackend,
  loadPasswordResetRequests,
  markPasswordResetAsSent,
  passwordResetChangedEvent,
  type PasswordResetRequest,
} from '../utils/passwordReset'
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

type DeleteConfirmation = {
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void | Promise<void>
}

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

  const handleSchedulesChange = (nextSchedules: CourseSchedule[]) => {
    setSchedules(nextSchedules)
    saveSchedules(nextSchedules)
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
          request.resetUrl ? `SMTP belum aktif. Namun link reset berhasil dibuat: ${request.resetUrl} (Silakan copy dan bagikan manual ke pengguna)` : 'Permintaan tercatat, tapi SMTP backend belum dikonfigurasi jadi email asli belum terkirim.',
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
        onLogout={onLogout}
        onViewChange={setActiveView}
        session={session}
      />

      <main className="min-w-0">
        <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 px-5 py-3 backdrop-blur sm:px-7">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <nav className="flex items-center gap-3 text-sm font-black text-slate-400" aria-label="Breadcrumb admin">
              <span className="flex h-9 w-32 items-center"><img src="/logo-fti.png" alt="Logo FTI UNTAR" className="max-h-full w-full object-contain" /></span>
              <span>Admin</span>
              <span className="text-[#5c3386]">{meta.breadcrumb}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
              complaints={complaints}
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

function AdminSidebar({
  activeView,
  onLogout,
  onViewChange,
  session,
}: {
  activeView: AdminView
  onLogout: () => void
  onViewChange: (view: AdminView) => void
  session: LocalSession
}) {
  return (
    <aside className="admin-sidebar z-30 flex flex-col bg-[#573485] text-white shadow-xl shadow-[#28183d]/15 md:sticky md:top-0 md:h-screen md:max-h-screen md:overflow-hidden">
      <div className="shrink-0 border-b border-white/14 px-4 py-4 md:px-5 md:py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white/14 text-base font-black tracking-tight text-white shadow-lg shadow-[#2b1844]/20 ring-1 ring-white/10 md:h-12 md:w-12 md:text-lg">
              FTI
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-black leading-none tracking-tight text-white md:text-[1.55rem]">
                FTI UNTAR
              </p>
              <p className="mt-1 text-sm font-semibold text-white/65">
                Admin Portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-white/20 px-0 text-sm font-black text-white transition hover:bg-white/10 md:hidden"
            aria-label="Keluar"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Keluar</span>
          </button>
        </div>
      </div>

      <div className="hidden shrink-0 border-b border-white/14 px-5 py-5 md:block">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#7d2228] text-white shadow-xl shadow-[#321a4c]/25">
            <Shield className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl font-black text-white">
              {session.name}
            </p>
            <p className="mt-1 text-base font-semibold text-white/55">
              ID: {session.identity}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-4 py-3 md:min-h-0 md:flex-1 md:flex-col md:overflow-hidden md:px-4 md:py-5">
        <p className="hidden px-3 pb-2 text-xs font-black uppercase tracking-[0.14em] text-white/42 md:block">
          Menu Utama
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={`relative flex h-11 shrink-0 items-center justify-start gap-2 rounded-[8px] px-3 text-left text-sm font-black transition md:h-11 md:w-full md:gap-3 md:px-4 md:text-base ${
                isActive
                  ? 'bg-white/14 text-white shadow-lg shadow-[#321a4c]/20'
                  : 'text-white/64 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
              {isActive ? (
                <span className="absolute right-3 h-2 w-2 rounded-full bg-white/70 md:right-5 md:h-2.5 md:w-2.5" />
              ) : null}
            </button>
          )
        })}
      </nav>

      <div className="hidden shrink-0 border-t border-white/14 p-4 md:block">
        <button
          type="button"
          onClick={onLogout}
          className="flex h-11 w-full items-center gap-3 rounded-[8px] px-4 text-left text-base font-black text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}

function AdminNoticeBanner({
  notice,
  onClose,
}: {
  notice: AdminNotice
  onClose: () => void
}) {
  const toneClass =
    notice.tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : notice.tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-[#8a5b00]'
        : 'border-red-200 bg-red-50 text-red-700'

  return (
    <div
      className={`mb-5 flex flex-col gap-3 rounded-[8px] border px-4 py-3 text-sm font-bold leading-6 shadow-sm sm:flex-row sm:items-center sm:justify-between ${toneClass}`}
    >
      <span>{notice.message}</span>
      <button
        type="button"
        onClick={onClose}
        className="self-start rounded-[8px] px-2 py-1 text-xs font-black transition hover:bg-white/60 sm:self-auto"
      >
        Tutup
      </button>
    </div>
  )
}

function DashboardView({
  analytics,
  complaints,
  onSendReset,
  passwordRequests,
  schedules,
  scanRecordsCount,
  tickets,
  users,
}: {
  analytics: AdminAnalytics
  complaints: SupportComplaint[]
  onSendReset: (requestId: string) => void | Promise<void>
  passwordRequests: PasswordResetRequest[]
  schedules: CourseSchedule[]
  scanRecordsCount: number
  tickets: CorrectionTicket[]
  users: AdminUser[]
}) {
  const studentCount = users.filter((user) => user.role === 'Mahasiswa').length
  const activeSessions = schedules.filter((schedule) => schedule.status === 'active')
  const pendingTickets = tickets.filter((ticket) => ticket.status === 'Menunggu')
  const pendingResets = passwordRequests.filter(isPasswordResetActionable)

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard icon={Users} label="Total Mahasiswa" value={studentCount} />
        <AdminStatCard
          icon={Radio}
          label="Sesi Aktif"
          tone="green"
          value={activeSessions.length}
        />
        <AdminStatCard
          icon={TicketIcon}
          label="Tiket Masuk"
          tone="red"
          value={pendingTickets.length}
        />
        <AdminStatCard
          icon={TrendingUp}
          label="Rata-rata Hadir"
          tone="blue"
          value="84%"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <AdminCard title="Tren Kehadiran Bulanan">
          <AdminChartFrame>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={analytics.monthlyAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  dataKey="percentage"
                  name="Persentase (%)"
                  stroke={purple}
                  strokeWidth={3}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </AdminChartFrame>
        </AdminCard>

        <AdminCard title="Sesi Per Hari (Minggu Ini)">
          <AdminChartFrame>
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={analytics.sessionsPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sessions" fill={purple} name="Jumlah Sesi" />
              </BarChart>
            </ResponsiveContainer>
          </AdminChartFrame>
        </AdminCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <AdminCard title="Aktivitas Backend">
          <div className="grid gap-3">
            <ActivityTile label="Scan tersimpan" value={scanRecordsCount} />
            <ActivityTile label="Tiket koreksi" value={pendingTickets.length} />
            <ActivityTile label="Reset password" value={pendingResets.length} />
            <ActivityTile label="Pengaduan akun" value={complaints.length} />
          </div>
        </AdminCard>

        <AdminCard title="Reset Password">
          <div className="space-y-3">
            {passwordRequests.slice(0, 3).map((request) => (
              <PasswordResetItem
                key={request.id}
                onSend={() => onSendReset(request.id)}
                request={request}
              />
            ))}
            {!passwordRequests.length ? (
              <EmptyState text="Belum ada permintaan reset password." />
            ) : null}
          </div>
        </AdminCard>

        <AdminCard title="Tiket Koreksi">
          <div className="space-y-3">
            {pendingTickets.slice(0, 3).map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-[8px] border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-black text-slate-950">{ticket.studentName}</p>
                  <span className="rounded-full bg-[#5c3386]/10 px-3 py-1 text-xs font-black text-[#5c3386]">
                    {ticket.status}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  NIM: {ticket.studentId} - {ticket.courseTitle} - {ticket.date}
                </p>
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">
                  {ticket.reason}
                </p>
              </div>
            ))}
            {!pendingTickets.length ? <EmptyState text="Belum ada tiket." /> : null}
          </div>
        </AdminCard>
      </section>
    </div>
  )
}

function NotificationsView({
  complaints,
  onSendReset,
  onTicketAction,
  passwordRequests,
  tickets,
}: {
  complaints: SupportComplaint[]
  onSendReset: (requestId: string) => void | Promise<void>
  onTicketAction: (ticketId: string, status: CorrectionTicket['status']) => void
  passwordRequests: PasswordResetRequest[]
  tickets: CorrectionTicket[]
}) {
  const pendingTickets = tickets.filter((ticket) => ticket.status === 'Menunggu')
  const processedTickets = tickets.filter((ticket) => ticket.status !== 'Menunggu')
  const newPasswordRequests = passwordRequests.filter(isPasswordResetActionable)
  const sentPasswordRequests = passwordRequests.filter(
    (request) => request.status === 'Dikirim' && !isPasswordResetActionable(request),
  )
  const newComplaints = complaints.filter((complaint) => complaint.status === 'Baru')
  const processedComplaints = complaints.filter(
    (complaint) => complaint.status !== 'Baru',
  )
  const hasActiveNotifications =
    pendingTickets.length || newPasswordRequests.length || newComplaints.length
  const hasHistory =
    processedTickets.length ||
    sentPasswordRequests.length ||
    processedComplaints.length

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <SimpleStat
          label="Semua Notifikasi"
          value={tickets.length + passwordRequests.length + complaints.length}
        />
        <SimpleStat label="Tiket Baru" tone="yellow" value={pendingTickets.length} />
        <SimpleStat
          label="Reset Password"
          tone="blue"
          value={newPasswordRequests.length}
        />
        <SimpleStat label="Pengaduan Akun" tone="red" value={newComplaints.length} />
      </section>

      <AdminCard title="Perlu Ditindaklanjuti">
        <div className="grid gap-4">
          {pendingTickets.map((ticket) => (
            <article
              key={ticket.id}
              className="rounded-[8px] border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <NotificationTypeBadge label="Tiket Koreksi" />
                  <p className="mt-3 text-lg font-black text-slate-950">
                    {ticket.studentName}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    NIM: {ticket.studentId} - {ticket.courseTitle} - {ticket.date}
                  </p>
                  <p className="mt-3 rounded-[8px] bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
                    {ticket.reason}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={() => onTicketAction(ticket.id, 'Disetujui')}
                    className="flex h-11 items-center gap-2 rounded-[8px] bg-[#5c3386] px-4 text-sm font-black text-white"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Setujui
                  </button>
                  <button
                    type="button"
                    onClick={() => onTicketAction(ticket.id, 'Ditolak')}
                    className="flex h-11 items-center gap-2 rounded-[8px] border border-[#7d2228] px-4 text-sm font-black text-[#7d2228]"
                  >
                    <XCircle className="h-4 w-4" />
                    Tolak
                  </button>
                </div>
              </div>
            </article>
          ))}

          {newPasswordRequests.map((request) => (
            <article
              key={request.id}
              className="rounded-[8px] border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <NotificationTypeBadge label="Email Reset Password" tone="purple" />
                  <p className="mt-3 text-lg font-black text-slate-950">
                    {request.name}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {request.identity} - {request.role} -{' '}
                    {formatNotificationDate(request.createdAt)}
                  </p>
                  <p className="mt-3 rounded-[8px] bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
                    Kirim kode OTP reset ke {request.registeredEmail}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSendReset(request.id)}
                  className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#5c3386] px-4 text-sm font-black text-white"
                >
                  <KeyRound className="h-4 w-4" />
                  Setujui & Kirim OTP
                </button>
              </div>
            </article>
          ))}

          {newComplaints.map((complaint) => (
            <article
              key={complaint.id}
              className="rounded-[8px] border border-slate-200 bg-white p-5"
            >
              <NotificationTypeBadge label="Pengaduan Akun" tone="red" />
              <p className="mt-3 text-lg font-black text-slate-950">
                {complaint.name}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {formatSupportRole(complaint.role)} - {complaint.identity} -{' '}
                {formatNotificationDate(complaint.createdAt)}
              </p>
              <p className="mt-2 text-sm font-black text-[#5c3386]">
                {complaint.category}
              </p>
              <p className="mt-3 rounded-[8px] bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
                {complaint.message}
              </p>
            </article>
          ))}

          {!hasActiveNotifications ? (
            <EmptyState text="Belum ada notifikasi baru yang perlu ditindaklanjuti." />
          ) : null}
        </div>
      </AdminCard>

      <AdminCard title="Riwayat Notifikasi">
        <div className="grid gap-4">
          {processedTickets.slice(0, 5).map((ticket) => (
            <article
              key={ticket.id}
              className="flex flex-col gap-3 rounded-[8px] border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <NotificationTypeBadge label="Tiket Koreksi" tone="purple" />
                <p className="mt-3 font-black text-slate-950">
                  {ticket.studentName} - {ticket.courseTitle}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {ticket.date}
                </p>
              </div>
              <StatusBadge status={ticket.status} />
            </article>
          ))}

          {sentPasswordRequests.slice(0, 5).map((request) => (
            <article
              key={request.id}
              className="flex flex-col gap-3 rounded-[8px] border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <NotificationTypeBadge label="Email Reset Password" />
                <p className="mt-3 font-black text-slate-950">{request.name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Dikirim ke {request.registeredEmail}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-700">
                Dikirim
              </span>
            </article>
          ))}

          {processedComplaints.slice(0, 5).map((complaint) => (
            <article
              key={complaint.id}
              className="flex flex-col gap-3 rounded-[8px] border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <NotificationTypeBadge label="Pengaduan Akun" tone="red" />
                <p className="mt-3 font-black text-slate-950">{complaint.name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {complaint.category}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                {complaint.status}
              </span>
            </article>
          ))}

          {!hasHistory ? (
            <EmptyState text="Riwayat notifikasi akan muncul setelah admin memproses permintaan." />
          ) : null}
        </div>
      </AdminCard>
    </div>
  )
}

function UsersView({
  onUsersChange,
  users,
}: {
  onUsersChange: (users: AdminUser[]) => void
  users: AdminUser[]
}) {
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'Semua' | AdminUserRole>('Semua')
  const [pageMode, setPageMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingKey, setEditingKey] = useState('')
  const [formData, setFormData] = useState<AdminUser>(createEmptyUser())
  const [notice, setNotice] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<DeleteConfirmation | null>(
    null,
  )
  const isEditing = Boolean(editingKey)

  const filteredUsers = users.filter((user) => {
    const lowerQuery = query.toLowerCase()
    const matchesQuery =
      !query ||
      user.id.toLowerCase().includes(lowerQuery) ||
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery)
    const matchesRole = roleFilter === 'Semua' || user.role === roleFilter
    return matchesQuery && matchesRole
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.id.trim() || !formData.name.trim() || !formData.email.trim()) {
      setNotice('ID, nama, dan email wajib diisi.')
      return
    }

    const normalizedUser = {
      ...formData,
      id: formData.id.trim(),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
    }
    const expectedDomain = getExpectedEmailDomain(normalizedUser.role)

    if (!normalizedUser.email.endsWith(expectedDomain)) {
      setNotice(`Email ${normalizedUser.role} wajib memakai domain ${expectedDomain}.`)
      return
    }

    const key = getAdminUserKey(normalizedUser)
    const nextUsers = isEditing
      ? users.map((user) =>
          getAdminUserKey(user) === editingKey ? normalizedUser : user,
        )
      : [
          normalizedUser,
          ...users.filter((user) => getAdminUserKey(user) !== key),
        ]

    onUsersChange(nextUsers)
    setFormData(createEmptyUser())
    setEditingKey('')
    setNotice(
      isEditing
        ? 'Data pengguna berhasil diperbarui dan disinkronkan.'
        : 'Pengguna baru berhasil ditambahkan dan disinkronkan.',
    )
    setPageMode('list')
  }

  const handleCreate = () => {
    setFormData(createEmptyUser())
    setEditingKey('')
    setNotice('')
    setPageMode('create')
  }

  const handleEdit = (user: AdminUser) => {
    setFormData(user)
    setEditingKey(getAdminUserKey(user))
    setNotice('')
    setPageMode('edit')
  }

  const handleDeleteRequest = (user: AdminUser) => {
    const key = getAdminUserKey(user)

    setDeleteTarget({
      title: 'Konfirmasi Hapus Pengguna',
      description: `Data ${user.name} (${user.id}) akan dihapus dari daftar ${user.role}.`,
      confirmLabel: 'Hapus Pengguna',
      onConfirm: () => {
        onUsersChange(users.filter((item) => getAdminUserKey(item) !== key))
        if (editingKey === key) {
          setFormData(createEmptyUser())
          setEditingKey('')
          setPageMode('list')
        }
        setNotice('Pengguna berhasil dihapus setelah verifikasi PIN.')
      },
    })
  }

  if (pageMode !== 'list') {
    return (
      <div className="space-y-6">
        <AdminSubPageHeader
          title={isEditing ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
          subtitle={
            isEditing
              ? 'Perbarui identitas, email institusi, role, dan status akun.'
              : 'Buat akun awal untuk mahasiswa, pengajar, atau admin.'
          }
          onBack={() => {
            setPageMode('list')
            setFormData(createEmptyUser())
            setEditingKey('')
            setNotice('')
          }}
        />

        <AdminCard title="Informasi Akun">
          <p className="mb-5 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
            {getAdminUserDomainHint(formData.role)}
          </p>
          <form className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6" onSubmit={handleSubmit}>
            <Input
              label="NIM/NIP/ID"
              value={formData.id}
              onChange={(value) => setFormData({ ...formData, id: value })}
            />
            <Input
              label="Nama Lengkap"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
            />
            <Input
              label="Email Institusi"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
            />
            <Select
              label="Role"
              value={formData.role}
              options={['Mahasiswa', 'Pengajar', 'Admin']}
              onChange={(value) =>
                setFormData({ ...formData, role: value as AdminUserRole })
              }
            />
            <Select
              label="Status"
              value={formData.status}
              options={['Aktif', 'Nonaktif']}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as AdminUser['status'],
                })
              }
            />
            <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
              <button
                type="submit"
                className="h-12 flex-1 rounded-[8px] bg-[#5c3386] px-4 text-sm font-black text-white transition hover:bg-[#4f2b73]"
              >
                {isEditing ? 'Simpan Perubahan' : 'Simpan Pengguna'}
              </button>
            </div>
          </form>
          {notice ? (
            <p className="mt-4 rounded-[8px] bg-[#5c3386]/8 px-4 py-3 text-sm font-bold text-[#5c3386]">
              {notice}
            </p>
          ) : null}
        </AdminCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SimpleStat label="Total Pengguna" value={users.length} />
        <SimpleStat
          label="Mahasiswa"
          tone="blue"
          value={users.filter((user) => user.role === 'Mahasiswa').length}
        />
        <SimpleStat
          label="Pengajar"
          tone="green"
          value={users.filter((user) => user.role === 'Pengajar').length}
        />
        <SimpleStat
          label="Admin"
          tone="purple"
          value={users.filter((user) => user.role === 'Admin').length}
        />
      </section>

      <AdminCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative min-w-0 flex-1 xl:max-w-md">
            <Search
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama, email, atau ID..."
              className="h-12 w-full rounded-[8px] border border-slate-300 bg-white pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['Semua', 'Mahasiswa', 'Pengajar', 'Admin'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`h-11 rounded-[8px] px-4 text-sm font-black transition ${
                  roleFilter === role
                    ? 'bg-[#5c3386] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#5c3386] px-4 text-sm font-black text-white shadow-lg shadow-[#5c3386]/20 transition hover:-translate-y-0.5 hover:bg-[#4f2b73]"
          >
            <Plus className="h-4 w-4" />
            Tambah Pengguna
          </button>
        </div>
        {notice ? (
          <p className="mt-4 rounded-[8px] bg-[#5c3386]/8 px-4 py-3 text-sm font-bold text-[#5c3386]">
            {notice}
          </p>
        ) : null}
      </AdminCard>

      <AdminCard className="overflow-hidden p-0">
        {filteredUsers.length ? (
          <DataTable
            flush
            columns={['ID', 'Nama', 'Email', 'Role', 'Status', 'Aksi']}
            rows={filteredUsers.map((user) => [
              user.id,
              user.name,
              user.email,
              <AdminRoleBadge key={`${getAdminUserKey(user)}-role`} role={user.role} />,
              <AdminStatusBadge
                key={`${getAdminUserKey(user)}-status`}
                status={user.status}
              />,
              <ActionButtons
                key={getAdminUserKey(user)}
                onDelete={() => handleDeleteRequest(user)}
                onEdit={() => handleEdit(user)}
              />,
            ])}
          />
        ) : (
          <div className="p-6">
            <EmptyState text="Tidak ada pengguna yang cocok dengan filter." />
          </div>
        )}
      </AdminCard>
      {deleteTarget ? (
        <DeletePinModal
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  )
}

function ScheduleView({
  onSchedulesChange,
  schedules,
  users,
}: {
  onSchedulesChange: (schedules: CourseSchedule[]) => void
  schedules: CourseSchedule[]
  users: AdminUser[]
}) {
  const [query, setQuery] = useState('')
  const [pageMode, setPageMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingId, setEditingId] = useState('')
  const [formData, setFormData] = useState<CourseSchedule>(createEmptySchedule())
  const [notice, setNotice] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<DeleteConfirmation | null>(
    null,
  )
  const isEditing = Boolean(editingId)
  const scheduleTime = splitScheduleTime(formData.time)
  const lecturerOptions = getLecturerOptions(users, schedules, formData.lecturer)
  const filteredSchedules = schedules.filter((schedule) => {
    const lowerQuery = query.trim().toLowerCase()

    if (!lowerQuery) return true

    return [
      schedule.day ?? '',
      schedule.title,
      schedule.time,
      schedule.room,
      schedule.lecturer,
      schedule.status,
      String(schedule.students),
    ].some((value) => value.toLowerCase().includes(lowerQuery))
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.title.trim() || !formData.time.trim() || !formData.room.trim()) {
      setNotice('Mata kuliah, jam, dan ruangan wajib diisi.')
      return
    }

    const schedule = {
      ...formData,
      id: isEditing ? editingId : createScheduleId(formData.title),
      students: Number(formData.students) || 0,
    }
    const nextSchedules = isEditing
      ? schedules.map((item) => (item.id === editingId ? schedule : item))
      : [schedule, ...schedules]

    onSchedulesChange(nextSchedules)
    setFormData(createEmptySchedule())
    setEditingId('')
    setNotice(
      isEditing
        ? 'Jadwal berhasil diperbarui dan disinkronkan.'
        : 'Jadwal berhasil ditambahkan dan tersedia di dashboard.',
    )
    setPageMode('list')
  }

  const handleCreate = () => {
    setFormData(createEmptySchedule())
    setEditingId('')
    setNotice('')
    setPageMode('create')
  }

  const handleEdit = (schedule: CourseSchedule) => {
    setFormData(schedule)
    setEditingId(schedule.id)
    setNotice('')
    setPageMode('edit')
  }

  const handleDeleteRequest = (schedule: CourseSchedule) => {
    setDeleteTarget({
      title: 'Konfirmasi Hapus Jadwal',
      description: `Jadwal ${schedule.title} (${schedule.time}, ${schedule.room}) akan dihapus dari mahasiswa dan pengajar.`,
      confirmLabel: 'Hapus Jadwal',
      onConfirm: () => {
        onSchedulesChange(schedules.filter((item) => item.id !== schedule.id))
        if (editingId === schedule.id) {
          setFormData(createEmptySchedule())
          setEditingId('')
          setPageMode('list')
        }
        setNotice('Jadwal berhasil dihapus setelah verifikasi PIN.')
      },
    })
  }

  const handleScheduleTimeChange = (field: 'start' | 'end', value: string) => {
    const nextTime = {
      ...splitScheduleTime(formData.time),
      [field]: value,
    }

    setFormData({
      ...formData,
      time: `${nextTime.start} - ${nextTime.end}`,
    })
  }

  if (pageMode !== 'list') {
    return (
      <div className="rounded-[8px] bg-slate-950 p-3 shadow-2xl shadow-slate-950/20 sm:p-6 lg:p-10">
        <section className="admin-surface mx-auto max-w-6xl rounded-[8px] bg-white px-5 py-7 shadow-2xl shadow-slate-950/20 sm:px-8 lg:px-12 lg:py-10">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {isEditing ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {isEditing
              ? 'Perbarui jadwal kuliah dengan format yang jelas untuk mahasiswa dan pengajar.'
              : 'Lengkapi jadwal baru. Data akan langsung tersinkron ke dashboard mahasiswa dan pengajar.'}
          </p>

          <form className="mt-8 grid gap-5 lg:grid-cols-2" onSubmit={handleSubmit}>
            <Input
              label="Mata Kuliah"
              value={formData.title}
              className="lg:col-span-1"
              inputClassName="h-16 text-base sm:text-lg"
              onChange={(value) => setFormData({ ...formData, title: value })}
            />
            <Select
              label="Pengajar"
              value={formData.lecturer}
              options={lecturerOptions}
              placeholder="Pilih Pengajar"
              className="lg:col-span-1"
              selectClassName="h-16 text-base sm:text-lg"
              onChange={(value) => setFormData({ ...formData, lecturer: value })}
            />

            <Select
              label="Hari"
              value={formData.day ?? ''}
              options={['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']}
              className="lg:col-span-1 xl:col-span-1"
              selectClassName="h-16 text-base sm:text-lg"
              onChange={(value) => setFormData({ ...formData, day: value })}
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-1">
              <TimeInput
                label="Jam Mulai"
                value={scheduleTime.start}
                onChange={(value) => handleScheduleTimeChange('start', value)}
              />
              <TimeInput
                label="Jam Selesai"
                value={scheduleTime.end}
                onChange={(value) => handleScheduleTimeChange('end', value)}
              />
            )}
            {activeView === 'users' && <UsersView users={users} onUsersChange={handleUsersChange} />}
            {activeView === 'schedule' && <ScheduleView schedules={schedules} users={users} onSchedulesChange={handleSchedulesChange} />}
            {activeView === 'attendance' && <AttendanceView scanRecords={scanRecords} />}
            {activeView === 'reports' && <ReportsView analytics={analytics} onGenerateReport={handleGenerateReport} reports={reports} />}
            {activeView === 'tickets' && <TicketsView tickets={tickets} onTicketAction={handleTicketAction} />}
            {activeView === 'notifications' && (
              <NotificationsView complaints={complaints} onSendReset={handleSendReset} onTicketAction={handleTicketAction} passwordRequests={passwordRequests} tickets={tickets} />
            )}
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#5c3386] px-4 text-sm font-black text-white transition hover:bg-[#4f2b73]"
          >
            <Plus className="h-4 w-4" />
            Tambah Jadwal
          </button>
        </div>
        {notice ? (
          <p className="mt-4 rounded-[8px] bg-[#5c3386]/8 px-4 py-3 text-sm font-bold text-[#5c3386]">
            {notice}
          </p>
        ) : null}
        <div className="mt-5 grid gap-4">
          {filteredSchedules.map((schedule) => (
            <article
              key={schedule.id}
              className="rounded-[8px] border border-slate-200 p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-lg font-black text-slate-950">
                    {schedule.title}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {schedule.day ?? 'Hari'} - {schedule.time} - {schedule.room} -{' '}
                    {schedule.lecturer}
                  </p>
                  <p className="mt-2 text-sm font-black text-[#5c3386]">
                    {schedule.students} mahasiswa - {schedule.status}
                  </p>
                </div>
                <ActionButtons
                  onDelete={() => handleDeleteRequest(schedule)}
                  onEdit={() => handleEdit(schedule)}
                />
              </div>
            </article>
          ))}
          {!filteredSchedules.length ? (
            <EmptyState text="Tidak ada jadwal yang cocok dengan pencarian." />
          ) : null}
        </div>
      </AdminCard>
      {deleteTarget ? (
        <DeletePinModal
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  )
}

function AttendanceView({ scanRecords }: { scanRecords: ReturnType<typeof loadStoredScanRecords> }) {
  const [query, setQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('Semua Kelas')
  const rows = scanRecords
  const courseOptions = [
    'Semua Kelas',
    ...Array.from(new Set(rows.map((row) => row.courseTitle))),
  ]
  const filteredRows = rows.filter((row) => {
    const lowerQuery = query.trim().toLowerCase()
    const matchesQuery =
      !lowerQuery ||
      [
        row.studentId,
        row.studentName,
        row.courseTitle,
        row.scannedAt,
        row.status,
        row.method,
      ].some((value) => value.toLowerCase().includes(lowerQuery))
    const matchesCourse =
      courseFilter === 'Semua Kelas' || row.courseTitle === courseFilter
    const matchesDate =
      !dateFilter || getRecordDateInput(row.recordedAt) === dateFilter

    return matchesQuery && matchesCourse && matchesDate
  })

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <SimpleStat label="Total Presensi Hari Ini" value={rows.length} />
        <SimpleStat
          label="Hadir"
          tone="green"
          value={rows.filter((row) => row.status === 'Terverifikasi').length}
        />
        <SimpleStat
          label="Terlambat"
          tone="yellow"
          value={rows.filter((row) => row.status === 'Terlambat').length}
        />
        <SimpleStat
          label="Tidak Hadir"
          tone="red"
          value={rows.filter((row) => row.status === 'Tidak Hadir').length}
        />
      </section>

      <AdminCard className="p-6 sm:p-8">
        <div className="grid gap-5 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
          <label className="block">
            <span className="flex items-center gap-2 text-sm font-black text-slate-700">
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
              Tanggal
            </span>
            <input
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              type="date"
              className="mt-3 h-14 w-full rounded-[8px] border border-slate-300 px-4 text-base font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/10"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-black text-slate-700">
              <Search className="h-5 w-5" aria-hidden="true" />
              Pencarian
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari NIM, nama, jam, status..."
              className="mt-3 h-14 w-full rounded-[8px] border border-slate-300 px-4 text-base font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/10"
            />
          </label>

          <Select
            label="Mata Kuliah"
            value={courseFilter}
            options={courseOptions}
            selectClassName="h-14 text-base"
            onChange={setCourseFilter}
          />

          <button
            type="button"
            onClick={() => downloadAttendanceRows(filteredRows)}
            className="flex h-14 items-center justify-center gap-3 rounded-[8px] bg-[#5c3386] px-6 text-base font-black text-white shadow-lg shadow-[#5c3386]/20 transition hover:bg-[#4f2b73]"
          >
            <Download className="h-5 w-5" aria-hidden="true" />
            Export Excel
          </button>
        </div>
      </AdminCard>

      <AdminCard className="overflow-hidden p-0">
        {filteredRows.length ? (
          <DataTable
            flush
            columns={[
              'NIM',
              'Nama',
              'Mata Kuliah',
              'Tanggal',
              'Jam Masuk',
              'Status',
              'Metode',
            ]}
            rows={filteredRows.map((row) => [
              row.studentId,
              row.studentName,
              row.courseTitle,
              formatRecordDate(row.recordedAt),
              row.scannedAt,
              row.status === 'Terverifikasi' ? 'Hadir' : row.status,
              row.method,
            ])}
          />
        ) : (
          <EmptyState text="Tidak ada data presensi yang cocok dengan pencarian." />
        )}
      </AdminCard>
    </div>
  )
}

function ReportsView({
  analytics,
  onGenerateReport,
  reports,
}: {
  analytics: AdminAnalytics
  onGenerateReport: (kind?: ReportKind) => void
  reports: GeneratedReport[]
}) {
  const reportActions: Array<{
    description: string
    kind: ReportKind
    title: string
  }> = [
    {
      kind: 'attendance',
      title: 'Laporan Kehadiran Bulanan',
      description: 'Ringkasan hadir, terlambat, alpha, dan total sesi.',
    },
    {
      kind: 'system-usage',
      title: 'Laporan Penggunaan Sistem',
      description: 'Aktivitas login, scan QR, tiket, reset password, dan unduhan.',
    },
    {
      kind: 'class-performance',
      title: 'Laporan Kinerja Per Kelas',
      description: 'Perbandingan performa kehadiran setiap mata kuliah.',
    },
    {
      kind: 'at-risk-students',
      title: 'Laporan Mahasiswa Bermasalah',
      description: 'Mahasiswa dengan kehadiran rendah atau tiket berulang.',
    },
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <TrendStat label="Kehadiran Rata-rata" trend={analytics.attendanceTrend} value={`${analytics.attendanceRate}%`} />
        <TrendStat
          label="Keterlambatan"
          tone="yellow"
          trend={analytics.lateTrend}
          value={`${analytics.lateRate}%`}
        />
        <TrendStat
          label="Ketidakhadiran"
          tone="red"
          trend={analytics.absentTrend}
          value={`${analytics.absentRate}%`}
        />
        <SimpleStat label="Total Sesi" tone="blue" value={analytics.totalSessions} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <AdminCard title="Tren Kehadiran Bulanan">
          <AdminChartFrame>
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={analytics.monthlyAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hadir" fill={purple} name="Hadir" />
                <Bar dataKey="terlambat" fill={amber} name="Terlambat" />
                <Bar dataKey="alpha" fill={maroon} name="Alpha" />
              </BarChart>
            </ResponsiveContainer>
          </AdminChartFrame>
        </AdminCard>
        <AdminCard title="Performa Per Mata Kuliah">
          <AdminChartFrame>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={analytics.classPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  dataKey="percentage"
                  name="Persentase (%)"
                  stroke={purple}
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </AdminChartFrame>
        </AdminCard>
      </section>

      <AdminCard className="p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-950">
            Pilih Jenis Laporan
          </h2>
          <p className="text-sm font-semibold leading-6 text-slate-500">
            Setiap laporan langsung dibuat, tersimpan di daftar, dan bisa diunduh
            sebagai CSV.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reportActions.map((report) => (
            <button
              key={report.kind}
              type="button"
              onClick={() => onGenerateReport(report.kind)}
              className="group flex min-h-44 flex-col justify-between rounded-[8px] border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#5c3386]/40 hover:shadow-lg hover:shadow-slate-900/8"
            >
              <div>
                <p className="text-base font-black text-slate-950">
                  {report.title}
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                  {report.description}
                </p>
              </div>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#5c3386]">
                Generate
                <ChevronRight
                  className="h-4 w-4 transition group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </button>
          ))}
        </div>
      </AdminCard>

      <AdminCard className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">
            Laporan Tersedia
          </h2>
          <div className="flex min-h-14 items-center gap-3 rounded-[8px] border border-[#5c3386]/15 bg-[#5c3386]/5 px-5 text-sm font-black text-[#5c3386]">
            <FileText className="h-5 w-5" aria-hidden="true" />
            <span>{reports.length} laporan tersimpan</span>
          </div>
        </div>
        <div className="mt-7 grid gap-5">
          {reports.map((report) => (
            <article
              key={report.id}
              className="flex flex-col gap-5 rounded-[8px] border border-slate-200 p-5 transition hover:border-[#5c3386]/35 hover:shadow-lg hover:shadow-slate-900/6 lg:flex-row lg:items-center lg:justify-between lg:p-6"
            >
              <div>
                <p className="text-lg font-black text-slate-950 sm:text-xl">
                  {report.title}
                </p>
                <p className="mt-2 text-base font-semibold text-slate-500">
                  {report.description}
                </p>
                <p className="mt-4 text-sm font-bold text-slate-400">
                  Dibuat: {formatReportDate(report.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadReport(report)}
                className="flex h-14 items-center justify-center gap-3 rounded-[8px] border border-[#5c3386] px-6 text-base font-black text-[#5c3386] transition hover:bg-[#5c3386] hover:text-white"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </article>
          ))}
        </div>
      </AdminCard>
    </div>
  )
}

function TicketsView({
  onTicketAction,
  tickets,
}: {
  onTicketAction: (ticketId: string, status: CorrectionTicket['status']) => void
  tickets: CorrectionTicket[]
}) {
  const waiting = tickets.filter((ticket) => ticket.status === 'Menunggu').length
  const pendingTickets = tickets.filter((ticket) => ticket.status === 'Menunggu')

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <SimpleStat label="Total Tiket" value={tickets.length} />
        <SimpleStat label="Menunggu" tone="yellow" value={waiting} />
        <SimpleStat
          label="Disetujui"
          tone="green"
          value={tickets.filter((ticket) => ticket.status === 'Disetujui').length}
        />
        <SimpleStat
          label="Ditolak"
          tone="red"
          value={tickets.filter((ticket) => ticket.status === 'Ditolak').length}
        />
      </section>

      <div className="grid gap-4">
        {pendingTickets.map((ticket) => (
          <article
            key={ticket.id}
            className="rounded-[8px] border-l-4 border-[#5c3386] bg-white p-5 shadow-lg shadow-slate-900/8"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg font-black text-slate-950">
                    {ticket.studentName}
                  </p>
                  <span className="text-sm font-semibold text-slate-500">
                    NIM: {ticket.studentId}
                  </span>
                  <StatusBadge status={ticket.status} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-600">
                  <span className="font-black">Mata Kuliah:</span>{' '}
                  {ticket.courseTitle}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  <span className="font-black">Tanggal:</span> {ticket.date}
                </p>
                <p className="mt-3 rounded-[8px] bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
                  <span className="font-black">Alasan:</span> {ticket.reason}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() => onTicketAction(ticket.id, 'Disetujui')}
                  className="flex h-11 items-center gap-2 rounded-[8px] bg-[#5c3386] px-4 text-sm font-black text-white"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Setujui
                </button>
                <button
                  type="button"
                  onClick={() => onTicketAction(ticket.id, 'Ditolak')}
                  className="flex h-11 items-center gap-2 rounded-[8px] border border-[#7d2228] px-4 text-sm font-black text-[#7d2228]"
                >
                  <XCircle className="h-4 w-4" />
                  Tolak
                </button>
              </div>
            </div>
          </article>
        ))}
        {!pendingTickets.length ? (
          <EmptyState text="Belum ada tiket koreksi baru yang perlu ditinjau." />
        ) : null}
      </div>
    </div>
  )
}

function AdminStatCard({
  icon: Icon,
  label,
  tone = 'purple',
  value,
}: {
  icon: LucideIcon
  label: string
  tone?: 'purple' | 'green' | 'red' | 'blue'
  value: number | string
}) {
  const colors = {
    purple: 'bg-[#5c3386]/10 text-[#5c3386]',
    green: 'bg-emerald-100 text-emerald-600',
    red: 'bg-[#7d2228]/10 text-[#7d2228]',
    blue: 'bg-blue-100 text-blue-600',
  }

  return (
    <div className="admin-surface rounded-[8px] border border-white bg-white p-6 shadow-lg shadow-slate-900/8">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${colors[tone]}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  )
}

function AdminCard({
  children,
  className = '',
  title,
}: {
  children: ReactNode
  className?: string
  title?: string
}) {
  return (
    <section
      className={`admin-surface rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/8 sm:p-6 ${className}`}
    >
      {title ? (
        <h2 className="mb-5 text-xl font-black text-slate-950">{title}</h2>
      ) : null}
      {children}
    </section>
  )
}

function AdminChartFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="-mx-5 overflow-x-auto overscroll-x-contain px-5 pb-3 sm:mx-0 sm:px-0">
        <div className="min-w-[620px] sm:min-w-0">{children}</div>
      </div>
      <p className="mt-1 text-xs font-bold text-slate-400 sm:hidden">
        Geser grafik ke samping untuk melihat semua data.
      </p>
    </>
  )
}

function SimpleStat({
  label,
  tone = 'default',
  value,
}: {
  label: string
  tone?: 'default' | 'blue' | 'green' | 'purple' | 'red' | 'yellow'
  value: number
}) {
  const color =
    tone === 'blue'
      ? 'text-blue-600'
      : tone === 'green'
        ? 'text-emerald-600'
        : tone === 'purple'
          ? 'text-[#5c3386]'
          : tone === 'red'
            ? 'text-red-600'
            : tone === 'yellow'
              ? 'text-[#c28a08]'
              : 'text-slate-950'

  return (
    <div className="admin-surface min-h-28 rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/8">
      <p className="text-base font-semibold text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-black ${color}`}>{value}</p>
    </div>
  )
}

function AdminRoleBadge({ role }: { role: AdminUserRole }) {
  const tone =
    role === 'Mahasiswa'
      ? 'bg-blue-100 text-blue-700'
      : role === 'Pengajar'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-[#5c3386]/10 text-[#5c3386]'

  return (
    <span
      className={`inline-flex min-w-20 items-center justify-center rounded-full px-3 py-1.5 text-xs font-black ${tone}`}
    >
      {role}
    </span>
  )
}

function AdminStatusBadge({ status }: { status: AdminUser['status'] }) {
  const tone =
    status === 'Aktif'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-slate-100 text-slate-500'

  return (
    <span
      className={`inline-flex min-w-18 items-center justify-center rounded-full px-3 py-1.5 text-xs font-black ${tone}`}
    >
      {status}
    </span>
  )
}

function TrendStat({
  label,
  tone = 'green',
  trend,
  value,
}: {
  label: string
  tone?: 'green' | 'yellow' | 'red'
  trend: string
  value: string
}) {
  const color =
    tone === 'green'
      ? 'text-emerald-600'
      : tone === 'yellow'
        ? 'text-[#c28a08]'
        : 'text-red-600'

  return (
    <div className="admin-surface rounded-[8px] border border-white bg-white p-6 shadow-lg shadow-slate-900/8">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-5 text-3xl font-black text-slate-950">{value}</p>
      <p className={`mt-2 text-sm font-semibold ${color}`}>{trend}</p>
    </div>
  )
}

function ActivityTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] bg-slate-50 p-4">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  )
}

function PasswordResetItem({
  onSend,
  request,
}: {
  onSend: () => void | Promise<void>
  request: PasswordResetRequest
}) {
  const isEmailSent = request.emailStatus === 'SENT'
  const hasEmailIssue =
    request.emailStatus === 'FAILED' ||
    request.emailStatus === 'SMTP_NOT_CONFIGURED'
  const buttonText = isEmailSent
    ? 'OTP terkirim'
    : hasEmailIssue
      ? 'Coba Kirim Lagi'
      : 'Setujui & Kirim OTP'
  const helperText =
    request.emailStatus === 'SMTP_NOT_CONFIGURED'
      ? request.emailError ?? 'SMTP backend belum aktif.'
      : request.emailStatus === 'FAILED'
        ? request.emailError ?? 'Email gagal dikirim.'
        : request.emailStatus === 'SENT'
          ? 'Email OTP berhasil dikirim.'
          : ''

  return (
    <article className="rounded-[8px] border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-slate-950">{request.name}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {request.identity} - {request.role}
          </p>
        </div>
        <KeyRound className="h-5 w-5 text-[#5c3386]" />
      </div>
      <p className="mt-3 rounded-[8px] bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
        {request.registeredEmail}
      </p>
      <button
        type="button"
        onClick={onSend}
        disabled={isEmailSent}
        className={`mt-3 h-10 w-full rounded-[8px] text-sm font-black ${
          isEmailSent
            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
            : 'bg-[#5c3386] text-white'
        }`}
      >
        {buttonText}
      </button>
      {helperText ? (
        <p className="mt-2 text-xs font-bold text-slate-500">{helperText}</p>
      ) : null}
    </article>
  )
}

function AdminSubPageHeader({
  onBack,
  subtitle,
  title,
}: {
  onBack: () => void
  subtitle: string
  title: string
}) {
  return (
    <section className="admin-surface rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/8 sm:p-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-black text-[#5c3386] transition hover:text-[#7d2228]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke Daftar
      </button>
      <h2 className="mt-4 text-2xl font-black text-slate-950 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
        {subtitle}
      </p>
    </section>
  )
}

function DeletePinModal({
  onClose,
  target,
}: {
  onClose: () => void
  target: DeleteConfirmation
}) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const pinDots = Array.from({ length: 4 }, (_, index) => pin.length > index)
  const isPinComplete = pin.length === 4

  const handlePinChange = (value: string) => {
    setPin(value.replace(/\D/g, '').slice(0, 4))
    setError('')
  }

  const handleConfirm = () => {
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN wajib 4 angka.')
      return
    }

    if (pin !== adminDeletePin) {
      setError('PIN tidak sesuai. Data belum dihapus.')
      return
    }

    target.onConfirm()
    setPin('')
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="admin-surface relative w-full max-w-xl rounded-[8px] bg-white p-5 shadow-2xl shadow-slate-950/35 sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-[8px] text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          aria-label="Tutup konfirmasi PIN"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3 pr-10">
          <img
            src="/logo-fti.png"
            alt="Logo FTI UNTAR"
            className="h-11 w-32 object-contain drop-shadow-sm"
          />
        </div>

        <div className="mt-5">
          <h2 className="text-2xl font-black text-slate-950">{target.title}</h2>
          <p className="mt-2 max-w-lg text-sm font-semibold leading-6 text-slate-500">
            {target.description} Masukkan PIN admin 4 digit untuk memastikan
            aksi ini memang disengaja.
          </p>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-black text-slate-700">PIN Admin</span>
          <div className="relative mt-2 rounded-[8px] border border-slate-200 bg-slate-50 px-5 py-4 transition focus-within:border-[#5c3386] focus-within:ring-4 focus-within:ring-[#5c3386]/12">
            <input
              value={pin}
              onChange={(event) => handlePinChange(event.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              autoFocus
              aria-label="PIN admin 4 digit"
              className="absolute inset-0 h-full w-full cursor-text opacity-0"
            />
            <div className="flex items-center justify-center gap-5">
            {pinDots.map((isFilled, index) => (
              <span
                key={index}
                  className={`flex h-11 w-11 items-center justify-center rounded-[8px] border bg-white text-xl font-black transition ${
                    isFilled
                      ? 'border-[#5c3386] shadow-md shadow-[#5c3386]/15'
                      : 'border-slate-200'
                  }`}
                aria-label={`Digit PIN ${index + 1}`}
                >
                  <span
                    className={`h-3 w-3 rounded-full ${
                      isFilled ? 'bg-white' : 'bg-slate-300'
                    }`}
                  />
                </span>
            ))}
            </div>
          </div>
        </label>

        {error ? (
          <p className="mt-4 rounded-[8px] bg-[#7d2228]/8 px-4 py-3 text-sm font-bold text-[#7d2228]">
            {error}
          </p>
        ) : (
          <p className="mt-4 rounded-[8px] bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">
            Data belum dihapus sebelum PIN benar dan tombol konfirmasi ditekan.
          </p>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-[8px] border border-slate-300 px-4 text-sm font-black text-slate-700 transition hover:border-[#5c3386] hover:text-[#5c3386]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isPinComplete}
            className={`h-12 rounded-[8px] px-4 text-sm font-black text-white shadow-lg transition ${
              isPinComplete
                ? 'bg-[#7d2228] shadow-[#7d2228]/20 hover:bg-[#691c21]'
                : 'cursor-not-allowed bg-slate-300 shadow-slate-200'
            }`}
          >
            {target.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionButtons({
  onDelete,
  onEdit,
}: {
  onDelete: () => void
  onEdit: () => void
}) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="flex h-10 w-10 items-center justify-center rounded-[8px] text-blue-600 hover:bg-blue-50"
        aria-label="Edit"
      >
        <Pencil className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="flex h-10 w-10 items-center justify-center rounded-[8px] text-red-600 hover:bg-red-50"
        aria-label="Hapus"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  )
}

function StatusBadge({ status }: { status: CorrectionTicket['status'] }) {
  const tone =
    status === 'Disetujui'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'Ditolak'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-[#9b6b07]'

  return <span className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}>{status}</span>
}

function NotificationTypeBadge({
  label,
  tone = 'yellow',
}: {
  label: string
  tone?: 'purple' | 'red' | 'yellow'
}) {
  const color =
    tone === 'purple'
      ? 'bg-[#5c3386]/10 text-[#5c3386]'
      : tone === 'red'
        ? 'bg-[#7d2228]/10 text-[#7d2228]'
        : 'bg-amber-100 text-[#9b6b07]'

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${color}`}>
      {label}
    </span>
  )
}

function TimeInput({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <div className="relative mt-3">
        <input
          type="time"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-16 w-full rounded-[8px] border border-slate-300 px-4 text-base font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/10 sm:text-lg"
        />
      </div>
    </label>
  )
}

function Input({
  className = '',
  inputClassName = '',
  label,
  onChange,
  placeholder,
  type = 'text',
  value,
}: {
  className?: string
  inputClassName?: string
  label: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  value: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-3 h-12 w-full rounded-[8px] border border-slate-300 px-4 text-sm font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/10 ${inputClassName}`}
      />
    </label>
  )
}

function Select({
  className = '',
  label,
  onChange,
  options,
  placeholder,
  selectClassName = '',
  value,
}: {
  className?: string
  label: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  selectClassName?: string
  value: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-black text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-3 h-12 w-full rounded-[8px] border border-slate-300 px-4 text-sm font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/10 ${selectClassName}`}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function DataTable({
  columns,
  flush = false,
  rows,
}: {
  columns: string[]
  flush?: boolean
  rows: ReactNode[][]
}) {
  return (
    <>
      <div className={`${flush ? '' : 'mt-5'} grid gap-3 md:hidden`}>
        {rows.map((row, rowIndex) => (
          <article
            key={rowIndex}
            className="rounded-[8px] border border-slate-200 bg-white p-4"
          >
            <div className="grid gap-3">
              {row.map((cell, index) => {
                const isActionColumn = columns[index]?.toLowerCase() === 'aksi'

                return (
                  <div
                    key={columns[index]}
                    className={`border-b border-slate-100 pb-3 last:border-0 last:pb-0 ${
                      isActionColumn
                        ? 'grid gap-2'
                        : 'flex items-start justify-between gap-4'
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                      {columns[index]}
                    </span>
                    <div
                      className={
                        isActionColumn
                          ? 'w-full text-sm font-bold text-slate-700'
                          : 'max-w-[60%] text-right text-sm font-bold text-slate-700'
                      }
                    >
                      {cell}
                    </div>
                  </div>
                )
              })}
            </div>
          </article>
        ))}
      </div>
      <div className={`${flush ? '' : 'mt-5'} hidden overflow-x-auto md:block`}>
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-50">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-5 py-4 text-sm font-black text-slate-600"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="transition hover:bg-slate-50">
                {row.map((cell, index) => (
                  <td
                    key={index}
                    className="px-5 py-4 text-sm font-semibold leading-6 text-slate-700"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-[8px] bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">
      {text}
    </p>
  )
}

function formatAdminDate(date: Date) {
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatAdminTime(date: Date) {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatNotificationDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatSupportRole(role: SupportComplaint['role']) {
  if (role === 'mahasiswa') return 'Mahasiswa'
  if (role === 'pengajar') return 'Pengajar'

  return 'Admin'
}

function isPasswordResetActionable(request: PasswordResetRequest) {
  return (
    request.status === 'Baru' ||
    request.emailStatus === 'FAILED' ||
    request.emailStatus === 'SMTP_NOT_CONFIGURED' ||
    (request.status === 'Dikirim' && request.emailStatus !== 'SENT')
  )
}

function getExpectedEmailDomain(role: AdminUserRole) {
  return role === 'Mahasiswa' ? '@stu.untar.ac.id' : '@untar.ac.id'
}

function getAdminUserDomainHint(role: AdminUserRole) {
  if (role === 'Mahasiswa') {
    return 'Mahasiswa wajib memakai email institusi dengan domain @stu.untar.ac.id.'
  }

  if (role === 'Pengajar') {
    return 'Pengajar wajib memakai email institusi dengan domain @untar.ac.id.'
  }

  return 'Admin wajib memakai email institusi dengan domain @untar.ac.id.'
}

function createEmptyUser(): AdminUser {
  return {
    id: '',
    name: '',
    email: '',
    role: 'Mahasiswa',
    status: 'Aktif',
  }
}

function createEmptySchedule(): CourseSchedule {
  return {
    id: '',
    day: 'Senin',
    title: '',
    time: '08:00 - 10:00',
    room: '',
    lecturer: '',
    students: 30,
    status: 'upcoming',
  }
}

function splitScheduleTime(time: string) {
  const [rawStart = '08:00', rawEnd = '10:00'] = time.split('-')

  return {
    start: normalizeTimeInput(rawStart),
    end: normalizeTimeInput(rawEnd),
  }
}

function normalizeTimeInput(value: string) {
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/)

  if (!match) return '08:00'

  const hour = match[1].padStart(2, '0')
  const minute = match[2]

  return `${hour}:${minute}`
}

function getLecturerOptions(
  users: AdminUser[],
  schedules: CourseSchedule[],
  currentLecturer: string,
) {
  return Array.from(
    new Set(
      [
        ...users
          .filter((user) => user.role === 'Pengajar')
          .map((user) => user.name),
        ...schedules.map((schedule) => schedule.lecturer),
        currentLecturer,
      ].filter(Boolean),
    ),
  )
}

function getRecordDateInput(recordedAt: string) {
  const date = new Date(recordedAt)

  if (Number.isNaN(date.getTime())) return ''

  return date.toISOString().slice(0, 10)
}

function formatRecordDate(recordedAt: string) {
  const date = new Date(recordedAt)

  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function buildAdminUsers(profiles: LocalSession[]) {
  const profileUsers: AdminUser[] = profiles.map((profile) => ({
    id: profile.identity,
    name: profile.name,
    email:
      profile.email ??
      (profile.role === 'mahasiswa'
        ? `${profile.identity}@stu.untar.ac.id`
        : `${profile.identity}@untar.ac.id`),
    role:
      profile.role === 'mahasiswa'
        ? 'Mahasiswa'
        : profile.role === 'pengajar'
          ? 'Pengajar'
          : 'Admin',
    status: 'Aktif',
  }))
  const profileKeys = new Set(profileUsers.map(getAdminUserKey))

  return [
    ...profileUsers,
    ...defaultAdminUsers.filter((user) => !profileKeys.has(getAdminUserKey(user))),
  ]
}

function downloadAttendanceRows(rows: ReturnType<typeof loadStoredScanRecords>) {
  const headers = [
    'NIM',
    'Nama',
    'Mata Kuliah',
    'Tanggal',
    'Jam Masuk',
    'Status',
    'Metode',
  ]
  const csvRows = rows.map((row) =>
    [
      row.studentId,
      row.studentName,
      row.courseTitle,
      formatRecordDate(row.recordedAt),
      row.scannedAt,
      row.status === 'Terverifikasi' ? 'Hadir' : row.status,
      row.method,
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(','),
  )

  const blob = new Blob([[headers.join(','), ...csvRows].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'data-presensi.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function downloadReport(report: GeneratedReport) {
  const blob = new Blob([reportToCsv(report)], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${report.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function buildAdminAnalytics(
  scanRecords: ScanRecord[],
  schedules: CourseSchedule[],
  referenceDate: Date,
): AdminAnalytics {
  const monthlyAttendance = buildMonthlyAttendanceSeries(scanRecords, referenceDate)
  const sessionsPerDay = buildSessionsPerDaySeries(schedules)
  const classPerformance = buildClassPerformanceSeries(scanRecords)
  const statusDistribution = buildStatusDistribution(scanRecords)
  const currentSnapshot = buildMonthlySnapshot(scanRecords, referenceDate)
  const previousMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() - 1,
    1,
  )
  const previousSnapshot = buildMonthlySnapshot(scanRecords, previousMonth)

  return {
    monthlyAttendance,
    sessionsPerDay,
    classPerformance,
    statusDistribution,
    attendanceRate: currentSnapshot.attendanceRate,
    lateRate: currentSnapshot.lateRate,
    absentRate: currentSnapshot.absentRate,
    attendanceTrend: formatTrendChange(
      currentSnapshot.attendanceRate,
      previousSnapshot.attendanceRate,
    ),
    lateTrend: formatTrendChange(currentSnapshot.lateRate, previousSnapshot.lateRate),
    absentTrend: formatTrendChange(
      currentSnapshot.absentRate,
      previousSnapshot.absentRate,
    ),
    totalSessions: schedules.length,
  }
}

function buildMonthlyAttendanceSeries(
  scanRecords: ScanRecord[],
  referenceDate: Date,
): MonthlyAttendancePoint[] {
  return Array.from({ length: 5 }, (_, index) => {
    const monthDate = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - 4 + index,
      1,
    )
    const snapshot = buildMonthlySnapshot(scanRecords, monthDate)

    return {
      month: monthDate.toLocaleDateString('id-ID', { month: 'short' }),
      percentage: snapshot.attendanceRate,
      hadir: snapshot.presentCount,
      terlambat: snapshot.lateCount,
      alpha: snapshot.absentCount,
    }
  })
}

function buildSessionsPerDaySeries(schedules: CourseSchedule[]): DaySessionsPoint[] {
  const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
  const counts = new Map(dayOrder.map((day) => [day, 0]))

  for (const schedule of schedules) {
    const normalizedDay = normalizeDayName(schedule.day)
    if (normalizedDay && counts.has(normalizedDay)) {
      counts.set(normalizedDay, (counts.get(normalizedDay) ?? 0) + 1)
    }
  }

  return dayOrder.map((day) => ({
    day: day.slice(0, 3),
    sessions: counts.get(day) ?? 0,
  }))
}

function buildClassPerformanceSeries(
  scanRecords: ScanRecord[],
): ClassPerformancePoint[] {
  const byCourse = new Map<string, { present: number; total: number }>()

  for (const record of scanRecords) {
    const current = byCourse.get(record.courseTitle) ?? { present: 0, total: 0 }
    current.total += 1
    if (record.status === 'Terverifikasi' || record.status === 'Terlambat') {
      current.present += 1
    }
    byCourse.set(record.courseTitle, current)
  }

  return Array.from(byCourse.entries())
    .map(([course, stats]) => ({
      course,
      percentage: stats.total ? Math.round((stats.present / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage)
}

function buildStatusDistribution(scanRecords: ScanRecord[]) {
  const total = scanRecords.length
  const present = scanRecords.filter((record) => record.status === 'Terverifikasi').length
  const late = scanRecords.filter((record) => record.status === 'Terlambat').length
  const absent = Math.max(total - present - late, 0)

  return [
    { name: 'Hadir', value: total ? Math.round((present / total) * 100) : 0, color: '#22c55e' },
    { name: 'Terlambat', value: total ? Math.round((late / total) * 100) : 0, color: '#f59e0b' },
    { name: 'Tidak Hadir', value: total ? Math.round((absent / total) * 100) : 0, color: '#ef4444' },
  ]
}

function buildMonthlySnapshot(scanRecords: ScanRecord[], referenceDate: Date) {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const monthRecords = scanRecords.filter((record) => {
    const recordedAt = new Date(record.recordedAt)
    return (
      !Number.isNaN(recordedAt.getTime()) &&
      recordedAt.getFullYear() === year &&
      recordedAt.getMonth() === month
    )
  })

  const presentCount = monthRecords.filter(
    (record) => record.status === 'Terverifikasi' || record.status === 'Terlambat',
  ).length
  const lateCount = monthRecords.filter((record) => record.status === 'Terlambat').length
  const absentCount = Math.max(monthRecords.length - presentCount, 0)

  return {
    presentCount,
    lateCount,
    absentCount,
    attendanceRate: monthRecords.length
      ? Math.round((presentCount / monthRecords.length) * 100)
      : 0,
    lateRate: monthRecords.length
      ? Math.round((lateCount / monthRecords.length) * 100)
      : 0,
    absentRate: monthRecords.length
      ? Math.round((absentCount / monthRecords.length) * 100)
      : 0,
  }
}

function normalizeDayName(day?: string) {
  if (!day) return ''

  const lowerDay = day.trim().toLowerCase()

  if (lowerDay.startsWith('sen')) return 'Senin'
  if (lowerDay.startsWith('sel')) return 'Selasa'
  if (lowerDay.startsWith('rab')) return 'Rabu'
  if (lowerDay.startsWith('kam')) return 'Kamis'
  if (lowerDay.startsWith('jum')) return 'Jumat'
  if (lowerDay.startsWith('sab')) return 'Sabtu'
  if (lowerDay.startsWith('min')) return 'Minggu'

  return day
}

function formatTrendChange(currentValue: number, previousValue: number) {
  const delta = currentValue - previousValue
  const formattedDelta = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% dari bulan lalu`

  return formattedDelta
}
