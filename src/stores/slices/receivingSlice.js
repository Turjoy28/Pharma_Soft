import { receivingService, medicineService } from '../../services/api.js'

/**
 * 📥 Receiving & Put-Away Slice (Day 9)
 * Manages inbound supplier deliveries (Challans), quarantine queue triage,
 * and put-away into sellable physical store locations.
 */
export const createReceivingSlice = (set, get) => ({
  // 1. Workstation Modal State
  isReceivingOpen: false,
  receivingTab: 'receipt', // 'receipt' | 'putaway'

  openReceiving: (tab = 'receipt') => {
    set({ isReceivingOpen: true, receivingTab: tab })
    get().fetchReceivingData()
  },

  closeReceiving: () => set({ isReceivingOpen: false }),

  toggleReceiving: () => {
    const nextState = !get().isReceivingOpen
    set({ isReceivingOpen: nextState })
    if (nextState) {
      get().fetchReceivingData()
    }
  },

  setReceivingTab: (tab) => set({ receivingTab: tab }),

  // 2. Data State
  suppliers: [],
  locationTree: [],
  flatBins: [],
  quarantineQueue: [],
  loadingReceiving: false,
  receivingError: null,
  receivingSuccessMessage: null,

  // 3. Fetch Initial Data for Receiving & Put-Away
  fetchReceivingData: async () => {
    set({ loadingReceiving: true, receivingError: null })
    try {
      const [suppliers, locData, putAwayData] = await Promise.all([
        receivingService.getSuppliers(),
        receivingService.getLocations(),
        receivingService.getPutAwayQueue(),
      ])

      set({
        suppliers: suppliers || [],
        locationTree: locData?.locations || [],
        flatBins: locData?.bins || [],
        quarantineQueue: putAwayData?.queue || [],
        loadingReceiving: false,
      })
    } catch (err) {
      console.error('[Receiving Slice] Failed to load data:', err)
      set({
        loadingReceiving: false,
        receivingError: 'Failed to connect to receiving service. Please try again.',
      })
    }
  },

  // 4. Submit Inbound Goods Receipt (Challan Form)
  submitGoodsReceipt: async (receiptData) => {
    set({ loadingReceiving: true, receivingError: null })
    try {
      const result = await receivingService.createReceipt(receiptData)

      // Prepend newly created quarantine items to the local queue
      if (result?.quarantineItems?.length) {
        set((s) => ({
          quarantineQueue: [...result.quarantineItems, ...s.quarantineQueue],
          receivingSuccessMessage: `Receipt #${result.receipt?.receiptNo || ''} recorded! ${result.quarantineItems.length} items placed in QUARANTINE.`,
        }))
      }

      set({ loadingReceiving: false })
      return { success: true, result }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit goods receipt'
      set({ loadingReceiving: false, receivingError: msg })
      return { success: false, error: msg }
    }
  },

  // 5. Execute Put-Away (Moves item from Quarantine -> Sellable Bin)
  executePutAway: async ({ itemId, targetBinId, notes }) => {
    set({ loadingReceiving: true, receivingError: null })
    try {
      const result = await receivingService.executePutAway({ itemId, targetBinId, notes })

      // Shrink the local quarantine list (Day 9 roadmap: "the put-away list shrinks as lines are placed")
      set((s) => ({
        quarantineQueue: s.quarantineQueue.filter((item) => item.id !== itemId),
        receivingSuccessMessage: result?.message || 'Item put away successfully!',
        loadingReceiving: false,
      }))

      // Re-fetch catalog so Counter 1 & 2 immediately reflect the added stock!
      try {
        const freshCatalog = await medicineService.getAll()
        set({ catalog: freshCatalog })
      } catch (e) {
        console.warn('Catalog refresh warning:', e)
      }

      return { success: true, result }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to execute put-away'
      set({ loadingReceiving: false, receivingError: msg })
      return { success: false, error: msg }
    }
  },

  clearReceivingFeedback: () => set({ receivingError: null, receivingSuccessMessage: null }),
})

