import { ticketService, medicineService } from '../../services/api.js'

/**
 * 🎟️ Ticket Queue Slice
 * Manages ticket queue fetching, selection, and station initialization.
 */
export const createTicketSlice = (set, get) => ({
  // Prescription Tickets Queue State
  tickets: [],
  loadingTickets: false,
  selectedTicketId: null,
  selectedTicket: null,

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
      // Only apply if the user hasn't switched to another ticket while waiting
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

