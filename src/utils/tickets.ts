import type { CorrectionTicket } from '../types/attendance'

const ticketKey = 'scanin-correction-tickets'

export const loadStoredTickets = (): CorrectionTicket[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedTickets = window.localStorage.getItem(ticketKey)
    return storedTickets ? (JSON.parse(storedTickets) as CorrectionTicket[]) : []
  } catch {
    return []
  }
}

export const loadCorrectionTickets = (defaultTickets: CorrectionTicket[]) => {
  const storedTickets = loadStoredTickets()
  const storedIds = new Set(storedTickets.map((ticket) => ticket.id))
  return [
    ...storedTickets,
    ...defaultTickets.filter((ticket) => !storedIds.has(ticket.id)),
  ]
}

export const saveCorrectionTicket = (ticket: CorrectionTicket) => {
  const storedTickets = loadStoredTickets()
  window.localStorage.setItem(ticketKey, JSON.stringify([ticket, ...storedTickets]))
}

export const updateStoredTicket = (updatedTicket: CorrectionTicket) => {
  const storedTickets = loadStoredTickets()
  const hasExistingTicket = storedTickets.some(
    (ticket) => ticket.id === updatedTicket.id,
  )
  const nextTickets = hasExistingTicket
    ? storedTickets.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket,
      )
    : [updatedTicket, ...storedTickets]

  window.localStorage.setItem(ticketKey, JSON.stringify(nextTickets))
}
