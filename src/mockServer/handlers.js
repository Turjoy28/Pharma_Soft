import { http, HttpResponse } from 'msw/http'
import {
  medicineDB,
  ticketsDB,
  suppliersDB,
  quarantineQueueDB,
  inboundReceiptsDB,
  LocationClass,
  locationTreeDB,
  getFlatBins,
  findBinById,
  findBinByCode,
} from './msDB.js'

// ── Shared Resolvers for Inbound Receiving & Put-Away (Day 9) ──

const getSuppliersResolver = () => {
  console.log('[MSW] Intercepted GET suppliers')
  return HttpResponse.json({ suppliers: suppliersDB })
}

const getLocationsResolver = () => {
  console.log('[MSW] Intercepted GET locations')
  return HttpResponse.json({
    locations: locationTreeDB,
    bins: getFlatBins(),
  })
}

const getReceiptsResolver = () => {
  console.log('[MSW] Intercepted GET receipts')
  return HttpResponse.json({ receipts: inboundReceiptsDB })
}

const createReceiptResolver = async ({ request }) => {
  const body = await request.json()
  console.log('[MSW] Intercepted POST receipts', body)

  const {
    supplierId,
    supplierName,
    invoiceNo,
    challanNo,
    deliveryDate,
    receivedBy,
    items = [],
  } = body

  if (!invoiceNo || !supplierId) {
    return HttpResponse.json(
      { code: 'INVALID_RECEIPT', message: 'Supplier and Invoice/Challan number are required.' },
      { status: 400 }
    )
  }

  if (!items.length) {
    return HttpResponse.json(
      { code: 'EMPTY_RECEIPT', message: 'At least one line item is required to receive goods.' },
      { status: 400 }
    )
  }

  // DGDA Validation checks:
  // 1. Cost < MRP
  // 2. Expiry must not be in the past
  for (const item of items) {
    if (item.costPriceMinor && item.mrpPriceMinor && item.costPriceMinor > item.mrpPriceMinor) {
      return HttpResponse.json(
        {
          code: 'COST_EXCEEDS_MRP',
          message: `DGDA Pricing Violation for ${item.brandName || 'item'}: Purchase cost (৳${(item.costPriceMinor / 100).toFixed(2)}) cannot exceed Maximum Retail Price (৳${(item.mrpPriceMinor / 100).toFixed(2)}).`,
        },
        { status: 400 }
      )
    }

    if (item.expiryDate) {
      const expDate = new Date(item.expiryDate)
      if (expDate < new Date()) {
        return HttpResponse.json(
          {
            code: 'EXPIRED_PRODUCT_REJECTED',
            message: `DGDA Compliance Rejection: Batch ${item.batch || ''} of ${item.brandName || 'medicine'} has already expired (${item.expiryDisplay || item.expiryDate}). Inbound expired stock is strictly prohibited.`,
          },
          { status: 400 }
        )
      }
    }
  }

  const receiptId = `rcpt-${Date.now()}`
  const createdQuarantineItems = []
  let totalAmountPoisha = 0

  items.forEach((item, index) => {
    const acceptedPacks = Math.max(0, (item.qtyPacks || 1) - (item.rejectedQtyPacks || 0))
    const unitsPerPack = item.unitsPerPack || 1
    const totalBaseUnits = acceptedPacks * unitsPerPack
    const lineCost = totalBaseUnits * (item.costPriceMinor || 0)
    totalAmountPoisha += lineCost

    if (acceptedPacks > 0) {
      const quarItem = {
        id: `quar-${Date.now()}-${index + 1}`,
        receiptId,
        supplierId,
        supplierName: supplierName || 'Supplier',
        invoiceNo,
        challanNo: challanNo || invoiceNo,
        deliveryDate: deliveryDate || new Date().toISOString().slice(0, 10),
        brandName: item.brandName,
        generic: item.generic || '',
        batch: item.batch,
        barcode: item.barcode || '',
        mfgDate: item.mfgDate || '',
        expiryDate: item.expiryDate,
        expiryDisplay: item.expiryDisplay || item.expiryDate,
        packType: item.packType || 'box',
        unitsPerPack,
        qtyPacks: acceptedPacks,
        rejectedQtyPacks: item.rejectedQtyPacks || 0,
        totalBaseUnits,
        costPriceMinor: item.costPriceMinor || 0,
        mrpPriceMinor: item.mrpPriceMinor || 0,
        // CRITICAL: Day 9 rule - stock must remain in QUARANTINE until put away into a sellable bin
        status: LocationClass.QUARANTINE,
        currentBinId: 'bin-Q01-S01-B01',
        suggestedBinId: item.suggestedBinId || 'bin-A01-S02-B04',
        suggestedBinName: item.suggestedBinName || 'Rack A-01 / Shelf 02 / Bin 04',
        notes: item.notes || `Inward delivery from Challan #${invoiceNo}`,
        receivedAt: new Date().toISOString(),
      }

      quarantineQueueDB.unshift(quarItem)
      createdQuarantineItems.push(quarItem)
    }
  })

  const receipt = {
    id: receiptId,
    receiptNo: `GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    supplierId,
    supplierName: supplierName || 'Supplier',
    invoiceNo,
    challanNo: challanNo || invoiceNo,
    deliveryDate: deliveryDate || new Date().toISOString().slice(0, 10),
    receivedBy: receivedBy || 'Store Officer',
    totalAmountPoisha,
    itemCount: createdQuarantineItems.length,
    status: 'QUARANTINED',
    createdAt: new Date().toISOString(),
  }

  inboundReceiptsDB.unshift(receipt)

  return HttpResponse.json(
    {
      success: true,
      message: `Inbound Goods Receipt #${receipt.receiptNo} created. ${createdQuarantineItems.length} lines placed in Quarantine Holding.`,
      receipt,
      quarantineItems: createdQuarantineItems,
    },
    { status: 201 }
  )
}

