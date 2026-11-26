import { LocationClass } from './locationDB.js'

/**
 * Helper to generate ISO date (YYYY-MM-DD) offset by N days from today,
 * keeping Day 10's 30/60/90-day Expiry Board fixtures permanently realistic.
 */
const isoDaysFromNow = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 📦 Batch-Level Stock Ledger Fixtures (Day 10)
 * Architecture Rule (Roadmap Day 10):
 * A physical location never holds a static quantity; quantities are always
 * computed by summing batch balances stored at each binId.
 * All monetary figures (costPerUnitPoisha, mrpPerUnitPoisha) are integers.
 */
export const stockBatchesDB = [
  // ── 🔴 Critical Window (0–30 Days) ──
  {
    id: 'batch-in-1049',
    medId: 'med-4',
    brandName: 'Azithrocin 500',
    generic: 'Azithromycin 500mg Tab',
    company: 'Incepta Pharmaceuticals',
    batchNo: 'IN-1049',
    binId: 'bin-B01-S01-B01',
    rackId: 'rack-B01',
    expiryDate: isoDaysFromNow(14),
    qtyBase: 64,
    costPerUnitPoisha: 2850, // ৳28.50 cost
    mrpPerUnitPoisha: 3500,  // ৳35.00 MRP
    status: LocationClass.SELLABLE,
    dgdaTag: 'Sched-H',
    actionStatus: null,
  },
  {
    id: 'batch-sn-0410',
    medId: 'med-7',
    brandName: 'Lantus SoloStar (Short Exp)',
    generic: 'Insulin Glargine 100IU/ml',
    company: 'Sanofi Bangladesh',
    batchNo: 'SN-0410',
    binId: 'bin-C01-S01-B01',
    rackId: 'rack-C01',
    expiryDate: isoDaysFromNow(22),
    qtyBase: 12,
    costPerUnitPoisha: 122000, // ৳1,220.00 cost
    mrpPerUnitPoisha: 145000,  // ৳1,450.00 MRP
    status: LocationClass.SELLABLE,
    dgdaTag: 'Cold-Chain',
    actionStatus: null,
  },
  {
    id: 'batch-sq-8702',
    medId: 'med-2',
    brandName: 'Seclo 20mg',
    generic: 'Omeprazole BP 20mg Cap',
    company: 'Square Pharmaceuticals PLC',
    batchNo: 'SQ-8702',
    binId: 'bin-A02-S02-B01',
    rackId: 'rack-A02',
    expiryDate: isoDaysFromNow(27),
    qtyBase: 140,
    costPerUnitPoisha: 550, // ৳5.50 cost
    mrpPerUnitPoisha: 700,  // ৳7.00 MRP
    status: LocationClass.SELLABLE,
    dgdaTag: 'DGDA',
    actionStatus: null,
  },

  // ── 🟠 Warning Window (31–60 Days) ──
  {
    id: 'batch-hc-2108',
    medId: 'med-5',
    brandName: 'Sergel 20mg',
    generic: 'Esomeprazole 20mg Capsule',
    company: 'Healthcare Pharmaceuticals',
    batchNo: 'HC-2108',
    binId: 'bin-A02-S01-B01',
    rackId: 'rack-A02',
    expiryDate: isoDaysFromNow(41),
    qtyBase: 340,
    costPerUnitPoisha: 560, // ৳5.60 cost
    mrpPerUnitPoisha: 700,  // ৳7.00 MRP
    status: LocationClass.SELLABLE,
    dgdaTag: 'DGDA',
    actionStatus: null,
  },
  {
    id: 'batch-sq-4401',
    medId: 'med-cef3',
    brandName: 'Cef-3 200mg Capsule',
    generic: 'Cefixime Trihydrate 200mg',
    company: 'Square Pharmaceuticals PLC',
    batchNo: 'SQ-4401',
    binId: 'bin-B01-S01-B03',
    rackId: 'rack-B01',
    expiryDate: isoDaysFromNow(48),
    qtyBase: 80,
    costPerUnitPoisha: 2900, // ৳29.00 cost
    mrpPerUnitPoisha: 3500,  // ৳35.00 MRP
    status: LocationClass.SELLABLE,
    dgdaTag: 'Sched-H',
    actionStatus: null,
  },
  {
    id: 'batch-ac-3091',
    medId: 'med-6',
    brandName: 'Monas 10mg',
    generic: 'Montelukast 10mg Tab',
    company: 'The Acme Laboratories Ltd.',
    batchNo: 'AC-3091',
    binId: 'bin-B02-S01-B01',
    rackId: 'rack-B02',
    expiryDate: isoDaysFromNow(56),
    qtyBase: 95,
    costPerUnitPoisha: 1320, // ৳13.20 cost
    mrpPerUnitPoisha: 1600,  // ৳16.00 MRP
    status: LocationClass.SELLABLE,
    dgdaTag: 'DGDA',
    actionStatus: null,
  },

  // ── 🟡 Notice Window (61–90 Days) ──
  {
    id: 'batch-bx-7740',
    medId: 'med-3',
    brandName: 'Tofen Syrup 100ml',
    generic: 'Ketotifen Fumarate 1mg/5ml',
    company: 'Beximco Pharmaceuticals Ltd.',
    batchNo: 'BX-7740',
    binId: 'bin-A04-S01-B01',
    rackId: 'rack-A04',
    expiryDate: isoDaysFromNow(72),
    qtyBase: 28,
    costPerUnitPoisha: 7100, // ৳71.00 cost
    mrpPerUnitPoisha: 8500,  // ৳85.00 MRP
    status: LocationClass.SELLABLE,
    dgdaTag: 'DGDA',
    actionStatus: null,
  },
  {
    id: 'batch-sq-9022',
    medId: 'med-osartil',
    brandName: 'Osartil 50mg',
    generic: 'Losartan Potassium 50mg',
    company: 'Incepta Pharmaceuticals',
    batchNo: 'IN-9022',
    binId: 'bin-A03-S01-B01',
    rackId: 'rack-A03',
    expiryDate: isoDaysFromNow(84),
    qtyBase: 110,
    costPerUnitPoisha: 650, // ৳6.50 cost
    mrpPerUnitPoisha: 800,  // ৳8.00 MRP
    status: LocationClass.SELLABLE,
    dgdaTag: 'DGDA',
    actionStatus: null,
  },

  // ── 🟢 Healthy Stock (> 90 Days) ──
  {
    id: 'batch-bx-4412',
    medId: 'med-1',
    brandName: 'Napa Extra',
    generic: 'Paracetamol 500mg + Caffeine 65mg',
    company: 'Beximco Pharmaceuticals Ltd.',
    batchNo: 'BX-4412',
    binId: 'bin-A01-S02-B04',
    rackId: 'rack-A01',
    expiryDate: isoDaysFromNow(280),
    qtyBase: 480,
    costPerUnitPoisha: 245, // ৳2.45 cost
    mrpPerUnitPoisha: 300,  // ৳3.00 MRP
    status: LocationClass.SELLABLE,
    dgdaTag: 'DGDA',
    actionStatus: null,
  },
  {
    id: 'batch-bx-4413',
    medId: 'med-1',
    brandName: 'Napa Extra (Top Bin)',
    generic: 'Paracetamol 500mg + Caffeine 65mg',
    company: 'Beximco Pharmaceuticals Ltd.',
    batchNo: 'BX-4413',
    binId: 'bin-A01-S01-B02',
    rackId: 'rack-A01',
    expiryDate: isoDaysFromNow(410),
    qtyBase: 140,
    costPerUnitPoisha: 245,
    mrpPerUnitPoisha: 300,
    status: LocationClass.SELLABLE,
    dgdaTag: 'DGDA',
    actionStatus: null,
  },
  {
    id: 'batch-sq-8914',
    medId: 'med-2',
    brandName: 'Seclo 20mg (Fresh)',
    generic: 'Omeprazole BP 20mg Cap',
    company: 'Square Pharmaceuticals PLC',
    batchNo: 'SQ-8914',
    binId: 'bin-A02-S02-B01',
    rackId: 'rack-A02',
    expiryDate: isoDaysFromNow(365),
    qtyBase: 210,
    costPerUnitPoisha: 560,
    mrpPerUnitPoisha: 700,
    status: LocationClass.SELLABLE,
    dgdaTag: 'DGDA',
    actionStatus: null,
  },
  {
    id: 'batch-sn-0491',
    medId: 'med-7',
    brandName: 'Lantus SoloStar',
    generic: 'Insulin Glargine 100IU/ml',
    company: 'Sanofi Bangladesh',
    batchNo: 'SN-0491',
    binId: 'bin-C01-S01-B01',
    rackId: 'rack-C01',
    expiryDate: isoDaysFromNow(210),
    qtyBase: 33,
    costPerUnitPoisha: 125000,
    mrpPerUnitPoisha: 145000,
    status: LocationClass.SELLABLE,
    dgdaTag: 'Cold-Chain',
    actionStatus: null,
  },
  {
    id: 'batch-sq-cip500',
    medId: 'med-cipro',
    brandName: 'Ciprocin 500mg',
    generic: 'Ciprofloxacin 500mg Tab',
    company: 'Square Pharmaceuticals PLC',
    batchNo: 'SQ-6120',
    binId: 'bin-B01-S02-B02',
    rackId: 'rack-B01',
    expiryDate: isoDaysFromNow(310),
    qtyBase: 95,
    costPerUnitPoisha: 1200,
    mrpPerUnitPoisha: 1500,
    status: LocationClass.SELLABLE,
    dgdaTag: 'Sched-H',
    actionStatus: null,
  },
  {
    id: 'batch-bx-comet',
    medId: 'med-comet',
    brandName: 'Comet 500mg',
    generic: 'Metformin HCl 500mg',
    company: 'Square Pharmaceuticals PLC',
    batchNo: 'SQ-5518',
    binId: 'bin-A03-S02-B01',
    rackId: 'rack-A03',
    expiryDate: isoDaysFromNow(450),
    qtyBase: 160,
    costPerUnitPoisha: 320,
    mrpPerUnitPoisha: 400,
    status: LocationClass.SELLABLE,
    dgdaTag: 'DGDA',
    actionStatus: null,
  },
  {
    id: 'batch-sq-fexo',
    medId: 'med-fexo',
    brandName: 'Fexo 120mg',
    generic: 'Fexofenadine HCl 120mg',
    company: 'Square Pharmaceuticals PLC',
    batchNo: 'SQ-3302',
    binId: 'bin-A01-S03-B01',
    rackId: 'rack-A01',
    expiryDate: isoDaysFromNow(330),
    qtyBase: 130,
    costPerUnitPoisha: 680,
    mrpPerUnitPoisha: 850,
    status: LocationClass.SELLABLE,
    dgdaTag: 'DGDA',
    actionStatus: null,
  },

  // ── 📦 Non-Sellable Segregation Batches (Zone Q & Zone D) ──
  {
    id: 'batch-quar-seclo',
    medId: 'med-2',
    brandName: 'Seclo 20mg (Inward Pallet)',
    generic: 'Omeprazole BP 20mg Cap',
    company: 'Square Pharmaceuticals PLC',
    batchNo: 'SQ-9921',
    binId: 'bin-Q01-S01-B01',
    rackId: 'rack-Q01',
    expiryDate: isoDaysFromNow(650),
    qtyBase: 1000,
    costPerUnitPoisha: 580,
    mrpPerUnitPoisha: 700,
    status: LocationClass.QUARANTINE,
    dgdaTag: 'QUARANTINE',
    actionStatus: null,
  },
  {
    id: 'batch-dmg-01',
    medId: 'med-3',
    brandName: 'Tofen Syrup 100ml (Leaked)',
    generic: 'Ketotifen Fumarate 1mg/5ml',
    company: 'Beximco Pharmaceuticals Ltd.',
    batchNo: 'BX-7701',
    binId: 'bin-D01-S01-B01',
    rackId: 'rack-D01',
    expiryDate: isoDaysFromNow(180),
    qtyBase: 5,
    costPerUnitPoisha: 7100,
    mrpPerUnitPoisha: 8500,
    status: LocationClass.DAMAGED,
    dgdaTag: 'DAMAGED',
    actionStatus: null,
  },
]
