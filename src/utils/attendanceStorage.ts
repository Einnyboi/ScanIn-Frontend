import type { ScanRecord } from '../types/attendance'
import { apiRequest } from './api'

const scanRecordKey = 'scanin-scan-records'
export const scanRecordsChangedEvent = 'scanin:scan-records-changed'

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
  const nextRecords = [record, ...records.filter((item) => item.id !== record.id)]
  saveStoredScanRecords(nextRecords, false)

  void apiRequest<ScanRecord>('/attendance-records', {
    method: 'POST',
    body: JSON.stringify(record),
  }).catch(() => undefined)
}

export const saveStoredScanRecords = (
  records: ScanRecord[],
  syncBackend = true,
) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(scanRecordKey, JSON.stringify(records))
  window.dispatchEvent(new Event(scanRecordsChangedEvent))

  if (syncBackend) {
    void apiRequest<ScanRecord[]>('/attendance-records', {
      method: 'PUT',
      body: JSON.stringify(records),
    }).catch(() => undefined)
  }
}

export const fetchScanRecordsFromBackend = async () => {
  try {
    const localRecords = loadStoredScanRecords()

    if (localRecords.length) {
      await apiRequest<ScanRecord[]>('/attendance-records', {
        method: 'PUT',
        body: JSON.stringify(localRecords),
      })
    }

    const records = await apiRequest<ScanRecord[]>('/attendance-records')

    if (Array.isArray(records)) {
      saveStoredScanRecords(records, false)
      return records
    }
  } catch {
    return null
  }

  return null
}
