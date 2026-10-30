import { useState } from 'react'
import TicketCard from './TicketCard'
import { useCounterStore } from '../../stores/useCounterStore.js'

/**
 * Senior Skeleton Component: Prevents layout shift (CLS) while loading
 */
function TicketCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded p-3 relative shadow-2xs animate-pulse">
      {/* Top Header Placeholder */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-16 h-5 bg-slate-200 rounded"></div>
          <div className="w-24 h-5 bg-slate-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-14 h-4 bg-slate-200 rounded"></div>
          <div className="w-16 h-5 bg-slate-200 rounded font-bold"></div>
        </div>
      </div>

      {/* Details Placeholder */}
      <div className="grid grid-cols-12 gap-2 mt-2 pt-2 border-t border-slate-100">
        <div className="col-span-7 space-y-1.5">
          <div className="w-20 h-3 bg-slate-200 rounded"></div>
          <div className="w-36 h-4 bg-slate-200 rounded font-bold"></div>
          <div className="w-48 h-3 bg-slate-200 rounded"></div>
        </div>
        <div className="col-span-5 flex flex-col justify-end items-end">
          <div className="w-24 h-7 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}

function TicketQueue() {
  // 🏪 Direct Zustand Subscription (Zero Prop Drilling)
  const tickets = useCounterStore((s) => s.tickets)
  const loading = useCounterStore((s) => s.loadingTickets)
  const selectedTicketId = useCounterStore((s) => s.selectedTicketId)
  const onSelectTicket = useCounterStore((s) => s.selectTicket)
  const onRefreshTickets = useCounterStore((s) => s.fetchTickets)

  // Local UI Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  // Dynamic Category Filters
  const categories = [
    { id: 'all', label: 'All Active', count: tickets.length },
    { id: 'verified', label: 'Pharmacist Verified', count: tickets.filter((t) => t.category === 'verified').length },
    { id: 'emergency', label: 'Emergency / Pediatric', count: tickets.filter((t) => t.category === 'emergency').length },
    { id: 'cold-chain', label: 'Cold-Chain', count: tickets.filter((t) => t.category === 'cold-chain').length },
    { id: 'held', label: 'Held Tickets', count: tickets.filter((t) => t.category === 'held').length },
  ]

  // Filtered tickets based on search query and category pill
  const filteredTickets = tickets.filter((t) => {
    const query = searchTerm.toLowerCase().trim()
    const matchesSearch =
      query === '' ||
      t.ticketNumber?.toLowerCase().includes(query) ||
      t.patientName?.toLowerCase().includes(query)

    const matchesCategory =
      activeCategory === 'all'
        ? true
        : activeCategory === 'active'
          ? t.status === 'active'
          : t.category === activeCategory

    return matchesSearch && matchesCategory
  })

  const handleResetFilters = () => {
    setSearchTerm('')
    setActiveCategory('all')
  }

  return (
    <div className="col-span-12 lg:col-span-7 xl:col-span-7 flex flex-col gap-2.5">
      <div className="bg-white rounded border border-slate-300 shadow-sm flex flex-col h-[calc(100vh-140px)] min-h-[640px]">
        {/* Queue Header Ribbon */}
        <div className="p-3 border-b border-slate-300 bg-slate-50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-pharma-700 text-[22px]">receipt_long</span>
              <div>
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>Dispensing Tickets Queue</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span> Live Sync Active
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Socket LAN 127.0.0.1:8080 • Connected to Counter 1 (Dispenser)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onRefreshTickets}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 font-mono text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                title="Refresh queue from Counter 1"
              >
                <span className={`material-symbols-outlined text-[14px] text-teal-700 ${loading ? 'animate-spin' : ''}`}>sync</span> Refresh [Ctrl+R]
              </button>
            </div>
          </div>

          {/* Search Bar & Barcode Token Scanner */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200 text-xs">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-2 text-slate-400 material-symbols-outlined text-[16px]">search</span>
              <input
                data-shortcut="search-ticket"
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-pharma-700 font-sans"
                placeholder="Search Ticket # [F2], Patient Name or Mobile..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              )}
            </div>
            <button
              type="button"
              className="px-3 py-1.5 bg-pharma-50 hover:bg-teal-100 border border-teal-300 rounded text-pharma-800 font-medium text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-pharma-700">qr_code_scanner</span> Scan QR / Token Barcode
            </button>
          </div>

          {/* Dynamic Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pt-1 text-xs">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded font-medium whitespace-nowrap transition-colors border cursor-pointer ${isActive
                      ? 'bg-pharma-700 text-white border-pharma-700 shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                >
                  {cat.label} ({cat.count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Dynamic Ticket Cards List */}
        <div className="p-2.5 flex flex-col gap-2 overflow-y-auto max-h-[660px]">
          {loading ? (
            <div className="flex flex-col gap-2 py-1">
              <TicketCardSkeleton />
              <TicketCardSkeleton />
              <TicketCardSkeleton />
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center bg-slate-50/60 rounded border border-dashed border-slate-300 my-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-200 shadow-2xs">
                <span className="material-symbols-outlined text-3xl">task_alt</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm">All Caught Up! Queue is Clear</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                No pending dispensing tickets from Counter 1. New prescription tickets will appear here automatically via LAN socket.
              </p>
              <button
                type="button"
                onClick={onRefreshTickets}
                className="mt-3.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded font-mono text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-teal-700">sync</span> Check Counter 1 Sync
              </button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center bg-slate-50/60 rounded border border-dashed border-slate-300 my-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
                <span className="material-symbols-outlined text-2xl">search_off</span>
              </div>
              <h3 className="font-bold text-slate-700 text-sm">No Matching Tickets Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                No tickets found for {searchTerm ? <span>query &quot;<strong>{searchTerm}</strong>&quot;</span> : `category "${activeCategory}"`}.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 px-3 py-1 bg-pharma-700 hover:bg-pharma-800 text-white rounded text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                Clear Search &amp; Filters
              </button>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                isSelected={ticket.id === selectedTicketId}
                onSelectTicket={onSelectTicket}
              />
            ))
          )}
        </div>

        {/* Queue Status Footer */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="font-medium">Counter 1 Dispenser Link:</span>
            <span className="font-mono font-semibold text-pharma-800">ONLINE (Socket 127.0.0.1:8080)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {loading ? 'Syncing DB...' : `${tickets.length} Dispensing Tickets in Queue`}
          </span>
        </div>
      </div>
    </div>
  )
}

export default TicketQueue
