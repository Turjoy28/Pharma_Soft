function TicketCard({ ticket, isSelected = false, onSelectTicket }) {
  const {
    id,
    ticketNumber,
    status,
    statusLabel,
    timeAgo,
    totalAmount,
    patientName,
    patientNote,
    doctor,
    dispenser,
    itemsDescription,
  } = ticket

  // 1. Outer Card Border & Background styling mapped cleanly by status
  const cardStyleMap = {
    active: 'bg-teal-50/70 border-2 border-pharma-700 rounded p-3 relative shadow-xs',
    emergency: 'bg-white border-l-4 border-l-rose-600 border border-slate-300 hover:border-slate-400 rounded p-3 relative shadow-2xs',
    held: 'bg-slate-50 border border-dashed border-slate-300 rounded p-3 relative',
    default: 'bg-white border border-slate-300 hover:border-slate-400 rounded p-3 relative shadow-2xs',
  }

  // 2. Status Pill Badge styling
  const badgeStyleMap = {
    active: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    verified: 'bg-blue-50 text-blue-800 border border-blue-200',
    emergency: 'bg-rose-100 text-rose-800 border border-rose-300 font-mono',
    'cold-chain': 'bg-teal-50 text-teal-800 border border-teal-200 font-mono',
    held: 'bg-amber-50 text-amber-800 border border-amber-200',
  }

  // 3. Timer badge colors
  const timerStyleMap = {
    active: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    held: 'text-rose-700 bg-white border-rose-200',
    default: 'text-amber-700 bg-amber-50 border-amber-200',
  }

  // 4. Ticket # badge
  const ticketBadgeClass = isSelected
    ? 'bg-pharma-700 text-white'
    : status === 'held'
    ? 'bg-amber-100 text-amber-800 border border-amber-300'
    : status === 'emergency'
    ? 'bg-rose-50 text-rose-800 border border-rose-200'
    : 'bg-slate-100 text-slate-800 border border-slate-300'

  return (
    <div
      onClick={() => onSelectTicket && onSelectTicket(id)}
      className={`${cardStyleMap[status] || cardStyleMap.default} ${
        !isSelected ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
    >
      {/* Card Header: Ticket #, Status Pill, Timer, Amount */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${ticketBadgeClass}`}>
            {ticketNumber}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${badgeStyleMap[status] || badgeStyleMap.verified}`}>
            {status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>}
            {statusLabel}
          </span>
          {isSelected && (
            <span className="text-[10px] text-teal-800 font-mono font-semibold bg-white border border-teal-200 px-1.5 py-0.5 rounded">
              SELECTED ACTIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded flex items-center gap-1 border ${timerStyleMap[status] || timerStyleMap.default}`}>
            <span className="material-symbols-outlined text-[13px]">timer</span> {timeAgo}
          </span>
          <span className={`font-extrabold font-mono ${isSelected ? 'text-base text-pharma-900' : 'text-sm text-slate-900'}`}>
            ৳ {Number(totalAmount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Card Details: Patient & Dispensing info */}
      <div className={`grid grid-cols-12 gap-2 mt-2 pt-2 text-xs border-t ${
        isSelected ? 'border-teal-200/80' : status === 'held' ? 'border-slate-200' : 'border-slate-100'
      }`}>
        <div className="col-span-6 md:col-span-7">
          <p className="text-[11px] text-slate-500">Patient</p>
          <p className="font-bold text-slate-900">
            {patientName} {patientNote && <span className="text-[10px] font-normal text-slate-500 font-mono">{patientNote}</span>}
          </p>
          {doctor && (
            <p className="text-[11px] text-slate-600 mt-0.5">
              Prescription: <span className="font-medium text-slate-800">{doctor}</span>
            </p>
          )}
          {!doctor && itemsDescription && (
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{itemsDescription}</p>
          )}
        </div>

        {/* Action Button: Smartly handled by TicketCard based on ticket status */}
        <div className="col-span-6 md:col-span-5 flex flex-col justify-between items-end text-right">
          {dispenser && (
            <div>
              <span className="text-[11px] text-slate-600">Dispensed by: <strong className="text-teal-800 font-semibold">{dispenser}</strong></span>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{itemsDescription}</p>
            </div>
          )}

          {isSelected ? (
            <button className="mt-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs shadow-xs flex items-center gap-1 cursor-default">
              <span className="material-symbols-outlined text-[14px]">check_circle</span> Loaded to Active Register
            </button>
          ) : status === 'emergency' ? (
            <button
              onClick={() => onSelectTicket && onSelectTicket(id)}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">priority_high</span> Expedite Load
            </button>
          ) : status === 'held' ? (
            <button
              onClick={() => onSelectTicket && onSelectTicket(id)}
              className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-medium text-xs flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">play_circle</span> Unhold [F4]
            </button>
          ) : (
            <button
              onClick={() => onSelectTicket && onSelectTicket(id)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-pharma-800 text-slate-700 border border-slate-300 rounded font-medium text-xs flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">download</span> Recall / Load [Enter]
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketCard
