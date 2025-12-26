import { URL } from "url"

/**
 * Encurta uma URL para exibição, mostrando o domínio e o final do caminho.
 * Ex: "https://www.example.com/path/to/a/very/long/file.html"
 * se torna "example.com/.../file.html"
 * @param urlString A URL a ser encurtada.
 * @param maxLength Comprimento máximo opcional para a string final.
 * @returns A URL encurtada ou a original se ocorrer um erro ou for curta.
 */
export const shortenUrl = (urlString: string, maxLength: number = 40): string => {
  if (urlString.length <= maxLength) {
    return urlString
  }

  try {
    const url = new URL(urlString)
    const hostname = url.hostname.replace(/^www\./, "")
    const pathParts = url.pathname.split("/").filter((part) => part.length > 0)
    const endPath = pathParts.pop() || ""

    if (!endPath) {
      return hostname
    }

    const shortened = `${hostname}...${endPath}`

    if (shortened.length > maxLength) {
      const availableLength = maxLength - hostname.length - 3
      if (availableLength > 5) {
        const truncatedEndPath = endPath.slice(endPath.length - availableLength)
        return `${hostname}...${truncatedEndPath}`
      }
      return hostname
    }

    return shortened
  } catch {
    const start = urlString.slice(0, Math.floor(maxLength / 2) - 2)
    const end = urlString.slice(-Math.floor(maxLength / 2) + 2)
    return `${start}...${end}`
  }
}

/**
 * Retorna a URL de preview (thumbnail) para um dado link.
 * Atualmente suporta thumbnails do YouTube. Para outros links, retorna um placeholder.
 * @param url O link para o qual gerar o preview.
 * @returns A URL da imagem de preview.
 */
export const getLinkPreview = (url: string): string => {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i
  const match = url.match(youtubeRegex)

  if (match && match[1]) {
    const videoId = match[1]
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  }

  return "/placeholder.jpg"
}
