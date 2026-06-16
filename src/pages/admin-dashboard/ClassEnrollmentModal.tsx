import { useState, useEffect } from 'react'
import { X, Search, Check, Users } from 'lucide-react'
import { apiRequest } from '../../utils/api'

export type ClassEnrollmentModalProps = {
  kelasId: string
  namaKelas: string
  onClose: () => void
  onSuccess: () => void
}

type Mode = 'bulk' | 'manual'

type Student = {
  id: string
  nim: string
  nama: string
  angkatan: string
  tipeKelas: string
}

export function ClassEnrollmentModal({ kelasId, namaKelas, onClose, onSuccess }: ClassEnrollmentModalProps) {
  const [mode, setMode] = useState<Mode>('bulk')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  // Bulk state
  const [angkatan, setAngkatan] = useState('2024')
  const [tipeKelas, setTipeKelas] = useState('')
  const [kelasRombel, setKelasRombel] = useState('')
  const [availableRombels, setAvailableRombels] = useState<string[]>([])

  useEffect(() => {
    if (mode === 'bulk') {
      apiRequest<string[]>(`/enrollments/available-rombels?angkatan=${angkatan}`)
        .then(res => {
          setAvailableRombels(res || [])
          setKelasRombel('') // reset when angkatan changes
        })
        .catch(() => setAvailableRombels([]))
    }
  }, [angkatan, mode])

  // Manual state
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleBulkEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setNotice('')
    try {
      const res = await apiRequest<{ count: number; message: string }>(`/enrollments/classes/${kelasId}/enroll/bulk`, {
        method: 'POST',
        body: JSON.stringify({ angkatan, tipeKelas: tipeKelas || undefined, kelasRombel: kelasRombel || undefined }),
      })
      setNotice(res?.message || 'Berhasil')
      setTimeout(onSuccess, 1500)
    } catch {
      setNotice('Gagal melakukan bulk enroll')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await apiRequest<Student[]>(`/enrollments/search-students?q=${encodeURIComponent(query)}`)
      setSearchResults(res || [])
    } catch {
      setNotice('Gagal mencari mahasiswa')
    } finally {
      setLoading(false)
    }
  }

  const handleManualEnroll = async () => {
    if (selectedIds.size === 0) return
    setLoading(true)
    setNotice('')
    try {
      const res = await apiRequest<{ count: number; message: string }>(`/enrollments/classes/${kelasId}/enroll/manual`, {
        method: 'POST',
        body: JSON.stringify({ mahasiswaIds: Array.from(selectedIds) }),
      })
      setNotice(res?.message || 'Berhasil')
      setTimeout(onSuccess, 1500)
    } catch {
      setNotice('Gagal melakukan manual enroll')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5c3386]/10 text-[#5c3386]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Enroll Mahasiswa</h2>
              <p className="text-sm font-semibold text-slate-500">Target: {namaKelas}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 px-6 pt-4 gap-6">
          <button
            onClick={() => { setMode('bulk'); setNotice('') }}
            className={`pb-3 font-bold transition-colors ${mode === 'bulk' ? 'border-b-2 border-[#5c3386] text-[#5c3386]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Auto-Assign (Bulk)
          </button>
          <button
            onClick={() => { setMode('manual'); setNotice('') }}
            className={`pb-3 font-bold transition-colors ${mode === 'manual' ? 'border-b-2 border-[#5c3386] text-[#5c3386]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Pilih Manual
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {notice && <div className="mb-4 rounded-lg bg-[#5c3386]/10 p-3 text-sm font-bold text-[#5c3386]">{notice}</div>}

          {mode === 'bulk' ? (
            <form onSubmit={handleBulkEnroll} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Angkatan</label>
                <select
                  value={angkatan}
                  onChange={e => setAngkatan(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 font-semibold focus:border-[#5c3386] focus:outline-none"
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tipe Kelas (Opsional)</label>
                <select
                  value={tipeKelas}
                  onChange={e => setTipeKelas(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 font-semibold focus:border-[#5c3386] focus:outline-none"
                >
                  <option value="">Semua Tipe</option>
                  <option value="PAGI">Pagi</option>
                  <option value="SORE">Sore</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Kelas Rombel (Opsional)</label>
                <select
                  value={kelasRombel}
                  onChange={e => setKelasRombel(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 font-semibold focus:border-[#5c3386] focus:outline-none"
                >
                  <option value="">Semua Rombel</option>
                  {availableRombels.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <button
                disabled={loading}
                type="submit"
                className="mt-6 w-full rounded-lg bg-[#5c3386] py-3 text-sm font-black text-white hover:bg-[#4f2b73] disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Terapkan (Bulk Enroll)'}
              </button>
            </form>
          ) : (
            <div className="space-y-4 flex flex-col h-full">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cari nama atau NIM..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 font-semibold focus:border-[#5c3386] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center rounded-lg bg-slate-900 px-4 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>

              <div className="flex-1 border rounded-lg border-slate-200 min-h-[200px] overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 font-semibold">Cari untuk menampilkan hasil</div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {searchResults.map(s => (
                      <li
                        key={s.id}
                        onClick={() => toggleSelect(s.id)}
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{s.nama}</p>
                          <p className="text-xs font-semibold text-slate-500">{s.nim} - Angkatan {s.angkatan} - {s.tipeKelas}</p>
                        </div>
                        <div className={`flex h-6 w-6 items-center justify-center rounded border ${selectedIds.has(s.id) ? 'bg-[#5c3386] border-[#5c3386] text-white' : 'border-slate-300'}`}>
                          {selectedIds.has(s.id) && <Check className="h-4 w-4" />}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                onClick={handleManualEnroll}
                disabled={loading || selectedIds.size === 0}
                className="w-full rounded-lg bg-[#5c3386] py-3 text-sm font-black text-white hover:bg-[#4f2b73] disabled:opacity-50"
              >
                {loading ? 'Memproses...' : `Enroll Terpilih (${selectedIds.size})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
