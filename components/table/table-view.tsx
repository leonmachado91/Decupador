"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, ExternalLink } from "lucide-react"
import { BreakdownModal } from "@/components/modal"
import { useDocumentStore } from '@/lib/stores/documentStore'
import type { Scene } from '@/lib/stores/documentStore'
import React from 'react'
import { linkify } from "@/lib/linkUtils"
import { decodeHtmlEntities } from '@/lib/dataProcessor'
import { sortScenes } from '@/lib/sortUtils'

export function TableView({ scenes: initialScenes }: TableViewProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const updateScene = useDocumentStore((state) => state.updateScene)
  const sortCriteria = useDocumentStore((state) => state.sortCriteria)
  const setSortCriteria = useDocumentStore((state) => state.setSortCriteria)

  const scenes = React.useMemo(() => {
    return sortScenes(initialScenes, sortCriteria)
  }, [initialScenes, sortCriteria])

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
                  <tr key={scene.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                    <td className="px-6 py-4">
                      <p className="max-w-md text-sm leading-relaxed">{linkify(decodeHtmlEntities(scene.narrativeText))}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="max-w-md text-sm leading-relaxed comment-text-overflow">{linkify(decodeHtmlEntities(scene.rawComment))}</p>
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
                      <Button size="sm" onClick={() => setSelectedRow(index)} className="h-8" aria-label={`Decupar ${scene.id}`}>
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

      {selectedRow !== null && (
        <BreakdownModal
          isOpen={selectedRow !== null}
          onClose={() => setSelectedRow(null)}
          rowData={selectedRow !== null ? scenes[selectedRow] : undefined}
        />
      )}
    </>
  )
}
