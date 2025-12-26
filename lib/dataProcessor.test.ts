import { describe, it, expect } from 'vitest'
import { extractDocId, decodeHtmlEntities, convertCommentsToScenes } from './dataProcessor'
import type { GoogleDocComment, GoogleDocBody } from './api/getGoogleDoc'

describe('dataProcessor', () => {
    describe('extractDocId', () => {
        it('should extract ID from standard Google Docs URL', () => {
            const url = 'https://docs.google.com/document/d/1234567890abcdef/edit'
            expect(extractDocId(url)).toBe('1234567890abcdef')
        })

        it('should return null for invalid URL', () => {
            const url = 'https://google.com'
            expect(extractDocId(url)).toBeNull()
        })
    })

    describe('decodeHtmlEntities', () => {
        it('should decode standard entities', () => {
            expect(decodeHtmlEntities('&lt;div&gt;')).toBe('<div>')
            expect(decodeHtmlEntities('Foo &amp; Bar')).toBe('Foo & Bar')
        })

        it('should decode hex entities', () => {
            expect(decodeHtmlEntities('&#x41;')).toBe('A')
        })
    })

    describe('convertCommentsToScenes', () => {
        it('should return empty array if no comments or body', () => {
            expect(convertCommentsToScenes(undefined, undefined)).toEqual([])
        })

        // Mock data for more complex test
        const mockBody: GoogleDocBody = {
            content: [
                {
                    paragraph: {
                        elements: [
                            { textRun: { content: 'Scene 1 text.\n' } },
                            { textRun: { content: 'Scene 2 text.\n' } }
                        ]
                    }
                }
            ]
        }

        const mockComments: Record<string, GoogleDocComment> = {
            'c1': {
                content: 'Comment 1',
                quotedFileContent: { value: 'Scene 1 text.' }
            } as GoogleDocComment,
            'c2': {
                content: 'Comment 2',
                quotedFileContent: { value: 'Scene 2 text.' }
            } as GoogleDocComment
        }

        it('should convert comments to scenes correctly', () => {
            const scenes = convertCommentsToScenes(mockComments, mockBody)
            expect(scenes).toHaveLength(2)
            expect(scenes[0].narrativeText).toContain('Scene 1 text')
            expect(scenes[1].narrativeText).toContain('Scene 2 text')
        })
    })
})
