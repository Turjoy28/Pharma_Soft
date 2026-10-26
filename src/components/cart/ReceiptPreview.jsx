import { useState } from 'react'
import { formatTaka } from '../../utils/money.js'
import { useCounterStore } from '../../stores/useCounterStore.js'

function ReceiptPreview() {
  const [isDuplicate, setIsDuplicate] = useState(false)

  // 🏪 Direct Zustand Subscriptions
  const isOpen = useCounterStore((s) => s.isReceiptOpen)
  const onClose = useCounterStore((s) => s.closeReceipt)
  const invoice = useCounterStore((s) => s.completedInvoice)

  if (!isOpen || !invoice) return null

  const handlePrint = () => {
    window.print()
  }

  const handleFinishSale = () => {
    onClose()
  }

  // Format date nicely
  const printDate = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : new Date().toLocaleString()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Top Control Toolbar (Non-printable) */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-400 text-[22px]">receipt_long</span>
            <div>
              <h3 className="font-bold text-sm">Thermal Receipt Preview (80mm)</h3>
              <p className="text-[11px] text-slate-400 font-mono">Invoice #{invoice.invoiceNo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Duplicate Flag Toggle (PRD Day 8 Requirement) */}
            <button
              type="button"
              onClick={() => setIsDuplicate((prev) => !prev)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-colors cursor-pointer ${
                isDuplicate
                  ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Toggle Duplicate Reprint Watermark"
            >
              {isDuplicate ? 'Reprint: DUPLICATE (Active)' : 'Mark Duplicate'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1 bg-pharma-700 hover:bg-pharma-800 text-white text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              title="Print Receipt [Ctrl+P]"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print [Ctrl+P]</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-200 flex justify-center">
          {/* Exact 80mm POS Thermal Slip */}
          <div
            id="thermal-receipt"
            className="w-[80mm] min-w-[80mm] max-w-[80mm] bg-white p-4 text-slate-900 font-mono text-[11px] shadow-lg rounded border border-slate-300 print:shadow-none print:border-none print:m-0 print:p-2"
          >
            {/* Duplicate Watermark / Notice */}
            {isDuplicate && (
              <div className="text-center py-1 mb-2 border-y-2 border-dashed border-red-500 text-red-600 font-bold text-xs uppercase tracking-wider">
                *** DUPLICATE REPRINT ***
              </div>
            )}

            {/* Pharmacy Brand Header */}
            <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-0.5">
              <h2 className="text-sm font-black uppercase tracking-tight">{invoice.storeName || 'AL-SHIFA PHARMACY'}</h2>
              <p className="text-[10px] text-slate-600">Model Medicine Dispensing &amp; Wellness</p>
              <p className="text-[9px] text-slate-500 leading-tight">{invoice.branch}</p>
              <p className="text-[9px] text-slate-500 font-bold">
                DGDA Drug Lic: {invoice.drugLicense} | VAT: {invoice.vatReg}
              </p>
              <p className="text-[9px] text-slate-500">Hotline: {invoice.hotline}</p>
            </div>

            {/* Cash Memo Title */}
            <div className="text-center py-1.5 font-bold uppercase tracking-widest text-[11px] border-b border-dashed border-slate-400">
              RETAIL CASH MEMO
            </div>

            {/* Invoice & Patient Meta */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Memo No:</span>
                <span className="font-bold">{invoice.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Date &amp; Time:</span>
                <span>{printDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Dispensed By:</span>
                <span>{invoice.dispenser}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{invoice.cashier}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span>Patient:</span>
                <span className="font-bold">{invoice.patientName}</span>
              </div>
              {invoice.doctor && (
                <div className="flex justify-between">
                  <span>Prescribed By:</span>
                  <span className="italic">{invoice.doctor}</span>
                </div>
              )}
            </div>

            {/* Itemized Medicine Table */}
            <div className="py-2 border-b border-dashed border-slate-400">
              <div className="grid grid-cols-12 font-bold pb-1 text-[9px] uppercase border-b border-slate-300">
                <div className="col-span-6">Item (Batch • Exp)</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y divide-dotted divide-slate-200 py-1">
                {invoice.items &&
                  invoice.items.map((item, idx) => (
                    <div key={item.id || idx} className="py-1 text-[10px]">
                      <div className="font-bold leading-tight">{item.brandName}</div>
                      <div className="text-[9px] text-slate-500 flex justify-between">
                        <span>
                          B: {item.batch || 'N/A'} • Exp: {item.expiry || 'N/A'}
                        </span>
                      </div>
                      <div className="grid grid-cols-12 text-[10px] pt-0.5">
                        <div className="col-span-6 text-slate-500 text-[9px]">
                          {item.generic ? item.generic.slice(0, 22) : ''}
                        </div>
                        <div className="col-span-2 text-center font-bold">{item.qty}</div>
                        <div className="col-span-2 text-right">৳{Number(item.price).toFixed(2)}</div>
                        <div className="col-span-2 text-right font-bold">
                          ৳{(item.price * item.qty).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Financial Totals Breakdown (Exact Integer Poisha Math) */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span>Gross Subtotal:</span>
                <span>৳{formatTaka(invoice.subtotalPoisha)}</span>
              </div>
              {invoice.discountPoisha > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Trade Discount (5%):</span>
                  <span>-৳{formatTaka(invoice.discountPoisha)}</span>
                </div>
              )}
              {invoice.roundingPoisha !== 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Cash Register Rounding:</span>
                  <span>{invoice.roundingPoisha > 0 ? '+' : ''}৳{formatTaka(invoice.roundingPoisha)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black pt-1 border-t border-slate-400">
                <span>NET TOTAL PAYABLE:</span>
                <span>৳{formatTaka(invoice.totalPayablePoisha)}</span>
              </div>
            </div>

            {/* Payment & Change Tender Breakdown */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-1">
              <div className="font-bold uppercase text-[9px] text-slate-500">Payment Breakdown:</div>
              {invoice.payments &&
                invoice.payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {p.method}
                      {p.trxId ? ` (Trx: ${p.trxId})` : ''}
                      {p.authCode ? ` (${p.authCode})` : ''}:
                    </span>
                    <span className="font-bold">৳{p.amountTaka || formatTaka(p.amountPoisha)}</span>
                  </div>
                ))}
              {invoice.changePoisha > 0 && (
                <div className="flex justify-between font-bold text-emerald-800 pt-0.5">
                  <span>Change Returned:</span>
                  <span>৳{formatTaka(invoice.changePoisha)}</span>
                </div>
              )}
            </div>

            {/* Barcode / Token Representation */}
            <div className="py-3 text-center space-y-1">
              <div className="font-mono text-xl tracking-[6px] select-none font-bold">
                ||| | |||| | ||| || |||
              </div>
              <div className="text-[9px] text-slate-500 font-mono tracking-wider">
                *{invoice.invoiceNo}*
              </div>
            </div>

            {/* DGDA Return Policy & Legal Disclaimer */}
            <div className="text-[8px] text-slate-500 text-center leading-tight pt-1 border-t border-dotted border-slate-300">
              <p>Government Approved DGDA Prices.</p>
              <p>Goods once sold cannot be returned without original cash memo within 7 days.</p>
              <p>Refrigerated/Cold-chain &amp; Cut-strip items non-returnable.</p>
              <p className="mt-1 font-bold">Wish You Good Health &amp; Speedy Recovery!</p>
            </div>

            {/* Signature Lines */}
            <div className="grid grid-cols-2 pt-6 text-[9px] text-center text-slate-500">
              <div>
                <div className="border-t border-slate-400 mx-2 pt-0.5">Dispenser</div>
              </div>
              <div>
                <div className="border-t border-slate-400 mx-2 pt-0.5">Customer / Cashier</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Non-printable) */}
        <div className="bg-slate-100 border-t border-slate-300 px-5 py-3 flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print 80mm Slip [Ctrl+P]</span>
          </button>

          <button
            type="button"
            onClick={handleFinishSale}
            className="px-5 py-2 bg-pharma-700 hover:bg-pharma-800 text-white font-bold rounded text-xs shadow flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            <span>Done &amp; Load Next Patient [Enter]</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReceiptPreview
