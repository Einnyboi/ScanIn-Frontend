import { useState, type ReactNode } from 'react'

export type StatisticsMode =
  | 'student-attendance'
  | 'student-late'
  | 'student-ticket'
  | 'lecturer-present'
  | 'lecturer-session'
  | 'lecturer-ticket'

type StatisticsPageProps = {
  mode: StatisticsMode
  onBack: () => void
}

type WeeklyAttendance = {
  label: string
  dateRange: string
  hadir: number
  terlambat: number
  alpha: number
}

type SessionStatistics = {
  label: string
  dateRange: string
  opened: number
  closed: number
  autoClosed: number
}

type LinePoint = {
  label: string
  detail: string
  value: number
}

type SummaryItem = {
  label: string
  value: string
  tone?: 'default' | 'green' | 'yellow' | 'red'
}

const purple = '#5c3386'
const green = '#3f9b4d'
const yellow = '#f2aa3a'
const red = '#7d2228'
const axis = '#687280'
const grid = '#d7dbe0'

const weeklyAttendance: WeeklyAttendance[] = [
  { label: 'Week 1', dateRange: '1-7 Apr 2026', hadir: 5, terlambat: 0, alpha: 0 },
  { label: 'Week 2', dateRange: '8-14 Apr 2026', hadir: 4, terlambat: 1, alpha: 0 },
  { label: 'Week 3', dateRange: '15-21 Apr 2026', hadir: 5, terlambat: 0, alpha: 0 },
  { label: 'Week 4', dateRange: '22-28 Apr 2026', hadir: 4, terlambat: 0, alpha: 0 },
  { label: 'Week 5', dateRange: '29 Apr-5 Mei 2026', hadir: 5, terlambat: 0, alpha: 0 },
  { label: 'Week 6', dateRange: '6-12 Mei 2026', hadir: 3, terlambat: 2, alpha: 0 },
  { label: 'Week 7', dateRange: '13-19 Mei 2026', hadir: 5, terlambat: 0, alpha: 0 },
  { label: 'Week 8', dateRange: '20-26 Mei 2026', hadir: 4, terlambat: 1, alpha: 1 },
]

const monthlyAttendance: LinePoint[] = [
  { label: 'Jan', detail: '1-31 Januari 2026', value: 90 },
  { label: 'Feb', detail: '1-28 Februari 2026', value: 85 },
  { label: 'Mar', detail: '1-31 Maret 2026', value: 92 },
  { label: 'Apr', detail: '1-30 April 2026', value: 88 },
  { label: 'May', detail: '1-31 Mei 2026', value: 87 },
]

const weeklyLate: LinePoint[] = [
  { label: 'Week 1', detail: '1-7 Apr 2026', value: 0 },
  { label: 'Week 2', detail: '8-14 Apr 2026', value: 1 },
  { label: 'Week 3', detail: '15-21 Apr 2026', value: 0 },
  { label: 'Week 4', detail: '22-28 Apr 2026', value: 0 },
  { label: 'Week 5', detail: '29 Apr-5 Mei 2026', value: 0 },
  { label: 'Week 6', detail: '6-12 Mei 2026', value: 2 },
  { label: 'Week 7', detail: '13-19 Mei 2026', value: 0 },
  { label: 'Week 8', detail: '20-26 Mei 2026', value: 1 },
]

const ticketTrend: LinePoint[] = [
  { label: 'Week 1', detail: '1-7 Apr 2026', value: 0 },
  { label: 'Week 2', detail: '8-14 Apr 2026', value: 1 },
  { label: 'Week 3', detail: '15-21 Apr 2026', value: 1 },
  { label: 'Week 4', detail: '22-28 Apr 2026', value: 0 },
  { label: 'Week 5', detail: '29 Apr-5 Mei 2026', value: 1 },
  { label: 'Week 6', detail: '6-12 Mei 2026', value: 0 },
]

