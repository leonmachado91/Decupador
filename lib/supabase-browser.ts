import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './supabase.types'

export const createSupabaseBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase env vars ausentes')
  }
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
