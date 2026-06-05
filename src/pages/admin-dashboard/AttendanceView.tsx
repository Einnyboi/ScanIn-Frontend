import { useState } from 'react'
import { CalendarDays, Download, Search } from 'lucide-react'

import type { ScanRecord } from '../../types/attendance'
import { downloadAttendanceRows, formatRecordDate, getRecordDateInput } from '../../utils/adminDashboard'

import { AdminCard, DataTable, EmptyState, Select, SimpleStat } from './shared'

export type AttendanceViewProps = {
  scanRecords: ScanRecord[]
}

export function AttendanceView({ scanRecords }: AttendanceViewProps) {
  const [query, setQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('Semua Kelas')
  const rows = scanRecords
  const courseOptions = ['Semua Kelas', ...Array.from(new Set(rows.map((row) => row.courseTitle)))]
  const filteredRows = rows.filter((row) => {
    const lowerQuery = query.trim().toLowerCase()
    const matchesQuery =
      !lowerQuery ||
      [row.studentId, row.studentName, row.courseTitle, row.scannedAt, row.status, row.method].some((value) => value.toLowerCase().includes(lowerQuery))
    const matchesCourse = courseFilter === 'Semua Kelas' || row.courseTitle === courseFilter
    const matchesDate = !dateFilter || getRecordDateInput(row.recordedAt) === dateFilter

    return matchesQuery && matchesCourse && matchesDate
  })

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <SimpleStat label="Total Presensi Hari Ini" value={rows.length} />
        <SimpleStat label="Hadir" tone="green" value={rows.filter((row) => row.status === 'Terverifikasi').length} />
        <SimpleStat label="Terlambat" tone="yellow" value={rows.filter((row) => row.status === 'Terlambat').length} />
        <SimpleStat label="Tidak Hadir" tone="red" value={rows.filter((row) => row.status === 'Tidak Hadir').length} />
      </section>

      <AdminCard className="p-6 sm:p-8">
        <div className="grid gap-5 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
          <label className="block">
            <span className="flex items-center gap-2 text-sm font-black text-slate-700">
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
              Tanggal
            </span>
            <input
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              type="date"
              className="mt-3 h-14 w-full rounded-[8px] border border-slate-300 px-4 text-base font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/10"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-black text-slate-700">
              <Search className="h-5 w-5" aria-hidden="true" />
              Pencarian
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari NIM, nama, jam, status..."
              className="mt-3 h-14 w-full rounded-[8px] border border-slate-300 px-4 text-base font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/10"
            />
          </label>

          <Select label="Mata Kuliah" value={courseFilter} options={courseOptions} selectClassName="h-14 text-base" onChange={setCourseFilter} />

          <button type="button" onClick={() => downloadAttendanceRows(filteredRows)} className="flex h-14 items-center justify-center gap-3 rounded-[8px] bg-[#5c3386] px-6 text-base font-black text-white shadow-lg shadow-[#5c3386]/20 transition hover:bg-[#4f2b73]">
            <Download className="h-5 w-5" aria-hidden="true" />
            Export Excel
          </button>
        </div>
      </AdminCard>

      <AdminCard className="overflow-hidden p-0">
        {filteredRows.length ? (
          <DataTable
            flush
            columns={['NIM', 'Nama', 'Mata Kuliah', 'Tanggal', 'Jam Masuk', 'Status', 'Metode']}
            rows={filteredRows.map((row) => [row.studentId, row.studentName, row.courseTitle, formatRecordDate(row.recordedAt), row.scannedAt, row.status === 'Terverifikasi' ? 'Hadir' : row.status, row.method])}
          />
        ) : (
          <EmptyState text="Tidak ada data presensi yang cocok dengan pencarian." />
        )}
      </AdminCard>
    </div>
  )
}
