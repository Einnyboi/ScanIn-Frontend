import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Radio, Ticket as TicketIcon, TrendingUp, Users } from 'lucide-react'

import type { CorrectionTicket, CourseSchedule } from '../../types/attendance'
import type { AdminUser } from '../../utils/adminUsers'
import type { PasswordResetRequest } from '../../utils/passwordReset'
import { buildAdminAnalytics, type AdminAnalytics } from '../../utils/adminDashboard'

import { AdminCard, AdminStatCard, ActivityTile, EmptyState, PasswordResetItem, purple } from './shared'

export type DashboardViewProps = {
  analytics: AdminAnalytics
  onSendReset: (requestId: string) => void | Promise<void>
  passwordRequests: PasswordResetRequest[]
  schedules: CourseSchedule[]
  scanRecordsCount: number
  tickets: CorrectionTicket[]
  users: AdminUser[]
}

export function DashboardView({
  analytics,
  onSendReset,
  passwordRequests,
  schedules,
  scanRecordsCount,
  tickets,
  users,
}: DashboardViewProps) {
  const studentCount = users.filter((user) => user.role === 'Mahasiswa').length
  const activeSessions = schedules.filter((schedule) => schedule.status === 'active')
  const pendingTickets = tickets.filter((ticket) => ticket.status === 'Menunggu')
  const pendingResets = passwordRequests.filter((request) => request.status !== 'SENT' && request.status !== 'USED')

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard icon={Users} label="Total Mahasiswa" value={studentCount} />
        <AdminStatCard icon={Radio} label="Sesi Aktif" tone="green" value={activeSessions.length} />
        <AdminStatCard icon={TicketIcon} label="Tiket Masuk" tone="red" value={pendingTickets.length} />
        <AdminStatCard icon={TrendingUp} label="Rata-rata Hadir" tone="blue" value="84%" />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <AdminCard title="Tren Kehadiran Bulanan">
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={analytics.monthlyAttendance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line dataKey="percentage" name="Persentase (%)" stroke={purple} strokeWidth={3} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </AdminCard>

        <AdminCard title="Sesi Per Hari (Minggu Ini)">
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
        </AdminCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <AdminCard title="Aktivitas Backend">
          <div className="grid gap-3">
            <ActivityTile label="Scan tersimpan" value={scanRecordsCount} />
            <ActivityTile label="Tiket koreksi" value={pendingTickets.length} />
            <ActivityTile label="Reset password" value={pendingResets.length} />
          </div>
        </AdminCard>

        <AdminCard title="Reset Password">
          <div className="space-y-3">
            {passwordRequests.slice(0, 3).map((request) => (
              <PasswordResetItem key={request.id} onSend={() => onSendReset(request.id)} request={request} />
            ))}
            {!passwordRequests.length ? <EmptyState text="Belum ada permintaan reset password." /> : null}
          </div>
        </AdminCard>

        <AdminCard title="Tiket Koreksi">
          <div className="space-y-3">
            {pendingTickets.slice(0, 3).map((ticket) => (
              <div key={ticket.id} className="rounded-[8px] border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-black text-slate-950">{ticket.studentName}</p>
                  <span className="rounded-full bg-[#5c3386]/10 px-3 py-1 text-xs font-black text-[#5c3386]">{ticket.status}</span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  NIM: {ticket.studentId} - {ticket.courseTitle} - {ticket.date}
                </p>
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">{ticket.reason}</p>
              </div>
            ))}
            {!pendingTickets.length ? <EmptyState text="Belum ada tiket." /> : null}
          </div>
        </AdminCard>
      </section>
    </div>
  )
}
