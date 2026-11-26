import { describe, it, expect } from 'vitest'
import { locationTreeDB, LocationClass } from '../mockServer/locationDB.js'
import { stockBatchesDB } from '../mockServer/stockBatchesDB.js'
import { buildStockTree, getBatchesByLocation, buildExpiryBoard } from './inventory.js'

describe('Day 10: Stock Tree & Expiry Risk Board Domain Logic', () => {
  it('sums batch balances upward (Bin -> Shelf -> Rack -> Zone) without storing quantity on locations', () => {
    const { zones, summary } = buildStockTree(locationTreeDB, stockBatchesDB)

    const expectedTotalUnits = stockBatchesDB.reduce((s, b) => s + b.qtyBase, 0)
    expect(summary.totalUnits).toBe(expectedTotalUnits)

    // Verify Zone A sums its child racks exactly
    const zoneA = zones.find((z) => z.id === 'zone-a')
    const sumOfRacksInZoneA = zoneA.racks.reduce((s, r) => s + r.totalUnits, 0)
    expect(zoneA.totalUnits).toBe(sumOfRacksInZoneA)
  })

  it('keeps empty racks and empty bins visible in the tree so managers can spot free space', () => {
    const { zones, summary } = buildStockTree(locationTreeDB, stockBatchesDB)
    const zoneA = zones.find((z) => z.id === 'zone-a')
    const emptyRack = zoneA.racks.find((r) => r.id === 'rack-A05')

    expect(emptyRack).toBeDefined()
    expect(emptyRack.isEmpty).toBe(true)
    expect(emptyRack.totalUnits).toBe(0)
    expect(summary.emptyRacks).toBeGreaterThanOrEqual(1)
  })

  it('allows reaching any bin and inspecting its exact batches in 3 steps (Zone -> Rack -> Bin)', () => {
    const detail = getBatchesByLocation('bin-A02-S02-B01', locationTreeDB, stockBatchesDB)
    expect(detail).not.toBeNull()
    expect(detail.level).toBe('bin')
    expect(detail.location.code).toBe('A02-S02-B01')
    expect(detail.batches.length).toBe(2) // Seclo 20mg short-exp + fresh batch
    expect(detail.totalUnits).toBe(350)
  })

  it('computes integer Value at Risk and proves board total equals the exact sum of its rows', () => {
    const fixedNow = new Date('2026-11-26T00:00:00')
    const fixtures = [
      {
        id: 'b1',
        brandName: 'Med A',
        batchNo: 'B-1',
        binId: 'bin-A01-S02-B04',
        rackId: 'rack-A01',
        expiryDate: '2026-12-10', // 14 days -> critical30
        qtyBase: 25,
        costPerUnitPoisha: 1250,
        status: LocationClass.SELLABLE,
      },
      {
        id: 'b2',
        brandName: 'Med B',
        batchNo: 'B-2',
        binId: 'bin-B01-S01-B01',
        rackId: 'rack-B01',
        expiryDate: '2027-01-10', // 45 days -> warning60
        qtyBase: 40,
        costPerUnitPoisha: 3000,
        status: LocationClass.SELLABLE,
      },
      {
        id: 'b3',
        brandName: 'Med C',
        batchNo: 'B-3',
        binId: 'bin-B01-S01-B03',
        rackId: 'rack-B01',
        expiryDate: '2027-02-14', // 80 days -> notice90
        qtyBase: 10,
        costPerUnitPoisha: 5000,
        status: LocationClass.SELLABLE,
      },
      {
        id: 'b4',
        brandName: 'Med Safe (>90d)',
        batchNo: 'B-4',
        binId: 'bin-A01-S02-B04',
        rackId: 'rack-A01',
        expiryDate: '2027-12-31', // > 90 days -> excluded from risk board
        qtyBase: 100,
        costPerUnitPoisha: 1000,
        status: LocationClass.SELLABLE,
      },
      {
        id: 'b5',
        brandName: 'Med Quarantine',
        batchNo: 'B-5',
        binId: 'bin-Q01-S01-B01',
        rackId: 'rack-Q01',
        expiryDate: '2026-12-05', // Non-sellable -> excluded
        qtyBase: 50,
        costPerUnitPoisha: 500,
        status: LocationClass.QUARANTINE,
      },
    ]

    const board = buildExpiryBoard(fixtures, locationTreeDB, { referenceDate: fixedNow })

    expect(board.windows.critical30.rows).toHaveLength(1)
    expect(board.windows.warning60.rows).toHaveLength(1)
    expect(board.windows.notice90.rows).toHaveLength(1)
    expect(board.rows).toHaveLength(3)

    // Roadmap Done-When check:
    // Board's total equals the exact sum of its rows (integer Poisha)
    const sumOfRowValues = board.rows.reduce(
      (sum, row) => sum + row.qtyBase * row.costPerUnitPoisha,
      0
    )
    expect(Number.isInteger(board.summary.totalValueAtRiskPoisha)).toBe(true)
    expect(board.summary.totalValueAtRiskPoisha).toBe(sumOfRowValues)
    expect(board.summary.totalValueAtRiskPoisha).toBe(25 * 1250 + 40 * 3000 + 10 * 5000)

    // Verify rack filter narrows rows accurately and still sums to row total
    const filtered = buildExpiryBoard(fixtures, locationTreeDB, {
      rackId: 'rack-B01',
      referenceDate: fixedNow,
    })
    expect(filtered.rows).toHaveLength(2)
    expect(filtered.summary.totalValueAtRiskPoisha).toBe(40 * 3000 + 10 * 5000)
  })
})
