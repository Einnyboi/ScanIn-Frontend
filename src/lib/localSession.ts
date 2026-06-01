import type { LocalSession } from '../types/auth'
import { normalizeSessionIdentity } from '../utils/identity'

const sessionKey = 'scanin-local-session'
const profileKey = 'scanin-local-profiles'

export const loadSession = (): LocalSession | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedSession = window.localStorage.getItem(sessionKey)
    return storedSession
      ? normalizeSessionIdentity(JSON.parse(storedSession) as LocalSession)
      : null
  } catch {
    return null
  }
}

export const saveSession = (session: LocalSession) => {
  const normalizedSession = normalizeSessionIdentity(session)
  window.localStorage.setItem(sessionKey, JSON.stringify(normalizedSession))
  saveLocalProfile(normalizedSession)
}

export const clearSession = () => {
  window.localStorage.removeItem(sessionKey)
}

export const loadLocalProfiles = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedProfiles = window.localStorage.getItem(profileKey)
    const profiles = storedProfiles
      ? (JSON.parse(storedProfiles) as Record<string, LocalSession>)
      : {}

    return Object.values(profiles).map(normalizeSessionIdentity)
  } catch {
    return []
  }
}

const saveLocalProfile = (session: LocalSession) => {
  try {
    const storedProfiles = window.localStorage.getItem(profileKey)
    const profiles = storedProfiles
      ? (JSON.parse(storedProfiles) as Record<string, LocalSession>)
      : {}

    profiles[`${session.role}:${session.identity}`] = session
    window.localStorage.setItem(profileKey, JSON.stringify(profiles))
  } catch {
    window.localStorage.setItem(
      profileKey,
      JSON.stringify({
        [`${session.role}:${session.identity}`]: session,
      }),
    )
  }
}
