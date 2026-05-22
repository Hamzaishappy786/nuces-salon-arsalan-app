import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase, ARSLAN_BARBER_ID } from '../lib/supabase'

// ── Shared helpers ────────────────────────────────────────

/** Format "HH:mm:ss" → "3:00 PM" */
export function formatTime(timeStr) {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':').map(Number)
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/** Format "YYYY-MM-DD" → "Friday, 22 May" */
export function formatDateFull(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** Format "YYYY-MM-DD" → "Sat 24 May" */
export function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** Is the current time inside this slot's window? */
export function isCurrentSlot(slot) {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  if (slot.slot_date !== todayStr) return false
  const [sh, sm] = slot.start_time.split(':').map(Number)
  const [eh, em] = slot.end_time.split(':').map(Number)
  const start = new Date(now); start.setHours(sh, sm, 0, 0)
  const end   = new Date(now); end.setHours(eh, em, 0, 0)
  return now >= start && now < end
}

/** Skip "Muhammad" as a lone first name prefix (Pakistani naming convention) */
export function displayName(fullName) {
  if (!fullName) return 'Unknown'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length > 1 && parts[0].toLowerCase() === 'muhammad') {
    return parts.slice(1).join(' ')
  }
  return fullName
}

// ── Hook 1: Today's appointments ─────────────────────────

export function useTodayAppointments() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(true)
  const channelRef = useRef(null)

  const fetchToday = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0]

    // Filter directly on time_slots (primary table) — avoids the PostgREST
    // related-table filter bug where .eq('joined_table.col', val) is silently ignored.
    const { data, error } = await supabase
      .from('time_slots')
      .select(`
        id, start_time, end_time, slot_date, is_blocked,
        appointments (
          id, status, notes, booked_at, updated_at,
          profiles (full_name, roll_number, phone)
        )
      `)
      .eq('slot_date', today)
      .eq('barber_id', ARSLAN_BARBER_ID)
      .order('start_time')

    if (!error) {
      // Only show slots that have at least one appointment (any status)
      const withBookings = (data || []).filter(s => s.appointments?.length > 0)
      setSlots(withBookings)
    }
    setLoading(false)
  }, [])

  // Mark an appointment as done or no_show
  const markStatus = useCallback(async (appointmentId, status) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appointmentId)
    if (error) throw error
    await fetchToday()
  }, [fetchToday])

  useEffect(() => {
    fetchToday()

    // Realtime — refetch whenever any appointment row changes
    const channel = supabase
      .channel('arsalan-today-v1')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => fetchToday()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_slots' },
        () => fetchToday()
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [fetchToday])

  // Derived summary
  const booked    = slots.filter(s => s.appointments?.[0]?.status === 'booked').length
  const done      = slots.filter(s => s.appointments?.[0]?.status === 'completed').length
  const noShow    = slots.filter(s => s.appointments?.[0]?.status === 'no_show').length
  const remaining = booked // "remaining" = still booked (not yet done)

  return { slots, loading, connected, booked, done, noShow, remaining, markStatus, refetch: fetchToday }
}

// ── Hook 2: Upcoming appointments (next 7 days, not today) ─

export function useUpcomingAppointments() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUpcoming = useCallback(async () => {
    setLoading(true)
    const now = new Date()

    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const end = new Date(now)
    end.setDate(end.getDate() + 7)
    const endStr = end.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('time_slots')
      .select(`
        id, start_time, end_time, slot_date,
        appointments (
          id, status,
          profiles (full_name, roll_number, phone)
        )
      `)
      .eq('barber_id', ARSLAN_BARBER_ID)
      .gte('slot_date', tomorrowStr)
      .lte('slot_date', endStr)
      .order('slot_date')
      .order('start_time')

    if (!error) {
      // Only confirmed (booked) appointments are relevant for upcoming view
      const upcoming = (data || []).filter(s =>
        s.appointments?.some(a => a.status === 'booked')
      )
      setSlots(upcoming)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchUpcoming() }, [fetchUpcoming])

  return { slots, loading, refetch: fetchUpcoming }
}

// ── Hook 3: Earnings data ────────────────────────────────

export function useEarningsData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchEarnings = useCallback(async () => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    // Start of current calendar month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthStartStr = monthStart.toISOString().split('T')[0]

    // 6 days ago (so we have 7 days total including today for chart)
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 6)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]

    // Single fetch: all slots from month start to today
    const { data: slots, error } = await supabase
      .from('time_slots')
      .select('id, slot_date, appointments(id, status)')
      .eq('barber_id', ARSLAN_BARBER_ID)
      .gte('slot_date', monthStartStr)
      .lte('slot_date', todayStr)
      .order('slot_date')

    if (error || !slots) {
      setLoading(false)
      return
    }

    const countByStatus = (slotList, status) =>
      slotList.reduce(
        (sum, s) => sum + (s.appointments?.filter(a => a.status === status).length || 0),
        0
      )

    const todaySlots = slots.filter(s => s.slot_date === todayStr)
    const weekSlots  = slots.filter(s => s.slot_date >= weekAgoStr)
    const monthSlots = slots // already scoped to current month

    // Last 7 days bar chart
    const chart = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const daySlots = slots.filter(s => s.slot_date === dateStr)
      chart.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        cuts: countByStatus(daySlots, 'completed'),
        isToday: dateStr === todayStr,
      })
    }

    setData({
      today: {
        completed: countByStatus(todaySlots, 'completed'),
        noShows:   countByStatus(todaySlots, 'no_show'),
        totalSlots: todaySlots.length,
      },
      week: {
        completed: countByStatus(weekSlots, 'completed'),
        noShows:   countByStatus(weekSlots, 'no_show'),
      },
      month: {
        completed: countByStatus(monthSlots, 'completed'),
        noShows:   countByStatus(monthSlots, 'no_show'),
      },
      chart,
    })
    setLoading(false)
  }, [])

  useEffect(() => { fetchEarnings() }, [fetchEarnings])

  return { data, loading, refetch: fetchEarnings }
}
