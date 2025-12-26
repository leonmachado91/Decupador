'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare } from 'lucide-react'
import { linkify } from '@/lib/linkUtils'
import { sanitizePlainText } from '@/lib/sanitize'
import { decodeHtmlEntities } from '@/lib/dataProcessor'
import type { Scene } from '@/lib/stores/documentStore'

interface ScenesSidebarProps {
  scenes: Scene[]
  hoveredSceneId: string | null
  setHoveredSceneId: (id: string | null) => void
  onOpenBreakdown: (id: string) => void
}

export function ScenesSidebar({
  scenes,
  hoveredSceneId,
  setHoveredSceneId,
  onOpenBreakdown,
}: ScenesSidebarProps) {
  return (
    <div className="h-full overflow-y-auto bg-secondary/30 p-6 border-l border-border/50">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6 sticky top-0 bg-secondary/95 backdrop-blur py-2 z-10 -mx-2 px-2 rounded-lg">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Diretrizes
          </h3>
          <Badge variant="secondary" className="ml-auto font-mono text-xs">
            {scenes.length}
          </Badge>
        </div>

        {scenes.map((scene) => (
          <Card
            key={scene.id}
            data-scene-id={scene.id}
            onClick={() => {
              const selection = window.getSelection()
              if (selection && selection.toString().length > 0) {
                return
              }
              onOpenBreakdown(scene.id)
            }}
            onMouseEnter={() => setHoveredSceneId(scene.id)}
            onMouseLeave={() => setHoveredSceneId(null)}
            className={`p-4 cursor-pointer transition-all duration-200 group hover:shadow-md border-transparent ${
              hoveredSceneId === scene.id
                ? 'bg-background border-primary ring-1 ring-primary shadow-lg scale-[1.02]'
                : 'bg-card hover:bg-background hover:border-primary/20'
            }`}
          >
            <div className="space-y-3" id={`scene-card-${scene.id}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-medium leading-relaxed comment-text-overflow text-foreground/90 group-hover:text-foreground transition-colors">
                  {linkify(sanitizePlainText(decodeHtmlEntities(scene.rawComment)))}
                </div>
                <Badge
                  variant={scene.status === 'Concluido' ? 'default' : 'outline'}
                  className={`text-[10px] px-1.5 py-0 h-5 ${scene.status === 'Concluido' ? 'bg-primary hover:bg-primary/90' : 'text-muted-foreground'}`}
                >
                  {scene.status === 'Concluido' ? 'Feito' : 'Pendente'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary/80 transition-colors">
                <div
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${hoveredSceneId === scene.id ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                />
                <span className="line-clamp-1 italic">"{scene.narrativeText}"</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
