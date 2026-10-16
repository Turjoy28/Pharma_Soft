import { http, HttpResponse } from 'msw/http'
import { medicineDB, ticketsDB } from './msDB.js'

const API_BASE = 'https://api.pharmaDashboard.com'

export const handlers = [
  // ── 1. Dispensing Tickets Queue ──
  http.get(`${API_BASE}/tickets`, () => {
    console.log('[MSW] Intercepted GET /tickets')
    return HttpResponse.json({ tickets: ticketsDB })
  }),

  // ── 2. Single Ticket Lookup by Ticket ID ──
  http.get(`${API_BASE}/tickets/:id`, ({ params }) => {
    const { id } = params
    console.log(`[MSW] Intercepted GET /tickets/${id}`)
    const ticket = ticketsDB.find((t) => t.id.toLowerCase() === String(id).toLowerCase())
    if (!ticket) {
      return new HttpResponse(null, { status: 404, statusText: 'Ticket not found' })
    }
    return HttpResponse.json({ ticket })
  }),

  // ── 3. Medicines Inventory Catalog ──
  http.get(`${API_BASE}/medicines`, () => {
    console.log('[MSW] Intercepted GET /medicines')
    return HttpResponse.json({ medicines: medicineDB })
  }),
]
