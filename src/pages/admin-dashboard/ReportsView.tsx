import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChevronRight, Download, FileText, Search, Loader2 } from 'lucide-react'
import { useState, useMemo } from 'react'

import type { GeneratedReport, ReportKind } from '../../utils/reports'
import { formatReportDate } from '../../utils/reports'
import { type AdminAnalytics } from '../../utils/adminDashboard'
import { downloadReport } from '../../utils/adminDashboard'
import { type AdminUser } from '../../utils/adminUsers'
import { type CourseSchedule } from '../../types/attendance'
import { amber, maroon, purple } from './shared'

import { AdminCard, SimpleStat, TrendStat } from './shared'
import { apiRequest } from '../../utils/api'

export type ReportsViewProps = {
  analytics: AdminAnalytics
  onGenerateReport: (kind?: ReportKind) => void
  reports: GeneratedReport[]
  users?: AdminUser[]
}

type LiveReport = {
  mataKuliah: string
  kode: string
  dosen: string
  kelas: string
  totalSesi: number
  totalHadir: number
  totalTerlambat: number
  totalTidakHadir: number
  totalPresensi: number
  averageAttendance: number
}

export function ReportsView({ analytics, onGenerateReport, reports, users = [] }: ReportsViewProps) {
  const [mataKuliahId, setMataKuliahId] = useState('')
  const [kelasId, setKelasId] = useState('')
  const [pengajarId, setPengajarId] = useState('')
  const [liveReports, setLiveReports] = useState<LiveReport[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')

  const pengajars = useMemo(() => users.filter(u => u.role === 'DOSEN'), [users])

  const reportActions: Array<{ description: string; kind: ReportKind; title: string }> = [
    { kind: 'attendance', title: 'Laporan Kehadiran Bulanan', description: 'Ringkasan hadir, terlambat, alpha, dan total sesi.' },
    { kind: 'system-usage', title: 'Laporan Penggunaan Sistem', description: 'Aktivitas login, scan QR, tiket, reset password, dan unduhan.' },
    { kind: 'class-performance', title: 'Laporan Kinerja Per Kelas', description: 'Perbandingan performa kehadiran setiap mata kuliah.' },
    { kind: 'at-risk-students', title: 'Laporan Mahasiswa Bermasalah', description: 'Mahasiswa dengan kehadiran rendah atau tiket berulang.' },
  ]

  const handleGenerateLiveReport = async () => {
    setIsGenerating(true)
    setGenerateError('')
    try {
      const params = new URLSearchParams()
      if (mataKuliahId) params.append('mataKuliahId', mataKuliahId)
      if (kelasId) params.append('kelasId', kelasId)
      if (pengajarId) params.append('pengajarId', pengajarId)

      const result = await apiRequest<LiveReport[]>(`/reports?${params.toString()}`)
      setLiveReports(result)
    } catch (err) {
      const error = err as Error
      setGenerateError(error.message || 'Gagal membuat laporan')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadLiveReport = () => {
    if (!liveReports.length) return
    const header = ['Mata Kuliah', 'Kode', 'Pengajar', 'Kelas', 'Total Sesi', 'Hadir', 'Terlambat', 'Tidak Hadir', 'Persentase Kehadiran']
    const rows = liveReports.map(r => [
      r.mataKuliah,
      r.kode,
      r.dosen,
      r.kelas,
      r.totalSesi.toString(),
      r.totalHadir.toString(),
      r.totalTerlambat.toString(),
      r.totalTidakHadir.toString(),
      `${r.averageAttendance}%`
    ])
    
    const csvContent = [header.join(','), ...rows.map(row => row.map(v => `"${v}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `laporan_kehadiran_${new Date().getTime()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <TrendStat label="Kehadiran Rata-rata" trend={analytics.attendanceTrend} value={`${analytics.attendanceRate}%`} />
        <TrendStat label="Keterlambatan" tone="yellow" trend={analytics.lateTrend} value={`${analytics.lateRate}%`} />
        <TrendStat label="Ketidakhadiran" tone="red" trend={analytics.absentTrend} value={`${analytics.absentRate}%`} />
        <SimpleStat label="Total Sesi" tone="blue" value={analytics.totalSessions} />
      </section>

      <AdminCard className="p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-950">Laporan Per Mata Kuliah</h2>
          <p className="text-sm font-semibold leading-6 text-slate-500">
            Filter berdasarkan Mata Kuliah, Kelas, atau Pengajar untuk mendapatkan data kehadiran secara real-time.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide">Pengajar</label>
            <select
              value={pengajarId}
              onChange={(e) => setPengajarId(e.target.value)}
              className="h-11 w-full rounded-[8px] border border-slate-300 px-3 text-sm font-semibold text-slate-950 focus:border-[#5c3386] focus:ring-1 focus:ring-[#5c3386]"
            >
              <option value="">Semua Pengajar</option>
              {pengajars.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide">Mata Kuliah</label>
            {/* Note: the backend filtering requires Mata Kuliah ID but our local frontend schedules might not have real Matkul ID, so we use empty string for now, but UI shows structure */}
            <input 
              type="text" 
              placeholder="Kode/Nama Matkul..."
              value={mataKuliahId}
              onChange={(e) => setMataKuliahId(e.target.value)}
              className="h-11 w-full rounded-[8px] border border-slate-300 px-3 text-sm font-semibold text-slate-950 focus:border-[#5c3386] focus:ring-1 focus:ring-[#5c3386]"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide">Kelas</label>
            <input 
              type="text" 
              placeholder="Nama Kelas..."
              value={kelasId}
              onChange={(e) => setKelasId(e.target.value)}
              className="h-11 w-full rounded-[8px] border border-slate-300 px-3 text-sm font-semibold text-slate-950 focus:border-[#5c3386] focus:ring-1 focus:ring-[#5c3386]"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleGenerateLiveReport}
              disabled={isGenerating}
              className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#5c3386] px-6 text-sm font-black text-white transition hover:bg-[#4f2b73] disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Generate Laporan
            </button>
          </div>
        </div>

        {generateError && <p className="mt-4 text-sm font-bold text-[#7d2228]">{generateError}</p>}

        {liveReports.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-950">Hasil Laporan</h3>
              <button
                onClick={handleDownloadLiveReport}
                className="flex h-9 items-center justify-center gap-2 rounded-[8px] border border-[#5c3386] px-4 text-sm font-black text-[#5c3386] transition hover:bg-[#5c3386] hover:text-white"
              >
                <Download className="h-4 w-4" />
                Unduh CSV
              </button>
            </div>
            <div className="overflow-x-auto rounded-[8px] border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-black text-slate-600">Mata Kuliah</th>
                    <th className="px-4 py-3 font-black text-slate-600">Pengajar</th>
                    <th className="px-4 py-3 font-black text-slate-600">Kelas</th>
                    <th className="px-4 py-3 text-center font-black text-slate-600">Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {liveReports.map((r, i) => (
                    <tr key={i} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-950">{r.mataKuliah}</p>
                        <p className="text-xs text-slate-500">{r.kode}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{r.dosen}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{r.kelas}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <span className="font-black text-slate-950">{r.averageAttendance}%</span>
                          <div className="flex gap-2 text-xs">
                            <span className="text-emerald-600 font-bold" title="Hadir">{r.totalHadir}</span>
                            <span className="text-amber-600 font-bold" title="Terlambat">{r.totalTerlambat}</span>
                            <span className="text-red-600 font-bold" title="Tidak Hadir">{r.totalTidakHadir}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AdminCard>

      <section className="grid gap-5 xl:grid-cols-2">
        <AdminCard title="Tren Kehadiran Bulanan">
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={analytics.monthlyAttendance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hadir" fill={purple} name="Hadir" />
              <Bar dataKey="terlambat" fill={amber} name="Terlambat" />
              <Bar dataKey="alpha" fill={maroon} name="Alpha" />
            </BarChart>
          </ResponsiveContainer>
        </AdminCard>
        <AdminCard title="Performa Per Mata Kuliah">
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={analytics.classPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="course" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line dataKey="percentage" name="Persentase (%)" stroke={purple} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </AdminCard>
      </section>

      <AdminCard className="p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-950">Statistik Global (Dummy)</h2>
          <p className="text-sm font-semibold leading-6 text-slate-500">
            Kumpulan dummy data yang menunjukkan apa saja yang bisa dibuat.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reportActions.map((report) => (
            <button key={report.kind} type="button" onClick={() => onGenerateReport(report.kind)} className="group flex min-h-44 flex-col justify-between rounded-[8px] border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#5c3386]/40 hover:shadow-lg hover:shadow-slate-900/8">
              <div>
                <p className="text-base font-black text-slate-950">{report.title}</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{report.description}</p>
              </div>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#5c3386]">
                Generate
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      </AdminCard>

      <AdminCard className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Laporan Tersimpan</h2>
          <div className="flex min-h-14 items-center gap-3 rounded-[8px] border border-[#5c3386]/15 bg-[#5c3386]/5 px-5 text-sm font-black text-[#5c3386]">
            <FileText className="h-5 w-5" aria-hidden="true" />
            <span>{reports.length} laporan dummy</span>
          </div>
        </div>
        <div className="mt-7 grid gap-5">
          {reports.map((report) => (
            <article key={report.id} className="flex flex-col gap-5 rounded-[8px] border border-slate-200 p-5 transition hover:border-[#5c3386]/35 hover:shadow-lg hover:shadow-slate-900/6 lg:flex-row lg:items-center lg:justify-between lg:p-6">
              <div>
                <p className="text-lg font-black text-slate-950 sm:text-xl">{report.title}</p>
                <p className="mt-2 text-base font-semibold text-slate-500">{report.description}</p>
                <p className="mt-4 text-sm font-bold text-slate-400">Dibuat: {formatReportDate(report.createdAt)}</p>
              </div>
              <button type="button" onClick={() => downloadReport(report)} className="flex h-14 items-center justify-center gap-3 rounded-[8px] border border-[#5c3386] px-6 text-base font-black text-[#5c3386] transition hover:bg-[#5c3386] hover:text-white">
                <Download className="h-4 w-4" />
                Download
              </button>
            </article>
          ))}
        </div>
      </AdminCard>
    </div>
  )
}
