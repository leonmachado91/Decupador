"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare } from "lucide-react"
import type { Scene, GoogleDocData } from '@/lib/stores/documentStore'
import { extractFormattedText, decodeHtmlEntities } from '@/lib/dataProcessor'

interface ScriptViewProps {
  documentData: GoogleDocData | null
  scenes: Scene[]
}

export function ScriptView({ documentData, scenes }: ScriptViewProps) {

  // Função para renderizar o conteúdo do documento
  const renderDocumentContent = () => {
    if (!documentData?.body) return <p role="status">Conteúdo não disponível</p>
    
    // Extrair e formatar o texto do documento
    const documentText = extractFormattedText(documentData.body)
    
    // Dividir o texto em parágrafos
    const paragraphs = documentText.split('\n').filter(p => p.trim() !== '')
    
    return (
      <div className="max-w-none space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed text-foreground/90">
            {paragraph}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Script Content - 70% */}
      <div className="flex-[7] overflow-y-auto border-r border-border p-8">
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

      {/* Comments Sidebar - 30% */}
      <div className="flex-[3] overflow-y-auto bg-card/30 p-6">
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
              className="p-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-relaxed">{decodeHtmlEntities(scene.rawComment)}</p>
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
    </div>
  )
}