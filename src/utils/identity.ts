import type { LocalSession, Role } from '../types/auth'

const seededIdentityByEmail: Record<string, string> = {
  'naisya.535240187@stu.untar.ac.id': '535240187',
  'cathrine.535240075@stu.untar.ac.id': '535240075',
  'ahmad.santoso@untar.ac.id': '198503152010121001',
  'siti.nurhaliza@untar.ac.id': '198808122015032002',
}

export const normalizeIdentity = ({
  role,
  identity,
  email,
}: {
  role: Role
  identity?: string
  email?: string
}) => {
  const cleanIdentity = identity?.trim() ?? ''
  const cleanEmail = email?.trim().toLowerCase() ?? ''

  if (role === 'admin') {
    return cleanIdentity || cleanEmail.split('@')[0] || 'admin'
  }

  const seededIdentity = seededIdentityByEmail[cleanEmail]
  if (seededIdentity) {
    return seededIdentity
  }

  const numericFromIdentity = extractLongestNumber(cleanIdentity)
  if (numericFromIdentity) {
    return numericFromIdentity
  }

  const numericFromEmail = extractLongestNumber(cleanEmail.split('@')[0] ?? '')
  return numericFromEmail || cleanIdentity
}

export const normalizeSessionIdentity = (session: LocalSession): LocalSession => ({
  ...session,
  identity: normalizeIdentity({
    role: session.role,
    identity: session.identity,
    email: session.email,
  }),
})

const extractLongestNumber = (value: string) => {
  const matches = value.match(/\d+/g)
  if (!matches?.length) {
    return ''
  }

  return matches.sort((first, second) => second.length - first.length)[0]
}
