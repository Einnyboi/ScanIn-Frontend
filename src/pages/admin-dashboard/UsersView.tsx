import { useState, useRef, type FormEvent } from 'react'
import { Plus, Search, Upload } from 'lucide-react'
import { apiRequest } from '../../utils/api'

import type { AdminUser, AdminUserRole } from '../../utils/adminUsers'
import {
  createEmptyUser,
  getAdminUserDomainHint,
  getAdminUserKey,
  getExpectedEmailDomain,
} from '../../utils/adminDashboard'

import {
  ActionButtons,
  AdminCard,
  AdminRoleBadge,
  AdminStatusBadge,
  DataTable,
  DeletePinModal,
  EmptyState,
  Input,
  Select,
  SimpleStat,
  type DeleteConfirmation,
  AdminSubPageHeader,
} from './shared'

export type UsersViewProps = {
  onUsersChange: (users: AdminUser[], sync?: boolean) => Promise<void>
  users: AdminUser[]
}

export function UsersView({ onUsersChange, users }: UsersViewProps) {
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'Semua' | AdminUserRole>('Semua')
  const [pageMode, setPageMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingKey, setEditingKey] = useState('')
  const [formData, setFormData] = useState<AdminUser>(createEmptyUser())
  const [notice, setNotice] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<DeleteConfirmation | null>(null)
  const isEditing = Boolean(editingKey)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredUsers = users.filter((user) => {
    const lowerQuery = query.toLowerCase()
    const matchesQuery =
      !query ||
      user.id.toLowerCase().includes(lowerQuery) ||
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery)
    const matchesRole = roleFilter === 'Semua' || user.role === roleFilter
    return matchesQuery && matchesRole
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.id.trim() || !formData.name.trim() || !formData.email.trim()) {
      setNotice('ID, nama, dan email wajib diisi.')
      return
    }

    const normalizedUser = {
      ...formData,
      id: formData.id.trim(),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
    }
    const expectedDomain = getExpectedEmailDomain(normalizedUser.role)

    if (!normalizedUser.email.endsWith(expectedDomain)) {
      setNotice(`Email ${normalizedUser.role} wajib memakai domain ${expectedDomain}.`)
      return
    }

    try {
      if (isEditing) {
        const oldUser = users.find((u) => getAdminUserKey(u) === editingKey)
        const updatedUser = await apiRequest<AdminUser>(
          `/admin-users/${oldUser?.role}/${oldUser?.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify(normalizedUser),
          },
        )
        const nextUsers = users.map((user) =>
          getAdminUserKey(user) === editingKey ? updatedUser : user,
        )
        await onUsersChange(nextUsers, false)
      } else {
        const createdUser = await apiRequest<AdminUser>('/admin-users', {
          method: 'POST',
          body: JSON.stringify(normalizedUser),
        })
        const nextUsers = [createdUser, ...users]
        await onUsersChange(nextUsers, false)
      }

      setFormData(createEmptyUser())
      setEditingKey('')
      setNotice(
        isEditing
          ? 'Data pengguna berhasil diperbarui.'
          : 'Pengguna baru berhasil ditambahkan.',
      )
      setPageMode('list')
    } catch {
      setNotice('Gagal menyimpan pengguna ke backend. Data belum diubah.')
    }
  }

  const handleCreate = () => {
    setFormData(createEmptyUser())
    setEditingKey('')
    setNotice('')
    setPageMode('create')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setNotice('Memproses file CSV...')
    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target?.result as string
      if (!text) return

      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length <= 1) {
        setNotice('File CSV kosong atau tidak valid.')
        return
      }

      // Check header
      const header = lines[0].toLowerCase()
      if (!(header.includes('nim') && header.includes('nama') && header.includes('kelas'))) {
        setNotice('Format CSV tidak sesuai (kolom minimal: nim, nama, kelas rombel)')
        return
      }

      const usersToCreate: AdminUser[] = []

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim())
        if (parts.length < 3) continue

        // Basic parsing: nim, nama, kelas rombel, tipe kelas
        const nim = parts[0]
        const nama = parts[1]
        const kelasRombel = parts[2]
        const tipeKelas = parts[3] ? parts[3].toUpperCase() : 'PAGI'

        const email = `${nama.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')}.${nim}@stu.untar.ac.id`

        usersToCreate.push({
          id: nim,
          name: nama,
          email,
          role: 'Mahasiswa',
          status: 'Aktif',
          kelasRombel,
          tipeKelas: tipeKelas as any,
        })
      }

      try {
        const createdUsers = await apiRequest<AdminUser[]>('/admin-users/bulk', {
          method: 'POST',
          body: JSON.stringify(usersToCreate),
        })

        const nextUsers = [...createdUsers, ...users]
        await onUsersChange(nextUsers, false)
        setNotice(`Berhasil mengimpor ${createdUsers.length} mahasiswa dari CSV.`)
      } catch {
        setNotice('Gagal mengimpor dari CSV.')
      }
    }
    reader.readAsText(file)
    e.target.value = '' // reset
  }

  const handleEdit = (user: AdminUser) => {
    setFormData(user)
    setEditingKey(getAdminUserKey(user))
    setNotice('')
    setPageMode('edit')
  }

  const handleDeleteRequest = (user: AdminUser) => {
    const key = getAdminUserKey(user)

    setDeleteTarget({
      title: 'Konfirmasi Hapus Pengguna',
      description: `Data ${user.name} (${user.id}) akan dihapus dari daftar ${user.role}. Masukkan PIN admin 4 angka untuk melanjutkan.`,
      confirmLabel: 'Hapus Pengguna',
      onConfirm: async () => {
        try {
          await apiRequest(`/admin-users/${user.role}/${user.id}`, { method: 'DELETE' })
          await onUsersChange(
            users.filter((item) => getAdminUserKey(item) !== key),
            false,
          )
          if (editingKey === key) {
            setFormData(createEmptyUser())
            setEditingKey('')
            setPageMode('list')
          }
          setNotice('Pengguna berhasil dihapus setelah verifikasi PIN.')
        } catch {
          setNotice('Gagal menghapus pengguna dari backend. Data belum diubah.')
        }
      },
    })
  }

  if (pageMode !== 'list') {
    return (
      <div className="space-y-6">
        <AdminSubPageHeader
          title={isEditing ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
          subtitle={isEditing ? 'Perbarui identitas, email institusi, role, dan status akun.' : 'Buat akun awal untuk mahasiswa, pengajar, atau admin.'}
          onBack={() => {
            setPageMode('list')
            setFormData(createEmptyUser())
            setEditingKey('')
            setNotice('')
          }}
        />

        <AdminCard title="Informasi Akun">
          <p className="mb-5 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
            {getAdminUserDomainHint(formData.role)}
          </p>
          <form className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6" onSubmit={handleSubmit}>
            <Input label="NIM/NIP/ID" value={formData.id} onChange={(value) => setFormData({ ...formData, id: value })} />
            <Input label="Nama Lengkap" value={formData.name} onChange={(value) => setFormData({ ...formData, name: value })} />
            <Input label="Email Institusi" type="email" value={formData.email} onChange={(value) => setFormData({ ...formData, email: value })} />
            <Select label="Role" value={formData.role} options={['Mahasiswa', 'Pengajar', 'Admin']} onChange={(value) => setFormData({ ...formData, role: value as AdminUserRole })} />
            <Select label="Status" value={formData.status} options={['Aktif', 'Nonaktif']} onChange={(value) => setFormData({ ...formData, status: value as AdminUser['status'] })} />
            
            {formData.role === 'Mahasiswa' && (
              <>
                <Input label="Kelas Rombel" placeholder="Misal: TI A" value={formData.kelasRombel || ''} onChange={(value) => setFormData({ ...formData, kelasRombel: value })} />
                <Select label="Tipe Kelas" value={formData.tipeKelas || 'PAGI'} options={['PAGI', 'SORE', 'MALAM']} onChange={(value) => setFormData({ ...formData, tipeKelas: value as any })} />
              </>
            )}

            <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
              <button type="submit" className="h-12 flex-1 rounded-[8px] bg-[#5c3386] px-4 text-sm font-black text-white transition hover:bg-[#4f2b73]">
                {isEditing ? 'Simpan Perubahan' : 'Simpan Pengguna'}
              </button>
            </div>
          </form>
          {notice ? <p className="mt-4 rounded-[8px] bg-[#5c3386]/8 px-4 py-3 text-sm font-bold text-[#5c3386]">{notice}</p> : null}
        </AdminCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SimpleStat label="Total Pengguna" value={users.length} />
        <SimpleStat label="Mahasiswa" tone="blue" value={users.filter((user) => user.role === 'Mahasiswa').length} />
        <SimpleStat label="Pengajar" tone="green" value={users.filter((user) => user.role === 'Pengajar').length} />
        <SimpleStat label="Admin" tone="purple" value={users.filter((user) => user.role === 'Admin').length} />
      </section>

      <AdminCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative min-w-0 flex-1 xl:max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama, email, atau ID..."
              className="h-12 w-full rounded-[8px] border border-slate-300 bg-white pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-[#5c3386] focus:ring-4 focus:ring-[#5c3386]/10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['Semua', 'Mahasiswa', 'Pengajar', 'Admin'] as const).map((role) => (
              <button key={role} type="button" onClick={() => setRoleFilter(role)} className={`h-11 rounded-[8px] px-4 text-sm font-black transition ${roleFilter === role ? 'bg-[#5c3386] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {role}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-slate-100 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-200 border border-slate-300 shadow-sm">
              <Upload className="h-4 w-4" />
              Import CSV
            </button>
            <button type="button" onClick={handleCreate} className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#5c3386] px-4 text-sm font-black text-white shadow-lg shadow-[#5c3386]/20 transition hover:-translate-y-0.5 hover:bg-[#4f2b73]">
              <Plus className="h-4 w-4" />
              Tambah Pengguna
            </button>
          </div>
        </div>
        {notice ? <p className="mt-4 rounded-[8px] bg-[#5c3386]/8 px-4 py-3 text-sm font-bold text-[#5c3386]">{notice}</p> : null}
      </AdminCard>

      <AdminCard className="overflow-hidden p-0">
        {filteredUsers.length ? (
          <DataTable
            flush
            columns={['ID', 'Nama', 'Email', 'Role', 'Status', 'Aksi']}
            rows={filteredUsers.map((user) => [
              user.id,
              user.name,
              user.email,
              <AdminRoleBadge key={`${getAdminUserKey(user)}-role`} role={user.role} />,
              <AdminStatusBadge key={`${getAdminUserKey(user)}-status`} status={user.status} />,
              <ActionButtons key={getAdminUserKey(user)} onDelete={() => handleDeleteRequest(user)} onEdit={() => handleEdit(user)} />,
            ])}
          />
        ) : (
          <div className="p-6">
            <EmptyState text="Tidak ada pengguna yang cocok dengan filter." />
          </div>
        )}
      </AdminCard>

      {deleteTarget ? <DeletePinModal target={deleteTarget} onClose={() => setDeleteTarget(null)} /> : null}
    </div>
  )
}
