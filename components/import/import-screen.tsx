"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { useDocumentStore } from "@/lib/stores/documentStore"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ImportDropzone } from "./import-dropzone"
import { cn } from "@/lib/utils"
import { getGoogleDoc } from "@/lib/api/getGoogleDoc"
import { convertCommentsToScenes } from "@/lib/dataProcessor"
import type { GoogleDocData } from "@/lib/api/getGoogleDoc"
import type { AssetType, Scene } from "@/lib/stores/documentStore"
import { docUrlSchema } from "@/lib/validation"
import { useSupabaseUser } from "@/hooks/use-supabase-user"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { insertSceneLog, type SceneLogInsert } from "@/lib/api/scenes"

type ImportStep = "idle" | "validating" | "fetching" | "processing" | "persisting" | "done" | "error"
type LogStatus = "pending" | "in-progress" | "done" | "error"

interface ImportLogEntry {
  id: string
  label: string
  status: LogStatus
  message?: string
  timestamp: string
}

const importStepLabels: Record<ImportStep, string> = {
  idle: "Aguardando acao",
  validating: "Validando URL",
  fetching: "Buscando Google Doc",
  processing: "Processando comentarios",
  persisting: "Persistindo dados",
  done: "Concluido",
  error: "Erro",
}

const logStatusClasses: Record<LogStatus, string> = {
  pending: "text-muted-foreground",
  "in-progress": "text-amber-400",
  done: "text-emerald-500",
  error: "text-destructive",
}

