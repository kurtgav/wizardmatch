import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Lazy-load the client only when accessed
let supabaseInstance: SupabaseClient | null = null

export const supabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = getSupabaseClient()
  }
  return supabaseInstance
}

export type UserProfile = {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role?: 'user' | 'admin'
  created_at: string
  updated_at: string
}
