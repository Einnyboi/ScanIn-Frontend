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
    <div className="flex items-center gap-4">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-[8px] ${toneClass[tone]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-black text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
      </div>
    </div>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group w-full rounded-[8px] border border-white bg-white p-5 text-left shadow-lg shadow-slate-900/6 transition hover:-translate-y-0.5 hover:border-[#5c3386]/30 hover:shadow-xl hover:shadow-[#5c3386]/10"
      >
        {content}
        <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400 transition group-hover:text-[#5c3386]">
          Lihat grafik
        </p>
      </button>
    )
  }

  return (
    <div className="rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/6">
      {content}
    </div>
  )
}
