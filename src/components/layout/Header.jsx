function Header({ currentTime }) {
  return (
    <header className="bg-pharma-800 text-white border-b-2 border-pharma-900 shadow-sm sticky top-0 z-40 select-none">
      <div className="px-4 py-2 flex items-center justify-between gap-4">
        {/* Brand & Store Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-white text-pharma-800 font-extrabold flex items-center justify-center border border-teal-200 shadow-inner">
            <span className="material-symbols-outlined text-[26px] text-pharma-700">local_pharmacy</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
                <span className="font-bold">ঢাকা ফার্মা</span>
                <span className="text-xs text-teal-200 font-normal">|</span>
                <span className="text-teal-50 font-semibold tracking-normal text-sm">Dhaka Pharma Ltd.</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-900 text-teal-200 border border-teal-700 uppercase">
                DGDA Reg: DA-DHK-2022-09418
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-teal-100 mt-1">
              <span className="font-medium text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-teal-300">storefront</span>
                Dhanmondi Branch - Store #02 | Terminal 02 <strong className="text-white font-bold">(Cashier Billing &amp; POS)</strong>
              </span>
              <span>•</span>
              <span className="text-teal-200">
                Receipt Series: <strong className="font-mono text-white">DP-DHN-2025-0842</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Sync Status & Navigation */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-900/90 border border-emerald-500/50 text-emerald-100 text-xs shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold tracking-wide text-[11px] uppercase">Offline Edge Engine Active</span>
            <span className="text-emerald-300 font-mono text-[11px] font-semibold">• SQLite Local 100% Synced</span>
          </div>
          <div className="flex items-center gap-1 bg-pharma-900/70 border border-teal-700/60 rounded p-1">
            <button className="px-2 py-0.5 rounded bg-teal-700 hover:bg-pharma-700 text-white font-mono text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">swap_horiz</span> Counter 1 [F1]
            </button>
            <button className="px-2 py-0.5 rounded bg-pharma-900/70 hover:bg-pharma-700 text-teal-200 font-mono text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">dashboard</span> Store Dashboard
            </button>
          </div>
        </div>

        {/* Cashier Info & Live Clock */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs text-white font-semibold">
              <span className="material-symbols-outlined text-[15px] text-teal-300">person</span>
              <span>Md. Rafiqul Islam</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-teal-700 text-teal-100 rounded font-normal font-mono">
                Cashier 02 - Morning Shift
              </span>
            </div>
            <div className="text-[11px] text-teal-200 flex items-center justify-end gap-2 font-mono mt-0.5">
              <span>BST (Dhaka Standard Time)</span>
              <span>•</span>
              <span className="text-white font-bold">{currentTime || '23:21:55'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 border-l border-teal-700 pl-3">
            <button className="p-1.5 text-teal-100 hover:text-white hover:bg-pharma-700 rounded transition-colors text-xs flex items-center gap-1 border border-teal-600/50" title="Day Closing &amp; Shift Summary">
              <span className="material-symbols-outlined text-[17px]">calculate</span>
              <span className="hidden sm:inline text-[11px]">Shift End</span>
            </button>
            <button className="p-1.5 text-teal-100 hover:text-white hover:bg-pharma-700 rounded transition-colors" title="Lock Terminal">
              <span className="material-symbols-outlined text-[17px]">lock</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
