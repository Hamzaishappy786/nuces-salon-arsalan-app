import { useState } from 'react'
import { useTodayAppointments, formatDateFull } from '../hooks/useAppointments'
import BookingCard from '../components/BookingCard'
import BottomNav from '../components/BottomNav'

// ── Skeleton loader ───────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="skeleton h-36 w-full" />
  )
}

// ── Confirmation bottom sheet ─────────────────────────────

function ConfirmSheet({ action, onConfirm, onCancel, loading }) {
  if (!action) return null
  const isDone = action.type === 'done'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onCancel}
      />
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 anim-slide-up rounded-t-3xl p-6 pb-8"
           style={{ background: '#1e2a45', borderTop: '1px solid rgba(255,255,255,0.1)' }}>

        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

        <p className="text-center text-slate-300 text-sm mb-1">Confirm action for</p>
        <p className="text-center text-slate-100 font-bold text-lg mb-5">
          {action.customerName}
        </p>

        <button
          disabled={loading}
          onClick={onConfirm}
          className={`
            w-full min-h-[52px] rounded-2xl font-semibold text-base mb-3
            flex items-center justify-center gap-2 transition-opacity
            ${isDone
              ? 'bg-emerald-500 text-white active:bg-emerald-600'
              : 'bg-red-500 text-white active:bg-red-600'}
            ${loading ? 'opacity-50' : ''}
          `}
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isDone ? (
            '✅ Yes, Mark as Done'
          ) : (
            '❌ Yes, Mark No Show'
          )}
        </button>

        <button
          onClick={onCancel}
          className="w-full min-h-[48px] rounded-2xl font-medium text-slate-400
                     bg-white/5 border border-white/10 active:bg-white/10 transition-colors"
        >
          Cancel
        </button>
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────

export default function Today() {
  const { slots, loading, connected, booked, done, remaining, markStatus, refetch } =
    useTodayAppointments()

  const [confirmAction, setConfirmAction] = useState(null)
  // confirmAction: { appointmentId, type: 'done'|'noshow', customerName }
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  const today = new Date().toISOString().split('T')[0]

  async function handleConfirm() {
    if (!confirmAction) return
    setActionLoading(true)
    setError(null)
    try {
      const status = confirmAction.type === 'done' ? 'completed' : 'no_show'
      await markStatus(confirmAction.appointmentId, status)
    } catch (e) {
      setError(e.message || 'Failed to update. Check your connection.')
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Offline banner */}
      {!connected && (
        <div className="bg-red-500/20 border-b border-red-500/40 text-red-400
                        text-sm font-medium text-center py-2 px-4 flex-shrink-0">
          ⚠️ Offline — reconnecting...
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="bg-red-500/20 border-b border-red-500/40 text-red-400
                        text-sm font-medium text-center py-2 px-4 flex-shrink-0">
          {error}
        </div>
      )}

      <div className="scroll-area px-4 pt-5 pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-slate-100">📅 Today</h1>
          <div className="flex items-center gap-2">
            {/* Live dot */}
            <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500 anim-live-dot' : 'bg-red-500'}`} />
            <span className="text-xs text-slate-500">{connected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
        <p className="text-slate-400 text-sm mb-5">{formatDateFull(today)}</p>

        {/* Summary strip */}
        <div className="flex gap-2 mb-5">
          <div className="flex-1 rounded-xl bg-sky-500/10 border border-sky-500/25 px-3 py-2 text-center">
            <p className="text-xs text-sky-400 font-medium">Booked</p>
            <p className="text-xl font-bold text-sky-300">{booked}</p>
          </div>
          <div className="flex-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 text-center">
            <p className="text-xs text-emerald-400 font-medium">Done</p>
            <p className="text-xl font-bold text-emerald-300">{done}</p>
          </div>
          <div className="flex-1 rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2 text-center">
            <p className="text-xs text-amber-400 font-medium">Remaining</p>
            <p className="text-xl font-bold text-amber-300">{remaining}</p>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">☕</p>
            <p className="text-slate-300 font-semibold text-lg">No bookings today</p>
            <p className="text-slate-500 text-sm mt-1">Enjoy the break!</p>
            <button
              onClick={refetch}
              className="mt-6 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10
                         text-slate-400 text-sm font-medium active:bg-white/10"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-nav">
            {slots.map(slot => (
              <BookingCard
                key={slot.id}
                slot={slot}
                onMarkDone={(aptId, name) =>
                  setConfirmAction({ appointmentId: aptId, type: 'done', customerName: name })
                }
                onMarkNoShow={(aptId, name) =>
                  setConfirmAction({ appointmentId: aptId, type: 'noshow', customerName: name })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation sheet */}
      <ConfirmSheet
        action={confirmAction}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        loading={actionLoading}
      />

      <BottomNav />
    </div>
  )
}
