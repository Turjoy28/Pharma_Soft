function CartHeader({
  ticketNumber = '#TK-0000',
  itemsCount = 0,
  patientName = 'Walk-in Customer',
  doctorName = 'No Prescription Attached',
  onClearCart,
}) {
  return (
    <div className="p-3 bg-slate-50 border-b border-slate-300 rounded-t flex flex-col gap-2">
      {/* Title & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-pharma-700 text-[20px]">receipt_long</span>
          <div>
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span>Billing Ticket {ticketNumber}</span>
              <span className="px-1.5 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-mono font-semibold rounded border border-teal-300">
                Cashier Checkout
              </span>
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-pharma-100 text-pharma-800 border border-pharma-300">
            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClearCart}
            className="text-slate-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 text-xs font-medium flex items-center gap-0.5 transition-colors cursor-pointer"
            title="Clear Bill"
          >
            <span className="material-symbols-outlined text-[15px]">delete_sweep</span> Clear
          </button>
        </div>
      </div>

      {/* Patient & Doctor Inputs */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="relative">
          <input
            className="w-full text-xs py-1 px-2.5 rounded bg-white border border-slate-300 text-slate-800 font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-pharma-700"
            readOnly
            type="text"
            value={patientName}
          />
        </div>
        <div className="relative">
          <input
            className="w-full text-xs py-1 px-2.5 rounded bg-white border border-slate-300 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-pharma-700"
            readOnly
            type="text"
            value={doctorName}
          />
        </div>
      </div>
    </div>
  )
}

export default CartHeader
