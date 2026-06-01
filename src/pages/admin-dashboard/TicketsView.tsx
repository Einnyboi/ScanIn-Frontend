import type { CorrectionTicket } from '../../types/attendance'

import { AdminCard, EmptyState, SimpleStat, StatusBadge } from './shared'

export type TicketsViewProps = {
  onTicketAction: (ticketId: string, status: CorrectionTicket['status']) => void
  tickets: CorrectionTicket[]
}

export function TicketsView({ onTicketAction, tickets }: TicketsViewProps) {
  const waiting = tickets.filter((ticket) => ticket.status === 'Menunggu').length
  const pendingTickets = tickets.filter((ticket) => ticket.status === 'Menunggu')

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <SimpleStat label="Total Tiket" value={tickets.length} />
        <SimpleStat label="Menunggu" tone="yellow" value={waiting} />
        <SimpleStat label="Disetujui" tone="green" value={tickets.filter((ticket) => ticket.status === 'Disetujui').length} />
        <SimpleStat label="Ditolak" tone="red" value={tickets.filter((ticket) => ticket.status === 'Ditolak').length} />
      </section>

      <div className="grid gap-4">
        {pendingTickets.map((ticket) => (
          <article key={ticket.id} className="rounded-[8px] border-l-4 border-[#5c3386] bg-white p-5 shadow-lg shadow-slate-900/8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg font-black text-slate-950">{ticket.studentName}</p>
                  <span className="text-sm font-semibold text-slate-500">NIM: {ticket.studentId}</span>
                  <StatusBadge status={ticket.status} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-600">
                  <span className="font-black">Mata Kuliah:</span> {ticket.courseTitle}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  <span className="font-black">Tanggal:</span> {ticket.date}
                </p>
                <p className="mt-3 rounded-[8px] bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
                  <span className="font-black">Alasan:</span> {ticket.reason}
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
        {!pendingTickets.length ? <EmptyState text="Belum ada tiket koreksi baru yang perlu ditinjau." /> : null}
      </div>
    </div>
  )
}
