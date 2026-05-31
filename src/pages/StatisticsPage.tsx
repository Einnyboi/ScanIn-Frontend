import { useEffect, useMemo, useState, type ReactNode } from 'react'

import type { CourseSchedule, CorrectionTicket, ScanRecord } from '../types/attendance'
import { apiRequest } from '../utils/api'

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
  studentId?: string
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

function summaryItem(
  label: string,
  value: string,
  tone?: SummaryItem['tone'],
): SummaryItem {
  return tone ? { label, value, tone } : { label, value }
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

export function StatisticsPage({ mode, onBack, studentId }: StatisticsPageProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<ScanRecord[]>([])
  const [tickets, setTickets] = useState<CorrectionTicket[]>([])
  const [schedules, setSchedules] = useState<CourseSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const loadStatisticsData = async () => {
      const [attendanceResult, ticketResult, scheduleResult] = await Promise.allSettled([
        apiRequest<ScanRecord[]>('/attendance-records'),
        apiRequest<CorrectionTicket[]>('/tickets'),
        apiRequest<CourseSchedule[]>('/schedules'),
      ])

      if (!isActive) {
        return
      }

      if (attendanceResult.status === 'fulfilled') {
        setAttendanceRecords(
          Array.isArray(attendanceResult.value) ? attendanceResult.value : [],
        )
      }

      if (ticketResult.status === 'fulfilled') {
        setTickets(Array.isArray(ticketResult.value) ? ticketResult.value : [])
      }

      if (scheduleResult.status === 'fulfilled') {
        setSchedules(Array.isArray(scheduleResult.value) ? scheduleResult.value : [])
      }

      setIsLoading(false)
    }

    void loadStatisticsData().catch(() => {
      if (isActive) {
        setAttendanceRecords([])
        setTickets([])
        setSchedules([])
        setIsLoading(false)
      }
    })

    return () => {
      isActive = false
    }
  }, [])

  const attendanceStats = useMemo(
    () => buildAttendanceStatistics(attendanceRecords, studentId),
    [attendanceRecords, studentId],
  )
  const lateStats = useMemo(
    () => buildLateStatistics(attendanceRecords, studentId),
    [attendanceRecords, studentId],
  )
  const ticketStats = useMemo(() => buildTicketStatistics(tickets), [tickets])
  const sessionStats = useMemo(
    () => buildSessionStatistics(schedules, attendanceRecords),
    [attendanceRecords, schedules],
  )

  const page = getStatisticsConfig(mode)
  let summaryItems: SummaryItem[] = [...page.summary]

  if (page.kind === 'attendance' && attendanceStats.summary.length) {
    summaryItems = [...attendanceStats.summary]
  } else if (page.kind === 'late' && lateStats.summary.length) {
    summaryItems = [...lateStats.summary]
  } else if (page.kind === 'ticket' && ticketStats.summary.length) {
    summaryItems = [...ticketStats.summary]
  } else if (page.kind === 'session' && sessionStats.summary.length) {
    summaryItems = [...sessionStats.summary]
  }

  if (isLoading) {
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
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-lg border border-white bg-white p-6 shadow-lg shadow-slate-900/8"
              />
            ))}
          </section>

          <section className="rounded-lg border border-white bg-white p-5 shadow-lg shadow-slate-900/8 sm:p-7">
            <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />
            <div className="mt-6 space-y-4">
              <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
            </div>
          </section>
        </div>
      </main>
    )
  }

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
          {summaryItems.map((item) => (
            <SummaryCard key={item.label} item={item} />
          ))}
        </section>

        {page.kind === 'attendance' ? (
          <>
            <ChartCard title="Grafik Kehadiran Mingguan">
              <WeeklyBarChart
                data={
                  attendanceStats.weeklyAttendance.length
                    ? attendanceStats.weeklyAttendance
                    : weeklyAttendance
                }
              />
            </ChartCard>
            <ChartCard title="Persentase Kehadiran Bulanan">
              <LineChart
                color={purple}
                data={
                  attendanceStats.monthlyAttendance.length
                    ? attendanceStats.monthlyAttendance
                    : monthlyAttendance
                }
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
                data={lateStats.weeklyLate.length ? lateStats.weeklyLate : weeklyLate}
                label="Jumlah Terlambat"
                maxValue={2}
                ticks={[0, 0.5, 1, 1.5, 2]}
                valueSuffix=" kali"
              />
            </ChartCard>
            <DetailTable
              columns={['Tanggal', 'Mata Kuliah', 'Jam Masuk', 'Keterlambatan']}
              title="Detail Keterlambatan"
              rows={
                lateStats.detailRows.length
                  ? lateStats.detailRows
                  : lateDetails.map((detail) => [
                      detail.date,
                      detail.course,
                      detail.time,
                      detail.late,
                    ])
              }
              tone="yellow"
            />
          </>
        ) : null}

        {page.kind === 'ticket' ? (
          <>
            <ChartCard title="Tren Tiket Koreksi">
              <LineChart
                color={red}
                data={ticketStats.trend.length ? ticketStats.trend : ticketTrend}
                label="Jumlah Tiket"
                maxValue={2}
                ticks={[0, 1, 2]}
                valueSuffix=" tiket"
              />
            </ChartCard>
            <DetailTable
              columns={['Tanggal', 'Mata Kuliah', 'Status']}
              title="Detail Tiket Koreksi"
              rows={
                ticketStats.detailRows.length
                  ? ticketStats.detailRows
                  : ticketDetails.map((detail) => [
                      detail.date,
                      detail.course,
                      detail.status,
                    ])
              }
              tone="red"
            />
          </>
        ) : null}

        {page.kind === 'session' ? (
          <>
            <ChartCard title="Grafik Sesi Absensi Harian">
              <SessionBarChart
                data={sessionStats.weeklySessions.length ? sessionStats.weeklySessions : weeklySessions}
              />
            </ChartCard>
            <DetailTable
              columns={['Hari', 'Mata Kuliah', 'Jam', 'Status']}
              title="Detail Sesi Absensi"
              rows={
                sessionStats.detailRows.length
                  ? sessionStats.detailRows
                  : sessionDetails.map((detail) => [
                      detail.date,
                      detail.course,
                      detail.openedAt,
                      detail.status,
                    ])
              }
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
    <div className="rounded-lg border border-white bg-white p-4 shadow-lg shadow-slate-900/8 sm:p-6">
      <p className="text-sm font-bold text-slate-500">{item.label}</p>
      <p className={`mt-3 text-3xl font-black sm:mt-4 sm:text-4xl ${valueColor}`}>
        {item.value}
      </p>
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
    <section className="rounded-lg border border-white bg-white p-4 shadow-lg shadow-slate-900/8 sm:p-7">
      <h2 className="text-xl font-black text-slate-950 sm:text-2xl">{title}</h2>
      <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-6 sm:px-0">
        {children}
      </div>
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
    <div className="min-w-[720px] lg:min-w-0">
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
    { key: 'opened' as const, color: purple, label: 'Total jadwal' },
    { key: 'closed' as const, color: green, label: 'Aktif' },
    { key: 'autoClosed' as const, color: yellow, label: 'Menunggu' },
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
    <div className="min-w-[720px] lg:min-w-0">
      <p className="mb-3 text-sm font-bold text-slate-500">
        Klik bar grafik untuk melihat total jadwal, yang aktif, dan yang masih menunggu.
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
              Total: {selectedItem.opened}
            </text>
            <text fill={green} fontSize="14" fontWeight="800" x="14" y="88">
              Aktif: {selectedItem.closed}
            </text>
            <text fill={yellow} fontSize="14" fontWeight="800" x="14" y="112">
              Menunggu: {selectedItem.autoClosed}
            </text>
          </g>
        ) : null}
      </svg>
      <ChartLegend
        items={[
          { label: 'Total jadwal', color: purple },
          { label: 'Aktif', color: green },
          { label: 'Menunggu', color: yellow },
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
    <div className="min-w-[720px] lg:min-w-0">
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
            className="h-3 w-3 rounded-xs"
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
    <section className="rounded-lg border border-white bg-white p-4 shadow-lg shadow-slate-900/8 sm:p-7">
      <h2 className="text-xl font-black text-slate-950 sm:text-2xl">{title}</h2>
      <div className="mt-4 grid gap-3 md:hidden">
        {rows.map((row) => (
          <article
            key={row.join('-')}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className={`text-base font-black ${accent}`}>
              {row[row.length - 1]}
            </p>
            <div className="mt-3 space-y-2">
              {row.map((cell, index) => (
                <div key={`${cell}-${index}`} className="flex items-start justify-between gap-4">
                  <span className="text-xs font-black uppercase text-slate-400">
                    {columns[index]}
                  </span>
                  <span className="max-w-[62%] text-right text-sm font-bold text-slate-800">
                    {cell}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="mt-5 hidden overflow-x-auto md:block">
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
      summary: [],
    }
  }

  if (mode === 'student-ticket' || mode === 'lecturer-ticket') {
    return {
      title: 'Statistik Tiket Koreksi',
      kind: 'ticket',
      summary: [],
    }
  }

  if (mode === 'lecturer-present') {
    return {
      title: 'Statistik Kehadiran Kelas',
      kind: 'attendance',
      summary: [],
    }
  }

  if (mode === 'lecturer-session') {
    return {
      title: 'Statistik Sesi Presensi',
      kind: 'session',
      summary: [],
    }
  }

  return {
    title: 'Statistik Kehadiran',
    kind: 'attendance',
    summary: [],
  }
}

function buildAttendanceStatistics(
  records: ScanRecord[],
  studentId?: string,
): {
  summary: SummaryItem[]
  weeklyAttendance: WeeklyAttendance[]
  monthlyAttendance: LinePoint[]
} {
  const scopedRecords = studentId
    ? records.filter((record) => record.studentId === studentId)
    : records

  if (!scopedRecords.length) {
    return {
      summary: [] as SummaryItem[],
      weeklyAttendance: [] as WeeklyAttendance[],
      monthlyAttendance: [] as LinePoint[],
    }
  }

  const sorted = [...scopedRecords].sort(
    (left, right) => new Date(left.scannedAt).getTime() - new Date(right.scannedAt).getTime(),
  )
  const presentCount = sorted.filter(
    (record) => record.status === 'Terverifikasi' || record.status === 'Terlambat',
  ).length
  const lateCount = sorted.filter((record) => record.status === 'Terlambat').length
  const absentCount = sorted.filter((record) => record.status === 'Tidak Hadir').length

  return {
    summary: [
      summaryItem('Total Pertemuan', `${sorted.length}`),
      summaryItem('Hadir', `${presentCount}`, 'green'),
      summaryItem('Terlambat', `${lateCount}`, 'yellow'),
      summaryItem('Alpha', `${absentCount}`, 'red'),
    ],
    weeklyAttendance: buildWeeklyAttendance(sorted),
    monthlyAttendance: buildMonthlyAttendance(sorted),
  }
}

function buildLateStatistics(
  records: ScanRecord[],
  studentId?: string,
): {
  summary: SummaryItem[]
  weeklyLate: LinePoint[]
  detailRows: string[][]
} {
  const scopedRecords = studentId
    ? records.filter((record) => record.studentId === studentId)
    : records

  const lateRecords = scopedRecords.filter(
    (record) => record.status === 'Terlambat',
  )

  if (!lateRecords.length) {
    return {
      summary: [] as SummaryItem[],
      weeklyLate: [] as LinePoint[],
      detailRows: [] as string[][],
    }
  }

  const sorted = [...lateRecords].sort(
    (left, right) => new Date(left.scannedAt).getTime() - new Date(right.scannedAt).getTime(),
  )

  return {
    summary: [
      summaryItem('Total Terlambat', `${sorted.length}`, 'yellow'),
      {
        label: 'Rata-rata Keterlambatan',
        value: `${Math.round((sorted.length / Math.max(1, records.length)) * 100)}%`,
      },
      {
        label: 'Terlambat Terakhir',
        value: new Date(sorted[sorted.length - 1].scannedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
        }),
      },
    ],
    weeklyLate: buildLateTrend(sorted),
    detailRows: sorted.map((record) => {
      const scannedAt = new Date(record.scannedAt)
      return [
        scannedAt.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        record.courseTitle,
        scannedAt.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        'Terlambat',
      ]
    }),
  }
}

function buildLateTrend(records: ScanRecord[]): LinePoint[] {
  if (!records.length) return []

  const buckets = new Map<string, { start: number; value: number }>()
  for (const record of records) {
    const scannedAt = new Date(record.scannedAt)
    const weekStart = getWeekStart(scannedAt)
    const key = weekStart.toISOString().slice(0, 10)
    const bucket = buckets.get(key) ?? {
      start: weekStart.getTime(),
      value: 0,
    }

    bucket.value += 1
    buckets.set(key, bucket)
  }

  return [...buckets.values()]
    .sort((left, right) => left.start - right.start)
    .map((bucket) => {
      const weekStart = new Date(bucket.start)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      return {
        label: `Minggu ${weekStart.getDate()}`,
        detail: `${weekStart.getDate()}-${weekEnd.getDate()} ${formatMonthName(weekStart)}`,
        value: bucket.value,
      }
    })
}

function buildTicketStatistics(tickets: CorrectionTicket[]): {
  summary: SummaryItem[]
  trend: LinePoint[]
  detailRows: string[][]
} {
  if (!tickets.length) {
    return {
      summary: [] as SummaryItem[],
      trend: [] as LinePoint[],
      detailRows: [] as string[][],
    }
  }

  const sorted = [...tickets].sort(
    (left, right) =>
      new Date(left.date).getTime() - new Date(right.date).getTime(),
  )

  const approvedCount = sorted.filter((ticket) => ticket.status === 'Disetujui').length
  const pendingCount = sorted.filter((ticket) => ticket.status === 'Menunggu').length
  const rejectedCount = sorted.filter((ticket) => ticket.status === 'Ditolak').length

  return {
    summary: [
      summaryItem('Total Tiket', `${sorted.length}`),
      summaryItem('Disetujui', `${approvedCount}`, 'green'),
      summaryItem('Menunggu', `${pendingCount}`, 'yellow'),
      summaryItem('Ditolak', `${rejectedCount}`, 'red'),
    ],
    trend: buildTicketTrend(sorted),
    detailRows: sorted.map((ticket) => [
      new Date(ticket.date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      ticket.courseTitle,
      ticket.status,
    ]),
  }
}

function buildTicketTrend(tickets: CorrectionTicket[]): LinePoint[] {
  if (!tickets.length) return []

  const buckets = new Map<string, { start: number; value: number }>()

  for (const ticket of tickets) {
    const weekStart = getWeekStart(new Date(ticket.date))
    const key = weekStart.toISOString().slice(0, 10)
    const bucket = buckets.get(key) ?? {
      start: weekStart.getTime(),
      value: 0,
    }

    bucket.value += 1
    buckets.set(key, bucket)
  }

  return [...buckets.values()]
    .sort((left, right) => left.start - right.start)
    .map((bucket) => {
      const weekStart = new Date(bucket.start)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      return {
        label: `Minggu ${weekStart.getDate()}`,
        detail: `${weekStart.getDate()}-${weekEnd.getDate()} ${formatMonthName(weekStart)}`,
        value: bucket.value,
      }
    })
}

function buildSessionStatistics(
  schedules: CourseSchedule[],
  attendanceRecords: ScanRecord[],
): {
  summary: SummaryItem[]
  weeklySessions: SessionStatistics[]
  detailRows: string[][]
} {
  if (!schedules.length) {
    return {
      summary: [] as SummaryItem[],
      weeklySessions: [] as SessionStatistics[],
      detailRows: [] as string[][],
    }
  }

  const sorted = [...schedules].sort((left, right) => {
    const leftValue = (left.day ?? left.title).toLowerCase()
    const rightValue = (right.day ?? right.title).toLowerCase()
    return leftValue.localeCompare(rightValue)
  })

  const activeCount = sorted.filter((schedule) => schedule.status === 'active').length
  const upcomingCount = sorted.filter((schedule) => schedule.status === 'upcoming').length

  return {
    summary: [
      summaryItem('Total Jadwal', `${sorted.length}`),
      summaryItem('Aktif', `${activeCount}`, 'green'),
      summaryItem('Menunggu', `${upcomingCount}`, 'yellow'),
      summaryItem('Presensi Tercatat', `${attendanceRecords.length}`, 'red'),
    ],
    weeklySessions: buildSessionTrend(sorted),
    detailRows: sorted.map((schedule) => [
      schedule.day ?? '-',
      schedule.title,
      schedule.time,
      schedule.status === 'active' ? 'Aktif' : 'Menunggu',
    ]),
  }
}

function buildSessionTrend(schedules: CourseSchedule[]): SessionStatistics[] {
  if (!schedules.length) return []

  const buckets = new Map<string, { order: number; opened: number; closed: number; autoClosed: number }>()

  for (const schedule of schedules) {
    const key = schedule.day ?? schedule.title
    const bucket = buckets.get(key) ?? {
      order: buckets.size,
      opened: 0,
      closed: 0,
      autoClosed: 0,
    }

    bucket.opened += 1
    if (schedule.status === 'active') bucket.closed += 1
    else bucket.autoClosed += 1
    buckets.set(key, bucket)
  }

  return [...buckets.entries()]
    .sort((left, right) => left[1].order - right[1].order)
    .map(([label, bucket]) => ({
      label,
      dateRange: 'Data backend',
      opened: bucket.opened,
      closed: bucket.closed,
      autoClosed: bucket.autoClosed,
    }))
}

function buildWeeklyAttendance(records: ScanRecord[]): WeeklyAttendance[] {
  if (!records.length) return []

  const buckets = new Map<string, WeeklyAttendance & { start: number }>()

  for (const record of records) {
    const scannedAt = new Date(record.scannedAt)
    const start = getWeekStart(scannedAt)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const key = start.toISOString().slice(0, 10)
    const existing = buckets.get(key)

    if (!existing) {
      buckets.set(key, {
        start: start.getTime(),
        label: `Minggu ${buckets.size + 1}`,
        dateRange: `${start.getDate()}-${end.getDate()} ${formatMonthName(start)}`,
        hadir: 0,
        terlambat: 0,
        alpha: 0,
      })
    }

    const bucket = buckets.get(key)
    if (!bucket) continue

    if (record.status === 'Terverifikasi') bucket.hadir += 1
    else if (record.status === 'Terlambat') bucket.terlambat += 1
    else bucket.alpha += 1
  }

  return [...buckets.values()]
    .sort((left, right) => left.start - right.start)
    .map(({ start, ...bucket }) => {
      void start
      return bucket
    })
}

function buildMonthlyAttendance(records: ScanRecord[]): LinePoint[] {
  if (!records.length) return []

  const buckets = new Map<string, { start: number; total: number; present: number }>()

  for (const record of records) {
    const scannedAt = new Date(record.scannedAt)
    const key = `${scannedAt.getFullYear()}-${scannedAt.getMonth()}`
    const monthStart = new Date(scannedAt.getFullYear(), scannedAt.getMonth(), 1)
    const bucket = buckets.get(key) ?? {
      start: monthStart.getTime(),
      total: 0,
      present: 0,
    }

    bucket.total += 1
    if (record.status === 'Terverifikasi' || record.status === 'Terlambat') {
      bucket.present += 1
    }

    buckets.set(key, bucket)
  }

  return [...buckets.values()]
    .sort((left, right) => left.start - right.start)
    .map((bucket) => {
      const monthDate = new Date(bucket.start)
      return {
        label: monthDate.toLocaleDateString('id-ID', { month: 'short' }),
        detail: monthDate.toLocaleDateString('id-ID', {
          month: 'long',
          year: 'numeric',
        }),
        value: Math.round((bucket.present / Math.max(1, bucket.total)) * 100),
      }
    })
}

function getWeekStart(date: Date) {
  const start = new Date(date)
  const day = start.getDay() || 7
  start.setDate(start.getDate() - (day - 1))
  start.setHours(0, 0, 0, 0)
  return start
}

function formatMonthName(date: Date) {
  return date.toLocaleDateString('id-ID', { month: 'short' })
}
