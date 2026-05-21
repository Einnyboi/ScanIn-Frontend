import { apiRequest } from './api'

export type GeneratedReport = {
  id: string
  title: string
  description: string
  createdAt: string
  month: string
  averageAttendance: number
  latePercentage: number
  absentPercentage: number
  totalSessions: number
}

const reportKey = 'scanin-generated-reports'
export const reportsChangedEvent = 'scanin:reports-changed'

const defaultReports: GeneratedReport[] = [
  {
    id: 'laporan-mei-2026',
    title: 'Laporan Kehadiran Bulanan - Mei 2026',
    description: 'Ringkasan kehadiran semua kelas untuk bulan Mei',
    createdAt: '2026-05-20T08:00:00.000Z',
    month: 'Mei 2026',
    averageAttendance: 84,
    latePercentage: 11,
    absentPercentage: 5,
    totalSessions: 245,
  },
]

export const loadGeneratedReports = () => {
  if (typeof window === 'undefined') {
    return defaultReports
  }

  try {
    const storedReports = window.localStorage.getItem(reportKey)

    if (storedReports) {
      return JSON.parse(storedReports) as GeneratedReport[]
    }

    saveReportsLocal(defaultReports)
    return defaultReports
  } catch {
    saveReportsLocal(defaultReports)
    return defaultReports
  }
}

export const saveGeneratedReports = (reports: GeneratedReport[]) => {
  saveReportsLocal(reports)
  notifyReportsChange()
  void syncReportsToBackend(reports)
}

export const fetchReportsFromBackend = async () => {
  try {
    const localReports = loadGeneratedReports()

    if (localReports.length) {
      await syncReportsToBackend(localReports)
    }

    const reports = await apiRequest<GeneratedReport[]>('/reports')

    if (Array.isArray(reports) && reports.length) {
      saveReportsLocal(reports)
      notifyReportsChange()
      return reports
    }
  } catch {
    return null
  }

  return null
}

export const createGeneratedReport = (): GeneratedReport => {
  const createdAt = new Date()
  const month = createdAt.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  return {
    id: `laporan-${createdAt.getTime()}`,
    title: `Laporan Kehadiran Bulanan - ${month}`,
    description: `Ringkasan kehadiran semua kelas untuk bulan ${month}`,
    createdAt: createdAt.toISOString(),
    month,
    averageAttendance: 84,
    latePercentage: 11,
    absentPercentage: 5,
    totalSessions: 245,
  }
}

export const reportToCsv = (report: GeneratedReport) =>
  [
    'Judul,Bulan,Dibuat,Rata-rata Hadir,Keterlambatan,Ketidakhadiran,Total Sesi',
    [
      report.title,
      report.month,
      formatReportDate(report.createdAt),
      `${report.averageAttendance}%`,
      `${report.latePercentage}%`,
      `${report.absentPercentage}%`,
      report.totalSessions,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(','),
  ].join('\n')

export const formatReportDate = (date: string) =>
  new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

const saveReportsLocal = (reports: GeneratedReport[]) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(reportKey, JSON.stringify(reports))
}

const notifyReportsChange = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(reportsChangedEvent))
}

const syncReportsToBackend = async (reports: GeneratedReport[]) => {
  try {
    await apiRequest<GeneratedReport[]>('/reports', {
      method: 'PUT',
      body: JSON.stringify(reports),
    })
  } catch {
    // Backend sync is best-effort while the local-first demo is still usable.
  }
}
