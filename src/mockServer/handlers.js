import { http, HttpResponse } from 'msw/http'
import { msDB, ticketsDB } from './msDB.js'

export const handlers = [
  // ── Dispensing Tickets Queue (matches absolute, wildcard, and relative) ──
  http.get('https://api.pharmaDashboard.com/tickets', () => {
    console.log('[MSW] Intercepted GET https://api.pharmaDashboard.com/tickets')
    return HttpResponse.json({ tickets: ticketsDB })
  }),
  http.get('*/tickets', () => {
    console.log('[MSW] Intercepted GET */tickets')
    return HttpResponse.json({ tickets: ticketsDB })
  }),

  // ── Single Ticket Lookup by Ticket ID ──
  http.get('https://api.pharmaDashboard.com/tickets/:id', ({ params }) => {
    const { id } = params
    console.log(`[MSW] Intercepted GET https://api.pharmaDashboard.com/tickets/${id}`)
    const ticket = ticketsDB.find((t) => t.id.toLowerCase() === String(id).toLowerCase())
    if (!ticket) {
      return new HttpResponse(null, { status: 404, statusText: 'Ticket not found' })
    }
    return HttpResponse.json({ ticket })
  }),
  http.get('*/tickets/:id', ({ params }) => {
    const { id } = params
    console.log(`[MSW] Intercepted GET */tickets/${id}`)
    const ticket = ticketsDB.find((t) => t.id.toLowerCase() === String(id).toLowerCase())
    if (!ticket) {
      return new HttpResponse(null, { status: 404, statusText: 'Ticket not found' })
    }
    return HttpResponse.json({ ticket })
  }),

  // ── Medicines Inventory Database ──
  http.get('https://api.pharmaDashboard.com/user', () => {
    console.log('[MSW] Intercepted GET https://api.pharmaDashboard.com/user')
    return HttpResponse.json({ users: msDB })
  }),
  http.get('*/user', () => {
    console.log('[MSW] Intercepted GET */user')
    return HttpResponse.json({ users: msDB })
  }),
]