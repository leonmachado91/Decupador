"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare } from "lucide-react"
import { linkify } from "@/lib/linkUtils"
import type { Scene, GoogleDocData } from '@/lib/stores/documentStore'
import { extractFormattedText, decodeHtmlEntities } from '@/lib/dataProcessor'
import { useDocumentStore } from '@/lib/stores/documentStore'
import { sortScenes } from '@/lib/sortUtils'
import React from 'react'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import { useTextSelection } from "@/hooks/use-text-selection"
import { FloatingDecupageMenu } from "./floating-decupage-menu"
import { BreakdownModal } from "@/components/modal"
import { useToast } from "@/hooks/use-toast"

interface ScriptViewProps {
  documentData: GoogleDocData | null
  scenes: Scene[]
}

export function ScriptView({ documentData, scenes: initialScenes }: ScriptViewProps) {
  const sortCriteria = useDocumentStore((state) => state.sortCriteria)
  const updateScene = useDocumentStore((state) => state.updateScene)
  const addAssetToScene = useDocumentStore((state) => state.addAssetToScene)
  const { toast } = useToast()

  // Modal State
  const [breakdownModalOpen, setBreakdownModalOpen] = React.useState(false)
  const [selectedSceneId, setSelectedSceneId] = React.useState<string | null>(null)

  // Text Selection Hook
  const { text: selectedText, rect: selectionRect, isCollapsed } = useTextSelection();

  const scenes = React.useMemo(() => {
    return sortScenes(initialScenes, sortCriteria)
  }, [initialScenes, sortCriteria])

  // Hover State for Bidirectional Highlighting
  const [hoveredSceneId, setHoveredSceneId] = React.useState<string | null>(null)

  // Handlers
  const handleOpenBreakdown = (sceneId: string) => {
    setSelectedSceneId(sceneId)
    setBreakdownModalOpen(true)
  }

  const handleMenuAction = (type: 'scene' | 'note' | 'timecode' | 'video' | 'image' | 'link', text: string) => {
    // Try to find the scene ID from the selection context
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer.nodeType === 1
      ? range.commonAncestorContainer as Element
      : range.commonAncestorContainer.parentElement;

    const sceneCard = container?.closest('[data-scene-id]');
    const targetSceneId = sceneCard?.getAttribute('data-scene-id');

    if (targetSceneId) {
      // Direct update if we are in a scene context (sidebar)
      const scene = scenes.find(s => s.id === targetSceneId);
      if (!scene) return;

      switch (type) {
        case 'timecode':
          addAssetToScene(targetSceneId, { id: crypto.randomUUID(), type: 'timestamp', value: text });
          toast({ title: "Timestamp atualizado", description: '"' + text + '" adicionado à cena.' });
          break;
        case 'video':
        case 'image':
        case 'link':
          addAssetToScene(targetSceneId, { id: crypto.randomUUID(), type: 'link', value: text });
          toast({ title: "Link adicionado", description: "Link/Asset vinculado à cena." });
          break;
        case 'note':
          updateScene(targetSceneId, { editorNotes: scene.editorNotes ? `${scene.editorNotes}\n${text}` : text });
          toast({ title: "Nota adicionada", description: "Nota adicionada ao editor." });
          break;
        case 'scene':
          // If "Scene" is clicked on an existing scene, maybe append to narrative? 
          // Or do nothing as it's for creating new scenes.
          // For now, let's assume "Scene" button in this context might mean "Add to Narrative"
          updateScene(targetSceneId, { narrativeText: scene.narrativeText ? `${scene.narrativeText}\n${text}` : text });
          toast({ title: "Texto narrativo atualizado", description: "Texto adicionado à narrativa da cena." });
          break;
      }
    } else {
      // If we are NOT in a scene context (e.g. script body), we might want to create a new scene
      // or just show a message that we need a target scene.
      // For now, preserving the "Create Scene" behavior if type is 'scene'
      if (type === 'scene') {
        toast({
          title: "Nova Cena",
          description: "Funcionalidade de criar nova cena a partir do texto será implementada em breve.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Ação inválida",
          description: "Selecione um texto dentro de um cartão de comentário para vincular diretamente.",
        })
      }
    }

    // Clear selection after action
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
  }

  const handleClearSelection = () => {
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
  }

  // Função para renderizar o conteúdo do documento
  const renderDocumentContent = () => {
    if (!documentData?.body) return <p role="status">Conteúdo não disponível</p>

    // Extrair e formatar o texto do documento
    const documentText = extractFormattedText(documentData.body)

    // Dividir o texto em parágrafos
    const paragraphs = documentText.split('\n').filter(p => p.trim() !== '')

    return (
      <div className="max-w-none space-y-4">
        {paragraphs.map((paragraph, index) => {
          // Check if this paragraph is related to the hovered scene
          const relatedScene = scenes.find(s => s.id === hoveredSceneId);
          const isHighlighted = relatedScene && paragraph.includes(relatedScene.narrativeText);

          return (
            <div
              key={index}
              className={`text-base leading-relaxed text-foreground/90 transition-colors duration-200 rounded px-1 ${isHighlighted ? 'bg-yellow-500/20' : 'bg-transparent'}`}
            >
              {linkify(paragraph)}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      <FloatingDecupageMenu
        selectionRect={selectionRect}
        selectedText={selectedText}
        onAction={handleMenuAction}
        onClearSelection={handleClearSelection}
      />

      {selectedSceneId && (
        <BreakdownModal
          isOpen={breakdownModalOpen}
          onClose={() => setBreakdownModalOpen(false)}
          rowData={scenes.find(s => s.id === selectedSceneId)}
        />
      )}

      <ResizablePanelGroup direction="horizontal">
        {/* Script Content */}
        <ResizablePanel defaultSize={70} minSize={30}>
          <div className="h-full overflow-y-auto p-8">
            <div className="mx-auto max-w-4xl space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{documentData?.title || "Documento sem título"}</h2>
                <p className="text-muted-foreground">Roteiro importado do Google Docs</p>
              </div>

              <Card className="p-8 bg-card/50">
                {renderDocumentContent()}
              </Card>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Comments Sidebar */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="h-full overflow-y-auto bg-card/30 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Diretrizes</h3>
                <Badge variant="secondary" className="ml-auto">
                  {scenes.length}
                </Badge>
              </div>

              {scenes.map((scene) => (
                <Card
                  key={scene.id}
                  data-scene-id={scene.id}
                  onClick={() => handleOpenBreakdown(scene.id)}
                  onMouseEnter={() => setHoveredSceneId(scene.id)}
                  onMouseLeave={() => setHoveredSceneId(null)}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/10 ${hoveredSceneId === scene.id ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium leading-relaxed comment-text-overflow">
                        {linkify(decodeHtmlEntities(scene.rawComment))}
                      </div>
                      <Badge
                        variant={scene.status === "Concluído" ? "default" : "secondary"}
                        className={scene.status === "Concluído" ? "bg-chart-1" : ""}
                      >
                        {scene.status === "Concluído" ? "Concluído" : "Pendente"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      <span>Vinculado a: "{scene.narrativeText}"</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}