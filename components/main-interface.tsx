"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Table, Download, Plus } from "lucide-react"
import { ScriptView } from "@/components/script-view"
import { TableView } from "@/components/table-view"

interface MainInterfaceProps {
  scriptData: any
  onNewScript: () => void
}

export function MainInterface({ scriptData, onNewScript }: MainInterfaceProps) {
  const [activeView, setActiveView] = useState<"script" | "table">("script")

  const handleExport = () => {
    // Export logic
    console.log("Exporting to CSV...")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold">Decupador de Roteiro HI</h1>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 rounded-lg bg-secondary p-1">
              <Button
                variant={activeView === "script" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("script")}
                className={activeView === "script" ? "btn-glossy" : ""}
              >
                <FileText className="mr-2 h-4 w-4" />
                Visão Roteiro
              </Button>
              <Button
                variant={activeView === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("table")}
                className={activeView === "table" ? "btn-glossy" : ""}
              >
                <Table className="mr-2 h-4 w-4" />
                Visão Tabela
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              className="border-primary/30 hover:bg-primary/10 bg-transparent"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              onClick={onNewScript}
              className="border-primary/30 hover:bg-primary/10 bg-transparent"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Roteiro
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {activeView === "script" ? <ScriptView scriptData={scriptData} /> : <TableView scriptData={scriptData} />}
      </main>
    </div>
  )
}
