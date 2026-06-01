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
  resetUrl?: string
  otpExpiresAt?: string
  emailStatus?: EmailStatus
  resetUrl?: string
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

export const createPasswordResetRequest = async ({
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
      email?.trim().toLowerCase() || getResetEmailForIdentity(role, identity),
    status: 'Baru',
    createdAt: new Date().toISOString(),
  }
  const nextRequests = [request, ...loadPasswordResetRequests()]

  savePasswordResetRequests(nextRequests, false)

  try {
    const backendRequest = await apiRequest<PasswordResetRequest>(
      '/password-resets/request',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
    )
    const syncedRequests = loadPasswordResetRequests().map((item) =>
      item.id === request.id ? { ...item, ...backendRequest } : item,
    )
    savePasswordResetRequests(syncedRequests, false)
    return { request: backendRequest, synced: true }
  } catch {
    return { request, synced: false }
  }
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
  const localRequest = loadPasswordResetRequests().find(
    (request) => request.id === id,
  )
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
    const requestOptions: RequestInit = {
      method: 'PATCH',
    }

    if (localRequest) {
      requestOptions.body = JSON.stringify(localRequest)
    }

    const backendRequest = await apiRequest<PasswordResetRequest | null>(
      `/password-resets/${id}/send`,
      {
        method: 'POST',
      },
    )

    if (!backendRequest) {
      throw new Error('Reset request not found')
    }

    const syncedRequests = optimisticRequests.map((request) =>
      request.id === id ? { ...request, ...backendRequest } : request,
    )

    savePasswordResetRequests(syncedRequests, false)
    return syncedRequests
  } catch (error) {
    const failedRequests = optimisticRequests.map((request) =>
      request.id === id
        ? {
            ...request,
            status: 'Baru' as const,
            emailStatus: 'FAILED' as const,
            emailError:
              error instanceof Error
                ? error.message
                : 'Backend gagal mengirim email reset.',
          }
        : request,
    )

    savePasswordResetRequests(failedRequests, false)
    return failedRequests
  }

}

export const completePasswordReset = async (id: string, newPassword: string) => {
  return apiRequest(`/password-resets/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify({ password: newPassword }),
  })
}
