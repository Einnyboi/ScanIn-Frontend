import type { ScanRecord } from '../types/attendance'

const scanRecordKey = 'scanin-scan-records'

export const loadStoredScanRecords = (): ScanRecord[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedRecords = window.localStorage.getItem(scanRecordKey)
    return storedRecords ? (JSON.parse(storedRecords) as ScanRecord[]) : []
  } catch {
    return []
  }
}

export const saveStoredScanRecord = (record: ScanRecord) => {
  const records = loadStoredScanRecords()
  window.localStorage.setItem(scanRecordKey, JSON.stringify([record, ...records]))
}
