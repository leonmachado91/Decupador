'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import type { Scene, GoogleDocData } from '@/lib/stores/documentStore'

import { useDocumentStore } from '@/lib/stores/documentStore'
import { sortScenes } from '@/lib/sortUtils'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { useTextSelection } from '@/hooks/use-text-selection'
import { FloatingDecupageMenu } from './floating-decupage-menu'
import { DocumentContent } from './document-content'
import { ScenesSidebar } from './scenes-sidebar'
import { BreakdownModal } from '@/components/modal'
import { useToast } from '@/hooks/use-toast'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useSupabaseUser } from '@/hooks/use-supabase-user'

interface ScriptViewProps {
  documentData: GoogleDocData | null
  scenes: Scene[]
}

export function ScriptView({ documentData, scenes: initialScenes }: ScriptViewProps) {
  const sortCriteria = useDocumentStore((state) => state.sortCriteria)
  const updateScene = useDocumentStore((state) => state.updateScene)
  const addAssetToScene = useDocumentStore((state) => state.addAssetToScene)
  const hoveredSceneId = useDocumentStore((state) => state.hoveredSceneId)
  const setHoveredSceneId = useDocumentStore((state) => state.setHoveredSceneId)
  const { toast } = useToast()
  const { userId } = useSupabaseUser()
  const supabaseClient = React.useMemo(() => createSupabaseBrowserClient(), [])

  const scenes = React.useMemo(() => {
    return sortScenes(initialScenes, sortCriteria)
  }, [initialScenes, sortCriteria])

  const [breakdownModalOpen, setBreakdownModalOpen] = React.useState(false)
  const [selectedSceneId, setSelectedSceneId] = React.useState<string | null>(null)
  const { text: selectedText, rect: selectionRect, range: selectionRange } = useTextSelection()

  const isSelectionInScene = React.useMemo(() => {
    if (!selectionRange) return false
    const container = selectionRange.commonAncestorContainer
    const element = container.nodeType === 1 ? (container as Element) : container.parentElement
    return !!element?.closest('[data-scene-id]')
  }, [selectionRange])

  // Scroll sincronizado removido conforme solicitado
  // React.useEffect(() => {
  //   if (!hoveredSceneId) return
  //   const el = document.getElementById(`scene-card-${hoveredSceneId}`)
  //   if (el) {
  //     el.scrollIntoView({ behavior: "smooth", block: "center" })
  //   }
  // }, [hoveredSceneId])

  // Helpers de persistencia e log
  const logSceneEvent = async (
    sceneId: string,
    level: 'info' | 'warn' | 'error',
    message: string,
  ) => {
    if (!userId) return
    await supabaseClient.from('scene_logs').insert({
      scene_id: sceneId,
      user_id: userId,
      level,
      message,
    })
  }

  const updateSceneRemote = async (sceneId: string, payload: Partial<Scene>) => {
    if (!userId) return
    await supabaseClient
      .from('scenes')
      .update({
        status: payload.status,
        editor_notes: payload.editorNotes,
        narrative_text: payload.narrativeText,
      })
      .eq('id', sceneId)
      .eq('user_id', userId)
  }

  const saveAssetRemote = async (
    sceneId: string,
    type: 'timestamp' | 'link' | 'image' | 'video' | 'audio' | 'document',
    value: string,
  ) => {
    if (!userId) return
    const assetId = crypto.randomUUID()
    const { error } = await supabaseClient.from('scene_assets').insert({
      id: assetId,
      scene_id: sceneId,
      user_id: userId,
      asset_type: type,
      asset_value: value,
    })
    if (!error) {
      addAssetToScene(sceneId, { id: assetId, type, value })
      logSceneEvent(sceneId, 'info', `Asset ${type} salvo`)
    }
  }

  // Handlers
  const handleOpenBreakdown = (sceneId: string) => {
    setSelectedSceneId(sceneId)
    setBreakdownModalOpen(true)
  }

  const handleMenuAction = (
    type: 'scene' | 'note' | 'timecode' | 'video' | 'image' | 'link',
    text: string,
  ) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const container =
      range.commonAncestorContainer.nodeType === 1
        ? (range.commonAncestorContainer as Element)
        : range.commonAncestorContainer.parentElement

    const sceneCard = container?.closest('[data-scene-id]')
    const targetSceneId = sceneCard?.getAttribute('data-scene-id')

    if (targetSceneId) {
      const scene = scenes.find((s) => s.id === targetSceneId)
      if (!scene) return

      switch (type) {
        case 'timecode':
          saveAssetRemote(targetSceneId, 'timestamp', text)
          toast({ title: 'Timestamp atualizado', description: `"${text}" adicionado a cena.` })
          break
        case 'video':
        case 'image':
        case 'link':
          saveAssetRemote(targetSceneId, 'link', text)
          toast({ title: 'Link adicionado', description: 'Link/Asset vinculado a cena.' })
          break
        case 'note': {
          const newNotes = scene.editorNotes ? `${scene.editorNotes}\n${text}` : text
          updateScene(targetSceneId, { editorNotes: newNotes })
          updateSceneRemote(targetSceneId, { editorNotes: newNotes })
          toast({ title: 'Nota adicionada', description: 'Nota adicionada ao editor.' })
          break
        }
        case 'scene': {
          const newNarrative = scene.narrativeText ? `${scene.narrativeText}\n${text}` : text
          updateScene(targetSceneId, { narrativeText: newNarrative })
          updateSceneRemote(targetSceneId, { narrativeText: newNarrative })
          toast({
            title: 'Texto narrativo atualizado',
            description: 'Texto adicionado a narrativa da cena.',
          })
          break
        }
      }
    } else {
      if (type === 'scene') {
        toast({
          title: 'Nova Cena',
          description:
            'Funcionalidade de criar nova cena a partir do texto sera implementada em breve.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Acao invalida',
          description:
            'Selecione um texto dentro de um cartao de comentario para vincular diretamente.',
        })
      }
    }

    if (window.getSelection) {
      window.getSelection()?.removeAllRanges()
    }
  }

  const handleClearSelection = () => {
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges()
    }
  }

  return (
    <div className="h-full relative">
      {isSelectionInScene && (
        <FloatingDecupageMenu
          selectionRect={selectionRect}
          selectedText={selectedText}
          onAction={handleMenuAction}
          onClearSelection={handleClearSelection}
        />
      )}

      {selectedSceneId && (
        <BreakdownModal
          isOpen={breakdownModalOpen}
          onClose={() => setBreakdownModalOpen(false)}
          rowData={scenes.find((s) => s.id === selectedSceneId)}
        />
      )}

      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={70} minSize={30} className="bg-background">
          <div className="h-full overflow-y-auto p-8 md:p-12">
            <div className="mx-auto max-w-4xl space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-3 tracking-tight text-foreground">
                  {documentData?.title || 'Documento sem titulo'}
                </h2>
                <p className="text-lg text-muted-foreground font-light">
                  Roteiro importado do Google Docs
                </p>
              </div>

              <Card className="p-10 bg-card shadow-sm border-border/40">
                <DocumentContent
                  documentData={documentData}
                  scenes={scenes}
                  hoveredSceneId={hoveredSceneId}
                  setHoveredSceneId={setHoveredSceneId}
                />
              </Card>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className="bg-border/50 hover:bg-primary/50 transition-colors"
        />

        <ResizablePanel defaultSize={30} minSize={20}>
          <ScenesSidebar
            scenes={scenes}
            hoveredSceneId={hoveredSceneId}
            setHoveredSceneId={setHoveredSceneId}
            onOpenBreakdown={handleOpenBreakdown}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
