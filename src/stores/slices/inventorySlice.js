import { inventoryService } from '../../services/api.js'

/**
 * 📦 Stock by Location & Expiry Risk Board Slice (Day 10)
 * Manages the Stock Explorer tree (Zone -> Rack -> Shelf -> Bin),
 * Bin batch inspection, and 30/60/90-day Expiry Risk Board.
 */
export const createInventorySlice = (set, get) => ({
  // 1. Modal & Tab State
  isInventoryOpen: false,
  inventoryTab: 'tree', // 'tree' | 'expiry'

  openInventory: (tab = 'tree') => {
    set({ isInventoryOpen: true, inventoryTab: tab })
    get().fetchInventoryData()
  },

  closeInventory: () => set({ isInventoryOpen: false }),

  toggleInventory: () => {
    const next = !get().isInventoryOpen
    set({ isInventoryOpen: next })
    if (next) {
      get().fetchInventoryData()
    }
  },

  setInventoryTab: (tab) => set({ inventoryTab: tab }),

  // 2. Stock Tree & Expiry Board State
  stockTree: [],
  stockSummary: {
    totalZones: 0,
    totalRacks: 0,
    emptyRacks: 0,
    totalBins: 0,
    occupiedBins: 0,
    emptyBins: 0,
    totalUnits: 0,
    totalCostPoisha: 0,
  },
  selectedLocationId: 'bin-A01-S02-B04',
  selectedLocationDetail: null,
  expiryBoard: {
    windows: {
      critical30: { rows: [], totalUnits: 0, valueAtRiskPoisha: 0 },
      warning60: { rows: [], totalUnits: 0, valueAtRiskPoisha: 0 },
      notice90: { rows: [], totalUnits: 0, valueAtRiskPoisha: 0 },
    },
    rows: [],
    racks: [],
    summary: {
      totalBatchesAtRisk: 0,
      totalUnitsAtRisk: 0,
      totalValueAtRiskPoisha: 0,
      criticalCount: 0,
      warningCount: 0,
      noticeCount: 0,
    },
  },
  selectedRackFilter: 'all',
  loadingInventory: false,
  inventoryError: null,
  inventoryActionMessage: null,

  // 3. Fetch Tree, Selected Location Detail, and Expiry Board
  fetchInventoryData: async (rackIdOverride) => {
    const rackId = rackIdOverride ?? get().selectedRackFilter ?? 'all'
    const currentLocId = get().selectedLocationId || 'bin-A01-S02-B04'
    set({ loadingInventory: true, inventoryError: null })

    try {
      const [treeRes, locDetailRes, expiryRes] = await Promise.all([
        inventoryService.getStockTree(),
        inventoryService.getByLocation(currentLocId).catch(() => null),
        inventoryService.getExpiryBoard(rackId),
      ])

      set({
        stockTree: treeRes?.zones || [],
        stockSummary: treeRes?.summary || get().stockSummary,
        selectedLocationDetail: locDetailRes || null,
        expiryBoard: expiryRes || get().expiryBoard,
        loadingInventory: false,
      })
    } catch (err) {
      console.error('[Inventory Slice] Failed to fetch stock/expiry data:', err)
      set({
        loadingInventory: false,
        inventoryError: 'Failed to load stock tree and expiry board.',
      })
    }
  },

  // 4. Select Zone, Rack, Shelf, or Bin & Fetch Its Batches
  selectLocationNode: async (locationId) => {
    set({ selectedLocationId: locationId, inventoryError: null })
    try {
      const detail = await inventoryService.getByLocation(locationId)
      set({ selectedLocationDetail: detail })
    } catch (err) {
      console.warn('[Inventory Slice] Location detail fetch error:', err)
    }
  },

  // 5. Filter Expiry Board by Rack
  setRackFilter: async (rackId) => {
    set({ selectedRackFilter: rackId, loadingInventory: true })
    try {
      const expiryRes = await inventoryService.getExpiryBoard(rackId)
      set({ expiryBoard: expiryRes, loadingInventory: false })
    } catch (err) {
      console.warn('[Inventory Slice] Rack filter error:', err)
      set({ loadingInventory: false })
    }
  },

  // 6. Execute One-Click Expiry Action (Move to Frontline / Supplier Return / Discount)
  applyExpiryAction: async (batchId, actionType) => {
    set({ inventoryActionMessage: null, inventoryError: null })
    try {
      const res = await inventoryService.applyExpiryAction(batchId, actionType)
      set({ inventoryActionMessage: res?.message || 'Action applied.' })
      // Refresh both tree and board
      await get().fetchInventoryData()
      return { success: true, res }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Action failed.'
      set({ inventoryError: msg })
      return { success: false, error: msg }
    }
  },

  clearInventoryFeedback: () => set({ inventoryActionMessage: null, inventoryError: null }),
})
