import { useCounterStore } from '../../stores/useCounterStore.js'

function Footer() {
  const activeCounter = useCounterStore((s) => s.activeCounter)
  const isC1 = activeCounter === 'counter1'

  return (
    <footer className="bg-white border-t border-slate-300 px-4 py-1.5 text-xs text-slate-600 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Hardware Peripheral Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="font-medium text-slate-700">Barcode Scanner:</span>
            <span className="font-mono text-slate-900 font-semibold">
              {isC1 ? 'Honeywell Voyager 1250g (USB HID - Connected)' : 'Honeywell 1400g 2D (Connected)'}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-teal-700">print</span>
            <span className="font-medium text-slate-700">Thermal Printer:</span>
            <span className="font-mono text-slate-900 font-semibold">Epson Thermal TM-T88VI (Ready)</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-emerald-600">
              {isC1 ? 'sync_alt' : 'point_of_sale'}
            </span>
            <span className="font-medium text-slate-700">
              {isC1 ? 'Receipt Sync:' : 'Cash Drawer:'}
            </span>
            <span className="font-mono text-slate-800 font-semibold">
              {isC1 ? 'Instant Socket LAN (127.0.0.1:8080)' : 'RJ11 Pulse Active (৳ 14,850 in box)'}
            </span>
          </div>
        </div>

        {/* Compliance & Software Node Details */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
          <span className="text-slate-700 font-semibold">DGDA License: DA-DHK-2022-09418</span>
          <span>•</span>
          <span>Node: {isC1 ? 'DHN-POS-01' : 'DHN-POS-02'}</span>
          <span>•</span>
          <span className="text-slate-700 font-semibold">Dhaka Pharma POS v4.2 Pro</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
