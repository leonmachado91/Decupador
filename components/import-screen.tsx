"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Loader2 } from "lucide-react"

interface ImportScreenProps {
  onImport: (data: any) => void
}

export function ImportScreen({ onImport }: ImportScreenProps) {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleImport = async () => {
    if (!url) return

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      onImport({
        title: "Roteiro - Episódio 01",
        content: "Conteúdo do roteiro importado...",
        comments: [],
      })
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-2xl bg-primary/10 p-6">
              <FileText className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-balance">Decupador de Roteiro HI</h1>
          <p className="text-lg text-muted-foreground text-balance">
            Cole o link de um Google Doc público para começar
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="https://docs.google.com/document/d/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 bg-card text-base"
              disabled={isLoading}
            />
            <Button
              onClick={handleImport}
              disabled={!url || isLoading}
              className="btn-glossy h-12 px-8 text-base font-semibold"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Importando...
                </>
              ) : (
                "Decupar Roteiro"
              )}
            </Button>
          </div>

          {isLoading && <p className="text-sm text-muted-foreground animate-pulse">Processando documento...</p>}
        </div>
      </div>
    </div>
  )
}
