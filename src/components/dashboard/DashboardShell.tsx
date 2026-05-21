import { type ReactNode, useState } from 'react'

import { getRoleOption } from '../../lib/roleOptions'
import type { LocalSession } from '../../types/auth'
import { SupportPanel } from './SupportPanel'

type DashboardShellProps = {
  session: LocalSession
  children: ReactNode
  onLogout: () => void
}

export function DashboardShell({
  session,
  children,
  onLogout,
}: DashboardShellProps) {
  const [isSupportOpen, setIsSupportOpen] = useState(false)
  const role = getRoleOption(session.role)

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/92 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[8px] bg-[#5c3386] text-white shadow-lg shadow-[#5c3386]/20">
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
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
                {role.dashboardLabel}
              </p>
              <h1 className="text-2xl font-black text-slate-950">
                {session.name}
              </h1>
              <p className="mt-0.5 text-sm font-semibold text-slate-500">
                {role.fieldLabel}: {session.identity}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsSupportOpen(true)}
              className="flex h-11 items-center justify-center rounded-[8px] border border-[#5c3386]/20 bg-[#5c3386]/8 px-4 text-sm font-black text-[#5c3386] transition hover:bg-[#5c3386] hover:text-white"
            >
              Bantuan Admin
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-11 items-center justify-center rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:border-[#7d2228]/40 hover:text-[#7d2228]"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-8">
        {children}
      </main>

      <button
        type="button"
        onClick={() => setIsSupportOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-[8px] bg-[#5c3386] text-xl font-black text-white shadow-2xl shadow-[#5c3386]/30 transition hover:-translate-y-1 hover:bg-[#4f2b73]"
        aria-label="Buka bantuan admin"
      >
        ?
      </button>

      <SupportPanel
        session={session}
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  )
}

