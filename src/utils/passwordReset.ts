import type { Role } from '../types/auth'
import { getResetEmailForIdentity } from './accounts'
import { apiRequest } from './api'

export type EmailStatus = 'SENT' | 'SMTP_NOT_CONFIGURED' | 'FAILED'
export type PasswordResetStatus = 'Baru' | 'Dikirim'

export type PasswordResetRequest = {
  id: string
  role: Role
  identity: string
  name: string
  registeredEmail: string
  status: PasswordResetStatus
  createdAt: string
  sentAt?: string
  emailStatus?: EmailStatus
}

export const passwordResetChangedEvent = 'scanin-password-resets-changed'

const passwordResetKey = 'scanin-password-reset-requests'

export const loadPasswordResetRequests = (): PasswordResetRequest[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedRequests = window.localStorage.getItem(passwordResetKey)
    return storedRequests
      ? (JSON.parse(storedRequests) as PasswordResetRequest[])
      : []
  } catch {
    return []
  }
}

export const savePasswordResetRequests = (
  requests: PasswordResetRequest[],
  syncBackend = true,
) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(passwordResetKey, JSON.stringify(requests))
  window.dispatchEvent(new Event(passwordResetChangedEvent))

  if (syncBackend) {
    void apiRequest<PasswordResetRequest[]>('/password-resets', {
      method: 'PUT',
      body: JSON.stringify(requests),
    }).catch(() => undefined)
  }
}

export const createPasswordResetRequest = ({
  identity,
  name,
  role,
  email,
}: {
  email?: string
  identity: string
  name: string
  role: Role
}) => {
  const request: PasswordResetRequest = {
    id: `reset-${role}-${identity.trim()}-${Date.now()}`,
    role,
    identity: identity.trim(),
    name: name.trim(),
    registeredEmail:
      email?.trim().toLowerCase() || getResetEmailForIdentity(role, identity, name),
    status: 'Baru',
    createdAt: new Date().toISOString(),
  }
  const nextRequests = [request, ...loadPasswordResetRequests()]

  savePasswordResetRequests(nextRequests, false)

  void apiRequest<PasswordResetRequest>('/password-resets/request', {
    method: 'POST',
    body: JSON.stringify(request),
  }).catch(() => undefined)

  return request
}

export const fetchPasswordResetRequestsFromBackend = async () => {
  try {
    const requests = await apiRequest<PasswordResetRequest[]>('/password-resets')
    savePasswordResetRequests(requests)
    return requests
  } catch {
    return null
  }
}

export const markPasswordResetAsSent = async (id: string) => {
  const sentAt = new Date().toISOString()
  const optimisticRequests = loadPasswordResetRequests().map((request) =>
    request.id === id
      ? {
          ...request,
          status: 'Dikirim' as const,
          sentAt,
        }
      : request,
  )

  savePasswordResetRequests(optimisticRequests, false)

  try {
    const backendRequest = await apiRequest<PasswordResetRequest>(
      `/password-resets/${id}/send`,
      {
        method: 'PATCH',
      },
    )

    const syncedRequests = optimisticRequests.map((request) =>
      request.id === id ? { ...request, ...backendRequest } : request,
    )

    savePasswordResetRequests(syncedRequests, false)
    return syncedRequests
  } catch {
    const failedRequests = optimisticRequests.map((request) =>
      request.id === id
        ? {
            ...request,
            status: 'Baru' as const,
            emailStatus: 'FAILED' as const,
          }
        : request,
    )

    savePasswordResetRequests(failedRequests, false)
    return failedRequests
  }

}
