import { useEarningsData } from '../hooks/useAppointments'
import { HAIRCUT_PRICE } from '../lib/supabase'
import StatCard from '../components/StatCard'
import BottomNav from '../components/BottomNav'

function rs(amount) {
  return `Rs. ${amount.toLocaleString()}`
}

function SkeletonCard({ wide }) {
  return <div className={`skeleton h-24 rounded-2xl ${wide ? 'col-span-2' : ''}`} />
}

// ── Pure CSS horizontal bar chart ───────────────────────

function BarChart({ data }) {
  const maxCuts = Math.max(...data.map(d => d.cuts), 1)

  return (
    <div className="rounded-2xl bg-navy-800 border border-white/5 p-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
        Last 7 Days
      </p>
      <div className="flex items-end gap-2 h-24">
        {data.map((day, i) => {
          const pct = Math.round((day.cuts / maxCuts) * 100)
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              {/* Bar */}
              <div className="w-full flex flex-col justify-end" style={{ height: '72px' }}>
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    day.isToday ? 'bg-gold-500' : 'bg-gold-500/40'
                  }`}
                  style={{ height: `${Math.max(pct, day.cuts > 0 ? 8 : 2)}%` }}
                />
              </div>
              {/* Count */}
              {day.cuts > 0 && (
                <p className={`text-xs font-bold ${day.isToday ? 'text-gold-400' : 'text-slate-500'}`}>
                  {day.cuts}
                </p>
              )}
              {/* Day label */}
              <p className={`text-xs ${day.isToday ? 'text-gold-400 font-bold' : 'text-slate-600'}`}>
                {day.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────

export default function Earnings() {
  const { data, loading, refetch } = useEarningsData()

  return (
    <div className="flex flex-col h-full">
      <div className="scroll-area px-4 pt-5 pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-slate-100">💰 Earnings</h1>
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

        {loading || !data ? (
          <div className="space-y-4 mb-nav">
            <div className="grid grid-cols-2 gap-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard wide />
            </div>
            <div className="skeleton h-8 rounded-2xl" />
            <div className="skeleton h-40 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-4 mb-nav">

            {/* ── Section 1: Summary cards ── */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                emoji="📅"
                label="Today"
                value={rs(data.today.completed * HAIRCUT_PRICE)}
                sub={`${data.today.completed} cuts`}
              />
              <StatCard
                emoji="📆"
                label="This Week"
                value={rs(data.week.completed * HAIRCUT_PRICE)}
                sub={`${data.week.completed} cuts`}
              />
              <StatCard
                emoji="🗓️"
                label="This Month"
                value={rs(data.month.completed * HAIRCUT_PRICE)}
                sub={`${data.month.completed} cuts`}
                accent
                wide
              />
            </div>

            {/* ── Section 2: Today's progress bar ── */}
            {data.today.totalSlots > 0 && (
              <div className="rounded-2xl bg-navy-800 border border-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Today's Progress
                  </p>
                  <p className="text-xs text-slate-400">
                    {data.today.completed} of {data.today.totalSlots} slots
                  </p>
                </div>
                <div className="h-3 bg-navy-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-500 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.round((data.today.completed / data.today.totalSlots) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-right text-xs text-slate-500 mt-1">
                  {Math.round((data.today.completed / data.today.totalSlots) * 100)}% complete
                </p>
              </div>
            )}

            {/* ── Section 3: No-show tracker ── */}
            {(data.today.noShows > 0 || data.week.noShows > 0) && (
              <div className="rounded-2xl bg-red-500/8 border border-red-500/20 p-4">
                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">
                  No-Show Tracker (Lost Income)
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Today</span>
                    <span className="text-sm font-semibold text-red-400">
                      {data.today.noShows} × {rs(HAIRCUT_PRICE)} = {rs(data.today.noShows * HAIRCUT_PRICE)} lost
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">This Week</span>
                    <span className="text-sm font-semibold text-red-400">
                      {data.week.noShows} × {rs(HAIRCUT_PRICE)} = {rs(data.week.noShows * HAIRCUT_PRICE)} lost
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Section 4: 7-day bar chart ── */}
            <BarChart data={data.chart} />

            {/* Rate note */}
            <p className="text-xs text-slate-600 text-center pb-2">
              Calculated at Rs. {HAIRCUT_PRICE} per completed cut
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
