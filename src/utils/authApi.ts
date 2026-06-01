import type { Role } from '../types/auth'
import { apiRequest } from './api'
import { normalizeIdentity } from './identity'

type BackendLoginResponse = {
  access_token: string
  role?: string
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
  token: string
}

export const loginWithBackend = async (
  usernameOrEmail: string,
  password: string,
): Promise<BackendSessionProfile | null> => {
  try {
    const login = await apiRequest<BackendLoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: usernameOrEmail,
        password,
      }),
    })

    localStorage.setItem('scanin_token', login.access_token)

    const user = await apiRequest<BackendUser>('/auth/me', {
      headers: {
        Authorization: `Bearer ${login.access_token}`,
      },
    })

    const role = mapBackendRole(user.role || login.role || '')

    return {
      role,
      identity: normalizeIdentity({
        role,
        identity: user.id,
        email: user.username,
      }),
      name: user.nama,
      email: user.username,
      token: login.access_token,
    }
  } catch (error) {
    console.error('Login backend gagal:', error)
    return null
  }
}

const mapBackendRole = (role: string): Role => {
  const normalizedRole = role.toUpperCase()

  if (normalizedRole === 'ADMIN') return 'admin'
  if (normalizedRole === 'DOSEN' || normalizedRole === 'ASDOS') return 'pengajar'

  return 'mahasiswa'
}
