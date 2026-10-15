function Footer() {
  return (
    <footer className="bg-white border-t border-slate-300 px-4 py-1.5 text-xs text-slate-600 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Hardware Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="font-medium text-slate-700">Thermal Printer:</span>
            <span className="font-mono text-slate-900 font-semibold">EPSON TM-T88VI (Ready - USB-01)</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-teal-700">point_of_sale</span>
            <span className="font-medium text-slate-700">Cash Drawer:</span>
            <span className="font-mono text-slate-900">RJ11 Pulse Active (৳ 14,850 in box)</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-emerald-600">barcode_scanner</span>
            <span className="font-medium text-slate-700">Scanner:</span>
            <span className="font-mono text-slate-800">Honeywell 1400g (Online)</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-teal-700">database</span>
            <span className="font-medium text-slate-700">Local DB:</span>
            <span className="font-mono text-slate-800">2,410 Items Cached (v2025.2)</span>
          </div>
        </div>

        {/* DGDA Compliance & Software Version */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
          <span>DGDA License: <strong className="text-slate-700 font-bold">DA-DHK-2022-09418</strong></span>
          <span>•</span>
          <span>NBR VAT BIN: <strong className="text-slate-700 font-bold">002941847-0102</strong></span>
          <span>•</span>
          <span>Node: DHN-POS-02</span>
          <span>•</span>
          <span className="text-pharma-800 font-bold">Dhaka Pharma POS v4.2 Pro</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
