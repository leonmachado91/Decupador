"use client"

import { ImportScreen } from "@/components/import"
import { MainInterface } from "@/components/main-interface"
import { useDocumentStore } from "@/lib/stores/documentStore"

export default function Home() {
  const documentData = useDocumentStore((s) => s.documentData)

  const hasDocument = !!documentData

  return (
    <div className="min-h-screen bg-background">
      {!hasDocument ? <ImportScreen /> : <MainInterface />}
    </div>
  )
}
