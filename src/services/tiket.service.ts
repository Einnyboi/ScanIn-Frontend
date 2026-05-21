import api from '../lib/axios'

export const tiketService = {
  buatTiket: async (data: {
    jenisPermohonan: string
    deskripsiMasalah: string
    tanggalKelas: string
    file?: File
  }) => {
    const form = new FormData()
    form.append('jenisPermohonan', data.jenisPermohonan)
    form.append('deskripsiMasalah', data.deskripsiMasalah)
    form.append('tanggalKelas', data.tanggalKelas)
    if (data.file) form.append('file', data.file)
    const res = await api.post('/api/tiket', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  getTiketSaya: async () => {
    const res = await api.get('/api/tiket/saya')
    return res.data
  },

  getAllTiket: async (status?: string) => {
    const res = await api.get('/api/tiket', { params: { status } })
    return res.data
  },

  reviewTiket: async (id: string, status: string, catatanReview?: string) => {
    const res = await api.patch(`/api/tiket/${id}/review`, { status, catatanReview })
    return res.data
  },
}