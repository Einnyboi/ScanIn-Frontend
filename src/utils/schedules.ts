import type { CourseSchedule } from '../types/attendance'
import { apiRequest } from './api'

const scheduleKey = 'scanin-admin-schedules'
export const scheduleChangedEvent = 'scanin:schedules-changed'

export const loadSchedules = (
  fallbackSchedules: CourseSchedule[] = [],
) => {
  if (typeof window === 'undefined') {
    return fallbackSchedules
  }

  try {
    const storedSchedules = window.localStorage.getItem(scheduleKey)

    if (storedSchedules) {
      return JSON.parse(storedSchedules) as CourseSchedule[]
    }

    saveSchedulesLocal(fallbackSchedules)
    return fallbackSchedules
  } catch {
    saveSchedulesLocal(fallbackSchedules)
    return fallbackSchedules
  }
}

export const saveSchedules = (schedules: CourseSchedule[]) => {
  saveSchedulesLocal(schedules)
  notifyScheduleChange()
  void syncSchedulesToBackend(schedules)
}

export const fetchSchedulesFromBackend = async () => {
  try {
    const localSchedules = loadSchedules()

    if (localSchedules.length) {
      await syncSchedulesToBackend(localSchedules)
    }

    const schedules = await apiRequest<CourseSchedule[]>('/schedules')

    if (Array.isArray(schedules) && schedules.length) {
      saveSchedulesLocal(schedules)
      notifyScheduleChange()
      return schedules
    }
  } catch {
    return null
  }

  return null
}

export const createScheduleId = (title: string) => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return `${slug || 'jadwal'}-${Date.now()}`
}

const saveSchedulesLocal = (schedules: CourseSchedule[]) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(scheduleKey, JSON.stringify(schedules))
}

const notifyScheduleChange = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(scheduleChangedEvent))
}

const syncSchedulesToBackend = async (schedules: CourseSchedule[]) => {
  try {
    await apiRequest<CourseSchedule[]>('/schedules', {
      method: 'PUT',
      body: JSON.stringify(schedules),
    })
  } catch {
    // Backend sync is best-effort while the local-first demo is still usable.
  }
}
