import { loadLocalProfiles } from '../lib/localSession'
import type { Role } from '../types/auth'
import { normalizeIdentity } from './identity'

type ResolvedAccount = {
  identity: string
  name: string
  email: string
}

export const getAccountPlaceholder = (role: Role) => {
  if (role === 'mahasiswa') {
    return 'contoh: 535240187@stu.untar.ac.id'
  }

  if (role === 'pengajar') {
    return 'contoh: 198503152010121001@untar.ac.id'
  }

  return 'contoh: admin.fti@untar.ac.id'
}

export const getAccountDomainHelp = (role: Role) => {
  if (role === 'mahasiswa') {
    return 'Mahasiswa wajib memakai akun UNTAR dengan domain @stu.untar.ac.id.'
  }

  if (role === 'pengajar') {
    return 'Pengajar wajib memakai akun UNTAR dengan domain @untar.ac.id.'
  }

  return 'Admin wajib memakai akun UNTAR dengan domain @untar.ac.id.'
}

export const isUntarAccount = (email: string, role: Role) => {
  const cleanEmail = email.trim().toLowerCase()

  if (role === 'mahasiswa') {
    return cleanEmail.endsWith('@stu.untar.ac.id')
  }

  return cleanEmail.endsWith('@untar.ac.id')
}

export const resolveLocalAccount = (
  role: Role,
  email: string,
): ResolvedAccount => {
  const cleanEmail = email.trim().toLowerCase()

  const storedProfile = loadLocalProfiles().find(
    (profile) =>
      profile.role === role && profile.email?.toLowerCase() === cleanEmail,
  )

  if (storedProfile) {
    return {
      identity: normalizeIdentity({
        role,
        identity: storedProfile.identity,
        email: cleanEmail,
      }),
      name: storedProfile.name,
      email: cleanEmail,
    }
  }

  return {
    identity: normalizeIdentity({
      role,
      identity: identityFromEmail(cleanEmail),
      email: cleanEmail,
    }),
    name: nameFromEmail(cleanEmail, role),
    email: cleanEmail,
  }
}

export const getResetEmailForIdentity = (
  role: Role,
  identity: string,
) => {
  if (role === 'mahasiswa') {
    return `${identity.trim()}@stu.untar.ac.id`
  }

  return `${identity.trim()}@untar.ac.id`
}

const identityFromEmail = (email: string) => email.split('@')[0] || email

const nameFromEmail = (email: string, role: Role) => {
  const fallback = role === 'pengajar' ? 'Pengajar FTI' : 'Mahasiswa FTI'
  const localPart = identityFromEmail(email)
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, '')
    .trim()

  if (!localPart) {
    return fallback
  }

  return localPart
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
