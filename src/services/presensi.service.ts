import api from '../lib/axios'

export const presensiService = {
  scanQr: async (sesiId: string, qrToken: string) => {
    const res = await api.post('/api/presensi/scan', { sesiId, qrToken })
    return res.data
  },

  uploadBukti: async (sesiId: string, file: File, geoLat?: number, geoLng?: number) => {
    const form = new FormData()
    form.append('sesiId', sesiId)
    form.append('file', file)
    if (geoLat) form.append('geoLat', geoLat.toString())
    if (geoLng) form.append('geoLng', geoLng.toString())
    const res = await api.post('/api/presensi/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  presensiManual: async (sesiId: string, daftarHadir: { mahasiswaId: string; status: string }[]) => {
    const res = await api.post('/api/presensi/manual', { sesiId, daftarHadir })
    return res.data
  },

  getRiwayat: async () => {
    const res = await api.get('/api/presensi/riwayat')
    return res.data
  },

  getPresensiSesi: async (sesiId: string) => {
    const res = await api.get(`/api/presensi/sesi/${sesiId}`)
    return res.data
  },

  validasiBukti: async (presensiId: string, aksi: 'SETUJUI' | 'TOLAK', alasan?: string) => {
    const res = await api.patch(`/api/presensi/${presensiId}/validasi`, null, {
      params: { aksi, alasan },
    })
    return res.data
  },
}