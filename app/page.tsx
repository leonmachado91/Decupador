"use client"

import { useState } from "react"
import { ImportScreen } from "@/components/import-screen"
import { MainInterface } from "@/components/main-interface"

export default function Home() {
  const [isImported, setIsImported] = useState(false)
  const [scriptData, setScriptData] = useState<any>(null)

  const handleImport = (data: any) => {
    setScriptData(data)
    setIsImported(true)
  }

  const handleNewScript = () => {
    setIsImported(false)
    setScriptData(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {!isImported ? (
        <ImportScreen onImport={handleImport} />
      ) : (
        <MainInterface onNewScript={handleNewScript} />
      )}
    </div>
  )
}