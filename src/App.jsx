import { useState, useEffect } from 'react'
import Header from './components/layout/Header'
import ShortcutBar from './components/layout/ShortcutBar'
import TicketQueue from './components/queue/TicketQueue'
import Cart from './components/cart/Cart'
import Footer from './components/layout/Footer'

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

  // Retrieve exact ticket data through ticket ID (Optimistic local find + Server fetch)
  const handleSelectTicket = (ticketId) => {
    setSelectedTicketId(ticketId)

    // A. Immediate local find so UI is instantly responsive
    const localMatch = tickets.find((t) => t.id === ticketId)
    if (localMatch) {
      setSelectedTicket(localMatch)
    }

    // B. Fetch fresh server data in background for that ticket
    fetch(`https://api.pharmaDashboard.com/tickets/${ticketId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (data.ticket) {
          setSelectedTicket(data.ticket)
        }
      })
      .catch((err) => {
        console.warn(`[App] API lookup for ticket ${ticketId} failed:`, err)
      })
  }

  // Manual refresh tickets handler
  const handleRefreshTickets = () => {
    setTicketsLoading(true)
    fetch('https://api.pharmaDashboard.com/tickets')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        const loadedTickets = data.tickets || []
        setTickets(loadedTickets)

        // Keep current ticket selected if it still exists, otherwise pick the first
        if (selectedTicketId) {
          const match = loadedTickets.find((t) => t.id === selectedTicketId)
          setSelectedTicket(match || loadedTickets[0] || null)
          if (!match && loadedTickets[0]) {
            setSelectedTicketId(loadedTickets[0].id)
          }
        } else if (loadedTickets.length > 0) {
          setSelectedTicketId(loadedTickets[0].id)
          setSelectedTicket(loadedTickets[0])
        }
        setTicketsLoading(false)
      })
      .catch((err) => {
        console.error('[App] Refresh error:', err)
        setTicketsLoading(false)
      })
  }

  // Initial Load: Fetch Tickets & Medicines from server on mount
  useEffect(() => {
    setTicketsLoading(true)

    // 1. Fetch tickets queue from server
    fetch('https://api.pharmaDashboard.com/tickets')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        const loadedTickets = data.tickets || []
        setTickets(loadedTickets)

        // Automatically select the first pending ticket in queue
        if (loadedTickets.length > 0) {
          setSelectedTicketId(loadedTickets[0].id)
          setSelectedTicket(loadedTickets[0])
        }
        setTicketsLoading(false)
      })
      .catch((err) => {
        console.error('[App] Failed to load tickets queue from server:', err)
        setTicketsLoading(false)
      })

    // 2. Fetch Medicines Catalog from server
    fetch('https://api.pharmaDashboard.com/medicines')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setCatalog(data.medicines || [])
      })
      .catch((err) => {
        console.error('[App] Failed to load medicines catalog:', err)
      })
  }, []) // Empty array = Runs ONCE on real page load

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
        />
      </main>

      {/* 4. Hardware Status & DGDA Compliance Ribbon */}
      <Footer />
    </div>
  )
}

export default App
