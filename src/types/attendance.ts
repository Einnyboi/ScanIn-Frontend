export type ClassStatus = 'active' | 'upcoming' | 'closed'

export type CourseSchedule = {
  id: string
  title: string
  time: string
  room: string
  lecturer: string
  students: number
  status: ClassStatus
}

export type AttendanceRecord = {
  id: string
  courseTitle: string
  date: string
  time: string
  status: 'Hadir' | 'Terlambat' | 'Izin'
}

export type CorrectionTicket = {
  id: string
  studentName: string
  studentId: string
  courseTitle: string
  date: string
  reason: string
  status: 'Menunggu' | 'Disetujui' | 'Ditolak'
}

export type QrPayload = {
  token: string
  courseId: string
  courseTitle: string
  room: string
  studentName: string
  studentId: string
  issuedAt: string
  expiresAt: string
}

export type ScanRecord = {
  id: string
  studentName: string
  studentId: string
  courseTitle: string
  scannedAt: string
  recordedAt: string
  method: 'QR Code' | 'Manual'
  status:
    | 'Terverifikasi'
    | 'Terlambat'
    | 'Tidak Hadir'
    | 'Kedaluwarsa'
    | 'Tidak Valid'
}
