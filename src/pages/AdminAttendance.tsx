import { useMemo, useState } from 'react'

import { attendanceHistory } from '../data/mockAttendance'
import { loadStoredScanRecords } from '../utils/attendanceStorage'

type AdminAttendanceRecord = {
  id: string
  student: string
  nim: string
  course: string
  date: string
  isoDate: string
  time: string
  status: 'Hadir' | 'Terlambat' | 'Tidak Hadir' | 'Tidak Valid' | 'Kedaluwarsa'
  method: 'QR Code' | 'Manual' | '-'
}

const fallbackRecords: AdminAttendanceRecord[] = [
  {
    id: 'admin-demo-1',
    student: "Naisya Yuen Ra'af",
    nim: '535240187',
    course: 'Software Development',
    date: '20 Mei 2026',
    isoDate: '2026-05-20',
    time: '08:02',
    status: 'Hadir',
    method: 'QR Code',
  },
  {
    id: 'admin-demo-2',
    student: 'Ahmad Rizki',
    nim: '535240156',
    course: 'Software Development',
    date: '20 Mei 2026',
    isoDate: '2026-05-20',
    time: '08:17',
    status: 'Terlambat',
    method: 'QR Code',
  },
  {
    id: 'admin-demo-3',
    student: 'Budi Santoso',
    nim: '535240132',
    course: 'Kecerdasan Buatan',
    date: '20 Mei 2026',
    isoDate: '2026-05-20',
    time: '-',
    status: 'Tidak Hadir',
    method: '-',
  },
]

export function AdminAttendance() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [query, setQuery] = useState('')
  const [exportMessage, setExportMessage] = useState('')

  const records = useMemo(() => {
    const storedRecords = loadStoredScanRecords().map((record) => {
      const recordedAt = record.recordedAt ? new Date(record.recordedAt) : new Date()
      return {
        id: record.id,
        student: record.studentName,
        nim: record.studentId,
        course: record.courseTitle,
        date: recordedAt.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        isoDate: recordedAt.toISOString().slice(0, 10),
        time: record.scannedAt.slice(0, 5),
        status: mapScanStatus(record.status),
        method: record.method ?? 'QR Code',
      }
    })

    const historyRecords = attendanceHistory.map((record) => ({
      id: `history-${record.id}`,
      student: '-',
      nim: '-',
      course: record.courseTitle,
      date: record.date,
      isoDate: '',
      time: record.time,
      status:
        record.status === 'Izin'
          ? ('Tidak Hadir' as const)
          : (record.status as 'Hadir' | 'Terlambat'),
      method: 'QR Code' as const,
    }))

    return [...storedRecords, ...fallbackRecords, ...historyRecords]
  }, [])

  const courses = useMemo(
    () => ['all', ...new Set(records.map((record) => record.course))],
    [records],
  )

  const filteredRecords = records.filter((record) => {
    const matchesDate = !selectedDate || record.isoDate === selectedDate
    const matchesCourse =
      selectedCourse === 'all' || record.course === selectedCourse
    const lowerQuery = query.toLowerCase()
    const matchesQuery =
      !query ||
      record.student.toLowerCase().includes(lowerQuery) ||
      record.nim.includes(query) ||
      record.course.toLowerCase().includes(lowerQuery)

    return matchesDate && matchesCourse && matchesQuery
  })

  const presentCount = filteredRecords.filter((record) => record.status === 'Hadir')
    .length
  const lateCount = filteredRecords.filter(
    (record) => record.status === 'Terlambat',
  ).length
  const absentCount = filteredRecords.filter(
    (record) => record.status === 'Tidak Hadir',
  ).length

  const handleExport = () => {
    const header = ['NIM', 'Nama', 'Mata Kuliah', 'Tanggal', 'Jam Masuk', 'Status', 'Metode']
    const rows = filteredRecords.map((record) => [
      record.nim,
      record.student,
      record.course,
      record.date,
      record.time,
      record.status,
      record.method,
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'scanin-presensi.csv'
    link.click()
    URL.revokeObjectURL(url)
    setExportMessage('Data presensi berhasil diekspor ke CSV.')
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
          Admin Presensi
        </p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">
          Data Presensi
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Data ini menggabungkan hasil scan QR, input manual pengajar, dan contoh
          riwayat lokal.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <AdminMiniStat label="Total" value={`${filteredRecords.length}`} />
        <AdminMiniStat label="Hadir" value={`${presentCount}`} tone="green" />
        <AdminMiniStat label="Terlambat" value={`${lateCount}`} tone="yellow" />
        <AdminMiniStat label="Tidak Hadir" value={`${absentCount}`} tone="red" />
      </div>

      <div className="rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/6">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_220px_auto]">
          <label className="block">
            <span className="text-sm font-black text-slate-600">Cari</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nama, NIM, atau mata kuliah"
              className="mt-2 h-11 w-full rounded-[8px] border border-slate-200 px-3 text-sm font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
            />
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-600">Tanggal</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="mt-2 h-11 w-full rounded-[8px] border border-slate-200 px-3 text-sm font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
            />
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-600">Mata Kuliah</span>
            <select
              value={selectedCourse}
              onChange={(event) => setSelectedCourse(event.target.value)}
              className="mt-2 h-11 w-full rounded-[8px] border border-slate-200 px-3 text-sm font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
            >
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course === 'all' ? 'Semua Kelas' : course}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={handleExport}
            className="flex h-11 self-end items-center justify-center rounded-[8px] bg-[#5c3386] px-5 text-sm font-black text-white transition hover:bg-[#4f2b73]"
          >
            Export CSV
          </button>
        </div>
        {exportMessage ? (
          <p className="mt-3 rounded-[8px] bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {exportMessage}
          </p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[8px] border border-white bg-white shadow-lg shadow-slate-900/6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-slate-50">
              <tr>
                {[
                  'NIM',
                  'Nama',
                  'Mata Kuliah',
                  'Tanggal',
                  'Jam Masuk',
                  'Status',
                  'Metode',
                ].map((column) => (
                  <th
                    key={column}
                    className="px-5 py-4 text-sm font-black text-slate-600"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                    {record.nim}
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-slate-900">
                    {record.student}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                    {record.course}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                    {record.date}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                    {record.time}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                    {record.method}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function AdminMiniStat({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'green' | 'yellow' | 'red'
}) {
  const color =
    tone === 'green'
      ? 'text-emerald-600'
      : tone === 'yellow'
        ? 'text-[#c28a08]'
        : tone === 'red'
          ? 'text-[#7d2228]'
          : 'text-slate-950'

  return (
    <div className="rounded-[8px] border border-white bg-white p-5 shadow-lg shadow-slate-900/6">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-black ${color}`}>{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: AdminAttendanceRecord['status'] }) {
  const tone =
    status === 'Hadir'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'Terlambat'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-[#7d2228]/10 text-[#7d2228]'

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}>
      {status}
    </span>
  )
}

function mapScanStatus(status: string): AdminAttendanceRecord['status'] {
  if (status === 'Terverifikasi') {
    return 'Hadir'
  }

  if (status === 'Terlambat') {
    return 'Terlambat'
  }

  if (status === 'Kedaluwarsa') {
    return 'Kedaluwarsa'
  }

  if (status === 'Tidak Valid') {
    return 'Tidak Valid'
  }

  return 'Tidak Hadir'
}
