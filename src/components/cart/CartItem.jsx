function CartItem({
  serialNumber,
  brandName,
  batch,
  expiry,
  qty,
  price,
  total,
  onIncrement,
  onDecrement,
  onRemove,
}) {
  return (
    <div className="p-2.5 hover:bg-slate-50 transition-colors grid grid-cols-12 items-center gap-1 text-xs">
      {/* SL */}
      <div className="col-span-1 text-slate-400 font-mono text-[11px] font-bold">
        {String(serialNumber).padStart(2, '0')}
      </div>

      {/* Item & Batch Info */}
      <div className="col-span-5 pr-1">
        <div className="font-bold text-slate-900 leading-tight truncate">{brandName}</div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-0.5">
          <span className="bg-slate-200 px-1 rounded">B: {batch}</span>
          <span>Exp: {expiry}</span>
        </div>
      </div>

      {/* Qty +/- stepper */}
      <div className="col-span-2 flex items-center justify-center">
        <div className="inline-flex items-center border border-slate-300 rounded bg-white shadow-xs">
          <button
            type="button"
            onClick={onDecrement}
            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 font-bold text-xs cursor-pointer select-none"
            title="Decrease Quantity"
          >
            -
          </button>
          <input
            className="w-7 text-center font-mono font-bold text-xs p-0 border-0 focus:ring-0 text-slate-900"
            readOnly
            type="text"
            value={qty}
          />
          <button
            type="button"
            onClick={onIncrement}
            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 font-bold text-xs cursor-pointer select-none"
            title="Increase Quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Unit Rate */}
      <div className="col-span-2 text-right font-mono text-slate-700">
        {Number(price).toFixed(2)}
      </div>

      {/* Total & Delete Button */}
      <div className="col-span-2 text-right flex items-center justify-end gap-1 font-mono font-bold text-slate-900">
        <span>{Number(total).toFixed(2)}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-slate-400 hover:text-rose-600 ml-1 transition-colors cursor-pointer"
          title="Remove Item"
        >
          <span className="material-symbols-outlined text-[15px]">close</span>
        </button>
      </div>
    </div>
  )
}

export default CartItem
