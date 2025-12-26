import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { SortCriteria } from '@/lib/stores/documentStore'

type PreferenceResponse = { sortCriteria: SortCriteria | null; error: string | null }

export async function getUserPreferences(userId: string): Promise<PreferenceResponse> {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('user_preferences')
    .select('sort_criteria')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { sortCriteria: null, error: error.message }
  }

  return { sortCriteria: (data?.sort_criteria as SortCriteria) ?? null, error: null }
}

export async function saveUserPreferences(userId: string, sortCriteria: SortCriteria | null) {
  const supabase = createSupabaseBrowserClient()
  const { error } = await supabase.from('user_preferences').upsert({
    user_id: userId,
    sort_criteria: sortCriteria,
  })
  return { error: error ? error.message : null }
}
