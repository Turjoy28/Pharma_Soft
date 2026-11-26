import { useState, useMemo } from 'react'
import { useCounterStore } from '../../stores/useCounterStore.js'
import { formatTaka } from '../../utils/money.js'

const WINDOW_STYLES = {
  critical30: {
    badge: 'bg-rose-100 text-rose-900 border-rose-300',
    card: 'border-rose-300 bg-rose-50/70',
    accent: 'text-rose-800',
    label: '0–30 Days (Critical)',
  },
  warning60: {
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
    card: 'border-amber-300 bg-amber-50/70',
    accent: 'text-amber-800',
    label: '31–60 Days (Warning)',
  },
  notice90: {
    badge: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    card: 'border-yellow-300 bg-yellow-50/60',
    accent: 'text-yellow-800',
    label: '61–90 Days (Notice)',
  },
}

function ExpiryBoard() {
  const expiryBoard = useCounterStore((s) => s.expiryBoard)
  const selectedRackFilter = useCounterStore((s) => s.selectedRackFilter)
  const setRackFilter = useCounterStore((s) => s.setRackFilter)
  const applyExpiryAction = useCounterStore((s) => s.applyExpiryAction)
  const actionMessage = useCounterStore((s) => s.inventoryActionMessage)
  const clearInventoryFeedback = useCounterStore((s) => s.clearInventoryFeedback)

  const [windowFilter, setWindowFilter] = useState('all') // 'all' | 'critical30' | 'warning60' | 'notice90'
  const [searchQuery, setSearchQuery] = useState('')
  const [busyBatchId, setBusyBatchId] = useState(null)

  const { windows, rows = [], racks = [], summary = {} } = expiryBoard

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return rows.filter((r) => {
      if (windowFilter !== 'all' && r.window !== windowFilter) return false
      if (!q) return true
      return (
        r.brandName?.toLowerCase().includes(q) ||
        r.generic?.toLowerCase().includes(q) ||
        r.batchNo?.toLowerCase().includes(q) ||
        r.binCode?.toLowerCase().includes(q)
      )
    })
  }, [rows, windowFilter, searchQuery])

  const filteredValuePoisha = useMemo(
    () => filteredRows.reduce((sum, r) => sum + (r.valueAtRiskPoisha || 0), 0),
    [filteredRows]
  )

  const filteredUnits = useMemo(
    () => filteredRows.reduce((sum, r) => sum + (r.qtyBase || 0), 0),
    [filteredRows]
  )

  const handleAction = async (batchId, action) => {
    setBusyBatchId(batchId)
    await applyExpiryAction(batchId, action)
    setBusyBatchId(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Three Expiry Window KPI Cards (Click any card to filter!) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {(['critical30', 'warning60', 'notice90']).map((key) => {
          const win = windows?.[key] || { rows: [], totalUnits: 0, valueAtRiskPoisha: 0 }
          const style = WINDOW_STYLES[key]
          const isSelected = windowFilter === key

          return (
            <button
              key={key}
              type="button"
              onClick={() => setWindowFilter(isSelected ? 'all' : key)}
              className={`p-3 rounded border text-left transition-all cursor-pointer flex flex-col justify-between ${
                style.card
              } ${isSelected ? 'ring-2 ring-pharma-700 shadow-sm' : 'hover:shadow-xs'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2 py-0.5 rounded border text-[11px] font-mono font-bold ${style.badge}`}>
                  {style.label}
                </span>
                <span className="text-[11px] font-mono text-slate-600 font-semibold">
                  {win.rows?.length || 0} batches • {win.totalUnits || 0} units
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-[11px] text-slate-600 font-medium">Value at Risk (Cost)</span>
                <span className={`text-lg font-black font-mono ${style.accent}`}>
                  ৳{formatTaka(win.valueAtRiskPoisha || 0)}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Action Confirmation Banner */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-2 rounded text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
            <span>{actionMessage}</span>
          </div>
          <button
            type="button"
            onClick={clearInventoryFeedback}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* 2. Rack Filter, Search & Total Risk Ribbon */}
      <div className="bg-white rounded border border-slate-300 shadow-2xs p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700 text-[11px] uppercase">Rack Filter:</span>
            <select
              value={selectedRackFilter}
              onChange={(e) => setRackFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-pharma-700"
            >
              <option value="all">All Racks ({racks.length})</option>
              {racks.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} — {r.name.split(':')[0]}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined text-[15px] text-slate-400 absolute left-2 top-2">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter medicine, batch or bin..."
              className="pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs w-56 focus:outline-none focus:ring-1 focus:ring-pharma-700"
            />
          </div>

          {windowFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setWindowFilter('all')}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[11px] font-mono text-slate-700 cursor-pointer"
            >
              Clear Window Filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="text-slate-500 text-[11px]">
            90d Total Value at Risk:
          </span>
          <span className="px-2.5 py-1 rounded bg-rose-700 text-white font-black text-xs shadow-2xs">
            ৳{formatTaka(summary.totalValueAtRiskPoisha || 0)}
          </span>
        </div>
      </div>

      {/* 3. Expiry Risk Table with One-Click Mitigation Actions */}
      <div className="bg-white rounded border border-slate-300 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-600 uppercase font-mono sticky top-0 z-10">
              <tr>
                <th className="p-2.5">Medicine &amp; Supplier</th>
                <th className="p-2.5">Batch &amp; Shelf Bin</th>
                <th className="p-2.5">Expiry Window</th>
                <th className="p-2.5 text-right">Qty (Base)</th>
                <th className="p-2.5 text-right">Unit Cost</th>
                <th className="p-2.5 text-right">Value at Risk</th>
                <th className="p-2.5 text-right">One-Click Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No expiring batches match the current rack or window filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const style = WINDOW_STYLES[row.window] || WINDOW_STYLES.notice90
                  const isBusy = busyBatchId === row.id

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/90 transition-colors">
                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{row.brandName}</span>
                          {row.actionStatus && (
                            <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-900 border border-teal-300 font-mono text-[9px] font-bold">
                              {row.actionStatus}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          {row.generic} • {row.company}
                        </span>
                      </td>

                      <td className="p-2.5 font-mono">
                        <span className="font-bold text-slate-800 block">{row.batchNo}</span>
                        <span className="text-[10px] text-pharma-800">
                          {row.rackCode} / {row.binCode}
                        </span>
                      </td>

                      <td className="p-2.5 font-mono">
                        <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${style.badge}`}>
                          {row.daysLeft <= 0 ? 'EXPIRED' : `${row.daysLeft}d left`}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{row.expiryDate}</span>
                      </td>

                      <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                        {row.qtyBase}
                      </td>

                      <td className="p-2.5 text-right font-mono text-slate-600">
                        ৳{formatTaka(row.costPerUnitPoisha)}
                      </td>

                      <td className="p-2.5 text-right font-mono font-black text-rose-700">
                        ৳{formatTaka(row.valueAtRiskPoisha)}
                      </td>

                      <td className="p-2.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleAction(row.id, 'fefo_push')}
                            className="px-2 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-900 rounded text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                            title="Prioritize as FEFO #1 on Counter 1"
                          >
                            FEFO Push
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleAction(row.id, 'discount')}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                            title="Apply 10% Clearance Discount (within DGDA MRP)"
                          >
                            Discount
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleAction(row.id, 'supplier_return')}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 rounded text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                            title="Move to Zone D Return Holding for Supplier Credit Note"
                          >
                            Return
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-mono text-xs">
              <tr>
                <td colSpan="3" className="p-2.5 font-bold text-slate-700 uppercase">
                  Showing {filteredRows.length} At-Risk Batches (Exact Integer Sum)
                </td>
                <td className="p-2.5 text-right font-bold text-slate-900">{filteredUnits}</td>
                <td className="p-2.5 text-right text-slate-400">—</td>
                <td className="p-2.5 text-right font-black text-rose-800 text-sm">
                  ৳{formatTaka(filteredValuePoisha)}
                </td>
                <td className="p-2.5"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ExpiryBoard
