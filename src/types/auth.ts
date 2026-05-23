export type Role = 'mahasiswa' | 'pengajar' | 'admin'

export type HelpPanel = 'forgot-password' | 'contact-admin' | null

export type LocalSession = {
  role: Role
  identity: string
  name: string
  email?: string
  loggedAt: string
}
