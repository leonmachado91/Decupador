"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Edit, Clock3 } from "lucide-react"
import { linkify } from "@/lib/linkUtils"
import { sanitizePlainText } from "@/lib/sanitize"
import { decodeHtmlEntities } from "@/lib/dataProcessor"
import { AssetManager } from "./asset-manager"
import type { Scene, AssetType } from "@/lib/stores/documentStore"

interface TableViewRowProps {
    scene: Scene
    assetInput: { type: AssetType; value: string }
    onAssetInputChange: (field: "type" | "value", value: string) => void
    onAddAsset: () => void
    isSavingAsset: boolean
    onStatusChange: (status: "Pendente" | "Concluido") => void
    onNotesChange: (value: string) => void
    onNotesBlur: (value: string) => void
    onOpenBreakdown: () => void
    setHoveredSceneId: (id: string | null) => void
}

export function TableViewRow({
    scene,
    assetInput,
    onAssetInputChange,
    onAddAsset,
    isSavingAsset,
    onStatusChange,
    onNotesChange,
    onNotesBlur,
    onOpenBreakdown,
    setHoveredSceneId,
}: TableViewRowProps) {
    const timestampAssets = scene.assets.filter((asset) => asset.type === "timestamp")

    return (
        <tr
            data-scene-id={scene.id}
            className="border-b border-border/40 transition-colors hover:bg-secondary/30 group"
            onMouseEnter={() => setHoveredSceneId(scene.id)}
            onMouseLeave={() => setHoveredSceneId(null)}
        >
            <td className="align-top px-5 py-4">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90 select-text cursor-text">
                            {linkify(sanitizePlainText(decodeHtmlEntities(scene.narrativeText)))}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xl whitespace-pre-line text-sm leading-relaxed glass-panel">
                        {linkify(sanitizePlainText(decodeHtmlEntities(scene.narrativeText)))}
                    </TooltipContent>
                </Tooltip>
            </td>
            <td className="align-top px-5 py-4">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors select-text cursor-text">
                            {linkify(sanitizePlainText(decodeHtmlEntities(scene.rawComment)))}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xl whitespace-pre-line text-sm leading-relaxed glass-panel">
                        {linkify(sanitizePlainText(decodeHtmlEntities(scene.rawComment)))}
                    </TooltipContent>
                </Tooltip>
            </td>

            {/* Asset Manager Column (Merged Type/Link for better layout) */}
            <td className="align-top px-5 py-4" colSpan={2}>
                <AssetManager
                    sceneId={scene.id}
                    assets={scene.assets}
                    inputState={assetInput}
                    onInputChange={onAssetInputChange}
                    onAddAsset={onAddAsset}
                    isSaving={isSavingAsset}
                />
            </td>

            <td className="align-top px-5 py-4">
                <div className="flex flex-wrap gap-2">
                    {timestampAssets.length === 0 ? (
                        <span className="text-xs text-muted-foreground/50 italic">--:--</span>
                    ) : (
                        timestampAssets.map((asset) => (
                            <Badge
                                key={asset.id}
                                variant="outline"
                                className="flex items-center gap-1 rounded-md border-dashed border-border px-2 py-1 text-xs font-mono bg-background/50"
                            >
                                <Clock3 className="h-3 w-3 text-muted-foreground" />
                                {asset.value}
                            </Badge>
                        ))
                    )}
                </div>
            </td>
            <td className="align-top px-5 py-4">
                <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${scene.assets.length > 0 ? "bg-primary" : "bg-muted"}`} aria-hidden />
                        {scene.assets.length} assets
                    </p>
                </div>
            </td>
            <td className="align-top px-5 py-4">
                <Select
                    value={scene.status === "Concluido" ? "completed" : "pending"}
                    onValueChange={(value) => onStatusChange(value === "completed" ? "Concluido" : "Pendente")}
                >
                    <SelectTrigger aria-label="Status da cena" className={`h-8 w-32 text-xs border-transparent ${scene.status === "Concluido" ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-secondary hover:bg-secondary/80"}`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pending">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                                Pendente
                            </div>
                        </SelectItem>
                        <SelectItem value="completed">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-primary" />
                                Concluído
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </td>
            <td className="align-top px-5 py-4">
                <Input
                    type="text"
                    value={scene.editorNotes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    onBlur={(e) => onNotesBlur(e.target.value)}
                    placeholder="Adicionar nota..."
                    className="h-8 min-w-[140px] bg-transparent border-transparent hover:bg-secondary/50 focus:bg-background focus:border-input transition-all text-xs"
                    aria-label="Notas do editor"
                />
            </td>
            <td className="align-top px-5 py-4 text-right">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onOpenBreakdown}
                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full"
                    aria-label={`Detalhes da cena ${scene.id}`}
                >
                    <Edit className="h-4 w-4" />
                </Button>
            </td>
        </tr>
    )
}
