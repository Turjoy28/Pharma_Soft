function CartSummary({
  subtotal = 243.00,
  discountPercent = 5,
  onDiscountChange,
  discountAmount = 12.15,
  roundingAmount = 0.15,
  totalPayable = 231.00,
}) {
  return (
    <div className="space-y-2">
      {/* Financial Line Items */}
      <div className="space-y-1 text-xs border-b border-slate-200 pb-2">
        <div className="flex justify-between text-slate-600">
          <span>Gross Items Subtotal:</span>
          <span className="font-mono font-semibold text-slate-800">৳ {Number(subtotal).toFixed(2)}</span>
        </div>

        {/* Discount Selector */}
        <div className="flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-1.5">
            <span>Trade Discount:</span>
            {[0, 5, 10].map((pct) => (
              <button
                key={pct}
                onClick={() => onDiscountChange && onDiscountChange(pct)}
                className={`px-1.5 py-0.5 text-[10px] rounded border transition-colors ${
                  discountPercent === pct
                    ? 'border-pharma-700 bg-pharma-700 text-white font-bold'
                    : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
          <span className="font-mono font-semibold text-rose-600">
            -৳ {Number(discountAmount).toFixed(2)}
          </span>
        </div>

        {/* DGDA VAT Exemption */}
        <div className="flex justify-between text-slate-600">
          <span className="flex items-center gap-1">
            <span>DGDA Govt VAT / Tax:</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-300 px-1 rounded font-semibold">
              0% Essential Drugs Exempt
            </span>
          </span>
          <span className="font-mono text-slate-800">৳ 0.00</span>
        </div>

        {/* Rounding Adjustment */}
        <div className="flex justify-between text-slate-600 text-[11px]">
          <span>Rounding Adjustment (পয়সা):</span>
          <span className="font-mono text-slate-500">
            {roundingAmount >= 0 ? `+৳ ${Number(roundingAmount).toFixed(2)}` : `-৳ ${Math.abs(roundingAmount).toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Highlighted Total Payable Box */}
      <div className="flex items-center justify-between bg-pharma-50 p-2.5 rounded border border-teal-300">
        <div>
          <span className="text-xs font-bold text-pharma-900 uppercase tracking-wide block">
            মোট প্রদেয় / TOTAL PAYABLE
          </span>
          <span className="text-[10px] text-teal-700 font-medium">Inclusive of all DGDA pharma taxes</span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black font-mono text-pharma-800">
            ৳ {Number(totalPayable).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default CartSummary
