import { z } from 'zod'

export const docUrlSchema = z
  .string()
  .trim()
  .url()
  .regex(/docs\.google\.com\/document\/d\//, 'URL deve ser um documento do Google Docs')

export const timestampSchema = z
  .string()
  .trim()
  .regex(/^(\d{1,2}:){1,2}\d{2}$/, 'Timestamp deve estar no formato HH:MM ou HH:MM:SS')

export const noteSchema = z.string().trim().max(2000, 'Nota muito longa')

export const urlSchema = z
  .string()
  .trim()
  .url({ message: 'Informe uma URL valida' })
  .refine((value) => value.startsWith('http://') || value.startsWith('https://'), {
    message: 'URL deve comecar com http:// ou https://',
  })

export type DocUrl = z.infer<typeof docUrlSchema>
export type TimestampInput = z.infer<typeof timestampSchema>
