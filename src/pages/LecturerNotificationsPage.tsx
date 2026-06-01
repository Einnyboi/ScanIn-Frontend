import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, Inbox, X } from 'lucide-react'

import { DashboardShell } from '../components/dashboard/DashboardShell'
import type { CorrectionTicket } from '../types/attendance'
import type { LocalSession } from '../types/auth'
import { saveTicketNotification } from '../utils/notifications'
import {
  fetchTicketsFromBackend,
  ticketsChangedEvent,
  updateStoredTicket,
} from '../utils/tickets'

type LecturerNotificationsPageProps = {
  session: LocalSession
  onLogout: () => void
}

export function LecturerNotificationsPage({
  session,
  onLogout,
}: LecturerNotificationsPageProps) {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<CorrectionTicket[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const reloadTickets = () =>
      void fetchTicketsFromBackend([]).then((backendTickets) => {
        setTickets(backendTickets ?? [])
      })

    reloadTickets()
    window.addEventListener('storage', reloadTickets)
    window.addEventListener(ticketsChangedEvent, reloadTickets)
    return () => {
      window.removeEventListener('storage', reloadTickets)
      window.removeEventListener(ticketsChangedEvent, reloadTickets)
    }
  }, [])

  const pendingTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === 'Menunggu'),
    [tickets],
  )

  const updateTicket = async (
    ticket: CorrectionTicket,
    status: 'Disetujui' | 'Ditolak',
  ) => {
    const nextTicket = { ...ticket, status }
    setTickets((currentTickets) =>
      currentTickets.map((item) => (item.id === ticket.id ? nextTicket : item)),
    )

    try {
      const savedTicket = await updateStoredTicket(nextTicket)
      saveTicketNotification(savedTicket, status, 'pengajar')
      setMessage(
        `Tiket ${ticket.studentName} sudah ${status.toLowerCase()} dan notifikasi dikirim ke mahasiswa.`,
      )
    } catch {
      setMessage('Gagal memperbarui tiket ke backend. Coba lagi.')
      setTickets((currentTickets) =>
        currentTickets.map((item) => (item.id === ticket.id ? ticket : item)),
      )
    }
  }

  return (
    <DashboardShell
      notificationCount={pendingTickets.length}
      notificationHref="/lecturer/notifications"
      notificationLabel="Tiket Baru"
      onLogout={onLogout}
      session={session}
    >
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => navigate('/lecturer')}
          className="inline-flex h-10 items-center gap-2 rounded-lg px-1 text-sm font-black text-slate-600 transition hover:text-[#5c3386]"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          Kembali ke Dashboard
        </button>

        <section className="admin-surface overflow-hidden rounded-lg border border-white bg-white shadow-xl shadow-slate-900/7">
          <div className="border-b border-slate-100 bg-gradient-to-r from-[#5c3386] to-[#7d2228] px-5 py-6 text-white sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                  Notifikasi Pengajar
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  Permohonan Koreksi
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/78">
                  Tiket baru muncul di sini. Setelah disetujui atau ditolak,
                  tiket langsung keluar dari daftar aktif dan mahasiswa menerima
                  notifikasi.
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/16 text-white shadow-lg shadow-black/10">
                <Inbox className="h-7 w-7" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {message ? (
              <p className="mb-5 rounded-lg border border-[#5c3386]/15 bg-[#5c3386]/8 px-4 py-3 text-sm font-black leading-6 text-[#5c3386]">
                {message}
              </p>
            ) : null}

            <div className="grid gap-4">
              {pendingTickets.length ? (
                pendingTickets.map((ticket, index) => (
                  <article
                    key={ticket.id}
                    className="admin-surface rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#5c3386]/30 hover:shadow-lg sm:p-5"
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-black text-slate-950">
                            {ticket.studentName}
                          </h2>
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                            Menunggu
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-bold text-slate-500">
                          NIM: {ticket.studentId}
                        </p>
                        <div className="mt-4 grid gap-2 text-sm font-semibold leading-6 text-slate-600 sm:grid-cols-2">
                          <p>
                            <strong className="text-slate-800">Mata Kuliah:</strong>{' '}
                            {ticket.courseTitle}
                          </p>
                          <p>
                            <strong className="text-slate-800">Tanggal:</strong>{' '}
                            {formatTicketDate(ticket.date)}
                          </p>
                        </div>
                        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
                          <strong className="text-slate-800">Alasan:</strong>{' '}
                          {ticket.reason}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 lg:w-48 lg:grid-cols-1">
                        <button
                          type="button"
                          onClick={() => updateTicket(ticket, 'Disetujui')}
                          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#5c3386] px-4 text-sm font-black text-white transition hover:bg-[#4f2b73]"
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                          Setujui
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTicket(ticket, 'Ditolak')}
                          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#7d2228] px-4 text-sm font-black text-[#7d2228] transition hover:bg-[#7d2228] hover:text-white"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                          Tolak
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                  <p className="text-lg font-black text-slate-950">
                    Tidak ada tiket baru
                  </p>
                  <p className="mx-auto mt-2 max-w-lg text-sm font-semibold leading-6 text-slate-500">
                    Permohonan koreksi baru dari mahasiswa akan muncul di sini
                    untuk disetujui atau ditolak.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

function formatTicketDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