const weeklySessions: SessionStatistics[] = [
  { label: 'Week 1', dateRange: '1-7 Apr 2026', opened: 2, closed: 2, autoClosed: 0 },
  { label: 'Week 2', dateRange: '8-14 Apr 2026', opened: 3, closed: 2, autoClosed: 1 },
  { label: 'Week 3', dateRange: '15-21 Apr 2026', opened: 3, closed: 3, autoClosed: 0 },
  { label: 'Week 4', dateRange: '22-28 Apr 2026', opened: 2, closed: 1, autoClosed: 1 },
  { label: 'Week 5', dateRange: '29 Apr-5 Mei 2026', opened: 4, closed: 3, autoClosed: 1 },
  { label: 'Week 6', dateRange: '6-12 Mei 2026', opened: 3, closed: 3, autoClosed: 0 },
]

const lateDetails = [
  {
    id: 'late-1',
    date: '17 Mei 2026',
    course: 'Kecerdasan Buatan',
    time: '13:17',
    late: '17 menit',
  },
  {
    id: 'late-2',
    date: '10 Mei 2026',
    course: 'Pemrograman Web',
    time: '10:35',
    late: '5 menit',
  },
  {
    id: 'late-3',
    date: '3 Mei 2026',
    course: 'Software Development',
    time: '08:12',
    late: '12 menit',
  },
  {
    id: 'late-4',
    date: '28 Apr 2026',
    course: 'Software Development',
    time: '08:15',
    late: '15 menit',
  },
]

const ticketDetails = [
  {
    id: 'ticket-1',
    date: '17 Mei 2026',
    course: 'Software Development',
    status: 'Menunggu',
  },
  {
    id: 'ticket-2',
    date: '16 Mei 2026',
    course: 'Pemrograman Web',
    status: 'Disetujui',
  },
  {
    id: 'ticket-3',
    date: '9 Mei 2026',
    course: 'Kecerdasan Buatan',
    status: 'Ditolak',
  },
]

const sessionDetails = [
  {
    id: 'session-1',
    date: '20 Mei 2026',
    course: 'Basis Data Lanjut',
    openedAt: '07:45',
    closedAt: '10:30',
    status: 'Auto-close',
  },
  {
    id: 'session-2',
    date: '20 Mei 2026',
    course: 'Pemrograman Web',
    openedAt: '10:10',
    closedAt: '12:18',
    status: 'Tutup manual',
  },
  {
    id: 'session-3',
    date: '19 Mei 2026',
    course: 'Kecerdasan Buatan',
    openedAt: '12:45',
    closedAt: '15:20',
    status: 'Tutup manual',
  },
]

