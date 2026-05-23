import type {
  AttendanceRecord,
  CorrectionTicket,
  CourseSchedule,
} from '../types/attendance'

const activeDemoTime = createActiveDemoTime()

export const studentSchedules: CourseSchedule[] = [
  {
    id: 'software-development',
    day: 'Senin',
    title: 'Software Development',
    time: activeDemoTime,
    room: 'Lab. Pemrograman 905',
    lecturer: 'Lina, S.T., M.Kom., Ph.D.',
    students: 38,
    status: 'active',
  },
  {
    id: 'pemrograman-web',
    day: 'Senin',
    title: 'Pemrograman Web',
    time: '10:30 - 12:30',
    room: 'R-705',
    lecturer: 'Novario Jaya Perdana, S.Kom., M.T.',
    students: 48,
    status: 'upcoming',
  },
  {
    id: 'kecerdasan-buatan',
    day: 'Rabu',
    title: 'Kecerdasan Buatan',
    time: '13:00 - 15:00',
    room: 'R-805',
    lecturer: 'Lely Hiryanto, S.T., M.Sc., Ph.D.',
    students: 25,
    status: 'upcoming',
  },
]

export const lecturerSchedules: CourseSchedule[] = [
  {
    id: 'software-development',
    day: 'Senin',
    title: 'Software Development',
    time: activeDemoTime,
    room: 'Lab. Pemrograman 905',
    lecturer: 'Lina, S.T., M.Kom., Ph.D.',
    students: 38,
    status: 'active',
  },
  {
    id: 'pemrograman-web',
    day: 'Senin',
    title: 'Pemrograman Web',
    time: '10:30 - 12:30',
    room: 'R-705',
    lecturer: 'Novario Jaya Perdana, S.Kom., M.T.',
    students: 48,
    status: 'upcoming',
  },
  {
    id: 'kecerdasan-buatan',
    day: 'Rabu',
    title: 'Kecerdasan Buatan',
    time: '13:00 - 15:00',
    room: 'R-805',
    lecturer: 'Lely Hiryanto, S.T., M.Sc., Ph.D.',
    students: 25,
    status: 'upcoming',
  },
]

function createActiveDemoTime() {
  const now = new Date()
  const start = new Date(now.getTime() - 15 * 60 * 1000)
  const end = new Date(now.getTime() + 45 * 60 * 1000)

  return `${formatTime(start)} - ${formatTime(end)}`
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`
}

export const attendanceHistory: AttendanceRecord[] = [
  {
    id: 'history-1',
    courseTitle: 'Basis Data Lanjut',
    date: '19 Mei 2026',
    time: '08:05',
    status: 'Hadir',
  },
  {
    id: 'history-2',
    courseTitle: 'Pemrograman Web',
    date: '18 Mei 2026',
    time: '10:28',
    status: 'Hadir',
  },
  {
    id: 'history-3',
    courseTitle: 'Kecerdasan Buatan',
    date: '17 Mei 2026',
    time: '13:17',
    status: 'Terlambat',
  },
  {
    id: 'history-4',
    courseTitle: 'Software Development',
    date: '16 Mei 2026',
    time: '08:02',
    status: 'Hadir',
  },
]

export const correctionTickets: CorrectionTicket[] = [
  {
    id: 'ticket-1',
    studentName: "Naisya Yuen Ra'af",
    studentId: '535240187',
    courseTitle: 'Software Development',
    date: '17 Mei 2026',
    reason: 'Sistem error saat scan QR',
    status: 'Menunggu',
  },
  {
    id: 'ticket-2',
    studentName: 'Cathrine Sandrina',
    studentId: '535240075',
    courseTitle: 'Pemrograman Web',
    date: '16 Mei 2026',
    reason: 'Terlambat karena macet',
    status: 'Menunggu',
  },
]
