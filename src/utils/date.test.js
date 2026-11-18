import { describe, it, expect } from 'vitest'
import { parseMonthYearExpiry } from './date.js'

describe('parseMonthYearExpiry', () => {
  const mockNow = new Date('2026-11-18T12:00:00Z')

  it('converts 03/2026 into the last day of March: 31 Mar 2026', () => {
    const res = parseMonthYearExpiry('03/2026', mockNow)
    expect(res.isValid).toBe(true)
    expect(res.isoDate).toBe('2026-03-31')
    expect(res.date).toBe('2026-03-31')
    expect(res.displayDate).toBe('31 Mar 2026')
    expect(res.formatted).toBe('31 Mar 2026')
    // 2026-03 is before 2026-11, so it is expired relative to mockNow
    expect(res.isExpired).toBe(true)
    expect(res.errorMessage).toContain('Expired product (31 Mar 2026)')
  })

  it('converts future expiry 10/2028 into 31 Oct 2028 with isExpired = false', () => {
    const res = parseMonthYearExpiry('10/2028', mockNow)
    expect(res.isValid).toBe(true)
    expect(res.isoDate).toBe('2028-10-31')
    expect(res.displayDate).toBe('31 Oct 2028')
    expect(res.isExpired).toBe(false)
    expect(res.errorMessage).toBeUndefined()
  })

  it('handles leap year correctly for February (02/2028 -> 29 Feb 2028)', () => {
    const res = parseMonthYearExpiry('02/2028', mockNow)
    expect(res.isValid).toBe(true)
    expect(res.isoDate).toBe('2028-02-29')
    expect(res.displayDate).toBe('29 Feb 2028')
  })

  it('handles non-leap year February (02/2027 -> 28 Feb 2027)', () => {
    const res = parseMonthYearExpiry('02/2027', mockNow)
    expect(res.isValid).toBe(true)
    expect(res.isoDate).toBe('2027-02-28')
    expect(res.displayDate).toBe('28 Feb 2027')
  })

  it('supports 2-digit year format MM/YY (12/28 -> 31 Dec 2028)', () => {
    const res = parseMonthYearExpiry('12/28', mockNow)
    expect(res.isValid).toBe(true)
    expect(res.isoDate).toBe('2028-12-31')
    expect(res.displayDate).toBe('31 Dec 2028')
    expect(res.isExpired).toBe(false)
  })

  it('rejects invalid month numbers (> 12)', () => {
    const res = parseMonthYearExpiry('13/2026', mockNow)
    expect(res.isValid).toBe(false)
    expect(res.errorMessage).toContain("Invalid month '13'")
  })

  it('rejects empty or malformed strings', () => {
    expect(parseMonthYearExpiry('').isValid).toBe(false)
    expect(parseMonthYearExpiry('invalid-date').isValid).toBe(false)
  })
})

