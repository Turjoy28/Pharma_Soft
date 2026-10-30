import { useEffect } from 'react'
import { useCounterStore } from '../stores/useCounterStore.js'

/**
 * ⌨️ usePosShortcuts
 * Central keyboard shortcut manager for POS operations:
 * - [F1] Toggle Counter Station (Counter 1 Dispense <-> Counter 2 Billing)
 * - [F2] Focus Search (Medicine in C1, Ticket in C2)
 * - [F6] Open Cash Payment (Counter 2)
 * - [F8] Open Card Payment (Counter 2)
 * - [F9] Open bKash / Mobile Wallet Payment (Counter 2)
 * - [F12] Counter 1: Dispatch Ticket | Counter 2: Settle & Open Drawer
 * - [Escape] Dismiss open payment or receipt modals
 */
export function usePosShortcuts() {
  const activeCounter = useCounterStore((s) => s.activeCounter)
  const toggleActiveCounter = useCounterStore((s) => s.toggleActiveCounter)
  const isPaymentOpen = useCounterStore((s) => s.isPaymentOpen)
  const isReceiptOpen = useCounterStore((s) => s.isReceiptOpen)
  const cartItems = useCounterStore((s) => s.cartItems)
  const openPayment = useCounterStore((s) => s.openPayment)
  const closePayment = useCounterStore((s) => s.closePayment)
  const closeReceipt = useCounterStore((s) => s.closeReceipt)
  const dispatchTicket = useCounterStore((s) => s.dispatchTicket)
  const dispenseBasket = useCounterStore((s) => s.dispenseBasket)

  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. [F1]: Switch between Counter 1 (Dispensing) and Counter 2 (Billing)
      if (e.key === 'F1') {
        e.preventDefault()
        toggleActiveCounter()
        return
      }

      // 2. [Escape]: Dismiss modals
      if (e.key === 'Escape') {
        if (isPaymentOpen) {
          e.preventDefault()
          closePayment()
          return
        }
        if (isReceiptOpen) {
          e.preventDefault()
          closeReceipt()
          return
        }
      }

      // 3. [F2]: Contextual Focus Search
      if (e.key === 'F2') {
        e.preventDefault()
        if (activeCounter === 'counter1') {
          const medInput =
            document.querySelector('input[data-shortcut="search-medicine"]') ||
            document.querySelector('input[placeholder*="Scan or search"]')
          if (medInput) {
            medInput.focus()
            medInput.select?.()
          }
        } else {
          const searchInput =
            document.querySelector('input[data-shortcut="search-ticket"]') ||
            document.querySelector('input[placeholder*="Search Ticket"]')
          if (searchInput) {
            searchInput.focus()
            searchInput.select?.()
          }
        }
        return
      }

      // 4. Counter 1 Specific Actions
      if (activeCounter === 'counter1') {
        if (e.key === 'F12' || (e.ctrlKey && e.key === 'Enter')) {
          if (dispenseBasket.length > 0) {
            e.preventDefault()
            dispatchTicket()
          }
        }
        return
      }

      // 5. Counter 2 Specific Actions (Billing & Payment)
      if (isPaymentOpen || isReceiptOpen || cartItems.length === 0) {
        return
      }

      switch (e.key) {
        case 'F6':
          e.preventDefault()
          openPayment('Cash')
          break
        case 'F8':
          e.preventDefault()
          openPayment('Card')
          break
        case 'F9':
          e.preventDefault()
          openPayment('bKash / Nagad')
          break
        case 'F12':
          e.preventDefault()
          openPayment('Cash')
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    activeCounter,
    toggleActiveCounter,
    isPaymentOpen,
    isReceiptOpen,
    cartItems.length,
    dispenseBasket.length,
    openPayment,
    closePayment,
    closeReceipt,
    dispatchTicket,
  ])
}
