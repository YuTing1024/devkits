import { describe, it, expect } from 'vitest'
import { generateUuid } from './uuid-generator.js'

// UUID v4 regex: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
// UUID v7 regex: starts with timestamp bits, version = 7
const UUID_V7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('generateUuid', () => {
  it('generates a single v4 UUID by default', () => {
    const result = generateUuid()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toMatch(UUID_V4_REGEX)
    }
  })

  it('generates a single v4 UUID explicitly', () => {
    const result = generateUuid({ version: 'v4' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data[0]).toMatch(UUID_V4_REGEX)
    }
  })

  it('generates a single v7 UUID', () => {
    const result = generateUuid({ version: 'v7' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toMatch(UUID_V7_REGEX)
    }
  })

  it('generates multiple UUIDs', () => {
    const result = generateUuid({ count: 5 })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(5)
      result.data.forEach(uuid => expect(uuid).toMatch(UUID_V4_REGEX))
    }
  })

  it('generates 100 UUIDs (max count)', () => {
    const result = generateUuid({ count: 100 })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(100)
    }
  })

  it('all generated UUIDs are unique', () => {
    const result = generateUuid({ count: 50 })
    expect(result.ok).toBe(true)
    if (result.ok) {
      const unique = new Set(result.data)
      expect(unique.size).toBe(50)
    }
  })

  it('generates v7 UUIDs in monotonically increasing order (timestamp-based)', () => {
    const result = generateUuid({ version: 'v7', count: 10 })
    expect(result.ok).toBe(true)
    if (result.ok) {
      for (let i = 1; i < result.data.length; i++) {
        // v7 UUIDs should sort lexicographically in order of creation
        expect(result.data[i] >= result.data[i - 1]).toBe(true)
      }
    }
  })

  it('returns error when count exceeds 100', () => {
    const result = generateUuid({ count: 101 })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('100')
    }
  })

  it('returns error when count is 0', () => {
    const result = generateUuid({ count: 0 })
    expect(result.ok).toBe(false)
  })

  it('returns error when count is negative', () => {
    const result = generateUuid({ count: -1 })
    expect(result.ok).toBe(false)
  })

  it('returns error when count is not an integer', () => {
    const result = generateUuid({ count: 1.5 })
    expect(result.ok).toBe(false)
  })
})
