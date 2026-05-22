import { formatTime, isCurrentSlot, displayName } from '../hooks/useAppointments'

const statusBadge = {
  completed: { label: 'Done',     bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  no_show:   { label: 'No Show',  bg: 'bg-red-500/15 text-red-400 border-red-500/30' },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
}

export default function BookingCard({ slot, onMarkDone, onMarkNoShow }) {
  const apt      = slot.appointments?.[0]
  const customer = apt?.profiles
  const isCurrent = isCurrentSlot(slot)
  const isBooked  = apt?.status === 'booked'
  const badge     = statusBadge[apt?.status]

  return (
    <div
      className={`
        relative rounded-2xl p-4 transition-all duration-200 anim-fade-in-up
        ${isCurrent
          ? 'bg-navy-800 border-2 border-gold-500 anim-gold-glow'
          : isBooked
            ? 'bg-navy-800 border border-white/5'
            : 'bg-navy-800/60 border border-white/5 opacity-75'}
      `}
    >
      {/* Green left accent bar for upcoming booked slots */}
      {isBooked && !isCurrent && (
        <span className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-full" />
      )}

      {/* Time row */}
      <div className="flex items-center justify-between mb-2">
        <span className={`font-bold text-base ${isCurrent ? 'text-gold-400' : 'text-slate-100'}`}>
          🕐 {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
        </span>
        {isCurrent && (
          <span className="text-xs font-semibold text-gold-500 bg-gold-500/10 border border-gold-500/30 px-2 py-0.5 rounded-full">
            NOW
          </span>
        )}
        {badge && (
          <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${badge.bg}`}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Customer info */}
      <p className="text-slate-100 font-semibold text-sm mb-0.5">
        {displayName(customer?.full_name)}
      </p>
      {customer?.roll_number && (
        <p className="text-slate-400 text-xs mb-1">Roll: {customer.roll_number}</p>
      )}
      {customer?.phone && (
        <a
          href={`tel:${customer.phone}`}
          className="inline-flex items-center gap-1.5 text-sky-400 text-sm font-medium py-1"
        >
          📞 <span className="underline underline-offset-2">{customer.phone}</span>
        </a>
      )}

      {/* Action buttons — only for booked status */}
      {isBooked && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onMarkDone(apt.id, displayName(customer?.full_name))}
            className="flex-1 flex items-center justify-center gap-1.5 min-h-[48px]
                       bg-emerald-500/10 border border-emerald-500/40 text-emerald-400
                       font-semibold text-sm rounded-xl active:bg-emerald-500/20 transition-colors"
          >
            ✅ Mark Done
          </button>
          <button
            onClick={() => onMarkNoShow(apt.id, displayName(customer?.full_name))}
            className="flex-1 flex items-center justify-center gap-1.5 min-h-[48px]
                       bg-red-500/10 border border-red-500/40 text-red-400
                       font-semibold text-sm rounded-xl active:bg-red-500/20 transition-colors"
          >
            ❌ No Show
          </button>
        </div>
      )}
    </div>
  )
}
