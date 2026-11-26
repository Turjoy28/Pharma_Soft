/**
 * 📅 Date & Expiry Utilities for DGDA Pharmaceutical Compliance
 * 
 * Regulatory Requirement (DGDA / Gazette Sec 14):
 * Expiry printed as MM/YYYY means the medicine is valid until the very last day of that month.
 * e.g., "03/2026" expires on "31 Mar 2026" (2026-03-31).
 */

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

/**
 * Parses and formats MM/YYYY or MM/YY pharmaceutical expiry strings.
 * Converts "03/2026" -> 2026-03-31 and "31 Mar 2026".
 * Automatically flags if the expiry date is in the past.
 * 
 * @param {string} input - e.g. "03/2026", "12/28", "08/2027"
 * @param {Date} [referenceDate=new Date()] - Reference date for checking expiry
 * @returns {{
 *   isValid: boolean,
 *   isoDate: string | null,
 *   date: string | null,
 *   displayDate: string | null,
 *   formatted: string | null,
 *   isExpired: boolean,
 *   errorMessage?: string
 * }}
 */
export function parseMonthYearExpiry(input, referenceDate = new Date()) {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      isoDate: null,
      date: null,
      displayDate: null,
      formatted: null,
      isExpired: false,
      errorMessage: 'Expiry date is required (MM/YYYY)',
    }
  }

  const clean = input.trim().replace(/\s+/g, '')

  // Supported formats: MM/YYYY, MM-YYYY, MM/YY, MM-YY, YYYY-MM
  let month
  let year

  if (/^\d{1,2}[/-]\d{4}$/.test(clean)) {
    // MM/YYYY or MM-YYYY
    const parts = clean.split(/[/-]/)
    month = parseInt(parts[0], 10)
    year = parseInt(parts[1], 10)
  } else if (/^\d{1,2}[/-]\d{2}$/.test(clean)) {
    // MM/YY or MM-YY (e.g. 12/26 -> 12/2026)
    const parts = clean.split(/[/-]/)
    month = parseInt(parts[0], 10)
    year = 2000 + parseInt(parts[1], 10)
  } else if (/^\d{4}[/-]\d{1,2}$/.test(clean)) {
    // YYYY-MM
    const parts = clean.split(/[/-]/)
    year = parseInt(parts[0], 10)
    month = parseInt(parts[1], 10)
  } else {
    return {
      isValid: false,
      isoDate: null,
      date: null,
      displayDate: null,
      formatted: null,
      isExpired: false,
      errorMessage: 'Invalid format. Use MM/YYYY (e.g., 03/2026)',
    }
  }

  if (month < 1 || month > 12) {
    return {
      isValid: false,
      isoDate: null,
      date: null,
      displayDate: null,
      formatted: null,
      isExpired: false,
      errorMessage: `Invalid month '${month}'. Month must be between 01 and 12.`,
    }
  }

  if (year < 2000 || year > 2100) {
    return {
      isValid: false,
      isoDate: null,
      date: null,
      displayDate: null,
      formatted: null,
      isExpired: false,
      errorMessage: `Invalid year '${year}'.`,
    }
  }

  // Calculate the last day of the given month:
  // new Date(year, month, 0) gives the last day of the specified month (1-indexed month)
  const lastDayDate = new Date(year, month, 0)
  const lastDay = lastDayDate.getDate()

  const mm = String(month).padStart(2, '0')
  const dd = String(lastDay).padStart(2, '0')
  const isoDate = `${year}-${mm}-${dd}`
  const monthName = MONTH_NAMES[month - 1]
  const displayDate = `${lastDay} ${monthName} ${year}`

  // Check if expired compared to reference date (using end of day)
  const expiryEndOfDay = new Date(year, month - 1, lastDay, 23, 59, 59, 999)
  const isExpired = expiryEndOfDay < referenceDate

  return {
    isValid: true,
    isoDate,
    date: isoDate,
    displayDate,
    formatted: displayDate,
    isExpired,
    errorMessage: isExpired ? `Expired product (${displayDate}). Cannot receive expired stock into inventory.` : undefined,
  }
}

/**
 * Calculates whole calendar days remaining until an ISO date (YYYY-MM-DD).
 * Positive = future days left; 0 = expires today; negative = already expired.
 *
 * @param {string} isoDate - e.g. "2026-12-15"
 * @param {Date} [referenceDate=new Date()]
 * @returns {number} Integer calendar days difference
 */
export function getDaysUntilExpiry(isoDate, referenceDate = new Date()) {
  if (!isoDate || typeof isoDate !== 'string') return 0
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return 0

  const refUtc = Date.UTC(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  )
  const expUtc = Date.UTC(y, m - 1, d)
  return Math.round((expUtc - refUtc) / (1000 * 60 * 60 * 24))
}

