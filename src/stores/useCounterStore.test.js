import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCounterStore } from './useCounterStore.js'
import { ticketService } from '../services/api.js'

describe('Counter Store (Zustand Slices)', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCounterStore.setState({
      activeCounter: 'counter2',
      tickets: [],
      loadingTickets: false,
      selectedTicketId: null,
      selectedTicket: null,
      dispenseBasket: [],
      patientInfo: {
        name: 'Mrs. Farhana Yasmin',
        phone: '01819-239401',
        doctor: 'Prof. Dr. M. Rahman (BSMMU)',
        note: 'Prescription Verified',
      },
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
    expect(state.activeCounter).toBe('counter2')
    expect(state.cartItems).toEqual([])
    expect(state.dispenseBasket).toEqual([])
    expect(state.discountPercent).toBe(5)
    expect(state.tenderAmount).toBe(500)
    expect(state.isPaymentOpen).toBe(false)
    expect(state.isReceiptOpen).toBe(false)
  })

  describe('station routing (Counter 1 <-> Counter 2)', () => {
    it('toggles between counter 1 and counter 2', () => {
      expect(useCounterStore.getState().activeCounter).toBe('counter2')

      useCounterStore.getState().toggleActiveCounter()
      expect(useCounterStore.getState().activeCounter).toBe('counter1')

      useCounterStore.getState().toggleActiveCounter()
      expect(useCounterStore.getState().activeCounter).toBe('counter2')

      useCounterStore.getState().setActiveCounter('counter1')
      expect(useCounterStore.getState().activeCounter).toBe('counter1')
    })
  })

  describe('Counter 1 Dispense Basket & Dispatch', () => {
    it('adds items to dispensing basket and accumulates quantity for same batch', () => {
      const item1 = {
        medId: 'med-1',
        brandName: 'Napa Extra',
        generic: 'Paracetamol',
        batch: 'BX-4412',
        expiry: '12/2026',
        shelf: 'Rack A-01',
        price: 30,
        qty: 1,
      }

      useCounterStore.getState().addToDispenseBasket(item1)
      expect(useCounterStore.getState().dispenseBasket).toHaveLength(1)
      expect(useCounterStore.getState().dispenseBasket[0].qty).toBe(1)
      expect(useCounterStore.getState().dispenseBasket[0].lineTotal).toBe(30)

      // Add same item and batch again
      useCounterStore.getState().addToDispenseBasket(item1)
      expect(useCounterStore.getState().dispenseBasket).toHaveLength(1)
      expect(useCounterStore.getState().dispenseBasket[0].qty).toBe(2)
      expect(useCounterStore.getState().dispenseBasket[0].lineTotal).toBe(60)
    })

    it('handles rapid repeated barcode scans cleanly', () => {
      const scannedItem = {
        medId: 'med-2',
        brandName: 'Seclo 20mg',
        generic: 'Omeprazole',
        batch: 'SQ-8914',
        barcode: '8941100501241',
        price: 7.0,
        qty: 1,
      }

      // Simulate 5 barcode beeps in a row
      for (let i = 0; i < 5; i++) {
        useCounterStore.getState().addToDispenseBasket(scannedItem)
      }

      const basket = useCounterStore.getState().dispenseBasket
      expect(basket).toHaveLength(1)
      expect(basket[0].brandName).toBe('Seclo 20mg')
      expect(basket[0].qty).toBe(5)
      expect(basket[0].lineTotal).toBe(35.0)
    })

    it('dispatches ticket from Counter 1 and switches to Counter 2 with new ticket active', async () => {
      vi.spyOn(ticketService, 'create').mockResolvedValue({ status: 201 })

      useCounterStore.setState({
        activeCounter: 'counter1',
        dispenseBasket: [
          {
            id: 'item-1',
            medId: 'med-1',
            brandName: 'Napa Extra',
            generic: 'Paracetamol',
            batch: 'BX-4412',
            expiry: '12/2026',
            shelf: 'Rack A-01',
            price: 30,
            qty: 2,
            lineTotal: 60,
          },
        ],
      })

      const newTicket = await useCounterStore.getState().dispatchTicket()

      expect(newTicket).toBeDefined()
      expect(newTicket.totalAmount).toBe(60)

      const state = useCounterStore.getState()
      // Basket cleared
      expect(state.dispenseBasket).toHaveLength(0)
      // Switched to Counter 2
      expect(state.activeCounter).toBe('counter2')
      // Ticket is active in queue
      expect(state.tickets[0].id).toBe(newTicket.id)
      expect(state.selectedTicketId).toBe(newTicket.id)
      expect(state.cartItems).toHaveLength(1)
    })

    it('updates dispense item quantity and removes if quantity drops to zero', () => {
      useCounterStore.setState({
        dispenseBasket: [
          { id: 'b-1', medId: 'med-1', brandName: 'Napa Extra', price: 3.0, qty: 2, lineTotal: 6.0 },
          { id: 'b-2', medId: 'med-2', brandName: 'Seclo 20mg', price: 7.0, qty: 1, lineTotal: 7.0 },
        ],
      })

      // Increase b-1
      useCounterStore.getState().updateDispenseQty('b-1', 1)
      expect(useCounterStore.getState().dispenseBasket[0].qty).toBe(3)
      expect(useCounterStore.getState().dispenseBasket[0].lineTotal).toBe(9.0)

      // Decrease b-2 to zero (should remove)
      useCounterStore.getState().updateDispenseQty('b-2', -1)
      expect(useCounterStore.getState().dispenseBasket).toHaveLength(1)
      expect(useCounterStore.getState().dispenseBasket.find((i) => i.id === 'b-2')).toBeUndefined()
    })

    it('removes specific item or clears all from dispense basket', () => {
      useCounterStore.setState({
        dispenseBasket: [
          { id: 'b-1', brandName: 'Napa', price: 3, qty: 1, lineTotal: 3 },
          { id: 'b-2', brandName: 'Seclo', price: 7, qty: 1, lineTotal: 7 },
        ],
      })

      useCounterStore.getState().removeFromDispenseBasket('b-1')
      expect(useCounterStore.getState().dispenseBasket).toHaveLength(1)
      expect(useCounterStore.getState().dispenseBasket[0].id).toBe('b-2')

      useCounterStore.getState().clearDispenseBasket()
      expect(useCounterStore.getState().dispenseBasket).toHaveLength(0)
    })
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
