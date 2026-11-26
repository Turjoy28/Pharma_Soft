import { getDaysUntilExpiry } from './date.js'
import { LocationClass } from '../mockServer/locationDB.js'

/**
 * 🗺️ Stock Tree Aggregator (Day 10)
 *
 * Roadmap Rule:
 * "a location never holds a quantity in the model; the tree sums balances.
 *  Empty racks must still appear, or a manager cannot see where to put stock."
 *
 * Sums batch quantities & integer cost valuation from Bin -> Shelf -> Rack -> Zone.
 *
 * @param {Array} locationTree - Hierarchical zones/racks/shelves/bins
 * @param {Array} batches - Active batch records keyed by binId
 * @param {Date} [referenceDate=new Date()]
 */
export function buildStockTree(locationTree = [], batches = [], referenceDate = new Date()) {
  // Index batches by binId in O(B) time
  const batchesByBin = new Map()
  for (const batch of batches) {
    if (!batch?.binId || batch.qtyBase <= 0) continue
    const list = batchesByBin.get(batch.binId) || []
    list.push({
      ...batch,
      daysLeft: getDaysUntilExpiry(batch.expiryDate, referenceDate),
      costValuePoisha: Math.round(Number(batch.qtyBase || 0) * Number(batch.costPerUnitPoisha || 0)),
    })
    batchesByBin.set(batch.binId, list)
  }

  let grandTotalUnits = 0
  let grandTotalCostPoisha = 0
  let grandTotalBins = 0
  let grandOccupiedBins = 0
  let grandEmptyRacks = 0

  const zones = locationTree.map((zone) => {
    let zoneUnits = 0
    let zoneCostPoisha = 0
    let zoneBatchCount = 0
    let zoneBinCount = 0
    let zoneOccupiedBins = 0

    const racks = (zone.racks || []).map((rack) => {
      let rackUnits = 0
      let rackCostPoisha = 0
      let rackBatchCount = 0
      let rackBinCount = 0
      let rackOccupiedBins = 0

      const shelves = (rack.shelves || []).map((shelf) => {
        let shelfUnits = 0
        let shelfCostPoisha = 0
        let shelfBatchCount = 0

        const bins = (shelf.bins || []).map((bin) => {
          const binBatches = (batchesByBin.get(bin.id) || []).sort((a, b) => a.daysLeft - b.daysLeft)
          const binUnits = binBatches.reduce((sum, b) => sum + Number(b.qtyBase || 0), 0)
          const binCostPoisha = binBatches.reduce((sum, b) => sum + b.costValuePoisha, 0)

          shelfUnits += binUnits
          shelfCostPoisha += binCostPoisha
          shelfBatchCount += binBatches.length
          rackBinCount += 1
          if (binBatches.length > 0) rackOccupiedBins += 1

          return {
            ...bin,
            zoneId: zone.id,
            zoneCode: zone.code,
            rackId: rack.id,
            rackCode: rack.code,
            shelfId: shelf.id,
            shelfCode: shelf.code,
            fullPath: `${zone.code} > ${rack.code} > ${shelf.code} > ${bin.code}`,
            totalUnits: binUnits,
            totalCostPoisha: binCostPoisha,
            batchCount: binBatches.length,
            isEmpty: binUnits === 0,
            batches: binBatches,
          }
        })

        rackUnits += shelfUnits
        rackCostPoisha += shelfCostPoisha
        rackBatchCount += shelfBatchCount

        return {
          ...shelf,
          bins,
          totalUnits: shelfUnits,
          totalCostPoisha: shelfCostPoisha,
          batchCount: shelfBatchCount,
          isEmpty: shelfUnits === 0,
        }
      })

      zoneUnits += rackUnits
      zoneCostPoisha += rackCostPoisha
      zoneBatchCount += rackBatchCount
      zoneBinCount += rackBinCount
      zoneOccupiedBins += rackOccupiedBins
      if (rackUnits === 0) grandEmptyRacks += 1

      return {
        ...rack,
        shelves,
        totalUnits: rackUnits,
        totalCostPoisha: rackCostPoisha,
        batchCount: rackBatchCount,
        binCount: rackBinCount,
        occupiedBins: rackOccupiedBins,
        isEmpty: rackUnits === 0,
      }
    })

    grandTotalUnits += zoneUnits
    grandTotalCostPoisha += zoneCostPoisha
    grandTotalBins += zoneBinCount
    grandOccupiedBins += zoneOccupiedBins

    return {
      ...zone,
      racks,
      totalUnits: zoneUnits,
      totalCostPoisha: zoneCostPoisha,
      batchCount: zoneBatchCount,
      binCount: zoneBinCount,
      occupiedBins: zoneOccupiedBins,
      isEmpty: zoneUnits === 0,
    }
  })

  return {
    zones,
    summary: {
      totalZones: zones.length,
      totalRacks: zones.reduce((s, z) => s + z.racks.length, 0),
      emptyRacks: grandEmptyRacks,
      totalBins: grandTotalBins,
      occupiedBins: grandOccupiedBins,
      emptyBins: grandTotalBins - grandOccupiedBins,
      totalUnits: grandTotalUnits,
      totalCostPoisha: grandTotalCostPoisha,
    },
  }
}

