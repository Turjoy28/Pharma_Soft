import { useState } from 'react'
import CartHeader from './CartHeader'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import CashTender from './CashTender'
import PaymentActions from './PaymentActions'
import { calculateCartTotals, toPoisha } from '../../utils/money'

/**
 * Calculates adaptive fast cash tender presets based on the current total payable
 */
function calculateFastCash(total) {
  if (total <= 0) return [100, 200, 500, 1000]
  const exact = Math.round(total)
  const presets = [
    exact,
    Math.ceil(exact / 50) * 50,
    Math.ceil(exact / 100) * 100,
    exact <= 500 ? 500 : 1000,
    exact <= 1000 ? 1000 : 2000,
  ]
  return Array.from(new Set(presets))
    .filter((v) => v >= exact)
    .sort((a, b) => a - b)
    .slice(0, 5)
}

function Cart({
  activeTicket,
  catalog = [],
  discountPercent = 5,
  onDiscountChange,
  tenderAmount = 500,
  onTenderChange,
}) {
  // If no ticket is selected (e.g., initial load or empty queue), show a clean waiting prompt
  if (!activeTicket) {
    return (
      <div className="col-span-12 lg:col-span-5 xl:col-span-5 flex flex-col gap-2">
        <div className="bg-white rounded border border-slate-300 shadow-sm flex flex-col items-center justify-center h-[calc(100vh-140px)] min-h-[640px] p-8 text-center text-slate-500">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
            <span className="material-symbols-outlined text-3xl">receipt_long</span>
          </div>
          <h3 className="font-bold text-slate-700 text-sm">No Dispensing Ticket Loaded</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            Select a patient ticket from the queue on the left or scan a token barcode to load dispensed medicines into the checkout register.
          </p>
        </div>
      </div>
    )
  }

  // 1. Initialize cart state directly from Counter-1 dispensed items embedded in activeTicket
  const [cartItems, setCartItems] = useState(() => {
    if (activeTicket?.items && activeTicket.items.length > 0) {
      return activeTicket.items.map((item, idx) => ({
        ...item,
        serialNumber: idx + 1,
      }))
    }
    return []
  })

  // 2. Exact Financial Math via Integer Poisha Engine
  const totals = calculateCartTotals(cartItems, discountPercent)
  const fastCashOptions = calculateFastCash(totals.totalPayableTaka)

  // 3. Quantity & Item Handlers
  const handleIncrement = (id) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item))
    )
  }

  const handleDecrement = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.qty - 1
            return nextQty > 0 ? { ...item, qty: nextQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const handleRemove = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClear = () => {
    setCartItems([])
  }

  const handleReloadDefault = () => {
    if (activeTicket?.items && activeTicket.items.length > 0) {
      setCartItems(
        activeTicket.items.map((item, idx) => ({
          ...item,
          serialNumber: idx + 1,
        }))
      )
    } else {
      setCartItems([])
    }
  }

  const handleQuickAdd = (med) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.medId === med.id)
      if (existing) {
        return prev.map((item) =>
          item.medId === med.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [
        ...prev,
        {
          id: `item-${Date.now()}-${med.id}`,
          medId: med.id,
          brandName: `${med.brandName} ${med.generic.split(' ')[0] || ''}`.trim(),
          batch: med.batch,
          expiry: med.expiry,
          price: med.price,
          qty: 1,
        },
      ]
    })
  }

  return (
    <div className="col-span-12 lg:col-span-5 xl:col-span-5 flex flex-col gap-2">
      <div className="bg-white rounded border border-slate-300 shadow-sm flex flex-col h-[calc(100vh-140px)] min-h-[640px]">
        {/* 1. Cart Header & Patient Info */}
        <CartHeader
          ticketNumber={activeTicket.ticketNumber || `#${activeTicket.id}`}
          itemsCount={cartItems.length}
          patientName={
            activeTicket.patientName
              ? `${activeTicket.patientName} ${activeTicket.patientNote || ''}`
              : 'Walk-in Customer'
          }
          doctorName={activeTicket.doctor || 'No Prescription Attached'}
          onClearCart={handleClear}
        />

        {/* 2. Dense Spreadsheet Table Header */}
        <div className="bg-slate-100 border-b border-slate-300 px-3 py-1.5 grid grid-cols-12 text-[11px] font-bold text-slate-600 uppercase tracking-wider select-none font-mono">
          <div className="col-span-1">SL</div>
          <div className="col-span-5">Item &amp; Batch</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-right">Rate(৳)</div>
          <div className="col-span-2 text-right">Total(৳)</div>
        </div>

        {/* 3. Quick-Add from Medicines Catalog Ribbon */}
        {catalog.length > 0 && (
          <div className="bg-slate-50/80 px-2.5 py-1 border-b border-slate-200 flex items-center justify-between text-[11px] gap-1">
            <span className="font-semibold text-slate-600 flex items-center gap-1 shrink-0 text-[10px]">
              <span className="material-symbols-outlined text-[13px] text-pharma-700">medication</span>
              Quick-Add:
            </span>
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {catalog.map((med) => (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => handleQuickAdd(med)}
                  className="px-1.5 py-0.5 bg-white hover:bg-teal-50 hover:border-pharma-700 text-slate-700 hover:text-pharma-900 border border-slate-300 rounded font-mono font-medium text-[10px] whitespace-nowrap transition-colors flex items-center gap-0.5 cursor-pointer shadow-2xs"
                  title={`Add ${med.brandName} (${med.generic}) - ৳${med.price.toFixed(2)}`}
                >
                  <span className="text-pharma-700 font-bold">+</span>
                  <span>{med.brandName}</span>
                  <span className="text-slate-400">৳{med.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Cart Items List / Empty State */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">shopping_cart_off</span>
            <h3 className="font-bold text-slate-700 text-sm">Cart is Empty</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              All items removed from this ticket. Click any medicine above or reload Counter-1 dispensed items below.
            </p>
            <button
              type="button"
              onClick={handleReloadDefault}
              className="mt-3 px-3 py-1.5 bg-pharma-700 hover:bg-pharma-800 text-white font-bold rounded text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">refresh</span>
              Reload Ticket Medicines
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
            {cartItems.map((item, idx) => (
              <CartItem
                key={item.id}
                serialNumber={idx + 1}
                brandName={item.brandName}
                batch={item.batch}
                expiry={item.expiry}
                qty={item.qty}
                price={item.price}
                total={(toPoisha(item.price) * item.qty) / 100}
                onIncrement={() => handleIncrement(item.id)}
                onDecrement={() => handleDecrement(item.id)}
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </div>
        )}

        {/* 5. Bottom Financial Calculations & Settlement Area */}
        <div className="p-3 bg-slate-50 border-t border-slate-300 flex flex-col gap-2">
          {/* Summary (Subtotal, Discount, VAT, Rounding, Total) */}
          <CartSummary
            subtotal={totals.formatted.subtotal}
            discountPercent={discountPercent}
            onDiscountChange={onDiscountChange}
            discountAmount={totals.formatted.discount}
            roundingAmount={totals.formatted.rounding}
            totalPayable={totals.formatted.totalPayable}
          />

          {/* Cash Tender & Change Calculator */}
          <CashTender
            tenderAmount={tenderAmount}
            onTenderChange={onTenderChange}
            totalPayable={totals.totalPayableTaka}
            fastCashOptions={fastCashOptions}
          />

          {/* Payment Method Selector & Actions */}
          <PaymentActions totalPayable={totals.formatted.totalPayable} />
        </div>
      </div>
    </div>
  )
}

export default Cart
