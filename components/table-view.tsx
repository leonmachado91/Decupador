"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, ExternalLink } from "lucide-react"
import { BreakdownModal } from "@/components/breakdown-modal"

interface TableViewProps {
  scriptData: any
}

export function TableView({ scriptData }: TableViewProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null)

  const mockData = [
    {
      id: 1,
      narrated: "CENA 01 - INT. ESCRITÓRIO - DIA",
      link: "https://example.com/asset1",
      timestamp: "00:00",
      status: "pending",
      notes: "",
    },
    {
      id: 2,
      narrated: "João entra no escritório",
      link: "",
      timestamp: "00:15",
      status: "completed",
      notes: "Adicionar música de fundo",
    },
    {
      id: 3,
      narrated: "Transição para próxima cena",
      link: "https://example.com/transition",
      timestamp: "00:45",
      status: "pending",
      notes: "Usar efeito fade",
    },
  ]

  return (
    <>
      <div className="h-[calc(100vh-4rem)] overflow-auto p-6">
        <div className="rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trecho Narrado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Link / Asset</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Timestamp</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Notas do Editor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockData.map((row, index) => (
                  <tr key={row.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                    <td className="px-6 py-4">
                      <p className="max-w-md text-sm leading-relaxed">{row.narrated}</p>
                    </td>
                    <td className="px-6 py-4">
                      {row.link ? (
                        <a
                          href={row.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Ver Asset
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Input type="text" defaultValue={row.timestamp} className="w-24 h-8 text-sm bg-secondary/50" />
                    </td>
                    <td className="px-6 py-4">
                      <Select defaultValue={row.status}>
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
                        defaultValue={row.notes}
                        placeholder="Adicionar nota..."
                        className="max-w-xs h-8 text-sm bg-secondary/50"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm" onClick={() => setSelectedRow(index)} className="btn-glossy h-8">
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
          rowData={mockData[selectedRow]}
        />
      )}
    </>
  )
}