export function StatisticsPage({ mode, onBack }: StatisticsPageProps) {
  const page = getStatisticsConfig(mode)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white px-4 py-5 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-3 text-sm font-black text-slate-600 transition hover:text-[#5c3386] sm:text-base"
        >
          <span aria-hidden="true" className="text-2xl leading-none">
            &larr;
          </span>
          Kembali ke Dashboard
        </button>
        <h1 className="mt-5 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
          {page.title}
        </h1>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-8">
        <section className="grid gap-4 md:grid-cols-4">
          {page.summary.map((item) => (
            <SummaryCard key={item.label} item={item} />
          ))}
        </section>

        {page.kind === 'attendance' ? (
          <>
            <ChartCard title="Grafik Kehadiran Mingguan">
              <WeeklyBarChart data={weeklyAttendance} />
            </ChartCard>
            <ChartCard title="Persentase Kehadiran Bulanan">
              <LineChart
                color={purple}
                data={monthlyAttendance}
                label="Persentase (%)"
                maxValue={100}
                ticks={[0, 25, 50, 75, 100]}
                valueSuffix="%"
              />
            </ChartCard>
          </>
        ) : null}

        {page.kind === 'late' ? (
          <>
            <ChartCard title="Tren Keterlambatan Mingguan">
              <LineChart
                color={yellow}
                data={weeklyLate}
                label="Jumlah Terlambat"
                maxValue={2}
                ticks={[0, 0.5, 1, 1.5, 2]}
                valueSuffix=" kali"
              />
            </ChartCard>
            <DetailTable
              columns={['Tanggal', 'Mata Kuliah', 'Jam Masuk', 'Keterlambatan']}
              title="Detail Keterlambatan"
              rows={lateDetails.map((detail) => [
                detail.date,
                detail.course,
                detail.time,
                detail.late,
              ])}
              tone="yellow"
            />
          </>
        ) : null}

        {page.kind === 'ticket' ? (
          <>
            <ChartCard title="Tren Tiket Koreksi">
              <LineChart
                color={red}
                data={ticketTrend}
                label="Jumlah Tiket"
                maxValue={2}
                ticks={[0, 1, 2]}
                valueSuffix=" tiket"
              />
            </ChartCard>
            <DetailTable
              columns={['Tanggal', 'Mata Kuliah', 'Status']}
              title="Detail Tiket Koreksi"
              rows={ticketDetails.map((detail) => [
                detail.date,
                detail.course,
                detail.status,
              ])}
              tone="red"
            />
          </>
        ) : null}

        {page.kind === 'session' ? (
          <>
            <ChartCard title="Grafik Sesi Absensi Mingguan">
              <SessionBarChart data={weeklySessions} />
            </ChartCard>
            <DetailTable
              columns={['Tanggal', 'Mata Kuliah', 'Sesi Dibuka', 'Tutup Sesi', 'Status']}
              title="Detail Sesi Absensi"
              rows={sessionDetails.map((detail) => [
                detail.date,
                detail.course,
                detail.openedAt,
                detail.closedAt,
                detail.status,
              ])}
              tone="purple"
            />
          </>
        ) : null}
      </div>
    </main>
  )
}

function SummaryCard({ item }: { item: SummaryItem }) {
  const valueColor =
    item.tone === 'green'
      ? 'text-[#3f9b4d]'
      : item.tone === 'yellow'
        ? 'text-[#c28a08]'
        : item.tone === 'red'
          ? 'text-[#c82127]'
          : 'text-slate-950'

  return (
    <div className="rounded-[8px] border border-white bg-white p-6 shadow-lg shadow-slate-900/8">
      <p className="text-sm font-bold text-slate-500">{item.label}</p>
      <p className={`mt-4 text-4xl font-black ${valueColor}`}>{item.value}</p>
    </div>
  )
}

function ChartCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/8 sm:p-7">
      <h2 className="text-2xl font-black text-slate-950">{title}</h2>
      <div className="mt-6 overflow-x-auto pb-2">{children}</div>
    </section>
  )
}

