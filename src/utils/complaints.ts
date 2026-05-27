import type { LocalSession } from '../types/auth'
import { apiRequest } from './api'

export type SupportComplaint = {
  id: string
  name: string
  identity: string
  role: LocalSession['role']
  category: string
  message: string
  status: 'Baru' | 'Diproses'
  createdAt: string
}

const complaintKey = 'scanin-support-complaints'
export const supportComplaintsChangedEvent = 'scanin-support-complaints-changed'

export const loadSupportComplaints = (): SupportComplaint[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedComplaints = window.localStorage.getItem(complaintKey)
    return storedComplaints
      ? (JSON.parse(storedComplaints) as SupportComplaint[])
      : []
  } catch {
    return []
  }
}

export const saveSupportComplaint = (
  session: LocalSession,
  category: string,
  message: string,
) => {
  const complaints = loadSupportComplaints()
  const nextComplaint: SupportComplaint = {
    id: `complaint-${session.role}-${session.identity}-${Date.now()}`,
    name: session.name,
    identity: session.identity,
    role: session.role,
    category,
    message,
    status: 'Baru',
    createdAt: new Date().toISOString(),
  }

  saveSupportComplaints([nextComplaint, ...complaints], false)

  void apiRequest<SupportComplaint>('/support-complaints', {
    method: 'POST',
    body: JSON.stringify(nextComplaint),
  }).catch(() => undefined)

  return nextComplaint
}

export const saveSupportComplaints = (
  complaints: SupportComplaint[],
  syncBackend = true,
) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(complaintKey, JSON.stringify(complaints))
  window.dispatchEvent(new Event(supportComplaintsChangedEvent))

  if (syncBackend) {
    void apiRequest<SupportComplaint[]>('/support-complaints', {
      method: 'PUT',
      body: JSON.stringify(complaints),
    }).catch(() => undefined)
  }
}

export const fetchSupportComplaintsFromBackend = async () => {
  try {
    const complaints =
      await apiRequest<SupportComplaint[]>('/support-complaints')
    saveSupportComplaints(complaints, false)
    return complaints
  } catch {
    return null
  }
}
