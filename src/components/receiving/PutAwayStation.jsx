import { useState, useMemo } from 'react'
import { useCounterStore } from '../../stores/useCounterStore.js'
import { LocationClass } from '../../mockServer/locationDB.js'

function PutAwayStation() {
  const quarantineQueue = useCounterStore((s) => s.quarantineQueue)
  const locationTree = useCounterStore((s) => s.locationTree)
  const flatBins = useCounterStore((s) => s.flatBins)
  const loading = useCounterStore((s) => s.loadingReceiving)
  const executePutAway = useCounterStore((s) => s.executePutAway)

  // Selected item in quarantine queue
  const [selectedItemId, setSelectedItemId] = useState(
    quarantineQueue.length > 0 ? quarantineQueue[0].id : null
  )

  // Interactive Tree Selector State: Zone -> Rack -> Shelf -> Bin
  const [selectedZoneId, setSelectedZoneId] = useState('zone-a')
  const [selectedRackId, setSelectedRackId] = useState('rack-A01')
  const [selectedShelfId, setSelectedShelfId] = useState('shelf-A01-S02')
  const [selectedBinId, setSelectedBinId] = useState('bin-A01-S02-B04')
  const [putAwayNotes, setPutAwayNotes] = useState('Placed into frontline dispensing rack.')
  const [feedback, setFeedback] = useState(null)

  // Currently active quarantine item
  const activeItem = quarantineQueue.find((q) => q.id === selectedItemId) || quarantineQueue[0]

  // Find Zone in tree
  const activeZone = useMemo(() => {
    return locationTree.find((z) => z.id === selectedZoneId) || locationTree[0]
  }, [locationTree, selectedZoneId])

  // Find Rack in active zone
  const activeRack = useMemo(() => {
    return activeZone?.racks?.find((r) => r.id === selectedRackId) || activeZone?.racks?.[0]
  }, [activeZone, selectedRackId])

  // Find Shelf in active rack
  const activeShelf = useMemo(() => {
    return activeRack?.shelves?.find((s) => s.id === selectedShelfId) || activeRack?.shelves?.[0]
  }, [activeRack, selectedShelfId])

  // Selected bin details
  const activeBin = useMemo(() => {
    return flatBins.find((b) => b.id === selectedBinId) || activeShelf?.bins?.[0]
  }, [flatBins, selectedBinId, activeShelf])

  // 1-Click apply suggested bin
  const handleApplySuggested = (binId) => {
    const bin = flatBins.find((b) => b.id === binId || b.code === binId)
    if (bin) {
      setSelectedZoneId(bin.zoneId)
      setSelectedRackId(bin.rackId)
      setSelectedShelfId(bin.shelfId)
      setSelectedBinId(bin.id)
    }
  }

  // Handle Put-Away confirmation
  const handleConfirmPutAway = async () => {
    if (!activeItem) return

    if (!activeBin) {
      setFeedback({ type: 'error', message: 'Please select a destination bin.' })
      return
    }

    if (activeBin.locationClass !== LocationClass.SELLABLE) {
      setFeedback({
        type: 'error',
        message: `Location ${activeBin.code} is marked as '${activeBin.locationClass}'. You can only put away stock into a SELLABLE bin!`,
      })
      return
    }

    const res = await executePutAway({
      itemId: activeItem.id,
      targetBinId: activeBin.id,
      notes: putAwayNotes,
    })

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Placed ${activeItem.brandName} (${activeItem.qtyPacks} packs / ${activeItem.totalBaseUnits} units) into ${activeBin.code}!`,
      })
      // Auto-select next quarantine item
      const remaining = quarantineQueue.filter((i) => i.id !== activeItem.id)
      if (remaining.length > 0) {
        setSelectedItemId(remaining[0].id)
      } else {
        setSelectedItemId(null)
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Header ribbon */}
      <div className="bg-slate-50 border border-slate-300 rounded p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-teal-700 text-[22px]">shelves</span>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>Shelf Put-Away Station</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300">
                {quarantineQueue.length} Items in Quarantine
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Moves goods from Receiving (Zone Q) &rarr; Active Dispensing Bins (Status: SELLABLE)
            </p>
          </div>
        </div>

        {feedback && (
          <div
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {feedback.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {quarantineQueue.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center bg-white rounded border border-dashed border-slate-300 my-4 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-200">
            <span className="material-symbols-outlined text-3xl">task_alt</span>
          </div>
          <h3 className="font-bold text-slate-900 text-base">Quarantine Bay is Clear!</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
            All received items have been successfully inspected and put away onto sellable pharmacy racks.
            New deliveries will appear here automatically when received.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-3 items-start">
          {/* Left Column: Quarantine Queue List (5 Cols) */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-2">
            <div className="bg-white rounded border border-slate-300 shadow-2xs p-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-2 flex items-center justify-between">
                <span>Items Awaiting Shelf Placement</span>
                <span className="text-[10px] font-mono font-normal text-slate-500">Select to put away</span>
              </h4>

              <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
                {quarantineQueue.map((item) => {
                  const isSelected = item.id === (activeItem?.id || selectedItemId)
                  const isCold = item.brandName.toLowerCase().includes('insulin') || item.brandName.toLowerCase().includes('lantus')

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedItemId(item.id)
                        setFeedback(null)
                      }}
                      className={`p-2.5 rounded border transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'border-pharma-700 bg-teal-50/70 ring-1 ring-pharma-700 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <span className="font-bold text-slate-900 text-xs block leading-tight">
                            {item.brandName}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                            {item.generic}
                          </span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                          QUARANTINE
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-600 pt-1 border-t border-slate-100 mt-0.5">
                        <span>Batch: <strong className="text-slate-800">{item.batch}</strong></span>
                        <span>Exp: <strong className="text-slate-800">{item.expiryDisplay || item.expiryDate}</strong></span>
                        <span>Packs: <strong className="text-emerald-700 font-bold">{item.qtyPacks} boxes</strong></span>
                        <span>Units: <strong className="text-slate-800">{item.totalBaseUnits} pcs</strong></span>
                      </div>

                      {item.suggestedBinName && (
                        <div className="mt-1 pt-1 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 font-mono truncate">
                            🎯 Suggested: <strong className="text-teal-800">{item.suggestedBinName}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedItemId(item.id)
                              handleApplySuggested(item.suggestedBinId)
                            }}
                            className="px-1.5 py-0.2 bg-teal-100 hover:bg-teal-200 text-teal-800 rounded font-semibold text-[9px] cursor-pointer shrink-0 ml-1"
                          >
                            Use Pin
                          </button>
                        </div>
                      )}

                      {isCold && (
                        <span className="text-[9px] text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200 font-semibold flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[12px]">ac_unit</span>
                          2°C–8°C Cold Chain Required (Place in Zone C Refrigerator)
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Physical Location Tree Picker (7 Cols) */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-3">
            {activeItem && (
              <div className="bg-white rounded border border-slate-300 shadow-2xs p-3.5 flex flex-col gap-3">
                {/* Active Item Banner */}
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Putting Away</span>
                    <h4 className="font-bold text-slate-900 text-sm">{activeItem.brandName}</h4>
                    <p className="text-[11px] text-slate-600 font-mono">
                      Batch #{activeItem.batch} • {activeItem.qtyPacks} packs ({activeItem.totalBaseUnits} units) • From {activeItem.supplierName}
                    </p>
                  </div>
                  {activeItem.suggestedBinId && (
                    <button
                      type="button"
                      onClick={() => handleApplySuggested(activeItem.suggestedBinId)}
                      className="px-3 py-1.5 bg-pharma-50 hover:bg-teal-100 border border-teal-300 rounded text-teal-900 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px] text-pharma-700">pin_drop</span>
                      Auto-Select Suggested Shelf
                    </button>
                  )}
                </div>

                {/* 4-Level Location Hierarchy Interactive Tree */}
                <div className="flex flex-col gap-2.5 text-xs">
                  <h5 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-pharma-700 text-[16px]">account_tree</span>
                    Select Destination Physical Shelf (Zone &rarr; Rack &rarr; Shelf &rarr; Bin)
                  </h5>

                  {/* Level 1: Zones */}
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 text-[11px]">1. Zone (Storage Climate)</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                      {locationTree.map((zone) => {
                        const isSelected = zone.id === selectedZoneId
                        const isSellable = zone.zoneClass === LocationClass.SELLABLE

                        return (
                          <button
                            key={zone.id}
                            type="button"
                            onClick={() => {
                              setSelectedZoneId(zone.id)
                              const firstRack = zone.racks?.[0]
                              const firstShelf = firstRack?.shelves?.[0]
                              const firstBin = firstShelf?.bins?.[0]
                              if (firstRack) setSelectedRackId(firstRack.id)
                              if (firstShelf) setSelectedShelfId(firstShelf.id)
                              if (firstBin) setSelectedBinId(firstBin.id)
                            }}
                            className={`p-2 rounded text-left border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-teal-50 border-pharma-700 ring-1 ring-pharma-700'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className="font-bold text-slate-900 text-xs">{zone.name.split(':')[0]}</span>
                            <span className="text-[10px] text-slate-500 truncate">{zone.temperature || zone.description}</span>
                            <span
                              className={`text-[9px] font-mono font-bold mt-1 inline-block px-1 rounded w-fit ${
                                isSellable
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {zone.zoneClass}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Level 2: Racks */}
                  {activeZone?.racks && (
                    <div>
                      <label className="block text-slate-600 font-bold mb-1 text-[11px]">2. Physical Rack</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {activeZone.racks.map((rack) => {
                          const isSelected = rack.id === selectedRackId
                          return (
                            <button
                              key={rack.id}
                              type="button"
                              onClick={() => {
                                setSelectedRackId(rack.id)
                                const firstShelf = rack.shelves?.[0]
                                const firstBin = firstShelf?.bins?.[0]
                                if (firstShelf) setSelectedShelfId(firstShelf.id)
                                if (firstBin) setSelectedBinId(firstBin.id)
                              }}
                              className={`p-2 rounded text-left border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-teal-50 border-pharma-700 font-semibold'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <span className="block font-bold text-xs">{rack.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{rack.code} • {rack.shelves?.length || 0} Shelves</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Level 3 & 4: Shelves & Bins Grid */}
                  {activeRack?.shelves && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-200">
                      <div>
                        <label className="block text-slate-600 font-bold mb-1 text-[11px]">3. Shelf Tier</label>
                        <select
                          value={selectedShelfId}
                          onChange={(e) => {
                            const sId = e.target.value
                            setSelectedShelfId(sId)
                            const sh = activeRack.shelves.find((s) => s.id === sId)
                            if (sh?.bins?.[0]) setSelectedBinId(sh.bins[0].id)
                          }}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-medium cursor-pointer"
                        >
                          {activeRack.shelves.map((sh) => (
                            <option key={sh.id} value={sh.id}>
                              {sh.name} ({sh.bins?.length || 0} Bins)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-bold mb-1 text-[11px]">4. Storage Bin (Scannable Code)</label>
                        <select
                          value={selectedBinId}
                          onChange={(e) => setSelectedBinId(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-mono font-bold cursor-pointer"
                        >
                          {activeShelf?.bins?.map((bin) => (
                            <option key={bin.id} value={bin.id}>
                              [{bin.code}] {bin.name} ({bin.current}/{bin.capacity} capacity)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Target Bin Breadcrumb & Verification Badge */}
                  {activeBin && (
                    <div className="p-3 bg-teal-50/80 rounded border border-teal-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-700 text-[20px]">pin_drop</span>
                        <div>
                          <span className="font-mono font-bold text-xs text-teal-950 block">
                            {activeBin.fullPath || `${activeZone?.code} > ${activeRack?.code} > ${activeShelf?.code} > ${activeBin.code}`}
                          </span>
                          <span className="text-[11px] text-teal-800">
                            {activeBin.name} • Capacity: {activeBin.current}/{activeBin.capacity} units
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          activeBin.locationClass === LocationClass.SELLABLE
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {activeBin.locationClass}
                      </span>
                    </div>
                  )}

                  {/* Put-Away Notes */}
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 text-[11px]">Runner Notes (Optional)</label>
                    <input
                      type="text"
                      value={putAwayNotes}
                      onChange={(e) => setPutAwayNotes(e.target.value)}
                      placeholder="e.g. Blister seals verified intact, placed at eye level."
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                    />
                  </div>

                  {/* Final Put-Away Action Button */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={loading || activeBin?.locationClass !== LocationClass.SELLABLE}
                      onClick={handleConfirmPutAway}
                      className="px-5 py-2.5 bg-pharma-700 hover:bg-pharma-800 text-white rounded font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[17px]">inventory</span>
                      {loading ? 'Moving Stock...' : 'Confirm Put-Away & Move to Sellable Inventory'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PutAwayStation
