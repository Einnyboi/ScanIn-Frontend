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
      return normalizeSchedules(JSON.parse(storedSchedules))
    }

    const normalizedFallbackSchedules = normalizeSchedules(fallbackSchedules)
    saveSchedulesLocal(normalizedFallbackSchedules)
    return normalizedFallbackSchedules
  } catch {
    const normalizedFallbackSchedules = normalizeSchedules(fallbackSchedules)
    saveSchedulesLocal(normalizedFallbackSchedules)
    return normalizedFallbackSchedules
  }
}

export const saveSchedules = (schedules: CourseSchedule[]) => {
  saveSchedulesLocal(schedules)
  notifyScheduleChange()
  void syncSchedulesToBackend(schedules)
}

export const fetchSchedulesFromBackend = async () => {
  try {
    const schedules = await apiRequest<CourseSchedule[]>('/schedules')

    if (Array.isArray(schedules) && schedules.length) {
      const normalizedSchedules = normalizeSchedules(schedules)
      saveSchedulesLocal(normalizedSchedules)
      notifyScheduleChange()
      return normalizedSchedules
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

const normalizeSchedules = (schedules: unknown): CourseSchedule[] => {
  if (!Array.isArray(schedules)) {
    return []
  }

  return schedules.filter((schedule): schedule is CourseSchedule => {
    if (!schedule || typeof schedule !== 'object') {
      return false
    }

    const value = schedule as Partial<CourseSchedule>

    return (
      typeof value.id === 'string' &&
      typeof value.title === 'string' &&
      typeof value.time === 'string' &&
      typeof value.room === 'string' &&
      typeof value.lecturer === 'string' &&
      typeof value.students === 'number' &&
      typeof value.status === 'string'
    )
  })
}
