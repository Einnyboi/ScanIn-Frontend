import { type ReactNode, useEffect, useState } from 'react'
import { Bell, CalendarDays, Clock } from 'lucide-react'

import { getRoleOption } from '../../lib/roleOptions'
import type { LocalSession } from '../../types/auth'
import { SupportPanel } from './SupportPanel'

type DashboardShellProps = {
  session: LocalSession
  children: ReactNode
  notificationCount?: number
  notificationLabel?: string
  onNotificationClick?: () => void
  onLogout: () => void
}

export function DashboardShell({
  session,
  children,
  notificationCount = 0,
  notificationLabel = 'Notifikasi',
  onNotificationClick,
  onLogout,
}: DashboardShellProps) {
  const [isSupportOpen, setIsSupportOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const role = getRoleOption(session.role)
  const canUseSupport = session.role !== 'admin'

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/92 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#5c3386] text-white shadow-lg shadow-[#5c3386]/20 sm:h-14 sm:w-14">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
                <path
                  d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M4 21a8 8 0 0 1 16 0"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
                {role.dashboardLabel}
              </p>
              <h1 className="truncate text-xl font-black text-slate-950 sm:text-2xl">
                {session.name}
              </h1>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-500">
                {role.fieldLabel}: {session.identity}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <div className="col-span-2 flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-600 sm:col-span-1">
              <CalendarDays className="h-4 w-4 text-[#5c3386]" aria-hidden="true" />
              <span className="hidden sm:inline">{formatDashboardDate(now)}</span>
              <Clock className="h-4 w-4 text-[#7d2228]" aria-hidden="true" />
              <span>{formatDashboardTime(now)}</span>
            </div>
            <button
              type="button"
              onClick={onNotificationClick}
              className="relative flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-600 transition hover:border-[#5c3386]/40 hover:text-[#5c3386]"
              aria-label={`${notificationCount} ${notificationLabel}`}
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="ml-2 hidden sm:inline">{notificationLabel}</span>
              {notificationCount ? (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#7d2228] px-1.5 text-[11px] font-black text-white">
                  {notificationCount}
                </span>
              ) : null}
            </button>
            {canUseSupport ? (
              <button
                type="button"
                onClick={() => setIsSupportOpen(true)}
                className="flex h-11 items-center justify-center rounded-lg border border-[#5c3386]/20 bg-[#5c3386]/8 px-4 text-sm font-black text-[#5c3386] transition hover:bg-[#5c3386] hover:text-white"
              >
                Bantuan Admin
              </button>
            ) : null}
            <button
              type="button"
              onClick={onLogout}
              className="flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:border-[#7d2228]/40 hover:text-[#7d2228]"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-5 lg:px-8 lg:py-8">
        {children}
      </main>

      {canUseSupport ? (
        <>
          <button
            type="button"
            onClick={() => setIsSupportOpen(true)}
            className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-lg bg-[#5c3386] text-xl font-black text-white shadow-2xl shadow-[#5c3386]/30 transition hover:-translate-y-1 hover:bg-[#4f2b73]"
            aria-label="Buka bantuan admin"
          >
            ?
          </button>

          <SupportPanel
            session={session}
            isOpen={isSupportOpen}
            onClose={() => setIsSupportOpen(false)}
          />
        </>
      ) : null}
    </div>
  )
}

function formatDashboardDate(date: Date) {
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDashboardTime(date: Date) {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
