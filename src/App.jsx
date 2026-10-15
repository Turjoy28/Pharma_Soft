import { useState, useEffect } from 'react'
import Header from './components/layout/Header'
import ShortcutBar from './components/layout/ShortcutBar'
import TicketQueue from './components/queue/TicketQueue'
import Cart from './components/cart/Cart'
import Footer from './components/layout/Footer'
import { ticketsDB } from './mockServer/msDB'

function App() {
  // Pre-seed tickets with mock DB as initial state so the UI is NEVER blank
  const [tickets, setTickets] = useState(ticketsDB)
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState('TK-1082')
  const [selectedTicket, setSelectedTicket] = useState(() => {
    return ticketsDB.find((t) => t.id === 'TK-1082') || ticketsDB[0]
  })

  const [users, setUsers] = useState([])
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

  // Retrieve exact ticket data through ticket ID (from state/DB & MSW API)
  const handleSelectTicket = (ticketId) => {
    setSelectedTicketId(ticketId)

    // 1. Immediately retrieve exact ticket from active tickets array or ticketsDB
    const exactLocalTicket =
      tickets.find((t) => t.id === ticketId) ||
      ticketsDB.find((t) => t.id === ticketId)

    if (exactLocalTicket) {
      setSelectedTicket(exactLocalTicket)
    }

    // 2. Fetch the fresh exact ticket data through the API endpoint by ticket ID
    fetch(`https://api.pharmaDashboard.com/tickets/${ticketId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        console.log(`[App] Retrieved exact ticket data for #${ticketId}:`, data.ticket)
        if (data.ticket) {
          setSelectedTicket(data.ticket)
        }
      })
      .catch((err) => {
        console.warn(`[App] API lookup for ticket ${ticketId} failed, using local copy:`, err)
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
        console.log('[App] Received tickets from MSW:', data.tickets)
        const updatedTickets = data.tickets && data.tickets.length > 0 ? data.tickets : ticketsDB
        setTickets(updatedTickets)
        // Keep selected ticket in sync with refreshed data by ticket ID
        const currentMatch = updatedTickets.find((t) => t.id === selectedTicketId)
        if (currentMatch) {
          setSelectedTicket(currentMatch)
        }
        setTicketsLoading(false)
      })
      .catch((err) => {
        console.warn('[App] Fetch to MSW tickets failed, keeping local ticketsDB:', err)
        setTickets(ticketsDB)
        setTicketsLoading(false)
      })
  }

  // Fetch Tickets & Medicines on mount from MSW
  useEffect(() => {
    // 1. Fetch tickets from mock server
    fetch('https://api.pharmaDashboard.com/tickets')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        console.log('[App] Mount: Received tickets from MSW:', data.tickets)
        if (data.tickets && data.tickets.length > 0) {
          setTickets(data.tickets)
          const currentMatch = data.tickets.find((t) => t.id === selectedTicketId)
          if (currentMatch) {
            setSelectedTicket(currentMatch)
          }
        }
        setTicketsLoading(false)
      })
      .catch((err) => {
        console.warn('[App] Mount: MSW fetch failed, using fallback ticketsDB:', err)
        setTickets(ticketsDB)
        setTicketsLoading(false)
      })

    // 2. Fetch Medicines Catalog from MSW
    fetch('https://api.pharmaDashboard.com/user')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        console.log('[App] Mount: Received medicines from MSW:', data.users)
        setUsers(data.users || [])
      })
      .catch((err) => {
        console.warn('[App] Mount: MSW user fetch error:', err)
      })
  }, [selectedTicketId])

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
          onRefresh={handleRefreshTickets}
        />
        <Cart
          key={selectedTicket?.id || 'TK-1082'}
          activeTicket={selectedTicket}
          users={users}
          discountPercent={discountPercent}
          setDiscountPercent={setDiscountPercent}
          tenderAmount={tenderAmount}
          setTenderAmount={setTenderAmount}
        />
      </main>

      {/* 4. Hardware Status & DGDA Compliance Ribbon */}
      <Footer />
    </div>
  )
}

export default App