import { useState } from 'react'
import TicketCard from './TicketCard'

function TicketQueue({
  tickets = [],
  loading = false,
  selectedTicketId = 'TK-1082',
  onSelectTicket,
  onRefresh,
}){
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
      t.ticketNumber.toLowerCase().includes(query) ||
      t.patientName.toLowerCase().includes(query)

    const matchesCategory =
      activeCategory === 'all'
        ? true
        : activeCategory === 'active'
        ? t.status === 'active'
        : t.category === activeCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="col-span-12 lg:col-span-7 xl:col-span-7 flex flex-col gap-2.5">
      <div className="bg-white rounded border border-slate-300 shadow-sm flex flex-col">
        
        {/* Queue Header & Live Status */}
        <div className="p-3 bg-slate-50 border-b border-slate-300 rounded-t flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-pharma-700 text-[22px]">receipt_long</span>
              <div>
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>অপেক্ষারত প্রেসক্রিপশন ও বিল টিকিট / Dispensing Tickets Queue</span>
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
                onClick={onRefresh}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 font-mono text-xs flex items-center gap-1 shadow-2xs transition-colors"
              >
                <span className="material-symbols-outlined text-[14px] text-teal-700">sync</span> Refresh [Ctrl+R]
              </button>
            </div>
          </div>

          {/* Search Bar & Barcode Token Scanner */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200 text-xs">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-2 text-slate-400 material-symbols-outlined text-[16px]">search</span>
              <input
                className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-pharma-700 font-sans"
                placeholder="Search Ticket # [F2], Patient Name or Mobile..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-3 py-1.5 bg-pharma-50 hover:bg-teal-100 border border-teal-300 rounded text-pharma-800 font-medium text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors">
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
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded font-medium whitespace-nowrap transition-colors border ${
                    isActive
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
            <div className="p-8 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl text-teal-600 animate-spin">sync</span>
              <p className="text-xs font-mono mt-2">Loading dispensing queue from server...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded border border-dashed border-slate-200">
              <span className="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
              <p className="text-xs font-medium text-slate-600 mt-2">No tickets found for this filter or search query.</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                isSelected={ticket.id === selectedTicketId}
                onSelect={onSelectTicket}
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
