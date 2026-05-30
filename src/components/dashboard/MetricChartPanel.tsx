export type ChartItem = {
  label: string
  value: number
  detail: string
  tone?: 'purple' | 'red' | 'yellow' | 'green'
}

type MetricChartPanelProps = {
  title: string
  description: string
  items: ChartItem[]
  onClose: () => void
}

const barTone = {
  purple: 'bg-[#5c3386]',
  red: 'bg-[#7d2228]',
  yellow: 'bg-amber-500',
  green: 'bg-emerald-500',
}

export function MetricChartPanel({
  title,
  description,
  items,
  onClose,
}: MetricChartPanelProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1)

  return (
    <section className="metric-panel rounded-lg border border-white bg-white p-5 shadow-lg shadow-slate-900/6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
            Statistik
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">{title}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-black text-slate-500 transition hover:border-[#7d2228]/40 hover:text-[#7d2228]"
        >
          Tutup
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {items.map((item) => {
          const width = Math.max(8, (item.value / maxValue) * 100)
          const tone = item.tone ?? 'purple'

          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-black text-slate-700">{item.label}</span>
                <span className="font-bold text-slate-500">{item.detail}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${barTone[tone]} transition-all duration-500`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

