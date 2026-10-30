import { useEffect } from 'react'
import Header from './components/layout/Header'
import ShortcutBar from './components/layout/ShortcutBar'
import TicketQueue from './components/queue/TicketQueue'
import Cart from './components/cart/Cart'
import DispensingStation from './components/dispense/DispensingStation'
import Footer from './components/layout/Footer'
import PaymentModal from './components/cart/PaymentModal'
import ReceiptPreview from './components/cart/ReceiptPreview'
import { useCounterStore } from './stores/useCounterStore.js'
import { useLiveClock } from './hooks/useLiveClock.js'
import { usePosShortcuts } from './hooks/usePosShortcuts.js'

function App() {
  // ⏰ Real-time clock & ⌨️ Global POS shortcut bindings
  const currentTime = useLiveClock()
  usePosShortcuts()

  // 🏪 Direct Subscriptions
  const activeCounter = useCounterStore((s) => s.activeCounter)
  const isPaymentOpen = useCounterStore((s) => s.isPaymentOpen)
  const isReceiptOpen = useCounterStore((s) => s.isReceiptOpen)
  const activeTicket = useCounterStore((s) => s.selectedTicket)

  // Initial Mount: Initialize station (tickets & catalog in parallel)
  useEffect(() => {
    useCounterStore.getState().initStation()
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col justify-between selection:bg-teal-700 selection:text-white">
      {/* 1. Header Bar: Hospital info, Counter Switcher, Live Clock */}
      <Header currentTime={currentTime} />

      {/* 2. Keyboard Shortcuts Sub-Nav: Station status & Contextual F1-F12 legends */}
      <ShortcutBar />

      {/* 3. Main Workspace: Counter 1 (Dispensing) OR Counter 2 (Queue + Billing) */}
      <main className="flex-1 p-3 max-w-[1920px] mx-auto w-full">
        {activeCounter === 'counter1' ? (
          <DispensingStation />
        ) : (
          <div className="grid grid-cols-12 gap-3 items-start w-full">
            <TicketQueue />
            <Cart />
          </div>
        )}
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
