import { useState, useEffect } from 'react'
import Header from './components/layout/Header'
import ShortcutBar from './components/layout/ShortcutBar'
import TicketQueue from './components/queue/TicketQueue'
import Cart from './components/cart/Cart'
import Footer from './components/layout/Footer'
import PaymentModal from './components/cart/PaymentModal'
import ReceiptPreview from './components/cart/ReceiptPreview'
import { ticketService, medicineService } from './services/api'

function App() {
  // 1. Production Async State: Starts empty, waits for server response
  const [tickets, setTickets] = useState([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)

  // 2. Medicine Catalog for quick-add ribbon
  const [catalog, setCatalog] = useState([])

  // 3. Register inputs
  const [currentTime, setCurrentTime] = useState('')
  const [discountPercent, setDiscountPercent] = useState(5)
  const [tenderAmount, setTenderAmount] = useState(500)

  // 4. Modal & Settlement State (Day 8 Implementation)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [activePaymentMethod, setActivePaymentMethod] = useState('Cash')
  const [activeTotals, setActiveTotals] = useState(null)
  const [activeCartItems, setActiveCartItems] = useState([])
  const [completedInvoice, setCompletedInvoice] = useState(null)
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)

  // Live Clock (BST)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hrs = String(now.getHours()).padStart(2, '0')
      const mins = String(now.getMinutes()).padStart(2, '0')
      const secs = String(now.getSeconds()).padStart(2, '0')
      setCurrentTime(`${hrs}:${mins}:${secs}`)
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Retrieve exact ticket data through ticket ID (Optimistic local find + Axios service)
  const handleSelectTicket = async (ticketId) => {
    setSelectedTicketId(ticketId)

    // A. Immediate local find so UI is instantly responsive
    const localMatch = tickets.find((t) => t.id === ticketId)
    if (localMatch) {
      setSelectedTicket(localMatch)
    }

    // B. Fetch fresh server data in background via Axios service
    try {
      const freshTicket = await ticketService.getById(ticketId)
      if (freshTicket) {
        setSelectedTicket(freshTicket)
      }
    } catch (err) {
      console.warn(`[App] API lookup for ticket ${ticketId} failed:`, err)
    }
  }

  // Manual refresh tickets handler
  const handleRefreshTickets = async () => {
    setTicketsLoading(true)
    try {
      const loadedTickets = await ticketService.getAll()
      // Filter out tickets that are already paid from the active queue
      const activeOnly = loadedTickets.filter((t) => t.status !== 'paid')
      setTickets(activeOnly)

      // Keep current ticket selected if it still exists, otherwise pick the first
      if (selectedTicketId) {
        const match = activeOnly.find((t) => t.id === selectedTicketId)
        setSelectedTicket(match || activeOnly[0] || null)
        if (!match && activeOnly[0]) {
          setSelectedTicketId(activeOnly[0].id)
        }
      } else if (activeOnly.length > 0) {
        setSelectedTicketId(activeOnly[0].id)
        setSelectedTicket(activeOnly[0])
      } else {
        setSelectedTicket(null)
        setSelectedTicketId(null)
      }
    } catch (err) {
      console.error('[App] Refresh error:', err)
    } finally {
      setTicketsLoading(false)
    }
  }

  // Initial Load: Fetch Tickets & Medicines from server in parallel on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setTicketsLoading(true)
      try {
        const [loadedTickets, loadedMedicines] = await Promise.all([
          ticketService.getAll(),
          medicineService.getAll(),
        ])

        const activeOnly = loadedTickets.filter((t) => t.status !== 'paid')
        setTickets(activeOnly)
        if (activeOnly.length > 0) {
          setSelectedTicketId(activeOnly[0].id)
          setSelectedTicket(activeOnly[0])
        }

        setCatalog(loadedMedicines)
      } catch (err) {
        console.error('[App] Failed to load initial data:', err)
      } finally {
        setTicketsLoading(false)
      }
    }

    loadInitialData()
  }, []) // Empty array = Runs ONCE on real page load

  // Open Settlement Modal
  const handleOpenPayment = (method, totals, cartItems) => {
    setActivePaymentMethod(method)
    setActiveTotals(totals)
    setActiveCartItems(cartItems)
    setIsPaymentOpen(true)
  }

  // Finalize Sale & Confirm Settlement (Calls API & MSW)
  const handleConfirmPayment = async (paymentData) => {
    if (!selectedTicket) return
    setIsSubmittingPayment(true)
    try {
      const response = await ticketService.pay(selectedTicket.id, paymentData)

      if (response && response.invoice) {
        setCompletedInvoice(response.invoice)
        setIsPaymentOpen(false)
        setIsReceiptOpen(true)

        // Remove the paid ticket from active queue
        setTickets((prev) => {
          const updated = prev.filter((t) => t.id !== selectedTicket.id)
          if (updated.length > 0) {
            setSelectedTicketId(updated[0].id)
            setSelectedTicket(updated[0])
          } else {
            setSelectedTicketId(null)
            setSelectedTicket(null)
          }
          return updated
        })
      }
    } catch (err) {
      console.error('[App] Payment failure:', err)
      const message = err.response?.data?.message || err.message || 'Payment processing failed.'
      alert(`[Settlement Error] ${message}`)
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  // Finish receipt preview and advance
  const handleNewSale = () => {
    setIsReceiptOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col justify-between selection:bg-teal-700 selection:text-white">
      {/* 1. Header Bar: Hospital info, Cashier, Live Clock */}
      <Header currentTime={currentTime} />

      {/* 2. Keyboard Shortcuts Sub-Nav: Station status & F1-F12 legends */}
      <ShortcutBar />

      {/* 3. Main Split POS Layout: Queue Left (7 Cols) + Cart Right (5 Cols) */}
      <main className="flex-1 p-3 grid grid-cols-12 gap-3 items-start max-w-[1920px] mx-auto w-full">
        <TicketQueue
          tickets={tickets}
          loading={ticketsLoading}
          selectedTicketId={selectedTicketId}
          onSelectTicket={handleSelectTicket}
          onRefreshTickets={handleRefreshTickets}
        />
        <Cart
          key={selectedTicket?.id || 'no-ticket'}
          activeTicket={selectedTicket}
          catalog={catalog}
          discountPercent={discountPercent}
          onDiscountChange={setDiscountPercent}
          tenderAmount={tenderAmount}
          onTenderChange={setTenderAmount}
          onOpenPayment={handleOpenPayment}
        />
      </main>

      {/* 4. Hardware Status & DGDA Compliance Ribbon */}
      <Footer />

      {/* 5. Day 8 Split Payment Settlement Modal */}
      {selectedTicket && activeTotals && isPaymentOpen && (
        <PaymentModal
          key={`${selectedTicket.id}-${activePaymentMethod}-${activeTotals.totalPayablePoisha}`}
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          activeTicket={selectedTicket}
          totals={activeTotals}
          cartItems={activeCartItems}
          initialMethod={activePaymentMethod}
          onConfirmPayment={handleConfirmPayment}
          isSubmitting={isSubmittingPayment}
        />
      )}

      {/* 6. Day 8 80mm Thermal Receipt Preview & Print Modal */}
      <ReceiptPreview
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        invoice={completedInvoice}
        onNewSale={handleNewSale}
      />
    </div>
  )
}

export default App
