import { useState, type FormEvent } from 'react'
import { Plus, Search } from 'lucide-react'

import type { CourseSchedule } from '../../types/attendance'
import type { AdminUser } from '../../utils/adminUsers'
import {
  createEmptySchedule,
  createScheduleId,
  getLecturerOptions,
  splitScheduleTime,
} from '../../utils/adminDashboard'
import { loadSchedules } from '../../utils/schedules'

import {
  ActionButtons,
  AdminCard,
  DataTable,
  DeletePinModal,
  EmptyState,
  Input,
  Select,
  SimpleStat,
  TimeInput,
  type DeleteConfirmation,
} from './shared'

export type ScheduleViewProps = {
  onSchedulesChange: (schedules: CourseSchedule[]) => void
  schedules: CourseSchedule[]
  users: AdminUser[]
}

export function ScheduleView({ onSchedulesChange, schedules, users }: ScheduleViewProps) {
  const [query, setQuery] = useState('')
  const [pageMode, setPageMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingId, setEditingId] = useState('')
  const [formData, setFormData] = useState<CourseSchedule>(createEmptySchedule())
  const [notice, setNotice] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<DeleteConfirmation | null>(null)
  const isEditing = Boolean(editingId)
  const scheduleTime = splitScheduleTime(formData.time)
  const lecturerOptions = getLecturerOptions(users, schedules, formData.lecturer)
  const filteredSchedules = schedules.filter((schedule) => {
    const lowerQuery = query.trim().toLowerCase()

    if (!lowerQuery) return true

    return [schedule.day ?? '', schedule.title, schedule.time, schedule.room, schedule.lecturer, schedule.status, String(schedule.students)].some((value) => value.toLowerCase().includes(lowerQuery))
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.title.trim() || !formData.time.trim() || !formData.room.trim()) {
      setNotice('Mata kuliah, jam, dan ruangan wajib diisi.')
      return
    }

    const schedule = {
      ...formData,
      id: isEditing ? editingId : createScheduleId(formData.title),
      students: Number(formData.students) || 0,
    }
    const nextSchedules = isEditing
      ? schedules.map((item) => (item.id === editingId ? schedule : item))
      : [schedule, ...schedules]

    onSchedulesChange(nextSchedules)
    setFormData(createEmptySchedule())
    setEditingId('')
    setNotice(isEditing ? 'Jadwal berhasil diperbarui dan disinkronkan.' : 'Jadwal berhasil ditambahkan dan tersedia di dashboard.')
    setPageMode('list')
  }

  const handleCreate = () => {
    setFormData(createEmptySchedule())
    setEditingId('')
    setNotice('')
    setPageMode('create')
  }

  const handleEdit = (schedule: CourseSchedule) => {
    setFormData(schedule)
    setEditingId(schedule.id)
    setNotice('')
    setPageMode('edit')
  }

  const handleDeleteRequest = (schedule: CourseSchedule) => {
    setDeleteTarget({
      title: 'Konfirmasi Hapus Jadwal',
      description: `Jadwal ${schedule.title} (${schedule.time}, ${schedule.room}) akan dihapus dari mahasiswa dan pengajar. Masukkan PIN admin 4 angka untuk melanjutkan.`,
      confirmLabel: 'Hapus Jadwal',
      onConfirm: () => {
        onSchedulesChange(schedules.filter((item) => item.id !== schedule.id))
        if (editingId === schedule.id) {
          setFormData(createEmptySchedule())
          setEditingId('')
          setPageMode('list')
        }
        setNotice('Jadwal berhasil dihapus setelah verifikasi PIN.')
      },
    })
  }

  const handleScheduleTimeChange = (field: 'start' | 'end', value: string) => {
    const nextTime = {
      ...splitScheduleTime(formData.time),
      [field]: value,
    }

    setFormData({
      ...formData,
      time: `${nextTime.start} - ${nextTime.end}`,
    })
  }

  if (pageMode !== 'list') {
    return (
      <div className="rounded-[8px] bg-slate-950 p-3 shadow-2xl shadow-slate-950/20 sm:p-6 lg:p-10">
        <section className="admin-surface mx-auto max-w-6xl rounded-[8px] bg-white px-5 py-7 shadow-2xl shadow-slate-950/20 sm:px-8 lg:px-12 lg:py-10">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {isEditing ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {isEditing
              ? 'Perbarui jadwal kuliah dengan format yang jelas untuk mahasiswa dan pengajar.'
              : 'Lengkapi jadwal baru. Data akan langsung tersinkron ke dashboard mahasiswa dan pengajar.'}
          </p>

          <form className="mt-8 grid gap-5 lg:grid-cols-2" onSubmit={handleSubmit}>
            <Input label="Mata Kuliah" value={formData.title} className="lg:col-span-1" inputClassName="h-16 text-base sm:text-lg" onChange={(value) => setFormData({ ...formData, title: value })} />
            <Select label="Pengajar" value={formData.lecturer} options={lecturerOptions} placeholder="Pilih Pengajar" className="lg:col-span-1" selectClassName="h-16 text-base sm:text-lg" onChange={(value) => setFormData({ ...formData, lecturer: value })} />

            <Select label="Hari" value={formData.day ?? ''} options={['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']} className="lg:col-span-1 xl:col-span-1" selectClassName="h-16 text-base sm:text-lg" onChange={(value) => setFormData({ ...formData, day: value })} />
            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-1">
              <TimeInput label="Jam Mulai" value={scheduleTime.start} onChange={(value) => handleScheduleTimeChange('start', value)} />
              <TimeInput label="Jam Selesai" value={scheduleTime.end} onChange={(value) => handleScheduleTimeChange('end', value)} />
            </div>

            <Input label="Ruangan" value={formData.room} placeholder="Contoh: B-204" inputClassName="h-16 text-base sm:text-lg" onChange={(value) => setFormData({ ...formData, room: value })} />
            <Input label="Kapasitas" type="number" value={String(formData.students)} placeholder="30" inputClassName="h-16 text-base sm:text-lg" onChange={(value) => setFormData({ ...formData, students: Number(value) })} />

            <Select label="Status Sesi" value={formData.status} options={['active', 'upcoming', 'closed']} className="lg:col-span-2" selectClassName="h-16 text-base sm:text-lg" onChange={(value) => setFormData({ ...formData, status: value as CourseSchedule['status'] })} />

            {notice ? <p className="rounded-[8px] bg-[#5c3386]/8 px-4 py-3 text-sm font-bold text-[#5c3386] lg:col-span-2">{notice}</p> : null}

            <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:col-span-2">
              <button type="button" onClick={() => {
                setPageMode('list')
                setFormData(createEmptySchedule())
                setEditingId('')
                setNotice('')
              }} className="h-14 rounded-[8px] border border-slate-300 px-5 text-base font-black text-slate-700 transition hover:border-[#5c3386] hover:text-[#5c3386]">
                Batal
              </button>
              <button type="submit" className="h-14 rounded-[8px] bg-[#5c3386] px-5 text-base font-black text-white shadow-lg shadow-[#5c3386]/20 transition hover:bg-[#4f2b73]">
                {isEditing ? 'Simpan Perubahan' : 'Simpan'}
              </button>
            </div>
          </form>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <SimpleStat label="Total Jadwal" value={schedules.length} />
        <SimpleStat label="Mata Kuliah" tone="purple" value={schedules.length} />
        <SimpleStat label="Ruangan Aktif" tone="green" value={new Set(schedules.map((item) => item.room)).size} />
        <SimpleStat label="Pengajar Aktif" tone="blue" value={new Set(schedules.map((item) => item.lecturer)).size} />
      </section>

      <AdminCard>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari jadwal, jam, dosen, atau ruangan..."
              className="h-12 w-full rounded-[8px] border border-slate-200 pl-12 pr-4 font-semibold outline-none focus:border-[#5c3386]"
            />
          </div>
          <button type="button" onClick={handleCreate} className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#5c3386] px-4 text-sm font-black text-white transition hover:bg-[#4f2b73]">
            <Plus className="h-4 w-4" />
            Tambah Jadwal
          </button>
        </div>
        {notice ? <p className="mt-4 rounded-[8px] bg-[#5c3386]/8 px-4 py-3 text-sm font-bold text-[#5c3386]">{notice}</p> : null}
        <div className="mt-5 grid gap-4">
          {filteredSchedules.map((schedule) => (
            <article key={schedule.id} className="rounded-[8px] border border-slate-200 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-lg font-black text-slate-950">{schedule.title}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {schedule.day ?? 'Hari'} - {schedule.time} - {schedule.room} - {schedule.lecturer}
                  </p>
                  <p className="mt-2 text-sm font-black text-[#5c3386]">
                    {schedule.students} mahasiswa - {schedule.status}
                  </p>
                </div>
                <ActionButtons onDelete={() => handleDeleteRequest(schedule)} onEdit={() => handleEdit(schedule)} />
              </div>
            </article>
          ))}
          {!filteredSchedules.length ? <EmptyState text="Tidak ada jadwal yang cocok dengan pencarian." /> : null}
        </div>
      </AdminCard>
      {deleteTarget ? <DeletePinModal target={deleteTarget} onClose={() => setDeleteTarget(null)} /> : null}
    </div>
  )
}
