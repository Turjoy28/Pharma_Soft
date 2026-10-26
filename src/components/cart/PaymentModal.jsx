import { useState, useId } from 'react'
import { toPoisha, formatTaka, calculateCartTotals } from '../../utils/money.js'
import { useCounterStore } from '../../stores/useCounterStore.js'

function PaymentModal() {
  const cashAmountId = useId()
  const cashTenderId = useId()
  const bkashAmountId = useId()
  const bkashRefId = useId()
  const cardAmountId = useId()
  const cardRefId = useId()

  // 🏪 Direct Zustand Subscriptions
  const isOpen = useCounterStore((s) => s.isPaymentOpen)
  const onClose = useCounterStore((s) => s.closePayment)
  const initialMethod = useCounterStore((s) => s.activePaymentMethod)
  const onConfirmPayment = useCounterStore((s) => s.confirmPayment)
  const isSubmitting = useCounterStore((s) => s.isSubmittingPayment)
  const cartItems = useCounterStore((s) => s.cartItems)
  const discountPercent = useCounterStore((s) => s.discountPercent)
  const activeTicket = useCounterStore((s) => s.selectedTicket)

  // 🧮 Pure Calculation
  const totals = calculateCartTotals(cartItems, discountPercent)
  const payablePoisha = totals.totalPayablePoisha
  const payableTaka = totals.totalPayableTaka

  // 1. Payment Allocations (State initialized directly on mount via key reset)
  const [cashAmount, setCashAmount] = useState(() =>
    initialMethod === 'Cash' ? String(payableTaka) : ''
  )
  const [cashTender, setCashTender] = useState(() =>
    initialMethod === 'Cash'
      ? String(payableTaka <= 500 ? 500 : Math.ceil(payableTaka / 100) * 100)
      : ''
  )
  const [bkashAmount, setBkashAmount] = useState(() =>
    initialMethod === 'bKash / Nagad' ? String(payableTaka) : ''
  )
  const [bkashRef, setBkashRef] = useState('')
  const [cardAmount, setCardAmount] = useState(() =>
    initialMethod === 'Card' ? String(payableTaka) : ''
  )
  const [cardRef, setCardRef] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  // 2. Exact Integer Poisha Accounting
  const cashAllocatedPoisha = toPoisha(cashAmount)
  const cashTenderPoisha = toPoisha(cashTender)
  const bkashAllocatedPoisha = toPoisha(bkashAmount)
  const cardAllocatedPoisha = toPoisha(cardAmount)

  const totalAllocatedPoisha = cashAllocatedPoisha + bkashAllocatedPoisha + cardAllocatedPoisha
  const remainderPoisha = payablePoisha - totalAllocatedPoisha
  const changePoisha = Math.max(0, cashTenderPoisha - cashAllocatedPoisha)

  // 3. Helper to auto-fill remainder into a method
  const handleFillRemainder = (method) => {
    const currentOthers =
      (method === 'Cash' ? 0 : cashAllocatedPoisha) +
      (method === 'bKash' ? 0 : bkashAllocatedPoisha) +
      (method === 'Card' ? 0 : cardAllocatedPoisha)
    const neededPoisha = Math.max(0, payablePoisha - currentOthers)
    const neededTaka = (neededPoisha / 100).toFixed(0)

    if (method === 'Cash') {
      setCashAmount(neededTaka)
      if (Number(cashTender) < Number(neededTaka)) {
        setCashTender(neededTaka)
      }
    } else if (method === 'bKash') {
      setBkashAmount(neededTaka)
    } else if (method === 'Card') {
      setCardAmount(neededTaka)
    }
  }

  // 4. Submission Handler
  const handleFinalize = () => {
    if (remainderPoisha !== 0) {
      setErrorMsg(`Payment incomplete. Remaining unpaid balance: ৳${formatTaka(remainderPoisha)}`)
      return
    }
    if (cashAllocatedPoisha > 0 && cashTenderPoisha < cashAllocatedPoisha) {
      setErrorMsg('Cash tender received cannot be less than the cash portion.')
      return
    }

    const paymentsList = []
    if (cashAllocatedPoisha > 0) {
      paymentsList.push({
        method: 'Cash',
        amountPoisha: cashAllocatedPoisha,
        amountTaka: formatTaka(cashAllocatedPoisha),
        tenderPoisha: cashTenderPoisha,
        tenderTaka: formatTaka(cashTenderPoisha),
        changePoisha,
        changeTaka: formatTaka(changePoisha),
      })
    }
    if (bkashAllocatedPoisha > 0) {
      paymentsList.push({
        method: 'bKash / Nagad',
        amountPoisha: bkashAllocatedPoisha,
        amountTaka: formatTaka(bkashAllocatedPoisha),
        trxId: bkashRef || `TXN${Date.now().toString().slice(-8)}`,
      })
    }
    if (cardAllocatedPoisha > 0) {
      paymentsList.push({
        method: 'Card POS',
        amountPoisha: cardAllocatedPoisha,
        amountTaka: formatTaka(cardAllocatedPoisha),
        authCode: cardRef || `AUTH-${Math.floor(1000 + Math.random() * 9000)}`,
      })
    }

    onConfirmPayment({
      payments: paymentsList,
      subtotalPoisha: totals.subtotalPoisha,
      discountPoisha: totals.discountPoisha,
      roundingPoisha: totals.roundingPoisha,
      totalPayablePoisha: totals.totalPayablePoisha,
      changePoisha,
      items: cartItems,
      patientName: activeTicket?.patientName,
      doctorName: activeTicket?.doctor,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-teal-400 text-[24px]">point_of_sale</span>
            <div>
              <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                <span>Collect Payment &amp; Settle Sale</span>
                <span className="bg-teal-900/80 text-teal-300 text-[11px] px-2 py-0.5 rounded font-mono border border-teal-700/50">
                  {activeTicket?.ticketNumber || `#${activeTicket?.id}`}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Patient: <span className="text-slate-200">{activeTicket?.patientName || 'Walk-in'}</span> • Counter 2 (Cashier)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-slate-800"
            title="Close [Esc]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Total Payable Prominent Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-slate-500 font-mono tracking-wider">Net Amount Payable</span>
              <div className="text-2xl font-black text-slate-900 font-mono flex items-baseline gap-1 mt-0.5">
                <span className="text-pharma-700 font-sans">৳</span>
                <span>{totals.formatted.totalPayable}</span>
                <span className="text-[11px] font-normal text-slate-500 ml-1">
                  ({(payablePoisha / 100).toFixed(2)} Taka)
                </span>
              </div>
            </div>

            {/* Invariant Balance Status */}
            <div className="text-right">
              {remainderPoisha === 0 ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full text-xs font-bold font-mono">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                  Exact Total Allocated
                </div>
              ) : remainderPoisha > 0 ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-xs font-bold font-mono animate-pulse">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">warning</span>
                  Due Remainder: ৳{formatTaka(remainderPoisha)}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 border border-red-300 text-red-800 rounded-full text-xs font-bold font-mono">
                  <span className="material-symbols-outlined text-[16px] text-red-600">error</span>
                  Overpaid by: ৳{formatTaka(Math.abs(remainderPoisha))}
                </div>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-2.5 rounded text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Split Payment Tenders (3 Methods) */}
          <div className="border border-slate-200 rounded-lg p-3 space-y-3 bg-white">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-pharma-700">call_split</span>
                Payment Methods &amp; Split Tender (Day 8 Rule)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Cash + MFS + Card = ৳{totals.formatted.totalPayable}
              </span>
            </div>

            {/* Tender 1: Physical Cash */}
            <div className={`p-3 rounded border transition-colors ${Number(cashAmount) > 0 ? 'bg-emerald-50/60 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-700 text-[18px]">payments</span>
                  <span className="text-xs font-bold text-slate-800">1. Physical Cash (Drawer)</span>
                  <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-mono text-slate-600">F6</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleFillRemainder('Cash')}
                  className="text-[11px] text-pharma-700 hover:text-pharma-900 font-semibold cursor-pointer underline decoration-dotted"
                >
                  Fill Remainder
                </button>
              </div>

              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-6">
                  <label htmlFor={cashAmountId} className="block text-[11px] text-slate-600 font-medium mb-1">
                    Bill Cash Portion (৳)
                  </label>
                  <input
                    id={cashAmountId}
                    type="number"
                    min="0"
                    step="1"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-sm font-mono font-bold text-slate-900 focus:ring-1 focus:ring-pharma-700 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div className="col-span-6">
                  <label htmlFor={cashTenderId} className="block text-[11px] text-slate-600 font-medium mb-1">
                    Cash Tender Received (৳)
                  </label>
                  <input
                    id={cashTenderId}
                    type="number"
                    min="0"
                    step="1"
                    value={cashTender}
                    onChange={(e) => setCashTender(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-sm font-mono font-bold text-slate-900 focus:ring-1 focus:ring-pharma-700 focus:outline-none"
                    placeholder="500"
                  />
                </div>
              </div>

              {/* Fast Cash Presets & Change */}
              <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-mono">Fast Tender:</span>
                  {[payableTaka, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCashTender(String(preset))}
                      className="px-1.5 py-0.5 bg-white hover:bg-slate-100 border border-slate-300 rounded font-mono text-[10px] text-slate-700 cursor-pointer shadow-2xs"
                    >
                      ৳{preset}
                    </button>
                  ))}
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-600 font-mono">Change to Return: </span>
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    ৳{formatTaka(changePoisha)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tender 2: bKash / Nagad (MFS) */}
            <div className={`p-3 rounded border transition-colors ${Number(bkashAmount) > 0 ? 'bg-pink-50/60 border-pink-300' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-bkash"></span>
                  <span className="text-xs font-bold text-slate-800">2. bKash / Nagad / Rocket (MFS QR)</span>
                  <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-mono text-slate-600">F9</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleFillRemainder('bKash')}
                  className="text-[11px] text-pink-700 hover:text-pink-900 font-semibold cursor-pointer underline decoration-dotted"
                >
                  Fill Remainder
                </button>
              </div>

              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-6">
                  <label htmlFor={bkashAmountId} className="block text-[11px] text-slate-600 font-medium mb-1">
                    MFS Amount (৳)
                  </label>
                  <input
                    id={bkashAmountId}
                    type="number"
                    min="0"
                    step="1"
                    value={bkashAmount}
                    onChange={(e) => setBkashAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-sm font-mono font-bold text-slate-900 focus:ring-1 focus:ring-pink-600 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div className="col-span-6">
                  <label htmlFor={bkashRefId} className="block text-[11px] text-slate-600 font-medium mb-1">
                    Transaction ID (TrxID)
                  </label>
                  <input
                    id={bkashRefId}
                    type="text"
                    value={bkashRef}
                    onChange={(e) => setBkashRef(e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono text-slate-800 uppercase focus:ring-1 focus:ring-pink-600 focus:outline-none"
                    placeholder="e.g. 9K48X9P1L"
                  />
                </div>
              </div>
            </div>

            {/* Tender 3: Card POS */}
            <div className={`p-3 rounded border transition-colors ${Number(cardAmount) > 0 ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-700 text-[18px]">credit_card</span>
                  <span className="text-xs font-bold text-slate-800">3. Card Terminal (Debit / Credit POS)</span>
                  <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-mono text-slate-600">F8</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleFillRemainder('Card')}
                  className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold cursor-pointer underline decoration-dotted"
                >
                  Fill Remainder
                </button>
              </div>

              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-6">
                  <label htmlFor={cardAmountId} className="block text-[11px] text-slate-600 font-medium mb-1">
                    Card Amount (৳)
                  </label>
                  <input
                    id={cardAmountId}
                    type="number"
                    min="0"
                    step="1"
                    value={cardAmount}
                    onChange={(e) => setCardAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-sm font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div className="col-span-6">
                  <label htmlFor={cardRefId} className="block text-[11px] text-slate-600 font-medium mb-1">
                    Card Slip / Auth Code
                  </label>
                  <input
                    id={cardRefId}
                    type="text"
                    value={cardRef}
                    onChange={(e) => setCardRef(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    placeholder="e.g. Visa *4910 / Auth 8941"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="bg-slate-100 border-t border-slate-300 px-5 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-bold transition-colors cursor-pointer"
          >
            [Esc] Back to Cart
          </button>

          <button
            type="button"
            onClick={handleFinalize}
            disabled={remainderPoisha !== 0 || isSubmitting}
            className={`px-5 py-2.5 rounded text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              remainderPoisha === 0 && !isSubmitting
                ? 'bg-pharma-700 hover:bg-pharma-800 text-white border border-pharma-900'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                <span>Finalizing Sale...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Complete Sale &amp; Print 80mm Memo [Enter]</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
