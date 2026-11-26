import { useState, useMemo } from 'react'
import { useCounterStore } from '../../stores/useCounterStore.js'
import { formatTaka } from '../../utils/money.js'
import { LocationClass } from '../../mockServer/locationDB.js'

function statusBadgeClasses(locClass) {
  switch (locClass) {
    case LocationClass.SELLABLE:
      return 'bg-emerald-50 text-emerald-800 border-emerald-300'
    case LocationClass.QUARANTINE:
      return 'bg-amber-50 text-amber-900 border-amber-300'
    case LocationClass.EXPIRED:
      return 'bg-rose-50 text-rose-800 border-rose-300'
    case LocationClass.DAMAGED:
      return 'bg-orange-50 text-orange-900 border-orange-300'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300'
  }
}

function StockExplorer() {
  const stockTree = useCounterStore((s) => s.stockTree)
  const selectedLocationId = useCounterStore((s) => s.selectedLocationId)
  const selectedLocationDetail = useCounterStore((s) => s.selectedLocationDetail)
  const selectLocationNode = useCounterStore((s) => s.selectLocationNode)
  const openReceiving = useCounterStore((s) => s.openReceiving)
  const closeInventory = useCounterStore((s) => s.closeInventory)

  // 3-Click Navigation State: 1. Zone -> 2. Rack -> 3. Bin
  const [activeZoneId, setActiveZoneId] = useState('zone-a')
  const [activeRackId, setActiveRackId] = useState('rack-A01')
  const [showEmptyOnly, setShowEmptyOnly] = useState(false)

  const activeZone = useMemo(
    () => stockTree.find((z) => z.id === activeZoneId) || stockTree[0],
    [stockTree, activeZoneId]
  )

  const activeRack = useMemo(() => {
    const racks = activeZone?.racks || []
    return racks.find((r) => r.id === activeRackId) || racks[0]
  }, [activeZone, activeRackId])

  // Click 1: Select Zone
  const handleSelectZone = (zone) => {
    setActiveZoneId(zone.id)
    const firstRack = zone.racks?.[0]
    if (firstRack) {
      setActiveRackId(firstRack.id)
    }
    selectLocationNode(zone.id)
  }

  // Click 2: Select Rack
  const handleSelectRack = (rack) => {
    setActiveRackId(rack.id)
    selectLocationNode(rack.id)
  }

  // Click 3: Select Bin (loads exact batch balances into detail panel)
  const handleSelectBin = (bin) => {
    selectLocationNode(bin.id)
  }

  return (
    <div className="grid grid-cols-12 gap-3 items-start">
      {/* LEFT (7 Cols): 3-Click Zone -> Rack -> Shelf/Bin Tree */}
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-2.5">
        {/* Click 1: Zones Selector Strip */}
        <div className="bg-white rounded border border-slate-300 shadow-2xs p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 bg-pharma-700 text-white rounded font-mono text-[10px]">Step 1</span>
              Select Storage Zone
            </span>
            <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showEmptyOnly}
                onChange={(e) => setShowEmptyOnly(e.target.checked)}
                className="rounded border-slate-300 text-pharma-700 focus:ring-pharma-700"
              />
              <span>Highlight Empty / Open Space</span>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {stockTree.map((zone) => {
              const isSelected = activeZone?.id === zone.id
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => handleSelectZone(zone)}
                  className={`p-2 rounded border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-pharma-50 border-pharma-700 ring-1 ring-pharma-700 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono font-bold text-xs text-slate-900">{zone.code}</span>
                    <span
                      className={`px-1 py-0.2 rounded border text-[9px] font-mono font-bold ${statusBadgeClasses(
                        zone.zoneClass
                      )}`}
                    >
                      {zone.zoneClass}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 truncate mt-1" title={zone.name}>
                    {zone.name.split(':')[1]?.trim() || zone.name}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono mt-1.5 pt-1 border-t border-slate-100">
                    <span className="font-bold text-pharma-800">{zone.totalUnits} u</span>
                    <span className="text-slate-400">{zone.racks?.length || 0} racks</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Click 2 & Click 3 Split: Racks List + Shelves/Bins Grid */}
        <div className="grid grid-cols-12 gap-2.5">
          {/* Click 2: Racks inside Active Zone (Always includes empty racks!) */}
          <div className="col-span-12 sm:col-span-5 bg-white rounded border border-slate-300 shadow-2xs p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 bg-pharma-700 text-white rounded font-mono text-[10px]">Step 2</span>
                Racks in {activeZone?.code}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[380px] overflow-y-auto pr-0.5">
              {(activeZone?.racks || []).map((rack) => {
                const isSelected = activeRack?.id === rack.id
                return (
                  <button
                    key={rack.id}
                    type="button"
                    onClick={() => handleSelectRack(rack)}
                    className={`p-2 rounded border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border-pharma-700 ring-1 ring-pharma-700'
                        : rack.isEmpty
                        ? 'bg-slate-50/70 border-dashed border-slate-300 hover:border-pharma-600'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-xs text-slate-900">{rack.code}</span>
                      {rack.isEmpty ? (
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono text-[9px] font-bold">
                          EMPTY • 0 u
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                          {rack.totalUnits} units
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">{rack.name}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                      <span>
                        {rack.occupiedBins}/{rack.binCount} bins used
                      </span>
                      <span>৳{formatTaka(rack.totalCostPoisha)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Click 3: Shelves & Bins inside Active Rack */}
          <div className="col-span-12 sm:col-span-7 bg-white rounded border border-slate-300 shadow-2xs p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 bg-pharma-700 text-white rounded font-mono text-[10px]">Step 3</span>
                Shelves &amp; Bins ({activeRack?.code})
              </span>
              <span className="text-[10px] font-mono text-slate-500">Click any bin to inspect batches</span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-0.5">
              {(activeRack?.shelves || []).map((shelf) => {
                const visibleBins = showEmptyOnly
                  ? shelf.bins.filter((b) => b.isEmpty)
                  : shelf.bins

                return (
                  <div key={shelf.id} className="border border-slate-200 rounded bg-slate-50/70 p-2">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-bold text-slate-800">{shelf.name}</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {shelf.code} • {shelf.totalUnits} units
                      </span>
                    </div>

                    {visibleBins.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic py-1">No empty bins on this shelf tier.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {visibleBins.map((bin) => {
                          const isSelected = selectedLocationId === bin.id
                          const pct = bin.capacity > 0 ? Math.min(100, Math.round((bin.totalUnits / bin.capacity) * 100)) : 0
                          return (
                            <button
                              key={bin.id}
                              type="button"
                              onClick={() => handleSelectBin(bin)}
                              className={`p-2 rounded border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                                isSelected
                                  ? 'bg-teal-50 border-pharma-700 ring-1 ring-pharma-700 shadow-xs'
                                  : bin.isEmpty
                                  ? 'bg-white border-dashed border-slate-300 hover:border-pharma-600'
                                  : 'bg-white border-slate-200 hover:border-pharma-600'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono font-bold text-[11px] text-pharma-800">{bin.code}</span>
                                <span
                                  className={`px-1 py-0.2 rounded border text-[9px] font-mono font-bold ${
                                    bin.isEmpty
                                      ? 'bg-slate-100 text-slate-600 border-slate-300'
                                      : statusBadgeClasses(bin.locationClass)
                                  }`}
                                >
                                  {bin.isEmpty ? 'EMPTY' : `${bin.totalUnits} pcs`}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-600 truncate">{bin.name}</span>
                              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mt-0.5">
                                <div
                                  className={`h-full ${bin.isEmpty ? 'bg-slate-300' : 'bg-pharma-600'}`}
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT (5 Cols): Bin / Location Batch Detail Panel */}
      <div className="col-span-12 lg:col-span-5 bg-white rounded border border-slate-300 shadow-2xs flex flex-col">
        {!selectedLocationDetail ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">inventory_2</span>
            <p className="font-semibold text-slate-700">Select any Zone, Rack, or Bin</p>
            <p className="mt-1">Batch numbers, expiry dates, and cost valuation appear here.</p>
          </div>
        ) : (
          <>
            {/* Detail Header */}
            <div className="p-3 bg-slate-50 border-b border-slate-300">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">
                    {selectedLocationDetail.level} Inspector • {selectedLocationDetail.location?.code}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug mt-0.5">
                    {selectedLocationDetail.location?.name}
                  </h4>
                  {selectedLocationDetail.location?.fullPath && (
                    <p className="text-[10px] font-mono text-pharma-800 mt-0.5">
                      {selectedLocationDetail.location.fullPath}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold shrink-0 ${statusBadgeClasses(
                    selectedLocationDetail.location?.locationClass
                  )}`}
                >
                  {selectedLocationDetail.location?.locationClass}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-slate-200 text-xs font-mono">
                <div className="bg-white p-1.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Summed Balance</span>
                  <strong className="text-slate-900">{selectedLocationDetail.totalUnits} units</strong>
                </div>
                <div className="bg-white p-1.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Active Batches</span>
                  <strong className="text-slate-900">{selectedLocationDetail.batches?.length || 0}</strong>
                </div>
                <div className="bg-white p-1.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Cost Value</span>
                  <strong className="text-pharma-800">৳{formatTaka(selectedLocationDetail.totalCostPoisha)}</strong>
                </div>
              </div>
            </div>

            {/* Batch List inside Selected Location */}
            <div className="p-3 flex flex-col gap-2 max-h-[360px] overflow-y-auto">
              {selectedLocationDetail.batches?.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded border border-dashed border-slate-300 text-xs">
                  <span className="material-symbols-outlined text-2xl text-emerald-600 mb-1">check_box_outline_blank</span>
                  <p className="font-bold text-slate-800">Location is Empty (0 units)</p>
                  <p className="text-slate-500 mt-1">
                    {selectedLocationDetail.location?.capacity
                      ? `${selectedLocationDetail.location.capacity} units free capacity ready for put-away.`
                      : 'Open rack space ready for incoming goods placement.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      closeInventory()
                      openReceiving('putaway')
                    }}
                    className="mt-3 px-3 py-1.5 bg-pharma-700 hover:bg-pharma-800 text-white rounded text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">shelves</span>
                    Open Put-Away Station [F5]
                  </button>
                </div>
              ) : (
                selectedLocationDetail.batches.map((b) => {
                  const isNear = b.daysLeft <= 60
                  return (
                    <div
                      key={b.id}
                      className="p-2.5 rounded border border-slate-200 bg-white hover:border-slate-300 text-xs flex flex-col gap-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900">{b.brandName}</span>
                          <span className="text-[10px] text-slate-500 block">{b.generic} • {b.company}</span>
                        </div>
                        <span
                          className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold border ${
                            b.daysLeft <= 30
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : isNear
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {b.daysLeft <= 0 ? 'EXPIRED' : `${b.daysLeft}d left`}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1 text-[10px] font-mono bg-slate-50 p-1.5 rounded border border-slate-100">
                        <div>
                          <span className="text-slate-400 block">Batch</span>
                          <strong className="text-slate-800">{b.batchNo}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Expiry</span>
                          <strong className="text-slate-800">{b.expiryDate}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">On Hand</span>
                          <strong className="text-emerald-700">{b.qtyBase} pcs</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block">Cost Value</span>
                          <strong className="text-pharma-800">৳{formatTaka(b.costValuePoisha)}</strong>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default StockExplorer
