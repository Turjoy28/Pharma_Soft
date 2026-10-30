import MedicineGrid from './MedicineGrid'
import PrescriptionBasket from './PrescriptionBasket'

/**
 * 🏥 DispensingStation (Counter 1)
 * High-performance split workstation for Pharmacist Dispensing & Rx Verification:
 * - Left column (7 Cols): Multi-search, fast category filters, rapid dispense cards & rack locator
 * - Right column (5 Cols): Real-time FEFO pick list, patient/prescriber meta & [F12] Counter 2 dispatch
 */
function DispensingStation() {
  return (
    <div className="grid grid-cols-12 gap-3 items-start max-w-[1920px] mx-auto w-full">
      {/* LEFT COLUMN: Search, Categories & Rapid Product Dispense (7 Cols on desktop) */}
      <MedicineGrid />

      {/* RIGHT COLUMN: Active Prescription Bill / Spreadsheet Cart (5 Cols on desktop) */}
      <PrescriptionBasket />
    </div>
  )
}

export default DispensingStation
