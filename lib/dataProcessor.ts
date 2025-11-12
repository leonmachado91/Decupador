// Funções para processar os dados recebidos da Edge Function do Google Docs

import { Scene, Asset } from '@/lib/stores/documentStore'

/**
 * Extrai o ID do documento de uma URL do Google Docs
 * @param url URL do Google Docs
 * @returns ID do documento ou null se a URL for inválida
 */
export const extractDocId = (url: string): string | null => {
  try {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    return match ? match[1] : null
  } catch (error) {
    return null
  }
}

/**
 * Converte os comentários recebidos da API em cenas
 * @param comments Objeto contendo os comentários da API
 * @returns Array de cenas
 */
export const convertCommentsToScenes = (comments: any): Scene[] => {
  if (!comments) return []
  
  return Object.values(comments).map((comment: any, index) => {
    // Gerar um ID único para a cena
    const sceneId = `scene-${Date.now()}-${index}`
    
    return {
      id: sceneId,
      narrativeText: comment.quotedFileContent?.value || "",
      rawComment: comment.content || "",
      status: "Pendente",
      editorNotes: "",
      assets: []
    }
  })
}

/**
 * Cria um novo asset
 * @param type Tipo do asset
 * @param value Valor do asset
 * @param source Fonte do asset (opcional)
 * @returns Novo asset
 */
export const createAsset = (type: string, value: string, source?: string): Asset => {
  return {
    id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    value,
    source
  }
}

/**
 * Adiciona um asset a uma cena existente
 * @param scene Cena à qual adicionar o asset
 * @param asset Asset a ser adicionado
 * @returns Nova cena com o asset adicionado
 */
export const addAssetToScene = (scene: Scene, asset: Asset): Scene => {
  return {
    ...scene,
    assets: [...scene.assets, asset]
  }
}

/**
 * Cria uma nova cena duplicada com um asset diferente
 * @param scene Cena original
 * @param asset Novo asset
 * @returns Nova cena com o novo asset
 */
export const createSceneWithAsset = (scene: Scene, asset: Asset): Scene => {
  return {
    ...scene,
    id: `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    assets: [asset]
  }
}

/**
 * Processa os dados brutos do documento
 * @param rawData Dados brutos recebidos da Edge Function
 * @returns Dados processados
 */
export const processDocumentData = (rawData: any) => {
  if (!rawData) return null

  const processedData = {
    ...rawData,
    scenes: convertCommentsToScenes(rawData.comments)
  }

  return processedData
}

/**
 * Extrai texto formatado do corpo do documento
 * @param content Conteúdo do documento
 * @returns Texto formatado como string
 */
export const extractFormattedText = (content: any): string => {
  if (!content || !content.content) return ""
  
  let text = ""
  content.content.forEach((element: any) => {
    if (element.paragraph) {
      element.paragraph.elements?.forEach((el: any) => {
        if (el.textRun) {
          text += el.textRun.content || ""
        }
      })
      text += "\n"
    }
  })
  
  return text
}