export function ImportScreen() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [importStep, setImportStep] = useState<ImportStep>("idle")
  const [logEntries, setLogEntries] = useState<ImportLogEntry[]>([])
  const { userId } = useSupabaseUser()
  const setDocId = useDocumentStore((state) => state.setDocId)
  const setDocumentData = useDocumentStore((state) => state.setDocumentData)
  const setScenes = useDocumentStore((state) => state.setScenes)
  const currentDocId = useDocumentStore((state) => state.docId)

  const addOrUpdateLogEntry = async (label: string, status: LogStatus, message?: string) => {
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

    if (userId) {
      await insertSceneLog({
        level: status === "error" ? "error" : status === "in-progress" ? "warn" : "info",
        message: message ?? label,
        scene_id: null,
        user_id: userId,
      } as SceneLogInsert)
    }
  }

  const resetLogEntries = () => setLogEntries([])

  type SceneAssetRow = { id: string; asset_type: AssetType; asset_value: string }
  type SceneRow = {
    id: string
    narrative_text: string | null
    raw_comment: string | null
    status: string | null
    editor_notes: string | null
    order_index: number | null
    scene_assets?: SceneAssetRow[]
  }

  const reloadScenesFromSupabase = async (docId: string) => {
    if (!userId) return
    const supabase = createSupabaseBrowserClient()
    const { data: documentRow } = await supabase
      .from("documents")
      .select("id,title")
      .eq("google_doc_id", docId)
      .eq("user_id", userId)
      .single()

    if (!documentRow) return

    const { data: sceneRows } = await supabase
      .from("scenes")
      .select("id,narrative_text,raw_comment,status,editor_notes,order_index,scene_assets(id,asset_type,asset_value)")
      .eq("document_id", documentRow.id)
      .eq("user_id", userId)
      .order("order_index", { ascending: true })

    if (sceneRows && sceneRows.length > 0) {
      const typedRows = sceneRows as unknown as SceneRow[]
      setScenes(
        typedRows.map((row, idx) => ({
          id: row.id,
          position: row.order_index ?? idx,
          narrativeText: row.narrative_text ?? "",
          rawComment: row.raw_comment ?? "",
          status: (row.status as "Pendente" | "Concluido") ?? "Pendente",
          editorNotes: row.editor_notes ?? "",
          assets:
            row.scene_assets?.map((a) => ({
              id: a.id,
              type: a.asset_type,
              value: a.asset_value,
            })) ?? [],
        }))
      )

      setDocumentData({
        title: documentRow.title ?? "Documento",
        body: { content: [] },
        comments: {},
        documentId: documentRow.id,
        revisionId: "",
      })
    }
  }

  const syncToSupabase = async (docId: string, title: string | null, scenes: Scene[]) => {
    await addOrUpdateLogEntry("Persistindo dados", "in-progress")
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId, title, scenes, userId }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        const message = payload.error || "Falha ao persistir no Supabase"
        await addOrUpdateLogEntry("Persistindo dados", "error", message)
        return { ok: false, error: message }
      }
      await addOrUpdateLogEntry("Persistindo dados", "done")
      return { ok: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao persistir dados no Supabase"
      await addOrUpdateLogEntry("Persistindo dados", "error", message)
      return { ok: false, error: message }
    }
  }

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
    await addOrUpdateLogEntry("Validando URL", "in-progress")

    if (!userId) {
      const message = "É necessário estar autenticado para importar e salvar o roteiro."
      await addOrUpdateLogEntry("Validando URL", "error", message)
      setImportStep("error")
      setError(message)
      return
    }

    const parsedUrl = docUrlSchema.safeParse(url)
    if (!parsedUrl.success) {
      const message = parsedUrl.error.issues[0]?.message || "Por favor, insira uma URL válida"
      await addOrUpdateLogEntry("Validando URL", "error", message)
      setImportStep("error")
      setError(message)
      return
    }

    const docId = extractDocId(parsedUrl.data)
    if (!docId) {
      const message = "URL inválida. Por favor, insira uma URL válida do Google Docs"
      await addOrUpdateLogEntry("Validando URL", "error", message)
      setImportStep("error")
      setError(message)
      return
    }

    if (currentDocId && currentDocId !== docId) {
      const confirmed = window.confirm("Trocar de documento vai limpar a decupagem atual. Deseja continuar?")
      if (!confirmed) {
        setImportStep("idle")
        return
      }
    }

    await addOrUpdateLogEntry("Validando URL", "done")
    setImportStep("fetching")
    await addOrUpdateLogEntry("Buscando Google Doc", "in-progress")
    setIsLoading(true)

    try {
      let result: { data: GoogleDocData | null; error: string | null } = { data: null, error: null }
      for (let attempt = 0; attempt < 3; attempt++) {
        result = await getGoogleDoc(docId)
        if (!result.error) break
        await new Promise((res) => setTimeout(res, 500 * (attempt + 1)))
      }

      if (result.error || !result.data) {
        const message = result.error || "Nenhum dado retornado da API"
        await addOrUpdateLogEntry("Buscando Google Doc", "error", message)
        setImportStep("error")
        setError(message)
        return
      }

      await addOrUpdateLogEntry("Buscando Google Doc", "done")
      setImportStep("processing")
      await addOrUpdateLogEntry("Processando comentarios", "in-progress")

      const documentData: GoogleDocData = result.data
      setDocumentData(documentData)

      const scenes: Scene[] = convertCommentsToScenes(documentData.comments, documentData.body)
      setScenes(scenes)

      await addOrUpdateLogEntry("Processando comentarios", "done")
      setImportStep("persisting")

      setDocId(docId)
      await addOrUpdateLogEntry("Persistindo dados", "in-progress")

      const syncResult = await syncToSupabase(docId, documentData.title || null, scenes)

      if (syncResult.ok) {
        await reloadScenesFromSupabase(docId)
        await addOrUpdateLogEntry("Resultado", "done", "Importacao concluida com sucesso")
        setImportStep("done")
        setSuccess("Documento importado com sucesso!")
      } else {
        await addOrUpdateLogEntry("Resultado", "error", syncResult.error || "Falha ao salvar no Supabase")
        setImportStep("error")
        setError(syncResult.error || "Falha ao salvar no Supabase")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado durante a importacao"
      await addOrUpdateLogEntry("Resultado", "error", message)
      setImportStep("error")
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-linear-to-b from-background to-secondary/20">
      <div className="w-full max-w-2xl space-y-12 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-primary to-primary/60">
            Decupador de Roteiro
          </h1>
          <p className="text-xl text-muted-foreground font-light tracking-wide">
            Transforme seus roteiros do Google Docs em listas de decupagem profissionais em segundos.
          </p>
        </div>

        <div className="space-y-8">
          <ImportDropzone
            url={url}
            onUrlChange={(val) => {
              setUrl(val)
              setError(null)
              setSuccess(null)
            }}
            onImport={handleImport}
            isLoading={isLoading}
            error={error}
            success={success}
          />

          {(logEntries.length > 0 || error) && (
            <div className="max-w-xl mx-auto">
              <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 text-left shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Log de Processamento</p>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${importStep === 'error' ? 'bg-destructive/10 text-destructive' :
                    importStep === 'done' ? 'bg-green-500/10 text-green-500' :
                      'bg-secondary text-secondary-foreground'
                    }`}>
                    {importStepLabels[importStep]}
                  </span>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-4 border-destructive/30 bg-destructive/5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-sm font-semibold">Falha na importação</AlertTitle>
                    <AlertDescription className="text-xs mt-1 opacity-90">{error}</AlertDescription>
                  </Alert>
                )}

                {logEntries.length > 0 && (
                  <ul className="space-y-2">
                    {logEntries.map((entry) => (
                      <li key={entry.id} className="flex items-start justify-between gap-4 text-xs group">
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full mt-0.5 ${entry.status === 'done' ? 'bg-green-500' :
                            entry.status === 'error' ? 'bg-destructive' :
                              entry.status === 'in-progress' ? 'bg-amber-400 animate-pulse' :
                                'bg-muted-foreground'
                            }`} />
                          <span className={cn("text-foreground/80", entry.status === 'in-progress' && "font-medium")}>
                            {entry.label}
                          </span>
                        </div>
                        <span className="text-muted-foreground/50 font-mono text-[10px] tabular-nums group-hover:text-muted-foreground transition-colors">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground/60">
          <p>Certifique-se de que seu Google Doc está compartilhado publicamente ou com a conta de serviço.</p>
        </div>
      </div>
    </div>
  )
}
