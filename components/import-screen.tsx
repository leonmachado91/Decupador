"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { supabase } from '@/lib/supabaseClient'
import { useDocumentStore } from '@/lib/stores/documentStore'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Interfaces para tipagem TypeScript
interface GoogleDocComment {
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
    author: {
      displayName: string
      photoLink: string
      kind: string
    }
    content: string
    createdTime: string
    modifiedTime: string
  }>
}

interface GoogleDocData {
  title: string
  body: any
  comments: Record<string, GoogleDocComment>
  documentId: string
  revisionId: string
}

interface Scene {
  id: string
  narrativeText: string
  rawComment: string
  status: 'Pendente' | 'Concluído'
  editorNotes: string
  assets: any[]
}

interface ImportScreenProps {
  onImport: (data: { 
    title: string, 
    content: any, 
    comments: Record<string, GoogleDocComment>,
    scenes: Scene[]
  }) => void
}

export function ImportScreen({ onImport }: ImportScreenProps) {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const setDocId = useDocumentStore((state) => state.setDocId)
  const setDocumentData = useDocumentStore((state) => state.setDocumentData)
  const setScenes = useDocumentStore((state) => state.setScenes)

  // Função para extrair o docId da URL do Google Docs
  const extractDocId = (url: string): string | null => {
    try {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
      return match ? match[1] : null
    } catch (error) {
      return null
    }
  }

  const handleImport = async () => {
    // Resetar mensagens
    setError(null)
    setSuccess(null)
    
    if (!url) {
      setError("Por favor, insira uma URL válida")
      return
    }

    const docId = extractDocId(url)
    if (!docId) {
      setError("URL inválida. Por favor, insira uma URL válida do Google Docs")
      return
    }

    setIsLoading(true)
    setDocId(docId)

    try {
      // Chamar a Edge Function do Supabase
      const response = await supabase.functions.invoke('get-google-doc', {
        body: { docId }
      })

      if (response.error) {
        console.error("Erro da Edge Function:", response.error)
        
        // Tratamento de erros específicos
        if (response.error.message.includes("Document ID")) {
          setError("ID do documento inválido. Verifique se a URL está correta.")
        } else if (response.error.message.includes("access")) {
          setError("Acesso negado ao documento. Certifique-se de que o documento é público ou compartilhado com a conta de serviço.")
        } else if (response.error.message.includes("not found")) {
          setError("Documento não encontrado. Verifique se a URL está correta.")
        } else {
          setError(`Erro ao acessar o documento: ${response.error.message}`)
        }
        return
      }

      if (!response.data) {
        setError("Nenhum dado retornado da API")
        return
      }

      // Processar os dados recebidos
      const documentData: GoogleDocData = response.data
      setDocumentData(documentData)
      
      // Criar cenas a partir dos comentários
      const comments = documentData.comments || {}
      const scenes: Scene[] = Object.values(comments).map((comment: GoogleDocComment, index) => ({
        id: `scene-${index + 1}`,
        narrativeText: comment.quotedFileContent?.value || "",
        rawComment: comment.content || "",
        status: "Pendente",
        editorNotes: "",
        assets: []
      }))
      
      setScenes(scenes)
      
      // Passar os dados para o componente principal
      onImport({
        title: documentData.title,
        content: documentData.body,
        comments: documentData.comments,
        scenes
      })
      
      // Mostrar mensagem de sucesso
      setSuccess("Documento importado com sucesso!")
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err: any) {
      console.error("Erro ao importar documento:", err)
      setError(err.message || "Erro ao importar documento. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-2xl bg-primary/10 p-6">
              <FileText className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-balance">Decupador de Roteiro HI</h1>
          <p className="text-lg text-muted-foreground text-balance">
            Cole o link de um Google Doc público para começar
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="https://docs.google.com/document/d/..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError(null)
                setSuccess(null)
              }}
              className="h-12 bg-card text-base"
              disabled={isLoading}
            />
            <Button
              onClick={handleImport}
              disabled={!url || isLoading}
              className="btn-glossy h-12 px-8 text-base font-semibold"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Importando...
                </>
              ) : (
                "Decupar Roteiro"
              )}
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processando documento...</span>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Sucesso</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Dica: Certifique-se de que seu Google Doc está compartilhado publicamente</p>
        </div>
      </div>
    </div>
  )
}