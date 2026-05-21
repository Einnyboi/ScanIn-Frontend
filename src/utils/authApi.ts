import type { Role } from '../types/auth'
import { apiRequest } from './api'

type BackendLoginResponse = {
  access_token: string
  role: string
}

type BackendUser = {
  id: string
  username: string
  nama: string
  role: string
}

export type BackendSessionProfile = {
  role: Role
  identity: string
  name: string
  email: string
}

export const loginWithBackend = async (
  email: string,
  password: string,
): Promise<BackendSessionProfile | null> => {
  try {
    const login = await apiRequest<BackendLoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const user = await apiRequest<BackendUser>('/auth/me', {
      headers: {
        Authorization: `Bearer ${login.access_token}`,
      },
    })

    return {
      role: mapBackendRole(user.role || login.role),
      identity: user.id,
      name: user.nama,
      email: user.username,
    }
  } catch {
    return null
  }
}

const mapBackendRole = (role: string): Role => {
  if (role === 'ADMIN') {
    return 'admin'
  }

  if (role === 'DOSEN' || role === 'ASDOS') {
    return 'pengajar'
  }

  return 'mahasiswa'
}
