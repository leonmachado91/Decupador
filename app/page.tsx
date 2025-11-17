"use client"

import { ImportScreen } from "@/components/import-screen"
import { MainInterface } from "@/components/main-interface"
import { useDocumentStore } from "@/lib/stores/documentStore"

export default function Home() {
  const docId = useDocumentStore((s) => s.docId)
  const scenes = useDocumentStore((s) => s.scenes)
  const documentData = useDocumentStore((s) => s.documentData)

  const hasDocument = !!docId || !!documentData || scenes.length > 0

  return (
    <div className="min-h-screen bg-background">
      {!hasDocument ? <ImportScreen /> : <MainInterface />}
    </div>
  )
}