/**
 * 🔍 Retrieves batches & summed metrics for any Zone, Rack, Shelf, or Bin ID.
 * Enables GET /v1/stock/by-location/:id
 */
export function getBatchesByLocation(locationId, locationTree = [], batches = [], referenceDate = new Date()) {
  const { zones } = buildStockTree(locationTree, batches, referenceDate)
  const target = String(locationId || '').toLowerCase()

  for (const zone of zones) {
    if (zone.id.toLowerCase() === target || zone.code.toLowerCase() === target) {
      const allBatches = zone.racks.flatMap((r) => r.shelves.flatMap((s) => s.bins.flatMap((b) => b.batches)))
      return {
        level: 'zone',
        location: { id: zone.id, code: zone.code, name: zone.name, locationClass: zone.zoneClass, temperature: zone.temperature },
        totalUnits: zone.totalUnits,
        totalCostPoisha: zone.totalCostPoisha,
        batches: allBatches,
      }
    }

    for (const rack of zone.racks) {
      if (rack.id.toLowerCase() === target || rack.code.toLowerCase() === target) {
        const allBatches = rack.shelves.flatMap((s) => s.bins.flatMap((b) => b.batches))
        return {
          level: 'rack',
          location: { id: rack.id, code: rack.code, name: rack.name, locationClass: zone.zoneClass, zoneName: zone.name },
          totalUnits: rack.totalUnits,
          totalCostPoisha: rack.totalCostPoisha,
          batches: allBatches,
        }
      }

      for (const shelf of rack.shelves) {
        if (shelf.id.toLowerCase() === target || shelf.code.toLowerCase() === target) {
          const allBatches = shelf.bins.flatMap((b) => b.batches)
          return {
            level: 'shelf',
            location: { id: shelf.id, code: shelf.code, name: shelf.name, locationClass: zone.zoneClass, rackName: rack.name },
            totalUnits: shelf.totalUnits,
            totalCostPoisha: shelf.totalCostPoisha,
            batches: allBatches,
          }
        }

        for (const bin of shelf.bins) {
          if (bin.id.toLowerCase() === target || bin.code.toLowerCase() === target) {
            return {
              level: 'bin',
              location: {
                id: bin.id,
                code: bin.code,
                name: bin.name,
                locationClass: bin.locationClass,
                capacity: bin.capacity,
                fullPath: bin.fullPath,
                temperature: zone.temperature,
              },
              totalUnits: bin.totalUnits,
              totalCostPoisha: bin.totalCostPoisha,
              batches: bin.batches,
            }
          }
        }
      }
    }
  }

  return null
}

/**
 * ⏳ Expiry Risk Board Calculator (Day 10)
 *
 * Groups sellable batches into 30, 60, and 90-day risk windows.
 * Rule (Roadmap Day 10):
 * "Value at risk is base quantity times cost per base unit, an integer."
 * "Done when: a test shows the board's total equals the sum of its rows on the fixtures."
 */
