"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InteractiveLink } from "@/components/ui/interactive-link"
import { Clock3, FileText, Image as ImageIcon, Link2, Music, Video } from "lucide-react"
import type { AssetType, SceneAsset } from "@/lib/stores/documentStore"

interface AssetManagerProps {
    sceneId: string
    assets: SceneAsset[]
    inputState: { type: AssetType; value: string }
    onInputChange: (field: "type" | "value", value: string) => void
    onAddAsset: () => void
    isSaving: boolean
}

const assetLabels: Record<AssetType, string> = {
    link: "Link",
    image: "Imagem",
    video: "Vídeo",
    audio: "Áudio",
    timestamp: "Timestamp",
    document: "Documento",
}

const getAssetIcon = (type: AssetType) => {
    switch (type) {
        case "link": return <Link2 className="h-3.5 w-3.5" />
        case "image": return <ImageIcon className="h-3.5 w-3.5" />
        case "video": return <Video className="h-3.5 w-3.5" />
        case "audio": return <Music className="h-3.5 w-3.5" />
        case "timestamp": return <Clock3 className="h-3.5 w-3.5" />
        case "document": return <FileText className="h-3.5 w-3.5" />
        default: return null
    }
}

export function AssetManager({
    sceneId,
    assets,
    inputState,
    onInputChange,
    onAddAsset,
    isSaving,
}: AssetManagerProps) {
    const linkAssets = assets.filter((asset) => asset.type !== "timestamp")

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2 min-h-[24px]">
                {linkAssets.length === 0 && (
                    <span className="text-xs text-muted-foreground/50 italic">Nenhum asset vinculado</span>
                )}
                {linkAssets.map((asset) => (
                    <Badge
                        key={asset.id}
                        variant="secondary"
                        className="flex items-center gap-1.5 rounded-md bg-secondary/50 hover:bg-secondary px-2 py-1 text-xs font-medium border border-border/50 transition-colors"
                    >
                        {getAssetIcon(asset.type)}
                        <InteractiveLink href={asset.value} className="max-w-[140px] text-foreground/80 hover:text-primary transition-colors">
                            <span className="truncate">{assetLabels[asset.type]}</span>
                        </InteractiveLink>
                    </Badge>
                ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Select
                    value={inputState.type}
                    onValueChange={(value) => onInputChange("type", value)}
                >
                    <SelectTrigger aria-label="Selecionar tipo de asset" className="h-8 w-[110px] text-xs bg-background/50">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(assetLabels).map((key) => (
                            <SelectItem key={key} value={key} className="text-xs">
                                {assetLabels[key as AssetType]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex flex-1 gap-2">
                    <Input
                        type="text"
                        value={inputState.value}
                        onChange={(e) => onInputChange("value", e.target.value)}
                        placeholder={inputState.type === "timestamp" ? "00:00:00" : "https://"}
                        className="h-8 flex-1 text-xs bg-background/50"
                        aria-label="Valor do asset"
                    />
                    <Button
                        size="sm"
                        onClick={onAddAsset}
                        disabled={isSaving}
                        className="h-8 px-3 text-xs"
                        variant="secondary"
                    >
                        {isSaving ? "..." : "Add"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
