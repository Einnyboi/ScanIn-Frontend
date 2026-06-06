import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChevronRight, Download, Eye, FileText, X } from 'lucide-react'

import type { GeneratedReport, ReportKind } from '../../utils/reports'
import { formatReportDate, reportToRows } from '../../utils/reports'
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
  const [previewReport, setPreviewReport] = useState<GeneratedReport | null>(null)
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
            Buat laporan sesuai kebutuhan, lalu cek isi preview sebelum file CSV diunduh.
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
                Buat Laporan
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
          {reports.length ? (
            reports.map((report) => (
              <article key={report.id} className="flex flex-col gap-5 rounded-[8px] border border-slate-200 bg-white p-5 transition hover:border-[#5c3386]/35 hover:shadow-lg hover:shadow-slate-900/6 lg:flex-row lg:items-center lg:justify-between lg:p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-black text-slate-950 sm:text-xl">{report.title}</p>
                    <span className="rounded-full bg-[#5c3386]/10 px-3 py-1 text-xs font-black text-[#5c3386]">
                      {getReportKindLabel(report.kind)}
                    </span>
                  </div>
                  <p className="mt-2 text-base font-semibold text-slate-500">{report.description}</p>
                  <p className="mt-4 text-sm font-bold text-slate-400">Dibuat: {formatReportDate(report.createdAt)}</p>
                </div>
                <button type="button" onClick={() => setPreviewReport(report)} className="flex h-14 items-center justify-center gap-3 rounded-[8px] bg-[#5c3386] px-6 text-base font-black text-white shadow-lg shadow-[#5c3386]/20 transition hover:-translate-y-0.5 hover:bg-[#4c2a70]">
                  <Eye className="h-4 w-4" />
                  Lihat Isi
                </button>
              </article>
            ))
          ) : (
            <div className="rounded-[8px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
              <p className="text-base font-black text-slate-700">Belum ada laporan tersimpan.</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Pilih salah satu jenis laporan di atas untuk membuat preview pertama.
              </p>
            </div>
          )}
        </div>
      </AdminCard>

      {previewReport ? (
        <ReportPreviewModal
          onClose={() => setPreviewReport(null)}
          report={previewReport}
        />
      ) : null}
    </div>
  )
}

function ReportPreviewModal({
  onClose,
  report,
}: {
  onClose: () => void
  report: GeneratedReport
}) {
  const rows = useMemo(() => reportToRows(report), [report])
  const [headerRow = [], ...bodyRows] = rows

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/65 px-3 py-4 backdrop-blur-sm sm:items-center sm:px-5 sm:py-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preview ${report.title}`}
        className="admin-surface flex max-h-[92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[16px] bg-white shadow-2xl shadow-slate-950/30 sm:rounded-[12px]"
      >
        <header className="border-b border-slate-200 px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-[#5c3386]/10 px-3 py-1 text-xs font-black text-[#5c3386]">
                Preview sebelum download
              </span>
              <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
                {report.title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
                {report.description}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-slate-200 text-slate-500 transition hover:border-[#5c3386] hover:text-[#5c3386]"
              aria-label="Tutup preview laporan"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <ReportPreviewStat label="Jenis" value={getReportKindLabel(report.kind)} />
            <ReportPreviewStat label="Periode" value={report.month} />
            <ReportPreviewStat label="Dibuat" value={formatReportDate(report.createdAt)} />
            <ReportPreviewStat label="Jumlah Baris" value={`${bodyRows.length} data`} />
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto bg-slate-50/70 p-4 sm:p-6">
          <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-100">
                    {headerRow.map((column) => (
                      <th key={String(column)} className="px-5 py-4 text-sm font-black text-slate-700">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bodyRows.map((row, rowIndex) => (
                    <tr key={`${report.id}-${rowIndex}`} className="transition hover:bg-[#5c3386]/5">
                      {row.map((cell, cellIndex) => (
                        <td key={`${report.id}-${rowIndex}-${cellIndex}`} className="px-5 py-4 text-sm font-semibold leading-6 text-slate-600">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-[8px] border border-slate-300 px-6 text-sm font-black text-slate-600 transition hover:border-[#5c3386] hover:text-[#5c3386]"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => downloadReport(report)}
            className="flex h-12 items-center justify-center gap-3 rounded-[8px] bg-[#5c3386] px-6 text-sm font-black text-white shadow-lg shadow-[#5c3386]/20 transition hover:bg-[#4c2a70]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download CSV
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

function ReportPreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-slate-800">{value}</p>
    </div>
  )
}

function getReportKindLabel(kind: GeneratedReport['kind']) {
  if (kind === 'system-usage') return 'Penggunaan Sistem'
  if (kind === 'class-performance') return 'Kinerja Kelas'
  if (kind === 'at-risk-students') return 'Mahasiswa Bermasalah'
  return 'Kehadiran'
}
