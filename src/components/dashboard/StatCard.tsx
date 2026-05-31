import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: string
  tone?: 'purple' | 'red' | 'yellow' | 'green'
  icon: ReactNode
  onClick?: () => void
}

const toneClass = {
  purple: 'bg-[#5c3386]/12 text-[#5c3386]',
  red: 'bg-[#7d2228]/12 text-[#7d2228]',
  yellow: 'bg-amber-100 text-amber-700',
  green: 'bg-emerald-100 text-emerald-700',
}

export function StatCard({
  label,
  value,
  tone = 'purple',
  icon,
  onClick,
}: StatCardProps) {
  const content = (
    <div className="flex items-center gap-3 sm:gap-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg sm:h-14 sm:w-14 ${toneClass[tone]}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">{value}</p>
      </div>
    </div>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group w-full rounded-lg border border-white bg-white p-4 text-left shadow-lg shadow-slate-900/6 transition hover:-translate-y-0.5 hover:border-[#5c3386]/30 hover:shadow-xl hover:shadow-[#5c3386]/10 sm:p-5"
      >
        {content}
        <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400 transition group-hover:text-[#5c3386]">
          Lihat grafik
        </p>
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-white bg-white p-4 shadow-lg shadow-slate-900/6 sm:p-5">
      {content}
    </div>
  )
}
