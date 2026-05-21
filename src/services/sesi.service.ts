import api from '../lib/axios'

export const sesiService = {
  bukaSesi: async (jadwalId: string) => {
    const res = await api.post('/api/sesi', { jadwalId })
    return res.data
  },

  tutupSesi: async (sesiId: string) => {
    const res = await api.patch(`/api/sesi/${sesiId}/tutup`)
    return res.data
  },

  getSesi: async (sesiId: string) => {
    const res = await api.get(`/api/sesi/${sesiId}`)
    return res.data
  },

  getSesiAktif: async (jadwalId: string) => {
    const res = await api.get(`/api/sesi/aktif/${jadwalId}`)
    return res.data
  },
}