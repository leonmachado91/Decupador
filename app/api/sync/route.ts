import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const sceneSchema = z.object({
  narrativeText: z.string().nullable().optional(),
  rawComment: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  editorNotes: z.string().nullable().optional(),
})

const payloadSchema = z.object({
  docId: z.string().min(1),
  title: z.string().nullable().optional(),
  userId: z.string().uuid(),
  scenes: z.array(sceneSchema),
})

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json(
      { error: 'Configuração do Supabase ausente. Defina SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 500 }
    )
  }

  let parsed
  try {
    parsed = payloadSchema.parse(await request.json())
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payload inválido'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { docId, title, userId, scenes } = parsed

  // Upsert documento
  const { data: document, error: docError } = await supabase
    .from('documents')
    .upsert({
      google_doc_id: docId,
      title: title ?? null,
      status: 'imported',
      user_id: userId,
    })
    .select()
    .single()

  if (docError || !document) {
    return NextResponse.json(
      { error: docError?.message ?? 'Falha ao salvar documento' },
      { status: 500 }
    )
  }

  // Limpa cenas antigas e insere novas
  await supabase.from('scenes').delete().eq('document_id', document.id).eq('user_id', userId)

  const sceneRows = scenes.map((scene, index) => ({
    document_id: document.id,
    user_id: userId,
    narrative_text: scene.narrativeText ?? null,
    raw_comment: scene.rawComment ?? null,
    status: scene.status ?? 'Pendente',
    editor_notes: scene.editorNotes ?? null,
    order_index: index,
  }))

  if (sceneRows.length > 0) {
    const { error: scenesError } = await supabase.from('scenes').insert(sceneRows)
    if (scenesError) {
      return NextResponse.json(
        { error: scenesError.message ?? 'Falha ao salvar cenas' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ ok: true, documentId: document.id, scenes: sceneRows.length })
}
