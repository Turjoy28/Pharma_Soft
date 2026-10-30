import { ticketService, medicineService } from '../../services/api.js'

/**
 * 🎟️ Ticket Queue & Station Slice
 * Manages active counter station (Counter 1 vs Counter 2),
 * ticket queue fetching, selection, dispensing basket, and ticket dispatching.
 */
export const createTicketSlice = (set, get) => ({
  // 🏢 1. Station Routing: 'counter1' (Dispensing) vs 'counter2' (Billing)
  activeCounter: 'counter2',
  setActiveCounter: (counter) => set({ activeCounter: counter }),

  toggleActiveCounter: () =>
    set((s) => {
      console.log(s);

      return {activeCounter: s.activeCounter === 'counter1' ? 'counter2' : 'counter1',}
    }),

  // 🎟️ 2. Prescription Tickets Queue State (Counter 2)
  tickets: [],
  loadingTickets: false,
  selectedTicketId: null,
  selectedTicket: null,

  // 💊 3. Counter 1 Dispensing Basket & Patient State
  dispenseBasket: [
    {
      id: "item-init-1",
      medId: "med-1",
      brandName: "Napa Extra 500+65mg",
      generic: "Paracetamol 500mg + Caffeine 65mg",
      batch: "BX-4412",
      expiry: "12/26",
      shelf: "Rack A-01, Sh-2",
      fefoTag: "FEFO #1",
      price: 3.0,
      qty: 20,
      lineTotal: 60.0,
    },
    {
      id: "item-init-2",
      medId: "med-2",
      brandName: "Seclo 20mg Capsule",
      generic: "Omeprazole BP 20mg Cap",
      batch: "SQ-8914",
      expiry: "08/26",
      shelf: "Rack B-03, Box 14",
      fefoTag: "FEFO #1",
      price: 7.0,
      qty: 14,
      lineTotal: 98.0,
    },
    {
      id: "item-init-3",
      medId: "med-3",
      brandName: "Tofen Syrup 100ml",
      generic: "Ketotifen Fumarate 1mg/5ml",
      batch: "BX-7740",
      expiry: "10/26",
      shelf: "Rack S-01, Bottles",
      fefoTag: "FEFO #1",
      price: 85.0,
      qty: 1,
      lineTotal: 85.0,
    },
  ],

  patientInfo: {
    name: "Mrs. Nusrat Jahan (01712-349811)",
    doctor: "Prof. Dr. M. Rahman (BSMMU) • Token #TK-1086",
    ticketToken: "TK-1086",
  },
  
  setPatientInfo: (info) =>
    set((s) => ({ patientInfo: { ...s.patientInfo, ...info } })),

  addToDispenseBasket: (item) =>
    set((s) => {
      const existingIndex = s.dispenseBasket.findIndex(
        (b) => b.batch === item.batch && b.brandName === item.brandName
      )
      if (existingIndex >= 0) {
        const updated = [...s.dispenseBasket]
        const nextQty = updated[existingIndex].qty + (item.qty || 1)
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: nextQty,
          lineTotal: nextQty * updated[existingIndex].price,
        }
        return { dispenseBasket: updated }
      }
      return {
        dispenseBasket: [
          ...s.dispenseBasket,
          {
            ...item,
            id: `item-${Date.now()}-${item.batch}`,
            qty: item.qty || 1,
            lineTotal: (item.qty || 1) * item.price,
          },
        ],
      }
    }),

  updateDispenseQty: (id, delta) =>
    set((s) => ({
      dispenseBasket: s.dispenseBasket
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.qty + delta
            return nextQty > 0
              ? { ...item, qty: nextQty, lineTotal: nextQty * item.price }
              : null
          }
          return item
        })
        .filter(Boolean),
    })),

  removeFromDispenseBasket: (id) =>
    set((s) => ({
      dispenseBasket: s.dispenseBasket.filter((item) => item.id !== id),
    })),

  clearDispenseBasket: () => set({ dispenseBasket: [] }),

  // 🚀 Dispatch ticket from Counter 1 to Counter 2
  dispatchTicket: async () => {
    const basket = get().dispenseBasket
    if (basket.length === 0) return null

    const patient = get().patientInfo
    const ticketId = patient.ticketToken || `TK-${Math.floor(1000 + Math.random() * 9000)}`
    const nextTokenNum = parseInt(ticketId.replace(/\D/g, '') || '1086', 10) + 1
    const totalAmount = basket.reduce((sum, item) => sum + item.lineTotal, 0)

    const newTicket = {
      id: ticketId,
      ticketNumber: `#${ticketId}`,
      status: 'active',
      statusLabel: 'Ready for Payment',
      category: 'active',
      timeAgo: 'Just now',
      totalAmount,
      patientName: patient.name || 'Walk-in Patient',
      patientNote: `(${patient.note || 'Cash'} • ${patient.phone || 'N/A'})`,
      doctor: patient.doctor || 'Registered Physician',
      dispenser: 'Pharm. Tanvir (Counter 1)',
      itemsDescription: `${basket.length} medicines (${basket.reduce((acc, i) => acc + i.qty, 0)} units) • Batch Verified`,
      items: basket.map((item, idx) => ({
        id: `item-${ticketId}-${idx + 1}`,
        medId: item.medId,
        brandName: item.brandName,
        generic: item.generic,
        batch: item.batch,
        expiry: item.expiry,
        price: item.price,
        qty: item.qty,
        shelf: item.shelf,
      })),
    }

    try {
      await ticketService.create(newTicket)
    } catch {
      // Local fallback in case of offline/network mock
    }

    set((s) => ({
      tickets: [newTicket, ...s.tickets],
      dispenseBasket: [],
      patientInfo: {
        ...patient,
        ticketToken: `TK-${nextTokenNum}`,
      },
      // Switch to Counter 2 to view the ticket in queue
      activeCounter: 'counter2',
      selectedTicketId: newTicket.id,
      selectedTicket: newTicket,
      cartItems: newTicket.items.map((item, idx) => ({ ...item, serialNumber: idx + 1 })),
    }))

    return newTicket
  },

  // 🚀 Initial Load: Fetch tickets & medicines catalog in parallel
  initStation: async () => {
    set({ loadingTickets: true })
    try {
      const [loadedTickets, loadedMedicines] = await Promise.all([
        ticketService.getAll(),
        medicineService.getAll(),
      ])

      const activeOnly = loadedTickets.filter((t) => t.status !== 'paid')
      const firstTicket = activeOnly.length > 0 ? activeOnly[0] : null

      set({
        tickets: activeOnly,
        selectedTicketId: firstTicket ? firstTicket.id : null,
        selectedTicket: firstTicket,
        cartItems: firstTicket?.items
          ? firstTicket.items.map((item, idx) => ({ ...item, serialNumber: idx + 1 }))
          : [],
        catalog: loadedMedicines,
        loadingTickets: false,
      })
    } catch (err) {
      console.error('[TicketSlice] Init station error:', err)
      set({ loadingTickets: false })
    }
  },

  // 🔄 Refresh tickets from Counter 1
  fetchTickets: async () => {
    set({ loadingTickets: true })
    try {
      const loadedTickets = await ticketService.getAll()
      const activeOnly = loadedTickets.filter((t) => t.status !== 'paid')
      const currentSelectedId = get().selectedTicketId

      let nextSelected = null
      if (currentSelectedId) {
        nextSelected = activeOnly.find((t) => t.id === currentSelectedId) || activeOnly[0] || null
      } else if (activeOnly.length > 0) {
        nextSelected = activeOnly[0]
      }

      const nextSelectedId = nextSelected ? nextSelected.id : null
      const ticketChanged = nextSelectedId !== currentSelectedId

      set({
        tickets: activeOnly,
        selectedTicketId: nextSelectedId,
        selectedTicket: nextSelected,
        loadingTickets: false,
      })

      // If selected ticket changed or cart is empty, reload cart items
      if (ticketChanged || get().cartItems.length === 0) {
        set({
          cartItems: nextSelected?.items
            ? nextSelected.items.map((item, idx) => ({ ...item, serialNumber: idx + 1 }))
            : [],
        })
      }
    } catch (err) {
      console.error('[TicketSlice] Refresh tickets error:', err)
      set({ loadingTickets: false })
    }
  },

  // 👆 Select Ticket: Optimistic local switch + background refresh
  selectTicket: async (ticketId) => {
    set({ selectedTicketId: ticketId })

    const localMatch = get().tickets.find((t) => t.id === ticketId)
    if (localMatch) {
      set({
        selectedTicket: localMatch,
        cartItems: localMatch.items
          ? localMatch.items.map((item, idx) => ({ ...item, serialNumber: idx + 1 }))
          : [],
      })
    }

    try {
      const fresh = await ticketService.getById(ticketId)
      if (fresh && get().selectedTicketId === ticketId) {
        set({
          selectedTicket: fresh,
          cartItems: fresh.items
            ? fresh.items.map((item, idx) => ({ ...item, serialNumber: idx + 1 }))
            : [],
        })
      }
    } catch (err) {
      console.warn('[TicketSlice] Ticket lookup error:', err)
    }
  },
})
