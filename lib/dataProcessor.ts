// Funções para processar os dados recebidos da Edge Function do Google Docs

import { Scene, Asset } from '@/lib/stores/documentStore'
import type { GoogleDocComment, GoogleDocData, GoogleDocBody } from '@/lib/api/getGoogleDoc'

/**
 * Extrai o ID do documento de uma URL do Google Docs
 * @param url URL do Google Docs
 * @returns ID do documento ou null se a URL for inválida
 */
export const extractDocId = (url: string): string | null => {
  try {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Converte os comentários recebidos da API em cenas, ordenando-os pela sua posição no documento.
 * @param comments Objeto contendo os comentários da API.
 * @param body O corpo do documento do Google Docs.
 * @returns Array de cenas ordenadas.
 */
export const convertCommentsToScenes = (
  comments: Record<string, GoogleDocComment> | undefined,
  body: GoogleDocBody | undefined
): Scene[] => {
  if (!comments || !body) return []

  const documentText = extractFormattedText(body)
  if (!documentText) return []

  // Ordena os comentários com base na posição do seu texto citado no documento.
  const sortedComments = Object.values(comments).sort((a, b) => {
    const aText = decodeHtmlEntities(a.quotedFileContent?.value || '')
    const bText = decodeHtmlEntities(b.quotedFileContent?.value || '')
    
    const aIndex = documentText.indexOf(aText)
    const bIndex = documentText.indexOf(bText)

    // Comentários cujo texto não é encontrado são colocados no final.
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex
  })
  
  return sortedComments.map((comment, index) => {
    const sceneId = `scene-${Date.now()}-${index}`
    
    return {
      id: sceneId,
      position: index,
      narrativeText: decodeHtmlEntities(comment.quotedFileContent?.value || ""),
      rawComment: decodeHtmlEntities(comment.content || ""),
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
export const processDocumentData = (rawData: GoogleDocData | null) => {
  if (!rawData) return null

  const processedData = {
    ...rawData,
    scenes: convertCommentsToScenes(rawData.comments, rawData.body)
  }

  return processedData
}

/**
 * Extrai texto formatado do corpo do documento
 * @param content Conteúdo do documento
 * @returns Texto formatado como string
 */
export const extractFormattedText = (content: GoogleDocBody): string => {
  if (!content || !content.content) return ""
  
  let text = ""
  content.content.forEach((element) => {
    if (element.paragraph) {
      element.paragraph.elements?.forEach((el) => {
        if (el.textRun) {
          text += el.textRun.content || ""
        }
      })
      text += "\n"
    }
  })
  
  return decodeHtmlEntities(text)
}

export const decodeHtmlEntities = (input: string): string => {
  if (!input) return ""
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: "\u00A0",
  }
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_, entity: string) => {
    if (entity[0] === '#') {
      const isHex = entity[1] === 'x' || entity[1] === 'X'
      const code = isHex ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10)
      if (Number.isNaN(code)) return `&${entity};`
      try {
        return String.fromCodePoint(code)
      } catch {
        return `&${entity};`
      }
    }
        return named[entity] ?? `&${entity};`
      })
    }
    
    /**
     * Extrai links do YouTube de uma string de texto e os copia para a área de transferência.
     * @param content O texto do qual extrair os links.
     * @returns Uma promessa que resolve para `true` se os links foram copiados, `false` caso contrário.
     */
    export const extractAndCopyYouTubeLinks = async (content: string): Promise<boolean> => {
      if (!content) return false;
    
      // Regex para encontrar links do YouTube (padrões watch, embed, shorts e youtu.be)
      const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
      
      const matches = content.match(youtubeRegex);
    
      if (!matches || matches.length === 0) {
        return false; // Nenhum link encontrado
      }
    
      // Remove duplicatas e junta os links com uma nova linha
      const uniqueLinks = [...new Set(matches)];
      const linksText = uniqueLinks.join('\n');
    
      try {
        await navigator.clipboard.writeText(linksText);
        return true; // Copiado com sucesso
      } catch (err) {
        console.error('Falha ao copiar links para a área de transferência:', err);
        return false; // Falha ao copiar
      }
    };
    