"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare } from "lucide-react"

interface ScriptViewProps {
  scriptData: any
}

export function ScriptView({ scriptData }: ScriptViewProps) {
  const mockComments = [
    {
      id: 1,
      text: "CENA 01 - INT. ESCRITÓRIO - DIA",
      linkedText: "Cena de abertura no escritório",
      status: "pending",
    },
    {
      id: 2,
      text: 'Adicionar música de fundo: "Ambient Corporate"',
      linkedText: "música ambiente",
      status: "pending",
    },
    {
      id: 3,
      text: "Timestamp: 00:15 - Transição para próxima cena",
      linkedText: "transição",
      status: "completed",
    },
  ]

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Script Content - 70% */}
      <div className="flex-[7] overflow-y-auto border-r border-border p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{scriptData.title}</h2>
            <p className="text-muted-foreground">Roteiro importado do Google Docs</p>
          </div>

          <Card className="p-8 bg-card/50">
            <div className="prose prose-invert max-w-none space-y-4">
              <p className="text-lg leading-relaxed">
                <span className="hover:bg-primary/20 cursor-pointer transition-colors rounded px-1">
                  CENA 01 - INT. ESCRITÓRIO - DIA
                </span>
              </p>

              <p className="text-base leading-relaxed text-foreground/90">
                João entra no escritório carregando uma pasta de documentos. A{" "}
                <span className="hover:bg-primary/20 cursor-pointer transition-colors rounded px-1">
                  música ambiente
                </span>{" "}
                toca suavemente ao fundo enquanto ele se aproxima de sua mesa.
              </p>

              <p className="text-base leading-relaxed text-foreground/90">
                Ele abre o computador e começa a revisar os relatórios do dia. Uma{" "}
                <span className="hover:bg-primary/20 cursor-pointer transition-colors rounded px-1">transição</span>{" "}
                suave leva para a próxima cena.
              </p>

              <p className="text-lg leading-relaxed mt-8">CENA 02 - EXT. RUA - DIA</p>

              <p className="text-base leading-relaxed text-foreground/90">
                João caminha pela rua movimentada da cidade. O som do tráfego e das pessoas conversando cria uma
                atmosfera urbana vibrante.
              </p>
            </div>
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
              {mockComments.length}
            </Badge>
          </div>

          {mockComments.map((comment) => (
            <Card
              key={comment.id}
              className="p-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-relaxed">{comment.text}</p>
                  <Badge
                    variant={comment.status === "completed" ? "default" : "secondary"}
                    className={comment.status === "completed" ? "bg-chart-1" : ""}
                  >
                    {comment.status === "completed" ? "Concluído" : "Pendente"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span>Vinculado a: "{comment.linkedText}"</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
