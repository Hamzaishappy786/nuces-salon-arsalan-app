import { useUpcomingAppointments, formatTime, formatDateShort, displayName } from '../hooks/useAppointments'
import BottomNav from '../components/BottomNav'

function CardSkeleton() {
  return <div className="skeleton h-20 w-full" />
}

/** Group an array of slots by slot_date → Map<string, slot[]> */
function groupByDate(slots) {
  return slots.reduce((map, slot) => {
    const d = slot.slot_date
    if (!map.has(d)) map.set(d, [])
    map.get(d).push(slot)
    return map
  }, new Map())
}

/** "YYYY-MM-DD" → sticky header label */
function stickyLabel(dateStr) {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]
  return dateStr === tomorrowStr ? 'Tomorrow' : formatDateShort(dateStr)
}

export default function Upcoming() {
  const { slots, loading, refetch } = useUpcomingAppointments()
  const grouped = groupByDate(slots)

  return (
    <div className="flex flex-col h-full">
      <div className="scroll-area px-4 pt-5 pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-slate-100">📆 Upcoming</h1>
          <button
            onClick={refetch}
            className="w-10 h-10 flex items-center justify-center rounded-xl
                       bg-white/5 border border-white/10 text-slate-400
                       active:bg-white/10 transition-colors text-lg"
            aria-label="Refresh"
          >
            🔄
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : grouped.size === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-300 font-semibold text-lg">No upcoming bookings</p>
            <p className="text-slate-500 text-sm mt-1">Nothing this week</p>
          </div>
        ) : (
          <div className="space-y-1 mb-nav">
            {[...grouped.entries()].map(([date, daySlots]) => (
              <div key={date}>
                {/* Sticky date header */}
                <div className="sticky top-0 z-10 py-2 mb-2"
                     style={{ background: 'linear-gradient(to bottom, #0f172a 80%, transparent)' }}>
                  <p className="text-xs font-bold text-gold-500 uppercase tracking-widest">
                    {stickyLabel(date)}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  {daySlots.map(slot => {
                    const apt      = slot.appointments?.[0]
                    const customer = apt?.profiles
                    return (
                      <div
                        key={slot.id}
                        className="relative rounded-2xl bg-navy-800 border border-white/5 p-4 anim-fade-in-up"
                      >
                        {/* Green left accent */}
                        <span className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-full" />

                        <div className="flex items-start justify-between gap-2 pl-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-gold-400 font-semibold text-sm">
                              {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                            </p>
                            <p className="text-slate-100 font-medium text-sm mt-0.5 truncate">
                              {displayName(customer?.full_name)}
                            </p>
                            {customer?.roll_number && (
                              <p className="text-slate-500 text-xs">Roll: {customer.roll_number}</p>
                            )}
                          </div>
                          {customer?.phone && (
                            <a
                              href={`tel:${customer.phone}`}
                              className="flex-shrink-0 w-11 h-11 flex items-center justify-center
                                         rounded-xl bg-sky-500/10 border border-sky-500/25 text-lg"
                              aria-label={`Call ${displayName(customer?.full_name)}`}
                            >
                              📞
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
