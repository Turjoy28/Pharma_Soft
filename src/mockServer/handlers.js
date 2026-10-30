import { http, HttpResponse } from 'msw/http'
import { medicineDB, ticketsDB } from './msDB.js'

export const handlers = [
  // 🎟️ 1. Dispensing Tickets Queue
  http.get('/api/tickets', () => {
    console.log('[MSW] Intercepted GET /api/tickets')
    return HttpResponse.json({ tickets: ticketsDB })
  }),

  // 🎟️ 2. Single Ticket Lookup by Ticket ID
  http.get('/api/tickets/:id', ({ params }) => {
    const { id } = params
    console.log(`[MSW] Intercepted GET /api/tickets/${id}`)
    const ticket = ticketsDB.find((t) => t.id.toLowerCase() === String(id).toLowerCase())
    if (!ticket) {
      return new HttpResponse(null, { status: 404, statusText: 'Ticket not found' })
    }
    return HttpResponse.json({ ticket })
  }),

  // 🎟️ 2b. Create Dispensing Ticket (Counter 1 -> Counter 2)
  http.post('/api/tickets', async ({ request }) => {
    const newTicket = await request.json()
    console.log('[MSW] Intercepted POST /api/tickets', newTicket)
    ticketsDB.unshift(newTicket)
    return HttpResponse.json({ ticket: newTicket }, { status: 201 })
  }),

  // 📦 3. Medicines Inventory Catalog
  http.get('/api/medicines', () => {
    console.log('[MSW] Intercepted GET /api/medicines')
    return HttpResponse.json({ medicines: medicineDB })
  }),

  // 💰 4. Finalise Sale & Pay Ticket (Day 8 Settlement)
  http.post('/api/tickets/:id/pay', async ({ params, request }) => {
    const { id } = params
    const body = await request.json()
    console.log(`[MSW] Intercepted POST /api/tickets/${id}/pay`, body)

    const ticket = ticketsDB.find((t) => t.id.toLowerCase() === String(id).toLowerCase())
    if (!ticket) {
      return HttpResponse.json(
        { code: 'TICKET_NOT_FOUND', message: 'Dispensing ticket not found.' },
        { status: 404 }
      )
    }

    if (ticket.status === 'paid') {
      return HttpResponse.json(
        {
          code: 'TICKET_ALREADY_PAID',
          message: `Ticket ${ticket.ticketNumber || id} has already been settled and paid.`,
        },
        { status: 400 }
      )
    }

    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const invoiceNo = `INV-${dateStr}-${randomSuffix}`

    const invoice = {
      invoiceNo,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber || `#${ticket.id}`,
      createdAt: now.toISOString(),
      storeName: 'AL-SHIFA PHARMACY & WELLNESS',
      branch: 'Dhanmondi Model Branch, Road 27, Dhaka-1209',
      drugLicense: 'DL-DH-84920/2024',
      vatReg: '004928192-0101',
      hotline: '+880 1819-239401',
      cashier: body.cashierName || 'Cashier #04 (Kamal Hossain)',
      dispenser: ticket.dispenser || 'Pharm. Tanvir (Counter 1)',
      patientName: body.patientName || ticket.patientName || 'Walk-in Patient',
      patientNote: ticket.patientNote || '',
      doctor: body.doctorName || ticket.doctor || 'Direct Dispensing (OTC)',
      items: body.items && body.items.length > 0 ? body.items : ticket.items || [],
      subtotalPoisha: body.subtotalPoisha,
      discountPoisha: body.discountPoisha,
      roundingPoisha: body.roundingPoisha,
      totalPayablePoisha: body.totalPayablePoisha,
      changePoisha: body.changePoisha || 0,
      payments: body.payments || [],
    }

    // Mutate state in mock DB
    ticket.status = 'paid'
    ticket.statusLabel = 'Paid & Settled'
    ticket.paidAt = invoice.createdAt
    ticket.invoice = invoice

    return HttpResponse.json(
      {
        success: true,
        message: 'Sale finalized successfully',
        invoice,
        ticket,
      },
      { status: 200 }
    )
  }),
]
