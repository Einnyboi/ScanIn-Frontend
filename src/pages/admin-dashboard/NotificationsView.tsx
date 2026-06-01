import type { CorrectionTicket } from '../../types/attendance'
import type { SupportComplaint } from '../../utils/complaints'
import type { PasswordResetRequest } from '../../utils/passwordReset'
import { formatNotificationDate, formatSupportRole, isPasswordResetActionable } from '../../utils/adminDashboard'

import { AdminCard, EmptyState, NotificationTypeBadge, SimpleStat, StatusBadge } from './shared'

export type NotificationsViewProps = {
  complaints: SupportComplaint[]
  onSendReset: (requestId: string) => void | Promise<void>
  onTicketAction: (ticketId: string, status: CorrectionTicket['status']) => void
  passwordRequests: PasswordResetRequest[]
  tickets: CorrectionTicket[]
}

export function NotificationsView({
  complaints,
  onSendReset,
  onTicketAction,
  passwordRequests,
  tickets,
}: NotificationsViewProps) {
  const pendingTickets = tickets.filter((ticket) => ticket.status === 'Menunggu')
  const processedTickets = tickets.filter((ticket) => ticket.status !== 'Menunggu')
  const newPasswordRequests = passwordRequests.filter(isPasswordResetActionable)
  const sentPasswordRequests = passwordRequests.filter(
    (request) => request.status === 'Dikirim' && !isPasswordResetActionable(request),
  )
  const newComplaints = complaints.filter((complaint) => complaint.status === 'Baru')
  const processedComplaints = complaints.filter((complaint) => complaint.status !== 'Baru')
  const hasActiveNotifications = pendingTickets.length || newPasswordRequests.length || newComplaints.length
  const hasHistory = processedTickets.length || sentPasswordRequests.length || processedComplaints.length

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <SimpleStat label="Semua Notifikasi" value={tickets.length + passwordRequests.length + complaints.length} />
        <SimpleStat label="Tiket Baru" tone="yellow" value={pendingTickets.length} />
        <SimpleStat label="Reset Password" tone="blue" value={newPasswordRequests.length} />
        <SimpleStat label="Pengaduan Akun" tone="red" value={newComplaints.length} />
      </section>

      <AdminCard title="Perlu Ditindaklanjuti">
        <div className="grid gap-4">
          {pendingTickets.map((ticket) => (
            <article key={ticket.id} className="rounded-[8px] border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <NotificationTypeBadge label="Tiket Koreksi" />
                  <p className="mt-3 text-lg font-black text-slate-950">{ticket.studentName}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    NIM: {ticket.studentId} - {ticket.courseTitle} - {ticket.date}
                  </p>
                  <p className="mt-3 rounded-[8px] bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
                    {ticket.reason}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button type="button" onClick={() => onTicketAction(ticket.id, 'Disetujui')} className="flex h-11 items-center gap-2 rounded-[8px] bg-[#5c3386] px-4 text-sm font-black text-white">
                    Setujui
                  </button>
                  <button type="button" onClick={() => onTicketAction(ticket.id, 'Ditolak')} className="flex h-11 items-center gap-2 rounded-[8px] border border-[#7d2228] px-4 text-sm font-black text-[#7d2228]">
                    Tolak
                  </button>
                </div>
              </div>
            </article>
          ))}

          {newPasswordRequests.map((request) => (
            <article key={request.id} className="rounded-[8px] border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <NotificationTypeBadge label="Email Reset Password" tone="purple" />
                  <p className="mt-3 text-lg font-black text-slate-950">{request.name}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {request.identity} - {request.role} - {formatNotificationDate(request.createdAt)}
                  </p>
                  <p className="mt-3 rounded-[8px] bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
                    Kirim tautan reset ke {request.registeredEmail}
                  </p>
                </div>
                <button type="button" onClick={() => onSendReset(request.id)} className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#5c3386] px-4 text-sm font-black text-white">
                  Kirim Email Reset
                </button>
              </div>
            </article>
          ))}

          {newComplaints.map((complaint) => (
            <article key={complaint.id} className="rounded-[8px] border border-slate-200 bg-white p-5">
              <NotificationTypeBadge label="Pengaduan Akun" tone="red" />
              <p className="mt-3 text-lg font-black text-slate-950">{complaint.name}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {formatSupportRole(complaint.role)} - {complaint.identity} - {formatNotificationDate(complaint.createdAt)}
              </p>
              <p className="mt-2 text-sm font-black text-[#5c3386]">{complaint.category}</p>
              <p className="mt-3 rounded-[8px] bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
                {complaint.message}
              </p>
            </article>
          ))}

          {!hasActiveNotifications ? <EmptyState text="Belum ada notifikasi baru yang perlu ditindaklanjuti." /> : null}
        </div>
      </AdminCard>

      <AdminCard title="Riwayat Notifikasi">
        <div className="grid gap-4">
          {processedTickets.slice(0, 5).map((ticket) => (
            <article key={ticket.id} className="flex flex-col gap-3 rounded-[8px] border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <NotificationTypeBadge label="Tiket Koreksi" tone="purple" />
                <p className="mt-3 font-black text-slate-950">{ticket.studentName} - {ticket.courseTitle}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{ticket.date}</p>
              </div>
              <StatusBadge status={ticket.status} />
            </article>
          ))}

          {sentPasswordRequests.slice(0, 5).map((request) => (
            <article key={request.id} className="flex flex-col gap-3 rounded-[8px] border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <NotificationTypeBadge label="Email Reset Password" />
                <p className="mt-3 font-black text-slate-950">{request.name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">Dikirim ke {request.registeredEmail}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-700">Dikirim</span>
            </article>
          ))}

          {processedComplaints.slice(0, 5).map((complaint) => (
            <article key={complaint.id} className="flex flex-col gap-3 rounded-[8px] border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <NotificationTypeBadge label="Pengaduan Akun" tone="red" />
                <p className="mt-3 font-black text-slate-950">{complaint.name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{complaint.category}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">{complaint.status}</span>
            </article>
          ))}

          {!hasHistory ? <EmptyState text="Riwayat notifikasi akan muncul setelah admin memproses permintaan." /> : null}
        </div>
      </AdminCard>
    </div>
  )
}
