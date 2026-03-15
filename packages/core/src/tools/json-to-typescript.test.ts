import { describe, it, expect } from 'vitest'
import { jsonToTypescript } from './json-to-typescript.js'

describe('jsonToTypescript', () => {
  it('generates interface for a flat object', () => {
    const result = jsonToTypescript('{"name":"Alice","age":30,"active":true}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('export interface Root')
      expect(result.data).toContain('name: string')
      expect(result.data).toContain('age: number')
      expect(result.data).toContain('active: boolean')
    }
  })

  it('uses custom rootName', () => {
    const result = jsonToTypescript('{"id":1}', { rootName: 'User' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('export interface User')
    }
  })

  it('generates type alias when useInterface is false', () => {
    const result = jsonToTypescript('{"id":1}', { useInterface: false })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('export type Root')
    }
  })

  it('handles null field as optional', () => {
    const result = jsonToTypescript('{"name":"Alice","bio":null}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('bio?: null')
    }
  })

  it('handles nested objects', () => {
    const result = jsonToTypescript('{"user":{"name":"Alice","age":30}}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('user: User')
      expect(result.data).toContain('export interface User')
      expect(result.data).toContain('name: string')
    }
  })

  it('handles arrays of primitives', () => {
    const result = jsonToTypescript('{"tags":["a","b","c"]}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('tags: string[]')
    }
  })

  it('handles arrays of objects', () => {
    const result = jsonToTypescript('{"items":[{"id":1,"name":"foo"}]}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('items: ItemsItem[]')
      expect(result.data).toContain('export interface ItemsItem')
    }
  })

  it('handles empty arrays', () => {
    const result = jsonToTypescript('{"data":[]}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('data: unknown[]')
    }
  })

  it('handles empty object', () => {
    const result = jsonToTypescript('{}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('export interface Root')
    }
  })

  it('returns error for empty input', () => {
    const result = jsonToTypescript('')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Input is empty')
    }
  })

  it('returns error for whitespace-only input', () => {
    const result = jsonToTypescript('   ')
    expect(result.ok).toBe(false)
  })

  it('returns error for invalid JSON', () => {
    const result = jsonToTypescript('{bad}')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Invalid JSON')
    }
  })

  it('handles mixed primitive array types', () => {
    const result = jsonToTypescript('{"mixed":[1,"two",true]}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      // Should contain a union type
      expect(result.data).toContain('mixed:')
    }
  })
})
