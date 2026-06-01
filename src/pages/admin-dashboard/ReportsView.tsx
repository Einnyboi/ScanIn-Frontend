import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChevronRight, Download, FileText } from 'lucide-react'

import type { GeneratedReport, ReportKind } from '../../utils/reports'
import { formatReportDate } from '../../utils/reports'
import { type AdminAnalytics } from '../../utils/adminDashboard'
import { downloadReport } from '../../utils/adminDashboard'
import { amber, maroon, purple } from './shared'

import { AdminCard, SimpleStat, TrendStat } from './shared'

export type ReportsViewProps = {
  analytics: AdminAnalytics
  onGenerateReport: (kind?: ReportKind) => void
  reports: GeneratedReport[]
}

export function ReportsView({ analytics, onGenerateReport, reports }: ReportsViewProps) {
  const reportActions: Array<{ description: string; kind: ReportKind; title: string }> = [
    { kind: 'attendance', title: 'Laporan Kehadiran Bulanan', description: 'Ringkasan hadir, terlambat, alpha, dan total sesi.' },
    { kind: 'system-usage', title: 'Laporan Penggunaan Sistem', description: 'Aktivitas login, scan QR, tiket, reset password, dan unduhan.' },
    { kind: 'class-performance', title: 'Laporan Kinerja Per Kelas', description: 'Perbandingan performa kehadiran setiap mata kuliah.' },
    { kind: 'at-risk-students', title: 'Laporan Mahasiswa Bermasalah', description: 'Mahasiswa dengan kehadiran rendah atau tiket berulang.' },
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <TrendStat label="Kehadiran Rata-rata" trend={analytics.attendanceTrend} value={`${analytics.attendanceRate}%`} />
        <TrendStat label="Keterlambatan" tone="yellow" trend={analytics.lateTrend} value={`${analytics.lateRate}%`} />
        <TrendStat label="Ketidakhadiran" tone="red" trend={analytics.absentTrend} value={`${analytics.absentRate}%`} />
        <SimpleStat label="Total Sesi" tone="blue" value={analytics.totalSessions} />
      </section>

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
          <h2 className="text-2xl font-black text-slate-950">Pilih Jenis Laporan</h2>
          <p className="text-sm font-semibold leading-6 text-slate-500">
            Setiap laporan langsung dibuat, tersimpan di daftar, dan bisa diunduh sebagai CSV.
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
          <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Laporan Tersedia</h2>
          <div className="flex min-h-14 items-center gap-3 rounded-[8px] border border-[#5c3386]/15 bg-[#5c3386]/5 px-5 text-sm font-black text-[#5c3386]">
            <FileText className="h-5 w-5" aria-hidden="true" />
            <span>{reports.length} laporan tersimpan</span>
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
