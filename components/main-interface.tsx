"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Table, Download, Plus, Sun, Moon } from "lucide-react"
import { ScriptView } from "@/components/script"
import { TableView } from "@/components/table"
import { useDocumentStore } from '@/lib/stores/documentStore'
import { useTheme } from 'next-themes'

// Tipos são fornecidos pelo store (Asset, Scene, GoogleDocData)

export function MainInterface() {
  const [activeView, setActiveView] = useState<"script" | "table">("script")
  const documentData = useDocumentStore((state) => state.documentData)
  const scenes = useDocumentStore((state) => state.scenes)
  const clearDocumentData = useDocumentStore((state) => state.clearDocumentData)
  const { theme, setTheme } = useTheme()

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
              >
                <FileText className="mr-2 h-4 w-4" />
                Visão Roteiro
              </Button>
              <Button
                variant={activeView === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("table")}
              >
                <Table className="mr-2 h-4 w-4" />
                Visão Tabela
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Alternar tema"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
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
              onClick={() => clearDocumentData()}
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
        {activeView === "script" ? (
          <ScriptView documentData={documentData} scenes={scenes} />
        ) : (
          <TableView scenes={scenes} />
        )}
      </main>
    </div>
  )
}
