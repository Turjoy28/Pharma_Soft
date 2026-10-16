/**
 * Money utilities for Bangladeshi Pharmacy POS
 * Rule: All financial arithmetic is performed in integer Poisha (1 Taka = 100 Poisha)
 * to avoid IEEE-754 floating-point rounding errors.
 */

/**
 * Converts Taka (decimal or integer) into integer Poisha.
 * @param {number|string} taka 
 * @returns {number} Integer poisha
 */
export function toPoisha(taka) {
  return Math.round(Number(taka || 0) * 100)
}

/**
 * Converts integer Poisha into standard two-decimal Taka string.
 * @param {number} poisha 
 * @returns {string} Formatted Taka e.g. "231.00"
 */
export function formatTaka(poisha) {
  return (Number(poisha || 0) / 100).toFixed(2)
}

/**
 * Calculates complete cart financial totals using exact integer poisha math.
 * @param {Array<{ price: number|string, qty: number }>} items
 * @param {number|string} discountPercent
 */
export function calculateCartTotals(items = [], discountPercent = 0) {
  // 1. Gross Subtotal in Poisha
  const subtotalPoisha = items.reduce((sum, item) => {
    const itemPricePoisha = toPoisha(item.price)
    const itemQty = Math.max(0, Number(item.qty) || 0)
    return sum + itemPricePoisha * itemQty
  }, 0)

  // 2. Trade Discount in Poisha
  const pct = Math.max(0, Number(discountPercent) || 0)
  const discountPoisha = Math.round((subtotalPoisha * pct) / 100)

  // 3. Raw Payable before cash rounding
  const rawPayablePoisha = Math.max(0, subtotalPoisha - discountPoisha)

  // 4. Cash Rounding (nearest 100 poisha / whole 1 Taka for physical cash register)
  const totalPayablePoisha = Math.round(rawPayablePoisha / 100) * 100
  const roundingPoisha = totalPayablePoisha - rawPayablePoisha

  // 5. Total in whole Taka for fast cash calculations
  const totalPayableTaka = Math.round(totalPayablePoisha / 100)

  return {
    subtotalPoisha,
    discountPoisha,
    roundingPoisha,
    totalPayablePoisha,
    totalPayableTaka,
    formatted: {
      subtotal: formatTaka(subtotalPoisha),
      discount: formatTaka(discountPoisha),
      rounding: formatTaka(roundingPoisha),
      totalPayable: formatTaka(totalPayablePoisha),
    },
  }
}
