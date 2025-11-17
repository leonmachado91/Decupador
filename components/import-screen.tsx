"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useDocumentStore } from '@/lib/stores/documentStore'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getGoogleDoc } from '@/lib/api/getGoogleDoc'
import { convertCommentsToScenes } from '@/lib/dataProcessor'
import type { GoogleDocData } from '@/lib/api/getGoogleDoc'
import type { Scene } from '@/lib/stores/documentStore'

// Tipos são importados de lib/api/getGoogleDoc e do store

export function ImportScreen() {
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
    } catch {
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
      const result = await getGoogleDoc(docId)
      if (result.error || !result.data) {
        setError(result.error || "Nenhum dado retornado da API")
        return
      }

      // Processar os dados recebidos
      const documentData: GoogleDocData = result.data
      setDocumentData(documentData)
      
      const scenes: Scene[] = convertCommentsToScenes(documentData.comments)
      
      setScenes(scenes)
      
      // Mostrar mensagem de sucesso
      setSuccess("Documento importado com sucesso!")
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err) {
      console.error("Erro ao importar documento:", err)
      const message = err instanceof Error ? err.message : "Erro ao importar documento. Por favor, tente novamente."
      setError(message)
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
              className="h-12 px-8 text-base font-semibold"
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