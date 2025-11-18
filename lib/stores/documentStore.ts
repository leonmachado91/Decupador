import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Definição dos tipos para o estado da aplicação
export interface Asset {
  id: string
  type: string
  value: string
  source?: string
}

export interface Scene {
  id: string
  position: number
  narrativeText: string
  rawComment: string
  status: 'Pendente' | 'Concluído'
  editorNotes: string
  assets: Asset[]
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
  setDocId: (docId: string) => void
  setDocumentData: (data: GoogleDocData) => void
  setScenes: (scenes: Scene[]) => void
  clearDocumentData: () => void
  updateScene: (id: string, scene: Partial<Scene>) => void
  addAssetToScene: (sceneId: string, asset: Asset) => void
  sortCriteria: string | null
  setSortCriteria: (criteria: string | null) => void
}

// Criar o store com persistência no localStorage
export const useDocumentStore = create<DocumentState>()(
  persist(
    (set) => ({
      docId: null,
      documentData: null,
      scenes: [],
      setDocId: (docId) => set({ docId }),
      setDocumentData: (data) => set({ documentData: data }),
      setScenes: (scenes) => set({ scenes }),
      clearDocumentData: () => set({ docId: null, documentData: null, scenes: [] }),
      updateScene: (id, sceneUpdate) => set((state) => ({
        scenes: state.scenes.map((scene) => 
          scene.id === id ? { ...scene, ...sceneUpdate } : scene
        )
      })),
      addAssetToScene: (sceneId, asset) => set((state) => ({
        scenes: state.scenes.map((scene) => 
          scene.id === sceneId 
            ? { ...scene, assets: [...scene.assets, asset] } 
            : scene
        )
      })),
      sortCriteria: null,
      setSortCriteria: (criteria) => set({ sortCriteria: criteria })
    }),
    {
      name: 'document-storage', // Nome da chave no localStorage
      partialize: (state) => ({ 
        docId: state.docId, 
        scenes: state.scenes,
        documentData: state.documentData
      }), // Campos a serem persistidos
    }
  )
)