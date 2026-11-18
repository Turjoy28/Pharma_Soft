// ─────────────────────────────────────────────────────────────────────────────
// 🗺️ Bangladesh Pharmacy Physical Location Hierarchy Tree
// Structure: Zone -> Rack -> Shelf -> Bin (with scannable codes & LocationClass)
// ─────────────────────────────────────────────────────────────────────────────

export const LocationClass = {
  SELLABLE: "SELLABLE",
  QUARANTINE: "QUARANTINE",
  EXPIRED: "EXPIRED",
  DAMAGED: "DAMAGED",
};

export const locationTreeDB = [
  {
    id: "zone-a",
    code: "ZONE-A",
    name: "Zone A: Main Dispensary (Air-Conditioned 15°C–25°C)",
    zoneClass: LocationClass.SELLABLE,
    temperature: "15°C–25°C Controlled Room Temp",
    description: "Main frontline pharmacy dispensing racks for fast-moving oral solids, analgesics, PPIs, syrups and OTC products.",
    racks: [
      {
        id: "rack-A01",
        code: "RACK-A01",
        name: "Rack A-01: Fast-Moving Oral Solids (OTC / Analgesics)",
        shelves: [
          {
            id: "shelf-A01-S01",
            code: "A01-S01",
            name: "Shelf 01 (Top)",
            bins: [
              { id: "bin-A01-S01-B01", code: "A01-S01-B01", name: "Bin 01: Paracetamol 500mg (Plain)", locationClass: LocationClass.SELLABLE, capacity: 200, current: 85 },
              { id: "bin-A01-S01-B02", code: "A01-S01-B02", name: "Bin 02: Paracetamol + Caffeine Combos", locationClass: LocationClass.SELLABLE, capacity: 200, current: 140 },
              { id: "bin-A01-S01-B03", code: "A01-S01-B03", name: "Bin 03: Ace Plus & Fast OTC Combos", locationClass: LocationClass.SELLABLE, capacity: 150, current: 90 },
              { id: "bin-A01-S01-B04", code: "A01-S01-B04", name: "Bin 04: Fast-Moving Pain Relievers", locationClass: LocationClass.SELLABLE, capacity: 150, current: 60 },
            ],
          },
          {
            id: "shelf-A01-S02",
            code: "A01-S02",
            name: "Shelf 02 (Eye Level - Fast Pick Frontline)",
            bins: [
              { id: "bin-A01-S02-B01", code: "A01-S02-B01", name: "Bin 01: Napa Extra Blisters (Beximco)", locationClass: LocationClass.SELLABLE, capacity: 300, current: 240 },
              { id: "bin-A01-S02-B02", code: "A01-S02-B02", name: "Bin 02: Napa One 1000mg Tablets", locationClass: LocationClass.SELLABLE, capacity: 200, current: 110 },
              { id: "bin-A01-S02-B03", code: "A01-S02-B03", name: "Bin 03: Renova Extra Blisters (Opsonin)", locationClass: LocationClass.SELLABLE, capacity: 200, current: 75 },
              { id: "bin-A01-S02-B04", code: "A01-S02-B04", name: "Bin 04: Napa Extra Box 4 (Frontline)", locationClass: LocationClass.SELLABLE, capacity: 250, current: 180 },
            ],
          },
          {
            id: "shelf-A01-S03",
            code: "A01-S03",
            name: "Shelf 03 (Waist Level - Antihistamines)",
            bins: [
              { id: "bin-A01-S03-B01", code: "A01-S03-B01", name: "Bin 01: Fexofenadine 120mg (Fexo/Telfast)", locationClass: LocationClass.SELLABLE, capacity: 200, current: 130 },
              { id: "bin-A01-S03-B02", code: "A01-S03-B02", name: "Bin 02: Cetirizine 10mg (Alatrol/Atrizin)", locationClass: LocationClass.SELLABLE, capacity: 200, current: 95 },
              { id: "bin-A01-S03-B03", code: "A01-S03-B03", name: "Bin 03: Bilastine 20mg (Bilasitin/Bilaid)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 40 },
              { id: "bin-A01-S03-B04", code: "A01-S03-B04", name: "Bin 04: Rupatadine 10mg (Rupa/Rupafin)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 55 },
            ],
          },
        ],
      },
      {
        id: "rack-A02",
        code: "RACK-A02",
        name: "Rack A-02: Gastrointestinal & PPIs (Capsules & Tablets)",
        shelves: [
          {
            id: "shelf-A02-S01",
            code: "A02-S01",
            name: "Shelf 01 (Esomeprazole Section)",
            bins: [
              { id: "bin-A02-S01-B01", code: "A02-S01-B01", name: "Bin 01: Sergel 20mg Capsule (HC-2108)", locationClass: LocationClass.SELLABLE, capacity: 250, current: 190 },
              { id: "bin-A02-S01-B02", code: "A02-S01-B02", name: "Bin 02: Sergel 40mg Capsule (Healthcare)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 70 },
              { id: "bin-A02-S01-B03", code: "A02-S01-B03", name: "Bin 03: Nexum 20mg Tablet (Beximco)", locationClass: LocationClass.SELLABLE, capacity: 200, current: 85 },
              { id: "bin-A02-S01-B04", code: "A02-S01-B04", name: "Bin 04: Maxpro 20mg Capsule (Renata)", locationClass: LocationClass.SELLABLE, capacity: 200, current: 120 },
            ],
          },
          {
            id: "shelf-A02-S02",
            code: "A02-S02",
            name: "Shelf 02 (Omeprazole Section)",
            bins: [
              { id: "bin-A02-S02-B01", code: "A02-S02-B01", name: "Bin 01: Seclo 20mg Capsule (SQ-8914)", locationClass: LocationClass.SELLABLE, capacity: 300, current: 210 },
              { id: "bin-A02-S02-B02", code: "A02-S02-B02", name: "Bin 02: Seclo 40mg Capsule (Square)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 65 },
              { id: "bin-A02-S02-B03", code: "A02-S02-B03", name: "Bin 03: Losectil 20mg Capsule (SK+F)", locationClass: LocationClass.SELLABLE, capacity: 200, current: 140 },
              { id: "bin-A02-S02-B04", code: "A02-S02-B04", name: "Bin 04: Proceptin 20mg Capsule (Beximco)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 85 },
            ],
          },
          {
            id: "shelf-A02-S03",
            code: "A02-S03",
            name: "Shelf 03 (Pantoprazole & Rabeprazole Section)",
            bins: [
              { id: "bin-A02-S03-B01", code: "A02-S03-B01", name: "Bin 01: Pantonix 20mg Tablet (Incepta)", locationClass: LocationClass.SELLABLE, capacity: 200, current: 90 },
              { id: "bin-A02-S03-B02", code: "A02-S03-B02", name: "Bin 02: Trupan 20mg Tablet (Beximco)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 60 },
              { id: "bin-A02-S03-B03", code: "A02-S03-B03", name: "Bin 03: Finix 20mg Tablet (Opsonin)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 45 },
              { id: "bin-A02-S03-B04", code: "A02-S03-B04", name: "Bin 04: Rabeloc 20mg Tablet (Square)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 50 },
            ],
          },
        ],
      },
      {
        id: "rack-A03",
        code: "RACK-A03",
        name: "Rack A-03: Cardiovascular, Statins & Anti-Diabetics",
        shelves: [
          {
            id: "shelf-A03-S01",
            code: "A03-S01",
            name: "Shelf 01 (Anti-Hypertensives)",
            bins: [
              { id: "bin-A03-S01-B01", code: "A03-S01-B01", name: "Bin 01: Losartan Potassium 50mg (Osartil)", locationClass: LocationClass.SELLABLE, capacity: 200, current: 110 },
              { id: "bin-A03-S01-B02", code: "A03-S01-B02", name: "Bin 02: Amlodipine 5mg (Amdocal)", locationClass: LocationClass.SELLABLE, capacity: 200, current: 130 },
              { id: "bin-A03-S01-B03", code: "A03-S01-B03", name: "Bin 03: Bisoprolol 2.5mg (Cardibis)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 80 },
              { id: "bin-A03-S01-B04", code: "A03-S01-B04", name: "Bin 04: Telmisartan 40mg (Telma/Bextor)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 95 },
            ],
          },
          {
            id: "shelf-A03-S02",
            code: "A03-S02",
            name: "Shelf 02 (Oral Anti-Diabetics)",
            bins: [
              { id: "bin-A03-S02-B01", code: "A03-S02-B01", name: "Bin 01: Metformin 500mg (Comet/Daomet)", locationClass: LocationClass.SELLABLE, capacity: 250, current: 160 },
              { id: "bin-A03-S02-B02", code: "A03-S02-B02", name: "Bin 02: Linagliptin 5mg (Trazenta/Linatab)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 75 },
              { id: "bin-A03-S02-B03", code: "A03-S02-B03", name: "Bin 03: Empagliflozin 10mg (Jardiance/Emglyn)", locationClass: LocationClass.SELLABLE, capacity: 100, current: 40 },
              { id: "bin-A03-S02-B04", code: "A03-S02-B04", name: "Bin 04: Gliclazide 80mg (Diamicron/Comprid)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 65 },
            ],
          },
        ],
      },
      {
        id: "rack-A04",
        code: "RACK-A04",
        name: "Rack A-04: Syrups, Suspensions & Oral Liquids",
        shelves: [
          {
            id: "shelf-A04-S01",
            code: "A04-S01",
            name: "Shelf 01 (Syrup Bottles & Antihistamines)",
            bins: [
              { id: "bin-A04-S01-B01", code: "A04-S01-B01", name: "Bin 01: Tofen Syrup 100ml (BX-7740)", locationClass: LocationClass.SELLABLE, capacity: 50, current: 28 },
              { id: "bin-A04-S01-B02", code: "A04-S01-B02", name: "Bin 02: Adrylex Syrup 100ml (Square)", locationClass: LocationClass.SELLABLE, capacity: 40, current: 18 },
              { id: "bin-A04-S01-B03", code: "A04-S01-B03", name: "Bin 03: Dextromethorphan Cough Syrups", locationClass: LocationClass.SELLABLE, capacity: 50, current: 32 },
              { id: "bin-A04-S01-B04", code: "A04-S01-B04", name: "Bin 04: Paracetamol Pediatric Drops 15ml", locationClass: LocationClass.SELLABLE, capacity: 60, current: 45 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "zone-b",
    code: "ZONE-B",
    name: "Zone B: Controlled & Antibiotics Room (Schedule-H Segregated)",
    zoneClass: LocationClass.SELLABLE,
    temperature: "15°C–25°C Controlled Room Temp",
    description: "Lockable section for DGDA Schedule-H antibiotics, cephalosporins, quinolones and high-value prescription medicines.",
    racks: [
      {
        id: "rack-B01",
        code: "RACK-B01",
        name: "Rack B-01: Antibiotics (Cephalosporins & Macrolides)",
        shelves: [
          {
            id: "shelf-B01-S01",
            code: "B01-S01",
            name: "Shelf 01 (Azithromycin & Cefixime)",
            bins: [
              { id: "bin-B01-S01-B01", code: "B01-S01-B01", name: "Bin 01: Azithrocin 500mg Tab (IN-1049)", locationClass: LocationClass.SELLABLE, capacity: 120, current: 64 },
              { id: "bin-B01-S01-B02", code: "B01-S01-B02", name: "Bin 02: Zithrin 500mg (Square)", locationClass: LocationClass.SELLABLE, capacity: 120, current: 50 },
              { id: "bin-B01-S01-B03", code: "B01-S01-B03", name: "Bin 03: Cef-3 200mg Capsule (Square)", locationClass: LocationClass.SELLABLE, capacity: 100, current: 42 },
              { id: "bin-B01-S01-B04", code: "B01-S01-B04", name: "Bin 04: Denvar 200mg Capsule (Incepta)", locationClass: LocationClass.SELLABLE, capacity: 100, current: 35 },
            ],
          },
          {
            id: "shelf-B01-S02",
            code: "B01-S02",
            name: "Shelf 02 (Ciprofloxacin & Levofloxacin)",
            bins: [
              { id: "bin-B01-S02-B01", code: "B01-S02-B01", name: "Bin 01: Neofloxin 500mg Tablet (Beximco)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 80 },
              { id: "bin-B01-S02-B02", code: "B01-S02-B02", name: "Bin 02: Ciprocin 500mg Tablet (Square)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 95 },
              { id: "bin-B01-S02-B03", code: "B01-S02-B03", name: "Bin 03: L-Flx 500mg Tablet (Incepta)", locationClass: LocationClass.SELLABLE, capacity: 100, current: 45 },
            ],
          },
        ],
      },
      {
        id: "rack-B02",
        code: "RACK-B02",
        name: "Rack B-02: Respiratory, Montelukast & Inhalers",
        shelves: [
          {
            id: "shelf-B02-S01",
            code: "B02-S01",
            name: "Shelf 01 (Montelukast & Anti-Asthmatics)",
            bins: [
              { id: "bin-B02-S01-B01", code: "B02-S01-B01", name: "Bin 01: Monas 10mg Tab (AC-3091)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 95 },
              { id: "bin-B02-S01-B02", code: "B02-S01-B02", name: "Bin 02: Odmon 10mg Tablet (Square)", locationClass: LocationClass.SELLABLE, capacity: 150, current: 60 },
              { id: "bin-B02-S01-B03", code: "B02-S01-B03", name: "Bin 03: Montene 10mg Tablet (Incepta)", locationClass: LocationClass.SELLABLE, capacity: 120, current: 45 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "zone-c",
    code: "ZONE-C",
    name: "Zone C: Cold-Chain Storage (2°C–8°C Medical Refrigerator)",
    zoneClass: LocationClass.SELLABLE,
    temperature: "2°C–8°C Medical Refrigerator (Power Backup Supported)",
    description: "Cold storage with dual continuous digital data-loggers for Insulins, Vaccines, Toxoids and specialized eye drops.",
    racks: [
      {
        id: "rack-C01",
        code: "RACK-C01",
        name: "Medical Refrigerator #1 (Insulins & Biologicals)",
        shelves: [
          {
            id: "shelf-C01-S01",
            code: "C01-S01",
            name: "Shelf 01: Insulins (Pens & Cartridges)",
            bins: [
              { id: "bin-C01-S01-B01", code: "C01-S01-B01", name: "Bin 01: Lantus SoloStar 100IU (SN-0491)", locationClass: LocationClass.SELLABLE, capacity: 60, current: 45 },
              { id: "bin-C01-S01-B02", code: "C01-S01-B02", name: "Bin 02: Mixtard 30 HM Penfill (Novo Nordisk)", locationClass: LocationClass.SELLABLE, capacity: 60, current: 38 },
              { id: "bin-C01-S01-B03", code: "C01-S01-B03", name: "Bin 03: Humalog Mix 50/50 KwikPen (Eli Lilly)", locationClass: LocationClass.SELLABLE, capacity: 40, current: 15 },
            ],
          },
          {
            id: "shelf-C01-S02",
            code: "C01-S02",
            name: "Shelf 02: Vaccines & Immunoglobulins",
            bins: [
              { id: "bin-C01-S02-B01", code: "C01-S02-B01", name: "Bin 01: Tetanus Toxoid Vaccine Vials", locationClass: LocationClass.SELLABLE, capacity: 50, current: 30 },
              { id: "bin-C01-S02-B02", code: "C01-S02-B02", name: "Bin 02: Rabies Vaccine (Rabipur/Speeda)", locationClass: LocationClass.SELLABLE, capacity: 30, current: 12 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "zone-q",
    code: "ZONE-Q",
    name: "Zone Q: Inbound Receiving & Quarantine Bay (Non-Sellable)",
    zoneClass: LocationClass.QUARANTINE,
    temperature: "Room Temp (Pending Physical Inspection)",
    description: "Physical reception floor staging. All newly received supplier shipments are held here until checked and put away.",
    racks: [
      {
        id: "rack-Q01",
        code: "RACK-Q01",
        name: "Receiving Bay Pallet #01 (Challan Verification)",
        shelves: [
          {
            id: "shelf-Q01-S01",
            code: "Q01-S01",
            name: "Floor Holding Stage",
            bins: [
              { id: "bin-Q01-S01-B01", code: "Q01-S01-B01", name: "Bin Q-01: Quarantine Holding Bay #1", locationClass: LocationClass.QUARANTINE, capacity: 500, current: 130 },
              { id: "bin-Q01-S01-B02", code: "Q01-S01-B02", name: "Bin Q-02: Quarantine Holding Bay #2", locationClass: LocationClass.QUARANTINE, capacity: 500, current: 0 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "zone-d",
    code: "ZONE-D",
    name: "Zone D: Damaged & Disposal Holding (Non-Sellable)",
    zoneClass: LocationClass.DAMAGED,
    temperature: "Room Temp (Segregated / Lockable)",
    description: "Quarantined damaged, broken blister or expired returned stock waiting for manufacturer credit note or disposal.",
    racks: [
      {
        id: "rack-D01",
        code: "RACK-D01",
        name: "Damage Return Pallet (Supplier Credit Exchange)",
        shelves: [
          {
            id: "shelf-D01-S01",
            code: "D01-S01",
            name: "Breakage & Leaked Goods Crate",
            bins: [
              { id: "bin-D01-S01-B01", code: "D01-S01-B01", name: "Bin D-01: Broken / Leaked Vials for Credit Note", locationClass: LocationClass.DAMAGED, capacity: 100, current: 5 },
              { id: "bin-D01-S01-B02", code: "D01-S01-B02", name: "Bin D-02: Expired Return Stock Holding", locationClass: LocationClass.EXPIRED, capacity: 200, current: 14 },
            ],
          },
        ],
      },
    ],
  },
];

/**
 * Flattens the hierarchy tree into a direct list of scannable bins
 */
export const getFlatBins = () => {
  const bins = [];
  for (const zone of locationTreeDB) {
    for (const rack of zone.racks) {
      for (const shelf of rack.shelves) {
        for (const bin of shelf.bins) {
          bins.push({
            ...bin,
            zoneId: zone.id,
            zoneName: zone.name,
            zoneClass: zone.zoneClass,
            rackId: rack.id,
            rackName: rack.name,
            shelfId: shelf.id,
            shelfName: shelf.name,
            fullPath: `${zone.code} > ${rack.code} > ${shelf.code} > ${bin.code}`,
          });
        }
      }
    }
  }
  return bins;
};

/**
 * Fast lookup helper by scannable bin code (e.g. "A01-S02-B04")
 */
export const findBinByCode = (code) => {
  return getFlatBins().find((b) => b.code.toLowerCase() === String(code).toLowerCase());
};

/**
 * Fast lookup helper by bin ID (e.g. "bin-A01-S02-B04")
 */
export const findBinById = (id) => {
  return getFlatBins().find((b) => b.id.toLowerCase() === String(id).toLowerCase());
};

/**
 * Filter bins by status (e.g. LocationClass.SELLABLE)
 */
export const getBinsByClass = (locationClass) => {
  return getFlatBins().filter((b) => b.locationClass === locationClass);
};

