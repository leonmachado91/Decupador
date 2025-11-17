"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link, Clock, FileText, Tag } from "lucide-react"
import { useDocumentStore } from '@/lib/stores/documentStore'
import type { Scene } from '@/lib/stores/documentStore'

interface BreakdownModalProps {
  isOpen: boolean
  onClose: () => void
  rowData?: Scene
}

export function BreakdownModal({ isOpen, onClose, rowData }: BreakdownModalProps) {
  const [selectedText, setSelectedText] = useState("")
  const [processedParts, setProcessedParts] = useState<string[]>([])
  const updateScene = useDocumentStore((s) => s.updateScene)
  const addAssetToScene = useDocumentStore((s) => s.addAssetToScene)

  const rawComment: string = rowData?.rawComment || "Comentário não disponível"

  const handleCategorize = (category: string) => {
    if (!selectedText) return
    const sceneId = rowData?.id
    if (!sceneId) return

    if (category === 'link') {
      addAssetToScene(sceneId, { id: crypto.randomUUID(), type: 'link', value: selectedText })
    } else if (category === 'timestamp') {
      addAssetToScene(sceneId, { id: crypto.randomUUID(), type: 'timestamp', value: selectedText })
    } else if (category === 'narrated') {
      updateScene(sceneId, { narrativeText: `${rowData.narrativeText}\n${selectedText}` })
    } else if (category === 'notes') {
      updateScene(sceneId, { editorNotes: `${rowData.editorNotes || ''}\n${selectedText}` })
    }

    setProcessedParts([...processedParts, selectedText])
    setSelectedText("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Decupagem de Diretriz</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Raw Comment */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Comentário Bruto</h3>
            <div className="rounded-lg bg-secondary/50 p-6">
              <p
                className="whitespace-pre-wrap text-sm leading-relaxed select-text"
                onMouseUp={() => {
                  const selection = window.getSelection()?.toString()
                  if (selection) setSelectedText(selection)
                }}
              >
                {rawComment}
              </p>
            </div>
            {selectedText && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
                <Badge variant="outline" className="border-primary">
                  Texto Selecionado
                </Badge>
                <span className="text-sm flex-1">"{selectedText}"</span>
              </div>
            )}
          </div>

          {/* Category Buttons */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Catalogar Seleção Como:</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleCategorize("link")}
                disabled={!selectedText}
                className="justify-start h-auto py-4"
                variant="outline"
              >
                <Link className="mr-3 h-5 w-5 text-chart-2" />
                <div className="text-left">
                  <div className="font-semibold">Adicionar a Links</div>
                  <div className="text-xs text-muted-foreground">URLs e assets</div>
                </div>
              </Button>

              <Button
                onClick={() => handleCategorize("timestamp")}
                disabled={!selectedText}
                className="justify-start h-auto py-4"
                variant="outline"
              >
                <Clock className="mr-3 h-5 w-5 text-chart-1" />
                <div className="text-left">
                  <div className="font-semibold">Adicionar a Timestamps</div>
                  <div className="text-xs text-muted-foreground">Marcações de tempo</div>
                </div>
              </Button>

              <Button
                onClick={() => handleCategorize("narrated")}
                disabled={!selectedText}
                className="justify-start h-auto py-4"
                variant="outline"
              >
                <FileText className="mr-3 h-5 w-5 text-chart-3" />
                <div className="text-left">
                  <div className="font-semibold">Adicionar a Narrado</div>
                  <div className="text-xs text-muted-foreground">Texto do roteiro</div>
                </div>
              </Button>

              <Button
                onClick={() => handleCategorize("notes")}
                disabled={!selectedText}
                className="justify-start h-auto py-4"
                variant="outline"
              >
                <Tag className="mr-3 h-5 w-5 text-chart-4" />
                <div className="text-left">
                  <div className="font-semibold">Adicionar a Notas</div>
                  <div className="text-xs text-muted-foreground">Observações do editor</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Processed Items */}
          {processedParts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Itens Processados</h3>
              <div className="space-y-2">
                {processedParts.map((part, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded bg-chart-1/10 border border-chart-1/30"
                  >
                    <Badge variant="outline" className="border-chart-1">
                      ✓
                    </Badge>
                    <span className="text-sm line-through opacity-60">{part}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={onClose}>
            Salvar Progresso
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
