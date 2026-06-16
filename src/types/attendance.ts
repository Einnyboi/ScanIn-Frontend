export type ClassStatus = 'active' | 'upcoming' | 'closed'

export type CourseSchedule = {
  id: string
  day?: string
  title: string
  time: string
  room: string
  lecturer: string
  students: number
  status: ClassStatus
}

export type HierarchyJadwal = {
  id: string
  idJadwal: string
  hari: string
  jamMulai: string
  jamSelesai: string
  ruangan: string
  pengajar: string
  status: ClassStatus
}

export type HierarchyKelas = {
  id: string
  idKelas: string
  namaKelas: string
  studentsCount: number
  jadwal: HierarchyJadwal[]
}

export type CourseHierarchy = {
  idMatkul: string
  kodeMatkul: string
  namaMatkul: string
  sks: number
  kelas: HierarchyKelas[]
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
  submittedAt?: string
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
