import type { CorrectionTicket } from '../types/attendance'
import { apiRequest } from './api'

const ticketKey = 'scanin-correction-tickets'
export const ticketsChangedEvent = 'scanin:tickets-changed'

const notifyTicketsChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ticketsChangedEvent))
  }
}

const persistTickets = (
  tickets: CorrectionTicket[],
  shouldSyncBackend = true,
) => {
  window.localStorage.setItem(ticketKey, JSON.stringify(tickets))
  notifyTicketsChanged()

  if (shouldSyncBackend) {
    void apiRequest<CorrectionTicket[]>('/tickets', {
      method: 'PUT',
      body: JSON.stringify(tickets),
    }).catch(() => undefined)
  }
}

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
  persistTickets([ticket, ...storedTickets])
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

  persistTickets(nextTickets)
}

export const fetchTicketsFromBackend = async (
  defaultTickets: CorrectionTicket[],
) => {
  try {
    const tickets = await apiRequest<CorrectionTicket[]>('/tickets')

    if (!tickets.length) {
      const fallbackTickets = loadCorrectionTickets(defaultTickets)
      persistTickets(fallbackTickets)
      return fallbackTickets
    }

    persistTickets(tickets, false)
    return loadCorrectionTickets(defaultTickets)
  } catch {
    return null
  }
}
