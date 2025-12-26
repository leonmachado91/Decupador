'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { FloatingDecupageMenu } from '@/components/script/floating-decupage-menu'
import { BreakdownModal } from '@/components/modal'
import { useDocumentStore } from '@/lib/stores/documentStore'
import type { AssetType, Scene, SortCriteria } from '@/lib/stores/documentStore'
import { getUserPreferences, saveUserPreferences } from '@/lib/api/preferences'
import { sortScenes } from '@/lib/sortUtils'
import { useTextSelection } from '@/hooks/use-text-selection'
import { useToast } from '@/hooks/use-toast'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useSupabaseUser } from '@/hooks/use-supabase-user'
import { z } from 'zod'
import { FileText } from 'lucide-react'
import { TableViewRow } from './table-view-row'

interface TableViewProps {
  scenes: Scene[]
}

type AssetFormState = Record<string, { type: AssetType; value: string }>
type PersistResult = { error: Error | null; localOnly?: boolean }

const assetSchema = z
  .object({
    type: z.enum(['link', 'image', 'video', 'audio', 'timestamp', 'document']),
    value: z.string().trim().min(1, 'Preencha um valor'),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'timestamp') {
      if (!/^\d{1,2}:\d{2}(?::\d{2})?$/.test(data.value)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Use formato HH:MM ou HH:MM:SS' })
      }
    } else {
      try {
        const url = new URL(data.value)
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol')
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Informe uma URL valida (http/https)',
        })
      }
    }
  })