const getPutAwayResolver = () => {
  console.log('[MSW] Intercepted GET putaway')
  const queue = quarantineQueueDB.filter((item) => item.status === LocationClass.QUARANTINE)
  const totalPacks = queue.reduce((sum, item) => sum + (item.qtyPacks || 0), 0)
  const totalBaseUnits = queue.reduce((sum, item) => sum + (item.totalBaseUnits || 0), 0)

  return HttpResponse.json({
    success: true,
    count: queue.length,
    totalPacks,
    totalBaseUnits,
    queue,
  })
}

const executePutAwayResolver = async ({ request }) => {
  const body = await request.json()
  console.log('[MSW] Intercepted POST putaway', body)

  const { itemId, targetBinId, notes } = body

  if (!itemId || !targetBinId) {
    return HttpResponse.json(
      { code: 'MISSING_PARAMS', message: 'Item ID and Target Bin ID are required for put-away.' },
      { status: 400 }
    )
  }

  // 1. Locate quarantine item
  const itemIndex = quarantineQueueDB.findIndex(
    (i) => i.id.toLowerCase() === String(itemId).toLowerCase()
  )
  if (itemIndex === -1) {
    return HttpResponse.json(
      { code: 'ITEM_NOT_FOUND', message: `Quarantine item ${itemId} not found.` },
      { status: 404 }
    )
  }

  const item = quarantineQueueDB[itemIndex]

  // 2. Locate target bin (supports bin ID or scannable code)
  const targetBin = findBinById(targetBinId) || findBinByCode(targetBinId)
  if (!targetBin) {
    return HttpResponse.json(
      { code: 'BIN_NOT_FOUND', message: `Target storage bin ${targetBinId} does not exist.` },
      { status: 404 }
    )
  }

  // 3. Roadmap Rule: Location must be SELLABLE
  if (targetBin.locationClass !== LocationClass.SELLABLE) {
    return HttpResponse.json(
      {
        code: 'LOCATION_NOT_SELLABLE',
        message: `Cannot put away into bin ${targetBin.code}: Target bin location class is '${targetBin.locationClass}', but only SELLABLE locations are permitted.`,
      },
      { status: 400 }
    )
  }

  // 4. Update the item status & move it
  item.status = LocationClass.SELLABLE
  item.currentBinId = targetBin.id
  item.currentBinCode = targetBin.code
  item.putAwayNotes = notes || 'Put away completed'
  item.putAwayAt = new Date().toISOString()

  // 5. Update or Seed into Sellable Medicines Catalog (medicineDB)
  let matchedMed = medicineDB.find(
    (m) =>
      (item.barcode && m.barcode === item.barcode) ||
      m.brandName.toLowerCase() === item.brandName.toLowerCase()
  )

  if (matchedMed) {
    matchedMed.stock = (matchedMed.stock || 0) + item.totalBaseUnits
    matchedMed.stockText = `${matchedMed.stock} pcs`
    matchedMed.shelf = `${targetBin.rackName || targetBin.rackId}, ${targetBin.name}`
    matchedMed.batch = item.batch || matchedMed.batch
    matchedMed.expiry = item.expiryDisplay ? item.expiryDisplay.slice(3) : matchedMed.expiry
  } else {
    matchedMed = {
      id: `med-${Date.now()}`,
      brandName: item.brandName,
      generic: item.generic || item.brandName,
      company: item.supplierName || 'Pharma Corp',
      shelf: `${targetBin.rackName || targetBin.rackId}, ${targetBin.name}`,
      batch: item.batch,
      barcode: item.barcode || `8941${Math.floor(100000000 + Math.random() * 900000000)}`,
      expiry: item.expiryDisplay || item.expiryDate,
      price: (item.mrpPriceMinor || 1000) / 100,
      unitType: item.packType === 'pen' ? 'pen' : item.packType === 'strip' ? 'strip' : 'tablet',
      stockText: `${item.totalBaseUnits} pcs`,
      stock: item.totalBaseUnits,
      category: 'fast',
      fefoTag: `FEFO • ${item.expiryDisplay || item.expiryDate}`,
      dgdaTag: 'DGDA',
    }
    medicineDB.push(matchedMed)
  }

  // 6. Shrink the quarantine queue as lines are placed
  quarantineQueueDB.splice(itemIndex, 1)

  return HttpResponse.json(
    {
      success: true,
      message: `Successfully put away ${item.brandName} (${item.qtyPacks} packs / ${item.totalBaseUnits} units) to ${targetBin.code} (${targetBin.fullPath || targetBin.name}).`,
      item,
      bin: targetBin,
      medicine: matchedMed,
      remainingQuarantineCount: quarantineQueueDB.filter(
        (q) => q.status === LocationClass.QUARANTINE
      ).length,
    },
    { status: 200 }
  )
}

