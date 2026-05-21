import { loadLocalProfiles } from '../lib/localSession'
import type { Role } from '../types/auth'
import { loadAdminUsers, type AdminUser } from './adminUsers'

type ResolvedAccount = {
  identity: string
  name: string
  email: string
}

const knownAccounts: Array<ResolvedAccount & { role: Role }> = [
  {
    role: 'mahasiswa',
    identity: '535240187',
    name: "Naisya Yuen Ra'af",
    email: 'naisya@stu.untar.ac.id',
  },
  {
    role: 'mahasiswa',
    identity: '535240156',
    name: 'Ahmad Rizki',
    email: 'ahmad@stu.untar.ac.id',
  },
  {
    role: 'pengajar',
    identity: '198503152010121001',
    name: 'Dr. Ahmad Santoso',
    email: 'ahmad.santoso@untar.ac.id',
  },
  {
    role: 'pengajar',
    identity: '198808122015032002',
    name: 'Ir. Siti Nurhaliza',
    email: 'siti.nurhaliza@untar.ac.id',
  },
  {
    role: 'admin',
    identity: 'admin-fti',
    name: 'Admin Fakultas',
    email: 'admin.fti@untar.ac.id',
  },
]

export const getAccountPlaceholder = (role: Role) => {
  if (role === 'mahasiswa') {
    return 'contoh: naisya@stu.untar.ac.id'
  }

  if (role === 'pengajar') {
    return 'contoh: ahmad.santoso@untar.ac.id'
  }

  return 'contoh: admin.fti@untar.ac.id'
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
  const roleLabel = toAdminRole(role)

  const storedProfile = loadLocalProfiles().find(
    (profile) => profile.role === role && profile.email?.toLowerCase() === cleanEmail,
  )

  if (storedProfile) {
    return {
      identity: storedProfile.identity,
      name: storedProfile.name,
      email: cleanEmail,
    }
  }

  const adminUser = loadAdminUsers(knownAccounts.map(toAdminUser)).find(
    (user) => user.role === roleLabel && user.email.toLowerCase() === cleanEmail,
  )

  if (adminUser) {
    return {
      identity: adminUser.id,
      name: adminUser.name,
      email: cleanEmail,
    }
  }

  const knownAccount = knownAccounts.find(
    (account) => account.role === role && account.email === cleanEmail,
  )

  if (knownAccount) {
    return {
      identity: knownAccount.identity,
      name: knownAccount.name,
      email: cleanEmail,
    }
  }

  return {
    identity: identityFromEmail(cleanEmail),
    name: nameFromEmail(cleanEmail, role),
    email: cleanEmail,
  }
}

export const getResetEmailForIdentity = (
  role: Role,
  identity: string,
  name: string,
) => {
  const cleanIdentity = identity.trim().toLowerCase()
  const cleanName = name.trim().toLowerCase()
  const roleLabel = toAdminRole(role)
  const users = loadAdminUsers(knownAccounts.map(toAdminUser))
  const user = users.find(
    (item) =>
      item.role === roleLabel &&
      (item.id.toLowerCase() === cleanIdentity ||
        item.name.toLowerCase() === cleanName),
  )

  if (user) {
    return user.email
  }

  if (role === 'mahasiswa') {
    return `${identity.trim()}@stu.untar.ac.id`
  }

  return `${identity.trim()}@untar.ac.id`
}

const toAdminRole = (role: Role) => {
  if (role === 'mahasiswa') {
    return 'Mahasiswa'
  }

  if (role === 'pengajar') {
    return 'Pengajar'
  }

  return 'Admin'
}

const toAdminUser = (account: ResolvedAccount & { role: Role }): AdminUser => ({
  id: account.identity,
  name: account.name,
  email: account.email,
  role: toAdminRole(account.role),
  status: 'Aktif',
})

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
