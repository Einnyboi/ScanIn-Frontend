import type { QrPayload } from '../types/attendance'

export const activeQrKey = 'scanin-active-qr'
const qrSize = 25

export const createQrPayload = (
  payload: Omit<QrPayload, 'token' | 'issuedAt' | 'expiresAt'>,
): QrPayload => {
  const issuedAt = new Date()
  const expiresAt = new Date(issuedAt.getTime() + 15_000)
  const token = [
    payload.courseId,
    payload.studentId,
    issuedAt.getTime().toString(36),
    Math.random().toString(36).slice(2, 8),
  ].join('-')

  return {
    ...payload,
    token,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }
}

export const saveActiveQrPayload = (payload: QrPayload) => {
  window.localStorage.setItem(activeQrKey, JSON.stringify(payload))
}

export const loadActiveQrPayload = (): QrPayload | null => {
  try {
    const storedPayload = window.localStorage.getItem(activeQrKey)
    return storedPayload ? (JSON.parse(storedPayload) as QrPayload) : null
  } catch {
    return null
  }
}

export const isQrExpired = (payload: QrPayload) =>
  new Date(payload.expiresAt).getTime() <= Date.now()

export const generateQrMatrix = (token: string) => {
  const matrix = Array.from({ length: qrSize }, () =>
    Array.from({ length: qrSize }, () => false),
  )
  const seed = hashToken(token)

  for (let row = 0; row < qrSize; row += 1) {
    for (let col = 0; col < qrSize; col += 1) {
      const value = Math.sin(seed + row * 17.17 + col * 31.31) * 10000
      matrix[row][col] = value - Math.floor(value) > 0.5
    }
  }

  addFinder(matrix, 1, 1)
  addFinder(matrix, 1, qrSize - 8)
  addFinder(matrix, qrSize - 8, 1)

  return matrix
}

const hashToken = (token: string) =>
  token.split('').reduce((hash, char) => {
    const nextHash = (hash << 5) - hash + char.charCodeAt(0)
    return nextHash >>> 0
  }, 2166136261)

const addFinder = (matrix: boolean[][], startRow: number, startCol: number) => {
  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const isOuter = row === 0 || col === 0 || row === 6 || col === 6
      const isCenter = row >= 2 && row <= 4 && col >= 2 && col <= 4
      matrix[startRow + row][startCol + col] = isOuter || isCenter
    }
  }
}

