import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCounterStore } from './useCounterStore.js'
import { ticketService } from '../services/api.js'

describe('Counter Store (Zustand Slices)', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCounterStore.setState({
      tickets: [],
      loadingTickets: false,
      selectedTicketId: null,
      selectedTicket: null,
      cartItems: [],
      catalog: [],
      discountPercent: 5,
      tenderAmount: 500,
      isPaymentOpen: false,
      isReceiptOpen: false,
      activePaymentMethod: 'Cash',
      completedInvoice: null,
      isSubmittingPayment: false,
    })
    vi.restoreAllMocks()
  })

  it('initializes with default slice state values', () => {
    const state = useCounterStore.getState()
    expect(state.cartItems).toEqual([])
    expect(state.discountPercent).toBe(5)
    expect(state.tenderAmount).toBe(500)
    expect(state.isPaymentOpen).toBe(false)
    expect(state.isReceiptOpen).toBe(false)
  })

  describe('cartSlice actions', () => {
    it('increments item quantity', () => {
      useCounterStore.setState({
        cartItems: [{ id: 'item-1', name: 'Napa 500mg', qty: 2 }],
      })

      useCounterStore.getState().incrementQty('item-1')
      expect(useCounterStore.getState().cartItems[0].qty).toBe(3)
    })

    it('decrements item quantity and removes item when qty hits zero', () => {
      useCounterStore.setState({
        cartItems: [
          { id: 'item-1', name: 'Napa 500mg', qty: 2 },
          { id: 'item-2', name: 'Seclo 20mg', qty: 1 },
        ],
      })

      useCounterStore.getState().decrementQty('item-1')
      expect(useCounterStore.getState().cartItems.find((i) => i.id === 'item-1').qty).toBe(1)

      useCounterStore.getState().decrementQty('item-2')
      expect(useCounterStore.getState().cartItems.find((i) => i.id === 'item-2')).toBeUndefined()
    })

    it('removes item by id and clears cart', () => {
      useCounterStore.setState({
        cartItems: [
          { id: 'item-1', qty: 1 },
          { id: 'item-2', qty: 3 },
        ],
      })

      useCounterStore.getState().removeItem('item-1')
      expect(useCounterStore.getState().cartItems).toHaveLength(1)
      expect(useCounterStore.getState().cartItems[0].id).toBe('item-2')

      useCounterStore.getState().clearCart()
      expect(useCounterStore.getState().cartItems).toHaveLength(0)
    })
  })

  describe('paymentSlice actions', () => {
    it('does not open payment modal if cart is empty', () => {
      useCounterStore.setState({ cartItems: [], isPaymentOpen: false })
      useCounterStore.getState().openPayment('Cash')
      expect(useCounterStore.getState().isPaymentOpen).toBe(false)
    })

    it('opens payment modal with chosen payment method when cart has items', () => {
      useCounterStore.setState({ cartItems: [{ id: '1', qty: 1 }], isPaymentOpen: false })
      useCounterStore.getState().openPayment('bKash')
      expect(useCounterStore.getState().isPaymentOpen).toBe(true)
      expect(useCounterStore.getState().activePaymentMethod).toBe('bKash')

      useCounterStore.getState().closePayment()
      expect(useCounterStore.getState().isPaymentOpen).toBe(false)
    })

    it('toggles receipt modal correctly', () => {
      useCounterStore.setState({ isReceiptOpen: true })
      useCounterStore.getState().closeReceipt()
      expect(useCounterStore.getState().isReceiptOpen).toBe(false)
    })
  })

  describe('cross-slice interaction (ticket & cart)', () => {
    it('populates cartItems when a local ticket is selected', async () => {
      const mockTicket = {
        id: 'T-101',
        patient: 'John Doe',
        items: [
          { id: 'm-1', name: 'Ace Plus', qty: 10, price: 3.5 },
          { id: 'm-2', name: 'Finix 20', qty: 14, price: 7.0 },
        ],
      }
      vi.spyOn(ticketService, 'getById').mockResolvedValue(mockTicket)

      useCounterStore.setState({
        tickets: [mockTicket],
        selectedTicketId: null,
        selectedTicket: null,
        cartItems: [],
      })

      await useCounterStore.getState().selectTicket('T-101')

      const state = useCounterStore.getState()
      expect(state.selectedTicketId).toBe('T-101')
      expect(state.selectedTicket).toEqual(mockTicket)
      expect(state.cartItems).toHaveLength(2)
      expect(state.cartItems[0].serialNumber).toBe(1)
      expect(state.cartItems[1].serialNumber).toBe(2)
    })
  })
})
