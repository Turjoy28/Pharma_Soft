import { useEffect } from 'react'
import { useCounterStore } from '../stores/useCounterStore.js'

/**
 * ⌨️ usePosShortcuts
 * Central keyboard shortcut manager for POS operations:
 * - [F2] Focus Ticket Search input
 * - [F6] Open Cash Payment
 * - [F8] Open Card Payment
 * - [F9] Open bKash / Mobile Wallet Payment
 * - [F12] Settle & Open Drawer (Cash)
 * - [Escape] Dismiss open payment or receipt modals
 */
export function usePosShortcuts() {
  const isPaymentOpen = useCounterStore((s) => s.isPaymentOpen)
  const isReceiptOpen = useCounterStore((s) => s.isReceiptOpen)
  const cartItems = useCounterStore((s) => s.cartItems)
  const openPayment = useCounterStore((s) => s.openPayment)
  const closePayment = useCounterStore((s) => s.closePayment)
  const closeReceipt = useCounterStore((s) => s.closeReceipt)

  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. [Escape]: Dismiss modals
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

      // 2. [F2]: Focus Ticket Search
      if (e.key === 'F2') {
        e.preventDefault()
        const searchInput =
          document.querySelector('input[data-shortcut="search-ticket"]') ||
          document.querySelector('input[placeholder*="Search Ticket"]')
        if (searchInput) {
          searchInput.focus()
          searchInput.select?.()
        }
        return
      }

      // If a modal is currently open or cart is empty, do not trigger new payment flows
      if (isPaymentOpen || isReceiptOpen || cartItems.length === 0) {
        return
      }

      // 3. Payment Method Shortcuts
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
    isPaymentOpen,
    isReceiptOpen,
    cartItems.length,
    openPayment,
    closePayment,
    closeReceipt,
  ])
}