export function TableView({ scenes: initialScenes }: TableViewProps) {
  const updateScene = useDocumentStore((state) => state.updateScene)
  const addAssetToScene = useDocumentStore((state) => state.addAssetToScene)
  const sortCriteria = useDocumentStore((state) => state.sortCriteria)
  const setSortCriteria = useDocumentStore((state) => state.setSortCriteria)
  const setHoveredSceneId = useDocumentStore((state) => state.setHoveredSceneId)
  const { toast } = useToast()
  const { userId } = useSupabaseUser()

  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false)
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [assetInputs, setAssetInputs] = useState<AssetFormState>({})
  const [savingAssetFor, setSavingAssetFor] = useState<string | null>(null)

  const { text: selectedText, rect: selectionRect, range: selectionRange } = useTextSelection()

  const isSelectionInScene = useMemo(() => {
    if (!selectionRange) return false
    const container = selectionRange.commonAncestorContainer
    const element = container.nodeType === 1 ? (container as Element) : container.parentElement
    return !!element?.closest('[data-scene-id]')
  }, [selectionRange])
  const supabaseClient = useMemo(() => createSupabaseBrowserClient(), [])

  const scenes = useMemo(
    () => sortScenes(initialScenes, sortCriteria),
    [initialScenes, sortCriteria],
  )

  // Hydrate sort preference from Supabase
  useEffect(() => {
    const loadPrefs = async () => {
      if (!userId) return
      const { sortCriteria: remoteSort } = await getUserPreferences(userId)
      if (remoteSort) {
        setSortCriteria(remoteSort)
      }
    }
    loadPrefs()
  }, [userId, setSortCriteria])

  useEffect(() => {
    setAssetInputs((prev) => {
      const next = { ...prev }
      initialScenes.forEach((scene) => {
        if (!next[scene.id]) {
          next[scene.id] = { type: 'link', value: '' }
        }
      })
      return next
    })
  }, [initialScenes])

  const updateSceneRemote = async (
    sceneId: string,
    payload: Partial<Scene>,
  ): Promise<PersistResult> => {
    if (!userId) {
      return { error: null, localOnly: true }
    }

    const { error } = await supabaseClient
      .from('scenes')
      .update({
        status: payload.status,
        editor_notes: payload.editorNotes,
        narrative_text: payload.narrativeText,
      })
      .eq('id', sceneId)
      .eq('user_id', userId)

    return { error: error ? new Error(error.message) : null }
  }

  const saveAssetRemote = async (
    sceneId: string,
    type: AssetType,
    value: string,
  ): Promise<PersistResult> => {
    const assetId = crypto.randomUUID()

    if (!userId) {
      addAssetToScene(sceneId, { id: assetId, type, value })
      return { error: null, localOnly: true }
    }

    const { error } = await supabaseClient.from('scene_assets').insert({
      id: assetId,
      scene_id: sceneId,
      user_id: userId,
      asset_type: type,
      asset_value: value,
    })

    if (!error) {
      addAssetToScene(sceneId, { id: assetId, type, value })
    }

    return { error: error ? new Error(error.message) : null }
  }

  const handleOpenBreakdown = (sceneId: string) => {
    setSelectedSceneId(sceneId)
    setBreakdownModalOpen(true)
  }

  const handleMenuAction = async (
    type: 'scene' | 'note' | 'timecode' | 'video' | 'image' | 'link',
    text: string,
  ) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const container =
      range.commonAncestorContainer.nodeType === 1
        ? (range.commonAncestorContainer as Element)
        : range.commonAncestorContainer.parentElement

    const sceneRow = container?.closest('[data-scene-id]')
    const targetSceneId = sceneRow?.getAttribute('data-scene-id')

    if (!targetSceneId) {
      toast({
        variant: 'destructive',
        title: 'Selecione dentro da tabela',
        description: 'Escolha um texto dentro de uma linha para vincular direto a cena.',
      })
      return
    }

    const scene = scenes.find((s) => s.id === targetSceneId)
    if (!scene) return

    switch (type) {
      case 'timecode': {
        const timeResult = await saveAssetRemote(targetSceneId, 'timestamp', text)
        if (timeResult.error) {
          toast({
            variant: 'destructive',
            title: 'Erro ao salvar timestamp',
            description: timeResult.error.message,
          })
        } else if (timeResult.localOnly) {
          toast({
            title: 'Timestamp salvo localmente',
            description: 'Entre para sincronizar com o Supabase.',
          })
        } else {
          toast({ title: 'Timestamp adicionado', description: `"${text}" ligado a cena.` })
        }
        break
      }
      case 'video':
      case 'image':
      case 'link': {
        const linkResult = await saveAssetRemote(targetSceneId, 'link', text)
        if (linkResult.error) {
          toast({
            variant: 'destructive',
            title: 'Erro ao salvar asset',
            description: linkResult.error.message,
          })
        } else if (linkResult.localOnly) {
          toast({
            title: 'Link salvo localmente',
            description: 'Entre para sincronizar com o Supabase.',
          })
        } else {
          toast({ title: 'Link criado', description: 'Asset vinculado a cena.' })
        }
        break
      }
      case 'note': {
        const newNotes = scene.editorNotes ? `${scene.editorNotes}\n${text}` : text
        updateScene(targetSceneId, { editorNotes: newNotes })
        const noteResult = await updateSceneRemote(targetSceneId, { editorNotes: newNotes })
        if (noteResult.error) {
          toast({
            variant: 'destructive',
            title: 'Erro ao salvar nota',
            description: noteResult.error.message,
          })
        } else if (noteResult.localOnly) {
          toast({
            title: 'Nota salva localmente',
            description: 'Entre para sincronizar com o Supabase.',
          })
        } else {
          toast({ title: 'Nota salva', description: 'Nota adicionada ao editor.' })
        }
        break
      }
      case 'scene': {
        const newNarrative = scene.narrativeText ? `${scene.narrativeText}\n${text}` : text
        updateScene(targetSceneId, { narrativeText: newNarrative })
        const narrativeResult = await updateSceneRemote(targetSceneId, {
          narrativeText: newNarrative,
        })
        if (narrativeResult.error) {
          toast({
            variant: 'destructive',
            title: 'Erro ao salvar trecho',
            description: narrativeResult.error.message,
          })
        } else if (narrativeResult.localOnly) {
          toast({
            title: 'Trecho salvo localmente',
            description: 'Entre para sincronizar com o Supabase.',
          })
        } else {
          toast({ title: 'Trecho atualizado', description: 'Texto anexado ao roteiro da cena.' })
        }
        break
      }
      default:
        break
    }

    window.getSelection()?.removeAllRanges()
  }

  const handleClearSelection = () => {
    window.getSelection()?.removeAllRanges()
  }

  const handleStatusChange = async (sceneId: string, status: 'Pendente' | 'Concluido') => {
    const scene = scenes.find((s) => s.id === sceneId)
    if (!scene) return

    const previous = scene.status
    updateScene(sceneId, { status })
    const result = await updateSceneRemote(sceneId, { status })

    if (result.error) {
      updateScene(sceneId, { status: previous })
      toast({
        variant: 'destructive',
        title: 'Nao foi possivel salvar o status',
        description: result.error.message,
      })
    } else if (result.localOnly) {
      toast({
        title: 'Status salvo localmente',
        description: 'Entre na conta para sincronizar com o Supabase.',
      })
    }
  }

  const handleNotesChange = (sceneId: string, notes: string) => {
    updateScene(sceneId, { editorNotes: notes })
  }

  const handleNotesBlur = async (sceneId: string, notes: string) => {
    const result = await updateSceneRemote(sceneId, { editorNotes: notes })

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Nao foi possivel salvar a nota',
        description: result.error.message,
      })
    } else if (result.localOnly) {
      toast({
        title: 'Nota salva localmente',
        description: 'Autentique-se para enviar ao Supabase.',
      })
    }
  }

  const handleAssetFieldChange = (sceneId: string, field: 'type' | 'value', value: string) => {
    setAssetInputs((prev) => ({
      ...prev,
      [sceneId]: {
        type: (field === 'type' ? (value as AssetType) : prev[sceneId]?.type) ?? 'link',
        value: field === 'value' ? value : (prev[sceneId]?.value ?? ''),
      },
    }))
  }

  const handleAddAsset = async (sceneId: string) => {
    const form = assetInputs[sceneId] ?? { type: 'link', value: '' }
    const validation = assetSchema.safeParse(form)

    if (!validation.success) {
      const message = validation.error.issues[0]?.message ?? 'Preencha os campos para salvar'
      toast({ variant: 'destructive', title: 'Asset invalido', description: message })
      return
    }

    setSavingAssetFor(sceneId)
    const result = await saveAssetRemote(sceneId, validation.data.type, validation.data.value)
    setSavingAssetFor(null)

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar asset',
        description: result.error.message,
      })
      return
    }

    if (result.localOnly) {
      toast({
        title: 'Asset salvo localmente',
        description: 'Entre para sincronizar com o Supabase.',
      })
    } else {
      toast({ title: 'Asset salvo', description: 'Asset enviado para o Supabase.' })
    }

    setAssetInputs((prev) => ({
      ...prev,
      [sceneId]: { ...prev[sceneId], value: '' },
    }))
  }

  const narrativeSortState =
    sortCriteria && sortCriteria.startsWith('narrativeText')
      ? sortCriteria.endsWith('desc')
        ? 'descending'
        : 'ascending'
      : 'none'

  const commentSortState =
    sortCriteria && sortCriteria.startsWith('rawComment')
      ? sortCriteria.endsWith('desc')
        ? 'descending'
        : 'ascending'
      : 'none'

  return (
    <TooltipProvider delayDuration={120}>
      {isSelectionInScene && (
        <FloatingDecupageMenu
          selectionRect={selectionRect}
          selectedText={selectedText}
          onAction={handleMenuAction}
          onClearSelection={handleClearSelection}
        />
      )}

      {selectedSceneId && (
        <BreakdownModal
          isOpen={breakdownModalOpen}
          onClose={() => setBreakdownModalOpen(false)}
          rowData={scenes.find((s) => s.id === selectedSceneId)}
        />
      )}

      <div className="flex h-full flex-col bg-background">
        <div className="flex items-center justify-end gap-3 px-6 pt-4 pb-2 border-b border-border/40 bg-background/50 backdrop-blur-sm sticky top-0 z-20">
          <Select
            value={(sortCriteria ?? 'none') as SortCriteria | 'none'}
            onValueChange={async (value) => {
              const parsed = value === 'none' ? null : (value as SortCriteria)
              setSortCriteria(parsed)
              if (userId) {
                const { error } = await saveUserPreferences(userId, parsed)
                if (error) {
                  toast({
                    variant: 'destructive',
                    title: 'Erro ao salvar preferencia',
                    description: error,
                  })
                }
              }
            }}
          >
            <SelectTrigger
              aria-label="Ordenar cenas"
              className="h-8 w-[180px] text-xs bg-secondary/50 border-transparent hover:bg-secondary"
            >
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ordem original</SelectItem>
              <SelectItem value="narrativeText_asc">Trecho (A-Z)</SelectItem>
              <SelectItem value="narrativeText_desc">Trecho (Z-A)</SelectItem>
              <SelectItem value="rawComment_asc">Comentario (A-Z)</SelectItem>
              <SelectItem value="rawComment_desc">Comentario (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-hidden">
          {scenes.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Empty className="border border-border bg-card/60 glass-panel">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileText className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>Nenhuma cena importada</EmptyTitle>
                  <EmptyDescription>
                    Cole a URL de um Google Doc na tela de importacao para gerar a tabela.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <p className="text-sm text-muted-foreground">
                    Quando houver cenas, elas aparecem aqui com status, assets e notas
                    sincronizados.
                  </p>
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <table className="w-full min-w-[1200px] table-fixed border-collapse text-sm">
                <thead className="sticky top-0 z-10 bg-secondary/95 backdrop-blur shadow-sm">
                  <tr className="border-b border-border">
                    <th
                      aria-sort={
                        narrativeSortState as
                          | 'none'
                          | 'ascending'
                          | 'descending'
                          | 'other'
                          | undefined
                      }
                      scope="col"
                      className="w-[20%] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Trecho narrado
                    </th>
                    <th
                      aria-sort={
                        commentSortState as
                          | 'none'
                          | 'ascending'
                          | 'descending'
                          | 'other'
                          | undefined
                      }
                      scope="col"
                      className="w-[20%] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Comentario bruto
                    </th>
                    <th
                      scope="col"
                      className="w-[25%] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                      colSpan={2}
                    >
                      Assets & Links
                    </th>
                    <th
                      scope="col"
                      className="w-[10%] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Timestamp
                    </th>
                    <th
                      scope="col"
                      className="w-[8%] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Info
                    </th>
                    <th
                      scope="col"
                      className="w-[10%] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="w-[15%] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Notas
                    </th>
                    <th
                      scope="col"
                      className="w-[5%] px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    ></th>
                  </tr>
                </thead>
                <tbody className="bg-card">
                  {scenes.map((scene) => (
                    <TableViewRow
                      key={scene.id}
                      scene={scene}
                      assetInput={assetInputs[scene.id] ?? { type: 'link', value: '' }}
                      onAssetInputChange={(field, value) =>
                        handleAssetFieldChange(scene.id, field, value)
                      }
                      onAddAsset={() => handleAddAsset(scene.id)}
                      isSavingAsset={savingAssetFor === scene.id}
                      onStatusChange={(status) => handleStatusChange(scene.id, status)}
                      onNotesChange={(value) => handleNotesChange(scene.id, value)}
                      onNotesBlur={(value) => handleNotesBlur(scene.id, value)}
                      onOpenBreakdown={() => handleOpenBreakdown(scene.id)}
                      setHoveredSceneId={setHoveredSceneId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
