import { getSupabase } from '@/lib/supabaseClient'
import type { Tables, TablesInsert } from '@/lib/supabase.types'

export type SceneRow = Tables<'scenes'>
export type SceneInsert = TablesInsert<'scenes'>
export type SceneAssetInsert = TablesInsert<'scene_assets'>
export type SceneLogInsert = TablesInsert<'scene_logs'>

const notConfigured = { data: null, error: 'Supabase não configurado' } as const

export async function getScenesByDocument(documentId: string) {
  const supabase = getSupabase()
  if (!supabase) return notConfigured

  const { data, error } = await supabase
    .from('scenes')
    .select('*, scene_assets(*)')
    .eq('document_id', documentId)
    .order('order_index', { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function upsertScenes(payload: SceneInsert[]) {
  const supabase = getSupabase()
  if (!supabase) return notConfigured

  const { data, error } = await supabase.from('scenes').upsert(payload).select()
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function upsertSceneAssets(payload: SceneAssetInsert[]) {
  const supabase = getSupabase()
  if (!supabase) return notConfigured

  const { data, error } = await supabase.from('scene_assets').upsert(payload).select()
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function insertSceneLog(payload: SceneLogInsert) {
  const supabase = getSupabase()
  if (!supabase) return notConfigured

  const { data, error } = await supabase.from('scene_logs').insert(payload).select().single()
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}
