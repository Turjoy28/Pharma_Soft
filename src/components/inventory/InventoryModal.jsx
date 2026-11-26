import { useCounterStore } from '../../stores/useCounterStore.js'
import { formatTaka } from '../../utils/money.js'
import StockExplorer from './StockExplorer'
import ExpiryBoard from './ExpiryBoard'

function InventoryModal() {
  const isInventoryOpen = useCounterStore((s) => s.isInventoryOpen)
  const closeInventory = useCounterStore((s) => s.closeInventory)
  const inventoryTab = useCounterStore((s) => s.inventoryTab)
  const setInventoryTab = useCounterStore((s) => s.setInventoryTab)
  const stockSummary = useCounterStore((s) => s.stockSummary)
  const expirySummary = useCounterStore((s) => s.expiryBoard.summary)
  const loading = useCounterStore((s) => s.loadingInventory)
  const fetchInventoryData = useCounterStore((s) => s.fetchInventoryData)

  if (!isInventoryOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header (Matches Dhaka Pharma Header Bar) */}
        <div className="bg-pharma-800 text-white px-5 py-3 flex items-center justify-between border-b border-pharma-900 select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white text-pharma-800 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px] text-pharma-700">inventory_2</span>
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span>Stock by Location &amp; Expiry Risk Board</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-900 text-teal-200 border border-teal-700 uppercase">
                  Inventory Visibility
                </span>
              </h2>
              <p className="text-[11px] text-teal-100 font-mono">
                3-Click Rack Tree Explorer • Empty Space Tracker • 30 / 60 / 90-Day Capital Risk Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchInventoryData()}
              className="px-2.5 py-1 rounded bg-teal-900/80 hover:bg-teal-700 border border-teal-600 text-teal-100 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
              title="Refresh live stock tree & expiry balances"
            >
              <span className={`material-symbols-outlined text-[14px] ${loading ? 'animate-spin' : ''}`}>sync</span>
              Refresh
            </button>
            <button
              type="button"
              onClick={closeInventory}
              className="p-1 rounded text-teal-200 hover:text-white hover:bg-pharma-700 transition-colors cursor-pointer"
              title="Close [Esc]"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Live Store KPI Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200">
            <span className="text-slate-500 text-[11px]">Total Units On Hand</span>
            <strong className="text-slate-900">{stockSummary.totalUnits || 0}</strong>
          </div>
          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200">
            <span className="text-slate-500 text-[11px]">Open Space</span>
            <strong className="text-emerald-700">
              {stockSummary.emptyBins || 0} bins • {stockSummary.emptyRacks || 0} rack
            </strong>
          </div>
          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200">
            <span className="text-slate-500 text-[11px]">Critical (&le;30d)</span>
            <strong className="text-rose-700">{expirySummary?.criticalCount || 0} batches</strong>
          </div>
          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200">
            <span className="text-slate-500 text-[11px]">90d Value at Risk</span>
            <strong className="text-rose-800">৳{formatTaka(expirySummary?.totalValueAtRiskPoisha || 0)}</strong>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="bg-slate-100 border-b border-slate-300 px-5 pt-2 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInventoryTab('tree')}
              className={`px-4 py-2 font-bold rounded-t border-t border-l border-r transition-all flex items-center gap-2 cursor-pointer ${
                inventoryTab === 'tree'
                  ? 'bg-white text-pharma-800 border-slate-300 -mb-px'
                  : 'bg-slate-200/70 text-slate-600 border-transparent hover:bg-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">account_tree</span>
              <span>1. Stock by Location Tree (3-Click Explorer)</span>
            </button>

            <button
              type="button"
              onClick={() => setInventoryTab('expiry')}
              className={`px-4 py-2 font-bold rounded-t border-t border-l border-r transition-all flex items-center gap-2 cursor-pointer ${
                inventoryTab === 'expiry'
                  ? 'bg-white text-pharma-800 border-slate-300 -mb-px'
                  : 'bg-slate-200/70 text-slate-600 border-transparent hover:bg-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">event_busy</span>
              <span>2. Expiry Risk Board (30 / 60 / 90 Days)</span>
              {(expirySummary?.criticalCount || 0) > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white ml-1">
                  {expirySummary.criticalCount} Critical
                </span>
              )}
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Press [Esc] to return to POS
          </span>
        </div>

        {/* Tab Body */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-100/50">
          {inventoryTab === 'tree' ? <StockExplorer /> : <ExpiryBoard />}
        </div>
      </div>
    </div>
  )
}

export default InventoryModal
