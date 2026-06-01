import { useEffect, useMemo, useState } from 'react'

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { Download, FileText, TrendingDown, TrendingUp } from 'lucide-react'

import type { CourseSchedule, ScanRecord } from '../types/attendance'
import {
    fetchReportsFromBackend,
    formatReportDate,
    reportToCsv,
    type GeneratedReport,
} from '../utils/reports'
import { fetchScanRecordsFromBackend } from '../utils/attendanceStorage'
import { fetchSchedulesFromBackend } from '../utils/schedules'

type MonthlyPoint = {
    month: string
    hadir: number
    terlambat: number
    alpha: number
}

type CoursePoint = {
    course: string
    percentage: number
}

export default function AdminReports() {
    const [scanRecords, setScanRecords] = useState<ScanRecord[]>([])
    const [schedules, setSchedules] = useState<CourseSchedule[]>([])
    const [reports, setReports] = useState<GeneratedReport[]>([])

    useEffect(() => {
        void fetchScanRecordsFromBackend().then((records) => {
            if (records) setScanRecords(records)
        })

        void fetchSchedulesFromBackend().then((items) => {
            if (items) setSchedules(items)
        })

        void fetchReportsFromBackend().then((items) => {
            if (items) setReports(items)
        })
    }, [])

    const analytics = useMemo(
        () => buildAnalytics(scanRecords, schedules),
        [scanRecords, schedules],
    )

    const renderPieLabel = (entry: { name: string; value: number }) =>
        `${entry.name}: ${entry.value}%`

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Laporan & Analitik</h1>
                <p className="text-gray-600">Statistik dan laporan sistem presensi</p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <MetricCard
                    icon={<TrendingUp className="text-green-600" size={20} />}
                    title="Kehadiran Rata-rata"
                    trend={analytics.attendanceTrend}
                    value={`${analytics.attendanceRate}%`}
                />
                <MetricCard
                    icon={<TrendingDown className="text-yellow-600" size={20} />}
                    title="Keterlambatan"
                    trend={analytics.lateTrend}
                    value={`${analytics.lateRate}%`}
                />
                <MetricCard
                    icon={<TrendingUp className="text-red-600" size={20} />}
                    title="Ketidakhadiran"
                    trend={analytics.absentTrend}
                    value={`${analytics.absentRate}%`}
                />
                <MetricCard
                    icon={<FileText className="text-blue-600" size={20} />}
                    title="Total Sesi"
                    trend="Dari jadwal backend"
                    value={`${analytics.totalSessions}`}
                />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Panel title="Tren Kehadiran Bulanan">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.monthlyAttendance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="hadir" fill="#5C3386" name="Hadir" />
                            <Bar dataKey="terlambat" fill="#f59e0b" name="Terlambat" />
                            <Bar dataKey="alpha" fill="#ef4444" name="Alpha" />
                        </BarChart>
                    </ResponsiveContainer>
                </Panel>

                <Panel title="Performa Per Mata Kuliah">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.classPerformance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="course" angle={-15} textAnchor="end" height={80} />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="percentage"
                                stroke="#5C3386"
                                strokeWidth={3}
                                name="Persentase (%)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Panel title="Distribusi Status">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={analytics.statusDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderPieLabel}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {analytics.statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Panel>

                <Panel title="Sesi Per Hari (Backend)">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={buildSessionsPerDaySeries(schedules)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="sessions" fill="#5C3386" name="Jumlah Sesi" />
                        </BarChart>
                    </ResponsiveContainer>
                </Panel>

                <Panel title="Laporan Tersedia">
                    <div className="space-y-3">
                        {reports.map((report) => (
                            <article
                                key={report.id}
                                className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#5C3386]"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h4 className="mb-1 font-bold text-gray-900">{report.title}</h4>
                                        <p className="mb-2 text-sm text-gray-600">{report.description}</p>
                                        <p className="text-xs text-gray-500">Dibuat: {formatReportDate(report.createdAt)}</p>
                                    </div>
                                    <button
                                        className="ml-4 flex items-center gap-2 rounded-lg border border-[#5C3386] px-4 py-2 text-[#5C3386] transition-colors hover:bg-[#5C3386] hover:text-white"
                                        onClick={() => downloadReport(report)}
                                        type="button"
                                    >
                                        <Download size={16} />
                                        Download
                                    </button>
                                </div>
                            </article>
                        ))}
                        {!reports.length ? (
                            <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm font-semibold text-gray-500">
                                Belum ada laporan dari backend.
                            </p>
                        ) : null}
                    </div>
                </Panel>
            </div>
        </div>
    )
}

function MetricCard({
    icon,
    title,
    trend,
    value,
}: {
    icon: React.ReactNode
    title: string
    trend: string
    value: string
}) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-gray-600">{title}</p>
                {icon}
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="mt-1 text-sm text-gray-600">{trend}</p>
        </div>
    )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-md">
            <h3 className="mb-4 text-xl font-bold text-gray-900">{title}</h3>
            {children}
        </div>
    )
}

