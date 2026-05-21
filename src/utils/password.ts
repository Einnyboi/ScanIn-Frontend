export type PasswordRule = {
  id: string
  label: string
  isValid: boolean
}

export const getPasswordRules = (password: string): PasswordRule[] => [
  {
    id: 'length',
    label: 'Minimal 8 karakter',
    isValid: password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Ada huruf besar',
    isValid: /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'Ada huruf kecil',
    isValid: /[a-z]/.test(password),
  },
  {
    id: 'symbol',
    label: 'Ada tanda baca atau simbol',
    isValid: /[^A-Za-z0-9]/.test(password),
  },
]

export const validatePassword = (password: string) => {
  const rules = getPasswordRules(password)
  return {
    rules,
    isValid: rules.every((rule) => rule.isValid),
  }
}

