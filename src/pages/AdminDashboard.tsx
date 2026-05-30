import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  FileText,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  Radio,
  Search,
  Shield,
  Ticket as TicketIcon,
  Trash2,
  TrendingUp,
  Users,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

import { loadLocalProfiles } from '../lib/localSession'
import type { CorrectionTicket, CourseSchedule } from '../types/attendance'
import type { LocalSession } from '../types/auth'
import {
  adminUsersChangedEvent,
  fetchAdminUsersFromBackend,
  getAdminUserKey,
  loadAdminUsers,
  saveAdminUsers,
  type AdminUser,
  type AdminUserRole,
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
  createGeneratedReport,
  fetchReportsFromBackend,
  formatReportDate,
  loadGeneratedReports,
  reportToCsv,
  reportsChangedEvent,
  saveGeneratedReports,
  type GeneratedReport,
  type ReportKind,
} from '../utils/reports'
import {
  createScheduleId,
  fetchSchedulesFromBackend,
  loadSchedules,
  saveSchedules,
  scheduleChangedEvent,
} from '../utils/schedules'
import {
  fetchTicketsFromBackend,
  loadStoredTickets,
  ticketsChangedEvent,
  updateStoredTicket,
} from '../utils/tickets'
import {
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
  onConfirm: () => void
}

type AdminNotice = {
  message: string
  tone: 'danger' | 'success' | 'warning'
}

const purple = '#5c3386'
const maroon = '#7d2228'
const amber = '#edae36'
const adminDeletePin = '1234'

const menuItems: Array<{ id: AdminView; label: string; icon: LucideIcon }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Pengguna', icon: Users },
  { id: 'schedule', label: 'Jadwal', icon: CalendarDays },
  { id: 'attendance', label: 'Presensi', icon: ClipboardList },
  { id: 'reports', label: 'Laporan', icon: FileText },
  { id: 'tickets', label: 'Tiket', icon: TicketIcon },
]

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

const defaultAdminUsers: AdminUser[] = [
  {
    id: '535240187',
    name: "Naisya Yuen Ra'af",
    email: 'naisya@stu.untar.ac.id',
    role: 'Mahasiswa',
    status: 'Aktif',
  },
  {
    id: '535240156',
    name: 'Ahmad Rizki',
    email: 'ahmad@stu.untar.ac.id',
    role: 'Mahasiswa',
    status: 'Aktif',
  },
  {
    id: '198503152010121001',
    name: 'Dr. Ahmad Santoso',
    email: 'ahmad.santoso@untar.ac.id',
    role: 'Pengajar',
    status: 'Aktif',
  },
  {
    id: '198808122015032002',
    name: 'Ir. Siti Nurhaliza',
    email: 'siti.nurhaliza@untar.ac.id',
    role: 'Pengajar',
    status: 'Aktif',
  },
  {
    id: 'admin-fti',
    name: 'Admin Fakultas',
    email: 'admin.fti@untar.ac.id',
    role: 'Admin',
    status: 'Aktif',
  },
]

const monthlyAttendanceData = [
  { month: 'Jan', percentage: 86, hadir: 860, terlambat: 45, alpha: 24 },
  { month: 'Feb', percentage: 88, hadir: 825, terlambat: 58, alpha: 32 },
  { month: 'Mar', percentage: 90, hadir: 895, terlambat: 47, alpha: 20 },
  { month: 'Apr', percentage: 87, hadir: 872, terlambat: 55, alpha: 31 },
  { month: 'Mei', percentage: 85, hadir: 850, terlambat: 50, alpha: 22 },
]

const sessionsPerDayData = [
  { day: 'Sen', sessions: 12 },
  { day: 'Sel', sessions: 15 },
  { day: 'Rab', sessions: 14 },
  { day: 'Kam', sessions: 13 },
  { day: 'Jum', sessions: 11 },
]

