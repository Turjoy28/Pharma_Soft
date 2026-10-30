/**
 * 🛒 Cart & Catalog Slice
 * Manages cart items, catalog, discounts, and item quantities.
 */
export const createCartSlice = (set, get) => ({
  // Cart & Catalog State
  cartItems: [],
  catalog: [],
  discountPercent: 5,
  tenderAmount: 500,

  // ➕ Increment Cart Item Quantity
  incrementQty: (id) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      ),
    }))
  },

  // ➖ Decrement Cart Item Quantity
  decrementQty: (id) => {
    set((state) => ({
      cartItems: state.cartItems
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.qty - 1
            return nextQty > 0 ? { ...item, qty: nextQty } : null
          }
          return item
        })
        .filter(Boolean),
    }))
  },

  // ❌ Remove Item from Cart
  removeItem: (id) => {
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.id !== id),
    }))
  },

  // 🧹 Clear Entire Cart
  clearCart: () => set({ cartItems: [] }),

  // 🔁 Reload default dispensed medicines for active ticket
  reloadTicketMedicines: () => {
    const selected = get().selectedTicket
    if (selected?.items) {
      set({
        cartItems: selected.items.map((item, idx) => ({ ...item, serialNumber: idx + 1 })),
      })
    } else {
      set({ cartItems: [] })
    }
  },

  // ⚡ Quick Add Medicine from Catalog Ribbon
  quickAddMedicine: (med) => {
    set((state) => {
      const existing = state.cartItems.find((item) => item.medId === med.id)
      if (existing) {
        return {
          cartItems: state.cartItems.map((item) =>
            item.medId === med.id ? { ...item, qty: item.qty + 1 } : item
          ),
        }
      }
      return {
        cartItems: [
          ...state.cartItems,
          {
            id: `item-${Date.now()}-${med.id}`,
            medId: med.id,
            brandName: `${med.brandName} ${med.generic.split(' ')[0] || ''}`.trim(),
            generic: med.generic,
            batch: med.batch,
            expiry: med.expiry,
            price: med.price,
            qty: 1,
          },
        ],
      }
    })
  },

  setDiscountPercent: (discountPercent) => set({ discountPercent }),
  setTenderAmount: (tenderAmount) => set({ tenderAmount }),
})

