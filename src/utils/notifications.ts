import type { CorrectionTicket } from '../types/attendance'

export type StudentNotification = {
  id: string
  studentId: string
  title: string
  message: string
  createdAt: string
  isRead: boolean
}

const notificationKey = 'scanin-student-notifications'

export const loadStudentNotifications = (studentId: string) => {
  const notifications = loadAllNotifications()
  return notifications.filter((notification) => notification.studentId === studentId)
}

export const saveTicketNotification = (
  ticket: CorrectionTicket,
  action: 'Disetujui' | 'Ditolak',
) => {
  const notifications = loadAllNotifications()
  const nextNotification: StudentNotification = {
    id: `notification-${ticket.id}-${Date.now()}`,
    studentId: ticket.studentId,
    title: `Tiket ${action.toLowerCase()}`,
    message: `Permohonan koreksi ${ticket.courseTitle} pada ${ticket.date} ${action.toLowerCase()} oleh pengajar.`,
    createdAt: new Date().toISOString(),
    isRead: false,
  }

  window.localStorage.setItem(
    notificationKey,
    JSON.stringify([nextNotification, ...notifications]),
  )
}

export const markStudentNotificationsRead = (studentId: string) => {
  const notifications = loadAllNotifications()
  const nextNotifications = notifications.map((notification) =>
    notification.studentId === studentId
      ? { ...notification, isRead: true }
      : notification,
  )

  window.localStorage.setItem(notificationKey, JSON.stringify(nextNotifications))
}

const loadAllNotifications = (): StudentNotification[] => {
  try {
    const storedNotifications = window.localStorage.getItem(notificationKey)
    return storedNotifications
      ? (JSON.parse(storedNotifications) as StudentNotification[])
      : []
  } catch {
    return []
  }
}