export default function AdminDashboard({
  session,
  onLogout,
}: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<AdminView>('dashboard')
  const [users, setUsers] = useState<AdminUser[]>(() =>
    loadAdminUsers(buildAdminUsers(loadLocalProfiles())),
  )
  const [schedules, setSchedules] = useState<CourseSchedule[]>(() =>
    loadSchedules(),
  )
  const [tickets, setTickets] = useState<CorrectionTicket[]>(() =>
    loadStoredTickets(),
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
    const fallbackUsers = buildAdminUsers(loadLocalProfiles())
    const reload = () => setUsers(loadAdminUsers(fallbackUsers))

    void fetchAdminUsersFromBackend(fallbackUsers).then((backendUsers) => {
      if (backendUsers) {
        setUsers(backendUsers)
      }
    })

    window.addEventListener('storage', reload)
    window.addEventListener(adminUsersChangedEvent, reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener(adminUsersChangedEvent, reload)
    }
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
    const reload = () => setTickets(loadStoredTickets())

    void fetchTicketsFromBackend([]).then((backendTickets) => {
      if (backendTickets) {
        setTickets(backendTickets)
      }
    })

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

  const handleUsersChange = (nextUsers: AdminUser[]) => {
    setUsers(nextUsers)
    saveAdminUsers(nextUsers)
  }

  const handleSchedulesChange = (nextSchedules: CourseSchedule[]) => {
    setSchedules(nextSchedules)
    saveSchedules(nextSchedules)
  }

  const handleTicketAction = (
    ticketId: string,
    status: CorrectionTicket['status'],
  ) => {
    const selectedTicket = tickets.find((ticket) => ticket.id === ticketId)
    if (!selectedTicket) return

    const updatedTicket = { ...selectedTicket, status }
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId ? updatedTicket : ticket,
      ),
    )
    updateStoredTicket(updatedTicket)
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
        message: `Link reset berhasil dikirim ke ${request.registeredEmail}.`,
      })
      return
    }

    if (request.emailStatus === 'SMTP_NOT_CONFIGURED') {
      setAdminNotice({
        tone: 'warning',
        message:
          'Permintaan tercatat, tapi SMTP backend belum dikonfigurasi jadi email asli belum terkirim.',
      })
      return
    }

    setAdminNotice({
      tone: 'danger',
      message:
        'Backend gagal mengirim email reset. Cek konfigurasi SMTP dan koneksi email.',
    })
  }

  return (
    <div className="admin-shell min-h-screen bg-[#f5f6fa] text-slate-950 md:grid md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
      <AdminSidebar
        activeView={activeView}
        onLogout={onLogout}
        onViewChange={setActiveView}
        session={session}
      />

      <main className="min-w-0">
        <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 px-5 py-3 backdrop-blur sm:px-7">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <nav
              className="flex items-center gap-3 text-sm font-black text-slate-400"
              aria-label="Breadcrumb admin"
            >
              <span className="flex h-9 w-32 items-center">
                <img
                  src="/logo-fti.png"
                  alt="Logo FTI UNTAR"
                  className="max-h-full w-full object-contain"
                />
              </span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span>Admin</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className="text-[#5c3386]">{meta.breadcrumb}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex h-11 items-center gap-2 rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-600">
                <CalendarDays
                  className="h-4 w-4 text-[#5c3386]"
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">
                  {formatAdminDate(currentTime)}
                </span>
                <Clock className="h-4 w-4 text-[#7d2228]" aria-hidden="true" />
                <span>{formatAdminTime(currentTime)}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('notifications')}
                className="relative flex h-11 items-center justify-center rounded-[8px] border border-slate-200 bg-white px-3 text-sm font-black text-slate-600 transition hover:border-[#5c3386]/40 hover:text-[#5c3386]"
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
              complaints={complaints}
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
    <aside className="sticky top-0 z-30 flex flex-col bg-[#573485] text-white shadow-xl shadow-[#28183d]/15 md:h-dvh md:max-h-dvh md:overflow-hidden">
      <div className="shrink-0 border-b border-white/14 px-5 py-6 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-white/14 text-xl font-black tracking-tight text-white shadow-lg shadow-[#2b1844]/20 ring-1 ring-white/10">
              FTI
            </div>
            <div className="min-w-0">
              <p className="truncate text-2xl font-black leading-none tracking-tight text-white">
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
            className="flex h-11 items-center justify-center gap-2 rounded-[8px] border border-white/20 px-4 text-sm font-black text-white transition hover:bg-white/10 md:hidden"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Keluar
          </button>
        </div>
      </div>

      <div className="shrink-0 border-b border-white/14 px-5 py-5 md:px-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#7d2228] text-white shadow-xl shadow-[#321a4c]/25">
            <Shield className="h-8 w-8" aria-hidden="true" />
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

      <nav className="flex flex-1 flex-col gap-2 overflow-hidden px-5 py-5">
        <p className="px-3 pb-2 text-xs font-black uppercase tracking-[0.14em] text-white/42">
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
              className={`relative flex h-12 w-full items-center justify-start gap-4 rounded-[8px] px-5 text-left text-lg font-black transition ${
                isActive
                  ? 'bg-white/14 text-white shadow-lg shadow-[#321a4c]/20'
                  : 'text-white/64 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
              {isActive ? (
                <span className="absolute right-5 h-2.5 w-2.5 rounded-full bg-white/70" />
              ) : null}
            </button>
          )
        })}
      </nav>

      <div className="hidden shrink-0 border-t border-white/14 p-4 md:block">
        <button
          type="button"
          onClick={onLogout}
          className="flex h-11 w-full items-center gap-4 rounded-[8px] px-5 text-left text-lg font-black text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-6 w-6" aria-hidden="true" />
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
  complaints,
  onSendReset,
  passwordRequests,
  schedules,
  scanRecordsCount,
  tickets,
  users,
}: {
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
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={monthlyAttendanceData}>
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
        </AdminCard>

        <AdminCard title="Sesi Per Hari (Minggu Ini)">
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={sessionsPerDayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sessions" fill={purple} name="Jumlah Sesi" />
            </BarChart>
          </ResponsiveContainer>
        </AdminCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <AdminCard title="Aktivitas Lokal">
          <div className="grid gap-3">
            <ActivityTile label="Scan tersimpan" value={scanRecordsCount} />
            <ActivityTile label="Keluhan bantuan" value={complaints.length} />
            <ActivityTile label="Reset password" value={pendingResets.length} />
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

        <AdminCard title="Keluhan Bantuan">
          <div className="space-y-3">
            {complaints.slice(0, 3).map((complaint) => (
              <div
                key={complaint.id}
                className="rounded-[8px] border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-black text-slate-950">{complaint.name}</p>
                  <span className="rounded-full bg-[#5c3386]/10 px-3 py-1 text-xs font-black text-[#5c3386]">
                    {complaint.role}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  {complaint.category}
                </p>
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">
                  {complaint.message}
                </p>
              </div>
            ))}
            {!complaints.length ? <EmptyState text="Belum ada keluhan." /> : null}
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
                    Kirim tautan reset ke {request.registeredEmail}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSendReset(request.id)}
                  className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#5c3386] px-4 text-sm font-black text-white"
                >
                  <KeyRound className="h-4 w-4" />
                  Kirim Email Reset
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
      description: `Data ${user.name} (${user.id}) akan dihapus dari daftar ${user.role}. Masukkan PIN admin 4 angka untuk melanjutkan.`,
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
      description: `Jadwal ${schedule.title} (${schedule.time}, ${schedule.room}) akan dihapus dari mahasiswa dan pengajar. Masukkan PIN admin 4 angka untuk melanjutkan.`,
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
            </div>

            <Input
              label="Ruangan"
              value={formData.room}
              placeholder="Contoh: B-204"
              inputClassName="h-16 text-base sm:text-lg"
              onChange={(value) => setFormData({ ...formData, room: value })}
            />
            <Input
              label="Kapasitas"
              type="number"
              value={String(formData.students)}
              placeholder="30"
              inputClassName="h-16 text-base sm:text-lg"
              onChange={(value) =>
                setFormData({ ...formData, students: Number(value) })
              }
            />

            <Select
              label="Status Sesi"
              value={formData.status}
              options={['active', 'upcoming', 'closed']}
              className="lg:col-span-2"
              selectClassName="h-16 text-base sm:text-lg"
              onChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as CourseSchedule['status'],
                })
              }
            />

            {notice ? (
              <p className="rounded-[8px] bg-[#5c3386]/8 px-4 py-3 text-sm font-bold text-[#5c3386] lg:col-span-2">
                {notice}
              </p>
            ) : null}

            <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setPageMode('list')
                  setFormData(createEmptySchedule())
                  setEditingId('')
                  setNotice('')
                }}
                className="h-14 rounded-[8px] border border-slate-300 px-5 text-base font-black text-slate-700 transition hover:border-[#5c3386] hover:text-[#5c3386]"
              >
                Batal
              </button>
              <button
                type="submit"
                className="h-14 rounded-[8px] bg-[#5c3386] px-5 text-base font-black text-white shadow-lg shadow-[#5c3386]/20 transition hover:bg-[#4f2b73]"
              >
                {isEditing ? 'Simpan Perubahan' : 'Simpan'}
              </button>
            </div>
          </form>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <SimpleStat label="Total Jadwal" value={schedules.length} />
        <SimpleStat label="Mata Kuliah" tone="purple" value={schedules.length} />
        <SimpleStat
          label="Ruangan Aktif"
          tone="green"
          value={new Set(schedules.map((item) => item.room)).size}
        />
        <SimpleStat
          label="Pengajar Aktif"
          tone="blue"
          value={new Set(schedules.map((item) => item.lecturer)).size}
        />
      </section>

      <AdminCard>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari jadwal, jam, dosen, atau ruangan..."
              className="h-12 w-full rounded-[8px] border border-slate-200 pl-12 pr-4 font-semibold outline-none focus:border-[#5c3386]"
            />
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
  const rows = scanRecords.length
    ? scanRecords
    : [
        {
          id: 'demo-1',
          studentId: '535240187',
          studentName: "Naisya Yuen Ra'af",
          courseTitle: 'Basis Data Lanjut',
          scannedAt: '08:02',
          recordedAt: new Date().toISOString(),
          method: 'QR Code' as const,
          status: 'Terverifikasi' as const,
        },
        {
          id: 'demo-2',
          studentId: '535240156',
          studentName: 'Ahmad Rizki',
          courseTitle: 'Basis Data Lanjut',
          scannedAt: '08:17',
          recordedAt: new Date().toISOString(),
          method: 'QR Code' as const,
          status: 'Terlambat' as const,
        },
      ]
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
  onGenerateReport,
  reports,
}: {
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
        <TrendStat label="Kehadiran Rata-rata" trend="+2.5% dari bulan lalu" value="84%" />
        <TrendStat
          label="Keterlambatan"
          tone="yellow"
          trend="-1.2% dari bulan lalu"
          value="11%"
        />
        <TrendStat
          label="Ketidakhadiran"
          tone="red"
          trend="+0.8% dari bulan lalu"
          value="5%"
        />
        <SimpleStat label="Total Sesi" tone="blue" value={245} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <AdminCard title="Tren Kehadiran Bulanan">
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={monthlyAttendanceData}>
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
        </AdminCard>
        <AdminCard title="Performa Per Mata Kuliah">
          <ResponsiveContainer width="100%" height={270}>
            <LineChart
              data={[
                { course: 'Kecerdasan Buatan', percentage: 92 },
                { course: 'Jaringan Komputer', percentage: 91 },
                { course: 'Basis Data Lanjut', percentage: 89 },
                { course: 'Pemrograman Web', percentage: 85 },
              ]}
            >
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
  children: React.ReactNode
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
    ? 'Sudah dikirim'
    : hasEmailIssue
      ? 'Coba Kirim Lagi'
      : 'Kirim Email Reset'
  const helperText =
    request.emailStatus === 'SMTP_NOT_CONFIGURED'
      ? 'SMTP backend belum aktif.'
      : request.emailStatus === 'FAILED'
        ? 'Email gagal dikirim.'
        : request.emailStatus === 'SENT'
          ? 'Email berhasil dikirim.'
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

  const handleKeypadDigit = (digit: string) => {
    if (pin.length >= 4) return
    setPin((currentPin) => `${currentPin}${digit}`.slice(0, 4))
    setError('')
  }

  const handleBackspace = () => {
    setPin((currentPin) => currentPin.slice(0, -1))
    setError('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="admin-surface relative w-full max-w-md rounded-[8px] bg-white p-5 shadow-2xl shadow-slate-950/35 sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-[8px] text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          aria-label="Tutup konfirmasi PIN"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="mx-auto flex w-fit items-center gap-3 pt-2">
          <img
            src="/logo-fti.png"
            alt="Logo FTI UNTAR"
            className="h-16 w-44 object-contain drop-shadow-sm"
          />
        </div>

        <div className="mt-5 text-center">
          <h2 className="text-2xl font-black text-slate-950">
            Masukkan PIN Admin
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-slate-500">
            {target.description} Masukkan 4 digit PIN untuk melanjutkan aksi
            penghapusan.
          </p>
        </div>

        <div className="mt-7 rounded-[8px] border border-slate-200 bg-white px-5 py-5 shadow-inner">
          <div className="flex items-center justify-center gap-7">
            {pinDots.map((isFilled, index) => (
              <span
                key={index}
                className={`h-3 w-3 rounded-full transition ${
                  isFilled ? 'scale-125 bg-[#5c3386]' : 'bg-slate-300'
                }`}
                aria-label={`Digit PIN ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {error ? (
          <p className="mt-5 rounded-[8px] bg-[#7d2228]/8 px-4 py-3 text-center text-sm font-bold text-[#7d2228]">
            {error}
          </p>
        ) : (
          <p className="mt-5 rounded-[8px] bg-slate-50 px-4 py-3 text-center text-xs font-bold text-slate-500">
            Aksi hapus baru diproses setelah keempat digit PIN benar. PIN demo:
            1234.
          </p>
        )}

        <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeypadDigit(digit)}
              className="flex aspect-square items-center justify-center rounded-full bg-slate-50 text-2xl font-black text-slate-950 shadow-sm transition hover:bg-[#5c3386]/10 active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setPin('')
              setError('')
            }}
            className="flex aspect-square items-center justify-center rounded-full bg-slate-50 text-sm font-black text-slate-500 shadow-sm transition hover:bg-slate-100 active:scale-95"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => handleKeypadDigit('0')}
            className="flex aspect-square items-center justify-center rounded-full bg-slate-50 text-2xl font-black text-slate-950 shadow-sm transition hover:bg-[#5c3386]/10 active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="flex aspect-square items-center justify-center rounded-full bg-slate-50 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95"
            aria-label="Hapus satu digit PIN"
          >
            Hapus
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
    <div className="flex gap-2">
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
              {row.map((cell, index) => (
                <div
                  key={columns[index]}
                  className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                    {columns[index]}
                  </span>
                  <div className="max-w-[60%] text-right text-sm font-bold text-slate-700">
                    {cell}
                  </div>
                </div>
              ))}
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