export const handlers = [
  // 🎟️ 1. Dispensing Tickets Queue
  http.get('/api/tickets', () => {
    console.log('[MSW] Intercepted GET /api/tickets')
    return HttpResponse.json({ tickets: ticketsDB })
  }),

  // 🎟️ 2. Single Ticket Lookup by Ticket ID
  http.get('/api/tickets/:id', ({ params }) => {
    const { id } = params
    console.log(`[MSW] Intercepted GET /api/tickets/${id}`)
    const ticket = ticketsDB.find((t) => t.id.toLowerCase() === String(id).toLowerCase())
    if (!ticket) {
      return new HttpResponse(null, { status: 404, statusText: 'Ticket not found' })
    }
    return HttpResponse.json({ ticket })
  }),

  // 🎟️ 2b. Create Dispensing Ticket (Counter 1 -> Counter 2)
  http.post('/api/tickets', async ({ request }) => {
    const newTicket = await request.json()
    console.log('[MSW] Intercepted POST /api/tickets', newTicket)
    ticketsDB.unshift(newTicket)
    return HttpResponse.json({ ticket: newTicket }, { status: 201 })
  }),

  // 📦 3. Medicines Inventory Catalog
  http.get('/api/medicines', () => {
    console.log('[MSW] Intercepted GET /api/medicines')
    return HttpResponse.json({ medicines: medicineDB })
  }),

  // 💰 4. Finalise Sale & Pay Ticket (Day 8 Settlement)
  http.post('/api/tickets/:id/pay', async ({ params, request }) => {
    const { id } = params
    const body = await request.json()
    console.log(`[MSW] Intercepted POST /api/tickets/${id}/pay`, body)

    const ticket = ticketsDB.find((t) => t.id.toLowerCase() === String(id).toLowerCase())
    if (!ticket) {
      return HttpResponse.json(
        { code: 'TICKET_NOT_FOUND', message: 'Dispensing ticket not found.' },
        { status: 404 }
      )
    }

    if (ticket.status === 'paid') {
      return HttpResponse.json(
        {
          code: 'TICKET_ALREADY_PAID',
          message: `Ticket ${ticket.ticketNumber || id} has already been settled and paid.`,
        },
        { status: 400 }
      )
    }

    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const invoiceNo = `INV-${dateStr}-${randomSuffix}`

    const invoice = {
      invoiceNo,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber || `#${ticket.id}`,
      createdAt: now.toISOString(),
      storeName: 'AL-SHIFA PHARMACY & WELLNESS',
      branch: 'Dhanmondi Model Branch, Road 27, Dhaka-1209',
      drugLicense: 'DL-DH-84920/2024',
      vatReg: '004928192-0101',
      hotline: '+880 1819-239401',
      cashier: body.cashierName || 'Cashier #04 (Kamal Hossain)',
      dispenser: ticket.dispenser || 'Pharm. Tanvir (Counter 1)',
      patientName: body.patientName || ticket.patientName || 'Walk-in Patient',
      patientNote: ticket.patientNote || '',
      doctor: body.doctorName || ticket.doctor || 'Direct Dispensing (OTC)',
      items: body.items && body.items.length > 0 ? body.items : ticket.items || [],
      subtotalPoisha: body.subtotalPoisha,
      discountPoisha: body.discountPoisha,
      roundingPoisha: body.roundingPoisha,
      totalPayablePoisha: body.totalPayablePoisha,
      changePoisha: body.changePoisha || 0,
      payments: body.payments || [],
    }

    // Mutate state in mock DB
    ticket.status = 'paid'
    ticket.statusLabel = 'Paid & Settled'
    ticket.paidAt = invoice.createdAt
    ticket.invoice = invoice

    return HttpResponse.json(
      {
        success: true,
        message: 'Sale finalized successfully',
        invoice,
        ticket,
      },
      { status: 200 }
    )
  }),

  // 🏢 5. Suppliers Catalog (GET /api/suppliers & /v1/suppliers)
  http.get('/api/suppliers', getSuppliersResolver),
  http.get('/v1/suppliers', getSuppliersResolver),
  http.get('/api/v1/suppliers', getSuppliersResolver),

  // 🗺️ 6. Location Tree & Flat Bins (GET /api/locations & /v1/locations)
  http.get('/api/locations', getLocationsResolver),
  http.get('/v1/locations', getLocationsResolver),
  http.get('/api/v1/locations', getLocationsResolver),

  // 📜 7. Inbound Receipts List (GET /api/receipts & /v1/receipts)
  http.get('/api/receipts', getReceiptsResolver),
  http.get('/v1/receipts', getReceiptsResolver),
  http.get('/api/v1/receipts', getReceiptsResolver),

  // 📥 8. Save Inbound Goods Receipt & Create Quarantine Items (POST /api/receipts & /v1/receipts)
  http.post('/api/receipts', createReceiptResolver),
  http.post('/v1/receipts', createReceiptResolver),
  http.post('/api/v1/receipts', createReceiptResolver),

  // 📦 9. Fetch Items Waiting in Quarantine for Put-Away (GET /api/putaway & /v1/putaway)
  http.get('/api/putaway', getPutAwayResolver),
  http.get('/v1/putaway', getPutAwayResolver),
  http.get('/api/v1/putaway', getPutAwayResolver),

  // 🚚 10. Execute Put-Away: Move item to sellable bin (POST /api/putaway & /v1/putaway)
  http.post('/api/putaway', executePutAwayResolver),
  http.post('/v1/putaway', executePutAwayResolver),
  http.post('/api/v1/putaway', executePutAwayResolver),
]
