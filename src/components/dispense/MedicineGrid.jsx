import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useCounterStore } from '../../stores/useCounterStore.js'

/**
 * 📦 MedicineGrid (Counter 1 - Left Column)
 * Rapid Barcode & Medicine Multi-Search with Continuous Autofocus:
 * - Autofocuses on mount & whenever Counter 1 station is active
 * - Stays focused after every barcode scan event [Enter]
 * - Stays focused after clicking '+ Dispense' or category filters
 * - Directs stray keystrokes into barcode input without interrupting other form fields
 */
function MedicineGrid() {
  const catalog = useCounterStore((s) => s.catalog)
  const addToDispenseBasket = useCounterStore((s) => s.addToDispenseBasket)
  const activeCounter = useCounterStore((s) => s.activeCounter)

  const searchInputRef = useRef(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('fast')
  const [selectedMedForLocator, setSelectedMedForLocator] = useState(null)
  const [lastScannedFeedback, setLastScannedFeedback] = useState(null)
  const [scanAlert, setScanAlert] = useState(null)

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'fast', label: '⭐ Fast Moving / OTC' },
    { id: 'gastric', label: 'Gastric & PPI' },
    { id: 'antibiotic', label: 'Antibiotics & Schedule H' },
    { id: 'cardiac', label: 'Cardio & Diabetic' },
    { id: 'respiratory', label: 'Respiratory & Syrups' },
  ]

  // 1. Maintain input focus helper
  const keepInputFocused = useCallback(() => {
    requestAnimationFrame(() => {
      if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
        // Only focus if the active element isn't another intentional input (e.g. Patient info)
        const activeTag = document.activeElement?.tagName?.toLowerCase()
        const isOtherInput = activeTag === 'input' || activeTag === 'textarea'
        const isSameInput = document.activeElement === searchInputRef.current

        if (!isOtherInput || isSameInput) {
          searchInputRef.current.focus()
        }
      }
    })
  }, [])

  // 2. Autofocus on mount & on counter station activation
  useEffect(() => {
    if (activeCounter === 'counter1') {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [activeCounter])

  // 3. Global click & keyboard capture for continuous scanner readiness
  useEffect(() => {
    if (activeCounter !== 'counter1') return

    const handleGlobalClick = (e) => {
      const target = e.target
      const tagName = target?.tagName?.toLowerCase()
      // Allow user to interact with patient name/doctor inputs in right panel without stealing focus
      if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
        return
      }
      // For any click on cards, background, tables, steppers, return focus to barcode search
      keepInputFocused()
    }

    const handleGlobalKeyDown = (e) => {
      // If a character key is pressed while focus was lost to the window/body, redirect to barcode input
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const activeEl = document.activeElement
        const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
        if (!isInput && searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }
    }

    document.addEventListener('click', handleGlobalClick)
    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => {
      document.removeEventListener('click', handleGlobalClick)
      document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [activeCounter, keepInputFocused])

  // 4. Live medicine filtering
  const filteredMedicines = useMemo(() => {
    return catalog.filter((med) => {
      const q = searchTerm.toLowerCase().trim()
      const matchQuery =
        !q ||
        med.brandName.toLowerCase().includes(q) ||
        med.generic.toLowerCase().includes(q) ||
        med.company.toLowerCase().includes(q) ||
        (med.barcode && med.barcode.toLowerCase().includes(q)) ||
        (med.batch && med.batch.toLowerCase().includes(q)) ||
        med.shelf?.toLowerCase().includes(q)

      if (!matchQuery) return false

      if (activeCategory === 'all') return true
      if (activeCategory === 'fast') return med.category === 'fast' || med.stock > 200
      if (activeCategory === 'gastric') return med.category === 'gastric' || med.generic.toLowerCase().includes('prazole')
      if (activeCategory === 'antibiotic') return med.category === 'antibiotic' || med.dgdaTag === 'Sched-H'
      if (activeCategory === 'cardiac') return med.category === 'cardiac' || med.generic.toLowerCase().includes('insulin')
      if (activeCategory === 'respiratory') return med.category === 'respiratory' || med.unitType === 'bottle'

      return true
    })
  }, [catalog, searchTerm, activeCategory])

  // 5. Dispense and immediately restore focus
  const handleDispense = (med, fromScan = false) => {
    setSelectedMedForLocator(med)
    addToDispenseBasket({
      medId: med.id,
      brandName: med.brandName,
      generic: med.generic,
      company: med.company,
      batch: med.batch,
      barcode: med.barcode,
      expiry: med.expiry,
      shelf: med.shelf,
      fefoTag: med.fefoTag || 'FEFO #1',
      price: med.price,
      qty: 1,
    })

    // Feedback notification
    setLastScannedFeedback({
      brandName: med.brandName,
      batch: med.batch,
      fromScan,
    })
    setScanAlert(null)
    setTimeout(() => setLastScannedFeedback(null), 2500)

    // Clear search term after scan so next barcode is cleanly received
    setSearchTerm('')

    // Guarantee search input remains focused
    keepInputFocused()
  }

  // 6. Handle Barcode Scanner Enter Key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const q = searchTerm.trim().toLowerCase()
      if (!q) return

      // Prioritize exact barcode or batch match first
      const exactBarcodeMatch = catalog.find(
        (m) =>
          (m.barcode && m.barcode.toLowerCase() === q) ||
          (m.batch && m.batch.toLowerCase() === q)
      )

      const targetMed = exactBarcodeMatch || filteredMedicines[0]

      if (targetMed) {
        handleDispense(targetMed, true)
      } else {
        setScanAlert(`Barcode "${searchTerm}" not found in local pharmacy inventory.`)
        setTimeout(() => setScanAlert(null), 3000)
        setSearchTerm('')
      }

      // Re-focus immediately after scan
      keepInputFocused()
    }
  }

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId)
    keepInputFocused()
  }

  return (
    <div className="col-span-12 lg:col-span-7 xl:col-span-7 flex flex-col gap-2.5">
      {/* 1. Fast Barcode & Medicine Multi-Search Box */}
      <div className="bg-white p-3 rounded border border-slate-300 shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-800 flex items-center gap-1.5" htmlFor="barcode-input">
            <span className="material-symbols-outlined text-pharma-700 text-[18px]">barcode_scanner</span>
            <span>দ্রুত অনুসন্ধান / Barcode or Medicine Search</span>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-mono">
              Brand / Generic / Barcode
            </span>
          </label>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span>
              Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-bold text-slate-800">F2</kbd> to focus
            </span>
            <span>•</span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-bold text-slate-800">ENTER</kbd> to scan/add
            </span>
          </div>
        </div>

        <div className="relative flex items-center">
          <div className="absolute left-3 text-pharma-700 pointer-events-none flex items-center">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input
            ref={searchInputRef}
            id="barcode-input"
            data-shortcut="search-medicine"
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scan barcode or type 'Napa', 'Seclo', '8941100501234'..."
            className="w-full pl-10 pr-36 py-2.5 bg-slate-50 border border-slate-300 rounded text-slate-900 font-medium placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pharma-700 focus:border-pharma-700 font-sans transition-all"
          />
          <div className="absolute right-2.5 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 text-teal-800 border border-teal-300 flex items-center gap-1 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              AUTOFOCUS READY
            </span>
          </div>
        </div>

        {/* Live Scan Notification / Error Banner */}
        {lastScannedFeedback && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded text-xs flex items-center justify-between font-mono animate-fade-in">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
              <span>
                {lastScannedFeedback.fromScan ? 'Barcode Scanned:' : 'Added:'}{' '}
                <strong>{lastScannedFeedback.brandName}</strong> (Batch: {lastScannedFeedback.batch})
              </span>
            </span>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-bold">
              ✓ Ready for next scan
            </span>
          </div>
        )}

        {scanAlert && (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 px-2.5 py-1 rounded text-xs flex items-center gap-1.5 font-mono">
            <span className="material-symbols-outlined text-[16px] text-rose-600">error</span>
            <span>{scanAlert}</span>
          </div>
        )}

        {/* Fast Categorical Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 border-t border-slate-200 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySelect(cat.id)}
              className={`cat-btn px-2.5 py-1 rounded font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'active px-3 py-1 bg-pharma-700 text-white rounded font-medium whitespace-nowrap shadow-xs font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium whitespace-nowrap border border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Medicine Quick Grid: Realistic Pharmacy Inventory with Rack, Expiry, Batch & Unit Price */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
        {filteredMedicines.map((med) => {
          const isSelected = selectedMedForLocator?.id === med.id

          return (
            <div
              key={med.id}
              onClick={() => handleDispense(med, false)}
              className={`group bg-white p-2.5 rounded border ${
                isSelected ? 'border-pharma-700 ring-1 ring-pharma-700' : 'border-slate-300'
              } hover:border-pharma-700 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-[142px] relative bg-gradient-to-b from-white to-slate-50`}
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm group-hover:text-pharma-700 leading-tight">
                      {med.brandName}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                        med.dgdaTag === 'Sched-H'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      }`}
                    >
                      {med.dgdaTag || 'DGDA'}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.2 bg-teal-50 border border-teal-200 text-teal-800 rounded text-[10px] font-mono font-medium capitalize">
                    {med.unitType || 'Unit'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">{med.generic}</p>
                <p className="text-[10px] text-slate-500 truncate">{med.company}</p>
              </div>

              <div className="pt-1.5 border-t border-slate-200 text-[11px] flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span className="truncate pr-1">
                    📍 <strong className="text-slate-700">{med.shelf}</strong>
                  </span>
                  <span className="text-emerald-700 font-semibold shrink-0">
                    {med.stockText || `${med.stock} pcs`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-300">
                    {med.fefoTag || `FEFO • ${med.expiry}`}
                  </span>
                  <div className="text-right flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      ৳ {med.price.toFixed(2)}/{med.unitType === 'bottle' ? 'btl' : med.unitType === 'capsule' ? 'cap' : 'pc'}
                    </span>
                    <span className="text-[9px] bg-pharma-50 group-hover:bg-pharma-700 group-hover:text-white text-pharma-700 px-1.5 py-0.5 rounded border border-pharma-300 font-bold transition-colors">
                      + Dispense
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. Quick Shelf Helper & DGDA Drug Batch Verification Box */}
      <div className="bg-white p-3 rounded border border-slate-300 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-teal-50 border border-teal-200 flex items-center justify-center text-pharma-700 font-bold">
                <span className="material-symbols-outlined text-[18px]">shelves</span>
              </div>
              <div>
                <span className="font-bold text-slate-800">Physical Rack Position Locator &amp; Generic Substitutes</span>
                <p className="text-slate-500 text-[11px]">
                  Selected Item Store:{' '}
                  <span className="font-mono font-semibold text-pharma-800">
                    {selectedMedForLocator
                      ? `Room A • Shelf ${selectedMedForLocator.shelf} • ${selectedMedForLocator.brandName}`
                      : 'Room A • Section Gastric • Row 2 • Shelf 03'}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">DGDA Validation Protocol</span>
                <span className="text-emerald-700 font-mono text-[11px] font-bold">● Batch &amp; MRP Compliant (Gazette 2024-25)</span>
              </div>
              <button
                type="button"
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">tune</span> Adjust Stock
              </button>
            </div>
          </div>

          {/* In-Stock Generic Substitutes Quick Comparison */}
          <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
            <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-900 font-bold font-sans">Seclo 20mg</span>{' '}
                <span className="text-[10px] text-slate-500">(Square)</span>
              </div>
              <div className="font-bold text-slate-800">
                ৳ 7.00 <span className="text-emerald-600 text-[10px]">210 in stock</span>
              </div>
            </div>
            <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-900 font-bold font-sans">Losectil 20mg</span>{' '}
                <span className="text-[10px] text-slate-500">(SK+F)</span>
              </div>
              <div className="font-bold text-slate-800">
                ৳ 7.00 <span className="text-emerald-600 text-[10px]">140 in stock</span>
              </div>
            </div>
            <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-900 font-bold font-sans">Proceptin 20</span>{' '}
                <span className="text-[10px] text-slate-500">(Beximco)</span>
              </div>
              <div className="font-bold text-slate-800">
                ৳ 6.50 <span className="text-emerald-600 text-[10px]">85 in stock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicineGrid
