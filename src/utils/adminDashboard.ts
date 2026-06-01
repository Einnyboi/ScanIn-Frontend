import type { CourseSchedule, ScanRecord } from '../types/attendance'
import type { AdminUser, AdminUserRole } from './adminUsers'
import type { PasswordResetRequest } from './passwordReset'
import type { SupportComplaint } from './complaints'
import { reportToCsv, type GeneratedReport } from './reports'

export type MonthlyAttendancePoint = {
  month: string
  percentage: number
  hadir: number
  terlambat: number
  alpha: number
}

export type DaySessionsPoint = {
  day: string
  sessions: number
}

export type ClassPerformancePoint = {
  course: string
  percentage: number
}

export type AdminAnalytics = {
  monthlyAttendance: MonthlyAttendancePoint[]
  sessionsPerDay: DaySessionsPoint[]
  classPerformance: ClassPerformancePoint[]
  statusDistribution: Array<{ name: string; value: number; color: string }>
  attendanceRate: number
  lateRate: number
  absentRate: number
  attendanceTrend: string
  lateTrend: string
  absentTrend: string
  totalSessions: number
}

export function formatAdminDate(date: Date) {
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatAdminTime(date: Date) {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatNotificationDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatSupportRole(role: SupportComplaint['role']) {
  if (role === 'mahasiswa') return 'Mahasiswa'
  if (role === 'pengajar') return 'Pengajar'

  return 'Admin'
}

export function isPasswordResetActionable(request: PasswordResetRequest) {
  return (
    request.status === 'Baru' ||
    request.emailStatus === 'FAILED' ||
    request.emailStatus === 'SMTP_NOT_CONFIGURED' ||
    (request.status === 'Dikirim' && request.emailStatus !== 'SENT')
  )
}

export function getExpectedEmailDomain(role: AdminUserRole) {
  return role === 'Mahasiswa' ? '@stu.untar.ac.id' : '@untar.ac.id'
}

export function getAdminUserKey(user: AdminUser): string {
  return [
    user.role?.trim(),
    user.id?.trim(),
  ]
    .join(':')
    .toLowerCase()
}

export function getAdminUserDomainHint(role: AdminUserRole) {
  if (role === 'Mahasiswa') {
    return 'Mahasiswa wajib memakai email institusi dengan domain @stu.untar.ac.id.'
  }

  if (role === 'Pengajar') {
    return 'Pengajar wajib memakai email institusi dengan domain @untar.ac.id.'
  }

  return 'Admin wajib memakai email institusi dengan domain @untar.ac.id.'
}

export function createEmptyUser(): AdminUser {
  return {
    id: '',
    name: '',
    email: '',
    role: 'Mahasiswa',
    status: 'Aktif',
  }
}

export function createEmptySchedule(): CourseSchedule {
  return {
    id: '',
    day: 'Senin',
    title: '',
    time: '08:00 - 10:00',
    room: '',
    lecturer: '',
    students: 30,
    status: 'upcoming',
  }
}

export function createScheduleId(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `schedule-${slug}-${Date.now()}`
}

export function splitScheduleTime(time: string) {
  const [rawStart = '08:00', rawEnd = '10:00'] = time.split('-')

  return {
    start: normalizeTimeInput(rawStart),
    end: normalizeTimeInput(rawEnd),
  }
}

export function normalizeTimeInput(value: string) {
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/)

  if (!match) return '08:00'

  const hour = match[1].padStart(2, '0')
  const minute = match[2]

  return `${hour}:${minute}`
}

export function getLecturerOptions(
  users: AdminUser[],
  schedules: CourseSchedule[],
  currentLecturer: string,
) {
  return Array.from(
    new Set(
      [
        ...users
          .filter((user) => user.role === 'Pengajar')
          .map((user) => user.name),
        ...schedules.map((schedule) => schedule.lecturer),
        currentLecturer,
      ].filter(Boolean),
    ),
  )
}

export function getRecordDateInput(recordedAt: string) {
  const date = new Date(recordedAt)

  if (Number.isNaN(date.getTime())) return ''

  return date.toISOString().slice(0, 10)
}

export function formatRecordDate(recordedAt: string) {
  const date = new Date(recordedAt)

  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function downloadAttendanceRows(rows: ScanRecord[]) {
  const headers = [
    'NIM',
    'Nama',
    'Mata Kuliah',
    'Tanggal',
    'Jam Masuk',
    'Status',
    'Metode',
  ]
  const csvRows = rows.map((row) =>
    [
      row.studentId,
      row.studentName,
      row.courseTitle,
      formatRecordDate(row.recordedAt),
      row.scannedAt,
      row.status === 'Terverifikasi' ? 'Hadir' : row.status,
      row.method,
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(','),
  )

  const blob = new Blob([[headers.join(','), ...csvRows].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'data-presensi.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadReport(report: GeneratedReport) {
  const blob = new Blob([reportToCsv(report)], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${report.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function buildAdminAnalytics(
  scanRecords: ScanRecord[],
  schedules: CourseSchedule[],
  referenceDate: Date,
): AdminAnalytics {
  const monthlyAttendance = buildMonthlyAttendanceSeries(scanRecords, referenceDate)
  const sessionsPerDay = buildSessionsPerDaySeries(schedules)
  const classPerformance = buildClassPerformanceSeries(scanRecords)
  const statusDistribution = buildStatusDistribution(scanRecords)
  const currentSnapshot = buildMonthlySnapshot(scanRecords, referenceDate)
  const previousMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() - 1,
    1,
  )
  const previousSnapshot = buildMonthlySnapshot(scanRecords, previousMonth)

  return {
    monthlyAttendance,
    sessionsPerDay,
    classPerformance,
    statusDistribution,
    attendanceRate: currentSnapshot.attendanceRate,
    lateRate: currentSnapshot.lateRate,
    absentRate: currentSnapshot.absentRate,
    attendanceTrend: formatTrendChange(
      currentSnapshot.attendanceRate,
      previousSnapshot.attendanceRate,
    ),
    lateTrend: formatTrendChange(currentSnapshot.lateRate, previousSnapshot.lateRate),
    absentTrend: formatTrendChange(
      currentSnapshot.absentRate,
      previousSnapshot.absentRate,
    ),
    totalSessions: schedules.length,
  }
}

export function buildMonthlyAttendanceSeries(
  scanRecords: ScanRecord[],
  referenceDate: Date,
): MonthlyAttendancePoint[] {
  return Array.from({ length: 5 }, (_, index) => {
    const monthDate = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - 4 + index,
      1,
    )
    const snapshot = buildMonthlySnapshot(scanRecords, monthDate)

    return {
      month: monthDate.toLocaleDateString('id-ID', { month: 'short' }),
      percentage: snapshot.attendanceRate,
      hadir: snapshot.presentCount,
      terlambat: snapshot.lateCount,
      alpha: snapshot.absentCount,
    }
  })
}

export function buildSessionsPerDaySeries(schedules: CourseSchedule[]): DaySessionsPoint[] {
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

export function buildClassPerformanceSeries(
  scanRecords: ScanRecord[],
): ClassPerformancePoint[] {
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

export function buildStatusDistribution(scanRecords: ScanRecord[]) {
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

export function buildMonthlySnapshot(scanRecords: ScanRecord[], referenceDate: Date) {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const monthRecords = scanRecords.filter((record) => {
    const recordedAt = new Date(record.recordedAt)
    return (
      !Number.isNaN(recordedAt.getTime()) &&
      recordedAt.getFullYear() === year &&
      recordedAt.getMonth() === month
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

export function normalizeDayName(day?: string) {
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

export function formatTrendChange(currentValue: number, previousValue: number) {
  const delta = currentValue - previousValue
  return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% dari bulan lalu`
}