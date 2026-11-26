import axios from 'axios'

/**
 * 🌐 Central Axios Client
 * Senior Fix: Use relative same-origin baseURL ('/api') instead of a fake external domain.
 * Why? A fake external domain causes the browser to send a CORS preflight OPTIONS request
 * that fails with ERR_NAME_NOT_RESOLVED / Network Error before MSW can intercept it!
 */
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
})

/**
 * Global Response Interceptor:
 * Automatically logs network failures for easier debugging.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn(
      `[API Client Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} ->`,
      error.response?.status || error.message
    )
    return Promise.reject(error)
  }
)

/**
 * 🎟️ Ticket Service (Counter 1 Dispensing Queue & Billing)
 */
export const ticketService = {
  /**
   * Fetches all active dispensing tickets
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    const response = await apiClient.get('/tickets')
    return response.data?.tickets || []
  },

  /**
   * Fetches exact ticket details by ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  getById: async (id) => {
    const response = await apiClient.get(`/tickets/${id}`)
    return response.data?.ticket || null
  },

  /**
   * Finalizes ticket payment and creates a sales invoice (Day 8 Settlement)
   * @param {string} id
   * @param {Object} paymentData
   * @returns {Promise<Object>}
   */
  pay: async (id, paymentData) => {
    const response = await apiClient.post(`/tickets/${id}/pay`, paymentData)
    return response.data
  },

  /**
   * Creates a new dispensing ticket (Counter 1 -> Counter 2)
   * @param {Object} ticketData
   * @returns {Promise<Object>}
   */
  create: async (ticketData) => {
    const response = await apiClient.post('/tickets', ticketData)
    return response.data
  },
}

/**
 * 📦 Medicine Service (Catalog & Inventory)
 */
export const medicineService = {
  /**
   * Fetches medicines catalog for quick-add ribbon
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    const response = await apiClient.get('/medicines')
    return response.data?.medicines || []
  },
}

/**
 * 📥 Inbound Goods Receiving & Put-Away Service (Day 9)
 */
export const receivingService = {
  /**
   * Fetches official Bangladesh suppliers catalog
   */
  getSuppliers: async () => {
    const response = await apiClient.get('/suppliers')
    return response.data?.suppliers || []
  },

  /**
   * Fetches physical store hierarchy tree and scannable flat bins
   */
  getLocations: async () => {
    const response = await apiClient.get('/locations')
    return response.data || { locations: [], bins: [] }
  },

  /**
   * Fetches inbound delivery receipts history
   */
  getReceipts: async () => {
    const response = await apiClient.get('/receipts')
    return response.data?.receipts || []
  },

  /**
   * Saves an inbound goods receipt/challan and places items in QUARANTINE
   * @param {Object} receiptData
   */
  createReceipt: async (receiptData) => {
    const response = await apiClient.post('/receipts', receiptData)
    return response.data
  },

  /**
   * Fetches pending items waiting in quarantine for put-away
   */
  getPutAwayQueue: async () => {
    const response = await apiClient.get('/putaway')
    return response.data || { queue: [], totalPacks: 0, totalBaseUnits: 0 }
  },

  /**
   * Moves a quarantined item into a specific SELLABLE bin & updates inventory
   * @param {{ itemId: string, targetBinId: string, notes?: string }} payload
   */
  executePutAway: async (payload) => {
    const response = await apiClient.post('/putaway', payload)
    return response.data
  },
}

/**
 * 🗺️ Stock by Location & Expiry Risk Board Service (Day 10)
 */
export const inventoryService = {
  /**
   * Fetches aggregated physical stock tree (Zone -> Rack -> Shelf -> Bin)
   */
  getStockTree: async () => {
    const response = await apiClient.get('/stock/tree')
    return response.data
  },

  /**
   * Fetches batch balances inside a specific Zone, Rack, Shelf, or Bin
   * @param {string} locationId
   */
  getByLocation: async (locationId) => {
    const response = await apiClient.get(`/stock/by-location/${encodeURIComponent(locationId)}`)
    return response.data
  },

  /**
   * Fetches 30/60/90-day Expiry Risk Board (with optional rack filter)
   * @param {string} [rackId='all']
   */
  getExpiryBoard: async (rackId = 'all') => {
    const response = await apiClient.get('/expiry-board', { params: { rackId } })
    return response.data
  },

  /**
   * Applies an inventory mitigation action on a near-expiry batch
   * @param {string} batchId
   * @param {'fefo_push' | 'supplier_return' | 'discount'} action
   */
  applyExpiryAction: async (batchId, action) => {
    const response = await apiClient.post(`/expiry-board/${encodeURIComponent(batchId)}/action`, {
      action,
    })
    return response.data
  },
}


