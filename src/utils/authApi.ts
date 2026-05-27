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
  token: string
}

export const loginWithBackend = async (
  usernameOrEmail: string,
  password: string,
): Promise<BackendSessionProfile | null> => {
  try {
    // Backend kita pakai 'username', bukan 'email'
    const login = await apiRequest<BackendLoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: usernameOrEmail, password }),
    })

    // Simpan token ke localStorage biar request selanjutnya ter-auth
    localStorage.setItem('scanin_token', login.access_token)

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
      token: login.access_token,
    }
  } catch {
    // Kalau backend gagal, return null — LoginPage fallback ke local account
    return null
  }
}

const mapBackendRole = (role: string): Role => {
  if (role === 'ADMIN') return 'admin'
  if (role === 'DOSEN' || role === 'ASDOS') return 'pengajar'
  return 'mahasiswa'
}