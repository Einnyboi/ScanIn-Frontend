import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, FileText, Send } from 'lucide-react'

import { DashboardShell } from '../components/dashboard/DashboardShell'
import type { CorrectionTicket, CourseSchedule } from '../types/attendance'
import type { LocalSession } from '../types/auth'
import { loadStudentNotifications } from '../utils/notifications'
import {
  fetchSchedulesFromBackend,
  loadSchedules,
  scheduleChangedEvent,
} from '../utils/schedules'
import { saveCorrectionTicket } from '../utils/tickets'

type StudentTicketPageProps = {
  session: LocalSession
  onLogout: () => void
}

export function StudentTicketPage({ session, onLogout }: StudentTicketPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialCourseId = searchParams.get('courseId')
  const [schedules, setSchedules] = useState<CourseSchedule[]>(() =>
    loadSchedules(),
  )
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId ?? '')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const unreadNotificationCount = loadStudentNotifications(session.identity).filter(
    (notification) => !notification.isRead,
  ).length

  useEffect(() => {
    const applySchedules = (nextSchedules: CourseSchedule[]) => {
      setSchedules(nextSchedules)
      setSelectedCourseId((currentCourseId) => {
        if (currentCourseId && nextSchedules.some((item) => item.id === currentCourseId)) {
          return currentCourseId
        }

        return initialCourseId ?? nextSchedules[0]?.id ?? ''
      })
    }
    const reloadSchedules = () => applySchedules(loadSchedules())

    void fetchSchedulesFromBackend().then((backendSchedules) => {
      if (backendSchedules) {
        applySchedules(backendSchedules)
      }
    })

    window.addEventListener('storage', reloadSchedules)
    window.addEventListener(scheduleChangedEvent, reloadSchedules)
    return () => {
      window.removeEventListener('storage', reloadSchedules)
      window.removeEventListener(scheduleChangedEvent, reloadSchedules)
    }
  }, [initialCourseId])

  const selectedCourse = useMemo(
    () => schedules.find((course) => course.id === selectedCourseId) ?? null,
    [schedules, selectedCourseId],
  )

  const handleSubmit = async () => {
    if (!selectedCourse) {
      setMessage('Pilih jadwal dulu sebelum mengirim tiket.')
      return
    }

    if (!reason.trim()) {
      setMessage('Isi alasan koreksi presensi dulu.')
      return
    }

    setIsSubmitting(true)
    const newTicket: CorrectionTicket = {
      id: `ticket-${session.identity}-${Date.now()}`,
      studentName: session.name,
      studentId: session.identity,
      courseTitle: selectedCourse.title,
      date: new Date().toISOString().split('T')[0],
      reason: reason.trim(),
      status: 'Menunggu',
    }

    try {
      await saveCorrectionTicket(newTicket)
      setReason('')
      setMessage('Tiket berhasil dikirim ke admin.')
    } catch {
      setMessage('Tiket tersimpan lokal, tapi belum berhasil sinkron ke backend.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardShell
      notificationCount={unreadNotificationCount}
      notificationHref="/student/notifications"
      notificationLabel="Notifikasi"
      onLogout={onLogout}
      session={session}
    >
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => navigate('/student')}
          className="inline-flex h-10 items-center gap-2 rounded-lg px-1 text-sm font-black text-slate-600 transition hover:text-[#5c3386]"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          Kembali ke Dashboard
        </button>

        <section className="admin-surface grid overflow-hidden rounded-lg border border-white bg-white shadow-xl shadow-slate-900/7 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-gradient-to-br from-[#5c3386] to-[#7d2228] p-6 text-white sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/15 shadow-lg shadow-black/10">
              <FileText className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-white/70">
              Koreksi Presensi
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Ajukan Tiket
            </h1>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-white/78">
              Gunakan tiket kalau QR tidak terbaca, koneksi bermasalah, atau ada
              kendala lain saat presensi. Tiket akan masuk ke pengajar dan admin.
            </p>

            <div className="mt-8 rounded-lg border border-white/15 bg-white/10 p-4">
              <p className="text-sm font-black text-white">{session.name}</p>
              <p className="mt-1 text-sm font-semibold text-white/72">
                {session.identity}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">
                  Mata Kuliah
                </span>
                <select
                  value={selectedCourseId}
                  onChange={(event) => setSelectedCourseId(event.target.value)}
                  className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
                >
                  {!schedules.length ? (
                    <option value="">Belum ada jadwal</option>
                  ) : null}
                  {schedules.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} - {course.time}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d2228]">
                  Jadwal Dipilih
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-950">
                  {selectedCourse?.title ?? 'Belum ada jadwal'}
                </h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {selectedCourse
                    ? `${selectedCourse.time} - ${selectedCourse.room} - ${selectedCourse.lecturer}`
                    : 'Jadwal dari admin akan muncul di sini.'}
                </p>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">
                  Alasan Koreksi
                </span>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Contoh: QR tidak terdeteksi saat kelas berlangsung, sudah mencoba beberapa kali."
                  className="min-h-36 resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/12"
                />
              </label>

              {message ? (
                <p className="rounded-lg border border-[#5c3386]/15 bg-[#5c3386]/8 px-4 py-3 text-sm font-black leading-6 text-[#5c3386]">
                  {message}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate('/student')}
                  className="flex h-12 flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:border-[#5c3386]/40 hover:text-[#5c3386]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#5c3386] px-4 text-sm font-black text-white shadow-lg shadow-[#5c3386]/20 transition hover:-translate-y-0.5 hover:bg-[#4f2b73] disabled:translate-y-0 disabled:bg-slate-300"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {isSubmitting ? 'Mengirim...' : 'Kirim Tiket'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}
