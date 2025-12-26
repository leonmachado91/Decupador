"use client"

import { useEffect, useState } from "react"
import { ScriptView } from "@/components/script"
import { TableView } from "@/components/table"
import { AnimatePresence, motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { useDocumentStore } from '@/lib/stores/documentStore'
import { Header } from "@/components/header"
import { useExportCsv } from "@/hooks/use-export-csv"
import { useYouTubeLinks } from "@/hooks/use-youtube-links"
import { useSupabaseUser } from "@/hooks/use-supabase-user"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { useToast } from "@/hooks/use-toast"
import type { AssetType } from "@/lib/stores/documentStore"

export function MainInterface() {
  const [activeView, setActiveView] = useState<"script" | "table">("script")
  const documentData = useDocumentStore((state) => state.documentData)
  const scenes = useDocumentStore((state) => state.scenes)
  const docId = useDocumentStore((state) => state.docId)
  const setScenes = useDocumentStore((state) => state.setScenes)
  const setDocumentData = useDocumentStore((state) => state.setDocumentData)
  const clearDocumentData = useDocumentStore((state) => state.clearDocumentData)
  const { userId } = useSupabaseUser()
  const { toast } = useToast()
  const [remoteLoading, setRemoteLoading] = useState(false)

  const { handleExport } = useExportCsv()
  const { handleCopyYouTubeLinks } = useYouTubeLinks()

  // Carrega cenas salvas no Supabase se o estado local estiver vazio
  useEffect(() => {
    if (!userId || !docId) return
    if (scenes.length > 0) return

    const loadRemoteScenes = async () => {
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

      try {
        setRemoteLoading(true)
        const supabase = createSupabaseBrowserClient()

        const { data: docRow, error: docError } = await supabase
          .from('documents')
          .select('id,title')
          .eq('google_doc_id', docId)
          .eq('user_id', userId)
          .single()

        if (docError || !docRow) {
          if (docError?.code !== 'PGRST116') {
            toast({
              variant: "destructive",
              title: "Não foi possível carregar o roteiro",
              description: docError?.message || "Documento não encontrado no Supabase.",
            })
          }
          return
        }

        const { data: sceneRows, error: scenesError } = await supabase
          .from('scenes')
          .select('id,narrative_text,raw_comment,status,editor_notes,order_index,scene_assets(id,asset_type,asset_value)')
          .eq('document_id', docRow.id)
          .eq('user_id', userId)
          .order('order_index', { ascending: true })

        if (scenesError) {
          toast({
            variant: "destructive",
            title: "Erro ao carregar cenas",
            description: scenesError.message,
          })
          return
        }

        if (sceneRows && sceneRows.length > 0) {
          const typedRows = sceneRows as unknown as SceneRow[]
          const mappedScenes = typedRows.map((row, idx) => ({
            id: row.id,
            position: row.order_index ?? idx,
            narrativeText: row.narrative_text ?? "",
            rawComment: row.raw_comment ?? "",
            status: (row.status as 'Pendente' | 'Concluido') ?? 'Pendente',
            editorNotes: row.editor_notes ?? "",
            assets: row.scene_assets?.map((a) => ({
              id: a.id,
              type: a.asset_type,
              value: a.asset_value,
            })) ?? [],
          }))
          setScenes(mappedScenes)
          if (!documentData) {
            setDocumentData({
              title: docRow.title ?? "Documento",
              body: { content: [] },
              comments: {},
              documentId: docRow.id,
              revisionId: "",
            })
          }
        }
      } finally {
        setRemoteLoading(false)
      }
    }

    loadRemoteScenes()
  }, [userId, docId, scenes.length, setScenes, setDocumentData, documentData, toast])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onExport={() => handleExport(scenes)}
        onCopyLinks={() => handleCopyYouTubeLinks(scenes)}
        onNewScript={clearDocumentData}
      />

      {/* Main Content */}
      <main className="flex-1 min-h-[calc(100vh-var(--header-height))] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {remoteLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 space-y-4 max-w-7xl mx-auto"
            >
              <div className="flex gap-4">
                <Skeleton className="h-[600px] w-2/3 rounded-xl" />
                <Skeleton className="h-[600px] w-1/3 rounded-xl" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: activeView === "script" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeView === "script" ? 20 : -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full"
            >
              {activeView === "script" ? (
                <ScriptView documentData={documentData} scenes={scenes} />
              ) : (
                <TableView scenes={scenes} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
