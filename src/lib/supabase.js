import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing env vars. Copy .env.example to .env and fill in your credentials.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // No login in this app — use anon key only
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

// Arslan's barber UUID — set via VITE_BARBER_ID in .env / GitHub Secrets
// Corresponds to his row in the public.barbers table.
export const ARSLAN_BARBER_ID = import.meta.env.VITE_BARBER_ID || ''

// Price per completed haircut in Pakistani Rupees
export const HAIRCUT_PRICE = 100
