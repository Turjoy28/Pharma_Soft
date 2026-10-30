import { ticketService } from '../../services/api.js'

/**
 * 💳 Payment & Settlement Slice
 * Manages checkout modal, active payment methods, invoice completion, and receipts.
 */
export const createPaymentSlice = (set, get) => ({
  // Settlement & Modal State
  isPaymentOpen: false,
  isReceiptOpen: false,
  activePaymentMethod: 'Cash',
  completedInvoice: null,
  isSubmittingPayment: false,

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
      console.error('[PaymentSlice] Payment failed:', err)
      const message = err.response?.data?.message || err.message || 'Payment processing failed.'
      alert(`[Settlement Error] ${message}`)
    } finally {
      set({ isSubmittingPayment: false })
    }
  },

  // ✖️ Close Receipt
  closeReceipt: () => set({ isReceiptOpen: false }),
})