function WeeklyBarChart({ data }: { data: WeeklyAttendance[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const width = 940
  const height = 330
  const chartLeft = 54
  const chartTop = 22
  const chartWidth = 840
  const chartHeight = 230
  const maxValue = 8
  const groupWidth = chartWidth / data.length
  const bars = [
    { key: 'hadir' as const, color: purple, label: 'Hadir' },
    { key: 'terlambat' as const, color: yellow, label: 'Terlambat' },
    { key: 'alpha' as const, color: red, label: 'Alpha' },
  ]

  const yPosition = (value: number) =>
    chartTop + chartHeight - (value / maxValue) * chartHeight
  const selectedItem =
    selectedIndex === null ? null : data[Math.min(selectedIndex, data.length - 1)]
  const selectedX =
    selectedIndex === null
      ? 0
      : chartLeft + selectedIndex * groupWidth + groupWidth / 2

  return (
    <div className="min-w-[900px]">
      <p className="mb-3 text-sm font-bold text-slate-500">
        Klik bar grafik untuk melihat detail hadir, terlambat, dan alpha.
      </p>
      <svg
        role="img"
        aria-label="Grafik kehadiran mingguan"
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
      >
        {[0, 2, 4, 6, 8].map((tick) => {
          const y = yPosition(tick)
          return (
            <g key={tick}>
              <line
                x1={chartLeft}
                x2={chartLeft + chartWidth}
                y1={y}
                y2={y}
                stroke={grid}
                strokeDasharray="4 4"
              />
              <text
                fill={axis}
                fontSize="14"
                fontWeight="700"
                textAnchor="end"
                x={chartLeft - 10}
                y={y + 5}
              >
                {tick}
              </text>
            </g>
          )
        })}

        <line
          x1={chartLeft}
          x2={chartLeft}
          y1={chartTop}
          y2={chartTop + chartHeight}
          stroke={axis}
          strokeWidth="1.5"
        />
        <line
          x1={chartLeft}
          x2={chartLeft + chartWidth}
          y1={chartTop + chartHeight}
          y2={chartTop + chartHeight}
          stroke={axis}
          strokeWidth="1.5"
        />

        {selectedIndex !== null ? (
          <rect
            fill="rgba(148, 163, 184, 0.28)"
            height={chartHeight}
            pointerEvents="none"
            width={groupWidth * 0.62}
            x={selectedX - groupWidth * 0.31}
            y={chartTop}
          />
        ) : null}

        {data.map((item, itemIndex) => {
          const groupX = chartLeft + itemIndex * groupWidth + groupWidth / 2
          return (
            <g key={item.label}>
              {bars.map((bar, barIndex) => {
                const barWidth = 12
                const gap = 6
                const value = item[bar.key]
                const x = groupX - 27 + barIndex * (barWidth + gap)
                const y = yPosition(value)
                const barHeight = chartTop + chartHeight - y

                return (
                  <rect
                    key={bar.key}
                    className="cursor-pointer"
                    fill={bar.color}
                    height={barHeight}
                    onClick={() => setSelectedIndex(itemIndex)}
                    rx="2"
                    width={barWidth}
                    x={x}
                    y={y}
                  >
                    <title>{`${item.label} - ${bar.label}: ${value}`}</title>
                  </rect>
                )
              })}
              <text
                fill={axis}
                fontSize="15"
                fontWeight="700"
                textAnchor="middle"
                x={groupX}
                y={chartTop + chartHeight + 28}
              >
                {item.label}
              </text>
            </g>
          )
        })}

        {selectedItem ? (
          <>
            <g
              transform={`translate(${Math.min(
                selectedX + 18,
                chartLeft + chartWidth - 150,
              )} ${chartTop + 16})`}
            >
              <rect fill="white" height="124" stroke="#d1d5db" width="142" />
              <text fill="#020617" fontSize="15" fontWeight="900" x="14" y="26">
                {selectedItem.label}
              </text>
              <text fill={axis} fontSize="11" fontWeight="800" x="14" y="44">
                {selectedItem.dateRange}
              </text>
              <text fill={purple} fontSize="14" fontWeight="800" x="14" y="64">
                Hadir: {selectedItem.hadir}
              </text>
              <text fill={yellow} fontSize="14" fontWeight="800" x="14" y="88">
                Terlambat: {selectedItem.terlambat}
              </text>
              <text fill={red} fontSize="14" fontWeight="800" x="14" y="112">
                Tidak hadir: {selectedItem.alpha}
              </text>
            </g>
          </>
        ) : null}
      </svg>
      <ChartLegend
        items={[
          { label: 'Hadir', color: purple },
          { label: 'Terlambat', color: yellow },
          { label: 'Alpha', color: red },
        ]}
      />
    </div>
  )
}

function SessionBarChart({ data }: { data: SessionStatistics[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const width = 940
  const height = 330
  const chartLeft = 54
  const chartTop = 22
  const chartWidth = 840
  const chartHeight = 230
  const maxValue = 5
  const groupWidth = chartWidth / data.length
  const bars = [
    { key: 'opened' as const, color: purple, label: 'Sesi dibuka' },
    { key: 'closed' as const, color: green, label: 'Tutup manual' },
    { key: 'autoClosed' as const, color: yellow, label: 'Auto-close' },
  ]

  const yPosition = (value: number) =>
    chartTop + chartHeight - (value / maxValue) * chartHeight
  const selectedItem =
    selectedIndex === null ? null : data[Math.min(selectedIndex, data.length - 1)]
  const selectedX =
    selectedIndex === null
      ? 0
      : chartLeft + selectedIndex * groupWidth + groupWidth / 2

  return (
    <div className="min-w-[900px]">
      <p className="mb-3 text-sm font-bold text-slate-500">
        Klik bar grafik untuk melihat jumlah sesi dibuka, tutup manual, dan auto-close.
      </p>
      <svg
        role="img"
        aria-label="Grafik sesi absensi mingguan"
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
      >
        {[0, 1, 2, 3, 4, 5].map((tick) => {
          const y = yPosition(tick)
          return (
            <g key={tick}>
              <line
                x1={chartLeft}
                x2={chartLeft + chartWidth}
                y1={y}
                y2={y}
                stroke={grid}
                strokeDasharray="4 4"
              />
              <text
                fill={axis}
                fontSize="14"
                fontWeight="700"
                textAnchor="end"
                x={chartLeft - 10}
                y={y + 5}
              >
                {tick}
              </text>
            </g>
          )
        })}

        <line
          x1={chartLeft}
          x2={chartLeft}
          y1={chartTop}
          y2={chartTop + chartHeight}
          stroke={axis}
          strokeWidth="1.5"
        />
        <line
          x1={chartLeft}
          x2={chartLeft + chartWidth}
          y1={chartTop + chartHeight}
          y2={chartTop + chartHeight}
          stroke={axis}
          strokeWidth="1.5"
        />

        {selectedIndex !== null ? (
          <rect
            fill="rgba(148, 163, 184, 0.22)"
            height={chartHeight}
            pointerEvents="none"
            width={groupWidth * 0.66}
            x={selectedX - groupWidth * 0.33}
            y={chartTop}
          />
        ) : null}

        {data.map((item, itemIndex) => {
          const groupX = chartLeft + itemIndex * groupWidth + groupWidth / 2

          return (
            <g key={item.label}>
              {bars.map((bar, barIndex) => {
                const barWidth = 14
                const gap = 7
                const value = item[bar.key]
                const x = groupX - 32 + barIndex * (barWidth + gap)
                const y = yPosition(value)
                const barHeight = chartTop + chartHeight - y

                return (
                  <rect
                    key={bar.key}
                    className="cursor-pointer"
                    fill={bar.color}
                    height={barHeight}
                    onClick={() => setSelectedIndex(itemIndex)}
                    rx="2"
                    width={barWidth}
                    x={x}
                    y={y}
                  >
                    <title>{`${item.label} - ${bar.label}: ${value}`}</title>
                  </rect>
                )
              })}
              <text
                fill={axis}
                fontSize="15"
                fontWeight="700"
                textAnchor="middle"
                x={groupX}
                y={chartTop + chartHeight + 28}
              >
                {item.label}
              </text>
            </g>
          )
        })}

        {selectedItem ? (
          <g
            pointerEvents="none"
            transform={`translate(${Math.min(
              selectedX + 18,
              chartLeft + chartWidth - 174,
            )} ${chartTop + 16})`}
          >
            <rect fill="white" height="124" stroke="#d1d5db" width="166" />
            <text fill="#020617" fontSize="15" fontWeight="900" x="14" y="26">
              {selectedItem.label}
            </text>
            <text fill={axis} fontSize="11" fontWeight="800" x="14" y="44">
              {selectedItem.dateRange}
            </text>
            <text fill={purple} fontSize="14" fontWeight="800" x="14" y="64">
              Dibuka: {selectedItem.opened}
            </text>
            <text fill={green} fontSize="14" fontWeight="800" x="14" y="88">
              Tutup manual: {selectedItem.closed}
            </text>
            <text fill={yellow} fontSize="14" fontWeight="800" x="14" y="112">
              Auto-close: {selectedItem.autoClosed}
            </text>
          </g>
        ) : null}
      </svg>
      <ChartLegend
        items={[
          { label: 'Sesi dibuka', color: purple },
          { label: 'Tutup manual', color: green },
          { label: 'Auto-close', color: yellow },
        ]}
      />
    </div>
  )
}

function LineChart({
  color,
  data,
  label,
  maxValue,
  ticks,
  valueSuffix = '',
}: {
  color: string
  data: LinePoint[]
  label: string
  maxValue: number
  ticks: number[]
  valueSuffix?: string
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const width = 940
  const height = 330
  const chartLeft = 54
  const chartTop = 22
  const chartWidth = 840
  const chartHeight = 230
  const xStep = chartWidth / Math.max(1, data.length - 1)
  const points = data.map((item, index) => ({
    ...item,
    x: chartLeft + index * xStep,
    y: chartTop + chartHeight - (item.value / maxValue) * chartHeight,
  }))
  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
  const selectedPoint =
    selectedIndex === null
      ? null
      : points[Math.min(selectedIndex, points.length - 1)]

  return (
    <div className="min-w-[900px]">
      <p className="mb-3 text-sm font-bold text-slate-500">
        Klik titik grafik untuk melihat detail {label.toLowerCase()}.
      </p>
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
      >
        {ticks.map((tick) => {
          const y = chartTop + chartHeight - (tick / maxValue) * chartHeight
          return (
            <g key={tick}>
              <line
                x1={chartLeft}
                x2={chartLeft + chartWidth}
                y1={y}
                y2={y}
                stroke={grid}
                strokeDasharray="4 4"
              />
              <text
                fill={axis}
                fontSize="14"
                fontWeight="700"
                textAnchor="end"
                x={chartLeft - 10}
                y={y + 5}
              >
                {tick}
              </text>
            </g>
          )
        })}
        {data.map((item, index) => {
          const x = chartLeft + index * xStep
          return (
            <g key={item.label}>
              <line
                x1={x}
                x2={x}
                y1={chartTop}
                y2={chartTop + chartHeight}
                stroke={grid}
                strokeDasharray="4 4"
              />
              <text
                fill={axis}
                fontSize="15"
                fontWeight="700"
                textAnchor="middle"
                x={x}
                y={chartTop + chartHeight + 28}
              >
                {item.label}
              </text>
            </g>
          )
        })}
        <line
          x1={chartLeft}
          x2={chartLeft}
          y1={chartTop}
          y2={chartTop + chartHeight}
          stroke={axis}
          strokeWidth="1.5"
        />
        <line
          x1={chartLeft}
          x2={chartLeft + chartWidth}
          y1={chartTop + chartHeight}
          y2={chartTop + chartHeight}
          stroke={axis}
          strokeWidth="1.5"
        />
        <path d={path} fill="none" stroke={color} strokeWidth="3.5" />
        {points.map((point, index) => (
          <circle
            key={`${point.label}-${point.value}`}
            className="cursor-pointer"
            cx={point.x}
            cy={point.y}
            fill="white"
            onClick={() => setSelectedIndex(index)}
            r="5"
            stroke={color}
            strokeWidth="3"
          >
            <title>{`${point.label}: ${point.value}`}</title>
          </circle>
        ))}
        {selectedPoint ? (
          <g
            pointerEvents="none"
            transform={`translate(${Math.min(
              selectedPoint.x + 10,
              chartLeft + chartWidth - 180,
            )} ${Math.min(selectedPoint.y + 28, chartTop + chartHeight - 88)})`}
          >
            <rect fill="white" height="88" stroke="#d1d5db" width="170" />
            <text fill="#020617" fontSize="14" fontWeight="900" x="12" y="24">
              {selectedPoint.label}
            </text>
            <text fill={axis} fontSize="11" fontWeight="800" x="12" y="42">
              {selectedPoint.detail}
            </text>
            <text fill={color} fontSize="13" fontWeight="800" x="12" y="62">
              {label}
            </text>
            <text fill={color} fontSize="14" fontWeight="900" x="12" y="78">
              {selectedPoint.value}
              {valueSuffix}
            </text>
          </g>
        ) : null}
      </svg>
      <ChartLegend items={[{ label, color }]} />
    </div>
  )
}

function ChartLegend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-5">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-2 text-sm font-bold"
          style={{ color: item.color }}
        >
          <span
            aria-hidden="true"
            className="h-3 w-3 rounded-[2px]"
            style={{ background: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  )
}

function DetailTable({
  columns,
  rows,
  title,
  tone,
}: {
  columns: string[]
  rows: string[][]
  title: string
  tone: 'yellow' | 'red' | 'purple'
}) {
  const accent =
    tone === 'yellow'
      ? 'text-[#c28a08]'
      : tone === 'purple'
        ? 'text-[#5c3386]'
        : 'text-[#7d2228]'

  return (
    <section className="rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/8 sm:p-7">
      <h2 className="text-2xl font-black text-slate-950">{title}</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-50">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-4 text-sm font-black text-slate-600"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.join('-')}>
                {row.map((cell, index) => (
                  <td
                    key={`${cell}-${index}`}
                    className={`px-4 py-4 text-sm font-semibold ${
                      index === row.length - 1 ? accent : 'text-slate-900'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const getStatisticsConfig = (
  mode: StatisticsMode,
): {
  title: string
  kind: 'attendance' | 'late' | 'ticket' | 'session'
  summary: SummaryItem[]
} => {
  if (mode === 'student-late') {
    return {
      title: 'Statistik Terlambat',
      kind: 'late',
      summary: [
        { label: 'Total Terlambat', value: '4', tone: 'yellow' },
        { label: 'Rata-rata Keterlambatan', value: '12 mnt' },
        { label: 'Terlambat Terakhir', value: '17 Mei' },
      ],
    }
  }

  if (mode === 'student-ticket' || mode === 'lecturer-ticket') {
    return {
      title: 'Statistik Tiket Koreksi',
      kind: 'ticket',
      summary: [
        { label: 'Total Tiket', value: '3' },
        { label: 'Disetujui', value: '1', tone: 'green' },
        { label: 'Menunggu', value: '1', tone: 'yellow' },
        { label: 'Ditolak', value: '1', tone: 'red' },
      ],
    }
  }

  if (mode === 'lecturer-present') {
    return {
      title: 'Statistik Kehadiran Kelas',
      kind: 'attendance',
      summary: [
        { label: 'Total Mahasiswa', value: '38' },
        { label: 'Hadir', value: '35', tone: 'green' },
        { label: 'Terlambat', value: '2', tone: 'yellow' },
        { label: 'Tidak Hadir', value: '1', tone: 'red' },
      ],
    }
  }

  if (mode === 'lecturer-session') {
    return {
      title: 'Statistik Sesi Presensi',
      kind: 'session',
      summary: [
        { label: 'Total Sesi', value: '3' },
        { label: 'Sesi Aktif', value: '1', tone: 'green' },
        { label: 'Rata-rata Scan', value: '26' },
        { label: 'Butuh Review', value: '2', tone: 'yellow' },
      ],
    }
  }

  return {
    title: 'Statistik Kehadiran',
    kind: 'attendance',
    summary: [
      { label: 'Total Pertemuan', value: '40' },
      { label: 'Hadir', value: '35', tone: 'green' },
      { label: 'Terlambat', value: '4', tone: 'yellow' },
      { label: 'Alpha', value: '1', tone: 'red' },
    ],
  }
}
