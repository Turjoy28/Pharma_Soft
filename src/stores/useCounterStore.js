import { create } from 'zustand'
import { createTicketSlice } from './slices/ticketSlice.js'
import { createCartSlice } from './slices/cartSlice.js'
import { createPaymentSlice } from './slices/paymentSlice.js'

/**
 * 🏪 Counter Store
 * Centralized Zustand store composed of modular domain slices:
 * - Ticket Queue (`ticketSlice`)
 * - Cart & Catalog (`cartSlice`)
 * - Payment & Settlement (`paymentSlice`)
 */
export const useCounterStore = create((...a) => ({
  ...createTicketSlice(...a),
  ...createCartSlice(...a),
  ...createPaymentSlice(...a),
}))
