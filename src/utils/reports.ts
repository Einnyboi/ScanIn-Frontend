import { apiRequest } from './api'

export type GeneratedReport = {
  id: string
  kind?: ReportKind
  title: string
  description: string
  createdAt: string
  month: string
  averageAttendance: number
  latePercentage: number
  absentPercentage: number
  totalSessions: number
}

export type ReportKind =
  | 'attendance'
  | 'system-usage'
  | 'class-performance'
  | 'at-risk-students'

const reportKey = 'scanin-generated-reports'
export const reportsChangedEvent = 'scanin:reports-changed'

export const loadGeneratedReports = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedReports = window.localStorage.getItem(reportKey)
    return storedReports ? (JSON.parse(storedReports) as GeneratedReport[]) : []
  } catch {
    return []
  }
}

export const saveGeneratedReports = (reports: GeneratedReport[]) => {
  saveReportsLocal(reports)
  notifyReportsChange()
  void syncReportsToBackend(reports)
}

export const fetchReportsFromBackend = async () => {
  try {
    const reports = await apiRequest<GeneratedReport[]>('/reports')

    if (Array.isArray(reports) && reports.length) {
      saveReportsLocal(reports)
      notifyReportsChange()
      return reports
    }
  } catch {
    return loadGeneratedReports()
  }

  return loadGeneratedReports()
}

export const createGeneratedReport = (
  kind: ReportKind = 'attendance',
): GeneratedReport => {
  const createdAt = new Date()
  const month = createdAt.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })
  const template = getReportTemplate(kind, month)

  return {
    id: `${kind}-${createdAt.getTime()}`,
    kind,
    title: template.title,
    description: template.description,
    createdAt: createdAt.toISOString(),
    month: template.month,
    averageAttendance: template.averageAttendance,
    latePercentage: template.latePercentage,
    absentPercentage: template.absentPercentage,
    totalSessions: template.totalSessions,
  }
}

export const reportToCsv = (report: GeneratedReport) => {
  if (report.kind === 'system-usage') {
    return rowsToCsv([
      ['Metrik', 'Nilai', 'Periode'],
      ['Total Login', 382, report.month],
      ['Scan QR Berhasil', 918, report.month],
      ['Tiket Diproses', 42, report.month],
      ['Permintaan Reset Password', 8, report.month],
      ['Laporan Diunduh', 16, report.month],
    ])
  }

  if (report.kind === 'class-performance') {
    return rowsToCsv([
      ['Mata Kuliah', 'Kehadiran', 'Terlambat', 'Alpha', 'Total Sesi'],
      ['Kecerdasan Buatan', '92%', '6%', '2%', 40],
      ['Jaringan Komputer', '91%', '7%', '2%', 36],
      ['Basis Data Lanjut', '89%', '8%', '3%', 42],
      ['Pemrograman Web', '85%', '11%', '4%', 38],
    ])
  }

  if (report.kind === 'at-risk-students') {
    return rowsToCsv([
      ['NIM', 'Nama', 'Kehadiran', 'Tiket Aktif', 'Catatan'],
      ['535240165', 'Eko Prasetyo', '68%', 2, 'Kehadiran di bawah batas aman'],
      ['535240198', 'Hendra Gunawan', '70%', 1, 'Tidak hadir berulang'],
      ['535240178', 'Dewi Lestari', '74%', 1, 'Perlu pemantauan dosen wali'],
    ])
  }

  return rowsToCsv([
    [
      'Judul',
      'Bulan',
      'Dibuat',
      'Rata-rata Hadir',
      'Keterlambatan',
      'Ketidakhadiran',
      'Total Sesi',
    ],
    [
      report.title,
      report.month,
      formatReportDate(report.createdAt),
      `${report.averageAttendance}%`,
      `${report.latePercentage}%`,
      `${report.absentPercentage}%`,
      report.totalSessions,
    ],
  ])
}

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

const getReportTemplate = (kind: ReportKind, month: string) => {
  if (kind === 'system-usage') {
    return {
      title: `Laporan Penggunaan Sistem - ${month}`,
      description: 'Statistik login, scan QR, tiket, dan aktivitas admin',
      month,
      averageAttendance: 84,
      latePercentage: 11,
      absentPercentage: 5,
      totalSessions: 245,
    }
  }

  if (kind === 'class-performance') {
    return {
      title: 'Laporan Kinerja Per Kelas - Semester Genap',
      description: 'Analisis performa kehadiran per mata kuliah',
      month: 'Semester Genap 2026',
      averageAttendance: 88,
      latePercentage: 9,
      absentPercentage: 3,
      totalSessions: 180,
    }
  }

  if (kind === 'at-risk-students') {
    return {
      title: `Laporan Mahasiswa Bermasalah - ${month}`,
      description: 'Daftar mahasiswa dengan kehadiran rendah atau tiket berulang',
      month,
      averageAttendance: 72,
      latePercentage: 18,
      absentPercentage: 10,
      totalSessions: 245,
    }
  }

  return {
    title: `Laporan Kehadiran Bulanan - ${month}`,
    description: `Ringkasan kehadiran semua kelas untuk bulan ${month}`,
    month,
    averageAttendance: 84,
    latePercentage: 11,
    absentPercentage: 5,
    totalSessions: 245,
  }
}

const rowsToCsv = (rows: Array<Array<number | string>>) =>
  rows
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    )
    .join('\n')
