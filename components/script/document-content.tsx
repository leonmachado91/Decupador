"use client"

import React from "react"
import { extractFormattedText } from "@/lib/dataProcessor"
import { linkify } from "@/lib/linkUtils"
import { sanitizePlainText } from "@/lib/sanitize"
import type { GoogleDocData, Scene } from "@/lib/stores/documentStore"

interface DocumentContentProps {
    documentData: GoogleDocData | null
    scenes: Scene[]
    hoveredSceneId: string | null
    setHoveredSceneId: (id: string | null) => void
}

export function DocumentContent({ documentData, scenes, hoveredSceneId, setHoveredSceneId }: DocumentContentProps) {
    if (!documentData?.body) return <p role="status" className="text-muted-foreground">Conteúdo não disponível</p>

    const documentText = extractFormattedText(documentData.body)
    const paragraphs = documentText.split("\n").filter((p) => p.trim() !== "")

    return (
        <div className="max-w-none space-y-6 font-serif text-lg leading-loose text-foreground/90">
            {paragraphs.map((paragraph, index) => {
                const relatedScene = scenes.find((s) => s.id === hoveredSceneId)
                const isHighlighted = relatedScene && paragraph.includes(relatedScene.narrativeText)

                // Find scene that contains this paragraph for reverse highlighting
                const sceneForParagraph = scenes.find(s => s.narrativeText && paragraph.includes(s.narrativeText))

                return (
                    <div
                        key={index}
                        onMouseEnter={() => sceneForParagraph && setHoveredSceneId(sceneForParagraph.id)}
                        onMouseLeave={() => setHoveredSceneId(null)}
                        className={`transition-colors duration-300 rounded px-2 py-1 -mx-2 ${isHighlighted ? "bg-primary/20 text-primary-foreground dark:text-foreground" : "bg-transparent"
                            }`}
                    >
                        {linkify(sanitizePlainText(paragraph))}
                    </div>
                )
            })}
        </div>
    )
}
