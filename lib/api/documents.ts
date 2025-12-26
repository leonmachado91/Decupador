import { getSupabase } from '@/lib/supabaseClient'
import type { Tables, TablesInsert } from '@/lib/supabase.types'

export type DocumentRow = Tables<'documents'>
export type DocumentInsert = TablesInsert<'documents'>

export async function getDocumentByGoogleId(googleDocId: string) {
  const supabase = getSupabase()
  if (!supabase) {
    return { data: null, error: 'Supabase não configurado' }
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('google_doc_id', googleDocId)
    .single()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function upsertDocument(payload: DocumentInsert) {
  const supabase = getSupabase()
  if (!supabase) {
    return { data: null, error: 'Supabase não configurado' }
  }

  const { data, error } = await supabase.from('documents').upsert(payload).select().single()
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}
