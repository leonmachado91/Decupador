import { getSupabase } from '@/lib/supabaseClient'

export interface GoogleDocComment {
  id: string
  author: {
    displayName: string
    photoLink: string
    kind: string
  }
  content: string
  createdTime: string
  modifiedTime: string
  resolved: boolean
  quotedFileContent?: {
    value: string
    mimeType: string
  }
  replies: Array<{
    id: string
    author: { displayName: string; photoLink: string; kind: string }
    content: string
    createdTime: string
    modifiedTime: string
  }>
}

export type GoogleDocBody = {
  content?: Array<{
    paragraph?: {
      elements?: Array<{
        textRun?: { content?: string }
      }>
    }
  }>
}

export interface GoogleDocData {
  title: string
  body: GoogleDocBody
  comments: Record<string, GoogleDocComment>
  documentId: string
  revisionId: string
}

export async function getGoogleDoc(docId: string): Promise<{
  data: GoogleDocData | null
  error: string | null
}> {
  const supabase = getSupabase()
  if (!supabase) {
    return { data: null, error: 'Configuração do Supabase ausente. Verifique variáveis de ambiente.' }
  }

  try {
    const { data, error } = await supabase.functions.invoke<GoogleDocData>('get-google-doc', {
      body: { docId },
    })
    if (error) {
      const msg = error.message || 'Erro desconhecido'
      return { data: null, error: `Erro ao acessar o documento: ${msg}` }
    }
    return { data: data ?? null, error: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Falha ao invocar função do Supabase'
    return { data: null, error: msg }
  }
}
