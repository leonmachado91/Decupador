"use client"

import { useState } from "react"
import { ScriptView } from "@/components/script"
import { TableView } from "@/components/table"
import { useDocumentStore } from '@/lib/stores/documentStore'
import { Header } from "@/components/header"
import { useExportCsv } from "@/hooks/use-export-csv"
import { useYouTubeLinks } from "@/hooks/use-youtube-links"

export function MainInterface() {
  const [activeView, setActiveView] = useState<"script" | "table">("script")
  const documentData = useDocumentStore((state) => state.documentData)
  const scenes = useDocumentStore((state) => state.scenes)
  const clearDocumentData = useDocumentStore((state) => state.clearDocumentData)

  const { handleExport } = useExportCsv()
  const { handleCopyYouTubeLinks } = useYouTubeLinks()

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onExport={() => handleExport(scenes)}
        onCopyLinks={() => handleCopyYouTubeLinks(scenes)}
        onNewScript={clearDocumentData}
      />

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
