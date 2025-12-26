import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AssetType = 'link' | 'image' | 'video' | 'audio' | 'timestamp' | 'document'
export type SortCriteria = 'narrativeText_asc' | 'narrativeText_desc' | 'rawComment_asc' | 'rawComment_desc'

export interface SceneAsset {
  id: string
  type: AssetType
  value: string
  source?: string
}

export interface Scene {
  id: string
  position: number
  narrativeText: string
  rawComment: string
  status: 'Pendente' | 'Concluido'
  editorNotes: string
  assets: SceneAsset[]
}

export interface GoogleDocData {
  title: string
  body: import('../api/getGoogleDoc').GoogleDocBody
  comments: Record<string, import('../api/getGoogleDoc').GoogleDocComment>
  documentId: string
  revisionId: string
}

interface DocumentState {
  docId: string | null
  documentData: GoogleDocData | null
  scenes: Scene[]
  hoveredSceneId: string | null
  setDocId: (docId: string) => void
  setDocumentData: (data: GoogleDocData) => void
  setScenes: (scenes: Scene[]) => void
  clearDocumentData: () => void
  updateScene: (id: string, scene: Partial<Scene>) => void
  addAssetToScene: (sceneId: string, asset: SceneAsset) => void
  sortCriteria: SortCriteria | null
  setSortCriteria: (criteria: SortCriteria | null) => void
  setHoveredSceneId: (sceneId: string | null) => void
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set) => ({
      docId: null,
      documentData: null,
      scenes: [],
      hoveredSceneId: null,
      setDocId: (docId) => set({ docId }),
      setDocumentData: (data) => set({ documentData: data }),
      setScenes: (scenes) => set({ scenes }),
      clearDocumentData: () => set({ docId: null, documentData: null, scenes: [] }),
      updateScene: (id, sceneUpdate) =>
        set((state) => ({
          scenes: state.scenes.map((scene) => (scene.id === id ? { ...scene, ...sceneUpdate } : scene)),
        })),
      addAssetToScene: (sceneId, asset) =>
        set((state) => ({
          scenes: state.scenes.map((scene) =>
            scene.id === sceneId ? { ...scene, assets: [...scene.assets, asset] } : scene
          ),
        })),
      sortCriteria: null,
      setSortCriteria: (criteria) => set({ sortCriteria: criteria }),
      setHoveredSceneId: (sceneId) => set({ hoveredSceneId: sceneId }),
    }),
    {
      name: 'document-storage',
      partialize: (state) => ({
        docId: state.docId,
        scenes: state.scenes,
        documentData: state.documentData,
        sortCriteria: state.sortCriteria,
        hoveredSceneId: state.hoveredSceneId,
      }),
    }
  )
)
