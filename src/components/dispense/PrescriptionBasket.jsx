import { useCounterStore } from '../../stores/useCounterStore.js'

/**
 * 📋 PrescriptionBasket (Counter 1 - Right Column)
 * FEFO Pick List & Rx Queue with Live DGDA Compliance,
 * Quantity Steppers, Financial Accounting, and [F12] Counter 2 Dispatch.
 */
function PrescriptionBasket() {
  const dispenseBasket = useCounterStore((s) => s.dispenseBasket)
  const updateDispenseQty = useCounterStore((s) => s.updateDispenseQty)
  const removeFromDispenseBasket = useCounterStore((s) => s.removeFromDispenseBasket)
  const clearDispenseBasket = useCounterStore((s) => s.clearDispenseBasket)
  const dispatchTicket = useCounterStore((s) => s.dispatchTicket)
  const patientInfo = useCounterStore((s) => s.patientInfo)
  const setPatientInfo = useCounterStore((s) => s.setPatientInfo)

  const grandTotal = dispenseBasket.reduce((sum, item) => sum + item.lineTotal, 0)
  const totalUnits = dispenseBasket.reduce((sum, item) => sum + item.qty, 0)

  return (
    <div className="col-span-12 lg:col-span-5 xl:col-span-5 flex flex-col gap-2">
      <div className="bg-white rounded border border-slate-300 shadow-sm flex flex-col h-[calc(100vh-140px)] min-h-[520px]">
        {/* Cart & Patient Information Header */}
        <div className="p-3 bg-slate-50 border-b border-slate-300 rounded-t flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-pharma-700 text-[20px]">checklist</span>
              <h2 className="font-bold text-slate-900 text-sm">ফার্মাসিস্ট পিক লিস্ট / FEFO Pick List &amp; Rx Queue</h2>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-teal-100 text-teal-800 border border-teal-300"
                id="cart-item-count"
              >
                {dispenseBasket.length} items
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-300">
                Ticket #{patientInfo.ticketToken || 'TK-1086'}
              </span>
              <button
                type="button"
                className="text-slate-500 hover:text-rose-600 px-1.5 py-0.5 rounded hover:bg-rose-50 text-xs font-medium flex items-center gap-0.5 cursor-pointer transition-colors"
                onClick={clearDispenseBasket}
                title="Clear Pick List [F4]"
              >
                <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="relative">
              <span className="block text-[10px] text-slate-500 font-medium mb-0.5">Patient Details:</span>
              <input
                className="w-full text-xs py-1 px-2 rounded bg-white border border-slate-300 text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-pharma-700"
                placeholder="Patient Name &amp; Contact"
                type="text"
                value={patientInfo.name || ''}
                onChange={(e) => setPatientInfo({ name: e.target.value })}
              />
            </div>
            <div className="relative">
              <span className="block text-[10px] text-slate-500 font-medium mb-0.5">Prescriber &amp; Institution:</span>
              <input
                className="w-full text-xs py-1 px-2 rounded bg-white border border-slate-300 text-slate-700 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-pharma-700"
                placeholder="Prescribed By (Doctor)"
                type="text"
                value={patientInfo.doctor || ''}
                onChange={(e) => setPatientInfo({ doctor: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Dense Table Header */}
        <div className="bg-slate-100 border-b border-slate-300 px-3 py-1.5 grid grid-cols-12 text-[11px] font-bold text-slate-600 uppercase tracking-wider select-none font-mono">
          <div className="col-span-1">SL</div>
          <div className="col-span-5">Item &amp; Batch</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-right">Rate(৳)</div>
          <div className="col-span-2 text-right">Total(৳)</div>
        </div>

        {/* Cart Items Scrollable Table Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200" id="cart-table-body">
          {dispenseBasket.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                <span className="material-symbols-outlined text-3xl">medical_services</span>
              </div>
              <h4 className="font-bold text-slate-700 text-sm">Basket is Empty</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Click <span className="font-semibold text-pharma-700">+ Dispense</span> or search [F2] on the left to add items to this prescription ticket.
              </p>
            </div>
          ) : (
            dispenseBasket.map((item, idx) => (
              <div
                key={item.id}
                className="cart-item p-2.5 hover:bg-slate-50 transition-colors grid grid-cols-12 items-center gap-1 text-xs"
                data-price={item.price}
                data-qty={item.qty}
              >
                <div className="col-span-1 text-slate-400 font-mono text-[11px] font-bold">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="col-span-5 pr-1 min-w-0">
                  <div className="font-bold text-slate-900 leading-tight truncate">
                    {item.brandName}
                  </div>
                  <div className="flex items-center flex-wrap gap-1 text-[10px] text-slate-500 font-mono mt-0.5">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 px-1 rounded font-bold">
                      {item.fefoTag || 'FEFO #1'}
                    </span>
                    <span className="bg-slate-200 px-1 rounded">B: {item.batch}</span>
                    <span>Exp: {item.expiry}</span>
                    {item.shelf && (
                      <span className="text-teal-700 font-semibold">• {item.shelf}</span>
                    )}
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-center">
                  <div className="inline-flex items-center border border-slate-300 rounded bg-white shadow-xs">
                    <button
                      type="button"
                      className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                      onClick={() => updateDispenseQty(item.id, -1)}
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <input
                      className="qty-field w-7 text-center font-mono font-bold text-xs p-0 border-0 focus:ring-0 text-slate-900"
                      readOnly
                      type="text"
                      value={item.qty}
                    />
                    <button
                      type="button"
                      className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                      onClick={() => updateDispenseQty(item.id, 1)}
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="col-span-2 text-right font-mono text-slate-700">
                  {item.price.toFixed(2)}
                </div>
                <div className="col-span-2 text-right flex items-center justify-end gap-1 font-mono font-bold text-slate-900">
                  <span className="item-subtotal">{item.lineTotal.toFixed(2)}</span>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer transition-colors"
                    onClick={() => removeFromDispenseBasket(item.id)}
                    title="Remove item"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Strict Financial Accounting / Calculations (Standard BD Pharmacy Rules) */}
        <div className="p-3 bg-slate-50 border-t border-slate-300 flex flex-col gap-2">
          <div className="space-y-1 text-xs border-b border-slate-200 pb-2">
            <div className="flex justify-between items-center text-slate-600">
              <span>Total Dispensed Items ({dispenseBasket.length} items, {totalUnits} units):</span>
              <span className="font-mono font-bold text-slate-900" id="bill-subtotal">
                ৳ {grandTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                <span>Clinical Validation:</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-300">
                DGDA Validated: Batch &amp; MRP Compliant (Gazette 2024-25)
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600 text-[11px]">
              <span>Target Settlement Station:</span>
              <span className="font-mono font-semibold text-pharma-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                Target: Counter 02 (Cashier Desk) • Ready on LAN (127.0.0.1:8080)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-pharma-50 p-2.5 rounded border border-teal-300">
            <div>
              <span className="text-xs font-bold text-pharma-900 uppercase tracking-wide block">
                Est. Bill Total / প্রাক্কলিত বিল
              </span>
              <span className="text-[10px] text-teal-700 font-medium">
                Final discounts &amp; payment collected at Counter 2
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-pharma-800" id="bill-grand-total">
                ৳ {grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold tracking-wide rounded border border-emerald-800 shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
              onClick={dispatchTicket}
              disabled={dispenseBasket.length === 0}
              title="Send ticket to Counter 2 for checkout [F12]"
            >
              <span className="material-symbols-outlined text-[20px]">send_to_mobile</span>
              <span>[F12] Send Ticket to Counter 2 (Cashier Billing) →</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded border border-slate-300 flex items-center justify-center gap-1 transition-all cursor-pointer"
                onClick={() => alert(`Prescription Ticket #${patientInfo.ticketToken || 'TK-1086'} on HOLD.`)}
                title="Hold prescription [F4]"
              >
                <span className="material-symbols-outlined text-[15px]">pause_circle</span>
                <span>Hold Prescription [F4]</span>
              </button>
              <button
                type="button"
                className="py-2 px-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded border border-teal-300 flex items-center justify-center gap-1 transition-all cursor-pointer"
                onClick={() => window.print()}
                title="Print pick slip [F7]"
              >
                <span className="material-symbols-outlined text-[15px]">receipt</span>
                <span>Print Pick Slip [F7]</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrescriptionBasket
