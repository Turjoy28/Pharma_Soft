import { useState, useEffect } from 'react'
import Header from './components/layout/Header'
import ShortcutBar from './components/layout/ShortcutBar'
import TicketQueue from './components/queue/TicketQueue'
import Cart from './components/cart/Cart'
import Footer from './components/layout/Footer'
import PaymentModal from './components/cart/PaymentModal'
import ReceiptPreview from './components/cart/ReceiptPreview'
import { useCounterStore } from './stores/useCounterStore.js'

function App() {
  const [currentTime, setCurrentTime] = useState('')

  // 🏪 Direct Modal Visibility Subscriptions
  const isPaymentOpen = useCounterStore((s) => s.isPaymentOpen)
  const isReceiptOpen = useCounterStore((s) => s.isReceiptOpen)
  const activeTicket = useCounterStore((s) => s.selectedTicket)

  // 1. Live Clock (BST)
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

  // 2. Initial Mount: Initialize station (tickets & catalog in parallel)
  useEffect(() => {
    useCounterStore.getState().initStation()
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col justify-between selection:bg-teal-700 selection:text-white">
      {/* 1. Header Bar: Hospital info, Cashier, Live Clock */}
      <Header currentTime={currentTime} />

      {/* 2. Keyboard Shortcuts Sub-Nav: Station status & F1-F12 legends */}
      <ShortcutBar />

      {/* 3. Main Split POS Layout: Queue Left (7 Cols) + Cart Right (5 Cols) */}
      <main className="flex-1 p-3 grid grid-cols-12 gap-3 items-start max-w-[1920px] mx-auto w-full">
        <TicketQueue />
        <Cart />
      </main>

      {/* 4. Hardware Status & DGDA Compliance Ribbon */}
      <Footer />

      {/* 5. Modals: Only rendered when opened! */}
      {isPaymentOpen && activeTicket && <PaymentModal />}
      {isReceiptOpen && <ReceiptPreview />}
    </div>
  )
}

export default App
