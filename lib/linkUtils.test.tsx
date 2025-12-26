import { describe, it, expect } from 'vitest'
import { linkify } from './linkUtils'
import { render } from '@testing-library/react'
import React from 'react'

describe('linkUtils', () => {
    describe('linkify', () => {
        it('should return text array if no links', () => {
            const text = 'Hello world'
            const result = linkify(text)
            expect(result).toEqual(['Hello world'])
        })

        it('should split text and links', () => {
            const text = 'Check https://google.com now'
            const result = linkify(text)
            expect(result).toHaveLength(3)
            expect(result[0]).toBe('Check ')
            // Middle element is a React component
            expect(result[2]).toBe(' now')
        })
    })
})
