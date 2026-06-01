import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCircle2, ChevronLeft } from 'lucide-react'

import { DashboardShell } from '../components/dashboard/DashboardShell'
import type { LocalSession } from '../types/auth'
import {
  type StudentNotification,
  loadStudentNotifications,
  markStudentNotificationsRead,
} from '../utils/notifications'

type StudentNotificationsPageProps = {
  session: LocalSession
  onLogout: () => void
}

export function StudentNotificationsPage({
  session,
  onLogout,
}: StudentNotificationsPageProps) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<StudentNotification[]>(() =>
    loadStudentNotifications(session.identity),
  )

  const unreadCount = notifications.filter((notification) => !notification.isRead)
    .length

  useEffect(() => {
    const reloadNotifications = () =>
      setNotifications(loadStudentNotifications(session.identity))

    reloadNotifications()
    window.addEventListener('storage', reloadNotifications)
    return () => window.removeEventListener('storage', reloadNotifications)
  }, [session.identity])

  const markAllRead = () => {
    markStudentNotificationsRead(session.identity)
    setNotifications(loadStudentNotifications(session.identity))
  }

  return (
    <DashboardShell
      notificationCount={unreadCount}
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

        <section className="admin-surface overflow-hidden rounded-lg border border-white bg-white shadow-xl shadow-slate-900/7">
          <div className="border-b border-slate-100 bg-gradient-to-r from-[#5c3386] to-[#7d2228] px-5 py-6 text-white sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                  Pusat Notifikasi
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  Update Presensi
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/78">
                  Semua informasi dari pengajar tentang tiket koreksi dan status
                  presensi kamu dikumpulkan di sini.
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/16 text-white shadow-lg shadow-black/10">
                <Bell className="h-7 w-7" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-500">
                  {unreadCount
                    ? `${unreadCount} notifikasi belum dibaca`
                    : 'Semua notifikasi sudah dibaca'}
                </p>
              </div>
              <button
                type="button"
                onClick={markAllRead}
                disabled={!unreadCount}
                className="flex h-11 w-full items-center justify-center rounded-lg border border-[#5c3386] px-4 text-sm font-black text-[#5c3386] transition hover:bg-[#5c3386] hover:text-white disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white sm:w-auto"
              >
                Tandai Semua Dibaca
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {notifications.length ? (
                notifications.map((notification, index) => (
                  <article
                    key={notification.id}
                    className={`admin-surface rounded-lg border p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${
                      notification.isRead
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-[#5c3386]/20 bg-[#5c3386]/7'
                    }`}
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          notification.isRead
                            ? 'bg-slate-200 text-slate-500'
                            : 'bg-[#5c3386] text-white'
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <h2 className="text-base font-black text-slate-950">
                            {notification.title}
                          </h2>
                          <span className="text-xs font-bold text-slate-400">
                            {formatNotificationTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                  <p className="text-lg font-black text-slate-950">
                    Belum ada notifikasi
                  </p>
                  <p className="mx-auto mt-2 max-w-lg text-sm font-semibold leading-6 text-slate-500">
                    Nanti saat tiket disetujui, ditolak, atau presensi berhasil
                    dicatat, informasinya muncul di halaman ini.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

function formatNotificationTime(value: string) {
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
