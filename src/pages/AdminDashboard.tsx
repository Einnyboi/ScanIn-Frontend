import { useMemo, useState } from 'react'

import { DashboardShell } from '../components/dashboard/DashboardShell'
import { StatCard } from '../components/dashboard/StatCard'
import { correctionTickets } from '../data/mockAttendance'
import { loadLocalProfiles } from '../lib/localSession'
import type { CorrectionTicket } from '../types/attendance'
import type { LocalSession } from '../types/auth'
import { loadStoredScanRecords } from '../utils/attendanceStorage'
import { loadCorrectionTickets } from '../utils/tickets'
import { AdminAttendance } from './AdminAttendance'

type AdminDashboardProps = {
  session: LocalSession
  onLogout: () => void
}

type AdminView = 'attendance' | 'tickets' | 'accounts'

export function AdminDashboard({ session, onLogout }: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<AdminView>('attendance')
  const profiles = useMemo(() => loadLocalProfiles(), [])
  const tickets = useMemo(() => loadCorrectionTickets(correctionTickets), [])
  const scanRecords = useMemo(() => loadStoredScanRecords(), [])
  const studentCount = profiles.filter((profile) => profile.role === 'mahasiswa')
    .length
  const lecturerCount = profiles.filter((profile) => profile.role === 'pengajar')
    .length
  const pendingTicketCount = tickets.filter((ticket) => ticket.status === 'Menunggu')
    .length

  return (
    <DashboardShell session={session} onLogout={onLogout}>
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Mahasiswa"
            value={`${Math.max(studentCount, 120)}`}
            icon={<DotIcon />}
            onClick={() => setActiveView('accounts')}
          />
          <StatCard
            label="Pengajar"
            value={`${Math.max(lecturerCount, 12)}`}
            tone="green"
            icon={<DotIcon />}
            onClick={() => setActiveView('accounts')}
          />
          <StatCard
            label="Tiket Aktif"
            value={`${pendingTicketCount}`}
            tone="red"
            icon={<DotIcon />}
            onClick={() => setActiveView('tickets')}
          />
          <StatCard
            label="Scan Lokal"
            value={`${scanRecords.length}`}
            tone="yellow"
            icon={<DotIcon />}
            onClick={() => setActiveView('attendance')}
          />
        </section>

        <section className="rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
                Panel Admin
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Ringkasan Sistem
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                Admin sekarang terhubung ke data lokal: akun yang login, tiket
                koreksi mahasiswa, dan hasil scan/manual dari pengajar.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <AdminTab
                isActive={activeView === 'attendance'}
                label="Presensi"
                onClick={() => setActiveView('attendance')}
              />
              <AdminTab
                isActive={activeView === 'tickets'}
                label="Tiket"
                onClick={() => setActiveView('tickets')}
              />
              <AdminTab
                isActive={activeView === 'accounts'}
                label="Akun"
                onClick={() => setActiveView('accounts')}
              />
            </div>
          </div>
        </section>

        {activeView === 'attendance' ? <AdminAttendance /> : null}
        {activeView === 'tickets' ? <AdminTicketPanel tickets={tickets} /> : null}
        {activeView === 'accounts' ? <AdminAccountPanel profiles={profiles} /> : null}
      </div>
    </DashboardShell>
  )
}

function AdminTab({
  isActive,
  label,
  onClick,
}: {
  isActive: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 items-center justify-center rounded-[8px] px-4 text-sm font-black transition ${
        isActive
          ? 'bg-[#5c3386] text-white'
          : 'border border-[#5c3386]/20 bg-white text-[#5c3386] hover:bg-[#5c3386]/8'
      }`}
    >
      {label}
    </button>
  )
}

function AdminTicketPanel({ tickets }: { tickets: CorrectionTicket[] }) {
  return (
    <section className="rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/6">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
        Tiket Koreksi
      </p>
      <h2 className="mt-1 text-2xl font-black text-slate-950">
        Tiket dari Mahasiswa
      </h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse text-left">
          <thead className="bg-slate-50">
            <tr>
              {['Mahasiswa', 'NIM', 'Mata Kuliah', 'Tanggal', 'Status', 'Alasan'].map(
                (column) => (
                  <th
                    key={column}
                    className="px-4 py-4 text-sm font-black text-slate-600"
                  >
                    {column}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="px-4 py-4 text-sm font-black text-slate-900">
                  {ticket.studentName}
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                  {ticket.studentId}
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                  {ticket.courseTitle}
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                  {ticket.date}
                </td>
                <td className="px-4 py-4">
                  <TicketStatus status={ticket.status} />
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                  {ticket.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function AdminAccountPanel({ profiles }: { profiles: LocalSession[] }) {
  return (
    <section className="rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/6">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
        Akun Lokal
      </p>
      <h2 className="mt-1 text-2xl font-black text-slate-950">
        Akun yang Pernah Login
      </h2>
      <div className="mt-5 grid gap-3">
        {profiles.length ? (
          profiles.map((profile) => (
            <div
              key={`${profile.role}-${profile.identity}`}
              className="flex flex-col gap-2 rounded-[8px] border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-black text-slate-950">{profile.name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {profile.identity}
                </p>
              </div>
              <span className="rounded-full bg-[#5c3386]/10 px-3 py-1 text-xs font-black uppercase text-[#5c3386]">
                {profile.role}
              </span>
            </div>
          ))
        ) : (
          <p className="rounded-[8px] bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">
            Belum ada akun lokal selain sesi aktif.
          </p>
        )}
      </div>
    </section>
  )
}

function TicketStatus({ status }: { status: CorrectionTicket['status'] }) {
  const tone =
    status === 'Disetujui'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'Ditolak'
        ? 'bg-[#7d2228]/10 text-[#7d2228]'
        : 'bg-amber-100 text-amber-700'

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}>
      {status}
    </span>
  )
}

function DotIcon() {
  return <span className="h-6 w-6 rounded-full bg-current" />
}
