import { create } from 'zustand'

export type Role = 'ADMIN' | 'DOSEN' | 'ASDOS' | 'MAHASISWA'

export interface User {
  id: string
  nama: string
  username: string
  role: Role
  isAktif: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

const USER_STORAGE_KEY = 'scanin_user'
const TOKEN_STORAGE_KEY = 'scanin_token'

const getStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null }
  }

  const rawUser = localStorage.getItem(USER_STORAGE_KEY)
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)

  if (!rawUser) {
    return { user: null, token }
  }

  try {
    const parsed = JSON.parse(rawUser)
    const user = parsed?.state?.user ?? parsed
    const storedToken = parsed?.state?.token ?? token

    return {
      user: user?.id ? user : null,
      token: storedToken ?? null,
    }
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return { user: null, token }
  }
}

const initialAuth = getStoredAuth()

export const useAuthStore = create<AuthState>((set) => ({
  user: initialAuth.user,
  token: initialAuth.token,
  isAuthenticated: Boolean(initialAuth.user && initialAuth.token),

  setAuth: (user, token) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