function downloadReport(report: GeneratedReport) {
    const blob = new Blob([reportToCsv(report)], {
        type: 'text/csv;charset=utf-8;'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`
    link.click()
    URL.revokeObjectURL(url)
}

function buildAnalytics(scanRecords: ScanRecord[], schedules: CourseSchedule[]) {
    const monthlyAttendance = buildMonthlyAttendanceSeries(scanRecords, new Date())
    const classPerformance = buildClassPerformanceSeries(scanRecords)
    const statusDistribution = buildStatusDistribution(scanRecords)
    const currentSnapshot = buildMonthlySnapshot(scanRecords, new Date())
    const previousSnapshot = buildMonthlySnapshot(
        scanRecords,
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    )

    return {
        monthlyAttendance,
        classPerformance,
        statusDistribution,
        attendanceRate: currentSnapshot.attendanceRate,
        lateRate: currentSnapshot.lateRate,
        absentRate: currentSnapshot.absentRate,
        attendanceTrend: formatTrend(currentSnapshot.attendanceRate, previousSnapshot.attendanceRate),
        lateTrend: formatTrend(currentSnapshot.lateRate, previousSnapshot.lateRate),
        absentTrend: formatTrend(currentSnapshot.absentRate, previousSnapshot.absentRate),
        totalSessions: schedules.length,
    }
}

function buildMonthlyAttendanceSeries(
    scanRecords: ScanRecord[],
    referenceDate: Date,
): MonthlyPoint[] {
    return Array.from({ length: 5 }, (_, index) => {
        const monthDate = new Date(
            referenceDate.getFullYear(),
            referenceDate.getMonth() - 4 + index,
            1,
        )
        const snapshot = buildMonthlySnapshot(scanRecords, monthDate)

        return {
            month: monthDate.toLocaleDateString('id-ID', { month: 'short' }),
            hadir: snapshot.presentCount,
            terlambat: snapshot.lateCount,
            alpha: snapshot.absentCount,
        }
    })
}

function buildClassPerformanceSeries(scanRecords: ScanRecord[]): CoursePoint[] {
    const byCourse = new Map<string, { present: number; total: number }>()

    for (const record of scanRecords) {
        const current = byCourse.get(record.courseTitle) ?? { present: 0, total: 0 }
        current.total += 1
        if (record.status === 'Terverifikasi' || record.status === 'Terlambat') {
            current.present += 1
        }
        byCourse.set(record.courseTitle, current)
    }

    return Array.from(byCourse.entries())
        .map(([course, stats]) => ({
            course,
            percentage: stats.total ? Math.round((stats.present / stats.total) * 100) : 0,
        }))
        .sort((a, b) => b.percentage - a.percentage)
}

function buildStatusDistribution(scanRecords: ScanRecord[]) {
    const total = scanRecords.length
    const present = scanRecords.filter((record) => record.status === 'Terverifikasi').length
    const late = scanRecords.filter((record) => record.status === 'Terlambat').length
    const absent = Math.max(total - present - late, 0)

    return [
        { name: 'Hadir', value: total ? Math.round((present / total) * 100) : 0, color: '#22c55e' },
        { name: 'Terlambat', value: total ? Math.round((late / total) * 100) : 0, color: '#f59e0b' },
        { name: 'Tidak Hadir', value: total ? Math.round((absent / total) * 100) : 0, color: '#ef4444' },
    ]
}

function buildMonthlySnapshot(scanRecords: ScanRecord[], referenceDate: Date) {
    const monthRecords = scanRecords.filter((record) => {
        const recordedAt = new Date(record.recordedAt)
        return (
            !Number.isNaN(recordedAt.getTime()) &&
            recordedAt.getFullYear() === referenceDate.getFullYear() &&
            recordedAt.getMonth() === referenceDate.getMonth()
        )
    })

    const presentCount = monthRecords.filter(
        (record) => record.status === 'Terverifikasi' || record.status === 'Terlambat',
    ).length
    const lateCount = monthRecords.filter((record) => record.status === 'Terlambat').length
    const absentCount = Math.max(monthRecords.length - presentCount, 0)

    return {
        presentCount,
        lateCount,
        absentCount,
        attendanceRate: monthRecords.length
            ? Math.round((presentCount / monthRecords.length) * 100)
            : 0,
        lateRate: monthRecords.length
            ? Math.round((lateCount / monthRecords.length) * 100)
            : 0,
        absentRate: monthRecords.length
            ? Math.round((absentCount / monthRecords.length) * 100)
            : 0,
    }
}

function formatTrend(currentValue: number, previousValue: number) {
    const delta = currentValue - previousValue
    return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% dari bulan lalu`
}

function buildSessionsPerDaySeries(schedules: CourseSchedule[]) {
    const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
    const counts = new Map(dayOrder.map((day) => [day, 0]))

    for (const schedule of schedules) {
        const normalizedDay = normalizeDayName(schedule.day)
        if (normalizedDay && counts.has(normalizedDay)) {
            counts.set(normalizedDay, (counts.get(normalizedDay) ?? 0) + 1)
        }
    }

    return dayOrder.map((day) => ({
        day: day.slice(0, 3),
        sessions: counts.get(day) ?? 0,
    }))
}

function normalizeDayName(day?: string) {
    if (!day) return ''

    const lowerDay = day.trim().toLowerCase()
    if (lowerDay.startsWith('sen')) return 'Senin'
    if (lowerDay.startsWith('sel')) return 'Selasa'
    if (lowerDay.startsWith('rab')) return 'Rabu'
    if (lowerDay.startsWith('kam')) return 'Kamis'
    if (lowerDay.startsWith('jum')) return 'Jumat'
    if (lowerDay.startsWith('sab')) return 'Sabtu'
    if (lowerDay.startsWith('min')) return 'Minggu'

    return day
}
