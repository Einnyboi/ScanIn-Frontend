import type { CorrectionTicket } from '../types/attendance'
import { apiRequest } from './api'

const ticketKey = 'scanin-correction-tickets'
export const ticketsChangedEvent = 'scanin:tickets-changed'

const notifyTicketsChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ticketsChangedEvent))
  }
}

const persistTickets = (tickets: CorrectionTicket[]) => {
  window.localStorage.setItem(ticketKey, JSON.stringify(tickets))
  notifyTicketsChanged()
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
  return apiRequest<CorrectionTicket>('/tickets', {
    method: 'POST',
    body: JSON.stringify(ticket),
  }).then((createdTicket) => {
    const storedTickets = loadStoredTickets()
    persistTickets([
      createdTicket,
      ...storedTickets.filter((item) => item.id !== createdTicket.id),
    ])
    return createdTicket
  })
}

export const updateStoredTicket = (updatedTicket: CorrectionTicket) => {
  return apiRequest<CorrectionTicket>(`/tickets/${updatedTicket.id}`, {
    method: 'PATCH',
    body: JSON.stringify(updatedTicket),
  }).then((savedTicket) => {
    const storedTickets = loadStoredTickets()
    const nextTickets = storedTickets.some((ticket) => ticket.id === savedTicket.id)
      ? storedTickets.map((ticket) =>
          ticket.id === savedTicket.id ? savedTicket : ticket,
        )
      : [savedTicket, ...storedTickets]

    persistTickets(nextTickets)
    return savedTicket
  })
}

export const fetchTicketsFromBackend = async (
  defaultTickets: CorrectionTicket[],
) => {
  try {
    const tickets = await apiRequest<CorrectionTicket[]>('/tickets')

    persistTickets(tickets)
    return tickets
  } catch {
    const storedTickets = loadStoredTickets()
    if (storedTickets.length) {
      return storedTickets
    }

    return defaultTickets
  }
}
