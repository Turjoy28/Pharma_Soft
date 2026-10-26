import { create } from 'zustand'
import { ticketService, medicineService } from '../services/api.js'

export const useCounterStore = create((set, get) => ({
  // 🎟️ 1. Prescription Tickets Queue State
  tickets: [],
  loadingTickets: false,
  selectedTicketId: null,
  selectedTicket: null,

  // 🛒 2. Cart & Catalog State
  cartItems: [],
  catalog: [],
  discountPercent: 5,
  tenderAmount: 500,

  // 💳 3. Settlement & Modal State
  isPaymentOpen: false,
  isReceiptOpen: false,
  activePaymentMethod: 'Cash',
  completedInvoice: null,
  isSubmittingPayment: false,

  // --- ACTIONS ---

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
      console.error('[CounterStore] Init station error:', err)
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

      set({
        tickets: activeOnly,
        selectedTicketId: nextSelected ? nextSelected.id : null,
        selectedTicket: nextSelected,
        loadingTickets: false,
      })

      // If there are no cart items or selected ticket changed, reload items
      if (nextSelected && get().cartItems.length === 0) {
        set({
          cartItems: nextSelected.items
            ? nextSelected.items.map((item, idx) => ({ ...item, serialNumber: idx + 1 }))
            : [],
        })
      }
    } catch (err) {
      console.error('[CounterStore] Refresh tickets error:', err)
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
      if (fresh) {
        set({
          selectedTicket: fresh,
          cartItems: fresh.items
            ? fresh.items.map((item, idx) => ({ ...item, serialNumber: idx + 1 }))
            : [],
        })
      }
    } catch (err) {
      console.warn('[CounterStore] Ticket lookup error:', err)
    }
  },

  // ➕ Increment Cart Item Quantity
  incrementQty: (id) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      ),
    }))
  },

  // ➖ Decrement Cart Item Quantity
  decrementQty: (id) => {
    set((state) => ({
      cartItems: state.cartItems
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.qty - 1
            return nextQty > 0 ? { ...item, qty: nextQty } : null
          }
          return item
        })
        .filter(Boolean),
    }))
  },

  // ❌ Remove Item from Cart
  removeItem: (id) => {
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.id !== id),
    }))
  },

  // 🧹 Clear Entire Cart
  clearCart: () => set({ cartItems: [] }),

  // 🔁 Reload default dispensed medicines for active ticket
  reloadTicketMedicines: () => {
    const selected = get().selectedTicket
    if (selected?.items) {
      set({
        cartItems: selected.items.map((item, idx) => ({ ...item, serialNumber: idx + 1 })),
      })
    } else {
      set({ cartItems: [] })
    }
  },

  // ⚡ Quick Add Medicine from Catalog Ribbon
  quickAddMedicine: (med) => {
    set((state) => {
      const existing = state.cartItems.find((item) => item.medId === med.id)
      if (existing) {
        return {
          cartItems: state.cartItems.map((item) =>
            item.medId === med.id ? { ...item, qty: item.qty + 1 } : item
          ),
        }
      }
      return {
        cartItems: [
          ...state.cartItems,
          {
            id: `item-${Date.now()}-${med.id}`,
            medId: med.id,
            brandName: `${med.brandName} ${med.generic.split(' ')[0] || ''}`.trim(),
            generic: med.generic,
            batch: med.batch,
            expiry: med.expiry,
            price: med.price,
            qty: 1,
          },
        ],
      }
    })
  },

  setDiscountPercent: (discountPercent) => set({ discountPercent }),
  setTenderAmount: (tenderAmount) => set({ tenderAmount }),

  // 💳 Open Settlement Modal
  openPayment: (method = 'Cash') => {
    if (get().cartItems.length === 0) return
    set({ activePaymentMethod: method, isPaymentOpen: true })
  },

  // ✖️ Close Settlement Modal
  closePayment: () => set({ isPaymentOpen: false }),

  // 💰 Confirm Settlement & Issue Receipt
  confirmPayment: async (paymentData) => {
    const selectedTicket = get().selectedTicket
    if (!selectedTicket) return

    set({ isSubmittingPayment: true })
    try {
      const res = await ticketService.pay(selectedTicket.id, paymentData)
      if (res && res.invoice) {
        const remaining = get().tickets.filter((t) => t.id !== selectedTicket.id)
        const nextTicket = remaining.length > 0 ? remaining[0] : null

        set({
          completedInvoice: res.invoice,
          isPaymentOpen: false,
          isReceiptOpen: true,
          tickets: remaining,
          selectedTicketId: nextTicket ? nextTicket.id : null,
          selectedTicket: nextTicket,
          cartItems: nextTicket?.items
            ? nextTicket.items.map((item, idx) => ({ ...item, serialNumber: idx + 1 }))
            : [],
        })
      }
    } catch (err) {
      console.error('[CounterStore] Payment failed:', err)
      const message = err.response?.data?.message || err.message || 'Payment processing failed.'
      alert(`[Settlement Error] ${message}`)
    } finally {
      set({ isSubmittingPayment: false })
    }
  },

  // ✖️ Close Receipt
  closeReceipt: () => set({ isReceiptOpen: false }),
}))
