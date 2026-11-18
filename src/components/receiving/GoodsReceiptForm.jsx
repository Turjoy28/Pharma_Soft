import { useState } from 'react'
import { useCounterStore } from '../../stores/useCounterStore.js'
import { parseMonthYearExpiry } from '../../utils/date.js'
import { validateCostAgainstMrp, toPoisha, formatTaka } from '../../utils/money.js'

function GoodsReceiptForm() {
  const suppliers = useCounterStore((s) => s.suppliers)
  const loading = useCounterStore((s) => s.loadingReceiving)
  const submitGoodsReceipt = useCounterStore((s) => s.submitGoodsReceipt)
  const setReceivingTab = useCounterStore((s) => s.setReceivingTab)

  // Header meta state
  const [supplierId, setSupplierId] = useState('sup-square')
  const [invoiceNo, setInvoiceNo] = useState(() => 'CH-SQ-94812')
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [receivedBy, setReceivedBy] = useState('Md. Tanvir Hossain (Store Officer)')
  const [notes, setNotes] = useState('DGDA Commercial Depot Delivery verified.')

  // Line items state
  const [items, setItems] = useState([
    {
      id: 1,
      brandName: 'Seclo 20mg Capsule',
      generic: 'Omeprazole BP 20mg Cap',
      batch: 'SQ-9921',
      expiryInput: '09/2028',
      expiryParsed: parseMonthYearExpiry('09/2028'),
      packType: 'box',
      unitsPerPack: 100,
      qtyPacks: 10,
      rejectedQtyPacks: 0,
      costPriceTaka: '5.80',
      mrpPriceTaka: '7.00',
    },
    {
      id: 2,
      brandName: 'Napa Extra 500+65mg',
      generic: 'Paracetamol 500mg + Caffeine 65mg',
      batch: 'BX-9104',
      expiryInput: '10/2028',
      expiryParsed: parseMonthYearExpiry('10/2028'),
      packType: 'box',
      unitsPerPack: 200,
      qtyPacks: 15,
      rejectedQtyPacks: 0,
      costPriceTaka: '2.50',
      mrpPriceTaka: '3.00',
    },
  ])

  const [formAlert, setFormAlert] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Selected supplier details
  const selectedSupplier = suppliers.find((s) => s.id === supplierId)

  // Add new line
  const handleAddLine = () => {
    const newItem = {
      id: Date.now(),
      brandName: '',
      generic: '',
      batch: '',
      expiryInput: '',
      expiryParsed: null,
      packType: 'box',
      unitsPerPack: 100,
      qtyPacks: 1,
      rejectedQtyPacks: 0,
      costPriceTaka: '0.00',
      mrpPriceTaka: '0.00',
    }
    setItems([...items, newItem])
  }

  // Remove line
  const handleRemoveLine = (id) => {
    if (items.length <= 1) {
      setFormAlert('At least one line item is required on the Challan.')
      return
    }
    setItems(items.filter((item) => item.id !== id))
  }

  // Update item field
  const handleItemChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item

        const updated = { ...item, [field]: value }

        if (field === 'expiryInput') {
          updated.expiryParsed = parseMonthYearExpiry(value)
        }

        return updated
      })
    )
  }

  // Calculate totals
  const totalPacks = items.reduce((sum, item) => sum + (Number(item.qtyPacks) || 0), 0)
  const totalRejected = items.reduce((sum, item) => sum + (Number(item.rejectedQtyPacks) || 0), 0)
  const totalAmountPoisha = items.reduce((sum, item) => {
    const acceptedPacks = Math.max(0, (Number(item.qtyPacks) || 0) - (Number(item.rejectedQtyPacks) || 0))
    const totalUnits = acceptedPacks * (Number(item.unitsPerPack) || 1)
    const costPoisha = toPoisha(item.costPriceTaka)
    return sum + totalUnits * costPoisha
  }, 0)

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormAlert(null)

    // Validations
    if (!invoiceNo.trim()) {
      setFormAlert('Invoice/Challan number is required.')
      return
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      if (!it.brandName.trim()) {
        setFormAlert(`Item #${i + 1}: Medicine brand name is required.`)
        return
      }
      if (!it.batch.trim()) {
        setFormAlert(`Item #${i + 1} (${it.brandName}): Batch number is required.`)
        return
      }
      if (!it.expiryParsed?.isValid) {
        setFormAlert(`Item #${i + 1} (${it.brandName}): Valid expiry date (MM/YYYY) is required.`)
        return
      }
      if (it.expiryParsed.isExpired) {
        setFormAlert(`Item #${i + 1} (${it.brandName}): Product is expired (${it.expiryParsed.displayDate}). Cannot receive expired goods!`)
        return
      }
      const priceCheck = validateCostAgainstMrp(it.costPriceTaka, it.mrpPriceTaka)
      if (priceCheck.isViolation) {
        setFormAlert(`Item #${i + 1} (${it.brandName}): ${priceCheck.errorMessage}`)
        return
      }
    }

    const payload = {
      supplierId,
      supplierName: selectedSupplier?.name || 'Square Pharmaceuticals PLC',
      invoiceNo,
      challanNo: invoiceNo,
      deliveryDate,
      receivedBy,
      notes,
      items: items.map((it) => {
        const acceptedPacks = Math.max(0, (Number(it.qtyPacks) || 0) - (Number(it.rejectedQtyPacks) || 0))
        const totalBaseUnits = acceptedPacks * (Number(it.unitsPerPack) || 1)
        return {
          brandName: it.brandName,
          generic: it.generic,
          batch: it.batch,
          expiryDate: it.expiryParsed?.isoDate,
          expiryDisplay: it.expiryParsed?.displayDate,
          packType: it.packType,
          unitsPerPack: Number(it.unitsPerPack) || 1,
          qtyPacks: acceptedPacks,
          rejectedQtyPacks: Number(it.rejectedQtyPacks) || 0,
          totalBaseUnits,
          costPriceMinor: toPoisha(it.costPriceTaka),
          mrpPriceMinor: toPoisha(it.mrpPriceTaka),
        }
      }),
    }

    const res = await submitGoodsReceipt(payload)
    if (res.success) {
      setSubmitSuccess(true)
    }
  }

  if (submitSuccess) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 my-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3 border border-amber-200">
          <span className="material-symbols-outlined text-3xl">fact_check</span>
        </div>
        <h3 className="font-bold text-slate-900 text-lg">Challan Successfully Received!</h3>
        <p className="text-sm text-slate-600 mt-1 max-w-md leading-relaxed">
          Inward delivery <strong className="font-mono text-slate-800">{invoiceNo}</strong> has been logged.
          All items are securely held in <strong className="text-amber-700">QUARANTINE (Zone Q)</strong> until they are put away onto sellable racks.
        </p>

        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => setReceivingTab('putaway')}
            className="px-4 py-2 bg-pharma-700 hover:bg-pharma-800 text-white rounded font-medium text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">shelves</span>
            Go to Put-Away Station (Zone Tree) &rarr;
          </button>
          <button
            type="button"
            onClick={() => {
              setSubmitSuccess(false)
              setInvoiceNo(`CH-SQ-${Date.now().toString().slice(-5)}`)
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors cursor-pointer"
          >
            Receive Another Challan
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* 1. DGDA Regulatory Quarantine Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded p-3 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-700 text-[20px]">security</span>
          <div>
            <span className="font-bold uppercase tracking-wider text-[11px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono mr-1.5">
              Status: Will Enter QUARANTINE
            </span>
            <span>All received goods will be placed on Zone Q pallet and cannot be sold until put away into a SELLABLE bin.</span>
          </div>
        </div>
        <span className="text-[11px] font-mono text-amber-800 shrink-0">DGDA Sec 14 Compliant</span>
      </div>

      {/* Error Alert */}
      {formAlert && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs p-3 rounded flex items-center gap-2 font-medium">
          <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
          <span>{formAlert}</span>
        </div>
      )}

      {/* 2. Supplier & Invoice Header Meta */}
      <div className="bg-white p-3.5 rounded border border-slate-300 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-slate-700 font-bold mb-1">Supplier / Manufacturer *</label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-pharma-700 cursor-pointer"
          >
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name} ({sup.shortName})
              </option>
            ))}
          </select>
          {selectedSupplier && (
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              Lic: {selectedSupplier.dgdaReg} • {selectedSupplier.paymentTerms}
            </p>
          )}
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">Invoice / Challan # *</label>
          <input
            type="text"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            placeholder="e.g. INV-SQ-94812"
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-pharma-700"
          />
          <p className="text-[10px] text-slate-500 mt-1">Delivery challan reference</p>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">Delivery Date</label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-pharma-700"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">Received By &amp; Notes</label>
          <input
            type="text"
            value={receivedBy}
            onChange={(e) => setReceivedBy(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-pharma-700"
          />
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Delivery notes..."
            className="w-full p-1 border border-slate-200 rounded text-[10px] text-slate-600 mt-1 focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Dense Line Items Spreadsheet */}
      <div className="bg-white rounded border border-slate-300 shadow-2xs overflow-hidden flex flex-col">
        <div className="p-3 bg-slate-100 border-b border-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-pharma-700 text-[18px]">receipt_long</span>
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
              Challan Line Items ({items.length} Products)
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddLine}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-xs font-medium text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-emerald-600">add_circle</span>
            + Add Line Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase font-mono">
              <tr>
                <th className="p-2 w-8 text-center">#</th>
                <th className="p-2 min-w-[180px]">Medicine Name &amp; Generic</th>
                <th className="p-2 w-28">Batch #</th>
                <th className="p-2 w-32">Expiry (MM/YYYY)</th>
                <th className="p-2 w-20">Packs</th>
                <th className="p-2 w-20">Units/Pack</th>
                <th className="p-2 w-20 text-rose-700">Rejected</th>
                <th className="p-2 w-24 text-right">Cost (৳)</th>
                <th className="p-2 w-24 text-right">MRP (৳)</th>
                <th className="p-2 w-28 text-right">Line Total (৳)</th>
                <th className="p-2 w-12 text-center">Del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {items.map((item, idx) => {
                const parsedExp = item.expiryParsed
                const priceCheck = validateCostAgainstMrp(item.costPriceTaka, item.mrpPriceTaka)
                const acceptedPacks = Math.max(0, (Number(item.qtyPacks) || 0) - (Number(item.rejectedQtyPacks) || 0))
                const totalUnits = acceptedPacks * (Number(item.unitsPerPack) || 1)
                const lineTotalTaka = (totalUnits * (Number(item.costPriceTaka) || 0)).toFixed(2)

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2 text-center font-mono text-slate-400 text-[11px]">{idx + 1}</td>

                    {/* Medicine Name */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.brandName}
                        onChange={(e) => handleItemChange(item.id, 'brandName', e.target.value)}
                        placeholder="e.g. Seclo 20mg Capsule"
                        className="w-full p-1.5 border border-slate-300 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-pharma-700"
                      />
                      <input
                        type="text"
                        value={item.generic}
                        onChange={(e) => handleItemChange(item.id, 'generic', e.target.value)}
                        placeholder="Generic (optional)"
                        className="w-full p-1 border border-slate-200 rounded text-[10px] text-slate-500 mt-0.5 focus:outline-none"
                      />
                    </td>

                    {/* Batch Number */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.batch}
                        onChange={(e) => handleItemChange(item.id, 'batch', e.target.value.toUpperCase())}
                        placeholder="SQ-9921"
                        className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono uppercase font-bold focus:outline-none focus:ring-1 focus:ring-pharma-700"
                      />
                    </td>

                    {/* MM/YYYY Expiry with Auto-Resolution */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.expiryInput}
                        onChange={(e) => handleItemChange(item.id, 'expiryInput', e.target.value)}
                        placeholder="03/2026"
                        className={`w-full p-1.5 border rounded text-xs font-mono font-bold focus:outline-none ${
                          parsedExp?.isExpired
                            ? 'border-rose-400 bg-rose-50 text-rose-800'
                            : parsedExp?.isValid
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                            : 'border-slate-300'
                        }`}
                      />
                      {parsedExp?.isValid ? (
                        <span
                          className={`text-[10px] block font-mono mt-0.5 ${
                            parsedExp.isExpired ? 'text-rose-600 font-bold' : 'text-emerald-700'
                          }`}
                        >
                          {parsedExp.displayDate} {parsedExp.isExpired && '⚠️ Expired!'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block mt-0.5">MM/YYYY</span>
                      )}
                    </td>

                    {/* Pack Quantity */}
                    <td className="p-2">
                      <input
                        type="number"
                        min="1"
                        value={item.qtyPacks}
                        onChange={(e) => handleItemChange(item.id, 'qtyPacks', e.target.value)}
                        className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono font-bold text-center"
                      />
                    </td>

                    {/* Units Per Pack */}
                    <td className="p-2">
                      <input
                        type="number"
                        min="1"
                        value={item.unitsPerPack}
                        onChange={(e) => handleItemChange(item.id, 'unitsPerPack', e.target.value)}
                        className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono text-center text-slate-600"
                      />
                    </td>

                    {/* Rejected Qty */}
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        value={item.rejectedQtyPacks}
                        onChange={(e) => handleItemChange(item.id, 'rejectedQtyPacks', e.target.value)}
                        className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono text-center text-rose-700"
                      />
                    </td>

                    {/* Cost Price */}
                    <td className="p-2 text-right">
                      <input
                        type="text"
                        value={item.costPriceTaka}
                        onChange={(e) => handleItemChange(item.id, 'costPriceTaka', e.target.value)}
                        className={`w-full p-1.5 border rounded text-xs font-mono text-right font-bold ${
                          priceCheck.isViolation ? 'border-rose-400 bg-rose-50 text-rose-800' : 'border-slate-300'
                        }`}
                      />
                    </td>

                    {/* MRP Price */}
                    <td className="p-2 text-right">
                      <input
                        type="text"
                        value={item.mrpPriceTaka}
                        onChange={(e) => handleItemChange(item.id, 'mrpPriceTaka', e.target.value)}
                        className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono text-right font-bold text-slate-800"
                      />
                      {priceCheck.isViolation && (
                        <span className="text-[9px] text-rose-600 block mt-0.5 leading-tight">Cost &gt; MRP!</span>
                      )}
                    </td>

                    {/* Line Total */}
                    <td className="p-2 text-right font-mono font-bold text-slate-900">
                      ৳{lineTotalTaka}
                    </td>

                    {/* Delete */}
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="Delete line"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 4. Bottom Summary & Submission */}
        <div className="p-3 bg-slate-50 border-t border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 font-mono">
            <span>
              Total Packs: <strong className="text-slate-900">{totalPacks}</strong>
            </span>
            {totalRejected > 0 && (
              <span className="text-rose-700">
                Rejected: <strong>{totalRejected}</strong>
              </span>
            )}
            <span>
              Challan Value: <strong className="text-pharma-800 text-sm">৳{formatTaka(totalAmountPoisha)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">move_to_inbox</span>
              {loading ? 'Receiving Goods...' : '[F10] Receive to Quarantine Pallet'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default GoodsReceiptForm