export function buildExpiryBoard(batches = [], locationTree = [], options = {}) {
  const { rackId = 'all', referenceDate = new Date() } = options

  // Build quick bin lookup map from tree for rack & bin labels
  const binLookup = new Map()
  const racksList = []
  for (const zone of locationTree) {
    for (const rack of zone.racks || []) {
      racksList.push({ id: rack.id, code: rack.code, name: rack.name, zoneCode: zone.code })
      for (const shelf of rack.shelves || []) {
        for (const bin of shelf.bins || []) {
          binLookup.set(bin.id, {
            binCode: bin.code,
            binName: bin.name,
            rackId: rack.id,
            rackCode: rack.code,
            rackName: rack.name,
            shelfCode: shelf.code,
            zoneCode: zone.code,
          })
        }
      }
    }
  }

  const windows = {
    critical30: { id: 'critical30', label: '0–30 Days (Critical)', maxDays: 30, rows: [], totalUnits: 0, valueAtRiskPoisha: 0 },
    warning60: { id: 'warning60', label: '31–60 Days (Warning)', maxDays: 60, rows: [], totalUnits: 0, valueAtRiskPoisha: 0 },
    notice90: { id: 'notice90', label: '61–90 Days (Notice)', maxDays: 90, rows: [], totalUnits: 0, valueAtRiskPoisha: 0 },
  }

  const allRows = []

  for (const batch of batches) {
    if (!batch || batch.qtyBase <= 0) continue
    // Only evaluate active SELLABLE batches on the expiry board (or batches within <= 90d)
    if (batch.status && batch.status !== LocationClass.SELLABLE) continue

    const binInfo = binLookup.get(batch.binId) || {}
    const effectiveRackId = batch.rackId || binInfo.rackId || ''
    if (rackId && rackId !== 'all' && effectiveRackId !== rackId) {
      continue
    }

    const daysLeft = getDaysUntilExpiry(batch.expiryDate, referenceDate)
    if (daysLeft > 90) continue

    // Strict integer calculation: base quantity * integer cost per base unit
    const qtyBase = Math.trunc(Number(batch.qtyBase) || 0)
    const costPerUnitPoisha = Math.trunc(Number(batch.costPerUnitPoisha) || 0)
    const valueAtRiskPoisha = qtyBase * costPerUnitPoisha

    let windowKey = 'notice90'
    if (daysLeft <= 30) {
      windowKey = 'critical30'
    } else if (daysLeft <= 60) {
      windowKey = 'warning60'
    }

    const row = {
      ...batch,
      rackId: effectiveRackId,
      rackCode: binInfo.rackCode || effectiveRackId,
      binCode: binInfo.binCode || batch.binId,
      shelfCode: binInfo.shelfCode || '',
      daysLeft,
      window: windowKey,
      qtyBase,
      costPerUnitPoisha,
      valueAtRiskPoisha,
    }

    windows[windowKey].rows.push(row)
    windows[windowKey].totalUnits += qtyBase
    windows[windowKey].valueAtRiskPoisha += valueAtRiskPoisha
    allRows.push(row)
  }

  // Sort each window by soonest expiry first, then highest Taka at risk
  for (const key of Object.keys(windows)) {
    windows[key].rows.sort((a, b) => a.daysLeft - b.daysLeft || b.valueAtRiskPoisha - a.valueAtRiskPoisha)
  }
  allRows.sort((a, b) => a.daysLeft - b.daysLeft || b.valueAtRiskPoisha - a.valueAtRiskPoisha)

  const totalValueAtRiskPoisha =
    windows.critical30.valueAtRiskPoisha +
    windows.warning60.valueAtRiskPoisha +
    windows.notice90.valueAtRiskPoisha

  const totalUnitsAtRisk =
    windows.critical30.totalUnits +
    windows.warning60.totalUnits +
    windows.notice90.totalUnits

  return {
    windows,
    rows: allRows,
    racks: racksList,
    summary: {
      totalBatchesAtRisk: allRows.length,
      totalUnitsAtRisk,
      totalValueAtRiskPoisha,
      criticalCount: windows.critical30.rows.length,
      warningCount: windows.warning60.rows.length,
      noticeCount: windows.notice90.rows.length,
    },
  }
}
