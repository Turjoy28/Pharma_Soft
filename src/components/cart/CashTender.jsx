function CashTender({
  tenderAmount = 500,
  onTenderChange,
  totalPayable = 231,
  fastCashOptions = [231, 250, 300, 500, 1000],
}) {
  const changeReturn = Math.max(0, tenderAmount - totalPayable)

  return (
    <div className="p-2 bg-white rounded border border-slate-300 flex flex-col gap-1.5">
      {/* Header & Fast Presets */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-teal-700">payments</span> Fast Cash Tender (নগদ গ্রহণ):
        </span>
        <div className="flex items-center gap-1 font-mono text-[11px]">
          {fastCashOptions.map((amt) => (
            <button
              key={amt}
              onClick={() => onTenderChange && onTenderChange(amt)}
              className={`px-1.5 py-0.5 rounded border font-bold transition-colors ${
                tenderAmount === amt
                  ? 'bg-teal-100 border-teal-300 text-teal-900'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
              }`}
            >
              ৳{amt}
            </button>
          ))}
        </div>
      </div>

      {/* Tendered Input & Change Return */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-mono">Tendered:</span>
          <div className="relative">
            <span className="absolute left-2 top-1 font-mono font-bold text-slate-400">৳</span>
            <input
              className="w-24 pl-5 pr-2 py-0.5 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-pharma-700"
              type="number"
              value={tenderAmount}
              onChange={(e) => onTenderChange && onTenderChange(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded">
          <span className="text-[11px] font-bold text-emerald-800 uppercase">CHANGE RETURN (ফেরত):</span>
          <span className="font-mono font-black text-sm text-emerald-700">
            ৳ {changeReturn.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default CashTender
