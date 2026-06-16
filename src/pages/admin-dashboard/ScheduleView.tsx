import { useState, useEffect } from 'react'
import { Plus, ChevronDown, ChevronRight, Users } from 'lucide-react'
import { apiRequest } from '../../utils/api'
import type { CourseHierarchy } from '../../types/attendance'
import type { AdminUser } from '../../utils/adminUsers'
import { AdminCard, Input, Select, TimeInput } from './shared'
import { ClassEnrollmentModal } from './ClassEnrollmentModal'

export type ScheduleViewProps = {
  users: AdminUser[]
  schedules?: any
  onSchedulesChange?: any
}

export function ScheduleView({ users }: ScheduleViewProps) {
  const [courses, setCourses] = useState<CourseHierarchy[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  
  // Modals state
  const [enrollmentClass, setEnrollmentClass] = useState<{ id: string; name: string } | null>(null)
  const [createCourseMode, setCreateCourseMode] = useState(false)
  const [createClassTarget, setCreateClassTarget] = useState<string | null>(null)
  const [createSessionTarget, setCreateSessionTarget] = useState<string | null>(null)

  // Form states
  const [courseForm, setCourseForm] = useState({ kodeMatkul: '', namaMatkul: '', sks: 3 })
  const [classForm, setClassForm] = useState({ namaKelas: '' })
  const [sessionForm, setSessionForm] = useState({ hari: 'Senin', jamMulai: '08:00', jamSelesai: '10:00', room: '', lecturer: '' })

  const loadHierarchy = async () => {
    try {
      const data = await apiRequest<CourseHierarchy[]>('/schedules/hierarchy')
      if (data) setCourses(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHierarchy()
  }, [])

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiRequest('/schedules/courses', {
        method: 'POST',
        body: JSON.stringify(courseForm)
      })
      setCreateCourseMode(false)
      setCourseForm({ kodeMatkul: '', namaMatkul: '', sks: 3 })
      loadHierarchy()
    } catch {
      alert('Gagal membuat mata kuliah')
    }
  }

  const handleCreateClass = async (e: React.FormEvent, idMatkul: string) => {
    e.preventDefault()
    try {
      await apiRequest('/schedules/classes', {
        method: 'POST',
        body: JSON.stringify({ namaKelas: classForm.namaKelas, idMatkul })
      })
      setCreateClassTarget(null)
      setClassForm({ namaKelas: '' })
      loadHierarchy()
    } catch {
      alert('Gagal membuat kelas')
    }
  }

  const handleCreateSession = async (e: React.FormEvent, idKelas: string) => {
    e.preventDefault()
    try {
      await apiRequest('/schedules/sessions', {
        method: 'POST',
        body: JSON.stringify({
          kelasId: idKelas,
          hari: sessionForm.hari,
          time: `${sessionForm.jamMulai} - ${sessionForm.jamSelesai}`,
          room: sessionForm.room,
          lecturer: sessionForm.lecturer
        })
      })
      setCreateSessionTarget(null)
      setSessionForm({ hari: 'Senin', jamMulai: '08:00', jamSelesai: '10:00', room: '', lecturer: '' })
      loadHierarchy()
    } catch {
      alert('Gagal membuat jadwal/sesi')
    }
  }

  const lecturerOptions = users.filter(u => u.role === 'Pengajar').map(u => u.name)

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Memuat hierarki jadwal...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900">Mata Kuliah & Jadwal</h2>
        <button
          onClick={() => setCreateCourseMode(true)}
          className="flex items-center gap-2 rounded-[8px] bg-[#5c3386] px-4 py-2 text-sm font-black text-white hover:bg-[#4f2b73]"
        >
          <Plus className="h-4 w-4" /> Tambah Mata Kuliah
        </button>
      </div>

      {createCourseMode && (
        <AdminCard>
          <h3 className="font-bold text-lg mb-4">Mata Kuliah Baru</h3>
          <form onSubmit={handleCreateCourse} className="grid gap-4 md:grid-cols-3">
            <Input label="Kode Matkul" value={courseForm.kodeMatkul} onChange={v => setCourseForm({ ...courseForm, kodeMatkul: v })} placeholder="Contoh: IF101" />
            <Input label="Nama Matkul" value={courseForm.namaMatkul} onChange={v => setCourseForm({ ...courseForm, namaMatkul: v })} placeholder="Contoh: Pemrograman Web" />
            <Input label="SKS" type="number" value={courseForm.sks.toString()} onChange={v => setCourseForm({ ...courseForm, sks: Number(v) })} />
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" className="bg-[#5c3386] text-white px-4 py-2 rounded-lg font-bold">Simpan Matkul</button>
              <button type="button" onClick={() => setCreateCourseMode(false)} className="border border-slate-300 px-4 py-2 rounded-lg font-bold">Batal</button>
            </div>
          </form>
        </AdminCard>
      )}

      <div className="grid gap-4">
        {courses.map(course => (
          <div key={course.idMatkul} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div 
              className="flex cursor-pointer items-center justify-between p-5 hover:bg-slate-50"
              onClick={() => setExpandedCourse(expandedCourse === course.idMatkul ? null : course.idMatkul)}
            >
              <div>
                <h3 className="text-xl font-black text-slate-900">{course.namaMatkul}</h3>
                <p className="text-sm font-bold text-slate-500">{course.kodeMatkul} • {course.sks} SKS • {course.kelas.length} Kelas</p>
              </div>
              <div className="text-slate-400">
                {expandedCourse === course.idMatkul ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
              </div>
            </div>

            {expandedCourse === course.idMatkul && (
              <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-5">
                {course.kelas.map(cls => (
                  <div key={cls.idKelas} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-[#5c3386]">Kelas {cls.namaKelas}</h4>
                        <p className="text-sm font-semibold text-slate-500">{cls.studentsCount} Mahasiswa terdaftar</p>
                      </div>
                      <div className="flex gap-2 mt-3 sm:mt-0">
                        <button
                          onClick={() => setCreateSessionTarget(cls.idKelas)}
                          className="flex items-center gap-1 rounded bg-[#5c3386]/10 px-3 py-1.5 text-xs font-bold text-[#5c3386] hover:bg-[#5c3386]/20"
                        >
                          <Plus className="h-3 w-3" /> Tambah Jadwal
                        </button>
                        <button
                          onClick={() => setEnrollmentClass({ id: cls.idKelas, name: `${course.namaMatkul} - ${cls.namaKelas}` })}
                          className="flex items-center gap-1 rounded bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                        >
                          <Users className="h-3 w-3" /> Enroll Mahasiswa
                        </button>
                      </div>
                    </div>

                    {createSessionTarget === cls.idKelas && (
                      <form onSubmit={(e) => handleCreateSession(e, cls.idKelas)} className="mb-4 rounded bg-slate-50 p-4 border border-slate-200 grid gap-4 sm:grid-cols-2">
                        <Select label="Hari" value={sessionForm.hari} options={['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']} onChange={v => setSessionForm({...sessionForm, hari: v})} />
                        <Input label="Ruangan" value={sessionForm.room} onChange={v => setSessionForm({...sessionForm, room: v})} placeholder="Contoh: Lab Komputer" />
                        <TimeInput label="Jam Mulai" value={sessionForm.jamMulai} onChange={v => setSessionForm({...sessionForm, jamMulai: v})} />
                        <TimeInput label="Jam Selesai" value={sessionForm.jamSelesai} onChange={v => setSessionForm({...sessionForm, jamSelesai: v})} />
                        <Select label="Pengajar" value={sessionForm.lecturer} options={lecturerOptions} placeholder="Pilih Pengajar" className="sm:col-span-2" onChange={v => setSessionForm({...sessionForm, lecturer: v})} />
                        <div className="sm:col-span-2 flex gap-2">
                          <button type="submit" className="bg-[#5c3386] text-white px-3 py-1.5 rounded text-sm font-bold">Simpan Sesi</button>
                          <button type="button" onClick={() => setCreateSessionTarget(null)} className="border border-slate-300 px-3 py-1.5 rounded text-sm font-bold">Batal</button>
                        </div>
                      </form>
                    )}

                    {cls.jadwal.length === 0 ? (
                      <p className="text-sm font-semibold text-slate-400 italic">Belum ada sesi/jadwal untuk kelas ini.</p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {cls.jadwal.map(j => (
                          <div key={j.idJadwal} className="rounded border border-slate-100 bg-white p-3 shadow-sm shadow-slate-200/50">
                            <p className="font-bold text-slate-800">{j.hari}, {j.jamMulai} - {j.jamSelesai}</p>
                            <p className="text-xs font-semibold text-slate-500 mt-1">Ruang: {j.ruangan}</p>
                            <p className="text-xs font-semibold text-[#5c3386] mt-1">Dosen: {j.pengajar || 'Belum diatur'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {createClassTarget === course.idMatkul ? (
                  <form onSubmit={(e) => handleCreateClass(e, course.idMatkul)} className="flex items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex-1">
                      <Input label="Nama Kelas" value={classForm.namaKelas} onChange={v => setClassForm({ namaKelas: v })} placeholder="Contoh: TI A" />
                    </div>
                    <button type="submit" className="h-[52px] bg-[#5c3386] text-white px-4 rounded-lg font-bold">Simpan</button>
                    <button type="button" onClick={() => setCreateClassTarget(null)} className="h-[52px] border border-slate-300 px-4 rounded-lg font-bold">Batal</button>
                  </form>
                ) : (
                  <button
                    onClick={() => setCreateClassTarget(course.idMatkul)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-500 hover:border-[#5c3386] hover:text-[#5c3386]"
                  >
                    <Plus className="h-4 w-4" /> Tambah Kelas Baru
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {enrollmentClass && (
        <ClassEnrollmentModal
          kelasId={enrollmentClass.id}
          namaKelas={enrollmentClass.name}
          onClose={() => setEnrollmentClass(null)}
          onSuccess={() => {
            setEnrollmentClass(null)
            loadHierarchy()
          }}
        />
      )}
    </div>
  )
}
