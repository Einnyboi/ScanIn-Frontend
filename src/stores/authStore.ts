import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('scanin_token', token)
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('scanin_token')
        localStorage.removeItem('scanin_user')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'scanin_user',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
)