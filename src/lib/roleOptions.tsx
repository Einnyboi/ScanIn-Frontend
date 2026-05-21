import type { ReactNode } from 'react'

import type { Role } from '../types/auth'

export type RoleOption = {
  id: Role
  label: string
  fieldLabel: string
  nameLabel: string
  placeholder: string
  namePlaceholder: string
  dashboardLabel: string
  icon: ReactNode
}

export const roleOptions: RoleOption[] = [
  {
    id: 'mahasiswa',
    label: 'Mahasiswa',
    fieldLabel: 'NIM',
    nameLabel: 'Nama Mahasiswa',
    placeholder: 'Contoh: 53524001',
    namePlaceholder: 'Nama Lengkap Mahasiswa',
    dashboardLabel: 'Portal Mahasiswa',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="m3 8.5 9-4 9 4-9 4-9-4Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M7 10.5v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    id: 'pengajar',
    label: 'Pengajar',
    fieldLabel: 'NIDN',
    nameLabel: 'Nama Pengajar',
    placeholder: 'Masukkan NIDN',
    namePlaceholder: 'Nama Lengkap Pengajar',
    dashboardLabel: 'Portal Pengajar',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M4 21a8 8 0 0 1 16 0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    id: 'admin',
    label: 'Admin',
    fieldLabel: 'Username',
    nameLabel: 'Nama Admin',
    placeholder: 'Masukkan username admin',
    namePlaceholder: 'Contoh: Admin Fakultas',
    dashboardLabel: 'Panel Admin',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    ),
  },
]

export const getRoleOption = (role: Role) =>
  roleOptions.find((option) => option.id === role) ?? roleOptions[0]

