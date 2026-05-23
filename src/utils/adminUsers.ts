import { apiRequest } from './api'

export type AdminUserRole = 'Mahasiswa' | 'Pengajar' | 'Admin'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminUserRole
  status: 'Aktif' | 'Nonaktif'
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
) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(adminUserKey, JSON.stringify(users))
  notifyAdminUsersChanged()

  if (shouldSyncBackend) {
    void apiRequest<AdminUser[]>('/admin-users', {
      method: 'PUT',
      body: JSON.stringify(users),
    }).catch(() => undefined)
  }
}

export const fetchAdminUsersFromBackend = async (fallbackUsers: AdminUser[]) => {
  try {
    const users = await apiRequest<AdminUser[]>('/admin-users')

    if (!users.length) {
      saveAdminUsers(fallbackUsers)
      return fallbackUsers
    }

    saveAdminUsers(users, false)
    return users
  } catch {
    return null
  }
}
