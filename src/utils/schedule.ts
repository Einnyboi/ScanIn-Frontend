import type { CourseSchedule } from '../types/attendance'

export type RuntimeStatus = 'active' | 'upcoming' | 'closed'

export const getRuntimeStatus = (
  course: CourseSchedule,
  now = new Date(),
): RuntimeStatus => {
  const courseWindow = getCourseWindow(course, now)
  const currentTime = now.getTime()

  if (
    currentTime >= courseWindow.start.getTime() &&
    currentTime <= courseWindow.end.getTime()
  ) {
    return 'active'
  }

  if (currentTime < courseWindow.start.getTime()) {
    return 'upcoming'
  }

  return 'closed'
}

export const isCourseActiveNow = (course: CourseSchedule, now = new Date()) =>
  getRuntimeStatus(course, now) === 'active'

export const isSessionWindowOpen = (course: CourseSchedule, now = new Date()) => {
  const courseWindow = getCourseWindow(course, now)
  const currentTime = now.getTime()
  return (
    currentTime >= courseWindow.start.getTime() &&
    currentTime <= getSessionAutoCloseAt(course, now).getTime()
  )
}

export const getSessionAutoCloseAt = (
  course: CourseSchedule,
  now = new Date(),
) => {
  const courseWindow = getCourseWindow(course, now)
  return new Date(courseWindow.end.getTime() + 30 * 60 * 1000)
}

export const getAutoCloseSecondsLeft = (
  course: CourseSchedule,
  now = new Date(),
) =>
  Math.max(
    0,
    Math.floor((getSessionAutoCloseAt(course, now).getTime() - now.getTime()) / 1000),
  )

export const getCourseWindow = (course: CourseSchedule, now = new Date()) => {
  const [startTime, endTime] = course.time.split(' - ')
  return {
    start: toDateAtTime(startTime, now),
    end: toDateAtTime(endTime, now),
  }
}

export const getRuntimeLabel = (status: RuntimeStatus) => {
  if (status === 'active') {
    return 'Sedang berlangsung'
  }

  if (status === 'upcoming') {
    return 'Belum mulai'
  }

  return 'Selesai'
}

const toDateAtTime = (time: string, now: Date) => {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date(now)
  date.setHours(hours, minutes, 0, 0)
  return date
}
