import { describe, it, expect } from 'vitest'
import { toPoisha, formatTaka, calculateCartTotals } from './money.js'

describe('Pharmacy Money Math (Integer Poisha Rule)', () => {
  it('converts Taka to integer Poisha safely without floating-point errors', () => {
    expect(toPoisha(7.10)).toBe(710)
    expect(toPoisha(3.0)).toBe(300)
    expect(toPoisha(0.1 + 0.2)).toBe(30)
  })

  it('formats integer Poisha to two-decimal Taka string', () => {
    expect(formatTaka(710)).toBe('7.10')
    expect(formatTaka(23100)).toBe('231.00')
    expect(formatTaka(0)).toBe('0.00')
  })

  it('calculates gross subtotal correctly for cart items', () => {
    const items = [
      { price: 3.0, qty: 20 }, // 60 Taka = 6000 poisha
      { price: 7.0, qty: 14 }, // 98 Taka = 9800 poisha
    ]
    const totals = calculateCartTotals(items, 0)
    expect(totals.subtotalPoisha).toBe(15800)
    expect(totals.formatted.subtotal).toBe('158.00')
    expect(totals.totalPayablePoisha).toBe(15800)
  })

  it('calculates trade discount accurately without losing poisha', () => {
    const items = [{ price: 100.0, qty: 1 }] // 10000 poisha
    const totals = calculateCartTotals(items, 5) // 5% discount

    expect(totals.subtotalPoisha).toBe(10000)
    expect(totals.discountPoisha).toBe(500)
    expect(totals.totalPayablePoisha).toBe(9500)
    expect(totals.formatted.totalPayable).toBe('95.00')
  })

  it('applies cash rounding adjustment correctly for whole Taka settlement', () => {
    // 3 items at 7.10 Taka each = 21.30 Taka (2130 poisha)
    const items = [{ price: 7.10, qty: 3 }]
    const totals = calculateCartTotals(items, 0)

    expect(totals.subtotalPoisha).toBe(2130)
    // 21.30 Taka rounds to 21.00 Taka (2100 poisha), rounding adjustment is -30 poisha (-0.30 Taka)
    expect(totals.totalPayablePoisha).toBe(2100)
    expect(totals.roundingPoisha).toBe(-30)
    expect(totals.formatted.totalPayable).toBe('21.00')
    expect(totals.formatted.rounding).toBe('-0.30')
  })

  it('handles empty cart gracefully', () => {
    const totals = calculateCartTotals([], 5)
    expect(totals.subtotalPoisha).toBe(0)
    expect(totals.discountPoisha).toBe(0)
    expect(totals.totalPayablePoisha).toBe(0)
    expect(totals.formatted.totalPayable).toBe('0.00')
  })
})
