import { useCounterStore } from '../../stores/useCounterStore.js'

function Header({ currentTime }) {
  const activeCounter = useCounterStore((s) => s.activeCounter)
  const setActiveCounter = useCounterStore((s) => s.setActiveCounter)
  const ticketsCount = useCounterStore((s) => s.tickets.length)
  const dispenseBasketCount = useCounterStore((s) => s.dispenseBasket.length)
  const patientInfo = useCounterStore((s) => s.patientInfo)

  const isC1 = activeCounter === 'counter1'

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
                DGDA Reg: 142/DHK/2019
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-teal-100 mt-1">
              <span className="font-medium text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-teal-300">storefront</span>
                Dhanmondi Branch - Store #02 | {isC1 ? 'Terminal 01 (Clinical Dispensing)' : 'Terminal 02 (Cashier Billing & POS)'}
              </span>
              <span>•</span>
              <span className="text-teal-200">
                {isC1 ? (
                  <>
                    Rx Token: <strong className="font-mono text-white">{patientInfo?.ticketToken || 'TK-1086'}</strong>
                  </>
                ) : (
                  <>
                    Receipt Series: <strong className="font-mono text-white">DP-DHN-2025-0842</strong>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Edge Engine Status & Counter Station Switcher [F1] */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-900/90 border border-emerald-500/50 text-emerald-100 text-xs shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold tracking-wide text-[11px] uppercase">Offline Edge Engine Active</span>
            <span className="text-emerald-300 font-mono text-[11px] font-semibold">• SQLite Local 100% Synced</span>
          </div>

          <div className="flex items-center bg-teal-950/80 p-0.5 rounded border border-teal-700/70 text-xs font-mono shadow-inner">
            <button
              type="button"
              onClick={() => setActiveCounter('counter1')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all cursor-pointer font-semibold ${
                isC1
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'text-teal-200 hover:text-white hover:bg-teal-900/60'
              }`}
              title="Switch to Counter 1 - Dispensing [F1]"
            >
              <span className="material-symbols-outlined text-[15px]">clinical_notes</span>
              <span>Counter 1: Dispense</span>
              {dispenseBasketCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 text-[10px] rounded-full font-bold">
                  {dispenseBasketCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveCounter('counter2')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all cursor-pointer font-semibold ${
                !isC1
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'text-teal-200 hover:text-white hover:bg-teal-900/60'
              }`}
              title="Switch to Counter 2 - Billing [F1]"
            >
              <span className="material-symbols-outlined text-[15px]">point_of_sale</span>
              <span>Counter 2: Billing</span>
              {ticketsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-teal-300 text-slate-900 text-[10px] rounded-full font-bold">
                  {ticketsCount}
                </span>
              )}
            </button>
          </div>

          <span className="text-[11px] font-mono text-teal-300 bg-teal-900/70 px-1.5 py-0.5 rounded border border-teal-700">
            [F1] Switch
          </span>
        </div>

        {/* Pharmacist / Cashier Info & Live Clock */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs text-white font-semibold">
              <span className="material-symbols-outlined text-[15px] text-teal-300">
                {isC1 ? 'badge' : 'person'}
              </span>
              <span>{isC1 ? 'Pharm. Tanvir Ahmed, B.Pharm' : 'Md. Rafiqul Islam'}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-teal-700 text-teal-100 rounded font-normal font-mono">
                {isC1 ? 'Reg: A-14928' : 'Cashier 02 - Morning Shift'}
              </span>
            </div>
            <div className="text-[11px] text-teal-200 flex items-center justify-end gap-2 font-mono mt-0.5">
              <span>{isC1 ? 'Terminal 01 (Dispensing)' : 'Terminal 02 (Cashier Desk)'}</span>
              <span>•</span>
              <span className="text-white font-bold">{currentTime || '23:21:55'} BST</span>
            </div>
          </div>
          <div className="flex items-center gap-1 border-l border-teal-700 pl-3">
            <button
              type="button"
              className="p-1.5 text-teal-100 hover:text-white hover:bg-pharma-700 rounded transition-colors text-xs flex items-center gap-1 border border-teal-600/50 cursor-pointer"
              title="Day Closing & Shift Summary"
            >
              <span className="material-symbols-outlined text-[17px]">calculate</span>
              <span className="hidden sm:inline text-[11px]">Shift End</span>
            </button>
            <button
              type="button"
              className="p-1.5 text-teal-100 hover:text-white hover:bg-pharma-700 rounded transition-colors cursor-pointer"
              title="Lock Terminal"
            >
              <span className="material-symbols-outlined text-[17px]">lock</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
