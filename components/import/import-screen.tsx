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

type ImportStep = 'idle' | 'validating' | 'fetching' | 'processing' | 'persisting' | 'done' | 'error'
type LogStatus = 'pending' | 'in-progress' | 'done' | 'error'

interface ImportLogEntry {
  id: string
  label: string
  status: LogStatus
  message?: string
  timestamp: string
}

const importStepLabels: Record<ImportStep, string> = {
  idle: "Aguardando ação",
  validating: "Validando URL",
  fetching: "Buscando Google Doc",
  processing: "Processando comentários",
  persisting: "Persistindo dados",
  done: "Concluído",
  error: "Erro",
}

const logStatusClasses: Record<LogStatus, string> = {
  pending: "text-muted-foreground",
  "in-progress": "text-amber-400",
  done: "text-emerald-500",
  error: "text-destructive",
}

// Tipos são importados de lib/api/getGoogleDoc e do store

export function ImportScreen() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [importStep, setImportStep] = useState<ImportStep>('idle')
  const [logEntries, setLogEntries] = useState<ImportLogEntry[]>([])
  const setDocId = useDocumentStore((state) => state.setDocId)
  const setDocumentData = useDocumentStore((state) => state.setDocumentData)
  const setScenes = useDocumentStore((state) => state.setScenes)

  const addOrUpdateLogEntry = (label: string, status: LogStatus, message?: string) => {
    setLogEntries((prev) => {
      const timestamp = new Date().toISOString()
      const existingIndex = prev.findIndex((entry) => entry.label === label)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          status,
          message: message ?? updated[existingIndex].message,
          timestamp,
        }
        return updated
      }

      const entry: ImportLogEntry = {
        id: `${label}-${timestamp}`,
        label,
        status,
        message,
        timestamp,
      }
      return [...prev, entry].slice(-6)
    })
  }

  const resetLogEntries = () => setLogEntries([])

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
    setError(null)
    setSuccess(null)
    resetLogEntries()
    setImportStep("validating")
    addOrUpdateLogEntry("Validando URL", "in-progress")

    if (!url) {
      addOrUpdateLogEntry("Validando URL", "error", "Por favor, insira uma URL válida")
      setImportStep("error")
      setError("Por favor, insira uma URL válida")
      return
    }

    const docId = extractDocId(url)
    if (!docId) {
      addOrUpdateLogEntry(
        "Validando URL",
        "error",
        "URL inválida. Por favor, insira uma URL válida do Google Docs"
      )
      setImportStep("error")
      setError("URL inválida. Por favor, insira uma URL válida do Google Docs")
      return
    }

    addOrUpdateLogEntry("Validando URL", "done")
    setImportStep("fetching")
    addOrUpdateLogEntry("Buscando Google Doc", "in-progress")
    setIsLoading(true)

    try {
      const result = await getGoogleDoc(docId)
      if (result.error || !result.data) {
        const message = result.error || "Nenhum dado retornado da API"
        addOrUpdateLogEntry("Buscando Google Doc", "error", message)
        setImportStep("error")
        setError(message)
        return
      }

      addOrUpdateLogEntry("Buscando Google Doc", "done")
      setImportStep("processing")
      addOrUpdateLogEntry("Processando comentários", "in-progress")

      const documentData: GoogleDocData = result.data
      setDocumentData(documentData)

      const scenes: Scene[] = convertCommentsToScenes(documentData.comments)
      setScenes(scenes)

      addOrUpdateLogEntry("Processando comentários", "done")
      setImportStep("persisting")
      addOrUpdateLogEntry("Persistindo dados", "in-progress")

      setDocId(docId)
      addOrUpdateLogEntry("Persistindo dados", "done")
      addOrUpdateLogEntry("Resultado", "done", "Importação concluída com sucesso")
      setImportStep("done")
      setSuccess("Documento importado com sucesso!")
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao importar documento. Por favor, tente novamente."
      addOrUpdateLogEntry("Buscando Google Doc", "error", message)
      setImportStep("error")
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

          <div className="rounded-xl border border-border bg-card/60 p-4 text-left">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Progresso da importação</p>
              <span className="text-[10px] uppercase text-muted-foreground">
                {importStepLabels[importStep]}
              </span>
            </div>
            {logEntries.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm">
                {logEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-md border border-border/60 bg-card/30 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{entry.label}</p>
                      <span
                        className={`text-[11px] font-semibold ${logStatusClasses[entry.status]}`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    {entry.message && (
                      <p className="mt-1 text-xs text-muted-foreground">{entry.message}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Nenhuma etapa registrada ainda.
              </p>
            )}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Dica: Certifique-se de que seu Google Doc está compartilhado publicamente</p>
        </div>
      </div>
    </div>
  )
}
