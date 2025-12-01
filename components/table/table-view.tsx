"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, ExternalLink } from "lucide-react"
import { useDocumentStore } from '@/lib/stores/documentStore'
import type { Scene } from '@/lib/stores/documentStore'
import React from 'react'
import { linkify } from "@/lib/linkUtils"
import { decodeHtmlEntities } from '@/lib/dataProcessor'
import { sortScenes } from '@/lib/sortUtils'
import { useTextSelection } from "@/hooks/use-text-selection"
import { FloatingDecupageMenu } from "@/components/script/floating-decupage-menu"
import { BreakdownModal } from "@/components/modal"
import { useToast } from "@/hooks/use-toast"

interface TableViewProps {
  scenes: Scene[]
}

export function TableView({ scenes: initialScenes }: TableViewProps) {
  const updateScene = useDocumentStore((state) => state.updateScene)
  const addAssetToScene = useDocumentStore((state) => state.addAssetToScene)
  const sortCriteria = useDocumentStore((state) => state.sortCriteria)
  const setSortCriteria = useDocumentStore((state) => state.setSortCriteria)
  const { toast } = useToast()

  // Modal State
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false)
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)

  // Text Selection Hook
  const { text: selectedText, rect: selectionRect, isCollapsed } = useTextSelection();

  const scenes = React.useMemo(() => {
    return sortScenes(initialScenes, sortCriteria)
  }, [initialScenes, sortCriteria])

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

    const sceneRow = container?.closest('[data-scene-id]');
    const targetSceneId = sceneRow?.getAttribute('data-scene-id');

    if (targetSceneId) {
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
          updateScene(targetSceneId, { narrativeText: scene.narrativeText ? `${scene.narrativeText}\n${text}` : text });
          toast({ title: "Texto narrativo atualizado", description: "Texto adicionado à narrativa da cena." });
          break;
      }
    } else {
      toast({
        variant: "destructive",
        title: "Ação inválida",
        description: "Selecione um texto dentro de uma linha da tabela para vincular diretamente.",
      })
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

  // Função para lidar com mudanças no status
  const handleStatusChange = (sceneId: string, status: 'Pendente' | 'Concluído') => {
    const scene = scenes.find(s => s.id === sceneId)
    if (scene) {
      updateScene(sceneId, { status })
    }
  }

  // Função para lidar com mudanças nas notas do editor
  const handleNotesChange = (sceneId: string, notes: string) => {
    const scene = scenes.find(s => s.id === sceneId)
    if (scene) {
      updateScene(sceneId, { editorNotes: notes })
    }
  }

  return (
    <>
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

      <div className="h-[calc(100vh-4rem)] overflow-auto p-6">
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-end p-4">
            <Select value={sortCriteria || "none"} onValueChange={(value) => setSortCriteria(value === "none" ? null : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ordem Original</SelectItem>
                <SelectItem value="narrativeText_asc">Roteiro (A-Z)</SelectItem>
                <SelectItem value="narrativeText_desc">Roteiro (Z-A)</SelectItem>
                <SelectItem value="rawComment_asc">Comentário (A-Z)</SelectItem>
                <SelectItem value="rawComment_desc">Comentário (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold min-w-[300px]">Trecho Narrado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold min-w-[300px]">Comentário Bruto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold min-w-[150px]">Tipo de Mídia</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold min-w-[150px]">Link / Asset</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold min-w-[100px]">Timestamp</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold min-w-[150px]">Diretriz/Nota</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold min-w-[150px]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold min-w-[200px]">Notas do Editor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold min-w-[150px]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {scenes.map((scene, index) => (
                  <tr key={scene.id} data-scene-id={scene.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                    <td className="px-6 py-4">
                      <div className="max-w-md text-sm leading-relaxed">{linkify(decodeHtmlEntities(scene.narrativeText))}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md text-sm leading-relaxed comment-text-overflow">{linkify(decodeHtmlEntities(scene.rawComment))}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Select>
                        <SelectTrigger className="w-32 h-8 text-sm">
                          <SelectValue placeholder="Tipo de mídia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="image">Imagem</SelectItem>
                          <SelectItem value="video">Vídeo</SelectItem>
                          <SelectItem value="audio">Áudio</SelectItem>
                          <SelectItem value="document">Documento</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4">
                      {scene.assets.length > 0 ? (
                        scene.assets.map((asset, assetIndex) => (
                          <a
                            key={assetIndex}
                            href={asset.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Ver Asset
                          </a>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Input type="text" placeholder="00:00" className="w-24 h-8 text-sm bg-secondary/50" />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">—</span>
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        value={scene.status === 'Concluído' ? 'completed' : 'pending'}
                        onValueChange={(value) => handleStatusChange(scene.id, value === 'completed' ? 'Concluído' : 'Pendente')}
                      >
                        <SelectTrigger className="w-32 h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            <Badge variant="secondary">Pendente</Badge>
                          </SelectItem>
                          <SelectItem value="completed">
                            <Badge className="bg-chart-1">Concluído</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="text"
                        value={scene.editorNotes}
                        onChange={(e) => handleNotesChange(scene.id, e.target.value)}
                        placeholder="Adicionar nota..."
                        className="max-w-xs h-8 text-sm bg-secondary/50"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm" onClick={() => handleOpenBreakdown(scene.id)} className="h-8" aria-label={`Decupar ${scene.id}`}>
                        <Edit className="mr-2 h-3 w-3" />
                        Decupar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
