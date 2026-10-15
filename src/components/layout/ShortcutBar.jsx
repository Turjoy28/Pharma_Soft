function ShortcutBar() {
  return (
    <div className="bg-white border-b border-slate-300 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
      {/* Node & Station Status */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-300 font-semibold font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-teal-700"></span>Current Station: Counter 2 - Billing &amp; Settlement
        </span>
        <span className="text-slate-300">|</span>
        <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
          <span className="material-symbols-outlined text-[16px] text-pharma-700">lan</span> Local Node: <strong className="text-slate-800 font-mono">REG-04 (LAN 127.0.0.1:8080)</strong>
        </span>
        <span className="text-slate-300">|</span>
        <span className="inline-flex items-center gap-1 text-slate-600">
          <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span> DGDA MRP Compliant: <span className="font-mono text-emerald-700 font-semibold">Gazette 2024-25</span>
        </span>
        <span className="text-slate-300">|</span>
        <span className="inline-flex items-center gap-1 text-slate-600">
          <span className="material-symbols-outlined text-[15px] text-amber-600">notifications_active</span> Expiry Alert: <span className="text-amber-800 font-medium">3 items expiring &lt;60 days</span>
        </span>
      </div>

      {/* POS Function Keys Shortcuts */}
      <div className="flex items-center gap-1.5 font-mono text-xs">
        <span className="bg-slate-100 border border-slate-300 px-2 py-1 rounded text-slate-700"><strong className="text-pharma-700">[F2]</strong> Search Ticket</span>
        <span className="bg-slate-100 border border-slate-300 px-2 py-1 rounded text-slate-700"><strong className="text-pharma-700">[F3]</strong> Customer</span>
        <span className="bg-slate-100 border border-slate-300 px-2 py-1 rounded text-slate-700"><strong className="text-pharma-700">[F4]</strong> Hold/Recall</span>
        <span className="bg-emerald-50 border border-emerald-300 px-2 py-1 rounded text-emerald-800 font-semibold"><strong className="text-emerald-700">[F6]</strong> Cash</span>
        <span className="bg-blue-50 border border-blue-200 px-2 py-1 rounded text-blue-800 font-semibold"><strong className="text-blue-700">[F8]</strong> Card</span>
        <span className="bg-pink-50 border border-pink-300 px-2 py-1 rounded text-pink-900 font-semibold"><strong className="text-bkash">[F9]</strong> bKash/MFS</span>
        <span className="bg-pharma-700 text-white px-2 py-1 rounded font-bold shadow-xs"><strong className="text-yellow-300">[F12]</strong> Settle &amp; Open Drawer</span>
      </div>
    </div>
  )
}

export default ShortcutBar
