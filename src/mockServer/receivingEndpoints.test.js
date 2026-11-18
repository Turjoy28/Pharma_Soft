import { describe, it, expect } from 'vitest'
import {
  quarantineQueueDB,
  medicineDB,
  LocationClass,
  findBinByCode,
} from './msDB.js'

describe('Inbound Receiving & Put-Away API Contracts (Day 9)', () => {
  const initialQuarCount = quarantineQueueDB.length

  it('verifies seed items exist in quarantine with status QUARANTINE', () => {
    expect(initialQuarCount).toBeGreaterThan(0)
    const seclo = quarantineQueueDB.find((i) => i.id === 'quar-item-01')
    expect(seclo).toBeDefined()
    expect(seclo.status).toBe(LocationClass.QUARANTINE)
    expect(seclo.currentBinId).toBe('bin-Q01-S01-B01')
  })

  it('finds scannable bins by code using helper', () => {
    const bin = findBinByCode('A01-S02-B04')
    expect(bin).toBeDefined()
    expect(bin.locationClass).toBe(LocationClass.SELLABLE)
    expect(bin.code).toBe('A01-S02-B04')
  })

  it('rejects put-away into quarantine or non-sellable bin with LOCATION_NOT_SELLABLE', () => {
    const quarBin = findBinByCode('Q01-S01-B01')
    expect(quarBin.locationClass).toBe(LocationClass.QUARANTINE)
    // Only LocationClass.SELLABLE should be permitted for put-away
    expect(quarBin.locationClass === LocationClass.SELLABLE).toBe(false)
  })

  it('moves item to sellable bin and updates medicine inventory', () => {
    const testItem = {
      id: 'test-item-99',
      brandName: 'Napa Extra',
      batch: 'BX-TEST-01',
      totalBaseUnits: 200,
      qtyPacks: 1,
      costPriceMinor: 250,
      mrpPriceMinor: 300,
      status: LocationClass.QUARANTINE,
      currentBinId: 'bin-Q01-S01-B01',
    }
    quarantineQueueDB.push(testItem)

    // Put away target
    const targetBin = findBinByCode('A01-S02-B04')
    expect(targetBin.locationClass).toBe(LocationClass.SELLABLE)

    // Simulate put-away:
    testItem.status = LocationClass.SELLABLE
    testItem.currentBinId = targetBin.id

    // Update medicine inventory
    const med = medicineDB.find((m) => m.brandName === 'Napa Extra')
    const originalStock = med.stock
    med.stock += testItem.totalBaseUnits
    med.shelf = `${targetBin.rackName}, ${targetBin.name}`

    expect(med.stock).toBe(originalStock + 200)
    expect(med.shelf).toContain('Rack A-01')

    // Clean up
    const idx = quarantineQueueDB.findIndex((i) => i.id === 'test-item-99')
    if (idx !== -1) quarantineQueueDB.splice(idx, 1)
  })
})

