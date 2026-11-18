import { useEffect } from 'react'
import { useCounterStore } from '../../stores/useCounterStore.js'
import GoodsReceiptForm from './GoodsReceiptForm'
import PutAwayStation from './PutAwayStation'

function ReceivingModal() {
  const isReceivingOpen = useCounterStore((s) => s.isReceivingOpen)
  const closeReceiving = useCounterStore((s) => s.closeReceiving)
  const receivingTab = useCounterStore((s) => s.receivingTab)
  const setReceivingTab = useCounterStore((s) => s.setReceivingTab)
  const quarantineCount = useCounterStore((s) => s.quarantineQueue.length)

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeReceiving()
      }
    }
    if (isReceivingOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isReceivingOpen, closeReceiving])

  if (!isReceivingOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-pharma-800 text-white px-5 py-3 flex items-center justify-between border-b border-pharma-900 select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white text-pharma-800 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px] text-pharma-700">move_to_inbox</span>
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span>Inbound Receiving &amp; Put-Away Workstation</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-900 text-teal-200 border border-teal-700 uppercase">
                  DGDA Inward Standard
                </span>
              </h2>
              <p className="text-[11px] text-teal-100 font-mono">
                Dhanmondi Central Store #02 • Goods Inspection, Quarantine Bay &amp; Rack Allocation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeReceiving}
              className="p-1 rounded text-teal-200 hover:text-white hover:bg-pharma-700 transition-colors cursor-pointer"
              title="Close [Esc]"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="bg-slate-100 border-b border-slate-300 px-5 pt-2 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReceivingTab('receipt')}
              className={`px-4 py-2 font-bold rounded-t border-t border-l border-r transition-all flex items-center gap-2 cursor-pointer ${
                receivingTab === 'receipt'
                  ? 'bg-white text-pharma-800 border-slate-300 -mb-px'
                  : 'bg-slate-200/70 text-slate-600 border-transparent hover:bg-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">description</span>
              <span>1. Inbound Goods Receipt (Challan Form)</span>
            </button>

            <button
              type="button"
              onClick={() => setReceivingTab('putaway')}
              className={`px-4 py-2 font-bold rounded-t border-t border-l border-r transition-all flex items-center gap-2 cursor-pointer ${
                receivingTab === 'putaway'
                  ? 'bg-white text-pharma-800 border-slate-300 -mb-px'
                  : 'bg-slate-200/70 text-slate-600 border-transparent hover:bg-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">shelves</span>
              <span>2. Shelf Put-Away Station (Quarantine &rarr; Sellable)</span>
              {quarantineCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-900 ml-1">
                  {quarantineCount}
                </span>
              )}
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Press [Esc] to exit to POS
          </span>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-100/50">
          {receivingTab === 'receipt' ? <GoodsReceiptForm /> : <PutAwayStation />}
        </div>
      </div>
    </div>
  )
}

export default ReceivingModal

