import { apiRequest } from './api'

export type AdminUserRole = 'Mahasiswa' | 'Pengajar' | 'Admin'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminUserRole
  status: 'Aktif' | 'Nonaktif'
  kelasRombel?: string
  tipeKelas?: 'PAGI' | 'SORE' | 'MALAM'
}

const adminUserKey = 'scanin-admin-users'
export const adminUsersChangedEvent = 'scanin:admin-users-changed'

export const getAdminUserKey = (user: Pick<AdminUser, 'id' | 'role'>) =>
  `${user.role}:${user.id}`

const notifyAdminUsersChanged = () => {
  window.dispatchEvent(new Event(adminUsersChangedEvent))
}

export const loadAdminUsers = (fallbackUsers: AdminUser[]) => {
  if (typeof window === 'undefined') {
    return fallbackUsers
  }

  try {
    const storedUsers = window.localStorage.getItem(adminUserKey)

    if (storedUsers) {
      return JSON.parse(storedUsers) as AdminUser[]
    }

    saveAdminUsers(fallbackUsers, false)
    return fallbackUsers
  } catch {
    saveAdminUsers(fallbackUsers, false)
    return fallbackUsers
  }
}

export const saveAdminUsers = (
  users: AdminUser[],
  shouldSyncBackend = true,
): Promise<AdminUser[]> => {
  if (typeof window === 'undefined') {
    return Promise.resolve(users)
  }

  if (shouldSyncBackend) {
    return apiRequest<AdminUser[]>('/admin-users', {
      method: 'PUT',
      body: JSON.stringify(users),
    }).then((backendUsers) => {
      window.localStorage.setItem(adminUserKey, JSON.stringify(backendUsers))
      notifyAdminUsersChanged()
      return backendUsers
    })
  }

  window.localStorage.setItem(adminUserKey, JSON.stringify(users))
  notifyAdminUsersChanged()

  return Promise.resolve(users)
}

export const fetchAdminUsersFromBackend = async () => {
  try {
    const users = await apiRequest<AdminUser[]>('/admin-users')

    await saveAdminUsers(users, false)
    return users
  } catch {
    return []
  }
}
