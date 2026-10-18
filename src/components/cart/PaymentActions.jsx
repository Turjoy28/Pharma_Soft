function PaymentActions({ totalPayable = '0.00', onSelectPayment, onHold, onSettle }) {
  return (
    <div className="space-y-2 pt-1">
      {/* 3 Payment Methods (Cash, bKash/MFS, Card) */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => onSelectPayment && onSelectPayment('Cash')}
          className="p-2 rounded border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 flex flex-col items-center justify-center text-emerald-900 transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-emerald-700 text-[18px]">payments</span>
          <span className="text-xs font-bold mt-0.5">Cash [F6] — Settle</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPayment && onSelectPayment('bKash / Nagad')}
          className="p-2 rounded border border-pink-300 bg-pink-50 hover:bg-pink-100 flex flex-col items-center justify-center text-pink-900 transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-bkash"></span>
            <span className="text-xs font-extrabold text-bkash">bKash</span>
            <span className="text-[10px] font-bold text-slate-500">/ MFS</span>
          </div>
          <span className="text-[11px] font-bold mt-0.5 text-pink-950">Scan QR [F9]</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPayment && onSelectPayment('Card')}
          className="p-2 rounded border border-slate-300 bg-white hover:bg-slate-100 flex flex-col items-center justify-center text-slate-800 transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-blue-700 text-[18px]">credit_card</span>
          <span className="text-xs font-bold mt-0.5">Card POS [F8]</span>
        </button>
      </div>

      {/* Main Bottom Actions: Hold & Settle Drawer */}
      <div className="grid grid-cols-12 gap-2">
        <button
          type="button"
          onClick={onHold}
          className="col-span-4 py-2.5 px-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded border border-slate-300 flex items-center justify-center gap-1 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">pause_circle</span>
          <span>Hold [F4]</span>
        </button>

        <button
          type="button"
          onClick={onSettle}
          className="col-span-8 py-2.5 px-3 bg-pharma-700 hover:bg-pharma-800 active:bg-pharma-900 text-white text-xs font-bold tracking-wide rounded border border-pharma-900 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          <span>[F12] Collect ৳{totalPayable} &amp; Settle Drawer</span>
        </button>
      </div>
    </div>
  )
}

export default PaymentActions
