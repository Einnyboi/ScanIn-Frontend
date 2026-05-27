import api from '../lib/axios'

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  nama: string
  username: string
  password: string
  role: string
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const res = await api.post('/api/auth/login', payload)
    return res.data
  },

  register: async (payload: RegisterPayload) => {
    const res = await api.post('/api/auth/register', payload)
    return res.data
  },

  me: async () => {
    const res = await api.get('/api/auth/me')
    return res.data
  },
},
