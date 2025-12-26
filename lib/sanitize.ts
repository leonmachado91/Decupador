import DOMPurify from 'dompurify'

/**
 * Sanitiza texto que possa conter HTML antes de renderizar.
 * Retorna string limpa para uso em linkify/decodificação.
 */
export function sanitizePlainText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}
